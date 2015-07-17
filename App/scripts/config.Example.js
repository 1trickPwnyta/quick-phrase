var APP_GOOGLEPLAY_EDITION = true;					// Removes the option to allow adult-themed tags
var BEEP_INTERVAL = 500;							// Timer tick ms during final time stage of round
var VIBRATION_DURATION = 100;						// ms duration of device vibration when vibration is on
var DB_NAME = "grab_tag";							// Name of the SQLite database for local data
var MAX_LOCAL_TAGS = 5000;							// Max number of tags to be kept in local database
var WEB_SERVICE_URL = 								// Web service URL for remote data
		"https://www.kangaroostandard.com/GrabTag";
var WEB_SERVICE_TIMEOUT = 10000;					// Web service calls time out after this many ms
var TAG_LOAD_QUANTITY = 100;						// Number of tags requested in each web service call
var TAG_RELOAD_QUANTITY = 50;						// Number of loaded tags left when more are needed

// Default settings
var DEFAULT_MIN_TIME_PER_STAGE = 25000;
var DEFAULT_MAX_TIME_PER_STAGE = 40000;
var DEFAULT_NUMBER_OF_TEAMS = 2;
var DEFAULT_WINNING_POINT = 7;
var DEFAULT_BEEP_SOUND_FILE = "sounds/beep.wav";
var DEFAULT_DIFFICULTY = 3;
var DEFAULT_MAX_WORDS_PER_TAG = 0;
var DEFAULT_MAX_CHARACTERS_PER_TAG = 0;
var DEFAULT_CATEGORY_IDS = [];
var DEFAULT_STYLE_SHEET = "style/theme_light.css";
var DEFAULT_VIBRATE = true;
var DEFAULT_EDGY = false;
var DEFAULT_TEAM_NAMES = ["Team 1", "Team 2", "Team 3", "Team 4", "Team 5", "Team 6", "Team 7", "Team 8"];
var DEFAULT_SHOW_CATEGORY = false;
var DEFAULT_SHOW_AUTHOR = true;
