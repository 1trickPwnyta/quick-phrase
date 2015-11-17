var settingsCount = 19;								// Must be equal to the number of settings below

var sMinTimePerStage = 								// Minimum ms for each time stage
		DEFAULT_MIN_TIME_PER_STAGE;
var sMaxTimePerStage = 								// Maximum ms for each time stage
		DEFAULT_MAX_TIME_PER_STAGE;
var sNumberOfTeams = DEFAULT_NUMBER_OF_TEAMS;		// Number of teams playing the game
var sWinningPoint = DEFAULT_WINNING_POINT;			// Points to win, or to be eliminated in 3+ team play
var sBeepSoundFile = DEFAULT_BEEP_SOUND_FILE;		// Sound file to play when the timer ticks
var sDifficulty = DEFAULT_DIFFICULTY;				// Phrase difficulty setting
var sMaxWordsPerTag = 								// Maximum words per phrase
		DEFAULT_MAX_WORDS_PER_TAG;
var sMaxCharactersPerTag = 							// Maximum characters per phrase
		DEFAULT_MAX_CHARACTERS_PER_TAG;
var sCategoryIds = DEFAULT_CATEGORY_IDS;			// Selected phrase categories
var sCustomCategoryIds = 							// Selected custom categories
		DEFAULT_CUSTOM_CATEGORY_IDS;
var sStyleSheet = DEFAULT_STYLE_SHEET;				// Path to style sheet used by theme
var sVibrate = DEFAULT_VIBRATE;						// Turns vibration on
var sEdgy = DEFAULT_EDGY;							// Allows adult-only phrases
var sTeamNames = DEFAULT_TEAM_NAMES;				// Non-default team names
var sShowCategory = DEFAULT_SHOW_CATEGORY;			// Whether to show phrase categories in-game
var sDeveloperMode = DEFAULT_DEVELOPER_MODE;		// Whether to enable developer mode (no usage reporting)
var sDataVersion = DEFAULT_DATA_VERSION;			// The app version of the stored data (if any)
var sPromptForRating = 								// Whether to prompt the user to rate the app
		DEFAULT_PROMPT_FOR_RATING;
var sGamesSinceRatingPrompt = 						// Number of games completed since the last app rating prompt
		DEFAULT_GAMES_SINCE_RATING_PROMPT;
