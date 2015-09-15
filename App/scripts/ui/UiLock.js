function UiLock() {

	var element = document.getElementById("uiLock");
	
	/**
	 * Locks the entire UI from user input.
	 * @param durationMs the number of milliseconds to wait before unlocking 
	 * the UI again. If not specified, the UI will stay locked until unlock() 
	 * is called.
	 * @param callback a function to call just before the UI is unlocked. Does 
	 * nothing if no durationMs is specified.
	 */
	this.lock = function(durationMs, callback) {
		element.style.display = "block";
		if (durationMs) {
			window.setTimeout(function() {
				if (callback) {
					callback();
				}
				this.unlock();
			}, durationMs);
		}
	};
	
	/**
	 * Unlocks the UI.
	 */
	this.unlock = function() {
		element.style.display = "none";
	};
	
}
