function Timer() {
	var TIME_STAGE_NOT_STARTED = 0;
	var TIME_STAGE_1 = 1;
	var TIME_STAGE_2 = 2;
	var TIME_STAGE_FINAL = 3;
	
	var beepInterval;
	var timeStage;
	var timeStageStartTime;
	var timeStageLengths;
	
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
	 * Advances the timer to the next time stage. If the timer is already on 
	 * the final time stage, time is up.
	 */
	var nextTimeStage = function() {
		window.clearInterval(beepInterval);
		
		timeStage++;
		if (timeStage > TIME_STAGE_FINAL) {
			// TODO Time is up!
		} else {
			if (timeStage == TIME_STAGE_2) {
				beepInterval = window.setInterval(beep, BEEP_INTERVAL*2);
			} else if (timeStage == TIME_STAGE_FINAL) {
				beepInterval = window.setInterval(beep, BEEP_INTERVAL);
			}
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
		// Pre-determine time stage lengths
		timeStageLengths = [];
		timeStageLengths[TIME_STAGE_1] = getRandomTimeStageLength();
		timeStageLengths[TIME_STAGE_2] = getRandomTimeStageLength();
		timeStageLengths[TIME_STAGE_FINAL] = getRandomTimeStageLength();
		
		timeStage = TIME_STAGE_1;
		beepInterval = window.setInterval(beep, BEEP_INTERVAL*3);
	};
	
}
