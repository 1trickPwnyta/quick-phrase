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
