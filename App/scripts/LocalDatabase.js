function LocalDatabase() {
	var DB_NAME = "grab_tag";
	var DB_SIZE = 10 * 1024 * 1024;
	var CHUNK_SIZE = 480;
	
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
	var executeOperationsAsync = function(operations, callback) {
		db.transaction(function(tx) {
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
		});
	};
	
	/**
	 * Breaks an operation into chunks to avoid SQLite errors.
	 * @param data the full set of data to operate on.
	 * @param getOperation a function to call with each chunk of the set of 
	 * data, to return an Operation to perform on that chunk.
	 * @param callback a function to call once all operations are complete.
	 */
	var chunkifyAsync = function(data, getOperation, callback) {
		var operations = [];
		for (var i = 0; i < data.length + CHUNK_SIZE; i += CHUNK_SIZE) {
			var chunk = [];
			for (var j = i; j < i + CHUNK_SIZE && j < data.length; j++) {
				chunk.push(data[j]);
			}
			operations.push(getOperation(chunk));
		}
		executeOperationsAsync(operations, callback);
	};
	
	/**
	 * Applies the current schema to the local database, updating the previous 
	 * schema if applicable.
	 * @param callback a function to call after the schema is applied.
	 */
	this.applySchemaAsync = function(callback) {
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
		    new Operation("CREATE TABLE IF NOT EXISTS phrase (id integer, is_custom integer, category_id integer, phrase text, difficulty_rating integer, adult integer)", []),
		    new Operation("CREATE TABLE IF NOT EXISTS difficulty (id integer, name text, max_rating integer)", []),
		    new Operation("CREATE TABLE IF NOT EXISTS category (id integer, is_custom integer, name text)", []),
		    new Operation("CREATE TABLE IF NOT EXISTS settings (id integer primary key autoincrement, name text, value text)", [])
		];
		
		executeOperationsAsync(operations, callback);
	};
	
	/**
	 * Reads phrases from the database.
	 * @param includeStandard whether to include standard phrases.
	 * @param includeCustom whether to include custom phrases.
	 * @param settings settings to filter the results on.
	 * @param randomize whether to randomize the results.
	 * @param limit the maximum number of phrases to read.
	 * @param countOnly whether to count the phrases instead.
	 * @param callback a function to call with the phrases read.
	 */
	this.readPhrasesAsync = function(includeStandard, includeCustom, settings, randomize, limit, countOnly, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query = "SELECT * FROM phrase WHERE 1=1 ";
			
			if (includeStandard && !includeCustom) {
				query += "AND is_custom = 0 ";
			} else if (includeCustom && !includeStandard) {
				query += "AND is_custom > 0 ";
			}
			
			if (settings) {
				var categoryIds = settings.get(_Settings.KEY_CATEGORY_IDS, DEFAULT_CATEGORY_IDS);
				var difficultyId = settings.get(_Settings.KEY_DIFFICULTY, DEFAULT_DIFFICULTY);
				var maxCharactersPerPhrase = settings.get(_Settings.KEY_MAX_CHARACTERS_PER_PHRASE, DEFAULT_MAX_CHARACTERS_PER_PHRASE);
				var maxWordsPerPhrase = settings.get(_Settings.KEY_MAX_WORDS_PER_PHRASE, DEFAULT_MAX_WORDS_PER_PHRASE);
				var enableAdult = settings.get(_Settings.KEY_ADULT, DEFAULT_ADULT);
				
				query += "AND category_id IN (";
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
					query += "AND LENGTH(phrase) <= ? ";
					parameters.push(maxCharactersPerPhrase);
				}
				
				if (maxWordsPerPhrase) {
					query += "AND LENGTH(phrase) - LENGTH(REPLACE(phrase, ' ', '')) <= ? - 1 ";
					parameters.push(maxWordsPerPhrase);
				}
				
				if (!enableAdult) {
					query += "AND adult = 0 ";
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
								item.is_custom, 
								item.phrase, 
								item.category_id, 
								item.difficulty_rating, 
								item.adult > 0? true: false);
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
	 * Adds phrases to the database.
	 * @param phrases the phrases to add.
	 * @param callback a function to call after the phrases are added.
	 */
	this.createPhrasesAsync = function(phrases, callback) {
		chunkifyAsync(phrases, function(chunk) {
			var parameters = [];
			var query = "INSERT INTO phrase (id, is_custom, category_id, phrase, difficulty_rating, adult) VALUES ";
			for (var i = 0; i < chunk.length; i++) {
				var phrase = chunk[i];
				query += "(?, ?, ?, ?, ?, ?),";
				parameters.push(phrase.id);
				parameters.push(phrase.isCustom? 1: 0);
				parameters.push(phrase.categoryId);
				parameters.push(phrase.text);
				parameters.push(phrase.difficultyRating);
				parameters.push(phrase.adult? 1: 0);
			}
			query = query.substring(0, query.length - 1);	// Remove trailing comma
			return new Operation(query, parameters);
		}, callback);
	};
	
	/**
	 * Updates phrases in the database.
	 * @param phrases the phrases to update. Phrases in the database with the 
	 * same IDs will be updated to match.
	 * @param callback a function to call after the phrases are updated.
	 */
	this.updatePhrasesAsync = function(phrases, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query = "UPDATE phrase SET ";
			
			query += "phrase = CASE id ";
			for (var i = 0; i < phrases.length; i++) {
				var phrase = phrases[i];
				query += "WHEN ? THEN ? ";
				parameters.push(phrase.id);
				parameters.push(phrase.text);
			}
			query += "ELSE phrase END, ";
			
			query += "category_id = CASE id ";
			for (var i = 0; i < phrases.length; i++) {
				var phrase = phrases[i];
				query += "WHEN ? THEN ? ";
				parameters.push(phrase.id);
				parameters.push(phrase.categoryId);
			}
			query += "ELSE category_id END, ";
			
			query += "difficulty_rating = CASE id ";
			for (var i = 0; i < phrases.length; i++) {
				var phrase = phrases[i];
				query += "WHEN ? THEN ? ";
				parameters.push(phrase.id);
				parameters.push(phrase.difficultyRating);
			}
			query += "ELSE difficulty_rating END, ";
			
			query += "adult = CASE id ";
			for (var i = 0; i < phrases.length; i++) {
				var phrase = phrases[i];
				query += "WHEN ? THEN ? ";
				parameters.push(phrase.id);
				parameters.push(phrase.adult? 1: 0);
			}
			query += "ELSE adult END ";
			
			query += "WHERE id IN (";
			for (var i = 0; i < phrases.length; i++) {
				var phrase = phrases[i];
				query += "?,";
				parameters.push(phrase.id);
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
	 * Removes phrases from the database.
	 * @param phrases the phrases to remove. If not specified, all phrases are 
	 * removed.
	 * @param callback a function to call after the phrases are removed.
	 */
	this.deletePhrasesAsync = function(phrases, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query;
			if (phrases) {
				query = "DELETE FROM phrase WHERE id IN (";
				for (var i = 0; i < phrases.length; i++) {
					var phrase = phrases[i];
					query += "?,";
					parameters += phrase.id;
				}
				query = query.substring(0, query.length - 1) + ")";	// Remove trailing comma
			} else {
				query = "TRUNCATE TABLE phrase";
			}
			
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
	 * Reads the difficulty levels from the database.
	 * @param callback a function to call with the difficulty levels read.
	 */
	this.readDifficultiesAsync = function(callback) {
		db.transaction(function(tx) {
			var query = "SELECT * FROM difficulty ORDER BY id";
			tx.executeSql(query, [], function(tx, res) {
				var difficulties = [];
				for (var i = 0; i < res.rows.length; i++) {
					var item = res.rows.item(i);
					var difficulty = new Difficulty(item.id, item.name, item.max_rating);
					difficulties.push(difficulty);
				}
				callback(difficulties);
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Adds difficulty levels to the database.
	 * @param difficulties the difficulties to add.
	 * @param callback a function to call after the difficulties are added.
	 */
	this.createDifficultiesAsync = function(difficulties, callback) {
		chunkifyAsync(difficulties, function(chunk) {
			var parameters = [];
			var query = "INSERT INTO difficulty (id, name, max_rating) VALUES ";
			for (var i = 0; i < chunk.length; i++) {
				var difficulty = chunk[i];
				query += "(?, ?, ?),";
				parameters.push(difficulty.id);
				parameters.push(difficulty.name);
				parameters.push(difficulty.maxRating);
			}
			query = query.substring(0, query.length - 1) + ")";	// Remove trailing comma
			return new Operation(query, parameters);
		}, callback);
	};
	
	/**
	 * Updates difficulties in the database.
	 * @param difficulties the difficulties to update. Difficulties in the 
	 * database with the same IDs will be updated to match.
	 * @param callback a function to call after the difficulties are updated.
	 */
	this.updateDifficultiesAsync = function(difficulties, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query = "UPDATE difficulty SET ";
			
			query += "name = CASE id ";
			for (var i = 0; i < difficulties.length; i++) {
				var difficulty = difficulties[i];
				query += "WHEN ? THEN ? ";
				parameters.push(difficulty.id);
				parameters.push(difficulty.name);
			}
			query += "ELSE name END, ";
			
			query += "max_rating = CASE id ";
			for (var i = 0; i < difficulties.length; i++) {
				var difficulty = difficulties[i];
				query += "WHEN ? THEN ? ";
				parameters.push(difficulty.id);
				parameters.push(difficulty.maxRating);
			}
			query += "ELSE max_rating END ";
			
			query += "WHERE id IN (";
			for (var i = 0; i < difficulties.length; i++) {
				var difficulty = difficulties[i];
				query += "?,";
				parameters.push(difficulty.id);
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
	 * Removes difficulties from the database.
	 * @param difficulties the difficulties to remove. If not specified, all 
	 * difficulties are removed.
	 * @param callback a function to call after the difficulties are removed.
	 */
	this.deleteDifficultiesAsync = function(difficulties, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query;
			if (difficulties) {
				query = "DELETE FROM difficulty WHERE id IN (";
				for (var i = 0; i < difficulties.length; i++) {
					var difficulty = difficulties[i];
					query += "?,";
					parameters += difficulty.id;
				}
				query = query.substring(0, query.length - 1) + ")";	// Remove trailing comma
			} else {
				query = "TRUNCATE TABLE difficulty";
			}
			
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
	 * Reads the categories from the database.
	 * @param includeStandard whether to include standard categories.
	 * @param includeCustom whether to include custom categories.
	 * @param callback a function to call with the categories read.
	 */
	this.readCategoriesAsync = function(includeStandard, includeCustom, callback) {
		db.transaction(function(tx) {
			var query = "SELECT * FROM category WHERE 1=1 ";
			
			if (includeStandard && !includeCustom) {
				query += "AND is_custom = 0 ";
			} else if (includeCustom && !includeStandard) {
				query += "AND is_custom > 0 ";
			}
			
			query += "ORDER BY name";
			
			tx.executeSql(query, [], function(tx, res) {
				var categories = [];
				for (var i = 0; i < res.rows.length; i++) {
					var item = res.rows.item(i);
					var category = new Category(item.id, item.is_custom, item.name);
					categories.push(category);
				}
				callback(categories);
			}, function(tx, err) {
				_Log.error(err.message);
			});
		});
	};
	
	/**
	 * Adds categories to the database.
	 * @param categories the categories to add.
	 * @param callback a function to call after the categories are added.
	 */
	this.createCategoriesAsync = function(categories, callback) {
		chunkifyAsync(categories, function(chunk) {
			var parameters = [];
			var query = "INSERT INTO category (id, is_custom, name) VALUES ";
			for (var i = 0; i < chunk.length; i++) {
				var category = chunk[i];
				query += "(?, ?, ?),";
				parameters.push(category.id);
				parameters.push(category.isCustom? 1: 0);
				parameters.push(category.name);
			}
			query = query.substring(0, query.length - 1) + ")";	// Remove trailing comma
			return new Operation(query, parameters);
		}, callback);
	};
	
	/**
	 * Updates categories in the database.
	 * @param categories the categories to update. Categories in the database 
	 * with the same IDs will be updated to match.
	 * @param callback a function to call after the categories are updated.
	 */
	this.updateCategoriesAsync = function(categories, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var query = "UPDATE category SET ";
			
			query += "name = CASE id ";
			for (var i = 0; i < categories.length; i++) {
				var category = categories[i];
				query += "WHEN ? THEN ? ";
				parameters.push(category.id);
				parameters.push(category.name);
			}
			query += "ELSE name END ";
			
			query += "WHERE id IN (";
			for (var i = 0; i < categories.length; i++) {
				var category = categories[i];
				query += "?,";
				parameters.push(category.id);
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
	 * Removes categories from the database. Also removes any phrases from 
	 * those categories.
	 * @param categories the categories to remove. If not specified, all 
	 * categories are removed.
	 * @param callback a function to call after the categories are removed.
	 */
	this.deleteCategoriesAsync = function(categories, callback) {
		db.transaction(function(tx) {
			var parameters = [];
			var queryIds;
			if (categories) {
				var queryIds = "(";
				for (var i = 0; i < categories.length; i++) {
					var category = categories[i];
					queryIds += "?,";
					parameters += category.id;
				}
				queryIds = queryIds.substring(0, queryIds.length - 1) + ")";	// Remove trailing comma
			} else {
				queryIds = "(category_id)";
			}
			
			var query = "DELETE FROM phrase WHERE category_id IN " + queryIds;
			tx.executeSql(query, parameters, function(tx, res) {
				var query;
				if (categories) {
					query = "DELETE FROM category WHERE id IN " + queryIds;
				} else {
					query = "TRUNCATE TABLE category";
				}
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
	 * Reads settings from the database.
	 * @param callback a function to call with the settings read as an 
	 * associative array.
	 */
	this.readSettingsAsync = function(callback) {
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
	 * Updates the settings in the database to those provided.
	 * @param settings an associative array of settings to store in the 
	 * database, replacing the previous settings.
	 * @param callback a function to call after the settings are updated.
	 */
	this.updateSettingsAsync = function(settings, callback) {
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
