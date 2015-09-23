function CheckBoxMenuItem(menu, menuItemId) {
	
	var element = document.getElementById(menuItemId);
	var valueElement = element.getElementsByClassName("menuItemValue")[0];
	
	/**
	 * Sets the boolean value of the menu item.
	 * @param value the value.
	 */
	var setValue = function(value) {
		valueElement.checked = value;
	};
	
	/**
	 * @return the current value.
	 */
	var getValue = function() {
		return valueElement.checked;
	};
	
	/**
	 * Constructor.
	 */
	{
		var checkBoxMenuItem = new MenuItem(menu, menuItemId);
		checkBoxMenuItem.setValue = setValue;
		return checkBoxMenuItem;
	}
	
}