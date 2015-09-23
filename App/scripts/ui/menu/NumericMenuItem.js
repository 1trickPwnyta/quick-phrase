{
	_NumericMenuItem = {
		
		/**
		 * Creates a DOM element for a new menu item.
		 * @param menu the menu.
		 * @param menuItemId the DOM element ID for the new menu item.
		 * @return the DOM element.
		 */
		createElement: function(menu, menuItemId) {
			var element = _MenuItem.createElement(menu, menuItemId);
			element.innerHTML = "<span class=\"menuItemName\"></span>: <span class=\"menuItemValue\"></span>";
			return element;
		}
		
	};
}

function NumericMenuItem(menu, menuItemId, minValue, maxValue, onclick, onincrease, ondecrease) {
	
	var element = document.getElementById(menuItemId);
	var valueElement = element.getElementsByClassName("menuItemValue")[0];
	var increaseElement = element.getElementsByClassName("menuItemIncrease")[0];
	var decreaseElement = element.getElementsByClassName("menuItemDecrease")[0];
	
	/**
	 * Sets the numeric value of the menu item.
	 * @param value the value.
	 */
	var setValue = function(value) {
		valueElement.innerHTML = _HtmlUtil.htmlEncode(value);
		increaseElement.disabled = value >= maxValue;
		decreaseElement.disabled = value <= minValue;
	};
	
	/**
	 * @return the current value.
	 */
	var getValue = function() {
		return valueElement.innerHTML;
	};
	
	var onincreaseWrapper = function(e) {
		e.stopPropagation();
		onincrease();
	};
	
	var ondecreaseWrapper = function(e) {
		e.stopPropagation();
		ondecrease();
	};
	
	/**
	 * Constructor.
	 */
	{
		increaseElement.onclick = onincreaseWrapper;
		decreaseElement.onclick = ondecreaseWrapper;
		var numericMenuItem = new MenuItem(menu, menuItemId, onclick);
		numericMenuItem.setValue = setValue;
		return numericMenuItem;
	}
}
