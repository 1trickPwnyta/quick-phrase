function ToolBar() {
	
	var menuButtonElement = document.getElementById("menuButton");
	var menuButtonIconElement = document.getElementById("menuButtonIcon");
	var pauseButtonElement = document.getElementById("pauseButton");
	var phraseReviewButtonElement = document.getElementById("usedTagsButton");
	
	/**
	 * Enables the menu button, while shown. Call showMenuButton() to show it.
	 */
	this.enableMenuButton = function() {
		// TODO Mark it as enabled somehow
		menuButtonIconElement.src = "images/menu.png";
	};
	
	/**
	 * Disables the menu button.
	 */
	this.disableMenuButton = function() {
		// TODO Mark it as disabled somehow
		// TODO Set icon to disabled menu icon
	};
	
	/**
	 * Shows the menu button in the tool bar, replacing the pause button.
	 */
	this.showMenuButton = function() {
		menuButtonElement.style.display = "block";
		pauseButtonElement.style.display = "none";
	};
	
	/**
	 * Shows the pause button in the tool bar, replacing the menu button.
	 */
	this.showPauseButton = function() {
		menuButtonElement.style.display = "none";
		pauseButtonElement.style.display = "block";
	};
	
	/**
	 * Shows the phrase review button in the tool bar.
	 */
	this.showPhraseReviewButton = function() {
		phraseReviewButtonElement.style.display = "block";
	};
	
	/**
	 * Hides the phrase review button.
	 */
	this.hidePhraseReviewButton = function() {
		phraseReviewButtonElement.style.display = "none";
	};
	
}
