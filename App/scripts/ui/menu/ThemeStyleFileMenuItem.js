function ThemeStyleFileMenuItem(menu) {
	
	var game = menu.getGame();
	
	var onchange = function(e) {
		var themeStyleFile = e.getMenuItem().getValue();
		_UiUtil.changeTheme(themeStyleFile);
		var settings = game.getSettings();
		settings.set(_Settings.KEY_THEME_STYLE_FILE, themeStyleFile);
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	/**
	 * Constructor.
	 */
	{
		return new SelectMenuItem(
				menu,
				"menuItemTheme",
				onchange);
	}
	
}
