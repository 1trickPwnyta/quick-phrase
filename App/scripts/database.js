//
// Initializes the local database.
//
function initializeLocalDatabase() {
	if (PHONEGAP) {
		db = window.sqlitePlugin.openDatabase({name: DB_NAME});
	} else {
		db = openDatabase(APP_NAME, "", APP_NAME, 10 * 1024 * 1024);
	}
	
	db.transaction(function(tx) {
		tx.executeSql("CREATE TABLE IF NOT EXISTS tag (id integer, category_id integer, tag text, difficulty_rating integer, edgy integer)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS custom_phrase (category_id integer, is_custom_category integer, tag text)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS difficulty_level (id integer, name text, max_rating integer)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS category (id integer, name text)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS custom_category (name text)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS settings (id integer primary key autoincrement, name text, value text)");
	});
}

//
// Loads new phrases from the local database.
//
function loadTagsFromLocalDatabase(callback) {
	db.transaction(function(tx) {
		// Make a query to get the phrases based on settings
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
			// Add the resulting phrases to the list
			var newTags = new Array();
			for (var i = 0; i < res.rows.length; i++) {
				var tag = res.rows.item(i);
				tag.text = tag.tag;
				newTags.push(tag);
			}
			
			processPhraseLoad(newTags);
			for (var i = 0; i < newTags.length; i++)
				tags.push(newTags[i]);
			
			if (callback)
				callback();
		});
	});
}

//
// Saves phrases in the local database for later.
//
function saveTagsInLocalDatabase(newTags) {
	db.transaction(function(tx) {
		// Make a query to store them
		var query = "INSERT INTO tag (id, category_id, tag, difficulty_rating, edgy) VALUES ";
		for (var i = 0; i < newTags.length; i++) {
			query += "(" + newTags[i].id + ", " + newTags[i].category_id + ", '" + newTags[i].text.replace("'", "''") + "', " + newTags[i].difficulty_rating + ", " + newTags[i].edgy + ")";
			if (i < newTags.length - 1)
				query += ", ";
		}
		tx.executeSql(query);
		
		// If we have too many local phrases, delete about half of them, randomly
		tx.executeSql("SELECT COUNT(*) AS c FROM tag", [], function(tx, res) {
			if (res.rows.item(0).c > MAX_LOCAL_TAGS) {
				tx.executeSql("DELETE FROM tag WHERE (RANDOM() % 2) = 0");
			}
		});
	});
}

//
// Deletes a phrase from the local database.
//
function deleteTagFromLocalDatabase(id) {
	db.transaction(function(tx) {
		// Make a query to delete it
		var query = "DELETE FROM tag WHERE id = " + id;
		tx.executeSql(query);
	});
}

//
// Loads custom phrases from the local database.
//
function loadCustomPhrasesFromLocalDatabase(callback) {
	db.transaction(function(tx) {
		// Make a query to get the phrases based on settings
		var query = "SELECT * FROM custom_phrase ";
		query += "WHERE ((is_custom_category = 0 AND category_id IN (";
		if (sCategoryIds.length > 0) {
			for (var i = 0; i < sCategoryIds.length; i++)
				query += sCategoryIds[i] + ", ";
			query += "-1)";
		} else
			query += "category_id)";
		query += ") ";
		query += "OR (is_custom_category > 0 AND category_id IN (";
		if (sCustomCategoryIds.length > 0) {
			for (var i = 0; i < sCustomCategoryIds.length; i++)
				query += sCustomCategoryIds[i] + ", ";
			query += "-1)";
		} else
			query += "custom_category_id)";
		query += ")) ";
		if (sMaxCharactersPerTag > 0)
			query += "AND LENGTH(tag) <= " + sMaxCharactersPerTag + " ";
		if (sMaxWordsPerTag > 0)
			query += "AND LENGTH(tag) - LENGTH(REPLACE(tag, ' ', '')) <= " + sMaxWordsPerTag + " - 1 ";
		query += "ORDER BY RANDOM()";
		query += "LIMIT " + TAG_LOAD_QUANTITY + " ";
		
		tx.executeSql(query, [], function(tx, res) {
			// Add the resulting phrases to the list
			var newTags = new Array();
			for (var i = 0; i < res.rows.length; i++) {
				var tag = res.rows.item(i);
				tag.text = tag.tag;
				newTags.push(tag);
			}
			
			processPhraseLoad(newTags);
			for (var i = 0; i < newTags.length; i++)
				tags.push(newTags[i]);
			
			if (callback)
				callback();
		});
	});
}

//
// Loads all custom phrases from the local database for a category.
//
function loadAllCustomPhrasesFromLocalDatabase(categoryId, isCustomCategory, callback) {
	db.transaction(function(tx) {
		// Make a query to get the phrases
		var query = "SELECT rowid, * FROM custom_phrase ";
		query += "WHERE category_id = " + categoryId + " ";
		if (!isCustomCategory) {
			query += "AND is_custom_category = 0 "
		} else {
			query += "AND is_custom_category > 0 ";
		}
		query += "ORDER BY tag";
		
		tx.executeSql(query, [], function(tx, res) {
			// Add the resulting phrases to the list
			var customPhrases = new Array();
			for (var i = 0; i < res.rows.length; i++) {
				var customPhrase = res.rows.item(i);
				customPhrase.text = customPhrase.tag;
				customPhrases.push(customPhrase);
			}
			
			callback(customPhrases);
		});
	});
}

//
// Adds a new custom phrase to the local database.
//
function saveCustomPhraseInLocalDatabase(text, categoryId, isCustomCategory, callback) {
	db.transaction(function(tx) {
		// Make a query to insert the phrase
		var query = "INSERT INTO custom_phrase (category_id, is_custom_category, tag) VALUES (";
		query += categoryId + ", " + (isCustomCategory? 1: 0) + ", '" + text.replace("'", "''") + "')";
		tx.executeSql(query);
		if (callback)
			callback();
	});
}

//
// Deletes a custom phrase from the local database.
//
function deleteCustomPhraseFromLocalDatabase(rowid, callback) {
	db.transaction(function(tx) {
		// Make a query to delete the phrase
		var query = "DELETE FROM custom_phrase WHERE rowid = " + rowid;
		tx.executeSql(query);
		if (callback)
			callback();
	});
}

//
// Loads difficulty settings from the local database.
//
function loadDifficultiesFromLocalDatabase(callback) {
	// Load difficulties from the local database
	difficulties = new Array("");	// First element should be nothing
	db.transaction(function(tx) {
		var query = "SELECT id, name FROM difficulty_level ORDER BY id";
		tx.executeSql(query, [], function(tx, res) {
			for (var i = 0; i < res.rows.length; i++) {
				var difficulty = res.rows.item(i);
				difficulties.push(difficulty);
			}
			
			if (callback)
				callback();
		});
	});
}

//
// Stores the difficulties in the local database, replacing any that were already there.
//
function saveDifficultiesInLocalDatabase(difficulties) {
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

//
// Load categories from the local database.
//
function loadCategoriesFromLocalDatabase(callback) {
	// First element should be nothing
	categories = new Array("");
	
	db.transaction(function(tx) {
		// Get categories from the database and put them into the category list
		var query = "SELECT id, name FROM category ORDER BY name";
		tx.executeSql(query, [], function(tx, res) {
			for (var i = 0; i < res.rows.length; i++) {
				var category = res.rows.item(i);
				categories.push(category);
			}
			
			if (callback)
				callback();
		});
	});
}

//
// Stores the categories in the local database, replacing any that were already there.
//
function saveCategoriesInLocalDatabase(categories) {
	db.transaction(function(tx) {
		// First, delete all categories from the database
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

//
// Load custom categories from the local database.
//
function loadCustomCategoriesFromLocalDatabase(callback) {
	var customCategories = new Array();
	db.transaction(function(tx) {
		// Get custom categories from the database and put them into the category list
		var query = "SELECT rowid AS id, * FROM custom_category ORDER BY name";
		tx.executeSql(query, [], function(tx, res) {
			for (var i = 0; i < res.rows.length; i++) {
				var category = res.rows.item(i);
				customCategories.push(category);
			}
			
			callback(customCategories);
		});
	});
}

//
// Adds a new custom category to the local database.
//
function saveCustomCategoryInLocalDatabase(name, callback) {
	db.transaction(function(tx) {
		// Make a query to insert the category
		var query = "INSERT INTO custom_category (name) VALUES ('";
		query += name.replace("'", "''") + "')";
		tx.executeSql(query, [], function(tx, results) {
			if (callback)
				callback(results.insertId);
		});
	});
}

//
// Removes a custom category from the local database, along with any phrases in it.
//
function deleteCustomCategoryFromLocalDatabase(rowid, callback) {
	db.transaction(function(tx) {
		// Make a query to delete the phrases
		var query = "DELETE FROM custom_phrase WHERE category_id = " + rowid + " AND is_custom_category > 0";
		tx.executeSql(query);
		// Make a query to delete the category
		query = "DELETE FROM custom_category WHERE rowid = " + rowid;
		tx.executeSql(query);
		if (callback)
			callback();
	});
}

//
// Loads user settings from the local database.
//
function loadSettings(callback) {
	// Load any stored user settings, and indicate how many settings have been accounted for so we know when done
	getSetting("sMinTimePerStage", sMinTimePerStage, function(value) {
		sMinTimePerStage = parseInt(value);
		settingsLoaded++;
	});
	getSetting("sMaxTimePerStage", sMaxTimePerStage, function(value) {
		sMaxTimePerStage = parseInt(value);
		settingsLoaded++;
	});
	getSetting("sNumberOfTeams", sNumberOfTeams, function(value) {
		sNumberOfTeams = parseInt(value);
		settingsLoaded++;
	});
	getSetting("sWinningPoint", sWinningPoint, function(value) {
		sWinningPoint = parseInt(value);
		settingsLoaded++;
	});
	getSetting("sBeepSoundFile", sBeepSoundFile, function(value) {
		sBeepSoundFile = value;
		settingsLoaded++;
	});
	getSetting("sDifficulty", sDifficulty, function(value) {
		sDifficulty = parseInt(value);
		settingsLoaded++;
	});
	getSetting("sMaxWordsPerTag", sMaxWordsPerTag, function(value) {
		sMaxWordsPerTag = parseInt(value);
		settingsLoaded++;
	});
	getSetting("sMaxCharactersPerTag", sMaxCharactersPerTag, function(value) {
		sMaxCharactersPerTag = parseInt(value);
		settingsLoaded++;
	});
	getSetting("sCategoryIds", JSON.stringify(sCategoryIds), function(value) {
		sCategoryIds = JSON.parse(value);
		settingsLoaded++;
	});
	getSetting("sStyleSheet", sStyleSheet, function(value) {
		sStyleSheet = value;
		settingsLoaded++;
	});
	getSetting("sVibrate", JSON.stringify(sVibrate), function(value) {
		sVibrate = JSON.parse(value);
		settingsLoaded++;
	});
	getSetting("sShowCategory", JSON.stringify(sShowCategory), function(value) {
		sShowCategory = JSON.parse(value);
		settingsLoaded++;
	});
	getSetting("sShowAuthor", JSON.stringify(sShowAuthor), function(value) {
		sShowAuthor = JSON.parse(value);
		settingsLoaded++;
	});
	getSetting("sEdgy", JSON.stringify(sEdgy), function(value) {
		sEdgy = JSON.parse(value);
		settingsLoaded++;
	});
	getSetting("sDeveloperMode", JSON.stringify(sDeveloperMode), function(value) {
		sDeveloperMode = JSON.parse(value);
		settingsLoaded++;
	});
	getSetting("sDataVersion", sDataVersion, function(value) {
		sDataVersion = value;
		settingsLoaded++;
	});
	getSetting("sPromptForRating", JSON.stringify(sPromptForRating), function(value) {
		sPromptForRating = JSON.parse(value);
		settingsLoaded++;
	});
	getSetting("sGamesSinceRatingPrompt", sGamesSinceRatingPrompt, function(value) {
		sGamesSinceRatingPrompt = parseInt(value);
		settingsLoaded++;
	});
	getSetting("sTeamNames", JSON.stringify(sTeamNames), function(value) {
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
}

//
// Retrieves the value of a user setting from the local database and passes it to the callback.
//
function getSetting(name, defaultValue, callback) {
	db.transaction(function(tx) {
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
	});
}

//
// Stores a user setting in the local database.
//
function setSetting(name, value, callback) {
	db.transaction(function(tx) {
		tx.executeSql("DELETE FROM settings WHERE name = '" + name + "'");
		tx.executeSql("INSERT INTO settings (name, value) VALUES ('" + name + "', '" + value + "')");
		if (callback)
			callback();
	});
}
