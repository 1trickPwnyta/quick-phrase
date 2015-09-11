function PhraseArea() {
	
	var mainElement = document.getElementById("tag");
	var subElement = document.getElementById("tag-metadata");
	
	this.showError = function(message) {
		mainElement.innerHTML = _HtmlUtil.htmlEncode(message);
		subElement.innerHTML = "";
	};
	
}
