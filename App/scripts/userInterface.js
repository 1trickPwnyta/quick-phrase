//
// Sets the phrase on the screen.
//
function setTag(text, categoryName) {
	document.getElementById("tag").innerHTML = text;
	var metadataText = "";
	if (categoryName && sShowCategory) {
		metadataText += "from <span class=\"tag-category\">" + categoryName + "</span><br />";
	}
	document.getElementById("tag-metadata").innerHTML = metadataText;
}

//
// Disables the Next button.
//
function disableNext() {
	var nextButton = document.getElementById("nextButton");
	nextButton.className = "disabledNextButton";
	nextButton.enabled = false;
}

//
// Enables the Next button.
//
function enableNext() {
	var nextButton = document.getElementById("nextButton");
	nextButton.className = "enabledNextButton";
	nextButton.enabled = true;
}

//
// Applies the current theme's style sheet.
//
function applyTheme() {
	changeCSS(sStyleSheet, 2);
}

//
// Shows the loading screen, with the Next button disabled.
//
function showLoadingScreen() {
	disableNext();
	hideConfetti();
	setTag("Loading...");
}

//
// Shows the game ready screen, with the Next button enabled.
//
function showReadyScreen() {
	enableNext();
	hideConfetti();
	setTag("Press Next to start!");
}

//
// Updates the difficulties available in the main menu difficulty selctor
//
function updateDifficultySelector() {
	var difficultySelect = document.getElementById("menuItemDifficulty").getElementsByClassName("menuItemValue")[0];
	difficultySelect.innerHTML = "";
	for (var i = 1; i < difficulties.length; i++) {
		var option = document.createElement("option");
		option.value = difficulties[i].id;
		option.innerHTML = difficulties[i].name;
		difficultySelect.appendChild(option);
	}
	difficultySelect.value = sDifficulty;
}

//
// Score button click event.
//
function scoreButtonClick(button) {
	// Do nothing if a round is in progress or if the game is over
	if (timeStage != TIME_STAGE_NOT_STARTED || gameOver)
		return;
	
	// If this team has been eliminated, do nothing
	if (scores[button.team] == SCORE_ELIMINATED)
		return;
	
	scores[button.team]++;
	playSound(BUTTON_SOUND_FILE);
	submitUsageClick("/team/" + button.team);
	
	// Remember a point has been given now for the last round
	pointGiven = true;
	
	// Display the new score
	loadScores();
	
	// Check if the team has reached the winning (or elimination) point
	if (scores[button.team] >= sWinningPoint) {
		// Respond based on number of teams
		if (sNumberOfTeams == 2) {
			// This team has won the game
			teamWin(button.team);
		} else
			// This team has been eliminated
			eliminateTeam(button.team);
	}
}

//
// Score button long click event.
//
function scoreButtonLongClick(button) {
	// Do nothing if a round is in progress
	if (timeStage != TIME_STAGE_NOT_STARTED)
		return;
		
	playSound(CLICK_SOUND_FILE);
	submitUsageClick("/team/" + button.team + "/name");
	
	// Get input from user
	dialog.getString(function(response) {
	
		// Ignore empty input
		if (response === false || response == "")
			return;
		
		// Evaluate input
		response = htmlEncode(response);
		if (response.length > MAX_TEAM_NAME_CHARACTERS) {
			dialog.showMessage("No more than " + MAX_TEAM_NAME_CHARACTERS + " characters are allowed.");
			response = response.substring(0, MAX_TEAM_NAME_CHARACTERS);
		}
		changeTeamName(button.team, response, loadScores);
		
	}, "What's the team name?", sTeamNames[button.team], null, function() {playSound(CLICK_SOUND_FILE);});
}

//
// Next button click event.
//
function nextButtonClick() {
	// Don't respond if the button is disabled
	if (!document.getElementById("nextButton").enabled)
		return;
	
	// Don't respond if we haven't finished loading all the user settings
	if (settingsLoaded < settingsCount)
		return;
	
	playSound(BUTTON_SOUND_FILE);
	submitUsageClick("/next");
	
	// If the game has not started, start a new game
	if (gameOver) {
		submitUsageClick("/game/start");
		newGame(true);
	}
		
	var setNextTag = function() {
		var tag = nextTag();
		usedTags.push(tag);
		usedTagsOverall.push(tag);
		var category = getCategoryById(tag.category_id);
		setTag(htmlEncode(tag.text), category.name);
	};
	
	// If a point has not been given since the last round ended, warn the user
	if (!pointGiven) {
	
		dialog.confirm(function(response) {
			if (response) {
				// If the round isn't started (which it shouldn't be since we were waiting for a point), start the next round
				if (timeStage == TIME_STAGE_NOT_STARTED)
					advanceTimeStage();
			
				// The user wants to continue anyway, so start the next round with the next phrase
				pointGiven = true;
				setNextTag();
			}
		}, "No team was given a point for this round. Are you sure you want to start the next round?", function() {playSound(CLICK_SOUND_FILE);});
		
	} else {
	
		// If the round isn't started, start the next round
		if (timeStage == TIME_STAGE_NOT_STARTED)
			advanceTimeStage();
	
		// Go to the next phrase
		setNextTag();
		
	}
}

//
// Menu button click event.
//
function menuButtonClick() {
	playSound(CLICK_SOUND_FILE);
	
	// If a round is in progress, this button's function is to pause the game
	if (timeStage != TIME_STAGE_NOT_STARTED) {
		pause();
		dialog.buttons(function(response) {
			if (response == "Stop the game") {
				stopGame();
			} else if (response == "Resume" || !response){
				unpause();
			}
		}, "Game paused.", function() {playSound(CLICK_SOUND_FILE);}, ["Resume", "Stop the game"]);
	} else {
		submitUsageClick("/menu");
		showMenu();
	}
}

//
// Help button click event.
//
function helpButtonClick() {
	playSound(CLICK_SOUND_FILE);
	submitUsageClick("/help");
	showHelp();
}

//
// Used phrases button click event.
//
function usedTagsButtonClick() {
	playSound(CLICK_SOUND_FILE);
	submitUsageClick("/usedTags");
	showUsedTags();
}

//
// Return to game menu item click event.
//
function menuItemReturnToGameClick() {
	playSound(CLICK_SOUND_FILE);
	closeMenu();
}

//
// Android back button click event.
//
function backButtonClick() {
	// Close the main menu, if open
	if (document.getElementById("mainMenu").style.display != "none") {
		playSound(CLICK_SOUND_FILE);
		closeMenu();
	}
}

//
// Phrase creation menu item click event.
//
function menuItemTagCreationClick() {
	playSound(CLICK_SOUND_FILE);
	submitUsageClick("/menu/customPhrases");
	showCustomPhrases();
}

//
// Help menu item click event.
//
function menuItemHelpClick() {
	playSound(CLICK_SOUND_FILE);
	submitUsageClick("/menu/help");
	showHelp();
}

//
// About menu item click event.
//
function menuItemAboutClick() {
	playSound(CLICK_SOUND_FILE);
	submitUsageClick("/menu/about");
	showAbout();
}

//
//About menu item long click event.
//
function menuItemAboutLongClick() {
	playSound(CLICK_SOUND_FILE);
	
	if (!sDeveloperMode) {
		dialog.confirm(function(response) {
			playSound(CLICK_SOUND_FILE);
			if (response) {
				submitUsageClick("/menu/about/developermode/on");
				changeDeveloperMode(true);
			}
		}, "Developer mode is turned off. Do you want to turn it on?");
	} else {
		dialog.confirm(function(response) {
			playSound(CLICK_SOUND_FILE);
			if (response) {
				changeDeveloperMode(false, function() {
					submitUsageClick("/menu/about/developermode/off");
				});
			}
		}, "Developer mode is turned on. Do you want to turn it off?");
	}
}

//
// Restart game menu item click event.
//
function menuItemRestartGameClick() {
	playSound(CLICK_SOUND_FILE);
	dialog.confirm(function(response) {
		if (response) {
			submitUsageClick("/menu/restart");
			newGame(true);
			showMenu();
			showReadyScreen();
		}
	}, "The current game will end. Is that okay?");
}

//
// Score menu item click event.
//
function menuItemScoreClick(teamId) {
	playSound(CLICK_SOUND_FILE);
	
	// Get input from user
	dialog.getNumber(function(response) {
		if (response || response === 0) {
			response = parseInt(response);
			changeScore(teamId, response);
			showMenu();
		}
	}, "What's the score?", scores[teamId], null, function(response) {
		playSound(CLICK_SOUND_FILE);
		
		if (response || response === 0) {
			// Validate input
			response = parseInt(response);
			if (response < 0) {
				dialog.showMessage("Nobody can have a negative score.");
				return false;
			} else if (response >= sWinningPoint) {
				dialog.showMessage("Set the score to something less than " + sWinningPoint + ".");
				return false;
			}
		}
	});
}