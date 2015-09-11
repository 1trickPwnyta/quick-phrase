{
	_Log = {
			
		error: function(message) {
			if (DEBUG) {
				console.error(message);
			}
		},
		
		info: function(message) {
			if (DEBUG) {
				console.info(message);
			}
		}
		
	};
}
