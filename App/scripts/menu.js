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
	document.getElementById("menuItemVibrateCheckBox").checked = sVibrate;
	if (!APP_GOOGLEPLAY_EDITION) {
		document.getElementById("menuItemEdgyCheckBox").checked = sEdgy;
	}
	
	// Also update the scores displayed in the menu
	var scoreSettingsDiv = document.getElementById("scoreSettings");
	
	// Only update the menu score display if a game is in progress
	if (!gameOver) {
		scoreSettingsDiv.innerHTML = "<div class=\"menuHeader\">Score</div>";
		
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
	document.getElementById("mainMenuDimmer").className = "visible";
	document.getElementById("mainMenu").className = "visible";
}

//
// Closes the main menu and returns to the game.
//
function closeMenu() {
	// Reload user settings
	loadSettings();
	
	// Hide the menu elements
	document.getElementById("mainMenuDimmer").className = "hidden";
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
	
	// Create checkbox for each possible category
	for (var i = 1; i < categories.length; i++) {
		var checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.id = "categoryCheckbox" + i;
		checkbox.category = categories[i].id;
		checkbox.checked = sCategoryIds.indexOf(categories[i].id) != -1 || sCategoryIds.length == 0;
		var label = document.createElement("label");
		label.htmlFor = checkbox.id;
		label.innerHTML = categories[i].name;
		div.appendChild(checkbox);
		div.appendChild(label);
		
		div.appendChild(document.createElement("br"));
	}
	
	// Get input from the user
	showStandardDialog(div, function(response) {
		if (response) {
			// Create an array to hold new category selections
			var newCategories = new Array();
			
			// Find all the checked categories in the form, and add the categories to the array
			var checkboxes = div.getElementsByTagName("input");
				for (var i = 0; i < checkboxes.length; i++)
					if (checkboxes[i].checked)
						newCategories.push(checkboxes[i].category);
			
			// Erase the form so checkbox IDs can be reused
			div.innerHTML = "";
			
			// Validate the number of selected categories
			if (newCategories.length == 0) {
				dialog.showMessage("Select at least one category.");
				return;
			}
			
			changeCategories(newCategories, showMenu);
		}
	}, true, "Which categories?", null, "inherit");
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
	showStandardDialog("Version " + APP_VERSION + "<br />&copy; " + APP_COPYRIGHT_YEAR + " <a href=\"#\" onclick=\"window.open('" + APP_AUTHOR_LINK + "', '_system'); return false;\">" + APP_AUTHOR + "</a><br />Email: <a href=\"mailto:" + APP_AUTHOR_EMAIL + "\">" + APP_AUTHOR_EMAIL + "</a>", null, false, APP_NAME, null, null, true);
}

//
// Shows a standard dialog window with HTML content.
// htmlContent: An HTML string to display in the window or a DOM element.
// callback: A function to call when the user dismisses the window.
// includeMoreIcon: Whether to show the "more" icon at the bottom of the window.
// title: The title to display at the top of the window.
// okButtonText: An optional string to display on the OK/accept button instead of "OK".
// lineHeight: An optional CSS line-height to use instead of "100%".
// hideCancel: true to hide the cancel button.
//
function showStandardDialog(htmlContent, callback, includeMoreIcon, title, okButtonText, lineHeight, hideCancel) {
	var form = document.createElement("form");
	form.className = "standardDialogForm";
	var div = document.createElement("div");
	div.className = "standardDialogDiv";
	if (lineHeight)
		div.style.lineHeight = lineHeight;
	if (includeMoreIcon) {
		div.onscroll = function() {
			this.removeChild(this.moreImage);
		};
		var moreImage = document.createElement("img");
		moreImage.className = "standardDialogMoreIcon";
		moreImage.src = "images/more.png";
		div.appendChild(moreImage);
		div.moreImage = moreImage;
	}
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
	dialog.custom(form, function(form) {
		if (callback)
			callback(form !== false);
	}, title? title: "", okButtonText? okButtonText: "OK", hideCancel === true, function() {playSound(CLICK_SOUND_FILE);});
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
	
	if (PHONEGAP)
		// Save the setting in the local database
		db.transaction(function(tx) {
			setSetting(tx, "sWinningPoint", sWinningPoint);
			if (callback)
				callback();
		});
	else {
		if (callback)
			callback();
	}
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
	
	if (PHONEGAP)
		// Save the setting in the local database
		db.transaction(function(tx) {
			setSetting(tx, "sNumberOfTeams", sNumberOfTeams);
			if (callback)
				callback();
		});
	else {
		if (callback)
			callback();
	}
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
	
	if (PHONEGAP)
		// Save the setting in the local database
		db.transaction(function(tx) {
			setSetting(tx, "sMinTimePerStage", sMinTimePerStage);
			setSetting(tx, "sMaxTimePerStage", sMaxTimePerStage);
			if (callback)
				callback();
		});
	else {
		if (callback)
			callback();
	}
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
	
	if (PHONEGAP)
		// Save the setting in the local database
		db.transaction(function(tx) {
			setSetting(tx, "sMaxTimePerStage", sMaxTimePerStage);
			setSetting(tx, "sMinTimePerStage", sMinTimePerStage);
			if (callback)
				callback();
		});
	else {
		if (callback)
			callback();
	}
}

//
// Changes the difficulty user setting and reloads tags.
//
function changeDifficulty(difficulty, callback) {
	// Change the setting
	sDifficulty = difficulty;
	
	// Reload tags with new difficulty setting
	showLoadingScreen();
	loadTags(true, showReadyScreen);
	
	if (PHONEGAP)
		// Save the setting in the local database
		db.transaction(function(tx) {
			setSetting(tx, "sDifficulty", sDifficulty);
			if (callback)
				callback();
		});
	else {
		if (callback)
			callback();
	}
}

//
// Changes the categories user setting and reloads tags.
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
	
	// Reload new tags with the new categories
	showLoadingScreen();
	loadTags(true, showReadyScreen);
	
	if (PHONEGAP)
		// Save the setting in the local database
		db.transaction(function(tx) {
			setSetting(tx, "sCategoryIds", JSON.stringify(sCategoryIds));
			if (callback)
				callback();
		});
	else {
		if (callback)
			callback();
	}
}

//
// Changes the max words user setting and reloads tags.
//
function changeMaxWords(words, callback) {
	// Change the setting
	sMaxWordsPerTag = words;
	
	// Load new tags with the max words
	showLoadingScreen();
	loadTags(true, showReadyScreen);
	
	if (PHONEGAP)
		// Save the setting in the local database
		db.transaction(function(tx) {
			setSetting(tx, "sMaxWordsPerTag", sMaxWordsPerTag);
			if (callback)
				callback();
		});
	else {
		if (callback)
			callback();
	}
}

//
// Changes the max characters user setting and reloads tags.
//
function changeMaxCharacters(characters, callback) {
	// Change the setting
	sMaxCharactersPerTag = characters;
	
	// Load new tags with the max characters
	showLoadingScreen();
	loadTags(true, showReadyScreen);
	
	if (PHONEGAP)
		// Save the setting in the local database
		db.transaction(function(tx) {
			setSetting(tx, "sMaxCharactersPerTag", sMaxCharactersPerTag);
			if (callback)
				callback();
		});
	else {
		if (callback)
			callback();
	}
}

//
// Changes the beep sound file user setting.
//
function changeBeepSoundFile(soundFile, callback) {
	// Change the setting
	sBeepSoundFile = soundFile;
	
	if (PHONEGAP)
		// Save the setting in the local database
		db.transaction(function(tx) {
			setSetting(tx, "sBeepSoundFile", sBeepSoundFile);
			if (callback)
				callback();
		});
	else {
		if (callback)
			callback();
	}
}

//
// Changes the vibrate user setting.
//
function changeVibrate(vibrate, callback) {
	// Change the setting
	sVibrate = vibrate
	
	if (PHONEGAP)
		// Save the setting in the local database
		db.transaction(function(tx) {
			setSetting(tx, "sVibrate", JSON.stringify(sVibrate));
			if (callback)
				callback();
		});
	else {
		if (callback)
			callback();
	}
}

//
// Changes the edgy user setting and reloads tags.
//
function changeEdgy(edgy, callback) {
	// Change the setting
	sEdgy = edgy
	
	// Load more tags with edginess changed
	showLoadingScreen();
	loadTags(true, showReadyScreen);
	
	if (PHONEGAP)
		// Save the setting in the local database
		db.transaction(function(tx) {
			setSetting(tx, "sEdgy", JSON.stringify(sEdgy));
			if (callback)
				callback();
		});
	else {
		if (callback)
			callback();
	}
}

//
// Changes the name of a team.
//
function changeTeamName(teamId, newName, callback) {
	// Change the setting
	sTeamNames[teamId] = newName;
	
	if (PHONEGAP)
		// Save the setting in the local database
		db.transaction(function(tx) {
			setSetting(tx, "sTeamNames", JSON.stringify(sTeamNames));
			if (callback)
				callback();
		});
	else {
		if (callback)
			callback();
	}
}
