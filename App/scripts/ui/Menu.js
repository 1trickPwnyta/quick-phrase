function Menu() {
	
	var categories;
	var difficulties;
	var difficultySelectElement = document.getElementById("menuItemDifficulty").getElementsByClassName("menuItemValue")[0];
	
	/**
	 * Builds the difficulty select based on available difficulties.
	 */
	var loadDifficulties = function() {
		difficultySelectElement.innerHTML = "";
		for (var i = 0; i < difficulties.length; i++) {
			var option = document.createElement("option");
			option.value = difficulties[i].id;
			option.innerHTML = difficulties[i].name;
			difficultySelectElement.appendChild(option);
		}
		
		var difficultyId = _Settings.current.get(_Settings.KEY_DIFFICULTY_ID, DEFAULT_DIFFICULTY_ID);
		difficultySelectElement.value = difficultyId;
	};
	
	/**
	 * Sets the categories available in the menu.
	 */
	this.setCategories = function(_categories) {
		categories = _categories;
	};
	
	/**
	 * Sets the difficulties available in the menu.
	 */
	this.setDifficulties = function(_difficulties) {
		difficulties = _difficulties;
	};
	
}
