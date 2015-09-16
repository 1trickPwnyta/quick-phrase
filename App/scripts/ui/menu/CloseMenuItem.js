function CloseMenuItem(menu) {
	
	var element = document.getElementById("menuItemClose");
	
	/**
	 * Closes the menu when the close menu item is clicked.
	 */
	var onclick = function() {
		_UiUtil.playSound(CLICK_SOUND_FILE);
		menu.hide();
	};
	
	/**
	 * Constructor.
	 */
	{
		element.onclick = onclick;
	}
	
}
