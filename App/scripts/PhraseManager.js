function PhraseManager() {
	
	var phrases;
	var customPhrases;
	
	/**
	 * Loads the standard and custom phrases from the web service and/or local 
	 * database.
	 * @param localDatabase the local database.
	 * @param callback a function to call when loading is complete.
	 */
	this.loadAsync = function(localDatabase, callback) {
		var loadsRemaining = 2;
		
		localDatabase.readPhrasesAsync(true, false, null, false, null, false, function(phrasesFromDatabase) {
			phrases = phrasesFromDatabase;
			if (--loadsRemaining <= 0 && callback) {
				callback();
			}
		});
		
		localDatabase.readPhrasesAsync(false, true, null, false, null, false, function(customPhrasesFromDatabase) {
			customPhrases = customPhrasesFromDatabase;
			if (--loadsRemaining <= 0 && callback) {
				callback();
			}
		});
	};
	
	/**
	 * Saves the standard and custom phrases to the local database.
	 * @param localDatabase the local database.
	 * @param callback a function to call when saving is complete.
	 */
	this.saveAsync = function(localDatabase, callback) {
		var allPhrases = [];
		for (var i = 0; i < phrases.length; i++) {
			allPhrases.push(phrases[i]);
		}
		for (var i = 0; i < customPhrases.length; i++) {
			allPhrases.push(customPhrases[i]);
		}
		
		localDatabase.readPhrasesAsync(true, true, function(phrasesFromDatabase) {
			var toCreate = [], toUpdate = [], toDelete = [];
			_ArrayUtil.compare(allPhrases, phrasesFromDatabase, function(a, b) {
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
			localDatabase.createPhrasesAsync(toCreate, checkIfFinished);
			localDatabase.updatePhrasesAsync(toUpdate, checkIfFinished);
			localDatabase.deletePhrasesAsync(toDelete, checkIfFinished);
		});
	};
	
	/**
	 * Checks if a standard or custom phrase exists with the same category and 
	 * text as that provided.
	 * @param phrase the phrase to compare against.
	 * @return true if the phrase exists, false otherwise.
	 */
	this.phraseExists = function(phrase) {
		for (var i = 0; i < phrases.length; i++) {
			if (_Phrase.textMatches(phrase.text, phrases[i].text)) {
				return true;
			}
		}
		for (var i = 0; i < customPhrases.length; i++) {
			if (_Phrase.textMatches(phrase.text, customPhrases[i].text)) {
				return true;
			}
		}
		return false;
	};
	
	/**
	 * Injects custom phrases into a set of phrases at the specified rate.
	 * @param phrases the set of phrases to inject custom phrases into.
	 * @param rate a value between 0 and 1 indicating the chance for any given 
	 * custom phrase to be injected somewhere into the set of phrases.
	 */
	this.injectCustomPhrases = function(phrases, rate) { // TODO This needs to be redone
		var originalPhrasesSize = phrases.length;
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
	};
	
	/**
	 * Cleans up custom phrases by removing any that match a standard phrase.
	 */
	this.cleanCustomPhrases = function() {
		for (var i = 0; i < phrases.length; i++) {
			for (var j = 0; j < customPhrases.length; j++) {
				var phrase = phrases[i];
				var customPhrase = customPhrases[j];
				if (phrase.categoryId == customPhrase.categoryId && 
						_Phrase.textMatches(customPhrase.text, phrase.text)) {
					customPhrases.splice(j--, 1);
				}
			}
		}
	};
	
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
			}
		}
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
	}, false, "Custom phrases", null, "inherit", true);
}
