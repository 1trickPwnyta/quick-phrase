//
// Sets the tag on the screen.
//
function setTag(text, authorUsername, categoryName) {
	document.getElementById("tag").innerHTML = text;
	var metadataText = "";
	if (categoryName && sShowCategory) {
		metadataText += "from <span class=\"tag-category\">" + categoryName + "</span><br />";
	}
	if (authorUsername && sShowAuthor) {
		metadataText += "submitted by <span class=\"tag-author\">" + authorUsername + "</span><br />";
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
// Shows confetti in the background.
//
function showConfetti() {
	document.getElementById("confetti").style.display = "block";
}

//
// Hides the confetti in the background.
//
function hideConfetti() {
	document.getElementById("confetti").style.display = "none";
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
	
	// Remember a point has been given now for the last round
	pointGiven = true;
	
	// Display the new score
	loadScores();
	
	// Check if the team has reached the winning (or elimination) point
	if (scores[button.team] >= sWinningPoint) {
		// Respond based on number of teams
		if (sNumberOfTeams == 2)
			// This team has won the game
			teamWin(button.team);
		else
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
	
	// Get input from user
	dialog.getString(function(response) {
	
		// Ignore empty input
		if (response === false || response == "")
			return;
		
		// Evaluate input
		response = htmlEncode(response);
		if (response.length > 64) {
			dialog.showMessage("No more than 64 characters are allowed.");
			response = response.substring(0, 64);
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
	
	// If the game has not started, start a new game
	if (gameOver)
		newGame(true);
		
	var setNextTag = function() {
		var tag = nextTag();
		var category;
		for (var i = 1; i < categories.length; i++) {
			if (categories[i].id == tag.category_id) {
				category = categories[i];
				break;
			}
		}
		setTag(htmlEncode(tag.text), tag.authorName, category.name);
	};
	
	// If a point has not been given since the last round ended, warn the user
	if (!pointGiven) {
	
		dialog.confirm(function(response) {
			if (response) {
				// The user wants to continue anyway, so start the next round with the next tag
				pointGiven = true;
				setNextTag();
				
				// If the round isn't started (which it shouldn't be since we were waiting for a point), start the next round
				if (timeStage == TIME_STAGE_NOT_STARTED)
					advanceTimeStage();
			}
		}, "No team was given a point for this round. Are you sure you want to start the next round?", function() {playSound(CLICK_SOUND_FILE);});
		
	} else {
	
		// Go to the next tag
		setNextTag();
		
		// If the round isn't started, start the next round
		if (timeStage == TIME_STAGE_NOT_STARTED)
			advanceTimeStage();
			
	}
}

//
// Menu button click event.
//
function menuButtonClick() {
	playSound(CLICK_SOUND_FILE);
	
	// If a round is in progress, this button's function is to stop the round
	if (timeStage != TIME_STAGE_NOT_STARTED) {
		dialog.confirm(function(response) {
			if (response && timeStage != TIME_STAGE_NOT_STARTED)
				stopGame();
		}, "Are you sure you want to stop the game?", function() {playSound(CLICK_SOUND_FILE);});
	} else
		showMenu();
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
// Categories menu item click event.
//
function menuItemCategoryIdsClick() {
	playSound(CLICK_SOUND_FILE);
	showCategories();
}

//
// Difficulty menu item click event.
//
function menuItemDifficultyChange() {
	playSound(CLICK_SOUND_FILE);
	
	// Get the new value for difficulty
	var newDifficulty = document.getElementById("menuItemDifficulty").getElementsByClassName("menuItemValue")[0].value;
	
	changeDifficulty(newDifficulty, showMenu);
}

//
// Max words menu item click event.
//
function menuItemMaxWordsClick() {
	playSound(CLICK_SOUND_FILE);
	
	// Get input from the user
	dialog.getNumber(function(response) {
		
		// Ignore empty input
		if (response === false || response == "")
			return;
		
		// Validate input
		response = parseInt(response);
		if (response != 0 && response < 1) {
			dialog.showMessage("Tags must contain at least one word.");
			response = 1;
		}
		
		changeMaxWords(response, showMenu);
		
	}, "How many words? (Use 0 for unlimited)", sMaxWordsPerTag, null, function() {playSound(CLICK_SOUND_FILE);});
}

//
// Max characters menu item click event.
//
function menuItemMaxCharactersClick() {
	playSound(CLICK_SOUND_FILE);
	
	// Get input from the user
	dialog.getNumber(function(response) {
		
		// Ignore empty input
		if (response === false || response == "")
			return;
		
		// Validate input
		response = parseInt(response);
		if (response != 0 && response < 6) {
			dialog.showMessage("Tags usually contain at least six characters.");
			response = 6;
		}
		
		changeMaxCharacters(response, showMenu);
		
	}, "How many characters? (Use 0 for unlimited)", sMaxCharactersPerTag, null, function() {playSound(CLICK_SOUND_FILE);});
}

//
// Edgy menu item click event.
//
function menuItemEdgyChange() {
	playSound(CLICK_SOUND_FILE);
	
	// Check if the setting is being enabled
	if (document.getElementById("menuItemEdgyCheckBox").checked) {
		// If enabling the setting, warn the user and only continue if they agree
		showStandardDialog(EDGY_AGREEMENT_TEXT, function(iagree) {
			// Enable the setting if the user agreed
			if (iagree)
				changeEdgy(true, showMenu);
			else
				// Otherwise uncheck the box
				document.getElementById("menuItemEdgyCheckBox").checked = false;
		}, true, "Adult-Themed Tags", "I Agree");
	} else
		// If disabling the setting, just allow it
		changeEdgy(false, showMenu);
}

//
// Show Category menu item click event.
//
function menuItemShowCategoryChange() {
	playSound(CLICK_SOUND_FILE);
	
	var showCategory = document.getElementById("menuItemShowCategoryCheckBox").checked;
	changeShowCategory(showCategory, showMenu);
}

//
// Show Author menu item click event.
//
function menuItemShowAuthorChange() {
	playSound(CLICK_SOUND_FILE);
	
	var showAuthor = document.getElementById("menuItemShowAuthorCheckBox").checked;
	changeShowAuthor(showAuthor, showMenu);
}

//
// Winning point menu item click event.
//
function menuItemWinningPointClick() {
	playSound(CLICK_SOUND_FILE);
	
	// Get input from the user
	dialog.getNumber(function(response) {
		
		// Ignore empty input
		if (response === false || response == "")
			return;
		
		// Validate input
		response = parseInt(response);
		if (!gameOver) {
			// Find out the score of the winning team
			var maxPointsCurrently = 0;
			for (var i = 0; i < scores.length; i++)
				if (scores[i] > maxPointsCurrently)
					maxPointsCurrently = scores[i];
			
			// Don't allow a winning point that would make that team win right away
			if (response <= maxPointsCurrently) {
				if (response > 0)
					dialog.showMessage("Someone already has that many points. At least one more point is required.");
				else
					dialog.showMessage("At least one point must be required.");
				response = maxPointsCurrently + 1;
			}
		} else {
			if (response < 1) {
				dialog.showMessage("At least one point must be required.");
				response = 1;
			}
			if (response > 99) {
				dialog.showMessage("No more than 99 points are allowed.");
				response = 99;
			}
		}
		
		changeWinningPoint(response, showMenu);
		
	}, "How many points?", sWinningPoint, null, function() {playSound(CLICK_SOUND_FILE);});
}

//
// Number of teams menu item click event.
//
function menuItemNumberOfTeamsClick() {
	playSound(CLICK_SOUND_FILE);
	
	// Changes the number of teams if response is true
	var executeResponse = function(response) {
		if (response) {
			
			// Get input from user
			dialog.getNumber(function(response) {
				if (response === false || response == "")
					return;
				
				response = parseInt(response);
				if (response < 2) {
					dialog.showMessage("At least two teams are required.");
					response = 2;
				} else if (response > 8) {
					dialog.showMessage("No more than eight teams are allowed.");
					response = 8;
				}
				
				changeNumberOfTeams(response, showMenu);
				
			}, "How many teams?", sNumberOfTeams, null, function() {playSound(CLICK_SOUND_FILE);});
			
		}
	};
	
	// Only change the number of teams if the game is already over or if the user says it's okay
	if (gameOver)
		executeResponse(true);
	else
		dialog.confirm(executeResponse, "The current game will end. Is that okay?");
}

//
// Minimum time menu item click event.
//
function menuItemMinimumTimeClick() {
	playSound(CLICK_SOUND_FILE);
	
	// Get input from the user
	dialog.getNumber(function(response) {
	
		// Ignore empty input
		if (response === false || response == "")
			return;
		
		// Validate input 
		response = parseInt(response);
		// Convert to ms and divide by 3 to calculate the round time
		response = Math.round(response*1000/3);
		if (response < 20000) {
			dialog.showMessage("At least 60 seconds are required.");
			response = 20000;
		}
		
		changeMinimumTime(response, showMenu);
		
	}, "How many seconds should a round last, at least?", Math.round(sMinTimePerStage*3/1000), null, function() {playSound(CLICK_SOUND_FILE);});
}

//
// Maximum time menu item click event.
//
function menuItemMaximumTimeClick() {
	playSound(CLICK_SOUND_FILE);
	
	// Get input from the user
	dialog.getNumber(function(response) {
	
		// Ignore empty input
		if (response === false || response == "")
			return;
		
		// Validate input
		response = parseInt(response);
		// Convert to ms and divide by 3 to calculate round time
		response = Math.round(response*1000/3);
		if (response < 20000) {
			dialog.showMessage("At least 60 seconds are required.");
			response = 20000;
		}
		
		changeMaximumTime(response, showMenu);
		
	}, "How many seconds should a round last, at most?", Math.round(sMaxTimePerStage*3/1000), null, function() {playSound(CLICK_SOUND_FILE);});
}

//
// Beep sound menu item click event.
//
function menuItemBeepSoundFileChange() {
	var beepSoundFile = document.getElementById("menuItemBeepSoundFile").getElementsByClassName("menuItemValue")[0].value;
	changeBeepSoundFile(beepSoundFile, showMenu);
	
	// Play the new sound
	playSound(beepSoundFile);
}

//
// Theme menu item click event.
//
function menuItemThemeChange() {
	var styleSheet = document.getElementById("menuItemTheme").getElementsByClassName("menuItemValue")[0].value;
	changeStyleSheet(styleSheet, showMenu);
	
	// Apply the new theme
	applyTheme();
}

//
// Vibrate menu item click event.
//
function menuItemVibrateChange() {
	playSound(CLICK_SOUND_FILE);
	
	var vibrate = document.getElementById("menuItemVibrateCheckBox").checked;
	changeVibrate(vibrate, showMenu);
	
	// Vibrate if the setting was enabled
	if (vibrate && navigator.vibrate)
		navigator.vibrate(VIBRATION_DURATION);
}

//
// Tag creation menu item click event.
//
function menuItemTagCreationClick() {
	playSound(CLICK_SOUND_FILE);
	window.setTimeout(function() {
		navigateAway("https://www.kangaroostandard.com/GrabTag/tagCreation/");
	}, 100);
}

//
// Help menu item click event.
//
function menuItemHelpClick() {
	playSound(CLICK_SOUND_FILE);
	showHelp();
}

//
// About menu item click event.
//
function menuItemAboutClick() {
	playSound(CLICK_SOUND_FILE);
	showAbout();
}

//
// Score menu item click event.
//
function menuItemScoreClick(teamId) {
	playSound(CLICK_SOUND_FILE);
	
	// Get input from user
	dialog.getNumber(function(response) {
	
		// Ignore empty input
		if (response === false || response == "")
			return;
		
		// Evaluate input
		response = parseInt(response);
		if (response < 0) {
			dialog.showMessage("Nobody can have a negative score.");
			response = 0;
		}
		if (response >= sWinningPoint) {
			if (sNumberOfTeams == 2) {
				if (sNumberOfTeams == 2)
					dialog.showMessage("You can't just win that easily!");
				response = sWinningPoint - 1;
				changeScore(teamId, response);
				showMenu();
			} else {
				// Check if the user really wants to eliminate the team
				dialog.confirm(function (response) {
					if (response)
						changeScore(teamId, SCORE_ELIMINATED);
					showMenu();
				}, "This will eliminate Team " + (teamId + 1) + ". Are you sure?", function() {playSound(CLICK_SOUND_FILE);});
			}
		} else {
			changeScore(teamId, response);
			showMenu();
		}
	}, "What's the score?", scores[teamId], null, function() {playSound(CLICK_SOUND_FILE);});
}