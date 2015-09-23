function DifficultyMenuItem(menu) {
	
	var difficultyMenuItem;
	var game = menu.getGame();
	
	var onchange = function() {
		var difficultyId = difficultyMenuItem.getValue();
		var settings = game.getSettings();
		settings.set(_Settings.KEY_DIFFICULTY_ID, difficultyId);
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	/**
	 * Constructor.
	 */
	{
		difficultyMenuItem = new SelectMenuItem(
				menu, 
				"menuItemDifficulty",
				onchange);
		return difficultyMenuItem;
	}
	
}
