function ScoreBoard() {
	
	var element = document.getElementById("scores");
	
	/**
	 * Shows the scores for the specified teams on the scoreboard.
	 */
	this.showScores(teams) {
		element.innerHTML = "";
		
		// Get the score for each team
		for (var i = 0; i < teams.length; i++) {
			var team = teams[i];
			
			var teamDiv = document.createElement("a");
			teamDiv.className = "teamScore";
			
			// Position the score button depending on what team this is
			teamDiv.style.left = (6 + (i%2)*47) + "%";
			teamDiv.style.top = (10 + Math.floor(i/2)*8) + "%";
			
			teamDiv.innerHTML = (team.name.length > 8? team.name.substring(0, 7) + "...": team.name) + ": " + team.score;
			teamDiv.href = "#";
			teamDiv.team = team;
			
			teamDiv.onclick = function() {
				// TODO This needs to be updated
				scoreButtonClick(this);
				return false;
			};
			
			_UiUtil.setOnlongclick(teamDiv, function() {
				// TODO This needs to be updated
			});
			
			element.appendChild(teamDiv);
		}
	};
	
}
