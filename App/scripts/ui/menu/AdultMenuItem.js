function AdultMenuItem(menu) {
	
	var game = menu.getGame();
	
	var onchange = function(e) {
		var adult = e.getMenuItem().getValue();
		if (adult) {
			_UiUtil.showStandardDialog(EDGY_AGREEMENT_TEXT, "Adult-Only Phrases", "I Agree", false, null, function(iagree) {
				if (iagree) {
					settings.set(_Settings.KEY_ADULT, true);
				}
				settings.saveAsync(game.getLocalDatabase());
				menu.load();
			});
		} else {
			settings.set(_Settings.KEY_ADULT, false);
			settings.saveAsync(game.getLocalDatabase());
			menu.load();
		}
	};
	
	/**
	 * Constructor.
	 */
	{
		return new CheckBoxMenuItem(
				menu,
				"menuItemEdgyCheckBox",
				onchange);
	}
	
}
