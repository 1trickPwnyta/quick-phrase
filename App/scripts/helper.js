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
// Shuffles an array.
//
function shuffle(v) {
    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
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
	if (soundFile != SOUND_NONE) {
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
			
		} else {
			// Play the sound for a browser
			new Audio(soundFile).play();
		}
	}
}

//
// Navigates away from the app, to a URL on the web
//
function navigateAway(url) {
	window.open(url, "_system");
}

//
// Returns a loaded category object based on ID.
//
function getCategoryById(id, isCustomCategory) {
	if (!isCustomCategory) isCustomCategory = undefined;
	for (var i = 1; i < categories.length; i++) {
		if (categories[i].id == id && categories[i].isCustom == isCustomCategory)
			return categories[i];
	}
	return {
		id: id,
		name: "???",
		isCustom: false,
		isFake: true
	};
}

//
// Returns the number of non-custom categories that exist.
//
function getNonCustomCategoryCount() {
	var count = 0;
	for (var i = 1; i < categories.length; i++) {
		if (!categories[i].isCustom) {
			count++;
		}
	}
	return count;
}

//
// Returns the number of custom categories that exist.
//
function getCustomCategoryCount() {
	var count = 0;
	for (var i = 1; i < categories.length; i++) {
		if (categories[i].isCustom) {
			count++;
		}
	}
	return count;
}

//
// Swaps out a CSS file with a new one.
//
function changeCSS(cssFile, cssLinkIndex) {
	var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);

	var newlink = document.createElement("link");
	newlink.setAttribute("rel", "stylesheet");
	newlink.setAttribute("type", "text/css");
	newlink.setAttribute("href", cssFile);

	document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
}

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 * 
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 * 
 * @see http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}
