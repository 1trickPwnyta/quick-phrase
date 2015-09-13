function NextButton() {
	
	var element = document.getElementById("nextButton");
	
	/**
	 * Enables the button.
	 */
	this.enable = function() {
		
	};
	
	/**
	 * Disables the button.
	 * @param durationMs the number of milliseconds to wait before enabling the 
	 * button again. If not specified, the button will stay disabled until 
	 * enable() is called.
	 */
	this.disable = function(durationMs) {
		nextButton.className = "disabledNextButton";
		nextButton.enabled = false;
		if (durationMs) {
			window.setTimeout(this.enable, durationMs);
		}
	};
	
}
