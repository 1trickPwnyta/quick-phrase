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
	$query = "SELECT unapproved_tag.id AS id, text, category.name AS category, category.id AS category_id, time_submitted, submitter FROM unapproved_tag INNER JOIN category on category.id = unapproved_tag.category_id ORDER BY unapproved_tag.id";
	
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
		<link href="dialog.css" rel="stylesheet" />
		<title>Grab Tag Administration</title>
		<style>
			@font-face {
				font-family: 'standard';
				src: url('../font.woff') format('woff');
			}
			
			body {
				background-color: #474747;
				color: white;
				font-family: standard;
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
			
			th {
				background-color: #DE4343;
				color: white;
			}
			
			input[type="text"], input[type="number"] {
				font-family: inherit;
			}
		</style>
		<script src="../ajax.js"></script>
		<script src="../applicationRoot.js"></script>
		<script src="../dialog.js"></script>
		<script>
			function approve(id) {
				var approveCell = document.getElementById("approveCell" + id);

				var text = document.getElementById("textCell" + id).innerHTML;
				var categoryId = document.getElementById("categoryCell" + id).innerHTML.split(" ")[0];
				var difficulty = parseInt(document.getElementById("difficultyCell" + id).innerHTML);
				if (isNaN(difficulty) || !difficulty) {
					dialog.showMessage("Please set the difficulty rating for this tag.");
					return;
				}
				var edgy = (document.getElementById("edgyCell" + id).innerHTML == "true"? 1: 0);

				var oldOnclick = approveCell.onclick;
				approveCell.onclick = null;
				approveCell.innerHTML = "Pending";
				
				ajax("POST", "approveTag.php", [
                				{name: "id", value: id}, 
                				{name: "approve", value: 1},
                				{name: "text", value: text},
                				{name: "categoryId", value: categoryId},
                				{name: "difficulty", value: difficulty},
                				{name: "edgy", value: edgy}
                ], function(response, status) {
					if (status == 200) {
						approveCell.parentNode.parentNode.parentNode.removeChild(approveCell.parentNode.parentNode);
					} else {
						dialog.showMessage("The tag with ID " + id + " could not be approved. The tag may already exist. HTTP status code " + status + ".", function() {
							approveCell.innerHTML = "Approve";
							approveCell.onclick = oldOnclick;
						});
					}
				});
			}

			function deleteTag(id) {
				var deleteCell = document.getElementById("deleteCell" + id);

				dialog.getString(function(reason) {
					if (reason) {
						ajax("POST", "approveTag.php", [
		                				{name: "id", value: id}, 
		                				{name: "approve", value: 0},
		                				{name: "reason", value: reason}
		                ]);
		                
						deleteCell.parentNode.parentNode.parentNode.removeChild(deleteCell.parentNode.parentNode);
					}
				}, "Please enter a reason for deleting this tag.");
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
		<div style="float: right;">
			<a style="color: white;" href="<?php echo $SIMPLESAML_LOGOUT_URL_RELATIVE; ?>?AuthId=<?php echo $SAML_SP_ID; ?>&ReturnTo=<?php echo $LOGOUT_RETURN_URL_RELATIVE; ?>">Log out</a>
		</div>
		<table>
			<tr>
				<th>Approve</th><th>Delete</th><th>Tag</th><th>Category</th><th>Difficulty</th><th>Adult</th><th>Time submitted</th><th>Submitted by</th>
			</tr>
			<?php
				for ($i = 0; $i < count($tags); $i++) {
					echo 
						"<tr>
							<td><a id=\"approveCell{$tags[$i]['id']}\" href=\"#\" onclick=\"approve({$tags[$i]['id']}); return false;\">Approve</a></td>
							<td><a id=\"deleteCell{$tags[$i]['id']}\" href=\"#\" onclick=\"deleteTag({$tags[$i]['id']}); return false;\">Delete</a></td>
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