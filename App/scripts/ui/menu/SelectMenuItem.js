function SelectMenuItem(menu, menuItemId) {
	
	var element = document.getElementById(menuItemId);
	var nameElement = element.getElementsByClassName("menuItemName")[0];
	var valueElement = element.getElementsByClassName("menuItemValue")[0];
	
	/**
	 * Sets the name of the menu item, which appears as the visible text in the 
	 * menu.
	 * @param name the name.
	 */
	this.setName = function(name) {
		nameElement.innerHTML = _HtmlUtil.htmlEncode(name);
	};
	
	/**
	 * Sets the value of the menu item.
	 * @param value the value.
	 */
	this.setValue = function(value) {
		valueElement.value = value;
	};
	
}
