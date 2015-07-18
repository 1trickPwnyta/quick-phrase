var TOP_CLASS_NAME = "dialog-top";                              // The CSS class name for the top element
var SCREEN_DIMMER_CLASS_NAME = "dialog-screen-dimmer";          // The CSS class name for the screen dimming element
var DIALOG_BOX_CLASS_NAME = "dialog-dialog-box";                // The CSS class name for the dialog box element
var BUTTON_DIV_CLASS_NAME = "dialog-button-div";                // The CSS class name for the div element the buttons go in
var VISIBLE_CLASS_NAME = "dialog-visible";						// The CSS class name for fully visible dialogs
var HIDDEN_CLASS_NAME = "dialog-hidden";						// The CSS class name for fading dialogs
var CLOSE_BUTTON_PATH = APPLICATION_ROOT + "delete.png";        // The path to the close button image
var CLOSE_BUTTON_CLASS_NAME = "dialog-close-button";            // The CSS class name for the close button element
var DEFAULT_FORM_SUBMIT_BUTTON = "Submit";                      // The default text for the form submit button, if any
var FADE_DURATION = 200;										// CSS transition milliseconds for fading a menu out

var dialog = {

    /**
    * Creates a generic dialog box. Can be customized however. Returns the dialog 
    * box element.
    */
    createDialogBox: function () {
        // Create the top element
        var dialogTop = document.createElement("div");
        dialogTop.className = TOP_CLASS_NAME;
        document.body.appendChild(dialogTop);

        // Create the screen dimming element
        var screenDimmer = document.createElement("div");
        screenDimmer.className = SCREEN_DIMMER_CLASS_NAME + " " + HIDDEN_CLASS_NAME;

        // Create the close button element
        var closeButton = document.createElement("img");
        closeButton.className = CLOSE_BUTTON_CLASS_NAME;
        closeButton.src = CLOSE_BUTTON_PATH;
        closeButton.alt = "Close";
        closeButton.title = "close";
        closeButton.onclick = function () {
            // Pass false to the dialog box's close function
            this.dialogBox.close(false);
        };

        // Create the dialog box element
        var dialogBox = document.createElement("div");
        closeButton.dialogBox = dialogBox;
        dialogBox.className = DIALOG_BOX_CLASS_NAME + " " + HIDDEN_CLASS_NAME;
        // Set the custom size, if any
		dialogBox.screenDimmer = screenDimmer;
        dialogBox.closeButton = closeButton;
        dialogBox.appendChild(closeButton);
        dialogBox.close = function (returnParameter) {
			// Call the close function if any
			if (this.closeFunction)
				if (this.closeFunction(returnParameter) === false) {
					return;
				}
			
            // Remove the screen dimmer and the dialog box
			this.screenDimmer.className = SCREEN_DIMMER_CLASS_NAME + " " + HIDDEN_CLASS_NAME;
			this.className = DIALOG_BOX_CLASS_NAME + " " + HIDDEN_CLASS_NAME;
			var returnFunction = this.returnFunction;
			window.setTimeout(function() {
				document.body.removeChild(dialogTop);
				
				// Call the return function, if any, with the return parameter
	            if (returnFunction)
	                returnFunction(returnParameter);
			}, FADE_DURATION);
        };

        screenDimmer.appendChild(dialogBox);
		dialogTop.appendChild(screenDimmer);
		window.setTimeout(function() {
			screenDimmer.className = SCREEN_DIMMER_CLASS_NAME + " " + VISIBLE_CLASS_NAME;
			dialogBox.className = DIALOG_BOX_CLASS_NAME + " " + VISIBLE_CLASS_NAME;
			
			// Select the first input field, if any
			var forms = dialogBox.getElementsByTagName("form");
			if (forms.length > 0) {
				var form = forms[0];
				for (var i = 0; i < form.length; i++)
					if (form[i] && form[i].type != "hidden") {
						if (form[i].type != "submit" && form[i].select)
							form[i].select();
						else if (form[i].focus)
							form[i].focus();
						break;
					}
			}
		}, 1);

        return dialogBox;
    },

    /**
    * Shows a dialog box with a message for the user.
    * message: message to display to the user.
    * returnFunction: a function to call when the user finishes with the dialog.
	* closeFunction: an optional function to call when the user clicks on a button that closes the dialog 
	* box. For example, to play a sound.
    */
    showMessage: function (message, returnFunction, closeFunction) {
        // Create the dialog box
        var dialogBox = this.createDialogBox();
        
        // Set the dialog box's return function
        dialogBox.returnFunction = returnFunction;
		dialogBox.closeFunction = closeFunction;

        // Set the message
        var messageSpan = document.createElement("span");
        messageSpan.innerHTML = message;
        dialogBox.appendChild(messageSpan);

        // Create the form
        var inputForm = document.createElement("form");
        inputForm.action = "#";
        inputForm.dialogBox = dialogBox;
        inputForm.onsubmit = function () {
            // Pass false to the dialog box's close function
            this.dialogBox.close(false);
            return false;
        };

        // Create the button div
        var buttonDiv = document.createElement("div");
        buttonDiv.className = BUTTON_DIV_CLASS_NAME;
        inputForm.appendChild(buttonDiv);

        // Create the OK button
        var okButton = document.createElement("input");
        okButton.type = "submit";
        okButton.value = "OK";
        buttonDiv.appendChild(okButton);

        // Add the form to the dialog box
        dialogBox.appendChild(inputForm);
    },

    /**
    * Shows a dialog box with a question requiring a yes or no response.
    * returnFunction: a function to call when the user finishes with the dialog. The parameter passed 
    * to this function will be true of the user clicked yes, or false if the user clicked no or cancelled.
    * prompt: question to ask of the user.
	* closeFunction: an optional function to call when the user clicks on a button that closes the dialog 
	* box. For example, to play a sound.
    */
    confirm: function (returnFunction, prompt, closeFunction) {
        // Create the dialog box
        var dialogBox = this.createDialogBox();

        // Set the dialog box's return function
        dialogBox.returnFunction = returnFunction;
		dialogBox.closeFunction = closeFunction;

        // Set the prompt
        var promptSpan = document.createElement("span");
        promptSpan.innerHTML = prompt;
        dialogBox.appendChild(promptSpan);

        // Create the form
        var inputForm = document.createElement("form");
        inputForm.action = "#";
        inputForm.dialogBox = dialogBox;
        inputForm.onsubmit = function () {
            // Pass true to the dialog box's close function
            this.dialogBox.close(true);
            return false;
        };

        // Create the button div
        var buttonDiv = document.createElement("div");
        buttonDiv.className = BUTTON_DIV_CLASS_NAME;
        inputForm.appendChild(buttonDiv);

        // Create the yes button
        var yesButton = document.createElement("input");
        yesButton.type = "submit";
        yesButton.value = "Yes";
        buttonDiv.appendChild(yesButton);

        // Create the no button
        var noButton = document.createElement("input");
        noButton.type = "button";
        noButton.value = "No";
        noButton.dialogBox = dialogBox;
        noButton.onclick = function () {
            // Pass false to the dialog box's close function
            this.dialogBox.close(false);
        };
        buttonDiv.appendChild(noButton);

        // Add the form to the dialog box
        dialogBox.appendChild(inputForm);
    },

    /**
    * Shows a dialog box with a field for entering a string.
    * returnFunction: a function to call when the user finishes with the dialog. The parameter passed 
    * to this function will be the text entered, or false if the user cancelled.
    * prompt: optional prompt to display to the user.
    * buttonText: optional custom text for the submit button.
	* defaultValue: optional default value to populate the textbox with.
	* closeFunction: an optional function to call when the user clicks on a button that closes the dialog 
	* box. For example, to play a sound.
    */
    getString: function (returnFunction, prompt, defaultValue, buttonText, closeFunction) {
        // Create the dialog box
        var dialogBox = this.createDialogBox();

        // Set the dialog box's return function
        dialogBox.returnFunction = returnFunction;
		dialogBox.closeFunction = closeFunction;

        // Set the prompt, if any
        if (prompt) {
            var promptSpan = document.createElement("span");
            promptSpan.innerHTML = prompt;
            dialogBox.appendChild(promptSpan);
        }

        // Create the form
        var inputForm = document.createElement("form");
        inputForm.action = "#";
        inputForm.dialogBox = dialogBox;
        inputForm.onsubmit = function () {
            // Pass the user's input to the dialog box's close function
            this.dialogBox.close(this.inputField.value);
            return false;
        };

        // Create the input field
        var inputField = document.createElement("input");
        inputField.type = "text";
		if (defaultValue !== null && typeof defaultValue != "undefined")
			inputField.value = defaultValue;
        inputForm.appendChild(inputField);
        inputForm.inputField = inputField;
        inputForm.appendChild(document.createElement("br"));

        // Create the button div
        var buttonDiv = document.createElement("div");
        buttonDiv.className = BUTTON_DIV_CLASS_NAME;
        inputForm.appendChild(buttonDiv);

        // Create the submit button
        var inputSubmit = document.createElement("input");
        inputSubmit.type = "submit";
        inputSubmit.value = DEFAULT_FORM_SUBMIT_BUTTON;
        // Set the custom button text, if any
        if (buttonText)
            inputSubmit.value = buttonText;
        buttonDiv.appendChild(inputSubmit);

        // Create the cancel button
        var inputCancel = document.createElement("input");
        inputCancel.type = "button";
        inputCancel.value = "Cancel";
        inputCancel.dialogBox = dialogBox;
        inputCancel.onclick = function () {
            // Pass false to the dialog box's close function
            this.dialogBox.close(false);
        };
        buttonDiv.appendChild(inputCancel);

        // Add the form to the dialog box
        dialogBox.appendChild(inputForm);
    },
	
	/**
    * Shows a dialog box with a field for entering a number.
    * returnFunction: a function to call when the user finishes with the dialog. The parameter passed 
    * to this function will be the number entered, or false if the user cancelled or entered something invalid.
    * prompt: optional prompt to display to the user.
    * buttonText: optional custom text for the submit button.
	* defaultValue: optional default value to populate the textbox with.
	* closeFunction: an optional function to call when the user clicks on a button that closes the dialog 
	* box. For example, to play a sound.
    */
    getNumber: function (returnFunction, prompt, defaultValue, buttonText, closeFunction) {
        // Create the dialog box
        var dialogBox = this.createDialogBox();

        // Set the dialog box's return function
        dialogBox.returnFunction = returnFunction;
		dialogBox.closeFunction = closeFunction;

        // Set the prompt, if any
        if (prompt) {
            var promptSpan = document.createElement("span");
            promptSpan.innerHTML = prompt;
            dialogBox.appendChild(promptSpan);
        }

        // Create the form
        var inputForm = document.createElement("form");
        inputForm.action = "#";
        inputForm.dialogBox = dialogBox;
        inputForm.onsubmit = function () {
            // Pass the user's input to the dialog box's close function
            this.dialogBox.close(this.inputField.value);
            return false;
        };

        // Create the input field
        var inputField = document.createElement("input");
        inputField.type = "number";
		if (defaultValue !== null && typeof defaultValue != "undefined")
			inputField.value = defaultValue;
        inputForm.appendChild(inputField);
        inputForm.inputField = inputField;
        inputForm.appendChild(document.createElement("br"));

        // Create the button div
        var buttonDiv = document.createElement("div");
        buttonDiv.className = BUTTON_DIV_CLASS_NAME;
        inputForm.appendChild(buttonDiv);

        // Create the submit button
        var inputSubmit = document.createElement("input");
        inputSubmit.type = "submit";
        inputSubmit.value = DEFAULT_FORM_SUBMIT_BUTTON;
        // Set the custom button text, if any
        if (buttonText)
            inputSubmit.value = buttonText;
        buttonDiv.appendChild(inputSubmit);

        // Create the cancel button
        var inputCancel = document.createElement("input");
        inputCancel.type = "button";
        inputCancel.value = "Cancel";
        inputCancel.dialogBox = dialogBox;
        inputCancel.onclick = function () {
            // Pass false to the dialog box's close function
            this.dialogBox.close(false);
        };
        buttonDiv.appendChild(inputCancel);

        // Add the form to the dialog box
        dialogBox.appendChild(inputForm);
    },

    /**
    * Shows a dialog box with a custom form for entering input.
    * form: a form element to be embedded in the dialog box. Submit and cancel buttons are added automatically.
    * returnFunction: a function to call after the dialog box has faded away. The parameter passed 
    * to this function will be the original form element, or false if the user cancelled.
    * prompt: optional prompt to display to the user.
    * buttonText: optional custom text for the submit button.
	* hideCancel: true if you don't want there to be a cancel button.
	* closeFunction: an optional function to call when the user clicks on a button that closes the dialog 
	* box. For example, to play a sound.
    */
    custom: function (form, returnFunction, prompt, buttonText, hideCancel, closeFunction) {
        // Create the dialog box
        var dialogBox = this.createDialogBox();

        // Set the dialog box's return function
        dialogBox.returnFunction = returnFunction;
		dialogBox.closeFunction = closeFunction;

        // Set the prompt, if any
        if (prompt) {
            var promptSpan = document.createElement("span");
            promptSpan.innerHTML = prompt;
            dialogBox.appendChild(promptSpan);
        }

        // Add the form
        form.dialogBox = dialogBox;
        form.onsubmit = function () {
            // Pass the form to the dialog box's close function
            this.dialogBox.close(this);
            return false;
        };

        // Create the button div
        var buttonDiv = document.createElement("div");
        buttonDiv.className = BUTTON_DIV_CLASS_NAME;
        form.appendChild(buttonDiv);

        // Create the submit button
        var inputSubmit = document.createElement("input");
        inputSubmit.type = "submit";
        inputSubmit.value = DEFAULT_FORM_SUBMIT_BUTTON;
        // Set the custom button text, if any
        if (buttonText)
            inputSubmit.value = buttonText;
        buttonDiv.appendChild(inputSubmit);

        // Create the cancel button
		if (!hideCancel) {
			var inputCancel = document.createElement("input");
			inputCancel.type = "button";
			inputCancel.value = "Cancel";
			inputCancel.dialogBox = dialogBox;
			inputCancel.onclick = function () {
				// Pass false to the dialog box's close function
				this.dialogBox.close(false);
			};
			buttonDiv.appendChild(inputCancel);
		}

        // Add the form to the dialog box
        dialogBox.appendChild(form);
    }

};