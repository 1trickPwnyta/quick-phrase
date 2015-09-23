function DifficultyMenuItem(menu) {
	
	var game = menu.getGame();
	
	var onchange = function(e) {
		var difficultyId = e.getMenuItem().getValue();
		var settings = game.getSettings();
		settings.set(_Settings.KEY_DIFFICULTY_ID, difficultyId);
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	/**
	 * Constructor.
	 */
	{
		return new SelectMenuItem(
				menu, 
				"menuItemDifficulty",
				onchange);
	}
	
}
