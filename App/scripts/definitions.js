// App information
var APP_NAME = "Catch-Phrase Panic";
var APP_VERSION = "1.2.2";
var APP_AUTHOR = "Kangaroo Standard";
var APP_AUTHOR_LINK = "https://www.kangaroostandard.com/";
var APP_AUTHOR_EMAIL = "support@kangaroostandard.com";
var APP_COPYRIGHT_YEAR = "2015";

// Enumerable values
var TIME_STAGE_NOT_STARTED = 0;
var TIME_STAGE_1 = 1;
var TIME_STAGE_2 = 2;
var TIME_STAGE_FINAL = 3;
var SCORE_ELIMINATED = "out";
var SOUND_NONE = "none";

// Device information
var PHONEGAP = window.cordova;						// Defined when running as a PhoneGap app

// Sounds
var TIME_UP_SOUND_FILE = "sounds/timeup.wav";		// Plays when a round's time runs out
var LOSE_SOUND_FILE = "sounds/lose.wav";			// Plays when a team is eliminated in 3+ team play
var WIN_SOUND_FILE = "sounds/win.wav";				// Plays when the game is overflow
var BUTTON_SOUND_FILE = "sounds/button.wav";		// Plays when the Next button or score buttons are pressed
var CLICK_SOUND_FILE = "sounds/click.wav";			// Plays when various menu items are clicked

// Other constants
var TAG_FLAGGING_REASONS = [						// Possible reasons for flagging a phrase
	"Wrong category",
	"Too difficult",
	"Offensive/inappropriate",
	"Spelling error",
	"Other"
];

// User Settings
var settingsCount = 19;								// Must be equal to the number of settings below
	var sMinTimePerStage = 							// Minimum ms for each time stage
			DEFAULT_MIN_TIME_PER_STAGE;
	var sMaxTimePerStage = 							// Maximum ms for each time stage
			DEFAULT_MAX_TIME_PER_STAGE;
	var sNumberOfTeams = DEFAULT_NUMBER_OF_TEAMS;	// Number of teams playing the game
	var sWinningPoint = DEFAULT_WINNING_POINT;		// Points to win, or to be eliminated in 3+ team play
	var sBeepSoundFile = DEFAULT_BEEP_SOUND_FILE;	// Sound file to play when the timer ticks
	var sDifficulty = DEFAULT_DIFFICULTY;			// Phrase difficulty setting
	var sMaxWordsPerTag = 							// Maximum words per phrase
			DEFAULT_MAX_WORDS_PER_TAG;
	var sMaxCharactersPerTag = 						// Maximum characters per phrase
			DEFAULT_MAX_CHARACTERS_PER_TAG;
	var sCategoryIds = DEFAULT_CATEGORY_IDS;		// Selected phrase categories
	var sStyleSheet = DEFAULT_STYLE_SHEET;			// Path to style sheet used by theme
	var sVibrate = DEFAULT_VIBRATE;					// Turns vibration on
	var sEdgy = DEFAULT_EDGY;						// Allows adult-only phrases
	var sTeamNames = DEFAULT_TEAM_NAMES;			// Non-default team names
	var sShowCategory = DEFAULT_SHOW_CATEGORY;		// Whether to show phrase categories in-game
	var sShowAuthor = DEFAULT_SHOW_AUTHOR;			// Whether to show phrase submitters in-game
	var sDeveloperMode = DEFAULT_DEVELOPER_MODE;	// Whether to enable developer mode (no usage reporting)
	var sDataVersion = DEFAULT_DATA_VERSION;		// The app version of the stored data (if any)
	var sPromptForRating = 							// Whether to prompt the user to rate the app
			DEFAULT_PROMPT_FOR_RATING;
	var sGamesSinceRatingPrompt = 					// Number of games completed since the last app rating prompt
			DEFAULT_GAMES_SINCE_RATING_PROMPT;

// Global variables
var tags = new Array();								// Holds the currently loaded phrases
var usedTags = new Array();							// Holds the phrases that have been used in the current round
var usedTagsOverall = new Array();					// Holds the phrases that have been used the whole time the app was open
var loadingTags = false;							// Whether new phrases are currently loading
var difficulties = [];								// Holds all possible difficulty settings
var categories = [];								// Holds all possible categories
var stats;											// Object that holds new phrase creation stats
var scores;											// Array that holds team scores
var timeStage = TIME_STAGE_NOT_STARTED;				// The round's current time stage
var timeStageAtLastBeep = TIME_STAGE_NOT_STARTED;	// Time stage that was in effect at the last timer tick
var pointGiven = true;								// Whether a point has been given for the last round yet
var gameOver = true;								// Whether a game is not currently in progress
var beepTimer = null;								// A window.setTimeout timer for the next timer tick
var timeStageTimer = null;							// A window.setTimeout timer for advancing the time stage
var timeStageStartTime = null;						// The time at which the last time staged began
var timeStageLength = 0;							// The total length of the current time stage
var timeStageTimeRemaining = 0;						// The number of milliseconds remaining in the current time stage when paused
var db;												// A SQLite database object
var settingsLoaded = 0;								// Number of settings loaded from the local database
var settingsLoadWaitInterval = null;				// An interval timer that waits for all settings to load
var timeoutShown = false;							// Whether a timeout error message was shown already
var medias = {};									// Holds loaded sound objects
var medias2 = {};									// Holds duplicate sound objects
var mediasAlternator = false;						// Determines which sound store to play from
var pressTimer;										// A window.setTimeout timer for detecting long taps
