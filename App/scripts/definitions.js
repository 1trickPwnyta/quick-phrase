// App information
var APP_NAME = "Grab Tag";
var APP_VERSION = "1.0.1";
var APP_AUTHOR = "Kangaroo Standard";
var APP_AUTHOR_LINK = "https://www.kangaroostandard.com/";
var APP_AUTHOR_EMAIL = "support@kangaroostandard.com";
var APP_COPYRIGHT_YEAR = "2015";
var APP_GOOGLEPLAY_EDITION = true;

// Enumerable values
var TIME_STAGE_NOT_STARTED = 0;
var TIME_STAGE_1 = 1;
var TIME_STAGE_2 = 2;
var TIME_STAGE_FINAL = 3;
var SCORE_ELIMINATED = "out";

// Device information
var PHONEGAP = window.cordova;						// Defined when running as a PhoneGap app

// Sounds
var TIME_UP_SOUND_FILE = "sounds/timeup.wav";		// Plays when a round's time runs out
var LOSE_SOUND_FILE = "sounds/lose.wav";			// Plays when a team is eliminated in 3+ team play
var WIN_SOUND_FILE = "sounds/win.wav";				// Plays when the game is overflow
var BUTTON_SOUND_FILE = "sounds/button.wav";		// Plays when the Next button or score buttons are pressed
var CLICK_SOUND_FILE = "sounds/click.wav";			// Plays when various menu items are clicked

// Misc. output configuration
var BEEP_INTERVAL = 500;							// Timer tick ms during final time stage of round
var VIBRATION_DURATION = 100;						// ms duration of device vibration when vibration is on

// Tag source configuration
var DB_NAME = "grab_tag";							// Name of the SQLite database for local data
var MAX_LOCAL_TAGS = 5000;							// Max number of tags to be kept in local database
var WEB_SERVICE_URL = 								// Web service URL for remote data
		"https://www.kangaroostandard.com/GrabTag";
var WEB_SERVICE_TIMEOUT = 10000;					// Web service calls time out after this many ms
var TAG_LOAD_QUANTITY = 100;						// Number of tags requested in each web service call
var TAG_RELOAD_QUANTITY = 50;						// Number of loaded tags left when more are needed

// User Settings
var settingsCount = 12;								// Must be equal to the number of settings below
	var sMinTimePerStage = 25000;					// Minimum ms for each time stage
	var sMaxTimePerStage = 40000;					// Maximum ms for each time stage
	var sNumberOfTeams = 2;							// Number of teams playing the game
	var sWinningPoint = 7;							// Points to win, or to be eliminated in 3+ team play
	var sBeepSoundFile = "sounds/beep.wav";			// Sound file to play when the timer ticks
	var sDifficulty = 3;							// Tag difficulty setting
	var sMaxWordsPerTag = 0;						// Maximum words per tag
	var sMaxCharactersPerTag = 0;					// Maximum characters per tag
	var sCategoryIds = [];							// Selected tag categories
	var sVibrate = true;							// Turns vibration on
	var sEdgy = false;								// Allows adult-oriented tags
	var sTeamNames = 								// Non-default team names
			["Team 1", "Team 2", "Team 3", "Team 4", 
			"Team 5", "Team 6", "Team 7", "Team 8"];

// Global variables
var tags = new Array();								// Holds the currently loaded tags
var loadingTags = false;							// Whether new tags are currently loading
var difficulties = [];								// Holds all possible difficulty settings
var categories = [];								// Holds all possible categories
var scores;											// Array that holds team scores
var timeStage = TIME_STAGE_NOT_STARTED;				// The round's current time stage
var timeStageAtLastBeep = TIME_STAGE_NOT_STARTED;	// Time stage that was in effect at the last timer tick
var pointGiven = true;								// Whether a point has been given for the last round yet
var gameOver = true;								// Whether a game is not currently in progress
var beepTimer = null;								// A window.setTimeout timer for the next timer tick
var timeStageTimer = null;							// A window.setTimeout timer for advancing the time stage
var db;												// A SQLite database object
var settingsLoaded = 0;								// Number of settings loaded from the local database
var settingsLoadWaitInterval = null;				// An interval timer that waits for all settings to load
var timeoutShown = false;							// Whether a timeout error message was shown already
var medias = {};									// Holds loaded sound objects
var medias2 = {};									// Holds duplicate sound objects
var mediasAlternator = false;						// Determines which sound store to play from
var pressTimer;										// A window.setTimeout timer for detecting long taps
