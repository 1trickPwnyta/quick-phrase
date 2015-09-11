

//
// Ends any game in progress, and starts a new one if start is true.
//
function newGame(start) {
	resetScores();
	loadScores();
	pointGiven = true;
	gameOver = !start;
	hideConfetti();
	document.getElementById("usedTagsButton").style.display = "none";
	usedTags = new Array();
}

//
// Returns the next phrase from the list of loaded phrases, loads more if necessary
//
function nextTag() {
	// Pop the next phrase from the loaded tag list
	var nextTag = tags.pop();
	
	// Load more phrases if we're running low
	if (tags.length <= TAG_RELOAD_QUANTITY && !loadingTags)
		loadTags();
		
	return nextTag;
}

//
// A timer tick
//
function beep() {
	// Effects
	playSound(sBeepSoundFile);
	if (sVibrate && navigator.vibrate)
		navigator.vibrate(VIBRATION_DURATION);
	
	// Check if the time stage has advanced since the last beep
	if (timeStageAtLastBeep != timeStage) {
		// Stop the beep timer interval so we can set a shorter one
		if (beepTimer != null)
			clearInterval(beepTimer);
		
		// Determine an appropriate beep interval for the new time stage
		var interval;
		switch (timeStage) {
			case TIME_STAGE_1: interval = BEEP_INTERVAL*3; break;
			case TIME_STAGE_2: interval = BEEP_INTERVAL*2; break;
			case TIME_STAGE_FINAL: interval = BEEP_INTERVAL; break;
		}
		
		// Set the new beep interval
		beepTimer = window.setInterval(beep, interval);
	}
	
	// Remember the time stage for the next beep
	timeStageAtLastBeep = timeStage;
}

//
// Advances to the next time stage
//
function advanceTimeStage(stopped) {
	timeStage++;
	
	// Check if the round is over now
	if (timeStage > TIME_STAGE_FINAL) {
	
		// Stop the beep timer interval
		if (beepTimer != null)
			clearInterval(beepTimer);
			
		// Stop the time stage timer timeout
		if (timeStageTimer != null)
			clearTimeout(timeStageTimer);
		
		// Effects
		playSound(TIME_UP_SOUND_FILE);
		if (sVibrate && navigator.vibrate)
			navigator.vibrate(VIBRATION_DURATION*5);
		setTag("Time's up!");
		document.getElementById("menuButtonIcon").src = "images/menu.png";
		document.getElementById("usedTagsButton").style.display = "block";
		
		// Reset the time stage
		timeStage = TIME_STAGE_NOT_STARTED;
		
		// Remember a point has not yet been given for the round that just ended
		pointGiven = false;
		
		// Allow the device to sleep now that the round is over
		if (PHONEGAP) {
			window.plugins.insomnia.allowSleepAgain();
		}
		
		// Disable the next button to prevent accidental starting of the next round
		disableNext();
		window.setTimeout(enableNext, 1000);
		
		if (!stopped) {
			submitUsageClick("/round/complete");
		}
		
	} else {
		document.getElementById("menuButtonIcon").src = "images/pause.png";
		document.getElementById("usedTagsButton").style.display = "none";
		
		// Set a new timeout for advancing the time stage again
		timeStageStartTime = (new Date()).getTime();
		timeStageLength = sMinTimePerStage + Math.floor((Math.random() * (sMaxTimePerStage - sMinTimePerStage)));
		timeStageTimer = window.setTimeout(advanceTimeStage, timeStageLength);
	}
	
	// If the round just started, perform the very first timer tick
	if (timeStage == TIME_STAGE_1) {
		usedTags = new Array();
		beep();
		
		// Don't allow the device to sleep while the round is in progress
		if (PHONEGAP) {
			window.plugins.insomnia.keepAwake();
		}
		
		submitUsageClick("/round/start");
		submitSettings();
	}
}

//
// Pauses the game.
//
function pause() {
	submitUsageClick("/game/pause");
	
	// Find out how much time is remaining in the current time stage
	timeStageTimeRemaining = timeStageLength - ((new Date()).getTime() - timeStageStartTime);
	
	// Stop the beep timer interval
	if (beepTimer != null)
		clearInterval(beepTimer);
		
	// Stop the time stage timer timeout
	if (timeStageTimer != null)
		clearTimeout(timeStageTimer);
	
	// Allow the device to sleep now that the game is paused
	if (PHONEGAP) {
		window.plugins.insomnia.allowSleepAgain();
	}
	
	timeStage = TIME_STAGE_NOT_STARTED;
}

//
// Unpauses the game.
//
function unpause() {
	submitUsageClick("/game/resume");
	
	// Reset the timeout for advancing the time stage with the remaining time
	timeStageTimer = window.setTimeout(advanceTimeStage, timeStageTimeRemaining);
	
	var currentTimeStage = timeStageAtLastBeep;
	timeStageAtLastBeep = TIME_STAGE_NOT_STARTED;
	timeStage = currentTimeStage;
	beep();
	
	// Don't allow the device to sleep while the round is in progress
	if (PHONEGAP) {
		window.plugins.insomnia.keepAwake();
	}
}

//
// Loads more phrases, erasing any previously loaded unused phrases if eraseOldTags is true
//
function loadTags(eraseOldTags, callback) {
	// Remember we are in the middle of loading more phrases
	loadingTags = true;
	
	// If erasing old phrases, start with an empty array
	if (eraseOldTags)
		tags = new Array();
	
	// Try to load more phrases from the web service first
	loadTagsFromWebService(function(success) {
		// If the web service call failed, try the local database
		if (!success) {
			loadTagsFromLocalDatabase(function() {
				// If no phrases are loaded, that's an error
				loadingTags = false;
				if (tags.length == 0) {
					showLoadingError();
				} else if (callback) {
					callback();
				}
			});
		} else {
			loadingTags = false;
			if (callback)
				callback();
		}
	});
	
	// TODO this:
	/*
	 * // Add the resulting phrases to the list
				var newTags = new Array();
				for (var i = 0; i < res.rows.length; i++) {
					var tag = res.rows.item(i);
					tag.text = tag.tag;
					newTags.push(tag);
				}
				
				// Remove previously used or duplicate phrases
				processPhraseLoad(newTags);
				
				// Inject custom phrases
				countTagsInLocalDatabase(function(phrasesAvailable) {
					injectCustomPhrases(newTags, phrasesAvailable, function() {
						if (!PHONEGAP) {
							// Still need to randomize the list
							shuffle(newTags);
						}
						
						for (var i = 0; i < newTags.length; i++)
							tags.push(newTags[i]);
						
						if (callback)
							callback();
					});
				});
	 */
}

//
// Process a load of phrases, removing any that have already been used.
//
function processPhraseLoad(phraseLoad) {
	var phrasesRemoved = new Array();
	var originalPhraseLoadSize = phraseLoad.length;
	
	for (var i = 0; i < phraseLoad.length; i++) {
		// If we removed half of the phrases that were loaded, forget about the used phrases and start over
		if (phrasesRemoved.length >= originalPhraseLoadSize/2) {
			usedTagsOverall = new Array();
			for (var j = 0; j < phrasesRemoved.length; j++) {
				phraseLoad.push(phrasesRemoved[j]);
			}
			break;
		}
		
		var removed = false;
		for (var j = 0; j < usedTagsOverall.length; j++) {
			if (phraseLoad[i].text == usedTagsOverall[j].text) {
				phrasesRemoved.push(phraseLoad[i]);
				phraseLoad.splice(i--, 1);
				removed = true;
				break;
			}
		}
		if (removed) {
			continue;
		}
		for (var j = 0; j < tags.length; j++) {
			if (phraseLoad[i].text == tags[j].text) {
				phraseLoad.splice(i--, 1);
				break;
			}
		}
	}
}

//
// Loads all possible difficulty settings.
//
function loadDifficulties() {
	// Try to load difficulties from web service first
	loadDifficultiesFromWebService(function(success) {
		// If the web service call failed, try the local database
		if (!success)
			loadDifficultiesFromLocalDatabase(function() {
				// If no difficulties are loaded, that's an error
				if (difficulties.length <= 1)
					showLoadingError();
				else
					updateDifficultySelector();
			});
		else
			updateDifficultySelector();
	});
}

//
// Loads all the possible categories in the game.
//
function loadCategories() {
	// Try to load categories from web service first
	loadCategoriesFromWebService(function(success) {
		// If the web service call failed, try the local database
		if (!success) {
			loadCategoriesFromLocalDatabase(function() {
				// If no categories are loaded, that's an error
				if (categories.length <= 1)
					showLoadingError();
				else {
					loadCustomCategories();
				}
			});
		} else {
			loadCustomCategories();
		}
	});
}

//
// Loads all custom categories into the main category array
//
function loadCustomCategories(callback) {
	for (var i = 0; i < categories.length; i++) {
		if (categories[i].isCustom) {
			categories.splice(i--, 1);
		}
	}
	loadCustomCategoriesFromLocalDatabase(function(customCategories) {
		cleanCustomCategories(categories, customCategories);
		
		for (var i = 0; i < customCategories.length; i++) {
			customCategories[i].isCustom = true;
			categories.push(customCategories[i]);
		}
		
		categories.sort(function(a, b) {
			if (a === "" || a.name.toLowerCase() < b.name.toLowerCase()) {
				return -1;
			} else if (b === "" || a.name.toLowerCase() > b.name.toLowerCase()) {
				return 1;
			} else {
				return 0;
			}
		});
		
		if (callback) {
			callback();
		}
	});
}

//
// Displays an error about not being able to load, if we haven't already.
//
function showLoadingError() {
	setTag("No phrases available.");
}

//
// Reloads the score display with updated stores.
//
function loadScores() {
	var scoreDiv = document.getElementById("scores");
	scoreDiv.innerHTML = "";
	
	// Get the score for each team
	for (var i = 0; i < sNumberOfTeams; i++) {
		var teamDiv = document.createElement("a");
		teamDiv.className = "teamScore";
		
		// Position the score button depending on what team this is
		teamDiv.style.left = (6 + (i%2)*47) + "%";
		teamDiv.style.top = (10 + Math.floor(i/2)*8) + "%";
		
		teamDiv.innerHTML = (sTeamNames[i].length > 8? sTeamNames[i].substring(0, 7) + "...": sTeamNames[i]) + ": " + scores[i];
		teamDiv.href = "#";
		teamDiv.team = i;
		teamDiv.onclick = function() {scoreButtonClick(this); return false;};
		teamDiv.onmouseup = function() {
			// Cancel the long press
			window.clearTimeout(pressTimer)
			return false;
		};
		(function(teamDiv) {
			teamDiv.onmousedown = function() {
				// Wait for a long press
				pressTimer = window.setTimeout(function() {
					scoreButtonLongClick(teamDiv);
				}, 1000);
				return false; 
			};
		})(teamDiv);
		scoreDiv.appendChild(teamDiv);
	}
}

//
// Ends the game in victory for the selected team.
//
function teamWin(teamId) {
	lockUi();
	
	submitUsageClick("/game/complete");
	changeGamesSinceRatingPrompt(sGamesSinceRatingPrompt + 1);
	setTag(sTeamNames[teamId] + " wins!");
	gameOver = true;
	playSound(WIN_SOUND_FILE);
	showConfetti();
	
	window.setTimeout(function() {
		if (sGamesSinceRatingPrompt >= GAMES_UNTIL_RATING_PROMPT && sPromptForRating) {
			changeGamesSinceRatingPrompt(0);
			showRatingPrompt();
		}
		unlockUi();
	}, 2500);
}

//
// Eliminates a team from 3+ team play.
//
function eliminateTeam(teamId) {
	// Update the score display
	scores[teamId] = SCORE_ELIMINATED;
	loadScores();
	
	// Check if there is only one team remaining
	var teamsRemaining = 0;
	var lastTeamNumber = 0;
	for (var i = 0; i < scores.length; i++)
		if (scores[i] != SCORE_ELIMINATED) {
			teamsRemaining++;
			lastTeamNumber = i;
		}
	
	// If only one team left, they win
	if (teamsRemaining == 1) {
		teamWin(lastTeamNumber);
	} else {
		setTag(sTeamNames[teamId] + " eliminated!");
		playSound(LOSE_SOUND_FILE);
	}
}

//
// Resets the game's scores back to zero.
//
function resetScores() {
	scores = new Array(sNumberOfTeams);
	for (var i = 0; i < scores.length; i++)
		scores[i] = 0;
		
	// This also means that there is no game in progress
	gameOver = true;
}

//
// Stops a round currently in progress.
//
function stopGame() {
	submitUsageClick("/round/stop");
	
	// Cause the round to complete
	timeStage = TIME_STAGE_FINAL;
	advanceTimeStage(true);
	timeStageAtLastBeep = TIME_STAGE_FINAL;
	
	setTag("Game stopped.");
	
	// Don't expect a point to be given for that round
	pointGiven = true;
}
