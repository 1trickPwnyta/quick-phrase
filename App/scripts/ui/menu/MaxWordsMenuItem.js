function MaxWordsMenuItem(menu) {

	var game = menu.getGame();
	
	var onclick = function() {
		var settings = game.getSettings();
		var maxWordsPerPhrase = settings.get(_Settings.KEY_MAX_WORDS_PER_PHRASE, DEFAULT_MAX_WORDS_PER_PHRASE);
		
		dialog.getNumber(null, "How many words? (Use 0 for unlimited)", maxWordsPerPhrase, null, function(response) {
			_UiUtil.playSound(CLICK_SOUND_FILE);
			if (response || response === 0) {
				maxWordsPerPhrase = parseInt(response);
				if (maxWordsPerPhrase != 0 && maxWordsPerPhrase < 1) {
					dialog.showMessage("Phrases must contain at least one word.");
					return false;
				}
				if (maxWordsPerPhrase > MAX_MAX_WORDS) {
					dialog.showMessage("You can't limit it to more than " + MAX_MAX_WORDS + " words.");
					return false;
				}
				settings.set(_Settings.KEY_MAX_WORDS_PER_PHRASE, maxWordsPerPhrase);
				settings.saveAsync(game.getLocalDatabase());
				menu.load();
				return true;
			}
		});
	};
	
	var onincrease = function() {
		var settings = game.getSettings();
		var maxWordsPerPhrase = settings.get(_Settings.KEY_MAX_WORDS_PER_PHRASE, DEFAULT_MAX_WORDS_PER_PHRASE);
		settings.set(_Settings.KEY_MAX_WORDS_PER_PHRASE, maxWordsPerPhrase + 1);
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	var ondecrease = function() {
		var settings = game.getSettings();
		var maxWordsPerPhrase = settings.get(_Settings.KEY_MAX_WORDS_PER_PHRASE, DEFAULT_MAX_WORDS_PER_PHRASE);
		settings.set(_Settings.KEY_MAX_WORDS_PER_PHRASE, maxWordsPerPhrase - 1);
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	/**
	 * Constructor.
	 */
	{
		return new NumericMenuItem(
				menu,
				"menuItemMaxWords",
				0, 
				MAX_MAX_WORDS_PER_PHRASE,
				onclick,
				onincrease,
				ondecrease);
	}
	
}
