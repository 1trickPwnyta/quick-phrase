{
	_Settings = {
		KEY_MIN_SECONDS_PER_STAGE: "sMinTimePerStage",				// Minimum seconds for each time stage
		KEY_MAX_SECONDS_PER_STAGE: "sMaxTimePerStage",				// Maximum seconds for each time stage
		KEY_NUMBER_OF_TEAMS: "sNumberOfTeams",						// Number of teams playing the game
		KEY_WINNING_POINT: "sWinningPoint",							// Points to win, or to be eliminated in 3+ team play
		KEY_BEEP_SOUND_FILE: "sBeepSoundFile",						// Sound file to play when the timer ticks
		KEY_DIFFICULTY_ID: "sDifficulty",							// Phrase difficulty setting
		KEY_MAX_WORDS_PER_PHRASE: "sMaxWordsPerTag",				// Maximum words per phrase
		KEY_MAX_CHARACTERS_PER_PHRASE: "sMaxCharactersPerTag",		// Maximum characters per phrase
		KEY_CATEGORY_IDS: "sCategoryIds",							// Selected phrase categories
		KEY_CUSTOM_CATEGORY_IDS: "sCustomCategoryIds",				// Selected custom categories
		KEY_THEME_STYLE_FILE: "sStyleSheet",						// Path to style sheet used by theme
		KEY_VIBRATE: "sVibrate",									// Turns vibration on
		KEY_ADULT: "sEdgy",											// Allows adult-only phrases
		KEY_TEAM_NAMES: "sTeamNames",								// Team names
		KEY_SHOW_CATEGORY: "sShowCategory",							// Whether to show phrase categories in-game
		KEY_DEVELOPER_MODE: "sDeveloperMode",						// Whether to enable developer mode (no usage reporting)
		KEY_DATA_VERSION: "sDataVersion",							// The app version of the stored data
		KEY_PROMPT_FOR_RATING: "sPromptForRating",					// Whether to prompt the user to rate the app
		KEY_GAMES_SINCE_RATING_PROMPT: "sGamesSinceRatingPrompt",	// Number of games completed since the last app rating prompt
		
		current: new Settings()
	};
}

function Settings() {
	
	var settings = [];
	
	/**
	 * Gets the value of a setting.
	 * @param key the key used to identify the setting.
	 * @param defaultValue a default value to return if no value is found for 
	 * the specified key.
	 * @return the value of the setting, or defaultValue if no value is found, 
	 * or null if no value is found and no defaultValue was provided.
	 */
	this.get = function(key, defaultValue) {
		var setting = settings[key];
		if (setting === null || setting === undefined) {
			if (defaultValue !== undefined) {
				setting = defaultValue;
			} else {
				setting = null;
			}
		}
		return setting;
	};
	
	/**
	 * @return an associative array that represents all settings.
	 */
	this.getAll = function() {
		return settings;
	};
	
	/**
	 * Sets the value of a setting.
	 * @param key the key used to identify the setting.
	 * @param value the value to set the setting to.
	 */
	this.set = function(key, value) {
		settings[key] = value;
	};
	
	/**
	 * Removes the value of a setting.
	 * @param key the key used to identify the setting.
	 */
	this.unset = function(key) {
		settings[key] = undefined;
	};
	
	/**
	 * Loads the settings from the local database.
	 * @param localDatabase the local database to load settings from.
	 * @param callback a function to call when the settings are loaded.
	 */
	this.loadAsync = function(localDatabase, callback) {
		localDatabase.readSettingsAsync(function(settingsFromDatabase) {
			settings = settingsFromDatabase;
			if (callback) {
				callback();
			}
		});
	};
	
	/**
	 * Saves the settings to the local database.
	 * @param localDatabase the local database to save settings to.
	 * @param callback a function to call when the settings are saved.
	 */
	this.saveAsync = function(localDatabase, callback) {
		localDatabase.replaceSettingsAsync(settings, callback);
	};
	
}
