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
