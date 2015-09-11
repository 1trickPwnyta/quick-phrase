function CategoryManager() {
	
	var categories;
	var customCategories;
	
	/**
	 * Loads the categories from the web service and/or local database.
	 * @param localDatabase the local database.
	 * @param callback a function to call when loading is complete.
	 */
	this.loadAsync = function(localDatabase, callback) {
		var loadsRemaining = 2;
		
		localDatabase.readCategoriesAsync(true, false, function(categoriesFromDatabase) {
			categories = categoriesFromDatabase;
			if (--loadsRemaining <= 0 && callback) {
				callback();
			}
		});
		
		localDatabase.readCategoriesAsync(false, true, function(customCategoriesFromDatabase) {
			customCategories = customCategoriesFromDatabase;
			if (--loadsRemaining <= 0 && callback) {
				callback();
			}
		});
	};
	
	/**
	 * Saves the categories in the local database.
	 * @param localDatabase the local database.
	 * @param callback a function to call when saving is complete.
	 */
	this.saveAsync = function(localDatabase, callback) {
		var allCategories = [];
		for (var i = 0; i < categories.length; i++) {
			allCategories.push(categories[i]);
		}
		for (var i = 0; i < customCategories.length; i++) {
			allCategories.push(customCategories[i]);
		}
		
		localDatabase.readCategoriesAsync(true, true, function(categoriesFromDatabase) {
			var toCreate = [], toUpdate = [], toDelete = [];
			_ArrayUtil.compare(allCategories, categoriesFromDatabase, function(a, b) {
				return a.id == b.id;
			}, toCreate, toUpdate, toDelete);
			
			var operationsRemaining = 3;
			var checkIfFinished = function() {
				if (--operationsRemaining <= 0 && callback) {
					if (--savesRemaining <= 0) {
						callback();
					}
				}
			};
			localDatabase.createCategoriesAsync(toCreate, checkIfFinished);
			localDatabase.updateCategoriesAsync(toUpdate, checkIfFinished);
			localDatabase.deleteCategoriesAsync(toDelete, checkIfFinished);
		});
	};
	
	/**
	 * @return the standard categories.
	 */
	this.getStandardCategories = function() {
		return categories;
	};
	
	/**
	 * @return the custom categories.
	 */
	this.getCustomCategories = function() {
		return customCategories;
	};
	
	/**
	 * Cleans up custom categories by removing any that match a standard 
	 * category. Any custom phrases in removed custom categories are migrated 
	 * to the matching standard category.
	 * @param standardCategories the standard categories to compare against.
	 */
	this.cleanCustomCategories = function(standardCategories) {
		// TODO
	};
	
}

//
//Deletes custom categories from the local database that are duplicated by the categories from the web service.
//Migrates all custom phrases in the custom category to the new category.
//
function cleanCustomCategories(nonCustomCategories, customCategories) {
	for (var i = 1; i < nonCustomCategories.length; i++) {
		for (var j = 0; j < customCategories.length; j++) {
			if (nonCustomCategories[i].name.trim().toLowerCase() == customCategories[j].name.trim().toLowerCase()) {
				(function(newCategoryId, oldCategoryId) {
					loadAllCustomPhrasesFromLocalDatabase(oldCategoryId, true, function(customPhrases) {
						for (var k = 0; k < customPhrases.length; k++) {
							deleteCustomPhraseFromLocalDatabase(customPhrases[k].rowid);
							saveCustomPhraseInLocalDatabase(customPhrases[k].text, newCategoryId, false);
						}
						deleteCustomCategoryFromLocalDatabase(oldCategoryId, loadCustomCategories);
					});
				})(nonCustomCategories[i].id, customCategories[j].id);
			}
		}
	}
}
