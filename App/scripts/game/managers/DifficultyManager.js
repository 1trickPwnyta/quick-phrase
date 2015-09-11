function DifficultyManager(localDatabase) {
	
	var loaded = false;
	var difficulties;
	
	/**
	 * Loads the difficulty levels from the web service or local database.
	 * @param callback a function to call when loading is complete.
	 */
	this.loadAsync = function(callback) {
		localDatabase.readDifficultiesAsync(function(difficultiesFromDatabase) {
			difficulties = difficultiesFromDatabase;
			loaded = true;
			_Log.info("Loaded " + difficulties.length + " difficulties from the local database.");
			
			if (callback) {
				callback();
			}
		});
	};
	
	/**
	 * Saves the difficulty levels in the local database.
	 * @param callback a function to call when saving is complete.
	 */
	this.saveAsync = function(callback) {
		if (loaded) {
			localDatabase.readDifficultiesAsync(function(difficultiesFromDatabase) {
				var toCreate = [], toUpdate = [], toDelete = [];
				_ArrayUtil.compare(difficulties, difficultiesFromDatabase, function(a, b) {
					return a.id == b.id;
				}, toCreate, toUpdate, toDelete);
				
				var operationsRemaining = 3;
				var checkIfFinished = function() {
					if (--operationsRemaining <= 0 && callback) {
						callback();
					}
				};
				localDatabase.createDifficultiesAsync(toCreate, checkIfFinished);
				localDatabase.updateDifficultiesAsync(toUpdate, checkIfFinished);
				localDatabase.deleteDifficultiesAsync(toDelete, checkIfFinished);
			});
		} else {
			_Log.error("Attempted to save difficulties without loading first.");
		}
	};
	
	/**
	 * @return the difficulties.
	 */
	this.getDifficulties = function() {
		if (!loaded) {
			_Log.error("Attempted to get difficulties without loading first.");
		}
		return difficulties;
	};
	
}
