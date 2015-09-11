function TeamManager() {
	
	var teams;
	
	/**
	 * @return the teams.
	 */
	this.getTeams = function() {
		return teams;
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
