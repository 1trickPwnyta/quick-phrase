// App information
var APP_NAME = "Catch-Phrase Panic";
var APP_VERSION = "2.0.1";
var APP_AUTHOR = "Kangaroo Standard";
var APP_AUTHOR_LINK = "https://www.kangaroostandard.com/";
var APP_AUTHOR_EMAIL = "support@kangaroostandard.com";
var APP_COPYRIGHT_YEAR = "2016";

// Enumerable values
var TIME_STAGE_NOT_STARTED = 0;
var TIME_STAGE_1 = 1;
var TIME_STAGE_2 = 2;
var TIME_STAGE_FINAL = 3;
var SCORE_ELIMINATED = "out";
var SOUND_NONE = "none";
var CATEGORIES_ALL = "all";

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
var medias = {};									// Holds loaded sound objects
var medias2 = {};									// Holds duplicate sound objects
var mediasAlternator = false;						// Determines which sound store to play from
var pressTimer;										// A window.setTimeout timer for detecting long taps
