{
	_TeamManager = {
		SCORE_ELIMINATED: "out"
	};
}

/**
 * @param callback a function to call when a winner is determined, passing the 
 * winning team as the argument.
 */
function TeamManager(callback) {
	
	var teams;
	var winCallback;
	
	/**
	 * Creates a number of teams, replacing any previous teams.
	 * @param settings the settings to base the new teams on.
	 * @return the new teams.
	 */
	this.initializeTeams = function(settings) {
		var numberOfTeams = settings.get(_Settings.KEY_NUMBER_OF_TEAMS, DEFAULT_NUMBER_OF_TEAMS);
		var teamNames = settings.get(_Settings.KEY_TEAM_NAMES, DEFAULT_TEAM_NAMES);
		
		teams = [];
		for (var i = 0; i < numberOfTeams; i++) {
			var team = new Team(i, teamNames[i], 0);
			teams.push(team);
		}
		
		return teams;
	};
	
	/**
	 * Gets the team with the specified ID.
	 * @param id the ID of the team to get.
	 * @return the team.
	 */
	this.getTeam = function(id) {
		return teams[id];
	};
	
	/**
	 * @return the teams.
	 */
	this.getTeams = function() {
		return teams;
	};
	
	/**
	 * Gets the teams that are active in the game (not eliminated from 3+ team 
	 * play).
	 */
	this.getActiveTeams = function() {
		var activeTeams = [];
		for (var i = 0; i < teams.length; i++) {
			var team = teams[i];
			if (team.score != _TeamManager.SCORE_ELIMINATED) {
				activeTeams.push(team);
			}
		}
		return activeTeams;
	};
	
	/**
	 * Checks if any team has scored any points.
	 * @return true if at least one team has scored at least one point, false 
	 * otherwise.
	 */
	this.hasScore = function() {
		for (var i = 0; i < teams.length; i++) {
			if (teams[i].score > 0) {
				return true;
			}
		}
		return false;
	};
	
	/**
	 * @return the score of the winning team.
	 */
	this.getMaxScore = function() {
		var maxScore = 0;
		for (var i = 0; i < teams.length; i++) {
			if (teams[i].score > maxScore) {
				maxScore = teams[i].score;
			}
		}
		return maxScore;
	};
	
	/**
	 * Sets the score for all teams to 0.
	 */
	this.resetScores = function() {
		for (var i = 0; i < teams.length; i++) {
			teams[i].score = 0;
		}
	};
	
}
