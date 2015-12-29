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
		// DROP TABLE statements should only be used during testing...
		// If a database schema must change from a previous version, you MUST retain the current data!
		/*tx.executeSql("DROP TABLE tag");
		tx.executeSql("DROP TABLE custom_phrase", [], function(tx, res) {}, function(tx, err) {logError(err.message);});
		tx.executeSql("DROP TABLE difficulty_level", [], function(tx, res) {}, function(tx, err) {logError(err.message);});
		tx.executeSql("DROP TABLE category", [], function(tx, res) {}, function(tx, err) {logError(err.message);});
		tx.executeSql("DROP TABLE custom_category", [], function(tx, res) {}, function(tx, err) {logError(err.message);});
		tx.executeSql("DROP TABLE settings", [], function(tx, res) {}, function(tx, err) {logError(err.message);});*/
		tx.executeSql("CREATE TABLE IF NOT EXISTS tag (id integer, category_id integer, tag text, difficulty_rating integer, edgy integer)", [], function(tx, res) {}, function(tx, err) {logError(err.message);});
		tx.executeSql("CREATE TABLE IF NOT EXISTS custom_phrase (category_id integer, is_custom_category integer, tag text)", [], function(tx, res) {}, function(tx, err) {logError(err.message);});
		tx.executeSql("CREATE TABLE IF NOT EXISTS difficulty_level (id integer, name text, max_rating integer)", [], function(tx, res) {}, function(tx, err) {logError(err.message);});
		tx.executeSql("CREATE TABLE IF NOT EXISTS category (id integer, name text)", [], function(tx, res) {}, function(tx, err) {logError(err.message);});
		tx.executeSql("CREATE TABLE IF NOT EXISTS custom_category (name text)", [], function(tx, res) {}, function(tx, err) {logError(err.message);});
		tx.executeSql("CREATE TABLE IF NOT EXISTS settings (id integer primary key autoincrement, name text, value text)", [], function(tx, res) {}, function(tx, err) {logError(err.message);});
	});
}

//
// Upgrades the database schema to that required by version 2 of the app.
//
function upgradeDatabaseToVersion2(callback) {
	var transactions = [
	    {
	    	drop: "DROP TABLE tag",
	    	create: "CREATE TABLE tag (id integer, category_id integer, tag text, difficulty_rating integer, edgy integer)"
	    },
	    {
	    	create: "CREATE TABLE custom_phrase (category_id integer, is_custom_category integer, tag text)"
	    },
	    {
	    	drop: "DROP TABLE difficulty_level",
	    	create: "CREATE TABLE difficulty_level (id integer, name text, max_rating integer)"
	    },
	    {
	    	drop: "DROP TABLE category",
	    	create: "CREATE TABLE category (id integer, name text)"
	    },
	    {
	    	create: "CREATE TABLE custom_category (name text)"
	    }
	];
	var transactionsRemaining = transactions.length;
	db.transaction(function(tx) {
		for (var i = 0; i < transactions.length; i++) {
			(function(i, tx) {
				var create = function() {
					tx.executeSql(transactions[i].create, [], function(tx, res) {
						if (--transactionsRemaining == 0) {
							if (callback) callback();
						}
					}, function(tx, err) {
						logError(err.message);
					});
				};
				if (transactions[i].drop) {
					tx.executeSql(transactions[i].drop, [], function(tx, res) {
						create();
					}, function(tx, err) {
						logError(err.message);
					});
				} else {
					create();
				}
			})(i, tx);
		}
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
		if (sCategoryIds != CATEGORIES_ALL) {
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
		if (PHONEGAP) {
			query += "ORDER BY RANDOM() ";
		}
		query += "LIMIT " + TAG_LOAD_QUANTITY + " ";
		
		tx.executeSql(query, [], function(tx, res) {
			// Add the resulting phrases to the list
			var newTags = new Array();
			for (var i = 0; i < res.rows.length; i++) {
				var tag = res.rows.item(i);
				tag.text = tag.tag;
				newTags.push(tag);
			}
			
			// Remove previously used or duplicate phrases
			processPhraseLoad(newTags);
			
			// Inject custom phrases
			countTagsInLocalDatabase(function(phrasesAvailable) {
				injectCustomPhrases(newTags, phrasesAvailable, function() {
					if (!PHONEGAP) {
						// Still need to randomize the list
						shuffle(newTags);
					}
					
					for (var i = 0; i < newTags.length; i++)
						tags.push(newTags[i]);
					
					if (callback)
						callback();
				});
			});
		}, function(tx, err) {
			logError(err.message);
		});
	});
}

//
// Counts the number of non-custom phrases in the local database that meet the current settings criteria.
//
function countTagsInLocalDatabase(callback) {
	db.transaction(function(tx) {
		// Make a query to get the phrases based on settings
		var query = "SELECT COUNT(*) AS c FROM tag ";
		query += "WHERE category_id IN (";
		if (sCategoryIds != CATEGORIES_ALL) {
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
		
		tx.executeSql(query, [], function(tx, res) {
			callback(parseInt(res.rows.item(0).c));
		}, function(tx, err) {
			logError(err.message);
		});
	});
}

//
// Saves phrases in the local database for later.
//
function saveTagsInLocalDatabase(newTags, callback) {
	db.transaction(function(tx) {
		// Make a list of all IDs to be inserted
		var idList = "(";
		for (var i = 0; i < newTags.length; i++) {
			if (newTags[i].id) { // Filter out custom phrases
				idList += newTags[i].id + ",";
			}
		}
		idList += "-1)";
		// Get a list of IDs that are already in the database
		tx.executeSql("SELECT id FROM tag WHERE id IN " + idList, [], function(tx, res) {
			var existingIds = new Array();
			for (var i = 0; i < res.rows.length; i++) {
				existingIds.push(res.rows.item(i).id);
			}
			
			// Make a query to store phrases not already in the database
			var chunkSize = 480;
			for (var i = 0; i < newTags.length + chunkSize; i += chunkSize) {	// Split this into chunks of 480 max to avoid errors
				var goodQuery = false;
				var query = "INSERT INTO tag (id, category_id, tag, difficulty_rating, edgy) VALUES ";
				for (var j = i; j < i + chunkSize && j < newTags.length; j++) {
					if (newTags[j].id) { // Filter out custom phrases
						if (existingIds.indexOf(parseInt(newTags[j].id)) < 0) {
							goodQuery = true;
							query += "(" + newTags[j].id + ", " + newTags[j].category_id + ", '" + newTags[j].text.replace("'", "''") + "', " + newTags[j].difficulty_rating + ", " + newTags[j].edgy + "),";
						}
					}
				}
				if (goodQuery) {
					query = query.substring(0, query.length - 1);	// Remove trailing comma
					tx.executeSql(query, [], function(tx, res) {}, function(tx, err) {
						logError(err.message);
					});
				}
			}
			
			// If we have too many local phrases, delete about half of them, randomly
			tx.executeSql("SELECT COUNT(*) AS c FROM tag", [], function(tx, res) {
				if (res.rows.item(0).c > MAX_LOCAL_TAGS) {
					if (PHONEGAP) {
						tx.executeSql("DELETE FROM tag WHERE (RANDOM() % 2) = 0");
					} else {
						tx.executeSql("SELECT rowid FROM tag", [], function(tx, res) {
							var list = "(";
							for (var i = 0; i < res.rows.length; i++) {
								if (Math.random() < 0.5) {
									list += res.rows.item(i).rowid + ",";
								}
							}
							list += "-1)";
							tx.executeSql("DELETE FROM tag WHERE rowid IN " + list);
						});
					}
				}
			}, function(tx, err) {
				logError(err.message);
			});
			
			if (callback)
				callback();
		}, function(tx, err) {
			logError(err.message);
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
		tx.executeSql(query, [], function(tx, res) {}, function(tx, err) {
			logError(err.message);
		});
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
		if (sCategoryIds != CATEGORIES_ALL) {
			for (var i = 0; i < sCategoryIds.length; i++)
				query += sCategoryIds[i] + ", ";
			query += "-1)";
		} else
			query += "category_id)";
		query += ") ";
		query += "OR (is_custom_category > 0 AND category_id IN (";
		if (sCustomCategoryIds != CATEGORIES_ALL) {
			for (var i = 0; i < sCustomCategoryIds.length; i++)
				query += sCustomCategoryIds[i] + ", ";
			query += "-1)";
		} else
			query += "category_id)";
		query += ")) ";
		if (sMaxCharactersPerTag > 0)
			query += "AND LENGTH(tag) <= " + sMaxCharactersPerTag + " ";
		if (sMaxWordsPerTag > 0)
			query += "AND LENGTH(tag) - LENGTH(REPLACE(tag, ' ', '')) <= " + sMaxWordsPerTag + " - 1 ";
		
		tx.executeSql(query, [], function(tx, res) {
			// Add the resulting phrases to the list
			var newTags = new Array();
			for (var i = 0; i < res.rows.length; i++) {
				var tag = res.rows.item(i);
				tag.text = tag.tag;
				tag.isCustom = true;
				newTags.push(tag);
			}
			
			callback(newTags);
		}, function(tx, err) {
			logError(err.message);
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
		if (categoryId) {
			query += "WHERE category_id = " + categoryId + " ";
			if (!isCustomCategory) {
				query += "AND is_custom_category = 0 "
			} else {
				query += "AND is_custom_category > 0 ";
			}
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
		}, function(tx, err) {
			logError(err.message);
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
		tx.executeSql(query, [], function(tx, res) {
			if (callback) callback();
		}, function(tx, err) {
			logError(err.message);
			if (callback) callback();
		});
	});
}

//
// Deletes a custom phrase from the local database.
//
function deleteCustomPhraseFromLocalDatabase(rowid, callback) {
	db.transaction(function(tx) {
		// Make a query to delete the phrase
		var query = "DELETE FROM custom_phrase WHERE rowid = " + rowid;
		tx.executeSql(query, [], function(tx, res) {
			if (callback) callback();
		}, function(tx, err) {
			logError(err.message);
			if (callback) callback();
		});
	});
}

//
// Checks if a phrase already exists in the local database, custom or not.
//
function checkIfPhraseExistsInLocalDatabase(text, callback) {
	db.transaction(function(tx) {
		// Make a query to get the phrase
		var query = "SELECT (SELECT COUNT(*) AS c FROM custom_phrase ";
		query += "WHERE UPPER(TRIM(tag)) = '" + text.replace("'", "''").trim().toUpperCase() + "') + (";
		query += "SELECT COUNT(*) AS c FROM tag ";
		query += "WHERE UPPER(TRIM(tag)) = '" + text.replace("'", "''").trim().toUpperCase() + "') AS c";
		
		tx.executeSql(query, [], function(tx, res) {
			var exists = res.rows.item(0).c > 0;
			callback(exists);
		}, function(tx, err) {
			logError(err.message);
		});
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
		}, function(tx, err) {
			logError(err.message);
		});
	});
}

//
// Stores the difficulties in the local database, replacing any that were already there.
//
function saveDifficultiesInLocalDatabase(difficulties, callback) {
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
		tx.executeSql(query, [], function(tx, res) {
			if (callback) {
				callback();
			}
		}, function(tx, err) {
			logError(err.message);
		});
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
		}, function(tx, err) {
			logError(err.message);
		});
	});
}

//
// Stores the categories in the local database, replacing any that were already there.
//
function saveCategoriesInLocalDatabase(newCategories, callback) {
	var alreadyLoadedCategories = categories;
	// Before changing anything, get the current categories from the local database
	loadCategoriesFromLocalDatabase(function() {
		var oldCategories = categories;
		categories = alreadyLoadedCategories;
		// Find out which old categories are not new categories (have been deleted), if any
		var deletedCategories = [];
		for (var i = 1; i < oldCategories.length; i++) {
			var found = false;
			for (var j = 1; j < newCategories.length; j++) {
				if (oldCategories[i].id == newCategories[j].id) {
					found = true;
					break;
				}
			}
			if (!found) {
				deletedCategories.push(oldCategories[i]);
			}
		}
		uncleanCustomCategories(deletedCategories, function() {
			db.transaction(function(tx) {
				// Then delete all categories from the local database
				tx.executeSql("DELETE FROM category WHERE 1=1");
				// Create a query to insert all the new categories into the database
				var query = "INSERT INTO category (id, name) VALUES ";
				for (var i = 1; i < newCategories.length; i++) {
					query += "(" + newCategories[i].id + ", '" + newCategories[i].name.replace("'", "''") + "')";
					if (i < newCategories.length - 1)
						query += ", ";
				}
				tx.executeSql(query, [], function(tx, res) {
					if (callback) {
						callback();
					}
				}, function(tx, err) {
					logError(err.message);
				});
			});
		});
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
		}, function(tx, err) {
			logError(err.message);
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
		}, function(tx, err) {
			logError(err.message);
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
		tx.executeSql(query, [], function(tx, res) {
			if (callback) callback();
		}, function(tx, err) {
			logError(err.message);
			if (callback) callback();
		});
	});
}

//
// Checks if a category already exists in the local database, custom or not.
//
function checkIfCategoryExistsInLocalDatabase(name, callback) {
	db.transaction(function(tx) {
		// Make a query to get the category
		var query = "SELECT (SELECT COUNT(*) AS c FROM custom_category ";
		query += "WHERE UPPER(TRIM(name)) = '" + name.replace("'", "''").trim().toUpperCase() + "') + (";
		query += "SELECT COUNT(*) AS c FROM category ";
		query += "WHERE UPPER(TRIM(name)) = '" + name.replace("'", "''").trim().toUpperCase() + "') AS c";
		
		tx.executeSql(query, [], function(tx, res) {
			var exists = res.rows.item(0).c > 0;
			callback(exists);
		}, function(tx, err) {
			logError(err.message);
		});
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
	getSetting("sCustomCategoryIds", JSON.stringify(sCustomCategoryIds), function(value) {
		sCustomCategoryIds = JSON.parse(value);
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
	getSetting("sPromptForCustomPhraseSubmittal", JSON.stringify(sPromptForCustomPhraseSubmittal), function(value) {
		sPromptForCustomPhraseSubmittal = JSON.parse(value);
		settingsLoaded++;
	});
	getSetting("sCustomPhraseVisitsSincePrompt", sCustomPhraseVisitsSincePrompt, function(value) {
		sCustomPhraseVisitsSincePrompt = parseInt(value);
		settingsLoaded++;
	});
	getSetting("sSubmitCustomPhrases", JSON.stringify(sSubmitCustomPhrases), function(value) {
		sSubmitCustomPhrases = JSON.parse(value);
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
		}, function(tx, err) {
			logError(err.message);
		});
	});
}

//
// Stores a user setting in the local database.
//
function setSetting(name, value, callback) {
	db.transaction(function(tx) {
		tx.executeSql("DELETE FROM settings WHERE name = '" + name + "'", [], function(tx, res) {
			tx.executeSql("INSERT INTO settings (name, value) VALUES ('" + name + "', '" + value + "')", [], function(tx, res) {
				if (callback) callback();
			}, function(tx, err) {
				logError(err.message);
				if (callback) callback();
			});
		}, function(tx, err) {
			logError(err.message);
		});
	});
}
