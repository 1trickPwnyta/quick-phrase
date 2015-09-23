{
	var medias = {};							// Holds loaded sound objects
	var medias2 = {};							// Holds duplicate sound objects
	var mediasAlternator = false;				// Determines which sound store to play from
	var pressTimer;								// A window.setTimeout timer for detecting long taps
	
	_UiUtil = {
		
		SOUND_NONE: "none",
		
		/**
		 * Plays a sound.
		 * @param soundFile the sound file to play.
		 */
		playSound: function(soundFile) {
			if (soundFile != this.SOUND_NONE) {
				if (_Environment.isPhonegap) {
					
					// Check if the sound is already loaded
					if (!medias[soundFile]) {
					
						// Load the sound to both stores
						medias[soundFile] = new Media(_Environment.getPhonegapPath() + soundFile);
						medias2[soundFile] = new Media(_Environment.getPhonegapPath() + soundFile);
						
					}
					
					// Play the sound from an alternating store
					if (mediasAlternator)
						medias[soundFile].play();
					else
						medias2[soundFile].play();
					mediasAlternator = !mediasAlternator;
					
				} else {
					new Audio(soundFile).play();
				}
			}
		},
		
		/**
		 * Vibrates the device.
		 * @param durationMs the number of milliseconds for the vibration to 
		 * last.
		 */
		vibrate: function(durationMs) {
			if (navigator.vibrate) {
				var vibrate = _Settings.current.get(_Settings.KEY_VIBRATE, DEFAULT_VIBRATE);
				if (vibrate) {
					navigator.vibrate(durationMs);
				}
			}
		},
		
		/**
		 * Turns allowance for the device to sleep on or off.
		 * @param allowSleep whether to allow the device to sleep.
		 */
		setAllowSleep: function(allowSleep) {
			if (_Environment.isPhonegap) {
				if (allowSleep) {
					window.plugins.insomnia.allowSleepAgain();
				} else {
					window.plugins.insomnia.keepAwake();
				}
			}
		},
		
		/**
		 * Changes the game's theme.
		 * @param themeStyleFile the CSS style file for the new theme.
		 */
		changeTheme: function(themeStyleFile) {
			var oldlink = document.getElementsByTagName("link").item(2);

			var newlink = document.createElement("link");
			newlink.setAttribute("rel", "stylesheet");
			newlink.setAttribute("type", "text/css");
			newlink.setAttribute("href", themeStyleFile);

			document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
		},
		
		/**
		 * Sets a function for the long-click event on a UI element.
		 * @param uiElement the UI element to set the event on.
		 * @param onlongclick the function to handle the event.
		 */
		setOnlongclick: function(uiElement, onlongclick) {
			var oldOnmouseup;
			if (uiElement.onmouseup) {
				oldOnmouseup = uiElement.onmouseup;
			}
			
			uiElement.onmouseup = function(e) {
				if (oldOnmouseup) {
					oldOnmouseup(e);
				}
				window.clearTimeout(pressTimer);
				return false;
			};
			
			var oldOnmousedown;
			if (uiElement.onmousedown) {
				oldOnmousedown = uiElement.onmousedown;
			}
			
			uiElement.onmousedown = function(e) {
				if (oldOnmousedown) {
					oldOnmousedown(e);
				}
				pressTimer = window.setTimeout(onlongclick, 1000);
				return false;
			};
		},
		
		/**
		 * Shows a standard dialog window with HTML content.
		 * @param htmlContent an HTML string to display in the window or a DOM 
		 * element.
		 * @param title the title to display at the top of the window.
		 * @param okButtonText an optional string to display on the OK/accept 
		 * button instead of "OK".
		 * @param hideCancel true to hide the cancel button.
		 * @param lineHeight an optional CSS line-height to use instead of 
		 * "100%".
		 * @param callback a function to call when the user dismisses the 
		 * window.
		 * @param closeFunction a function to call when the window is closing. 
		 * Return false to cancel closing.
		 */
		showStandardDialog: function(htmlContent, title, okButtonText, hideCancel, lineHeight, callback, closeFunction) {
			var form = document.createElement("form");
			form.className = "standardDialogForm";
			var div = document.createElement("div");
			div.className = "standardDialogDiv";
			if (lineHeight)
				div.style.lineHeight = lineHeight;
			var backDiv = document.createElement("div");
			backDiv.className = "standardDialogBackDiv";
			if (htmlContent instanceof HTMLElement) {
				div.appendChild(htmlContent);
			} else {
				var span = document.createElement("span");
				span.innerHTML = htmlContent;
				div.appendChild(span);
			}
			form.appendChild(div);
			form.appendChild(backDiv);
			form.style.height = "80vh";
			
			if (PHONEGAP) {
				// Workaround for lack of CSS "vh" support in Android 4.3-
				if (parseFloat(device.version) < 4.39) {
					var viewport = function() {
						var e = window, a = 'inner';
						if (!('innerWidth' in window )) {
							a = 'client';
							e = document.documentElement || document.body;
						}
						return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
					}
					var vh = (viewport().height/100);
					form.style.height = vh*80 + 'px';
				}
			}
			
			dialog.custom(form, function(form) {
				if (callback)
					callback(form !== false);
			}, title? title: "", okButtonText? okButtonText: "OK", hideCancel === true, function(response) {
				this.playSound(CLICK_SOUND_FILE);
				if (closeFunction)
					return closeFunction(response);
			});
		}
			
	};
}
