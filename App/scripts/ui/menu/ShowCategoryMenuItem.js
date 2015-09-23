function ShowCategoryMenuItem(menu) {
	
	var game = menu.getGame();
	
	var onchange = function(e) {
		var showCategory = e.getMenuItem().getValue();
		settings.set(_Settings.KEY_SHOW_CATEGORY, showCategory);
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	/**
	 * Constructor.
	 */
	{
		return new CheckBoxMenuItem(
				menu,
				"menuItemShowCategoryCheckBox",
				onchange);
	}
	
}
