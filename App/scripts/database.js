//
// Loads new tags from the local database.
//
function loadTagsFromLocalDatabase(callback) {
	// In this case, there was no response from the web service
	if (PHONEGAP) {
	
		// Load tags from the local database
		db.transaction(function(tx) {
			// Make a query to get the tags based on settings
			var query = "SELECT * FROM tag ";
			query += "WHERE category_id IN (";
			if (sCategoryIds.length > 0) {
				for (var i = 0; i < sCategoryIds.length; i++)
					query += sCategoryIds[i] + ", ";
				query += "-1) ";
			} else
				query += "category_id) ";
			query += "AND difficulty_rating <= (SELECT max_rating FROM difficulty_level WHERE id = " + sDifficulty + ") ";
			if (sMaxCharactersPerTag > 0)
				query += "AND LENGTH(tag) <= " + sMaxCharactersPerTag + " ";
			if (sMaxWordsPerTag > 0)
				query += "AND LENGTH(tag) - LENGTH(REPLACE(tag, ' ', '')) <= " + sMaxWordsPerTag + " - 1 ";
			if (!sEdgy)
				query += "AND edgy = 0 ";
			query += "ORDER BY RANDOM()";
			query += "LIMIT " + TAG_LOAD_QUANTITY + " ";
			
			tx.executeSql(query, [], function(tx, res) {
				// Add the resulting tags to the list
				for (var i = 0; i < res.rows.length; i++) {
					var tag = res.rows.item(i);
					tag.text = tag.tag;
					tags.push(tag);
				}
				
				if (callback)
					callback();
			});
		});
		
	} else {
		// If not in PhoneGap, there is no local database
		if (callback)
			callback();
	}
}

//
// Saves tags in the local database for later.
//
function saveTagsInLocalDatabase(newTags) {
	// This only works if we're in PhoneGap
	if (PHONEGAP) {
	
		db.transaction(function(tx) {
			// Make a query to store them
			var query = "INSERT INTO tag (id, category_id, tag, difficulty_rating, edgy) VALUES ";
			for (var i = 0; i < newTags.length; i++) {
				query += "(" + newTags[i].id + ", " + newTags[i].category_id + ", '" + newTags[i].text.replace("'", "''") + "', " + newTags[i].difficulty_rating + ", " + newTags[i].edgy + ")";
				if (i < newTags.length - 1)
					query += ", ";
			}
			tx.executeSql(query);
			
			// If we have too many local tags, delete about half of them, randomly
			tx.executeSql("SELECT COUNT(*) AS c FROM tag", [], function(tx, res) {
				if (res.rows.item(0).c > MAX_LOCAL_TAGS) {
					tx.executeSql("DELETE FROM tag WHERE (RANDOM() % 2) = 0");
				}
			});
		});
		
	}
}

//
// Loads difficulty settings from the local database.
//
function loadDifficultiesFromLocalDatabase(callback) {
	if (PHONEGAP) {
		// Load difficulties from the local database
		difficulties = new Array("");	// First element should be nothing
		db.transaction(function(tx) {
			var query = "SELECT name FROM difficulty_level ORDER BY id";
			tx.executeSql(query, [], function(tx, res) {
				for (var i = 0; i < res.rows.length; i++) {
					var difficulty = res.rows.item(i);
					difficulties.push(difficulty);
				}
				
				if (callback)
					callback();
			});
		});
	} else {
		// If we're not in PhoneGap, there is no local database
		if (callback)
			callback();
	}
}

//
// Load categories from the local database.
//
function loadCategoriesFromLocalDatabase(callback) {
	if (PHONEGAP) {
		// First element should be nothing
		categories = new Array("");
		
		db.transaction(function(tx) {
			// Get categories from the database and put them into the category list
			var query = "SELECT name FROM category ORDER BY name";
			tx.executeSql(query, [], function(tx, res) {
				for (var i = 0; i < res.rows.length; i++) {
					var category = res.rows.item(i);
					categories.push(category);
				}
				
				if (callback)
					callback();
			});
		});
	} else {
		// If we're not in PhoneGap, there is no local database
		if (callback)
			callback();
	}
}

//
// Loads user settings from the local database.
//
function loadSettings(callback) {
	if (PHONEGAP) {
		// Load any stored user settings, and indicate how many settings have been accounted for so we know when done
		db.transaction(function(tx) {
			tx.executeSql("CREATE TABLE IF NOT EXISTS settings (id integer primary key autoincrement, name text, value text)");
			getSetting(tx, "sMinTimePerStage", sMinTimePerStage, function(value) {
				sMinTimePerStage = parseInt(value);
				settingsLoaded++;
			});
			getSetting(tx, "sMaxTimePerStage", sMaxTimePerStage, function(value) {
				sMaxTimePerStage = parseInt(value);
				settingsLoaded++;
			});
			getSetting(tx, "sNumberOfTeams", sNumberOfTeams, function(value) {
				sNumberOfTeams = parseInt(value);
				settingsLoaded++;
			});
			getSetting(tx, "sWinningPoint", sWinningPoint, function(value) {
				sWinningPoint = parseInt(value);
				settingsLoaded++;
			});
			getSetting(tx, "sBeepSoundFile", sBeepSoundFile, function(value) {
				sBeepSoundFile = value;
				settingsLoaded++;
			});
			getSetting(tx, "sDifficulty", sDifficulty, function(value) {
				sDifficulty = parseInt(value);
				settingsLoaded++;
			});
			getSetting(tx, "sMaxWordsPerTag", sMaxWordsPerTag, function(value) {
				sMaxWordsPerTag = parseInt(value);
				settingsLoaded++;
			});
			getSetting(tx, "sMaxCharactersPerTag", sMaxCharactersPerTag, function(value) {
				sMaxCharactersPerTag = parseInt(value);
				settingsLoaded++;
			});
			getSetting(tx, "sCategoryIds", JSON.stringify(sCategoryIds), function(value) {
				sCategoryIds = JSON.parse(value);
				settingsLoaded++;
			});
			getSetting(tx, "sStyleSheet", sStyleSheet, function(value) {
				sStyleSheet = value;
				settingsLoaded++;
			});
			getSetting(tx, "sVibrate", JSON.stringify(sVibrate), function(value) {
				sVibrate = JSON.parse(value);
				settingsLoaded++;
			});
			getSetting(tx, "sShowCategory", JSON.stringify(sShowCategory), function(value) {
				sShowCategory = JSON.parse(value);
				settingsLoaded++;
			});
			getSetting(tx, "sShowAuthor", JSON.stringify(sShowAuthor), function(value) {
				sShowAuthor = JSON.parse(value);
				settingsLoaded++;
			});
			getSetting(tx, "sEdgy", JSON.stringify(sEdgy), function(value) {
				sEdgy = JSON.parse(value);
				settingsLoaded++;
			});
			getSetting(tx, "sTeamNames", JSON.stringify(sTeamNames), function(value) {
				sTeamNames = JSON.parse(value);
				settingsLoaded++;
			});
			
			// Wait until all settings have been accounted for before calling the callback
			if (callback)
				settingsLoadWaitInterval = window.setInterval(function() {
					if (settingsLoaded == settingsCount) {
						window.clearInterval(settingsLoadWaitInterval);
						callback();
					}
				}, 100);
		});
	} else {
		// If we're not in PhoneGap, there is no local database, so pretend we're done loading
		settingsLoaded = settingsCount;
		if (callback)
			callback();
	}
}

//
// Retrieves the value of a user setting from the local database and passes it to the callback.
//
function getSetting(tx, name, defaultValue, callback) {
	tx.executeSql("SELECT value FROM settings WHERE name = '" + name + "'", [], function(tx, res) {
		if (callback) {
			if (res.rows.length > 0) {
				callback(res.rows.item(0).value);
			} else {
				// No value returned, so return the default
				callback(defaultValue);
			}
		}
	});
}

//
// Stores a user setting in the local database.
//
function setSetting(tx, name, value) {
	tx.executeSql("DELETE FROM settings WHERE name = '" + name + "'");
	tx.executeSql("INSERT INTO settings (name, value) VALUES ('" + name + "', '" + value + "')");
}
