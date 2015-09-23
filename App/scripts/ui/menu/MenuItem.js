{
	_MenuItem = {
		
		/**
		 * Creates a DOM element for a new menu item.
		 * @param menu the menu.
		 * @param menuItemId the DOM element ID for the new menu item.
		 * @return the DOM element.
		 */
		createElement: function(menu, menuItemId) {
			var element = document.createElement("div");
			element.id = menuItemId;
			element.className = "menuItem";
			element.innerHTML = "<span class=\"menuItemName\"></span>";
			return element;
		}
		
	};
}

function MenuItem(menu, menuItemId, onclick) {
	
	var element = document.getElementById(menuItemId);
	var nameElement = element.getElementsByClassName("menuItemName")[0];
	
	/**
	 * Sets the name of the menu item, which appears as the visible text in the 
	 * menu.
	 * @param name the name.
	 */
	this.setName = function(name) {
		nameElement.innerHTML = _HtmlUtil.htmlEncode(name);
	};
	
	/**
	 * @return the DOM element of the menu item.
	 */
	this.getElement = function() {
		return element;
	};
	
	var onclickWrapper = function(e) {
		_UiUtil.playSound(CLICK_SOUND_FILE);
		e.getMenuItem = function() {
			return this;
		};
		onclick(e);
	};
	
	/**
	 * Constructor.
	 */
	{
		element.onclick = onclickWrapper;
	}
	
}
