function UiLock() {

	var element = document.getElementById("uiLock");
	
	/**
	 * Locks the entire UI from user input.
	 * @param durationMs the number of milliseconds to wait before unlocking 
	 * the UI again. If not specified, the UI will stay locked until unlock() 
	 * is called.
	 */
	this.lock = function(durationMs) {
		element.style.display = "block";
		if (durationMs) {
			window.setTimeout(this.unlock, durationMs);
		}
	};
	
	/**
	 * Unlocks the UI.
	 */
	this.unlock = function() {
		element.style.display = "none";
	};
	
}
