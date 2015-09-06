/**
 * Makes an AJAX (XMLHttp) request.
 * @param method - the HTTP method to use in the request ("GET" or "POST")
 * @param url - the URL to request from the server (URL only, no parameters)
 * @param parameters - the parameters to send with the request. This must be an array of objects with the 
 * following structure: {name, value}. Example:
 *		[
 * 			{name: "id", value: 39}, 
 *			{name: "category", value: "Sustainable Development"},
 *			{name: "enable"}
 *		]
 * @param callback - this parameter is for asynchronous AJAX calls only. To make a synchronous request, 
 * do not provide a value for this parameter. This parameter is a function to call when a response is 
 * received from the server. This function must accept two parameters (a string value and an integer). When 
 * the function is called, it will be passed the response text from the server and the status code. If a 
 * timeout value is used, the response text will be a boolean false and the status code will be 0 if the 
 * request times out. If a non-HTTP error occurs (such as a Cross-Domain error), the response text will 
 * be the error object and the status code will be -1.
 * @param timeout - number of milliseconds after which the request should time out. This only works for 
 * asynchronous calls.
 * @return the response text from the server for synchronous AJAX calls, or undefined for asynchronous calls. 
 * If a non-HTTP error occurs, the return value will be the error object.
 */
function ajax(method, url, parameters, callback, timeout) {
	// Initializing request properties
	var xmlHttp = new XMLHttpRequest();					// Instantiate the request object
		
	if (callback) {										// If this is an asynchronous request
		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState == 4) {				// This is what will happen when the
														// response is received
				if (xmlHttp.responseURL != "") {
					callback(xmlHttp.responseText, xmlHttp.status);	
														// Call the provided callback function, passing it
														// the text from the response and the response code
				} else {
					callback(JSON.stringify(xmlHttp), -1);
														// Call the provided callback function, passing it
														// the xmlHttp object as the error message
				}
			}
		};
	}
	
	// Building the parameter string
	var parameterString = "";							// Start with an empty string
	for (var i = 0; i < parameters.length; i++) {		// Iterate through each parameter
		var parameter = parameters[i];					// Get a reference to the parameter
		var name = encodeURIComponent(parameter.name);	// URL encode the parameter's name
		if (parameter.value)							// If the parameter has a value
			var value = encodeURIComponent(parameter.value);	// URL encode the parameter's value
		parameterString += name;						// Add the parameter's name to the string
		if (parameter.value)							// If the parameter has a value
			parameterString += "="+value;				// Add the parameter's value to the string
		if (i < parameters.length-1)					// If this is not the last parameter
			parameterString += "&";						// Add the parameter separator
	}
	
	// Creating the actual request
	xmlHttp.open(method, url + (parameters.length > 0 && method == "GET"? "?" + parameterString: ""), (callback? true: false));
														// Create the request with the provided input
	
	if (method == "POST")
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
														// For POST requests
	
	// Handling the timeout
	if (callback && timeout) {
		var timer = window.setTimeout(function() {		// Set a timer for when to stop waiting
			if (xmlHttp.readyState < 4) {				// If the request hasn't completed
				xmlHttp.abort();						// Cancel the request
				callback(false, 0);						// Call the provided callback function, passing it
														// the boolean value false and a status code of 0
			}
		}, timeout);
	}
	
	// Handle asynchronous errors
	xmlHttp.onerror = function(e) {
		callback(e, -1);
	};
	
	// Sending the request
	try {
		if (method == "GET")							// For GET requests
			xmlHttp.send("");							// Send the request with an empty body
		if (method == "POST")							// For POST requests
			xmlHttp.send(parameterString);				// Send the request with the parameters in the body
	} catch (e) {										// Handle synchronous errors
		return e;										// Return the error
	}
	
	// Returning the response
	if (!callback)										// If this is a synchronous request
		return xmlHttp.responseText;					// Return the response text from the server
}