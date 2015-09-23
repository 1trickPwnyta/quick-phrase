/**
 * @param game the game.
 */
function Menu(game) {
	
	var self = this;
	var closeMenuItem;
	var customPhrasesMenuItem;
	var categoriesMenuItem;
	var winningPointMenuItem;
	var numberOfTeamsMenuItem;
	var minSecondsPerStageMenuItem;
	var maxSecondsPerStageMenuItem;
	var difficultyMenuItem;
	var maxWordsMenuItem;
	var maxCharactersMenuItem;
	var beepSoundFileMenuItem;
	var themeStyleFileMenuItem;
	var vibrateMenuItem;
	var showCategoryMenuItem;
	var adultMenuItem;
	
	var element = document.getElementById("mainMenu");
	var scoreSettingsElement = document.getElementById("scoreSettings");
	
	/**
	 * Builds the difficulty select based on available difficulties.
	 */
	var loadDifficulties = function() {
		var difficulties = game.getDifficultyManager().getDifficulties();
		difficultySelectElement.innerHTML = "";
		for (var i = 0; i < difficulties.length; i++) {
			var option = document.createElement("option");
			option.value = difficulties[i].id;
			option.innerHTML = difficulties[i].name;
			difficultySelectElement.appendChild(option);
		}
		
		var difficultyId = _Settings.current.get(_Settings.KEY_DIFFICULTY_ID, DEFAULT_DIFFICULTY_ID);
		difficultySelectElement.value = difficultyId;
	};
	
	/**
	 * Loads or reloads the menu.
	 */
	this.load = function() {
		loadDifficulties();
		
		var settings = game.getSettings();
		var winningPoint = settings.get(_Settings.KEY_WINNING_POINT, DEFAULT_WINNING_POINT);
		var numberOfTeams = settings.get(_Settings.KEY_NUMBER_OF_TEAMS, DEFAULT_NUMBER_OF_TEAMS);
		var minSecondsPerStage = settings.get(_Settings.KEY_MIN_SECONDS_PER_STAGE, DEFAULT_MIN_SECONDS_PER_STAGE);
		var maxSecondsPerStage = settings.get(_Settings.KEY_MAX_SECONDS_PER_STAGE, DEFAULT_MAX_SECONDS_PER_STAGE);
		var difficultyId = settings.get(_Settings.KEY_DIFFICULTY_ID, DEFAULT_DIFFICULTY_ID);
		var selectedCategories = settings.get(_Settings.KEY_CATEGORY_IDS, DEFAULT_CATEGORY_IDS);
		var maxWordsPerPhrase = settings.get(_Settings.KEY_MAX_WORDS_PER_PHRASE, DEFAULT_MAX_WORDS_PER_PHRASE);
		var maxCharactersPerPhrase = settings.get(_Settings.KEY_MAX_CHARACTERS_PER_PHRASE, DEFAULT_MAX_CHARACTERS_PER_PHRASE);
		var beepSoundFile = settings.get(_Settings.KEY_BEEP_SOUND_FILE, DEFAULT_BEEP_SOUND_FILE);
		var themeStyleFile = settings.get(_Settings.KEY_THEME_STYLE_FILE, DEFAULT_THEME_STYLE_FILE);
		var vibrate = settings.get(_Settings.KEY_VIBRATE, DEFAULT_VIBRATE);
		var showCategory = settings.get(_Settings.KEY_SHOW_CATEGORY, DEFAULT_SHOW_CATEGORY);
		var adult = settings.get(_Settings.KEY_ADULT, DEFAULT_ADULT);
		
		if (selectedCategories == _Category.ALL) {
			categoriesMenuItem.setValue("All");
		} else {
			if (selectedCategories.length > 1) {
				categoriesMenuItem.setValue(selectedCategories.length + " categories");
			} else {
				categoriesMenuItem.setValue(selectedCategories[0].name);
			}
		}
		
		if (numberOfTeams > 2) {
			winningPointElement.setName("Points for elimination");
		} else {
			winningPointElement.setName("Points to win");
		}
		
		winningPointMenuItem.setValue(winningPoint);
		numberOfTeamsMenuItem.setValue(numberOfTeams);
		minSecondsPerStageMenuItem.setValue(minSecondsPerStage);
		maxSecondsPerStageMenuItem.setValue(maxSecondsPerStage);
		difficultyMenuItem.setValue(difficulyId);
		maxWordsMenuItem.setValue(maxWordsPerPhrase? maxWordsPerPhrase: "Unlimited");
		maxCharactersMenuItem.setValue(maxCharactersPerPhrase? maxCharactersPerPhrase: "Unlimited");
		beepSoundFileMenuItem.setValue(beepSoundFile);
		themeStyleFileMenuItem.setValue(themeStyleFile);
		vibrateMenuItem.setValue(vibrate);
		showCategoryMenuItem.setValue(showCategory);
		if (!APP_GOOGLEPLAY_EDITION) {
			adultMenuItem.setValue(adult);
		}
		
		scoreSettingsElement.innerHTML = "";
		if (game.isStarted()) {
			scoreSettingsElement.innerHTML = "<div class=\"menuHeader\">Score</div>";
			
			if (game.getTeamManager().hasScore()) {
				var menuItemId = "menuItemRestartGame";
				var restartGameMenuItemElement = _MenuItem.createElement(this, menuItemId);
				scoreSettingsElement.appendChild(restartGameMenuItemElement);
				var restartGameMenuItem = new RestartGameMenuItem(this, menuItemId);
				restartGameMenuItem.setName("Reset scores");
				// TODO The onclick
			}
			
			var teams = game.getTeamManager().getTeams();
			for (var i = 0; i < teams.length; i++) {
				var team = teams[i];
				var menuItemId = "menuItemScore" + i;
				var scoreMenuItemElement = _NumericMenuItem.createElement(this, menuItemId);
				scoreSettingsElement.appendChild(scoreMenuItemElement);
				var scoreMenuItem = new ScoreMenuItem(this, menuItemId, team);
				scoreMenuItem.setName(team.name);
				scoreMenuItem.setValue(team.score);
				// TODO the onclick
			}
		}
	};
	
	/**
	 * Loads and shows the menu.
	 */
	this.show = function() {
		this.load();
		element.className = "visible";
	};
	
	/**
	 * Hides the menu.
	 */
	this.hide = function() {
		element.className = "hidden";
	};
	
	/**
	 * @return the game.
	 */
	this.getGame = function() {
		return game;
	};
	
	/**
	 * Constructor.
	 */
	{
		closeMenuItem = new CloseMenuItem(this);
		customPhrasesMenuItem = new CustomPhrasesMenuItem(this);
		categoriesMenuItem = new CategoriesMenuItem(this);
		winningPointMenuItem = new WinningPointMenuItem(this);
		numberOfTeamsMenuItem = new NumberOfTeamsMenuItem(this);
		minSecondsPerStageMenuItem = new MinSecondsPerStageMenuItem(this);
		maxSecondsPerStageMenuItem = new MaxSecondsPerStageMenuItem(this);
		difficultyMenuItem = new DifficultyMenuItem(this);
		maxWordsMenuItem = new MaxWordsMenuItem(this);
		maxCharactersMenuItem = new MaxCharactersMenuItem(this);
		beepSoundFileMenuItem = new BeepSoundFileMenuItem(this);
		themeStyleFileMenuItem = new ThemeStyleFileMenuItem(this);
		vibrateMenuItem = new VibrateMenuItem(this);
		showCategoryMenuItem = new ShowCategoryMenuItem(this);
		adultMenuItem = new AdultMenuItem(this);
	}
	
}
