function VibrateMenuItem(menu) {
	
	var game = menu.getGame();
	
	var onchange = function(e) {
		var vibrate = e.getMenuItem().getValue();
		if (vibrate) {
			_UiUtil.vibrate(VIBRATION_DURATION);
		}
		settings.set(_Settings.KEY_VIBRATE, vibrate);
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	/**
	 * Constructor.
	 */
	{
		return new CheckBoxMenuItem(
				menu,
				"menuItemVibrateCheckBox",
				onchange);
	}
	
}
