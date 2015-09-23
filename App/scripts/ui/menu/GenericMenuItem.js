function GenericMenuItem(menu, menuItemId, onclick) {
	
	var element = document.getElementById(menuItemId);
	var valueElement = element.getElementsByClassName("menuItemValue")[0];
	
	/**
	 * Sets the value of the menu item.
	 * @param value the value.
	 */
	var setValue = function(value) {
		valueElement.innerHTML = _HtmlUtil.htmlEncode(value);
	};
	
	/**
	 * Constructor.
	 */
	{
		var genericMenuItem = new MenuItem(menu, menuItemId, onclick);
		genericMenuItem.setValue = setValue;
		return genericMenuItem;
	}
	
}
