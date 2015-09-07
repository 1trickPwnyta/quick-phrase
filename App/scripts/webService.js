//
// Loads new phrases from the web service.
//
function loadTagsFromWebService(callback) {
	// Call the web service for phrases
	ajax("GET", WEB_SERVICE_URL + "/getPhrases.php", [
		{name: "numberOfPhrases", value: TAG_LOAD_QUANTITY},
		{name: "categoryIds", value: JSON.stringify(sCategoryIds)},
		{name: "difficultyId", value: sDifficulty},
		{name: "maxCharacters", value: sMaxCharactersPerTag},
		{name: "maxWords", value: sMaxWordsPerTag},
		{name: "edgy", value: (sEdgy && !APP_GOOGLEPLAY_EDITION? 1: 0)}
	], function(response, status) {
		
		// Check if the web service returns a valid response
		if (status == 200) {
			
			// Get the new phrases from the web service response, add them to the list
			var newTags = JSON.parse(response);
			
			// Remove previously used or duplicate phrases
			processPhraseLoad(newTags);
			
			// Inject custom phrases
			countTagsInWebService(function(phrasesAvailable) {
				injectCustomPhrases(newTags, phrasesAvailable, function() {
					for (var i = 0; i < newTags.length; i++)
						tags.push(newTags[i]);
					
					// Check if there are any phrases loaded now, otherwise return failure
					if (tags.length == 0) {
						if (callback)
							callback(false);
						return;
					}
					
					// Store the new phrases in the local database
					saveTagsInLocalDatabase(newTags);
					
					// Return success
					if (callback)
						callback(true);
				});
			});
		} else if (status < 0) {
			// The web service call failed, so return failure
			if (callback)
				callback(false);
		} else {
			// The web service call timed out, so return failure
			if (callback)
				callback(false);
		}
	}, WEB_SERVICE_TIMEOUT);
}

//
// Counts the number of phrases at the web service that meet the current settings criteria.
//
function countTagsInWebService(callback) {
	// Call the web service for phrase count
	ajax("GET", WEB_SERVICE_URL + "/getPhraseCount.php", [
		{name: "categoryIds", value: JSON.stringify(sCategoryIds)},
		{name: "difficultyId", value: sDifficulty},
		{name: "maxCharacters", value: sMaxCharactersPerTag},
		{name: "maxWords", value: sMaxWordsPerTag},
		{name: "edgy", value: (sEdgy && !APP_GOOGLEPLAY_EDITION? 1: 0)}
	], function(response, status) {
		// Check if the web service returns a valid response
		if (status == 200) {
			// Get the phrase count from the web service response
			var count = parseInt(response);
			callback(count);
		} else if (status < 0) {
			// The web service call failed, so return a default count
			callback(TAG_LOAD_QUANTITY*100);
		} else {
			// The web service call timed out, so return a default count
			callback(TAG_LOAD_QUANTITY*100);
		}
	}, WEB_SERVICE_TIMEOUT);
}

//
// Loads difficulty settings from the web service.
//
function loadDifficultiesFromWebService(callback) {
	// Make a web service call
	ajax("GET", WEB_SERVICE_URL + "/getDifficulties.php", [], function(response, status) {
		if (status == 200) {
		
			// Parse the difficulties from the web service response
			difficulties = JSON.parse(response);
			
			// If no difficulties were loaded, return failure
			if (difficulties.length == 0) {
				if (callback)
					callback(false);
				return;
			}
			
			saveDifficultiesInLocalDatabase(difficulties);
			
			// Return success
			if (callback)
				callback(true);
			
		} else if (status < 0) {
			// The web service call failed
			if (callback)
				callback(false);
		} else {
			// The web service call timed out
			if (callback)
				callback(false);
		}
	}, WEB_SERVICE_TIMEOUT);
}

//
// Load categories from the web service.
//
function loadCategoriesFromWebService(callback) {
	// Call the web service
	ajax("GET", WEB_SERVICE_URL + "/getCategories.php", [], function(response, status) {
		if (status == 200) {
		
			// Parse the category data from the web service response
			categories = JSON.parse(response);
			
			// If no categories were loaded, return failure
			if (categories.length == 0) {
				if (callback)
					callback(false);
				return;
			}
			
			saveCategoriesInLocalDatabase(categories);
			
			// Return success
			if (callback)
				callback(true);
			
		}
		else if (status < 0) {
			// The web service call failed
			if (callback)
				callback(false);
		} else {
			// The web service call timed out
			if (callback)
				callback(false);
		}
	}, WEB_SERVICE_TIMEOUT);
}

//
// Loads new phrase stats from the web service.
//
function loadStatsFromWebService(callback) {
	// Call the web service for stats
	ajax("GET", WEB_SERVICE_URL + "/getStats.php", [], function(response, status) {
		// Check if the web service returns a valid response
		if (status == 200) {
			
			// Get the stats from the web service response
			stats = JSON.parse(response);
			
			// Return success
			if (callback)
				callback(true);
			
		} else if (status < 0) {
			// The web service call failed, so return failure
			if (callback)
				callback(false);
		} else {
			// The web service call timed out, so return failure
			if (callback)
				callback(false);
		}
	}, WEB_SERVICE_TIMEOUT);
}

//
// Reports a phrase to the admin for evaluation.
//
function flagTag(tag, reason, callback) {
	// Call the web service to flag the phrase
	ajax("POST", WEB_SERVICE_URL + "/flagPhrase.php", [
		{name: "id", value: tag.id},
		{name: "reason", value: reason}
	], function(response, status) {
		// Check if the web service returns a valid response
		if (status == 200) {
		
			// Return success
			if (callback)
				callback(true);
			
		} else if (status < 0) {
			// The web service call failed, so return failure
			if (callback)
				callback(false);
		} else {
			// The web service call timed out, so return failure
			if (callback)
				callback(false);
		}
	}, WEB_SERVICE_TIMEOUT);
}

//
// Submits usage data about a location that was clicked or an event that occurred.
//
function submitUsageClick(location) {
	if (!sDeveloperMode) {
		// Call the web service to submit the click
		ajax("POST", WEB_SERVICE_URL + "/usage/clicks.php", [
			{name: "location", value: location}
		], function(response, status) {
			// Ignore the response
		}, WEB_SERVICE_TIMEOUT);
	}
}

//
// Submits usage data about what settings values are in play.
//
function submitSettings() {
	if (!sDeveloperMode) {
		// Call the web service to submit the settings
		ajax("POST", WEB_SERVICE_URL + "/usage/settings.php", [
			{name: "categories", value: JSON.stringify(sCategoryIds)},
			{name: "difficulty", value: sDifficulty},
			{name: "maxWordsPerTag", value: sMaxWordsPerTag},
			{name: "maxCharactersPerTag", value: sMaxCharactersPerTag},
			{name: "edgy", value: sEdgy? 1: 0},
			{name: "showCategory", value: sShowCategory? 1: 0},
			{name: "showSubmittedBy", value: sShowAuthor? 1: 0},
			{name: "pointsToWin", value: sWinningPoint},
			{name: "numberOfTeams", value: sNumberOfTeams},
			{name: "minRoundSeconds", value: Math.round(sMinTimePerStage*3/1000)},
			{name: "maxRoundSeconds", value: Math.round(sMaxTimePerStage*3/1000)},
			{name: "timerTick", value: sBeepSoundFile},
			{name: "theme", value: sStyleSheet},
			{name: "vibrate", value: sVibrate? 1: 0}
		], function(response, status) {
			// Ignore the response
		}, WEB_SERVICE_TIMEOUT);
	}
}

