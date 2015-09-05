//
// Displays the main menu.
//
function showMenu() {
	// Show the current value of all user settings
	document.getElementById("menuItemWinningPoint").getElementsByClassName("menuItemValue")[0].innerHTML = sWinningPoint;
	if (sNumberOfTeams > 2)
		document.getElementById("winningPointDescription").innerHTML = "Points for elimination";
	else
		document.getElementById("winningPointDescription").innerHTML = "Points to win";
	document.getElementById("menuItemNumberOfTeams").getElementsByClassName("menuItemValue")[0].innerHTML = sNumberOfTeams;
	document.getElementById("menuItemMinimumTime").getElementsByClassName("menuItemValue")[0].innerHTML = Math.round(sMinTimePerStage*3/1000);
	document.getElementById("menuItemMaximumTime").getElementsByClassName("menuItemValue")[0].innerHTML = Math.round(sMaxTimePerStage*3/1000);
	document.getElementById("menuItemDifficulty").getElementsByClassName("menuItemValue")[0].value = sDifficulty;
	document.getElementById("menuItemCategoryIds").getElementsByClassName("menuItemValue")[0].innerHTML = (sCategoryIds.length > 1? (sCategoryIds.length + " categories"): (sCategoryIds.length == 1? getCategoryById(sCategoryIds[0]).name: "All"));
	document.getElementById("menuItemMaxWords").getElementsByClassName("menuItemValue")[0].innerHTML = (sMaxWordsPerTag == 0? "Unlimited": sMaxWordsPerTag);
	document.getElementById("menuItemMaxCharacters").getElementsByClassName("menuItemValue")[0].innerHTML = (sMaxCharactersPerTag == 0? "Unlimited": sMaxCharactersPerTag);
	document.getElementById("menuItemBeepSoundFile").getElementsByClassName("menuItemValue")[0].value = sBeepSoundFile;
	document.getElementById("menuItemTheme").getElementsByClassName("menuItemValue")[0].value = sStyleSheet;
	document.getElementById("menuItemVibrateCheckBox").checked = sVibrate;
	document.getElementById("menuItemShowCategoryCheckBox").checked = sShowCategory;
	document.getElementById("menuItemShowAuthorCheckBox").checked = sShowAuthor;
	if (!APP_GOOGLEPLAY_EDITION) {
		document.getElementById("menuItemEdgyCheckBox").checked = sEdgy;
	}
	
	// Update the status of increase/decrease buttons
	document.getElementById("menuItemMaxWordsDecrease").disabled = sMaxWordsPerTag <= 0;
	document.getElementById("menuItemMaxCharactersDecrease").disabled = sMaxCharactersPerTag <= 0;
	document.getElementById("menuItemWinningPointIncrease").disabled = sWinningPoint >= 99;
	document.getElementById("menuItemWinningPointDecrease").disabled = sWinningPoint <= 1;
	document.getElementById("menuItemNumberOfTeamsIncrease").disabled = sNumberOfTeams >= 8;
	document.getElementById("menuItemNumberOfTeamsDecrease").disabled = sNumberOfTeams <= 2;
	document.getElementById("menuItemMinimumTimeDecrease").disabled = sMinTimePerStage <= 20000;
	document.getElementById("menuItemMaximumTimeDecrease").disabled = sMaxTimePerStage <= 20000;
	
	// Also update the scores displayed in the menu
	var scoreSettingsDiv = document.getElementById("scoreSettings");
	
	// Only update the menu score display if a game is in progress
	if (!gameOver) {
		scoreSettingsDiv.innerHTML = "<div class=\"menuHeader\">Score</div>";
		
		// Add the restart option if at least one point has been made
		var scoreHappened = false;
		for (var i = 0; i < scores.length; i++) {
			if (scores[i] > 0) {
				scoreHappened = true;
				break;
			}
		}
		if (scoreHappened) {
			var restartGameMenuItem = document.createElement("div");
			restartGameMenuItem.id = "menuItemRestartGame";
			restartGameMenuItem.className = "menuItem";
			restartGameMenuItem.onclick = function() {
				menuItemRestartGameClick();
			};
			restartGameMenuItem.innerHTML = "Reset scores";
			scoreSettingsDiv.appendChild(restartGameMenuItem);
		}
		
		// Get the score for each team
		for (var i = 0; i < scores.length; i++) {
			var menuItem = document.createElement("div");
			menuItem.id = "menuItemScore" + i;
			menuItem.className = "menuItem";
			menuItem.teamId = i;
			menuItem.onclick = function() {
				menuItemScoreClick(this.teamId);
			};
			menuItem.innerHTML = sTeamNames[i] + ": " + scores[i];
			scoreSettingsDiv.appendChild(menuItem);
		}
	} else 
		// If the game is over, do not show the scores in the menu
		scoreSettingsDiv.innerHTML = "";
	
	// Make the menu elements visible
	document.getElementById("mainMenu").className = "visible";
}

//
// Closes the main menu and returns to the game.
//
function closeMenu() {
	// Reload user settings
	loadSettings();
	
	// Hide the menu elements
	document.getElementById("mainMenu").className = "hidden";
}

//
// Shows the category selection menu
//
function showCategories() {
	var div = document.createElement("div");
	
	// Create a "Select All" button to select all categories
	var selectAll = document.createElement("input");
	selectAll.type = "button";
	selectAll.value = "Select All";
	selectAll.parentDiv = div;
	selectAll.onclick = function() {
		playSound(CLICK_SOUND_FILE);
		var checkboxes = this.parentDiv.getElementsByTagName("input");
		for (var i = 0; i < checkboxes.length; i++) {
			if (checkboxes[i].type == "checkbox")
				checkboxes[i].checked = true;
		}
	};
	div.appendChild(selectAll);
	
	div.appendChild(document.createElement("br"));
	
	var table = document.createElement("table");
	
	// Create checkbox for each possible category
	for (var i = 1; i < categories.length; i++) {
		var row = document.createElement("tr");
		
		var checkboxCell = document.createElement("td");
		var checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.id = "categoryCheckbox" + i;
		checkbox.category = categories[i].id;
		checkbox.checked = sCategoryIds.indexOf(categories[i].id) != -1 || sCategoryIds.length == 0;
		checkbox.onchange = function(){playSound(CLICK_SOUND_FILE);};
		checkboxCell.appendChild(checkbox);
		row.appendChild(checkboxCell);
		
		var labelCell = document.createElement("td");
		labelCell.style.lineHeight = "100%";
		var label = document.createElement("label");
		label.htmlFor = checkbox.id;
		label.innerHTML = htmlEncode(categories[i].name);
		labelCell.appendChild(label);
		row.appendChild(labelCell);
		
		table.appendChild(row);
	}
	
	div.appendChild(table);
	
	// Get input from the user
	var newCategories;
	showStandardDialog(div, function(response) {
		if (response) {
			// Erase the form so checkbox IDs can be reused
			div.innerHTML = "";
			
			changeCategories(newCategories, showMenu);
		}
	}, true, "Which categories?", null, "inherit", false, function(response) {
		if (response) {
			// Create an array to hold new category selections
			newCategories = new Array();
		
			// Find all the checked categories in the form, and add the categories to the array
			var checkboxes = div.getElementsByTagName("input");
				for (var i = 0; i < checkboxes.length; i++)
					if (checkboxes[i].checked)
						newCategories.push(checkboxes[i].category);
			
			// Validate the number of selected categories
			if (newCategories.length == 0) {
				dialog.showMessage("Select at least one category.");
				return false;
			}
		}
	});
}

//
// Shows the used phrases window.
//
function showUsedTags() {
	var message = "";
	for (var i = 0; i < usedTags.length; i++) {
		var category;
		for (var j = 1; j < categories.length; j++) {
			if (categories[j].id == usedTags[i].category_id) {
				category = categories[j];
				break;
			}
		}
		message += "<a class=\"flag-tag\" href=\"#\" onclick=\"showTagFlaggingDialog(" + JSON.stringify(usedTags[i]).replace(/\"/g, "&quot;") + "); return false;\"><img src=\"images/flag.png\" alt=\"Flag\" title=\"Report this phrase\" /></a>";
		message += htmlEncode(usedTags[i].text) + "<br /><span class=\"used-tag\">from <span class=\"tag-category\">" + category.name + "</span>" + (usedTags[i].authorName? "; submitted by <span class=\"tag-author\">" + usedTags[i].authorName + "</span>": "") + "</span>" + (i < usedTags.length - 1? "<hr />": "");
	}

	showStandardDialog(
		message,
		null, 
		usedTags.length > 7, 
		"Phrases used last round", 
		null, 
		null, 
		true);
}

//
// Show the phrase-flagging dialog.
//
function showTagFlaggingDialog(tag) {
	playSound(CLICK_SOUND_FILE);
	submitUsageClick("/usedTags/" + tag.id + "/flag");
	var div = document.createElement("div");
	
	var questionSpan = document.createElement("span");
	questionSpan.innerHTML = htmlEncode(tag.text);
	div.appendChild(questionSpan);
	
	div.appendChild(document.createElement("br"));
	
	// Create radio button for each possible reason
	for (var i = 0; i < TAG_FLAGGING_REASONS.length; i++) {
		var radioButton = document.createElement("input");
		radioButton.type = "radio";
		radioButton.id = "reasonRadioButton" + i;
		radioButton.name = "tagFlaggingReason";
		radioButton.reason = TAG_FLAGGING_REASONS[i];
		radioButton.onchange = function(){playSound(CLICK_SOUND_FILE);};
		var label = document.createElement("label");
		label.htmlFor = radioButton.id;
		label.innerHTML = TAG_FLAGGING_REASONS[i];
		div.appendChild(radioButton);
		div.appendChild(label);
		
		div.appendChild(document.createElement("br"));
	}
	
	// Get input from the user
	var reason;
	showStandardDialog(div, function(response) {
		if (response) {
			// Erase the form so radio button IDs can be reused
			div.innerHTML = "";
			
			flagTag(tag, reason, function(success) {
				if (success) {
					dialog.showMessage("Thank you for your feedback.");
				} else {
					dialog.showMessage(APP_NAME + " couldn't report the phrase. Check your Internet connection and try again.");
				}
			});
			
			deleteTagFromLocalDatabase(tag.id);
			
			// Remove the phrase from the line-up
			for (var i = 0; i < tags.length; i++) {
				if (tags[i].id == tag.id) {
					tags.splice(i, 1);
					i--;
				}
			}
		}
	}, false, "What's wrong?", null, "inherit", false, function(response) {
		if (response) {
			// Get the selected reason
			var radioButtons = div.getElementsByTagName("input");
				for (var i = 0; i < radioButtons.length; i++)
					if (radioButtons[i].checked) {
						reason = radioButtons[i].reason;
						break;
					}
			
			// Validate that a reason was selected
			if (!reason) {
				dialog.showMessage("Select a reason for reporting this phrase.", null, function() {playSound(CLICK_SOUND_FILE);});
				return false;
			}
		}
	});
}

//
// Shows the prompt for rating the app.
//
function showRatingPrompt() {
	submitUsageClick("/rating");
	dialog.buttons(
		function(response) {
			if (response == "Rate this app") {
				submitUsageClick("/rating/rate");
				changePromptForRating(false);
				if (PHONEGAP) {
					navigateAway(APP_RATING_URL_MARKET);
				} else {
					navigateAway(APP_RATING_URL_HTTP);
				}
			} else if (response == "Remind me later" || !response) {
				submitUsageClick("/rating/later");
			} else if (response == "No thanks") {
				submitUsageClick("/rating/no");
				changePromptForRating(false);
			}
		},
		"Having fun? Tell us what you think!",
		function() {playSound(CLICK_SOUND_FILE);},
		[
		    "Rate this app",
		    "Remind me later",
		    "No thanks"
		]
	);
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

//
// Shows the help window.
//
function showHelp() {
	showStandardDialog(HELP_TEXT, null, true, APP_NAME + " Help", null, null, true);
}

//
// Shows the about window.
//
function showAbout() {
	showStandardDialog(
		"<span style=\"font-size: 75%;\">(formerly <em>Grab Tag</em>)</span><br /><br />Version " + APP_VERSION + "<br />" + 
			"&copy; " + APP_COPYRIGHT_YEAR + " <a href=\"#\" onclick=\"submitUsageClick('/menu/about/author/webSite'); window.open('" + APP_AUTHOR_LINK + "', '_system'); return false;\">" + APP_AUTHOR + "</a><br />" + 
			"<a href=\"mailto:" + APP_AUTHOR_EMAIL + "\" onclick=\"submitUsageClick('/menu/about/author/email');\">" + APP_AUTHOR_EMAIL + "</a><br />" + 
			"<br /><br />" + (stats? 
			"New phrases in " + APP_NAME + ": <br /><br />" + 
			(stats.today > 0? "Added today: <span class=\"stats stats-today\">" + stats.today + "</span><br />" : "") + 
			(stats.this_week > 0? "In the last week: <span class=\"stats stats-this-week\">" + stats.this_week + "</span><br />" : "") + 
			(stats.this_month > 0? "In the last 30 days: <span class=\"stats stats-this-month\">" + stats.this_month + "</span><br />" : "") + 
			(stats.all_time > 0? "Total: <span class=\"stats stats-total\">" + parseInt(stats.all_time).toLocaleString() + "</span><br />" : "")
			: ""), 
		null, 
		false, 
		APP_NAME, 
		null, 
		null, 
		true);
}

//
// Shows a standard dialog window with HTML content.
// htmlContent: An HTML string to display in the window or a DOM element.
// callback: A function to call when the user dismisses the window.
// includeMoreIcon: Does nothing.
// title: The title to display at the top of the window.
// okButtonText: An optional string to display on the OK/accept button instead of "OK".
// lineHeight: An optional CSS line-height to use instead of "100%".
// hideCancel: true to hide the cancel button.
// closeFunction: A function to call when the window is closing. Return false to cancel closing.
//
function showStandardDialog(htmlContent, callback, includeMoreIcon, title, okButtonText, lineHeight, hideCancel, closeFunction) {
	var form = document.createElement("form");
	form.className = "standardDialogForm";
	var div = document.createElement("div");
	div.className = "standardDialogDiv";
	if (lineHeight)
		div.style.lineHeight = lineHeight;
	var backDiv = document.createElement("div");
	backDiv.className = "standardDialogBackDiv";
	if (htmlContent instanceof HTMLElement) {
		div.appendChild(htmlContent);
	} else {
		var span = document.createElement("span");
		span.innerHTML = htmlContent;
		div.appendChild(span);
	}
	form.appendChild(div);
	form.appendChild(backDiv);
	form.style.height = "80vh";
	
	if (PHONEGAP) {
		// Workaround for lack of CSS "vh" support in Android 4.3-
		if (parseFloat(device.version) < 4.39) {
			var viewport = function() {
				var e = window, a = 'inner';
				if (!('innerWidth' in window )) {
					a = 'client';
					e = document.documentElement || document.body;
				}
				return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
			}
			var vh = (viewport().height/100);
			form.style.height = vh*80 + 'px';
		}
	}
	
	dialog.custom(form, function(form) {
		if (callback)
			callback(form !== false);
	}, title? title: "", okButtonText? okButtonText: "OK", hideCancel === true, function(response) {
		playSound(CLICK_SOUND_FILE);
		if (closeFunction)
			return closeFunction(response);
	});
}

//
// Changes a team's score.
//
function changeScore(teamId, score) {
	scores[teamId] = score;
	loadScores();
}

//
// Changes the winning point user setting.
//
function changeWinningPoint(point, callback) {
	// Change the setting
	sWinningPoint = point;
	
	// Save the setting in the local database
	setSetting("sWinningPoint", sWinningPoint, callback);
}

//
// Changes the number of teams user setting.
//
function changeNumberOfTeams(number, callback) {
	// Change the setting
	sNumberOfTeams = number;
	
	// Changing the number of teams ends any game in progress
	newGame();
	showReadyScreen();
	
	// Save the setting in the local database
	setSetting("sNumberOfTeams", sNumberOfTeams, callback);
}

//
// Changes the minimum time user setting.
//
function changeMinimumTime(time, callback) {
	// Change the setting
	sMinTimePerStage = time;
	// If the minimum is now greater than the maximum, set maximum to minimum
	if (time > sMaxTimePerStage)
		sMaxTimePerStage = time;
	
	// Save the setting in the local database
	setSetting("sMinTimePerStage", sMinTimePerStage, function() {
		setSetting("sMaxTimePerStage", sMaxTimePerStage, callback);
	});
}

//
// Changes the maximum time user setting.
//
function changeMaximumTime(time, callback) {
	// Change the setting
	sMaxTimePerStage = time;
	// If the maximum is now less than the minimum, set minimum to maximum
	if (time < sMinTimePerStage)
		sMinTimePerStage = time;
	
	// Save the setting in the local database
	setSetting("sMaxTimePerStage", sMaxTimePerStage, function() {
		setSetting("sMinTimePerStage", sMinTimePerStage, callback);
	});
}

//
// Changes the difficulty user setting and reloads phrases.
//
function changeDifficulty(difficulty, callback) {
	// Change the setting
	sDifficulty = difficulty;
	
	// Reload phrases with new difficulty setting
	showLoadingScreen();
	loadTags(true, showReadyScreen);
	
	// Save the setting in the local database
	setSetting("sDifficulty", sDifficulty, callback);
}

//
// Changes the categories user setting and reloads phrases.
//
function changeCategories(categoryIds, callback) {
	// Change the setting
	// Check if all categories are selected, length - 1 because index 0 is nothing
	if (categoryIds.length == categories.length - 1)
		// An empty array will be treated as all categories
		sCategoryIds = new Array();
	else
		// Just use the list of categories we calculated
		sCategoryIds = categoryIds;
	
	// Reload new phrases with the new categories
	showLoadingScreen();
	loadTags(true, showReadyScreen);
	
	// Save the setting in the local database
	setSetting("sCategoryIds", JSON.stringify(sCategoryIds), callback);
}

//
// Changes the max words user setting and reloads phrases.
//
function changeMaxWords(words, callback) {
	// Change the setting
	sMaxWordsPerTag = words;
	
	// Load new phrases with the max words
	showLoadingScreen();
	loadTags(true, showReadyScreen);
	
	// Save the setting in the local database
	setSetting("sMaxWordsPerTag", sMaxWordsPerTag, callback);
}

//
// Changes the max characters user setting and reloads phrases.
//
function changeMaxCharacters(characters, callback) {
	// Change the setting
	sMaxCharactersPerTag = characters;
	
	// Load new phrases with the max characters
	showLoadingScreen();
	loadTags(true, showReadyScreen);
	
	// Save the setting in the local database
	setSetting("sMaxCharactersPerTag", sMaxCharactersPerTag, callback);
}

//
// Changes the beep sound file user setting.
//
function changeBeepSoundFile(soundFile, callback) {
	// Change the setting
	sBeepSoundFile = soundFile;
	
	// Save the setting in the local database
	setSetting("sBeepSoundFile", sBeepSoundFile, callback);
}

//
// Changes the theme user setting.
//
function changeStyleSheet(styleSheet, callback) {
	// Change the setting
	sStyleSheet = styleSheet;
	
	// Save the setting in the local database
	setSetting("sStyleSheet", sStyleSheet, callback);
}

//
// Changes the vibrate user setting.
//
function changeVibrate(vibrate, callback) {
	// Change the setting
	sVibrate = vibrate;
	
	// Save the setting in the local database
	setSetting("sVibrate", JSON.stringify(sVibrate), callback);
}

//
// Changes the show category user setting.
//
function changeShowCategory(showCategory, callback) {
	// Change the setting
	sShowCategory = showCategory;
	
	// Save the setting in the local database
	setSetting("sShowCategory", JSON.stringify(sShowCategory), callback);
}

//
// Changes the show author user setting.
//
function changeShowAuthor(showAuthor, callback) {
	// Change the setting
	sShowAuthor = showAuthor;
	
	// Save the setting in the local database
	setSetting("sShowAuthor", JSON.stringify(sShowAuthor), callback);
}

//
// Changes the edgy user setting and reloads phrases.
//
function changeEdgy(edgy, callback) {
	// Change the setting
	sEdgy = edgy
	
	// Load more phrases with edginess changed
	showLoadingScreen();
	loadTags(true, showReadyScreen);
	
	// Save the setting in the local database
	setSetting("sEdgy", JSON.stringify(sEdgy), callback);
}

//
// Changes the developer mode user setting.
//
function changeDeveloperMode(developerMode, callback) {
	// Change the setting
	sDeveloperMode = developerMode;
	
	// Save the setting in the local database
	setSetting("sDeveloperMode", JSON.stringify(sDeveloperMode), callback);
}

//
// Changes the data version user setting.
//
function changeDataVersion(dataVersion, callback) {
	// Change the setting
	sDataVersion = dataVersion;
	
	// Save the setting in the local database
	setSetting("sDataVersion", sDataVersion, callback);
}

//
// Changes the prompt for rating user setting.
//
function changePromptForRating(promptForRating, callback) {
	// Change the setting
	sPromptForRating = promptForRating;
	
	// Save the setting in the local database
	setSetting("sPromptForRating", sPromptForRating, callback);
}

//
// Changes the games since rating prompt user setting.
//
function changeGamesSinceRatingPrompt(gamesSinceRatingPrompt, callback) {
	// Change the setting
	sGamesSinceRatingPrompt = gamesSinceRatingPrompt;
	
	// Save the setting in the local database
	setSetting("sGamesSinceRatingPrompt", sGamesSinceRatingPrompt, callback);
}

//
// Changes the name of a team.
//
function changeTeamName(teamId, newName, callback) {
	// Change the setting
	sTeamNames[teamId] = newName;
	
	// Save the setting in the local database
	setSetting("sTeamNames", JSON.stringify(sTeamNames), callback);
}
