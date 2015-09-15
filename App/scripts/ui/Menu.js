function Menu() {
	
	var built = false;
	
	// TODO Get these from the game object when building the menu
	var categoryTool;
	var difficulties;
	
	var element = document.getElementById("mainMenu");
	var winningPointDescriptionElement = document.getElementById("winningPointDescription");
	var winningPointValueElement = document.getElementById("menuItemWinningPoint").getElementsByClassName("menuItemValue")[0];
	var winningPointIncreaseElement = document.getElementById("menuItemWinningPointIncrease");
	var winningPointDecreaseElement = document.getElementById("menuItemWinningPointDecrease");
	var numberOfTeamsValueElement = document.getElementById("menuItemNumberOfTeams").getElementsByClassName("menuItemValue")[0];
	var numberOfTeamsIncreaseElement = document.getElementById("menuItemNumberOfTeamsIncrease");
	var numberOfTeamsDecreaseElement = document.getElementById("menuItemNumberOfTeamsDecrease");
	var minSecondsPerStageValueElement = document.getElementById("menuItemMinimumTime").getElementsByClassName("menuItemValue")[0];
	var minSecondsPerStageDecreaseElement = document.getElementById("menuItemMinimumTimeDecrease");
	var maxSecondsPerStageValueElement = document.getElementById("menuItemMaximumTime").getElementsByClassName("menuItemValue")[0];
	var maxSecondsPerStageDecreaseElement = document.getElementById("menuItemMaximumTimeDecrease");
	var difficultySelectElement = document.getElementById("menuItemDifficulty").getElementsByClassName("menuItemValue")[0];
	var categoriesValueElement = document.getElementById("menuItemCategoryIds").getElementsByClassName("menuItemValue")[0];
	var maxWordsValueElement = document.getElementById("menuItemMaxWords").getElementsByClassName("menuItemValue")[0];
	var maxWordsDecreaseElement = document.getElementById("menuItemMaxWordsDecrease");
	var maxCharactersValueElement = document.getElementById("menuItemMaxCharacters").getElementsByClassName("menuItemValue")[0];
	var maxCharactersDecreaseElement = document.getElementById("menuItemMaxCharactersDecrease");
	var beepSoundFileSelectElement = document.getElementById("menuItemBeepSoundFile").getElementsByClassName("menuItemValue")[0];
	var themeStyleFileSelectElement = document.getElementById("menuItemTheme").getElementsByClassName("menuItemValue")[0];
	var vibrateCheckBoxElement = document.getElementById("menuItemVibrateCheckBox");
	var showCategoryCheckBoxElement = document.getElementById("menuItemShowCategoryCheckBox");
	var adultCheckBoxElement = document.getElementById("menuItemEdgyCheckBox");
	var scoreSettingsElement = document.getElementById("scoreSettings");
	
	/**
	 * Builds the difficulty select based on available difficulties.
	 */
	var loadDifficulties = function() {
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
	 * Shows the menu. The menu must have been built first.
	 */
	this.show = function() {
		if (!built) {
			_Log.error("Attempted to show the menu without building it first.");
		}
		element.className = "visible";
	};
	
	/**
	 * Builds the menu based on game status and settings.
	 * @param game the game.
	 * @param settings the settings.
	 */
	this.build = function(game, settings) {
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
		
		if (numberOfTeams > 2) {
			winningPointDescriptionElement.innerHTML = "Points for elimination";
		} else {
			winningPointDescriptionElement.innerHTML = "Points to win";
		}
		winningPointValueElement.innerHTML = winningPoint;
		winningPointIncreaseElement.disabled = winningPoint >= MAX_WINNING_POINT;
		winningPointDecreaseElement.disabled = winningPoint <= MIN_WINNING_POINT;
		
		numberOfTeamsValueElement.innerHTML = numberOfTeams;
		numberOfTeamsIncreaseElement.disabled = numberOfTeams >= MAX_NUMBER_OF_TEAMS;
		numberOfTeamsDecreaseElement.disabled = numberOfTeams <= MIN_NUMBER_OF_TEAMS;
		
		minSecondsPerStageValueElement.innerHTML = minSecondsPerStage;
		minSecondsPerStageDecreaseElement.disabled = minSecondsPerStage <= MIN_TIME_STAGE_SECONDS;
		maxSecondsPerStageValueElement.innerHTML = maxSecondsPerStage;
		maxSecondsPerStageDecreaseElement.disabled = maxSecondsPerStage <= MIN_TIME_STAGE_SECONDS;
		
		difficultySelectElement.value = difficulyId;
		
		if (selectedCategories == _Category.ALL) {
			categoriesValueElement.innerHTML = "All";
		} else {
			if (selectedCategories.length > 1) {
				categoriesValueElement.innerHTML = selectedCategories.length + " categories";
			} else {
				categoriesValueElement.innerHTML = categoryTool.getCategoryById(selectedCategories[0]).name;
			}
		}
		
		maxWordsValueElement.innerHTML = (maxWordsPerPhrase? maxWordsPerPhrase: "Unlimited");
		maxWordsDecreaseElement.disabled = maxWordsPerPhrase <= 0;
		maxCharactersValueElement.innerHTML = (maxCharactersPerPhrase? maxCharactersPerPhrase: "Unlimited");
		maxCharactersDecreaseElement.disabled = maxCharactersPerPhrase <= 0;
		
		beepSoundFileSelectElement.value = beepSoundFile;
		
		themeStyleFileSelectElement.value = themeStyleFile;
		
		vibrateCheckBoxElement.checked = vibrate;
		
		showCategoryCheckBoxElement.checked = showCategory;
		
		if (!APP_GOOGLEPLAY_EDITION) {
			adultCheckBoxElement.checked = adult;
		}
		
		// TODO Fix this section
		if (game.isStarted()) {
			scoreSettingsDiv.innerHTML = "<div class=\"menuHeader\">Score</div>";
			
			// Add the restart option if at least one point has been scored
			var scoreHappened = false;
			for (var i = 0; i < scores.length; i++) {
				if (scores[i] > 0) {
					scoreHappened = true;
					break;
				}
			}
			if (scoreHappened) {
				var restartGameMenuItem = document.createElement("div");
				restartGameMenuItem.id = "menuItemRestartGame";
				restartGameMenuItem.className = "menuItem";
				restartGameMenuItem.onclick = function() {
					menuItemRestartGameClick();
				};
				restartGameMenuItem.innerHTML = "Reset scores";
				scoreSettingsDiv.appendChild(restartGameMenuItem);
			}
			
			// Get the score for each team
			for (var i = 0; i < scores.length; i++) {
				var menuItem = document.createElement("div");
				menuItem.id = "menuItemScore" + i;
				menuItem.className = "menuItem";
				menuItem.teamId = i;
				menuItem.onclick = function() {
					menuItemScoreClick(this.teamId);
				};
				menuItem.innerHTML = sTeamNames[i] + ": " + scores[i];
				scoreSettingsDiv.appendChild(menuItem);
			}
		} else 
			// If the game is over, do not show the scores in the menu
			scoreSettingsDiv.innerHTML = "";
		
		built = true;
	};
	
	/**
	 * Sets the category tool to base the categories available in the menu on.
	 */
	this.setCategoryTool = function(_categoryTool) {
		categoryTool = _categoryTool;
	};
	
	/**
	 * Sets the difficulties available in the menu.
	 */
	this.setDifficulties = function(_difficulties) {
		difficulties = _difficulties;
	};
	
}
