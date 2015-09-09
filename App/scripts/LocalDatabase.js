function LocalDatabase() {
	var DB_NAME = "grab_tag";
	var DB_SIZE = 10 * 1024 * 1024;
	var INSERT_CHUNK_SIZE = 480;
	
	var db;
	
	/**
	 * Represents a single database operation.
	 * @param query the query to execute.
	 * @param parameters the parameters to pass to the query.
	 */
	var Operation = function(query, parameters) {
		this.query = query;
		this.parameters = parameters;
	}
	
	/**
	 * Executes multiple operations on the database at once.
	 * @param operations the operations to execute.
	 */
	var executeOperations = function(operations, callback) {
		var operationsRemaining = operations.length;
		for (var i = 0; i < operations.length; i++) {
			var operation = operations[i];
			tx.executeSql(operation.query, operation.parameters, function(tx, res) {
				if (--operationsRemaining <= 0) {
					if (callback) {
						callback();
					}
				}
			}, function(tx, err) {
				_Log.error(err.message);
			});
		}
	};
	
	/**
	 * Applies the current schema to the local database, updating the previous 
	 * schema if applicable.
	 * @param callback a function to call after the schema is applied.
	 */
	this.applySchemaAsync = function(callback) {
		db.transaction(function(tx) {
			
			// DROP TABLE statements should only be used during testing...
			// If a database schema must change from a previous version, you MUST retain the current data!
			/*
			var dropOperations = [
			    new Operation("DROP TABLE tag", []),
			    new Operation("DROP TABLE custom_phrase", []),
			    new Operation("DROP TABLE difficulty_level", []),
			    new Operation("DROP TABLE category", []),
			    new Operation("DROP TABLE custom_category", []),
			    new Operation("DROP TABLE settings", [])
			];
			
			executeOperations(dropOperations);
			*/
			
			var operations = [
			    new Operation("CREATE TABLE IF NOT EXISTS tag (id integer, category_id integer, tag text, difficulty_rating integer, edgy integer)", []),
			    new Operation("CREATE TABLE IF NOT EXISTS custom_phrase (category_id integer, is_custom_category integer, tag text)", []),
			    new Operation("CREATE TABLE IF NOT EXISTS difficulty_level (id integer, name text, max_rating integer)", []),
			    new Operation("CREATE TABLE IF NOT EXISTS category (id integer, name text)", []),
			    new Operation("CREATE TABLE IF NOT EXISTS custom_category (name text)", []),
			    new Operation("CREATE TABLE IF NOT EXISTS settings (id integer primary key autoincrement, name text, value text)", [])
			];
			
			executeOperations(operations, callback);
		});
	};
	
	/**
	 * Reads standard phrases from the database.
	 * @param settings settings to filter the results on.
	 * @param randomize whether to randomize the results.
	 * @param limit the maximum number of phrases to read.
	 * @param countOnly whether to count the phrases instead.
	 * @param callback a function to call with the phrases read.
	 */
	this.readStandardPhrases = function(settings, randomize, limit, countOnly, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query = "SELECT * FROM tag ";
			
			if (settings) {
				var categoryIds = settings.get(_Settings.KEY_CATEGORY_IDS, DEFAULT_CATEGORY_IDS);
				var difficultyId = settings.get(_Settings.KEY_DIFFICULTY, DEFAULT_DIFFICULTY);
				var maxCharactersPerPhrase = settings.get(_Settings.KEY_MAX_CHARACTERS_PER_PHRASE, DEFAULT_MAX_CHARACTERS_PER_PHRASE);
				var maxWordsPerPhrase = settings.get(_Settings.KEY_MAX_WORDS_PER_PHRASE, DEFAULT_MAX_WORDS_PER_PHRASE);
				var enableAdult = settings.get(_Settings.KEY_ADULT, DEFAULT_ADULT);
				
				query += "WHERE category_id IN (";
				if (categoryIds != _Category.ALL) {
					for (var i = 0; i < categoryIds.length; i++) {
						var categoryId = categoryIds[i];
						query += "?,";
						parameters.push(categoryId);
					}
					query = query.substring(0, query.length - 1) + ") ";	// Remove trailing comma
				} else
					query += "category_id) ";	// Always true
				
				query += "AND difficulty_rating <= (SELECT max_rating FROM difficulty_level WHERE id = ?) ";
				parameters.push(difficultyId);
				
				if (maxCharactersPerPhrase) {
					query += "AND LENGTH(tag) <= ? ";
					parameters.push(maxCharactersPerPhrase);
				}
				
				if (maxWordsPerPhrase) {
					query += "AND LENGTH(tag) - LENGTH(REPLACE(tag, ' ', '')) <= ? - 1 ";
					parameters.push(maxWordsPerPhrase);
				}
				
				if (!enableAdult) {
					query += "AND edgy = 0 ";
				}
			}
			
			if (randomize && _Environment.isPhonegap) {
				query += "ORDER BY RANDOM() ";
			}
			
			if (limit) {
				query += "LIMIT ? ";
				parameters.push(limit);
			}
			
			tx.executeSql(query, parameters, function(tx, res) {
				if (countOnly) {
					callback(res.rows.length);
				} else {
					var phrases = [];
					for (var i = 0; i < res.rows.length; i++) {
						var item = res.rows.item(i);
						var phrase = new Phrase(
								item.id, 
								item.tag, 
								false, 
								item.category_id, 
								false, 
								item.difficulty_rating, 
								item.edgy > 0? true: false);
						phrases.push(phrase);
					}
					if (randomize && !_Environment.isPhonegap) {
						_ArrayUtil.shuffle(phrases);
					}
					callback(phrases);
				}
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Adds standard phrases to the database.
	 * @param phrases the phrases to add.
	 * @param callback a function to call after the phrases are added.
	 */
	this.addStandardPhrases = function(phrases, callback) {
		db.transaction(function(tx) {
			// Split the insert into chunks to avoid SQLite errors
			var operations = [];
			for (var i = 0; i < phrases.length + INSERT_CHUNK_SIZE; i += INSERT_CHUNK_SIZE) {
				var parameters = [];
				var query = "INSERT INTO tag (id, category_id, tag, difficulty_rating, edgy) VALUES ";
				for (var j = i; j < i + INSERT_CHUNK_SIZE && j < phrases.length; j++) {
					query += "(?, ?, ?, ?, ?),";
					parameters.push(phrases[j].id);
					parameters.push(phrases[j].categoryId);
					parameters.push(phrases[j].text);
					parameters.push(phrases[j].difficultyLevel);
					parameters.push(phrases[j].adult? 1: 0);
				}
				query = query.substring(0, query.length - 1);	// Remove trailing comma
				operations.push(new Operation(query, parameters));
			}
			
			executeOperations(operations, callback);
		});
	};
	
	/**
	 * Removes standard phrases from the database.
	 * @param phrases the phrases to remove.
	 * @param callback a function to call after the phrases are removed.
	 */
	this.deleteStandardPhrases = function(phrases, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query = "DELETE FROM tag WHERE id IN (";
			for (var i = 0; i < phrases.length; i++) {
				var phrase = phrases[i];
				query += "?,";
				parameters += phrase.id;
			}
			query = query.substring(0, query.length - 1) + ")";	// Remove trailing comma
			tx.executeSql(query, parameters, function(tx, res) {
				if (callback) {
					callback();
				}
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Reads custom phrases from the database.
	 * @param settings settings to filter the results on.
	 * @param randomize whether to randomize the results.
	 * @param limit the maximum number of phrases to read.
	 * @param countOnly whether to count the phrases instead.
	 * @param callback a function to call with the phrases read.
	 */
	this.readCustomPhrases = function(settings, randomize, limit, countOnly, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query = "SELECT * FROM custom_phrase ";
			
			if (settings) {
				var categoryIds = settings.get(_Settings.KEY_CATEGORY_IDS, DEFAULT_CATEGORY_IDS);
				var customCategoryIds = settings.get(_Settings.KEY_CUSTOM_CATEGORY_IDS, DEFAULT_CUSTOM_CATEGORY_IDS);
				var maxCharactersPerPhrase = settings.get(_Settings.KEY_MAX_CHARACTERS_PER_PHRASE, DEFAULT_MAX_CHARACTERS_PER_PHRASE);
				var maxWordsPerPhrase = settings.get(_Settings.KEY_MAX_WORDS_PER_PHRASE, DEFAULT_MAX_WORDS_PER_PHRASE);
				
				query += "WHERE ((is_custom_category = 0 AND category_id IN (";
				if (categoryIds != CATEGORIES_ALL) {
					for (var i = 0; i < categoryIds.length; i++) {
						var categoryId = categoryIds[i];
						query += "?,";
						parameters.push(categoryId);
					}
					query = query.substring(0, query.length - 1) + ")";	// Remove trailing comma
				} else
					query += "category_id)";	// Always true
				query += ") ";
				query += "OR (is_custom_category > 0 AND category_id IN (";
				if (customCategoryIds != CATEGORIES_ALL) {
					for (var i = 0; i < customCategoryIds.length; i++) {
						var customCategoryId = customCategoryIds[i];
						query += "?,";
						parameters.push(customCategoryId);
					}
					query = query.substring(0, query.length - 1) + ")";	// Remove trailing comma
				} else
					query += "category_id)";	// Always true
				query += ")) ";
				
				if (maxCharactersPerPhrase) {
					query += "AND LENGTH(tag) <= ? ";
					parameters.push(maxCharactersPerPhrase);
				}
				
				if (maxWordsPerPhrase) {
					query += "AND LENGTH(tag) - LENGTH(REPLACE(tag, ' ', '')) <= ? - 1 ";
					parameters.push(maxWordsPerPhrase);
				}
			}
			
			if (randomize && _Environment.isPhonegap) {
				query += "ORDER BY RANDOM() ";
			}
			
			if (limit) {
				query += "LIMIT ? ";
				parameters.push(limit);
			}
			
			tx.executeSql(query, parameters, function(tx, res) {
				if (countOnly) {
					callback(res.rows.length);
				} else {
					var phrases = [];
					for (var i = 0; i < res.rows.length; i++) {
						var item = res.rows.item(i);
						var phrase = new Phrase(
								item.rowid, 
								item.tag, 
								true, 
								item.category_id, 
								item.is_custom_category? true: false, 
								null, 
								null);
						phrases.push(phrase);
					}
					if (randomize && !_Environment.isPhonegap) {
						_ArrayUtil.shuffle(phrases);
					}
					callback(phrases);
				}
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Adds custom phrases to the database.
	 * @param phrases the phrases to add.
	 * @param callback a function to call after the phrases are added.
	 */
	this.addCustomPhrases = function(phrases, callback) {
		db.transaction(function(tx) {
			// Split the insert into chunks to avoid SQLite errors
			var operations = [];
			for (var i = 0; i < phrases.length + INSERT_CHUNK_SIZE; i += INSERT_CHUNK_SIZE) {
				var parameters = [];
				var query = "INSERT INTO custom_phrase (category_id, is_custom_category, tag) VALUES ";
				for (var j = i; j < i + INSERT_CHUNK_SIZE && j < phrases.length; j++) {
					query += "(?, ?, ?),";
					parameters.push(phrases[j].categoryId);
					parameters.push(phrases[j].isCustomCategory? 1: 0);
					parameters.push(phrases[j].text);
				}
				query = query.substring(0, query.length - 1);	// Remove trailing comma
				operations.push(new Operation(query, parameters));
			}
			
			executeOperations(operations, callback);
		});
	};
	
	/**
	 * Removes custom phrases from the database.
	 * @param phrases the phrases to remove.
	 * @param callback a function to call after the phrases are removed.
	 */
	this.deleteCustomPhrases = function(phrases, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query = "DELETE FROM custom_phrase WHERE rowid IN (";
			for (var i = 0; i < phrases.length; i++) {
				var phrase = phrases[i];
				query += "?,";
				parameters += phrase.id;
			}
			query = query.substring(0, query.length - 1) + ")";	// Remove trailing comma
			tx.executeSql(query, parameters, function(tx, res) {
				if (callback) {
					callback();
				}
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Checks if a standard or custom phrase exists with the same (or similar) 
	 * text as provided.
	 * @param text the text to check for.
	 * @param callback a function to call with the results (true if the phrase 
	 * exists).
	 */
	this.phraseExists = function(text, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query = "SELECT (SELECT COUNT(*) AS c FROM custom_phrase ";
			query += "WHERE UPPER(TRIM(tag)) = ?) + (";
			parameters.push(text.trim().toUpperCase());
			query += "SELECT COUNT(*) AS c FROM tag ";
			query += "WHERE UPPER(TRIM(tag)) = ?) AS c";
			parameters.push(text.trim().toUpperCase());
			
			tx.executeSql(query, parameters, function(tx, res) {
				var exists = res.rows.item(0).c > 0;
				callback(exists);
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Reads settings from the database.
	 * @param callback a function to call with the settings read.
	 */
	this.readSettings = function(callback) {
		db.transaction(function(tx) {
			tx.executeSql("SELECT name, value FROM settings", [], function(tx, res) {
				var settings = [];
				for (var i = 0; i < res.rows.length; i++) {
					var item = res.rows.item(i);
					settings[item.name] = item.value;
				}
				callback(settings);
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Changes the settings in the database to those provided.
	 * @param settings an associative array of settings to store in the 
	 * database, replacing all previous settings.
	 * @param callback a function to call after the settings are updated.
	 */
	this.replaceSettings = function(settings, callback) {
		db.transaction(function(tx) {
			tx.executeSql("TRUNCATE TABLE settings", [], function(tx, res) {
				var parameters = [];
				var query = "INSERT INTO settings (name, value) VALUES ";
				for (var name in settings) {
					query += "(?, ?),";
					parameters.push(name);
					parameters.push(settings[name]);
				}
				query = query.substring(0, query.length - 1);	// Remove trailing comma
				tx.executeSql(query, parameters, function(tx, res) {
					if (callback) {
						callback();
					}
				}, function(tx, err) {
					_Log.error(err.message);
				});
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Constructor. Initializes the local database.
	 */
	{
		if (Environment.isPhonegap) {
			db = window.sqlitePlugin.openDatabase({name: DB_NAME});
		} else {
			db = openDatabase(DB_NAME, "", Environment.app.name, DB_SIZE);
		}
	}
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
		});
	});
}

//
// Stores the categories in the local database, replacing any that were already there.
//
function saveCategoriesInLocalDatabase(categories, callback) {
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
		tx.executeSql(query, [], function(tx, res) {
			if (callback) {
				callback();
			}
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