//
// Injects custom phrases into a phrase load.
//
function injectCustomPhrases(phraseLoad, phrasesAvailable, callback) {
	loadCustomPhrasesFromLocalDatabase(function(customPhrases) {
		for (var i = 0; i < customPhrases.length; i++) {
			if (Math.random() * phrasesAvailable < phraseLoad.length) {
				var randomIndex = parseInt(Math.random() * phraseLoad.length);
				phraseLoad.splice(randomIndex, 0, customPhrases[i]);
			}
		}
		
		if (callback) {
			callback();
		}
	});
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
	showStandardDialog(div, null, false, "Custom phrases", null, "inherit", true);
}
