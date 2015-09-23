function MaxCharactersMenuItem(menu) {

	var game = menu.getGame();
	
	var onclick = function() {
		var settings = game.getSettings();
		var maxCharactersPerPhrase = settings.get(_Settings.KEY_MAX_CHARACTERS_PER_PHRASE, DEFAULT_MAX_CHARACTERS_PER_PHRASE);
		
		dialog.getNumber(null, "How many characters? (Use 0 for unlimited)", maxCharactersPerPhrase, null, function(response) {
			_UiUtil.playSound(CLICK_SOUND_FILE);
			if (response || response === 0) {
				maxCharactersPerPhrase = parseInt(response);
				if (maxCharactersPerPhrase != 0 && maxCharactersPerPhrase < MIN_MAX_CHARACTERS) {
					dialog.showMessage("Use at least " + MIN_MAX_CHARACTERS + " characters.");
					return false;
				} else {
					settings.set(_Settings.KEY_MAX_CHARACTERS_PER_PHRASE, maxCharactersPerPhrase);
					settings.saveAsync(game.getLocalDatabase());
					menu.load();
					return true;
				}
			}
		});
	};
	
	var onincrease = function() {
		var settings = game.getSettings();
		var maxCharactersPerPhrase = settings.get(_Settings.KEY_MAX_CHARACTERS_PER_PHRASE, DEFAULT_MAX_CHARACTERS_PER_PHRASE);
		if (maxCharactersPerPhrase == 0) {
			settings.set(_Settings.KEY_MAX_CHARACTERS_PER_PHRASE, MIN_MAX_CHARACTERS);
		} else {
			settings.set(_Settings.KEY_MAX_CHARACTERS_PER_PHRASE, maxCharactersPerPhrase + 1);
		}
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	var ondecrease = function() {
		var settings = game.getSettings();
		var maxCharactersPerPhrase = settings.get(_Settings.KEY_MAX_CHARACTERS_PER_PHRASE, DEFAULT_MAX_CHARACTERS_PER_PHRASE);
		if (maxCharactersPerPhrase <= MIN_MAX_CHARACTERS) {
			settings.set(_Settings.KEY_MAX_CHARACTERS_PER_PHRASE, 0);
		} else {
			settings.set(_Settings.KEY_MAX_CHARACTERS_PER_PHRASE, maxCharactersPerPhrase - 1);
		}
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	/**
	 * Constructor.
	 */
	{
		return new NumericMenuItem(
				menu,
				"menuItemMaxCharacters");
	}
	
}
