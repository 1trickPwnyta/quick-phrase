function CustomCategoryManager(localDatabase) {
	
	var loaded = false;
	var customCategories;
	
	/**
	 * Loads the custom categories from the local database.
	 * @param callback a function to call when loading is complete.
	 */
	this.loadAsync = function(callback) {
		localDatabase.readCategoriesAsync(false, true, function(customCategoriesFromDatabase) {
			customCategories = customCategoriesFromDatabase;
			loaded = true;
			_Log.info("Loaded " + customCategories.length + " custom categories from the local database.");
			
			if (callback) {
				callback();
			}
		});
	};
	
	/**
	 * Saves the custom categories in the local database.
	 * @param callback a function to call when saving is complete.
	 */
	this.saveAsync = function(callback) {
		if (loaded) {
			localDatabase.readCategoriesAsync(false, true, function(customCategoriesFromDatabase) {
				var toCreate = [], toUpdate = [], toDelete = [];
				_ArrayUtil.compare(customCategories, customCategoriesFromDatabase, function(a, b) {
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
			_Log.error("Attempted to save custom categories without loading first.");
		}
	};
	
	/**
	 * @return the custom categories.
	 */
	this.getCustomCategories = function() {
		if (!loaded) {
			_Log.error("Attempted to get custom categories without loading first.");
		}
		return customCategories;
	};
	
	/**
	 * Searches the custom categories for the category with the specified ID.
	 * @return the category, or null if it isn't found.
	 */
	this.getCustomCategoryById = function(id) {
		if (loaded) {
			for (var i = 0; i < customCategories.length; i++) {
				var customCategory = customCategories[i];
				if (customCategory.id == id) {
					return customCategory;
				}
			}
		} else {
			_Log.error("Attempted to get custom category without loading first.");
		}
		
		return null;
	}
	
	/**
	 * Cleans up custom categories by removing any that match a standard 
	 * category.
	 * @param standardCategories the standard categories to compare with.
	 * @return the custom categories that were removed. Any custom phrases in 
	 * removed custom categories will need to be migrated to the matching 
	 * standard category.
	 */
	this.cleanCustomCategories = function(standardCategories) {
		var removedCategories = [];
		
		if (loaded) {
			for (var i = 0; i < standardCategories.length; i++) {
				for (var j = 0; j < customCategories.length; j++) {
					if (_Phrase.textMatches(standardCategories[i].name, customCategories[j].name)) {
						removedCategories.push(customCategories[j]);
						customCategories.splice(j--, 1);
					}
				}
			}
		} else {
			_Log.error("Attempted to clean custom categories without loading first.");
		}
		
		return removedCategories;
	};
	
}
