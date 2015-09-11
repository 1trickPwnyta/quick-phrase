function ToolBar() {
	
	var phraseReviewButtonElement = document.getElementById("usedTagsButton");
	
	this.hidePhraseReviewButton = function() {
		phraseReviewButtonElement.style.display = "none";
	};
	
}
