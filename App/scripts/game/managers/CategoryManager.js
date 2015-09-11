function CategoryManager(localDatabase) {
	
	var loaded = false;
	var categories;
	
	/**
	 * Loads the standard categories from the web service or local database.
	 * @param callback a function to call when loading is complete.
	 */
	this.loadAsync = function(callback) {
		localDatabase.readCategoriesAsync(true, false, function(categoriesFromDatabase) {
			categories = categoriesFromDatabase;
			loaded = true;
			_Log.info("Loaded " + categories.length + " categories from the local database.");
			
			if (callback) {
				callback();
			}
		});
	};
	
	/**
	 * Saves the standard categories in the local database.
	 * @param callback a function to call when saving is complete.
	 */
	this.saveAsync = function(callback) {
		if (loaded) {
			localDatabase.readCategoriesAsync(true, false, function(categoriesFromDatabase) {
				var toCreate = [], toUpdate = [], toDelete = [];
				_ArrayUtil.compare(categories, categoriesFromDatabase, function(a, b) {
					return a.id == b.id;
				}, toCreate, toUpdate, toDelete);
				
				var operationsRemaining = 3;
				var checkIfFinished = function() {
					if (--operationsRemaining <= 0 && callback) {
						callback();
					}
				};
				localDatabase.createCategoriesAsync(toCreate, checkIfFinished);
				localDatabase.updateCategoriesAsync(toUpdate, checkIfFinished);
				localDatabase.deleteCategoriesAsync(toDelete, checkIfFinished);
			});
		} else {
			_Log.error("Attempted to save categories without loading first.");
		}
	};
	
	/**
	 * @return the standard categories.
	 */
	this.getCategories = function() {
		if (!loaded) {
			_Log.error("Attempted to get categories without loading first.");
		}
		return categories;
	};
	
	/**
	 * Searches the standard categories for the category with the specified ID.
	 * @return the category, or null if it isn't found.
	 */
	this.getCategoryById = function(id) {
		if (loaded) {
			for (var i = 0; i < categories.length; i++) {
				var category = categories[i]
				if (category.id == id) {
					return category;
				}
			}
		} else {
			_Log.error("Attempted to get category without loading first.");
		}
		
		return null;
	}
	
}
