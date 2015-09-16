/**
 * @param game the game.
 */
function Menu(game) {
	
	var self = this;
	var closeMenuItem;
	var customPhrasesMenuItem;
	var winningPointMenuItem;
	var numberOfTeamsMenuItem;
	var minSecondsPerStageMenuItem;
	var maxSecondsPerStageMenuItem;
	
	var element = document.getElementById("mainMenu");
	var maxSecondsPerStageValueElement = document.getElementById("menuItemMaximumTime").getElementsByClassName("menuItemValue")[0];
	var maxSecondsPerStageDecreaseElement = document.getElementById("menuItemMaximumTimeDecrease");
	var difficultySelectElement = document.getElementById("menuItemDifficulty").getElementsByClassName("menuItemValue")[0];
	var categoriesElement = document.getElementById("menuItemCategoryIds");
	var categoriesValueElement = categoriesElement.getElementsByClassName("menuItemValue")[0];
	var maxWordsElement = document.getElementById("menuItemMaxWords");
	var maxWordsValueElement = maxWordsElement.getElementsByClassName("menuItemValue")[0];
	var maxWordsIncreaseElement = document.getElementById("menuItemMaxWordsIncrease");
	var maxWordsDecreaseElement = document.getElementById("menuItemMaxWordsDecrease");
	var maxCharactersElement = document.getElementById("menuItemMaxCharacters");
	var maxCharactersValueElement = maxCharactersElement.getElementsByClassName("menuItemValue")[0];
	var maxCharactersDecreaseElement = document.getElementById("menuItemMaxCharactersDecrease");
	var beepSoundFileSelectElement = document.getElementById("menuItemBeepSoundFile").getElementsByClassName("menuItemValue")[0];
	var themeStyleFileSelectElement = document.getElementById("menuItemTheme").getElementsByClassName("menuItemValue")[0];
	var vibrateCheckBoxElement = document.getElementById("menuItemVibrateCheckBox");
	var showCategoryCheckBoxElement = document.getElementById("menuItemShowCategoryCheckBox");
	var adultCheckBoxElement = document.getElementById("menuItemEdgyCheckBox");
	var scoreSettingsElement = document.getElementById("scoreSettings");
	
	/**
	 * Shows the categories dialog when the categories menu item is clicked.
	 */
	var onCategoriesElementClicked = function() {
		_UiUtil.playSound(CLICK_SOUND_FILE);
		// TODO submit "/menu/categories"
		// TODO showCategories();
	};
	
	/**
	 * Updates the difficulty setting when the difficulties menu item is 
	 * changed.
	 */
	var onDifficultySelectElementChanged = function() {
		_UiUtil.playSound(CLICK_SOUND_FILE);
		var difficultyId = difficultySelectElement.value;
		var settings = game.getSettings();
		settings.set(_Settings.KEY_DIFFICULTY_ID, difficultyId);
		settings.saveAsync(game.getLocalDatabase());
		self.load();
	};
	
	/**
	 * Shows the max words dialog and updates the max words setting when the 
	 * max words menu item is clicked.
	 */
	var onMaxWordsElementClicked = function() {
		_UiUtil.playSound(CLICK_SOUND_FILE);
		
		var settings = game.getSettings();
		var maxWordsPerPhrase = settings.get(_Settings.KEY_MAX_WORDS_PER_PHRASE, DEFAULT_MAX_WORDS_PER_PHRASE);
		
		dialog.getNumber(null, "How many words? (Use 0 for unlimited)", maxWordsPerPhrase, null, function(response) {
			_UiUtil.playSound(CLICK_SOUND_FILE);
			if (response || response === 0) {
				maxWordsPerPhrase = parseInt(response);
				if (maxWordsPerPhrase != 0 && maxWordsPerPhrase < 1) {
					dialog.showMessage("Phrases must contain at least one word.");
					return false;
				} else {
					settings.set(_Settings.KEY_MAX_WORDS_PER_PHRASE, maxWords);
					settings.saveAsync(game.getLocalDatabase());
					self.load();
					return true;
				}
			}
		});
	};
	
	/**
	 * Increases the max words setting when the max words increase button is 
	 * clicked.
	 * @param e the event
	 */
	var onMaxWordsIncreaseElementClicked = function(e) {
		e.stopPropagation();
		var settings = game.getSettings();
		var maxWordsPerPhrase = settings.get(_Settings.KEY_MAX_WORDS_PER_PHRASE, DEFAULT_MAX_WORDS_PER_PHRASE);
		settings.set(_Settings.KEY_MAX_WORDS_PER_PHRASE, maxWordsPerPhrase + 1);
		settings.saveAsync(game.getLocalDatabase());
		self.load();
	};
	
	/**
	 * Decreases the max words setting when the max words decrease button is 
	 * clicked.
	 * @param e the event
	 */
	var onMaxWordsDecreaseElementClicked = function(e) {
		e.stopPropagation();
		var settings = game.getSettings();
		var maxWordsPerPhrase = settings.get(_Settings.KEY_MAX_WORDS_PER_PHRASE, DEFAULT_MAX_WORDS_PER_PHRASE);
		settings.set(_Settings.KEY_MAX_WORDS_PER_PHRASE, maxWordsPerPhrase - 1);
		settings.saveAsync(game.getLocalDatabase());
		self.load();
	};
	
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
		
		if (numberOfTeams > 2) {
			winningPointElement.setName("Points for elimination");
		} else {
			winningPointElement.setName("Points to win");
		}
		
		winningPointMenuItem.setValue(winningPoint);
		numberOfTeamsMenuItem.setValue(numberOfTeams);
		minSecondsPerStageMenuItem.setValue(minSecondsPerStage);
		maxSecondsPerStageMenuItem.setValue(maxSecondsPerStage);
		
		// TODO Left off here converting to individual classes
		difficultySelectElement.value = difficulyId;
		
		if (selectedCategories == _Category.ALL) {
			categoriesValueElement.innerHTML = "All";
		} else {
			if (selectedCategories.length > 1) {
				categoriesValueElement.innerHTML = selectedCategories.length + " categories";
			} else {
				categoriesValueElement.innerHTML = _HtmlUtil.htmlEncode(selectedCategories[0].name);
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
		
		scoreSettingsElement.innerHTML = "";
		if (game.isStarted()) {
			scoreSettingsElement.innerHTML = "<div class=\"menuHeader\">Score</div>";
			
			if (game.getTeamManager().hasScore()) {
				var resetScoresElement = document.createElement("div");
				resetScoresElement.id = "menuItemRestartGame";
				resetScoresElement.className = "menuItem";
				resetScoresElement.onclick = function() {
					// TODO Fix this
					menuItemRestartGameClick();
				};
				resetScoresElement.innerHTML = "<span class=\"menuItemName\">Reset scores</span>";
				scoreSettingsElement.appendChild(resetScoresElement);
			}
			
			var teams = game.getTeamManager().getTeams();
			for (var i = 0; i < teams.length; i++) {
				var team = teams[i];
				var scoreElement = document.createElement("div");
				scoreElement.id = "menuItemScore" + i;
				scoreElement.className = "menuItem";
				scoreElement.team = team;
				scoreElement.onclick = function() {
					// TODO Fix this
					menuItemScoreClick(this.teamId);
				};
				scoreElement.innerHTML = "<span class=\"menuItemName\">" + _HtmlUtil.htmlEncode(team.name) + "</span>: " + 
						"<span class=\"menuItemValue\">" + team.score + "</span>";
				scoreSettingsElement.appendChild(scoreElement);
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
	
	/**
	 * Constructor.
	 */
	{
		closeMenuItem = new CloseMenuItem(this);
		customPhrasesMenuItem = new CustomPhrasesMenuItem(this);
		winningPointMenuItem = new WinningPointMenuItem(this);
		numberOfTeamsMenuItem = new NumberOfTeamsMenuItem(this);
		minSecondsPerStageMenuItem = new MinSecondsPerStageMenuItem(this);
		maxSecondsPerStageMenuItem = new MaxSecondsPerStageMenuItem(this);
		
		categoriesElement.onclick = onCategoriesElementClicked;
		difficultySelectElement.onchange = onDifficultySelectElementChanged;
		maxWordsElement.onclick = onMaxWordsElementClicked;
		maxWordsIncreaseElement.onclick = onMaxWordsIncreaseElementClicked;
		maxWordsDecreaseElement.onclick = onMaxWordsDecreaseElementClicked;
		maxCharactersElement.onclick = onMaxCharactersElementClicked;
	}
	
}
