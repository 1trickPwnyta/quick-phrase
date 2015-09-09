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
					parameters.push(phrases[j].difficultyId);
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
	 * Adds a custom phrase to the database.
	 * @param phrase the phrase to add. The phrase's id is set after insertion.
	 * @param callback a function to call after the phrase is added.
	 */
	this.addCustomPhrase = function(phrase, callback) {
		db.transaction(function(tx) {
			tx.executeSql("INSERT INTO custom_phrase (category_id, is_custom_category, tag) VALUES (?, ?, ?)", [
			        phrase.categoryId, 
					phrase.isCustomCategory? 1: 0, 
					phrase.text
			], function(tx, res) {
				phrase.id = res.insertId;
				if (callback) {
					callback();
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
			var parameters = [];
			var query = "INSERT INTO custom_phrase (category_id, is_custom_category, tag) VALUES ";
			for (var i = 0; i < phrases.length; i++) {
				var phrase = phrases[i];
				query += "(?, ?, ?),";
				parameters.push(phrase.categoryId);
				parameters.push(phrase.isCustomCategory? 1: 0);
				parameters.push(phrase.text);
			}
			query = query.substring(0, query.length - 1);	// Remove trailing comma
			
			tx.executeSql(query, parameters, function(tx, res) {
				if (callback) {
					callback();
				}
			}, function(tx, err) {
				_Log.error(err.message);
			});executeOperations(operations, callback);
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
	 * Reads the difficulty levels from the database.
	 * @param callback a function to call with the difficulty levels read.
	 */
	this.readDifficulties = function(callback) {
		db.transaction(function(tx) {
			var query = "SELECT id, name, max_rating FROM difficulty_level ORDER BY id";
			tx.executeSql(query, [], function(tx, res) {
				var difficulties = [];
				for (var i = 0; i < res.rows.length; i++) {
					var item = res.rows.item(i);
					var difficulty = new DifficultyLevel(item.id, item.name, item.max_rating);
					difficulties.push(difficulty);
				}
				callback(difficulties);
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Changes the difficulty levels in the database to those provided.
	 * @param difficulties the difficulties to store in the database, 
	 * replacing all previous difficulties.
	 * @param callback a function to call after the difficulties are updated.
	 */
	this.replaceDifficulties = function(difficulties, callback) {
		db.transaction(function(tx) {
			tx.executeSql("TRUNCATE TABLE difficulty_level", [], function(tx, res) {
				var parameters = [];
				var query = "INSERT INTO difficulty_level (id, name, max_rating) VALUES ";
				for (var i = 0; i < difficulties.length; i++) {
					var difficulty = difficulties[i];
					query += "(?, ?, ?),";
					parameters.push(difficulty.id);
					parameters.push(difficulty.name);
					parameters.push(difficulty.maxRating);
				}
				query = query.substring(0, query.length - 1) + ")";	// Remove trailing comma
				
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
	 * Reads the standard categories from the database.
	 * @param callback a function to call with the categories read.
	 */
	this.readStandardCategories = function(callback) {
		db.transaction(function(tx) {
			var query = "SELECT id, name FROM category ORDER BY id";
			tx.executeSql(query, [], function(tx, res) {
				var categories = [];
				for (var i = 0; i < res.rows.length; i++) {
					var item = res.rows.item(i);
					var category = new Category(item.id, item.name, false);
					categories.push(category);
				}
				callback(categories);
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Changes the standard categories in the database to those provided.
	 * @param categories the categories to store in the database, 
	 * replacing all previous categories.
	 * @param callback a function to call after the categories are updated.
	 */
	this.replaceStandardCategories = function(categories, callback) {
		db.transaction(function(tx) {
			tx.executeSql("TRUNCATE TABLE category", [], function(tx, res) {
				var parameters = [];
				var query = "INSERT INTO category (id, name) VALUES ";
				for (var i = 0; i < categories.length; i++) {
					var category = categories[i];
					query += "(?, ?),";
					parameters.push(category.id);
					parameters.push(category.name);
				}
				query = query.substring(0, query.length - 1) + ")";	// Remove trailing comma
				
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
	 * Reads the custom categories from the database.
	 * @param callback a function to call with the categories read.
	 */
	this.readCustomCategories = function(callback) {
		db.transaction(function(tx) {
			var query = "SELECT rowid, * FROM custom_category ORDER BY rowid";
			tx.executeSql(query, [], function(tx, res) {
				var categories = [];
				for (var i = 0; i < res.rows.length; i++) {
					var item = res.rows.item(i);
					var category = new Category(item.rowid, item.name, true);
					categories.push(category);
				}
				callback(categories);
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Adds a custom category to the database.
	 * @param category the category to add. The category's id is set after insertion.
	 * @param callback a function to call after the category is added.
	 */
	this.addCustomCategory = function(category, callback) {
		db.transaction(function(tx) {
			tx.executeSql("INSERT INTO custom_category (name) VALUES (?)", [category.name], function(tx, res) {
				category.id = res.insertId;
				if (callback) {
					callback();
				}
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Adds custom categories to the database.
	 * @param categories the categories to add.
	 * @param callback a function to call after the categories are added.
	 */
	this.addCustomCategories = function(categories, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query = "INSERT INTO custom_category (name) VALUES ";
			for (var i = 0; i < categories.length; i++) {
				var category = categories[i];
				query += "(?),";
				parameters.push(category.name);
			}
			query = query.substring(0, query.length - 1);	// Remove trailing comma
			
			tx.executeSql(query, parameters, function(tx, res) {
				if (callback) {
					callback();
				}
			}, function(tx, err) {
				_Log.error(err.message);
			});executeOperations(operations, callback);
		});
	};
	
	/**
	 * Removes custom categories from the database. Also removes any custom 
	 * phrases from those categories.
	 * @param categories the categories to remove.
	 * @param callback a function to call after the categories are removed.
	 */
	this.deleteCustomCategories = function(categories, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var queryIds = "(";
			for (var i = 0; i < categories.length; i++) {
				var category = categories[i];
				queryIds += "?,";
				parameters += category.id;
			}
			queryIds = queryIds.substring(0, queryIds.length - 1) + ")";	// Remove trailing comma
			
			var query = "DELETE FROM custom_phrase WHERE category_id IN " + queryIds + " AND is_custom_category > 0";
			
			tx.executeSql(query, parameters, function(tx, res) {
				var query = "DELETE FROM custom_category WHERE rowid IN " + queryIds;
				
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
	 * Checks if a standard or custom category exists with the same (or 
	 * similar) as provided.
	 * @param name the name to check for.
	 * @param callback a function to call with the results (true if the 
	 * category exists).
	 */
	this.categoryExists = function(name, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query = "SELECT (SELECT COUNT(*) AS c FROM custom_category ";
			query += "WHERE UPPER(TRIM(name)) = ?) + (";
			parameters.push(name.trim().toUpperCase());
			query += "SELECT COUNT(*) AS c FROM category ";
			query += "WHERE UPPER(TRIM(name)) = ?) AS c";
			parameters.push(name.trim().toUpperCase());
			
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
