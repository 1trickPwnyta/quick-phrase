function CategoriesMenuItem(menu) {
	
	var onclick = function() {
		// TODO submit "/menu/categories"
		// TODO showCategories();
	};
	
	/**
	 * Constructor.
	 */
	{
		return new GenericMenuItem(
				menu,
				"menuItemCategoryIds",
				onclick);
	}
	
}
