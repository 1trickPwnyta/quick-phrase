{
	_Environment = {
			
		app: {
			name: "Catch-Phrase Panic",
			version: "1.2.2",
			author: {
				name: "Kangaroo Standard",
				link: "https://www.kangaroostandard.com/",
				email: "support@kangaroostandard.com"
			},
			copyrightYear: "2015"
		},
		
		isPhonegap: window.cordova? true: false,
		
		/**
		 * Gets the web root path of the Phonegap app.
		 * @return the web root path.
		 */
		getPhonegapPath: function() {
			'use strict';
			var path = window.location.pathname;
			var phoneGapPath = path.substring(0, path.lastIndexOf('/') + 1);
			return phoneGapPath;
		}
		
	};
}
