function Confetti() {
	
	var element = document.getElementById("confetti");
	
	/**
	 * Shows the confetti.
	 */
	this.show = function() {
		element.style.display = "block";
	};
	
	/**
	 * Hides the confetti.
	 */
	this.hide = function() {
		element.style.display = "none";
	};
	
}
