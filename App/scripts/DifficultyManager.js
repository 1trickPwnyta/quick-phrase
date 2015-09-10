function DifficultyManager() {
	
	var difficulties;
	
	/**
	 * Loads the difficulty levels from the web service or local database.
	 * @param localDatabase the local database.
	 * @param callback a function to call when loading is complete.
	 */
	this.loadAsync = function(localDatabase, callback) {
		localDatabase.readDifficultiesAsync(function(difficultiesFromDatabase) {
			difficulties = difficultiesFromDatabase;
			if (callback) {
				callback();
			}
		});
	};
	
	/**
	 * Saves the difficulty levels in the local database.
	 * @param localDatabase the local database.
	 * @param callback a function to call when saving is complete.
	 */
	this.saveAsync = function(localDatabase, callback) {
		localDatabase.readDifficultiesAsync(function(difficultiesFromDatabase) {
			var toCreate = [], toUpdate = [], toDelete = [];
			_ArrayUtil.compare(difficulties, difficultiesFromDatabase, function(a, b) {
				return a.id == b.id;
			}, toCreate, toUpdate, toDelete);
			
			var operationsRemaining = 3;
			var checkIfFinished = function() {
				if (--operationsRemaining <= 0 && callback) {
					if (--savesRemaining <= 0) {
						callback();
					}
				}
			};
			localDatabase.createDifficultiesAsync(toCreate, checkIfFinished);
			localDatabase.updateDifficultiesAsync(toUpdate, checkIfFinished);
			localDatabase.deleteDifficultiesAsync(toDelete, checkIfFinished);
		});
	};
	
	/**
	 * @return the difficulty levels.
	 */
	this.getDifficultyLevels = function() {
		return difficulties;
	};
	
}
