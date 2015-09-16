function CustomPhrasesMenuItem(menu) {
	
	var element = document.getElementById("menuItemCustomPhrases");
	
	/**
	 * Shows the custom phrases dialog when the custom phrases menu item is 
	 * clicked.
	 */
	var onclick = function() {
		_UiUtil.playSound(CLICK_SOUND_FILE);
		// TODO submit "/menu/customPhrases"
		// TODO showCustomPhrases();
	};
	
	/**
	 * Constructor.
	 */
	{
		element.onclick = onclick;
	}
	
}
