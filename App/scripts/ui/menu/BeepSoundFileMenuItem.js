function BeepSoundFileMenuItem(menu) {
	
	var game = menu.getGame();
	
	var onchange = function(e) {
		var beepSoundFile = e.getMenuItem().getValue();
		_UiUtil.playSound(beepSoundFile);
		var settings = game.getSettings();
		settings.set(_Settings.KEY_BEEP_SOUND_FILE, beepSoundFile);
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	/**
	 * Constructor.
	 */
	{
		return new SelectMenuItem(
				menu,
				"menuItemBeepSoundFile",
				onchange);
	}
	
}
