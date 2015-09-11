function PhraseTool(phraseManager, customPhraseManager) {
	
	/**
	 * Checks if a standard or custom phrase exists with the same category and 
	 * text as that provided.
	 * @param phrase the phrase to compare against.
	 * @return true if the phrase exists, false otherwise.
	 */
	this.phraseExists = function(phrase) {
		return phraseManager.phraseExists(phrase) || customPhraseManager.customPhraseExists(phrase);
	};
	
	/**
	 * Searches for standard and custom phrases based on settings.
	 * @param settings the settings used to search for phrases.
	 * @param minimumQuantity the minimum number of phrases to find.
	 * @param callback a function to call with the phrases found.
	 */
	this.getMixedPhraseSetAsync = function(settings, minimumQuantity, callback) {
		var phraseSet;
		var standardPhrasesAvailable;
		var customPhrases;
		
		var phraseSetsRemaining = 3;
		var checkIfFinished = function() {
			if (--phraseSetsRemaining <= 0) {
				
				var originalPhraseSetSize = phraseSet.length;
				for (var i = 0; i < customPhrases.length; i++) {
					if (Math.random() * standardPhrasesAvailable < originalPhraseSetSize || (originalPhraseSetSize == 0 && standardPhrasesAvailable == 0)) {
						var randomIndex = parseInt(Math.random() * (phraseSet.length + 1));
						phraseSet.splice(randomIndex, 0, customPhrases[i]);
					}
				}
				callback(phraseSet);
				
			}
		};
		
		phraseManager.getPhrasesAvailable(settings, function(phraseCount) {
			standardPhrasesAvailable = phraseCount;
			checkIfFinished();
		});
		phraseManager.getPhraseSetAsync(settings, minimumQuantity, function(phrases) {
			phraseSet = phrases;
			checkIfFinished();
		});
		customPhraseManager.getCustomPhraseSetAsync(settings, function(phrases) {
			customPhrases = phrases;
			checkIfFinished();
		});
	};
	
}
