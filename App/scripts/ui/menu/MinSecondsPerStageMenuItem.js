function MinSecondsPerStageMenuItem(menu) {

	var game = menu.getGame();
	
	var onclick = function() {
		var settings = game.getSettings();
		var minSecondsPerStage = settings.get(_Settings.KEY_MIN_SECONDS_PER_STAGE, DEFAULT_MIN_SECONDS_PER_STAGE);
		var maxSecondsPerStage = settings.get(_Settings.KEY_MAX_SECONDS_PER_STAGE, DEFAULT_MAX_SECONDS_PER_STAGE);
		
		dialog.getNumber(null, "How many seconds should a round last, at least?", minSecondsPerStage*3, null, function(response) {
			_UiUtil.playSound(CLICK_SOUND_FILE);
			if (response || response === 0) {
				minSecondsPerStage = Math.min(parseInt(response)/3);
				if (minSecondsPerStage < MIN_TIME_STAGE_SECONDS) {
					dialog.showMessage("At least " + (MIN_TIME_STAGE_SECONDS*3) + " seconds are required.");
					return false;
				}
				if (minSecondsPerStage > MAX_TIME_STAGE_SECONDS) {
					dialog.showMessage("No more than " + (MAX_TIME_STAGE_SECONDS*3) + " seconds are allowed.");
					return false;
				}
				settings.set(_Settings.KEY_MIN_SECONDS_PER_STAGE, minSecondsPerStage);
				if (minSecondsPerStage > maxSecondsPerStage) {
					settings.set(_Settings.KEY_MAX_SECONDS_PER_STAGE, minSecondsPerStage);
				}
				settings.saveAsync(game.getLocalDatabase());
				menu.load();
				return true;
			}
		});
	};
	
	var onincrease = function() {
		var settings = game.getSettings();
		var minSecondsPerStage = settings.get(_Settings.KEY_MIN_SECONDS_PER_STAGE, DEFAULT_MIN_SECONDS_PER_STAGE);
		var maxSecondsPerStage = settings.get(_Settings.KEY_MAX_SECONDS_PER_STAGE, DEFAULT_MAX_SECONDS_PER_STAGE);
		settings.set(_Settings.KEY_MIN_SECONDS_PER_STAGE, minSecondsPerStage + 1);
		if (minSecondsPerStage + 1 > maxSecondsPerStage) {
			settings.set(_Settings.KEY_MAX_SECONDS_PER_STAGE, minSecondsPerStage + 1);
		}
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	var ondecrease = function() {
		var settings = game.getSettings();
		var minSecondsPerStage = settings.get(_Settings.KEY_MIN_SECONDS_PER_STAGE, DEFAULT_MIN_SECONDS_PER_STAGE);
		var maxSecondsPerStage = settings.get(_Settings.KEY_MAX_SECONDS_PER_STAGE, DEFAULT_MAX_SECONDS_PER_STAGE);
		settings.set(_Settings.KEY_MIN_SECONDS_PER_STAGE, minSecondsPerStage - 1);
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	/**
	 * Constructor.
	 */
	{
		return new NumericMenuItem(
				menu,
				"menuItemMinimumTime",
				MIN_TIME_STAGE_SECONDS,
				MAX_TIME_STAGE_SECONDS,
				onclick,
				onincrease,
				ondecrease);
	}
	
}
