//
// Locks the UI so that the user cannot interact with it.
//
function lockUi() {
	document.getElementById("uiLock").style.display = "block";
}

//
// Unlocks the UI so that the user can interact with it once more.
//
function unlockUi() {
	document.getElementById("uiLock").style.display = "none";
}

//
// Sets the phrase on the screen.
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
			} else if (response == "Resume"){
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
// Categories menu item click event.
//
function menuItemCategoryIdsClick() {
	playSound(CLICK_SOUND_FILE);
	submitUsageClick("/menu/categories");
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
		if (response || response === 0) {
			response = parseInt(response);
			changeMaxWords(response, showMenu);
		}
	}, "How many words? (Use 0 for unlimited)", sMaxWordsPerTag, null, function(response) {
		playSound(CLICK_SOUND_FILE);
		
		// Validate input
		if (response || response === 0) {
			response = parseInt(response);
			if (response != 0 && response < 1) {
				dialog.showMessage("Phrases must contain at least one word.");
				return false;
			}
		}
	});
}

//
// Max words menu item increase event.
//
function menuItemMaxWordsIncrease() {
	changeMaxWords(sMaxWordsPerTag + 1, showMenu);
}

//
// Max words menu item decrease event.
//
function menuItemMaxWordsDecrease() {
	changeMaxWords(sMaxWordsPerTag - 1, showMenu);
}

//
// Max characters menu item click event.
//
function menuItemMaxCharactersClick() {
	playSound(CLICK_SOUND_FILE);
	
	// Get input from the user
	dialog.getNumber(function(response) {
		if (response || response === 0) {
			response = parseInt(response);
			changeMaxCharacters(response, showMenu);
		}
	}, "How many characters? (Use 0 for unlimited)", sMaxCharactersPerTag, null, function(response) {
		playSound(CLICK_SOUND_FILE);
		
		if (response || response === 0) {
			// Validate input
			response = parseInt(response);
			if (response != 0 && response < MIN_MAX_CHARACTERS) {
				dialog.showMessage("Use at least " + MIN_MAX_CHARACTERS + " characters.");
				return false;
			}
		}
		
	});
}

//
// Max characters menu item increase event.
//
function menuItemMaxCharactersIncrease() {
	if (sMaxCharactersPerTag == 0) {
		changeMaxCharacters(MIN_MAX_CHARACTERS, showMenu);
	} else {
		changeMaxCharacters(sMaxCharactersPerTag + 1, showMenu);
	}
}

//
// Max characters menu item decrease event.
//
function menuItemMaxCharactersDecrease() {
	if (sMaxCharactersPerTag <= MIN_MAX_CHARACTERS) {
		changeMaxCharacters(0, showMenu);
	} else {
		changeMaxCharacters(sMaxCharactersPerTag - 1, showMenu);
	}
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
		}, true, "Adult-Only Phrases", "I Agree");
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
		if (response || response === 0) {
			response = parseInt(response);
			changeWinningPoint(response, showMenu);
		}
	}, "How many points?", sWinningPoint, null, function(response) {
		playSound(CLICK_SOUND_FILE);
		
		if (response || response === 0) {
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
						dialog.showMessage("At least " + MIN_WINNING_POINT + " point" + (MIN_WINNING_POINT > 1? "s": "") + " must be required.");
					return false;
				}
			} else {
				if (response < MIN_WINNING_POINT) {
					dialog.showMessage("At least " + MIN_WINNING_POINT + " point" + (MIN_WINNING_POINT > 1? "s": "") + " must be required.");
					return false;
				}
				if (response > MAX_WINNING_POINT) {
					dialog.showMessage("No more than " + MAX_WINNING_POINT + " points are allowed.");
					return false;
				}
			}
		}
	});
}

//
// Winning point menu item increase event.
//
function menuItemWinningPointIncrease() {
	changeWinningPoint(sWinningPoint + 1, showMenu);
}

//
//Winning point menu item increase event.
//
function menuItemWinningPointDecrease() {
	changeWinningPoint(sWinningPoint - 1, showMenu);
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
				if (response || response === 0) {
					response = parseInt(response);
					changeNumberOfTeams(response, showMenu);
				}
			}, "How many teams?", sNumberOfTeams, null, function(response) {
				playSound(CLICK_SOUND_FILE);
				
				if (response || response === 0) {
					// Validate input
					response = parseInt(response);
					if (response < MIN_NUMBER_OF_TEAMS) {
						dialog.showMessage("At least " + MIN_NUMBER_OF_TEAMS + " team" + (MIN_NUMBER_OF_TEAMS > 1? "s": "") + " are required.");
						return false;
					} else if (response > MAX_NUMBER_OF_TEAMS) {
						dialog.showMessage("No more than " + MAX_NUMBER_OF_TEAMS + " teams are allowed.");
						return false;
					}
				}
			});
			
		}
	};
	
	// Only change the number of teams if the game is already over or if the user says it's okay
	if (gameOver)
		executeResponse(true);
	else
		dialog.confirm(executeResponse, "The current game will end. Is that okay?");
}

//
// Number of teams menu item increase event.
//
function menuItemNumberOfTeamsIncrease() {
	changeNumberOfTeams(sNumberOfTeams + 1, showMenu);
}

//
// Number of teams menu item decrease event.
//
function menuItemNumberOfTeamsDecrease() {
	changeNumberOfTeams(sNumberOfTeams - 1, showMenu);
}

//
// Minimum time menu item click event.
//
function menuItemMinimumTimeClick() {
	playSound(CLICK_SOUND_FILE);
	
	// Get input from the user
	dialog.getNumber(function(response) {
		if (response || response === 0) {
			response = parseInt(response);
			// Convert to ms and divide by 3 to calculate the round time
			response = Math.round(response*1000/3);
			changeMinimumTime(response, showMenu);
		}
	}, "How many seconds should a round last, at least?", Math.round(sMinTimePerStage*3/1000), null, function(response) {
		playSound(CLICK_SOUND_FILE);
		
		if (response || response === 0) {
			// Validate input
			response = parseInt(response);
			// Convert to ms and divide by 3 to calculate the round time
			response = Math.round(response*1000/3);
			if (response < Math.round(MIN_ROUND_SECONDS*1000/3)) {
				dialog.showMessage("At least " + MIN_ROUND_SECONDS + " seconds are required.");
				return false;
			}
		}
	});
}

//
// Minimum time menu item increase event.
//
function menuItemMinimumTimeIncrease() {
	changeMinimumTime(Math.round((Math.round(sMinTimePerStage*3/1000) + 1)*1000/3), showMenu);
}

//
// Minimum time menu item decrease event.
//
function menuItemMinimumTimeDecrease() {
	changeMinimumTime(Math.round((Math.round(sMinTimePerStage*3/1000) - 1)*1000/3), showMenu);
}

//
// Maximum time menu item click event.
//
function menuItemMaximumTimeClick() {
	playSound(CLICK_SOUND_FILE);
	
	// Get input from the user
	dialog.getNumber(function(response) {
		if (response || response === 0) {
			response = parseInt(response);
			// Convert to ms and divide by 3 to calculate round time
			response = Math.round(response*1000/3);
			changeMaximumTime(response, showMenu);
		}
	}, "How many seconds should a round last, at most?", Math.round(sMaxTimePerStage*3/1000), null, function(response) {
		playSound(CLICK_SOUND_FILE);
		
		if (response || response === 0) {
			// Validate input
			response = parseInt(response);
			// Convert to ms and divide by 3 to calculate round time
			response = Math.round(response*1000/3);
			if (response < Math.round(MIN_ROUND_SECONDS*1000/3)) {
				dialog.showMessage("At least " + MIN_ROUND_SECONDS + " seconds are required.");
				return false;
			}
		}
	});
}

//
// Maximum time menu item increase event.
//
function menuItemMaximumTimeIncrease() {
	changeMaximumTime(Math.round((Math.round(sMaxTimePerStage*3/1000) + 1)*1000/3), showMenu);
}

//
// Maximum time menu item decrease event.
//
function menuItemMaximumTimeDecrease() {
	changeMaximumTime(Math.round((Math.round(sMaxTimePerStage*3/1000) - 1)*1000/3), showMenu);
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
// Phrase creation menu item click event.
//
function menuItemTagCreationClick() {
	playSound(CLICK_SOUND_FILE);
	submitUsageClick("/menu/tagCreation");
	window.setTimeout(function() {
		navigateAway(TAG_CREATION_URL);
	}, 100);
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