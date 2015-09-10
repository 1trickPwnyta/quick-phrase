_Phrase = {
	
	/**
	 * Checks if the text from one phrase is similar enough to the text from 
	 * another phrase.
	 * @param a one phrase.
	 * @param b the other phrase.
	 * @return true if the text is similar enough, false otherwise.
	 */
	textMatches: function(a, b) {
		var regex = new RegExp("^" + a.replace(/[^a-zA-Z0-9]*/, "[^a-zA-Z0-9]*") + "$", "i");
		return b.text.match(regex);
	}

};

function Phrase(id, isCustom, text, categoryId, difficultyRating, adult) {
	this.id = id;
	this.isCustom = isCustom;
	this.text = text;
	this.categoryId = categoryId;
	this.difficultyRating = difficultyRating;
	this.adult = adult;
}
