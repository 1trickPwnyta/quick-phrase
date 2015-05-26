<?php 
	require_once "../config.php";
	require_once "../mysql.php";
	require_once "../global.php";
	
	// Get user attributes
	require_once($SIMPLESAML_AUTOLOAD_PATH);	$authenticationSource = new SimpleSAML_Auth_Simple($SAML_SP_ID);	$authenticationSource->requireAuth();	$attributes = $authenticationSource->getAttributes();
	$username = $authenticationSource->getAuthData('saml:sp:NameID')["Value"];
	$emailAddress = $attributes["EmailAddress"][0];
	
	// Build a query
	$db = mysqlConnect();
	$query = 
		"INSERT INTO user (username, email_address) VALUES (
			{$db->quote($username)}, {$db->quote($emailAddress)}
		)";
		
	// Insert the user into the database
	$rowsAffected = $db->exec($query);
	
	// Validate the result
	if ($rowsAffected != 1) {
		$query = 
			"UPDATE user
				SET email_address = {$db->quote($emailAddress)}
				WHERE username = {$db->quote($username)}
			";
		$rowsAffected = $db->exec($query);
	}
	
	// Build a query to get the user's ID
	$query = 
		"SELECT id FROM user WHERE username = {$db->quote($username)}";
	$statement = $db->query($query);
	$users = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($users, $row);
	$userid = $users[0]["id"];
	
	// Set Session information
	session_start();
	$_SESSION[$SESSION_KEY_USERID] = $userid;
	
	
	
	// Get parameters
	$tag = isset($_GET["tag"])? $_GET["tag"]: "";
	$category = isset($_GET["category"])? (int) $_GET["category"]: 0;
	
	// Validate the parameters
	$tag = htmlentities($tag);
	
	// Build a query
	$query = "SELECT id, name FROM category ORDER BY name";
	
	// Get categories from the database
	$statement = $db->query($query);
	$categories = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($categories, $row);
?>

<!DOCTYPE html>
<html lang="en-us">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="<?php echo $APPLICATION_ROOT_PATH; ?>favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="<?php echo $APPLICATION_ROOT_PATH; ?>favicon.ico" type="image/x-icon" />
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
		<link href="../dialog.css" rel="stylesheet" />
		<title>Grab Tag - Tag Creation</title>
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
			
			h1 {
				font-size: 1.5em;
				margin-bottom: 1%;
			}
			
			h2 {
				font-size: 1em;
				margin-top: 1%;
			}
			
			a {
				color: white;
				font-weight: bold;
				text-decoration: underline;
			}
			
			input[type="button"], input[type="submit"] {
			    margin: 1%;
			    padding: 1% 3%;
			    background-color: #DE4343;
			    color: white;
			    font-size: 1.2em;
			    border: 0%;
			    border-radius: 1%;
			    font-family: inherit;
			    cursor: pointer;
				box-shadow: 1% 1% 1% black;
				font-size: 1.5em;
				width: 96%;
			}
			
			input[type="button"]:active, input[type="submit"]:active {
				box-shadow: inset 1% 1% 1% #6F2222;
				background-color: #B23636;
				color: #CACACA;
			}
			
			input[type="button"]:focus, input[type="submit"]:focus {
			    outline: 0%;
			    border: 0%;
			}
			
			input[type="text"], input[type="number"], select {
			    width: 100%;
			    margin: 1% 0%;
			    font-size: 1.25em;
			}
			
			select, input[type="text"], input[type="number"] {
				font-family: inherit;
			}
		</style>
		<script src="../ajax.js"></script>
		<script src="../applicationRoot.js"></script>
		<script src="../dialog.js"></script>
		<script>
			var oldText = "";
			
			window.onload = function() {
				window.setInterval(checkTag, 1000);
				document.getElementById("text").select();
			};

			function submitTag() {
				var tag = document.getElementById("text").value;
				if (tag == "") {
					dialog.showMessage("Please enter a tag.");
					return;
				}
				var tagStats = document.getElementById("tagStats");
				if (tagStats.innerHTML != "") {
					dialog.showMessage(tagStats.innerHTML);
					return;
				}
				var category = document.getElementById("category");
				if (category.value < 1) {
					dialog.showMessage("Please select a category.");
					return;
				}

				ajax("POST", "submitTag.php", [{name: "text", value: tag}, {name: "category", value: category.value}], function(response, status) {
					if ((status >= 300 && status < 400) || status == -1) {
						window.location.href = window.location.href;
						return;
					} else if (status == 400) {
						dialog.showMessage("Your tag was automatically rejected. " + response);
						return;
					} else if (status != 200) {
						dialog.showMessage("An unknown error occurred. Please contact <a href=\"mailto:<?php echo $SUPPORT_EMAIL_ADDRESS; ?>\"><?php echo $SUPPORT_EMAIL_ADDRESS; ?></a> for help.");
						return;
					}

					dialog.showMessage("Thank you. Your tag &quot;" + tag + "&quot; was submitted and is now pending approval.", function() {
						document.getElementById("text").value = "";
						document.getElementById("text").select();
					});
				});
			}

			function checkTag() {
				var tag = document.getElementById("text").value;
				if (oldText != tag) {
					oldText = tag;
					
					var tagStats = document.getElementById("tagStats");
					if (tag == "") {
						tagStats.innerHTML = "";
					} else {
						ajax("GET", "checkTag.php", [{name: "tag", value: tag}], function(response) {
							if (response > 0) {
								tagStats.innerHTML = "<img src=\"error.png\" /> The tag &quot;" + tag + "&quot; already exists.";
							} else {
								tagStats.innerHTML = "";
							}
						});
					}
				}
			}
		</script>
	</head>
	<body>
		<div style="float: right;">
			<a href="<?php echo $SIMPLESAML_LOGOUT_URL_RELATIVE; ?>?AuthId=<?php echo $SAML_SP_ID; ?>&ReturnTo=<?php echo $APPLICATION_ROOT_PATH; ?>loggedOut.php">Log out</a>
		</div>
		<h1>Grab Tag</h1>
		<h2>Tag Creation</h2>
		<hr />
		<p>
			Tags you create here will be submitted for review. Once approved, 
			your new tag will instantly be added to the game - not just yours, 
			but everyone's.
		</p>
		<form method="post" action="#" onsubmit="submitTag(); return false;">
			<label for="text">Enter a tag:</label><br />
			<input id="text" name="text" type="text" <?php if ($tag) echo "value=\"$tag\" "; ?>/><br />
			<span id="tagStats"> </span><br /><br />
			<label>Categorize your tag:</label><br />
			<select id="category" name="category">
				<option value="0">&lt;Select a category&gt;</option>
				<?php 
					for ($i = 0; $i < count($categories); $i++) {
						echo "<option value=\"{$categories[$i]['id']}\"".($category == $categories[$i]['id']? " selected": "").">{$categories[$i]['name']}</option>
						";
					}
				?>
			</select><br /><br />
			<input id="submit" type="submit" value="Submit" />
		</form>
	</body>
</html>