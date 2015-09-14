/**
 * @param callback a function to call when a winner is determined, passing the 
 * winning team as the argument.
 */
function TeamManager(callback) {
	
	var teams;
	var winCallback;
	
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
