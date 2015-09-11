{
	_HtmlUtil = {
		
		/**
		 * HTML-encodes a string.
		 * @param text the string to encode.
		 * @return the encoded string.
		 */
		htmlEncode: function(text) {
			return document.createElement("a").appendChild(
					document.createTextNode(text)).parentNode.innerHTML;
		}
	
	};
}
