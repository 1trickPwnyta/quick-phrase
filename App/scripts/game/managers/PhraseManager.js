function PhraseManager(localDatabase) {
	
	var loaded = false;
	var phrases;
	
	/**
	 * Loads the standard phrases from the local database.
	 * @param callback a function to call when loading is complete.
	 */
	this.loadAsync = function(callback) {
		localDatabase.readPhrasesAsync(true, false, null, false, null, false, function(phrasesFromDatabase) {
			phrases = phrasesFromDatabase;
			loaded = true;
			_Log.info("Loaded " + phrases.length + " phrases from the local database.");
			
			if (callback) {
				callback();
			}
		});
	};
	
	/**
	 * Saves the standard phrases in the local database. After saving, if there 
	 * are too many phrases in the local database, half of them will be removed.
	 * @param callback a function to call after the operation is complete.
	 */
	this.saveAsync = function(callback) {
		if (loaded) {
			localDatabase.readPhrasesAsync(true, false, null, true, null, false, function(phrasesFromDatabase) {
				var toCreate = [], toUpdate = [], toDelete = [];
				_ArrayUtil.compare(phrasesFromWeb, phrasesFromDatabase, function(a, b) {
					return a.id == b.id;
				}, toCreate, toUpdate, toDelete);
				
				var operationsRemaining = 3;
				var checkIfFinished = function() {
					if (--operationsRemaining <= 0) {
						
						if (phrasesFromDatabase.length > MAX_LOCAL_TAGS) {
							var toDeleteRandomly = [];
							for (var i = 0; i < phrasesFromDatabase.length/2; i++) {
								toDeleteRandomly.push(phrasesFromDatabase[i]);
							}
							localDatabase.deletePhrasesAsync(toDeleteRandomly, function() {
								if (callback) {
									callback();
								}
							});
						} else if (callback) {
							callback();
						}
						
					}
				};
				localDatabase.createPhrasesAsync(toCreate, checkIfFinished);
				localDatabase.updatePhrasesAsync(toUpdate, checkIfFinished);
				localDatabase.deletePhrasesAsync(toDelete, checkIfFinished);
			});
		} else {
			_Log.error("Attempted to save phrases without loading first.");
		}
	};
	
	/**
	 * @return the standard phrases.
	 */
	this.getPhrases = function() {
		if (!loaded) {
			_Log.error("Attempted to get phrases without loading first.");
		}
		return phrases;
	};
	
	/**
	 * Loads a subset of standard phrases from the web service or local 
	 * database.
	 * @param settings the settings used to filter the phrases.
	 * @param quantity the number of phrases to load.
	 * @param callback a function to call with the phrases loaded.
	 */
	this.getPhraseSetAsync = function(settings, quantity, callback) {
		if (loaded) {
			localDatabase.readPhrasesAsync(true, false, settings, true, quantity, false, function(phrasesFromDatabase) {
				callback(phrasesFromDatabase);
			});
		} else {
			_Log.error("Attempted to get phrase set without loading first.");
		}
	};
	
	/**
	 * Counts the number of standard phrases from the web service or local 
	 * database that match the provided settings.
	 * @param settings the settings used to filter the phrases.
	 * @param callback a function to call with the phrase count.
	 */
	this.getPhrasesAvailable = function(settings, callback) {
		if (loaded) {
			localDatabase.readPhrasesAsync(true, false, settings, false, null, true, function(phraseCount) {
				callback(phraseCount);
			});
		} else {
			_Log.error("Attempted to get phrase count without loading first.");
		}
	};

	/**
	 * Checks if a standard phrase exists with the same category and text as 
	 * that provided.
	 * @param phrase the phrase to compare against.
	 * @return true if the phrase exists, false otherwise.
	 */
	this.phraseExists = function(phrase) {
		if (loaded) {
			for (var i = 0; i < phrases.length; i++) {
				if (_Phrase.textMatches(phrase.text, phrases[i].text)) {
					return true;
				}
			}
		} else {
			_Log.error("Attempted to get phrase without loading first.");
		}
		
		return false;
	};
	
}
