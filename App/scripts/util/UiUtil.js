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
		}
			
	};
}
