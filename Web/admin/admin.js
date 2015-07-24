function selectAll() {
	var checkBoxes = document.getElementById("tagTable").getElementsByTagName("input");
	for (var i = 0; i < checkBoxes.length; i++) {
		if (checkBoxes[i].type == "checkbox") {
			checkBoxes[i].checked = true;
		}
	}
}

function approve() {
	var ids = new Array();
	var selectedBoxes = document.getElementById("tagTable").getElementsByTagName("input");
	for (var i = 0; i < selectedBoxes.length; i++) {
		if (selectedBoxes[i].type == "checkbox" && selectedBoxes[i].checked) {
			var id = parseInt(selectedBoxes[i].id.replace("selectCell", ""));
			ids.push(id);
		}
	}
	
	if (ids.length == 0) {
		dialog.showMessage("Please select at least one tag to approve.");
		return;
	}
	
	var tagsToApprove = new Array();
	for (var i = 0; i < ids.length; i++) {
		var tag = getTagById(ids[i], true);
		if (tag === false) {
			return;
		}
		tagsToApprove.push(tag);
	}
	
	document.getElementById("waitingScreen").style.display = "block";
	ajax("POST", "approveTags.php", [
					{name: "tags", value: JSON.stringify(tagsToApprove)}, 
					{name: "approve", value: 1}
	], function(response, status) {
		if (status == 200) {
			var unapprovedTags = JSON.parse(response);
			for (var i = 0; i < selectedBoxes.length; i++) {
				if (selectedBoxes[i].type == "checkbox" && selectedBoxes[i].checked) {
					var id = parseInt(selectedBoxes[i].id.replace("selectCell", ""));
					var unapproved = false;
					for (var j = 0; j < unapprovedTags.length; j++) {
						if (unapprovedTags[j].id == id) {
							unapproved = true;
							break;
						}
					}
					if (!unapproved) {
						selectedBoxes[i].parentNode.parentNode.parentNode.removeChild(selectedBoxes[i].parentNode.parentNode);
						i--;
					}
				}
			}
			if (unapprovedTags.length > 0) {
				var message = "The following tags could not be approved. They may already exist.<br />";
				for (var i = 0; i < unapprovedTags.length; i++) {
					message += unapprovedTag[i].text + "<br />";
				}
				dialog.showMessage(message);
			}
		} else {
			dialog.showMessage("The tags could not be approved. HTTP status code " + status + ".");
		}
		document.getElementById("waitingScreen").style.display = "none";
	});
}

function reject() {
	var ids = new Array();
	var selectedBoxes = document.getElementById("tagTable").getElementsByTagName("input");
	for (var i = 0; i < selectedBoxes.length; i++) {
		if (selectedBoxes[i].type == "checkbox" && selectedBoxes[i].checked) {
			var id = parseInt(selectedBoxes[i].id.replace("selectCell", ""));
			ids.push(id);
		}
	}
	
	if (ids.length == 0) {
		dialog.showMessage("Please select at least one tag to reject.");
		return;
	}

	dialog.getString(function(reason) {
		if (reason) {
			var tagsToReject = new Array();
			for (var i = 0; i < ids.length; i++) {
				var tag = getTagById(ids[i], false);
				if (tag === false) {
					return;
				}
				tagsToReject.push(tag);
			}
			
			document.getElementById("waitingScreen").style.display = "block";
			ajax("POST", "approveTags.php", [
							{name: "tags", value: JSON.stringify(tagsToReject)}, 
							{name: "approve", value: 0},
							{name: "reason", value: reason}
			], function(response, status) {
				if (status == 200) {
					for (var i = 0; i < selectedBoxes.length; i++) {
						if (selectedBoxes[i].type == "checkbox" && selectedBoxes[i].checked) {
							selectedBoxes[i].parentNode.parentNode.parentNode.removeChild(selectedBoxes[i].parentNode.parentNode);
							i--;
						}
					}
				} else {
					dialog.showMessage("The tags could not be rejected. HTTP status code " + status + ".");
				}
				document.getElementById("waitingScreen").style.display = "none";
			});
		}
	}, "Please enter a reason for rejecting these tags.");
}

function getTagById(id, getDifficulty) {
	var text = document.getElementById("textCell" + id).innerHTML;
	var categoryId = document.getElementById("categoryCell" + id).innerHTML.split(" ")[0];
	var difficulty = parseInt(document.getElementById("difficultyCell" + id).innerHTML);
	if (getDifficulty && (isNaN(difficulty) || !difficulty)) {
		dialog.showMessage("Please set the difficulty rating for '" + text + "'.");
		return false;
	}
	var edgy = (document.getElementById("edgyCell" + id).innerHTML == "true"? 1: 0);

	return {
		id: id,
		text: text,
		categoryId: categoryId,
		difficulty: difficulty,
		edgy: edgy
	};
}

function setText(id) {
	var textCell = document.getElementById("textCell" + id);
	dialog.getString(function(response) {
		if (response === false)
			return;
		if (response.length == 0) {
			dialog.showMessage("The text cannot be empty.");
			return;
		}
		textCell.innerHTML = response;
	}, "Enter the text.", textCell.innerHTML);
}

function setCategory(id) {
	var categoryCell = document.getElementById("categoryCell" + id);
	var form = document.createElement("form");
	var select = document.createElement("select");
	var option;
	<?php
		for ($i = 0; $i < count($categories); $i++) {
			echo "
				option = document.createElement(\"option\");
				option.value = {$categories[$i]['id']};
				option.innerHTML = \"{$categories[$i]['id']} {$categories[$i]['name']}\";
				option.selected = categoryCell.innerHTML.split(\" \")[0] == {$categories[$i]['id']};
				select.appendChild(option);
			";
		}
	?>
	form.appendChild(select);
	form.select = select;
	dialog.custom(form, function(form) {
		if (form === false)
			return;
		categoryCell.innerHTML = form.select.options[form.select.selectedIndex].text;
	}, "Select the category.");
}

function setDifficulty(id) {
	var difficultyCell = document.getElementById("difficultyCell" + id);
	dialog.getNumber(function(response) {
		if (response === false)
			return;
		if (response < 1) {
			dialog.showMessage("The difficulty rating must be greater than 0.");
			return;
		}
		if (response > <?php echo $maxDifficulty ?>) {
			dialog.showMessage("The highest difficulty rating allowed is <?php echo $maxDifficulty ?>.");
			return;
		}
		difficultyCell.innerHTML = response;
	}, "Enter the difficulty rating.", !isNaN(parseInt(difficultyCell.innerHTML))? difficultyCell.innerHTML: null);
}

function setEdgy(id) {
	var edgyCell = document.getElementById("edgyCell" + id);
	dialog.confirm(function(response) {
		edgyCell.innerHTML = response.toString();
	}, "Does this tag contain adult content?");
}