/**
 * @param callback a function to call when initialization is complete.
 */
function Game(callback) {
	
	// Data
	var localDatabase;
	
	// Managers
	var phraseManager;
	var customPhraseManager;
	var categoryManager;
	var customCategoryManager;
	var difficultyManager;
	var teamManager;
	
	// Tools
	var phraseTool;
	var categoryTool;
	
	// User interface objects
	var phraseArea;
	var nextButton;
	var toolBar;
	var scoreBoard;
	var confetti;
	var menu;
	
	// Game status
	var timer;
	var gameStarted = false;
	var gamePaused = false;
	var loadingPhrases = false;
	var phraseQueue = [];
	var phrasesToReview = [];
	var promptToGivePoint = false;
	
	/**
	 * Gets the next phrase from the queue. If the queue is running low, 
	 * replenishes it.
	 */
	var getNextPhrase = function() {
		if (phraseQueue.length > 0) {
			var nextPhrase = phraseQueue[0];
			phraseQueue.splice(0, 1);
			
			if (phraseQueue.length <= TAG_RELOAD_QUANTITY && !loadingPhrases) {
				loadPhraseQueue();
			}
		} else {
			_Log.error("Attempted to get the next phrase when no phrases were queued.");
			phraseArea.showError("No phrases available.");
		}
	};
	
	/**
	 * Loads additional phrases into the queue based on the current settings.
	 */
	var loadPhraseQueue = function() {
		_Log.info("Loading phrase queue.");
		loadingPhrases = true;
		phraseTool.getMixedPhraseSetAsync(_Settings.current, TAG_LOAD_QUANTITY, function(phraseSet) {
			for (var i = 0; i < phraseSet.length; i++) {
				phraseQueue.push(phraseSet[i]);
			}
			
			// TODO Fix this call - Remove previously used or duplicate phrases
			processPhraseLoad(newTags);
			
			loadingPhrases = false;
		});
	};
	
	/**
	 * Ends the current round when the time is up.
	 */
	var onTimeUp = function() {
		_Log.info("Round complete.");
		// TODO Use web service to submit "/round/complete"
		phraseArea.showMessage("Time's up!");
		toolBar.showMenuButton();
		toolBar.showPhraseReviewButton();
		promptToGivePoint = true;
		_UiUtil.setAllowSleep(true);
		nextButton.disable(1000);
	};
	
	/**
	 * Sets or resets the game to its initial state.
	 */
	this.newGame = function() {
		_Log.info("New game.");
		gameStarted = false;
		teamManager.resetScores();
		scoreBoard.showScores(teamManager.getTeams());
		confetti.hide();
		toolBar.hidePhraseReviewButton();
		phrasesToReview = [];
	};
	
	/**
	 * Starts the game.
	 */
	this.start = function() {
		_Log.info("Game started.");
		gameStarted = true;
	};
	
	/**
	 * Starts a round. Starts the game first if not done already.
	 */
	this.startRound = function() {
		if (!gameStarted) {
			this.start();
		}
		
		_Log.info("Round started.");
		// TODO Use web service to submit "/round/start" and settings
		toolBar.showPauseButton();
		toolBar.hidePhraseReviewButton();
		phrasesToReview = [];
		_UiUtil.setAllowSleep(false);
		timer.start(onTimeUp);
	};
	
	/**
	 * Pauses a round in progress if not paused already.
	 */
	this.pause = function() {
		if (!gamePaused) {
			gamePaused = true;
			// TODO Use web service to submit "/game/pause"
			timer.pause();
			_UiUtil.setAllowSleep(true);
		}
	};
	
	/**
	 * Resumes a round in progress after being paused.
	 */
	this.resume = function() {
		if (gamePaused) {
			gamePaused = false;
			// TODO Use web service to submit "/game/resume"
			timer.resume();
			_UiUtil.setAllowSleep(false);
		}
	};
	
	/**
	 * Forgets all previously loaded phrases and reloads phrases based on the 
	 * current settings.
	 */
	this.reloadPhrases = function() {
		phraseQueue = [];
		loadPhraseQueue();
	};
	
	/**
	 * Constructor. Initializes the game.
	 */
	{
		_Log.info("Initializing the game.");
		
		localDatabase = new LocalDatabase();
		
		phraseManager = new PhraseManager(localDatabase);
		customPhraseManager = new CustomPhraseManager(localDatabase);
		categoryManager = new CategoryManager(localDatabase);
		customCategoryManager = new CustomCategoryManager(localDatabase);
		difficultyManager = new DifficultyManager(localDatabase);
		teamManager = new TeamManager();
		
		phraseTool = new PhraseTool(phraseManager, customPhraseManager);
		categoryTool = new CategoryTool(categoryManager, customCategoryManager);
		
		phraseArea = new PhraseArea();
		nextButton = new NextButton();
		toolBar = new ToolBar();
		scoreBoard = new ScoreBoard();
		confetti = new Confetti();
		menu = new Menu();
		
		timer = new Timer();
		
		// Load data using managers
		var loadsRemaining = 5;
		var categoryLoadsRemaining = 2;
		var checkIfFinishedLoading = function() {
			if (--loadsRemaining <= 0) {
				toolBar.enableMenuButton();
				if (callback) {
					callback();
				}
			}
		};
		var checkIfFinishedLoadingCategories = function() {
			if (--categoryLoadsRemaining <= 0) {
				var categories = categoryTool.getCategories();
				if (categories.length > 0) {
					menu.setCategories(categories);
					checkIfFinishedLoading();
				} else {
					phraseArea.showError("Loading failed.");
				}
			}
		};
		var checkIfFinishedLoadingDifficulties = function() {
			var difficulties = difficultyManager.getDifficulties();
			if (difficulties.length > 0) {
				menu.setDifficulties(difficulties);
				checkIfFinishedLoading();
			} else {
				phraseArea.showError("Loading failed.");
			}
		};
		phraseManager.loadAsync(checkIfFinishedLoading);
		customPhraseManager.loadAsync(checkIfFinishedLoading);
		categoryManager.loadAsync(checkIfFinishedLoadingCategories);
		customCategoryManager.loadAsync(checkIfFinishedLoadingCategories);
		difficultyManager.loadAsync(checkIfFinishedLoadingDifficulties);
	}
	
}

//
//Process a load of phrases, removing any that have already been used.
//
function processPhraseLoad(phraseLoad) {
	// TODO Need to keep track of used phrases in local database
	var phrasesRemoved = new Array();
	var originalPhraseLoadSize = phraseLoad.length;
	
	for (var i = 0; i < phraseLoad.length; i++) {
		// If we removed half of the phrases that were loaded, forget about the used phrases and start over
		if (phrasesRemoved.length >= originalPhraseLoadSize/2) {
			usedTagsOverall = new Array();
			for (var j = 0; j < phrasesRemoved.length; j++) {
				phraseLoad.push(phrasesRemoved[j]);
			}
			break;
		}
		
		var removed = false;
		for (var j = 0; j < usedTagsOverall.length; j++) {
			if (phraseLoad[i].text == usedTagsOverall[j].text) {
				phrasesRemoved.push(phraseLoad[i]);
				phraseLoad.splice(i--, 1);
				removed = true;
				break;
			}
		}
		if (removed) {
			continue;
		}
		for (var j = 0; j < tags.length; j++) {
			if (phraseLoad[i].text == tags[j].text) {
				phraseLoad.splice(i--, 1);
				break;
			}
		}
	}
}
