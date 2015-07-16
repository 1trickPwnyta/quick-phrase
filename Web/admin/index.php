<?php
	require_once "../config.php";
	require_once "../mysql.php";
	
	// Get user attributes
	require_once($SIMPLESAML_AUTOLOAD_PATH);
	$authenticationSource = new SimpleSAML_Auth_Simple($SAML_SP_ID);
	$authenticationSource->requireAuth();
	$attributes = $authenticationSource->getAttributes();
	$authorized = filter_var($attributes["Admin"][0], FILTER_VALIDATE_BOOLEAN);
	
	if (!$authorized) {
		http_response_code(401);
		echo "You are not authorized.";
		exit;
	}
	
	// Build a query to get the unapproved tags
	$query = "SELECT unapproved_tag.id AS id, text, category.name AS category, category.id AS category_id, time_submitted, user.username AS submitter FROM unapproved_tag INNER JOIN category on category.id = unapproved_tag.category_id INNER JOIN user on user.id = unapproved_tag.submitter ORDER BY unapproved_tag.id";
	
	// Get unapproved tags from the database
	$db = mysqlConnect();
	$statement = $db->query($query);
	$tags = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($tags, $row);
	
	// Build a query to get the categories
	$query = "SELECT id, name FROM category ORDER BY name";
	
	// Get categories from the database
	$statement = $db->query($query);
	$categories = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($categories, $row);
	
	// Build a query to get the highest difficulty rating
	$query = "SELECT MAX(max_rating) AS max_difficulty FROM difficulty_level";
	
	// Get max difficulty from the database
	$statement = $db->query($query);
	$maxDifficulties = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($maxDifficulties, $row);
	$maxDifficulty = $maxDifficulties[0]["max_difficulty"];
?>

<!DOCTYPE html>
<html lang="en-us">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="<?php echo $APPLICATION_ROOT_PATH; ?>favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="<?php echo $APPLICATION_ROOT_PATH; ?>favicon.ico" type="image/x-icon" />
		<link href="dialog.css" rel="stylesheet" />
		<title>Grab Tag Administration</title>
		<style>
			@font-face {
				font-family: 'standard';
				src: url('../font.woff') format('woff');
			}
			
			html {
				width: 100%;
				height: 100%;
				margin: 0px;
			}
			
			body {
				background-color: #474747;
				color: white;
				font-family: standard;
				width: calc(100% - 8px);
				height: calc(100% - 8px);
				margin: 0px;
				padding: 4px;
			}
			
			#waitingScreen {
				display: none;
				position: absolute;
				left: 0px;
				top: 0px;
				width: 100%;
				height: 100%;
				background-color: rgba(0, 0, 0, 0.5);
				z-index: 100;
				text-align: center;
			}
			
			#waitingScreen span {
				position: relative;
				top: 50%;
				transform: translateY(-50%);
			}
			
			a, a:visited, a:active, a:hover {
				color: black;
				font-weight: bold;
				text-decoration: underline;
			}
		
			table {
			    border-collapse: collapse;
			}
			
			table, th, td {
			    border: 1px solid black;
			}
			
			td, th {
			    padding: 15px;
			}
			
			td {
				background-color: white;
				color: black;
			}
			
			td input[type="checkbox"] {
				width: 16px;
				height: 16px;
			}
			
			th {
				background-color: #DE4343;
				color: white;
			}
			
			input[type="text"], input[type="number"] {
				font-family: inherit;
			}
			
			#action-buttons {
				padding: 16px;
				margin: 8px;
				border: 1px solid white;
				display: inline-block;
			}
			
			#action-buttons a {
				background-color: #DE4343;
				color: white;
				border: 1px solid black;
				font-family: inherit;
				font-size: 1.3em;
				font-weight: bold;
				text-decoration: none;
				margin: 0px 8px;
				padding: 4px;
			}
		</style>
		<script src="../ajax.js"></script>
		<script src="../applicationRoot.js"></script>
		<script src="../dialog.js"></script>
		<script>
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
		</script>
	</head>
	<body>
		<div id="waitingScreen">
			<span>Please wait...</span>
		</div>
		<div style="float: right;">
			<a style="color: white;" href="<?php echo $SIMPLESAML_LOGOUT_URL_RELATIVE; ?>?AuthId=<?php echo $SAML_SP_ID; ?>&ReturnTo=<?php echo $APPLICATION_ROOT_PATH; ?>loggedOut.php">Log out</a>
		</div>
		<div id="action-buttons">
			<a href="#" onclick="selectAll(); return false;">Select all</a>
			<a href="#" onclick="approve(); return false;">Approve</a>
			<a href="#" onclick="reject(); return false;">Reject</a>
		</div>
		<table id="tagTable">
			<tr>
				<th></th><th>Tag</th><th>Category</th><th>Difficulty</th><th>Adult</th><th>Time submitted</th><th>Submitted by</th>
			</tr>
			<?php
				for ($i = 0; $i < count($tags); $i++) {
					echo 
						"<tr>
							<td><input id=\"selectCell{$tags[$i]['id']}\" type=\"checkbox\" /></td>
							<td><a id=\"textCell{$tags[$i]['id']}\" href=\"#\" onclick=\"setText({$tags[$i]['id']}); return false;\">".htmlentities($tags[$i]['text'])."</a></td>
							<td><a id=\"categoryCell{$tags[$i]['id']}\" href=\"#\" onclick=\"setCategory({$tags[$i]['id']}); return false;\">{$tags[$i]['category_id']} {$tags[$i]['category']}</td>
							<td><a id=\"difficultyCell{$tags[$i]['id']}\" href=\"#\" onclick=\"setDifficulty({$tags[$i]['id']}); return false;\">???</a></td>
							<td><a id=\"edgyCell{$tags[$i]['id']}\" href=\"#\" onclick=\"setEdgy({$tags[$i]['id']}); return false;\">false</td>
							<td>{$tags[$i]['time_submitted']}</td>
							<td>{$tags[$i]['submitter']}</td>
						</tr>";
				}
			?>
		</table>
	</body>
</html>