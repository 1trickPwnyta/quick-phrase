//
// Injects custom phrases into a phrase load.
//
function injectCustomPhrases(phraseLoad, phrasesAvailable, callback) {
	var originalPhraseLoadSize = phraseLoad.length;
	loadCustomPhrasesFromLocalDatabase(function(customPhrases) {
		for (var i = 0; i < customPhrases.length; i++) {
			if (Math.random() * phrasesAvailable < originalPhraseLoadSize || (originalPhraseLoadSize == 0 && phrasesAvailable == 0)) {
				var randomIndex = parseInt(Math.random() * (phraseLoad.length + 1));
				phraseLoad.splice(randomIndex, 0, customPhrases[i]);
			}
		}
		
		if (callback) {
			callback();
		}
	});
}

//
// Deletes custom phrases from the local database that are duplicated by the phrase load from the web service.
//
function cleanCustomPhrases(phraseLoad) {
	loadAllCustomPhrasesFromLocalDatabase(null, null, function(customPhrases) {
		for (var i = 0; i < phraseLoad.length; i++) {
			for (var j = 0; j < customPhrases.length; j++) {
				if (phraseLoad[i].category_id == customPhrases[j].category_id && !customPhrases[j].is_custom_category) {
					if (phraseLoad[i].text.trim().toLowerCase() == customPhrases[j].text.trim().toLowerCase()) {
						deleteCustomPhraseFromLocalDatabase(customPhrases[j].rowid);
					}
				}
			}
		}
	});
}

//
// Deletes custom categories from the local database that are duplicated by the categories from the web service.
// Migrates all custom phrases in the custom category to the new category.
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
				// If the custom category was selected, select the new category instead
				var sCustomCategoryIdsIndex = sCustomCategoryIds.indexOf(customCategories[j].id);
				if (sCustomCategoryIdsIndex >= 0) {
					var newCategories = new Array();
					for (var k = 1; k < nonCustomCategories.length; k++) {
						if (sCategoryIds.indexOf(nonCustomCategories[k].id) >= 0)
							newCategories.push(nonCustomCategories[k]);
					}
					for (var k = 0; k < customCategories.length; k++) {
						if (k == j) continue;
						if (sCustomCategoryIds.indexOf(customCategories[k].id) >= 0)
							newCategories.push(customCategories[k]);
					}
					newCategories.push(nonCustomCategories[i]);
					changeCategories(newCategories);
				}
			}
		}
	}
}

//
//Inserts custom categories into the local database for categories deleted from 
//the web service, if any custom phrases were added.
//Migrates all custom phrases in the deleted category to the new custom category.
//
function uncleanCustomCategories(deletedCategories, callback) {
	var categoriesProcessed = 0;
	for (var i = 0; i < deletedCategories.length; i++) {
		(function(i) {
			loadAllCustomPhrasesFromLocalDatabase(deletedCategories[i].id, false, function(customPhrases) {
				if (customPhrases.length > 0) {
					saveCustomCategoryInLocalDatabase(deletedCategories[i].name, function(customCategoryId) {
						for (var j = 0; j < customPhrases.length; j++) {
							deleteCustomPhraseFromLocalDatabase(customPhrases[j].rowid);
							saveCustomPhraseInLocalDatabase(customPhrases[j].text, customCategoryId, true);
						}
						// If the category was selected, select the new custom category instead
						var sCategoryIdsIndex = sCategoryIds.indexOf(deletedCategories[i].id);
						if (sCategoryIdsIndex >= 0) {
							var newCategories = new Array();
							for (var j = 1; j < categories.length; j++) {
								if (categories[j].id == deletedCategories[i].id && !categories[j].isCustom) continue;
								if (!categories[j].isCustom) {
									if (sCategoryIds.indexOf(categories[j].id) >= 0)
										newCategories.push(categories[j]);
								} else {
									if (sCustomCategoryIds.indexOf(categories[j].id) >= 0)
										newCategories.push(categories[j]);
								}
							}
							newCategories.push({id: customCategoryId, name: deletedCategories[i].name, isCustom: true});
							changeCategories(newCategories);
						}
						if (callback && ++categoriesProcessed == deletedCategories.length) {
							callback();
						}
					});
				} else {
					categoriesProcessed++;
				}
			});
		})(i);
	}
	if (callback && categoriesProcessed == deletedCategories.length) {
		callback();
	}
}

//
// Shows the custom phrases window.
//
function showCustomPhrases() {
	var categoryId;
	var isCustomCategory;
	
	playSound(CLICK_SOUND_FILE);
	var div = document.createElement("div");
	div.style.width = "100%";
	div.style.height = "100%";
	
	var updatePhrases = function(selectedCategoryId, selectedCategoryIsCustom) {
		div.innerHTML = "";
		
		if (selectedCategoryId || selectedCategoryId === 0) {
			categoryId = selectedCategoryId;
			isCustomCategory = selectedCategoryIsCustom;
		} else {
			categoryId = categories[1].id;
			isCustomCategory = categories[1].isCustom;
		}
		
		// Create category menu
		var categoryMenu = document.createElement("select");
		categoryMenu.className = "customPhrasesCategoryMenu";
		categoryMenu.onchange = function() {
			categoryId = parseInt(this.value.split("_")[0]);
			isCustomCategory = this.options[this.selectedIndex].isCustomCategory;
			updatePhrases(categoryId, isCustomCategory);
		};
		for (var i = 1; i < categories.length; i++) {
			var categoryOption = document.createElement("option");
			categoryOption.value = categories[i].id + "_" + categories[i].isCustom;
			categoryOption.isCustomCategory = categories[i].isCustom;
			categoryOption.innerHTML = htmlEncode(categories[i].name);
			if (selectedCategoryId == categories[i].id && categories[i].isCustom == selectedCategoryIsCustom) {
				categoryOption.selected = true;
			}
			categoryMenu.appendChild(categoryOption);
		}
		div.appendChild(categoryMenu);
		
		// Function to show new category dialog
		var newCategoryDialog = function(defaultText) {
			// Get input from user
			dialog.getString(function(response) {
				if (response) {
					checkIfCategoryExistsInLocalDatabase(response, function(categoryExists) {
						if (categoryExists) {
							dialog.showMessage("This category is already in the game.", function() {
								newCategoryDialog(response);
							});
						} else {
							saveCustomCategoryInLocalDatabase(response, function(newCategoryId) {
								loadCustomCategories(function() {
									updatePhrases(newCategoryId, true);
								});
							});
						}
					});
				}
			}, "New category", defaultText? defaultText: "", null, function(response) {
				playSound(CLICK_SOUND_FILE);
				
				if (response) {
					// Validate input
					if (response.length > MAX_CUSTOM_CATEGORY_CHARACTERS) {
						dialog.showMessage("No more than " + MAX_CUSTOM_CATEGORY_CHARACTERS + " characters are allowed.");
						return false;
					}
				}
			});
		};
		
		// Create new category button
		var newCategoryButton = document.createElement("a");
		newCategoryButton.className = "newCategoryButton";
		newCategoryButton.href = "#";
		newCategoryButton.onclick = function() {
			playSound(CLICK_SOUND_FILE);
			newCategoryDialog();
		};
		newCategoryButton.innerHTML = "<img src=\"images/create.png\" title=\"New\" alt=\"+\" />";
		div.appendChild(newCategoryButton);
		
		// Delete custom category button
		if (isCustomCategory) {
			var deleteCategoryButton = document.createElement("a");
			deleteCategoryButton.className = "deleteCategoryButton";
			deleteCategoryButton.href = "#";
			deleteCategoryButton.onclick = function() {
				playSound(CLICK_SOUND_FILE);
				// Get input from user
				dialog.confirm(function(response) {
					if (response) {
						deleteCustomCategoryFromLocalDatabase(categoryId, function() {
							// If the custom category was selected, unselect it
							var sCustomCategoryIdsIndex = sCustomCategoryIds.indexOf(categoryId);
							if (sCustomCategoryIdsIndex >= 0) {
								var newCategories = new Array();
								for (var i = 1; i < categories.length; i++) {
									if (categories[i].id == categoryId && categories[i].isCustom) continue;
									if (!categories[i].isCustom) {
										if (sCategoryIds.indexOf(categories[i].id) >= 0)
											newCategories.push(categories[i]);
									} else {
										if (sCustomCategoryIds.indexOf(categories[i].id) >= 0)
											newCategories.push(categories[i]);
									}
								}
								// If no categories are selected, select all
								if (newCategories.length == 0) {
									for (var i = 1; i < categories.length; i++) {
										newCategories.push(categories[i]);
									}
								}
								changeCategories(newCategories);
							}
							
							loadCustomCategories(updatePhrases);
						});
					}
				}, "Do you want to delete " + categoryMenu.options[categoryMenu.selectedIndex].innerHTML + "? All phrases in this category will also be deleted.", function() {playSound(CLICK_SOUND_FILE);});
			};
			deleteCategoryButton.innerHTML = "<img src=\"images/delete.png\" title=\"Delete\" alt=\"X\" />";
			div.appendChild(deleteCategoryButton);
		}
		
		div.appendChild(document.createElement("br"));
	
		// Function to show new phrase dialog
		var newPhraseDialog = function(defaultText) {
			// Get input from user
			dialog.getString(function(response) {
				if (response) {
					checkIfPhraseExistsInLocalDatabase(response, function(phraseExists) {
						if (phraseExists) {
							dialog.showMessage("This phrase is already in the game.", function() {
								newPhraseDialog(response);
							});
						} else {
							saveCustomPhraseInLocalDatabase(response, categoryId, isCustomCategory, function() {
								updatePhrases(categoryId, isCustomCategory);
							});
							submitPhrase(response, categoryId, isCustomCategory);
						}
					});
				}
			}, "New phrase", defaultText? defaultText: "", null, function(response) {
				playSound(CLICK_SOUND_FILE);
				
				if (response) {
					// Validate input
					if (response.length > MAX_CUSTOM_PHRASE_CHARACTERS) {
						dialog.showMessage("No more than " + MAX_CUSTOM_PHRASE_CHARACTERS + " characters are allowed.");
						return false;
					}
				}
			});
		};
		
		// Create a button for new custom phrases
		var newPhraseButton = document.createElement("input");
		newPhraseButton.type = "button";
		newPhraseButton.value = "New phrase";
		newPhraseButton.onclick = function() {
			playSound(CLICK_SOUND_FILE);
			newPhraseDialog();
		};
		div.appendChild(newPhraseButton);
		
		var phraseDiv = document.createElement("div");
		phraseDiv.className = "customPhrases";
		div.appendChild(phraseDiv);
		
		// Create row for each custom phrase
		loadAllCustomPhrasesFromLocalDatabase(categoryId, isCustomCategory, function (customPhrases) {
			for (var i = 0; i < customPhrases.length; i++) {
				var row = document.createElement("div");
				row.className = "phrase";
				
				var deleteButton = document.createElement("a");
				deleteButton.className = "deletePhrase";
				deleteButton.href = "#";
				deleteButton.rowid = customPhrases[i].rowid;
				deleteButton.onclick = function() {
					playSound(CLICK_SOUND_FILE);
					deleteCustomPhraseFromLocalDatabase(this.rowid, function() {
						updatePhrases(categoryId, isCustomCategory);
					});
				};
				deleteButton.innerHTML = "<img src=\"images/delete.png\" title=\"Delete\" alt=\"X\" />";
				row.appendChild(deleteButton);
				
				var phraseTextSpan = document.createElement("span");
				phraseTextSpan.className = "phraseText";
				phraseTextSpan.innerHTML = htmlEncode(customPhrases[i].text);
				row.appendChild(phraseTextSpan);
				
				phraseDiv.appendChild(row);
			}
		});
	};
	
	updatePhrases(categoryId, isCustomCategory);
	showStandardDialog(div, function() {
		// Load new phrases with the new custom phrases
		showLoadingScreen();
		loadTags(true, showReadyScreen);
		showMenu();
	}, false, "Custom phrases", null, "inherit", true);
}
