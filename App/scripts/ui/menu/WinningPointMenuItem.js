function WinningPointMenuItem(menu) {
	
	var game = menu.getGame();
	
	var onclick = function(e) {
		var settings = game.getSettings();
		var winningPoint = settings.get(_Settings.KEY_WINNING_POINT, DEFAULT_WINNING_POINT);
		
		dialog.getNumber(null, "How many points?", winningPoint, null, function(response) {
			_UiUtil.playSound(CLICK_SOUND_FILE);
			if (response || response === 0) {
				winningPoint = parseInt(response);
				if (game.isStarted()) {
					// TODO Using the up/down buttons will allow you to bypass the dynamic min/max
					var maxScore = game.getTeamManager().getMaxScore();
					if (winningPoint <= maxScore) {
						if (winningPoint > 0) {
							dialog.showMessage("Someone already has that many points. At least one more point is required.");
						} else {
							dialog.showMessage("At least " + MIN_WINNING_POINT + " point" + (MIN_WINNING_POINT > 1? "s": "") + " must be required.");
						}
						return false;
					}
				} else {
					if (winningPoint < MIN_WINNING_POINT) {
						dialog.showMessage("At least " + MIN_WINNING_POINT + " point" + (MIN_WINNING_POINT > 1? "s": "") + " must be required.");
						return false;
					}
					if (winningPoint > MAX_WINNING_POINT) {
						dialog.showMessage("No more than " + MAX_WINNING_POINT + " points are allowed.");
						return false;
					}
				}
				settings.set(_Settings.KEY_WINNING_POINT, winningPoint);
				settings.saveAsync(game.getLocalDatabase());
				menu.load();
				return true;
			}
		});
	};
	
	var onincrease = function() {
		var settings = game.getSettings();
		var winningPoint = settings.get(_Settings.KEY_WINNING_POINT, DEFAULT_WINNING_POINT);
		settings.set(_Settings.KEY_WINNING_POINT, winningPoint + 1);
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	var ondecrease = function() {
		var settings = game.getSettings();
		var winningPoint = settings.get(_Settings.KEY_WINNING_POINT, DEFAULT_WINNING_POINT);
		settings.set(_Settings.KEY_WINNING_POINT, winningPoint - 1);
		settings.saveAsync(game.getLocalDatabase());
		menu.load();
	};
	
	/**
	 * Constructor.
	 */
	{
		return new NumericMenuItem(
				menu, 
				"menuItemWinningPoint",
				MIN_WINNING_POINT,
				MAX_WINNING_POINT);
	}
	
}
