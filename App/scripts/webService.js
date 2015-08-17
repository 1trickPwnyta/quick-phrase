//
// Loads new tags from the web service.
//
function loadTagsFromWebService(callback) {
	// Call the web service for tags
	ajax("GET", WEB_SERVICE_URL + "/getTags.php", [
		{name: "numberOfTags", value: TAG_LOAD_QUANTITY},
		{name: "categoryIds", value: JSON.stringify(sCategoryIds)},
		{name: "difficultyId", value: sDifficulty},
		{name: "maxCharacters", value: sMaxCharactersPerTag},
		{name: "maxWords", value: sMaxWordsPerTag},
		{name: "edgy", value: (sEdgy && !APP_GOOGLEPLAY_EDITION? 1: 0)}
	], function(response) {
		
		// Check if the web service returns a valid response
		if (response) {
			
			// Get the new tags from the web service response, add them to the list
			var newTags = JSON.parse(response);
			for (var i = 0; i < newTags.length; i++)
				tags.push(newTags[i]);
			
			// Check if there are any tags loaded now, otherwise return failure
			if (tags.length == 0) {
				if (callback)
					callback(false);
				return;
			}
			
			// Store the new tags in the local database
			saveTagsInLocalDatabase(newTags);
			
			// Return success
			if (callback)
				callback(true);
			
		} else {
			// The web service call failed (timed out), so return failure
			if (callback)
				callback(false);
		}
	}, WEB_SERVICE_TIMEOUT);
}

//
// Loads difficulty settings from the web service.
//
function loadDifficultiesFromWebService(callback) {
	// Make a web service call
	ajax("GET", WEB_SERVICE_URL + "/getDifficulties.php", [], function(response) {
		if (response) {
		
			// Parse the difficulties from the web service response
			difficulties = JSON.parse(response);
			
			// If no difficulties were loaded, return failure
			if (difficulties.length == 0) {
				if (callback)
					callback(false);
				return;
			}
			
			if (PHONEGAP) {
				// Store the difficulties in the local database
				db.transaction(function(tx) {
					// First, remove all existing difficulties
					tx.executeSql("DELETE FROM difficulty_level WHERE 1=1");
					// Build a query to insert all difficulties
					var query = "INSERT INTO difficulty_level (id, name, max_rating) VALUES ";
					for (var i = 1; i < difficulties.length; i++) {
						query += "(" + difficulties[i].id + ", '" + difficulties[i].name + "', " + difficulties[i].max_rating + ")";
						if (i < difficulties.length - 1)
							query += ", ";
					}
					tx.executeSql(query);
				});
			}
			
			// Return success
			if (callback)
				callback(true);
			
		} else {
			// The web service call failed (timed out)
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
	ajax("GET", WEB_SERVICE_URL + "/getCategories.php", [], function(response) {
		if (response) {
		
			// Parse the category data from the web service response
			categories = JSON.parse(response);
			
			// If no categories were loaded, return failure
			if (categories.length == 0) {
				if (callback)
					callback(false);
				return;
			}
			
			if (PHONEGAP) {
				// Store categories in the local database
				db.transaction(function(tx) {
					// First, delete all current categories from the database
					tx.executeSql("DELETE FROM category WHERE 1=1");
					// Create a query to insert all the categories into the database
					var query = "INSERT INTO category (id, name) VALUES ";
					for (var i = 1; i < categories.length; i++) {
						query += "(" + categories[i].id + ", '" + categories[i].name.replace("'", "''") + "')";
						if (i < categories.length - 1)
							query += ", ";
					}
					tx.executeSql(query);
				});
			}
			
			// Return success
			if (callback)
				callback(true);
			
		}
		else {
			// The web service call failed (timed out)
			if (callback)
				callback(false);
		}
	}, WEB_SERVICE_TIMEOUT);
}

//
// Loads tag stats from the web service.
//
function loadStatsFromWebService(callback) {
	// Call the web service for stats
	ajax("GET", WEB_SERVICE_URL + "/getStats.php", [], function(response) {
		// Check if the web service returns a valid response
		if (response) {
			
			// Get the stats from the web service response
			stats = JSON.parse(response);
			
			// Return success
			if (callback)
				callback(true);
			
		} else {
			// The web service call failed (timed out), so return failure
			if (callback)
				callback(false);
		}
	}, WEB_SERVICE_TIMEOUT);
}

function flagTag(tag, reason, callback) {
	// Call the web service to flag the tag
	ajax("POST", WEB_SERVICE_URL + "/flagTag.php", [
		{name: "id", value: tag.id},
		{name: "reason", value: reason}
	], function(response, status) {
		// Check if the web service returns a valid response
		if (status == 200) {
		
			// Return success
			if (callback)
				callback(true);
			
		} else {
			// The web service call failed (timed out), so return failure
			if (callback)
				callback(false);
		}
	}, WEB_SERVICE_TIMEOUT);
}

function submitUsageClick(location) {
	// Call the web service to submit the click
	ajax("GET", WEB_SERVICE_URL + "/usage/clicks.php", [
		{name: "location", value: location}
	], function(response, status) {
		// Ignore the response
	}, WEB_SERVICE_TIMEOUT);
}
