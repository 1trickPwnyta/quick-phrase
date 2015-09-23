function SelectMenuItem(menu, menuItemId, onchange) {
	
	var element = document.getElementById(menuItemId);
	var valueElement = element.getElementsByClassName("menuItemValue")[0];
	
	/**
	 * Sets the select value of the menu item.
	 * @param value the value.
	 */
	var setValue = function(value) {
		valueElement.value = value;
	};
	
	/**
	 * @return the currently selected value.
	 */
	var getValue = function() {
		return valueElement.value;
	};
	
	var onchangeWrapper = function(e) {
		_UiUtil.playSound(CLICK_SOUND_FILE);
		e.getMenuItem = function() {
			return this;
		};
		onchange(e);
	};
	
	/**
	 * Constructor.
	 */
	{
		element.onchange = onchangeWrapper;
		var selectMenuItem = new MenuItem(menu, menuItemId);
		selectMenuItem.setValue = setValue;
		return selectMenuItem;
	}
	
}
