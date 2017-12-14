window.onload = function() {
	if (PHONEGAP) {
		// Set the deviceready callback
		document.addEventListener("deviceready", onDeviceReady, false);
	} else
		// Just call the deviceready callback directly
		onDeviceReady();
};

function onDeviceReady() {
	// Hide the splash screen and load the main screen after half a second
	window.setTimeout(function() {
		document.getElementById("splashscreen").className = "hidden";
	}, 500);
	
	// Add long-click to about button in the menu to turn on developer mode
	var aboutItem = document.getElementById("menuItemAbout");
	aboutItem.ontouchend = function() {
		// Cancel the long press
		window.clearTimeout(pressTimer);
		if (!aboutItem.longclick) {
			aboutItem.onclick();
		}
		aboutItem.longclick = false;
		return false;
	};
	(function(aboutItem) {
		aboutItem.ontouchstart = function() {
			// Wait for a long press
			pressTimer = window.setTimeout(function() {
				aboutItem.longclick = true;
				menuItemAboutLongClick();
			}, 1000);
		};
	})(aboutItem);
	
	if (PHONEGAP) {
		// Set the Android back button action
		document.addEventListener("backbutton", backButtonClick, false);
		
		// Hide the edgy option in the Google Play edition
		if (APP_GOOGLEPLAY_EDITION) {
			var menuItemEdgy = document.getElementById("menuItemEdgy");
			menuItemEdgy.parentNode.removeChild(menuItemEdgy);
		}
		
		// Workaround for lack of CSS "vw" support in Android 4.3-
		if (parseFloat(device.version) < 4.39) {
			var viewport = function() {
				var e = window, a = 'inner';
				if (!('innerWidth' in window )) {
					a = 'client';
					e = document.documentElement || document.body;
				}
				return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
			}
			var vw = (viewport().width/100);
			document.body.style.fontSize = vw*5 + 'px';
		}
	}
	
	initializeLocalDatabase();
	
	// Load all the game data
	showLoadingScreen();
	loadStatsFromWebService();
	loadSettings(function() {
		var finishOpening = function() {
			submitUsageClick("/app/" + APP_VERSION + "/open");
			
			// Set the pause and resume callbacks
			document.addEventListener("pause", function() {
				submitUsageClick("/app/" + APP_VERSION + "/pause");
			}, false);
			document.addEventListener("resume", function() {
				submitUsageClick("/app/" + APP_VERSION + "/resume");
			}, false);
			
			postSettingsLoad();
		};
		
		// Send fresh install click if this is a fresh install
		// or upgrade click if this is an upgrade
		if (!sDataVersion) {
			submitUsageClick("/app/" + APP_VERSION + "/freshInstall");
			changeDataVersion(APP_VERSION);
			
			// For fresh installs, load starter tags into the database
			saveDifficultiesInLocalDatabase(starterDifficulties, function() {
				saveCategoriesInLocalDatabase(starterCategories, function() {
					saveTagsInLocalDatabase(starterPhrases, finishOpening);
				});
			});
		} else if (sDataVersion != APP_VERSION) {
			submitUsageClick("/app/" + APP_VERSION + "/upgrade");
			if (parseInt(sDataVersion.split(".")[0]) < 2) {
				upgradeDatabaseToVersion2();
			}
			if (APP_VERSION == "2.0.2") {
				changeStyleSheet(DEFAULT_STYLE_SHEET);
				applyTheme();
			}
			changeDataVersion(APP_VERSION);
			finishOpening();
		} else {
			finishOpening();
		}
	});
}

function postSettingsLoad() {
	applyTheme();
	testWebServiceResponseTime();
	loadCategories();
	loadDifficulties();
	loadTags(true, showReadyScreen);
	resetScores();
	loadScores();
}
