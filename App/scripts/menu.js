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
	
	var selectedCategoriesLabel;
	if (sCategoryIds == CATEGORIES_ALL && sCustomCategoryIds == CATEGORIES_ALL) {
		selectedCategoriesLabel = "All";
	} else {
		var count;
		if (sCategoryIds == CATEGORIES_ALL) {
			count = getNonCustomCategoryCount() + sCustomCategoryIds.length;
		} else if (sCustomCategoryIds == CATEGORIES_ALL) {
			count = getCustomCategoryCount() + sCategoryIds.length;
		} else {
			count = sCategoryIds.length + sCustomCategoryIds.length;
		}
		if (count > 1) {
			selectedCategoriesLabel = count + " categories";
		} else {
				selectedCategoriesLabel = getCategoryById(
						sCategoryIds.length > 0? sCategoryIds[0]: 
							sCustomCategoryIds[0], sCategoryIds.length == 0).name;
		}
	}
	document.getElementById("menuItemCategoryIds").getElementsByClassName("menuItemValue")[0].innerHTML = selectedCategoriesLabel;
	
	document.getElementById("menuItemMaxWords").getElementsByClassName("menuItemValue")[0].innerHTML = (sMaxWordsPerTag == 0? "Unlimited": sMaxWordsPerTag);
	document.getElementById("menuItemMaxCharacters").getElementsByClassName("menuItemValue")[0].innerHTML = (sMaxCharactersPerTag == 0? "Unlimited": sMaxCharactersPerTag);
	document.getElementById("menuItemBeepSoundFile").getElementsByClassName("menuItemValue")[0].value = sBeepSoundFile;
	document.getElementById("menuItemTheme").getElementsByClassName("menuItemValue")[0].value = sStyleSheet;
	document.getElementById("menuItemVibrateCheckBox").checked = sVibrate;
	document.getElementById("menuItemShowCategoryCheckBox").checked = sShowCategory;
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
	
	// Add developer menu options when developer mode is enabled
	var developerMenuDiv = document.getElementById("developerMenu");
	if (sDeveloperMode) {
		developerMenuDiv.innerHTML = "<div class=\"menuHeader\">Developer Options</div>";
		
		var developerModeMenuItem = document.createElement("div");
		developerModeMenuItem.id = "menuItemDeveloperMode";
		developerModeMenuItem.className = "menuItem";
		developerModeMenuItem.onclick = function() {
			menuItemDeveloperModeClick();
		};
		developerModeMenuItem.innerHTML = "Turn off developer mode";
		developerMenuDiv.appendChild(developerModeMenuItem);
		
		var phrasePoolMenuItem = document.createElement("div");
		phrasePoolMenuItem.id = "menuItemPhrasePool";
		phrasePoolMenuItem.className = "menuItem";
		phrasePoolMenuItem.onclick = function() {
			menuItemPhrasePoolClick();
		};
		phrasePoolMenuItem.innerHTML = "Show phrase pool";
		developerMenuDiv.appendChild(phrasePoolMenuItem);
	} else {
		developerMenuDiv.innerHTML = "";
	}
	
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
	
	var buttonDiv = document.createElement("div");
	buttonDiv.className = "categoriesButtons";
	
	var selectAll, selectNone;
	
	var updateButtons = function() {
		var noneSelected = true;
		var allSelected = true;
		var checkboxes = div.getElementsByTagName("input");
		for (var i = 0; i < checkboxes.length; i++) {
			if (checkboxes[i].type == "checkbox") {
				if (checkboxes[i].checked) {
					noneSelected = false;
				} else {
					allSelected = false;
				}
			}
		}
		selectAll.disabled = allSelected;
		selectNone.disabled = noneSelected;
	};
	
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
		updateButtons();
	};
	buttonDiv.appendChild(selectAll);
	
	// Create a "Select None" button to select no categories
	var selectNone = document.createElement("input");
	selectNone.type = "button";
	selectNone.value = "Select None";
	selectNone.parentDiv = div;
	selectNone.onclick = function() {
		playSound(CLICK_SOUND_FILE);
		var checkboxes = this.parentDiv.getElementsByTagName("input");
		for (var i = 0; i < checkboxes.length; i++) {
			if (checkboxes[i].type == "checkbox")
				checkboxes[i].checked = false;
		}
		updateButtons();
	};
	buttonDiv.appendChild(selectNone);
	
	div.appendChild(buttonDiv);
	
	var table = document.createElement("table");
	
	// Create checkbox for each possible category
	for (var i = 1; i < categories.length; i++) {
		var row = document.createElement("tr");
		
		var checkboxCell = document.createElement("td");
		var checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.id = "categoryCheckbox" + i;
		checkbox.category = categories[i];
		checkbox.checked = 
				(!categories[i].isCustom && (sCategoryIds.indexOf(categories[i].id) != -1 || sCategoryIds == CATEGORIES_ALL)) || 
				(categories[i].isCustom && (sCustomCategoryIds.indexOf(categories[i].id) != -1 || sCustomCategoryIds == CATEGORIES_ALL));
		checkbox.onchange = function(){playSound(CLICK_SOUND_FILE); updateButtons();};
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
	updateButtons();
	
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
		var category = getCategoryById(usedTags[i].category_id);
		if (!usedTags[i].isCustom) {
			message += "<a class=\"flag-tag\" href=\"#\" onclick=\"showTagFlaggingDialog(" + JSON.stringify(usedTags[i]).replace(/\"/g, "&quot;") + "); return false;\"><img src=\"images/flag.png\" alt=\"Flag\" title=\"Report this phrase\" /></a>";
		}
		message += htmlEncode(usedTags[i].text) + "<br /><span class=\"used-tag\">from <span class=\"tag-category\">" + category.name + "</span></span><hr class=\"dotted\" />";
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
// Shows the phrases currently in the phrase pool
//
function showPhrasePool() {
	var message = "";
	for (var i = tags.length - 1; i >= 0; i--) {
		var category = getCategoryById(tags[i].category_id);
		message += htmlEncode(tags[i].text) + "<br /><span class=\"used-tag\">from <span class=\"tag-category\">" + category.name + "</span></span><hr class=\"dotted\" />";
	}
	
	showStandardDialog(
		message,
		null, 
		tags.length > 7, 
		"Phrase pool (" + tags.length + ")", 
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
function changeCategories(newCategories, callback) {
	// Change the setting
	
	sCategoryIds = new Array();
	sCustomCategoryIds = new Array();
	
	// Check if all categories are selected, length - 1 because index 0 is nothing
	if (newCategories.length < categories.length - 1) {
		// Just use the list of categories we calculated
		for (var i = 0; i < newCategories.length; i++) {
			if (newCategories[i].isCustom) {
				sCustomCategoryIds.push(newCategories[i].id);
			} else {
				sCategoryIds.push(newCategories[i].id);
			}
		}
	} else {
		sCategoryIds = CATEGORIES_ALL;
		sCustomCategoryIds = CATEGORIES_ALL;
	}
	
	// Reload new phrases with the new categories
	showLoadingScreen();
	loadTags(true, showReadyScreen);
	
	// Save the setting in the local database
	setSetting("sCategoryIds", JSON.stringify(sCategoryIds), function() {
		setSetting("sCustomCategoryIds", JSON.stringify(sCustomCategoryIds), callback);
	});
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
