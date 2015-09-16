function NumericMenuItem(menu, menuItemId, minValue, maxValue) {
	
	var element = document.getElementById("menuItemWinningPoint");
	var nameElement = element.getElementsByClassName("menuItemName")[0];
	var valueElement = element.getElementsByClassName("menuItemValue")[0];
	var increaseElement = element.getElementsByClassName("menuItemIncrease")[0];
	var decreaseElement = element.getElementsByClassName("menuItemDecrease")[0];
	
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
		valueElement.innerHTML = _HtmlUtil.htmlEncode(value);
		increaseElement.disabled = value >= maxValue;
		decreaseElement.disabled = value <= minValue;
	};
	
}
