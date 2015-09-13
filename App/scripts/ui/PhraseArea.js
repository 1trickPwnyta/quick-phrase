function PhraseArea() {
	
	var mainElement = document.getElementById("tag");
	var subElement = document.getElementById("tag-metadata");
	
	/**
	 * Displays a message on the screen.
	 * @param message the message to display.
	 */
	this.showMessage = function(message) {
		mainElement.innerHTML = _HtmlUtil.htmlEncode(message);
		subElement.innerHTML = "";
	};
	
	/**
	 * Displays an error message on the screen.
	 * @param message the error message to display.
	 */
	this.showError = function(message) {
		mainElement.innerHTML = _HtmlUtil.htmlEncode(message);
		subElement.innerHTML = "";
	};
	
}
