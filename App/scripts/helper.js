//
// Returns the web root of the PhoneGap app
//
function getPhoneGapPath() {
	'use strict';
	var path = window.location.pathname;
	var phoneGapPath = path.substring(0, path.lastIndexOf('/') + 1);
	return phoneGapPath;
}

//
// HTML-encodes a string
//
function htmlEncode(html) {
	return document.createElement("a").appendChild(
		document.createTextNode(html)).parentNode.innerHTML;
}

//
// Plays a sound from a file
//
function playSound(soundFile) {
	if (PHONEGAP) {
		
		// Check if the sound is already loaded
		if (!medias[soundFile]) {
		
			// Load the sound to both stores
			medias[soundFile] = new Media(getPhoneGapPath() + soundFile);
			medias2[soundFile] = new Media(getPhoneGapPath() + soundFile);
			
		}
		
		// Play the sound from an alternating store
		if (mediasAlternator)
			medias[soundFile].play();
		else
			medias2[soundFile].play();
		mediasAlternator = !mediasAlternator;
		
	} else
		// Play the sound for a browser
		new Audio(soundFile).play();
}

//
// Navigates away from the app, to a URL on the web
//
function navigateAway(url) {

	// Restore back button functionality
	document.removeEventListener("backbutton", backButtonClick, false);
	
	// Go to the URL
	document.location.href = url;
	
}

//
// Returns a loaded category object based on ID.
//
function getCategoryById(id) {
	for (var i = 1; i < categories.length; i++) {
		if (categories[i].id == id)
			return categories[i];
	}
	return false;
}
