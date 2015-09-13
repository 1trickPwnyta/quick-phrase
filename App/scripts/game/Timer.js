function Timer() {
	var TIME_STAGE_NOT_STARTED = 0;
	var TIME_STAGE_1 = 1;
	var TIME_STAGE_2 = 2;
	var TIME_STAGE_FINAL = 3;
	
	var beepInterval;
	var timeStage = TIME_STAGE_NOT_STARTED;
	var timeStageStartTime;
	var timeStageTimeElapsed;
	var timeStageLengths;
	var timeUpCallback;
	
	/**
	 * Beeps the timer.
	 */
	var beep = function() {
		var beepSoundFile = _Settings.current.get(_Settings.KEY_BEEP_SOUND_FILE, DEFAULT_BEEP_SOUND_FILE);
		_UiUtil.playSound(beepSoundFile);
		_UiUtil.vibrate(VIBRATION_DURATION);
		
		if (performance.now() - timeStageStartTime >= timeStageLengths[timeStage]) {
			nextTimeStage();
		}
	};
	
	/**
	 * Sets the beep interval based on the current time stage.
	 */
	var setBeepInterval = function() {
		switch (timeStage) {
			case TIME_STAGE_1:
				beepInterval = window.setInterval(beep, BEEP_INTERVAL*3);
			case TIME_STAGE_2:
				beepInterval = window.setInterval(beep, BEEP_INTERVAL*2);
				break;
			case TIME_STAGE_FINAL:
				beepInterval = window.setInterval(beep, BEEP_INTERVAL);
				break;
			default:
				_Log.error("Attempted to set the beep interval while in invalid time stage: " + timeStage);
			break;
		}
	};
	
	/**
	 * Advances the timer to the next time stage. If the timer is already on 
	 * the final time stage, time is up.
	 */
	var nextTimeStage = function() {
		window.clearInterval(beepInterval);
		
		timeStage++;
		if (timeStage > TIME_STAGE_FINAL) {
			timeUp();
		} else {
			timeStageStartTime = performance.now();
			setBeepInterval();
		}
	};
	
	/**
	 * Performs tasks to indicate that time is up.
	 */
	var timeUp = function() {
		_UiUtil.playSound(TIME_UP_SOUND_FILE);
		_UiUtil.vibrate(VIBRATION_DURATION * 5);
		
		timeStage = TIME_STAGE_NOT_STARTED;
		
		if (timeUpCallback) {
			timeUpCallback();
		}
	};
	
	/**
	 * @return a random number of milliseconds for a time stage to last, based 
	 * on settings.
	 */
	var getRandomTimeStageLength = function() {
		var minTimePerStage = _Settings.current.get(_Settings.KEY_MIN_SECONDS_PER_STAGE, DEFAULT_MIN_SECONDS_PER_STAGE);
		var maxTimePerStage = _Settings.current.get(_Settings.KEY_MAX_SECONDS_PER_STAGE, DEFAULT_MAX_SECONDS_PER_STAGE);
		return (minTimePerStage + Math.floor((Math.random() * (maxTimePerStage - minTimePerStage)))) * 1000;
	};
	
	/**
	 * Starts or restarts the timer.
	 * @param callback a function to call when time runs out.
	 */
	this.start = function(callback) {
		timeUpCallback = callback;
		
		// Pre-determine time stage lengths
		timeStageLengths = [];
		timeStageLengths[TIME_STAGE_1] = getRandomTimeStageLength();
		timeStageLengths[TIME_STAGE_2] = getRandomTimeStageLength();
		timeStageLengths[TIME_STAGE_FINAL] = getRandomTimeStageLength();
		
		timeStage = TIME_STAGE_1;
		timeStageStartTime = performance.now();
		setBeepInterval();
	};
	
	/**
	 * Pauses the timer.
	 */
	this.pause = function() {
		window.clearInterval(beepInterval);
		timeStageTimeElapsed = performance.now() - timeStageStartTime;
	};
	
	/**
	 * Resumes the timer after being paused.
	 */
	this.resume = function() {
		timeStageStartTime = performance.now() - timeStageTimeElapsed;
		setBeepInterval();
	};
	
}
