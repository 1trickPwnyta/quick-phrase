function NumberOfTeamsMenuItem(menu) {
	
	var game = menu.getGame();
	
	var onclick = function(e) {
		var settings = game.getSettings();
		var numberOfTeams = settings.get(_Settings.KEY_NUMBER_OF_TEAMS, DEFAULT_NUMBER_OF_TEAMS);
		
		var showNumberOfTeamsDialog = function() {
			dialog.getNumber(null, "How many teams?", numberOfTeams, null, function(response) {
				_UiUtil.playSound(CLICK_SOUND_FILE);
				if (response || response === 0) {
					numberOfTeams = parseInt(response);
					if (numberOfTeams < MIN_NUMBER_OF_TEAMS) {
						dialog.showMessage("At least " + MIN_NUMBER_OF_TEAMS + " teams are required.");
						return false;
					} else if (numberOfTeams > MAX_NUMBER_OF_TEAMS) {
						dialog.showMessage("No more than " + MAX_NUMBER_OF_TEAMS + " teams are allowed.");
						return false;
					}
					settings.set(_Settings.KEY_NUMBER_OF_TEAMS, numberOfTeams);
					settings.saveAsync(game.getLocalDatabase());
					game.newGame();
					menu.load();
					return true;
				}
			});
		};
		
		if (!game.isStarted()) {
			showNumberOfTeamsDialog();
		} else {
			dialog.confirm(function(response) {
				if (response) {
					showNumberOfTeamsDialog();
				}
			}, "The current game will end. Is that okay?");
		}
	};
	
	var onincrease = function() {
		var settings = game.getSettings();
		var numberOfTeams = settings.get(_Settings.KEY_NUMBER_OF_TEAMS, DEFAULT_NUMBER_OF_TEAMS);
		
		var increase = function() {
			settings.set(_Settings.KEY_NUMBER_OF_TEAMS, numberOfTeams + 1);
			settings.saveAsync(game.getLocalDatabase());
			game.newGame();
			menu.load();
		};
		
		if (!game.isStarted()) {
			increase();
		} else {
			dialog.confirm(function(response) {
				if (response) {
					increase();
				}
			}, "The current game will end. Is that okay?");
		}
	};
	
	var ondecrease = function() {
		var settings = game.getSettings();
		var numberOfTeams = settings.get(_Settings.KEY_NUMBER_OF_TEAMS, DEFAULT_NUMBER_OF_TEAMS);
		
		var decrease = function() {
			settings.set(_Settings.KEY_NUMBER_OF_TEAMS, numberOfTeams - 1);
			settings.saveAsync(game.getLocalDatabase());
			game.newGame();
			menu.load();
		};
		
		if (!game.isStarted()) {
			decrease();
		} else {
			dialog.confirm(function(response) {
				if (response) {
					decrease();
				}
			}, "The current game will end. Is that okay?");
		}
	};
	
	/**
	 * Constructor.
	 */
	{
		return new NumericMenuItem(
				menu,
				"menuItemNumberOfTeams",
				MIN_NUMBER_OF_TEAMS,
				MAX_NUMBER_OF_TEAMS,
				onclick,
				onincrease,
				ondecrease);
	}
	
}
