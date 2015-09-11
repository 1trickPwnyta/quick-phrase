function CategoryTool(categoryManager, customCategoryManager) {
	
	/**
	 * @return the standard and custom categories, sorted alphabetically.
	 */
	this.getCategories = function() {
		var categories = categoryManager.getCategories();
		var customCategories = customCategoryManager.getCustomCategories();
		
		var allCategories = [];
		for (var i = 0; i < categories.length; i++) {
			allCategories.push(categories[i]);
		}
		for (var i = 0; i < customCategories.length; i++) {
			allCategories.push(customCategories[i]);
		}
		allCategories.sort(function(a, b) {
			if (a.name < b.name) {
				return -1;
			} else if (a.name > b.name) {
				return 1;
			} else {
				return 0;
			}
		});
		
		return allCategories;
	};
	
	/**
	 * Searches the standard and custom categories for the category with the 
	 * specified ID.
	 * @return the category, or null if it isn't found.
	 */
	this.getCategoryById = function(id) {
		var category = categoryManager.getCategoryById(id);
		if (!category) {
			category = customCategoryManager.getCategoryById(id);
		}
		return category;
	}
	
}
