<?php
	require_once "../config.php";
	require_once "../mysql.php";
	
	// Get user attributes
	require_once('C:/Program Files (x86)/simplesamlphp/lib/_autoload.php');
	$authenticationSource = new SimpleSAML_Auth_Simple($SAML_SP_ID);
	$authenticationSource->requireAuth();
	$attributes = $authenticationSource->getAttributes();
	$authorized = filter_var($attributes["Admin"][0], FILTER_VALIDATE_BOOLEAN);
	
	if (!$authorized) {
		http_response_code(401);
		echo "You are not authorized.";
		exit;
	}
	
	// Get parameters
	$id = (int) $_POST["id"];
	$approve = (int) $_POST["approve"];
	$reason = $_POST["reason"];
	$text = html_entity_decode($_POST["text"]);
	$categoryId = (int) $_POST["categoryId"];
	$difficulty = (int) $_POST["difficulty"];
	$edgy = (int) $_POST["edgy"];
	
	// Validate the parameters
	if ($approve > 0 && $difficulty < 1) {
		http_response_code(400);
		echo "difficulty must be greater than 0.";
		exit;
	}
	
	$db = mysqlConnect();
	
	// Build a query to get the original unapproved tag
	$query = "
	SELECT text, category.id AS category_id, category.name AS category_name, submitter FROM unapproved_tag
	INNER JOIN category ON category.id = unapproved_tag.category_id
	WHERE unapproved_tag.id = $id";
	
	// Get unapproved tag from the database
	$statement = $db->query($query);
	$tags = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($tags, $row);
	
	// Build a query to get submitter's email address
	$query = "
	SELECT email_address FROM user
	WHERE id = {$tags[0]["submitter"]}";
	
	// Get email address from the database
	$statement = $db->query($query);
	$users = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($users, $row);
	$userEmail = $users[0]["email_address"];
	
	if ($approve > 0) {
		// Compare the original unapproved tag to the one being approved
		if (trim(strtolower($tags[0]["text"])) != trim(strtolower($text)))
			$changedText = true;
		if ($tags[0]["category_id"] != $categoryId) {
			$changedCategory = true;
			
			// Build a query to get the new category name
			$query = "SELECT name FROM category WHERE id = $categoryId";
			
			// Get category name from the database
			$statement = $db->query($query);
			$categories = array();
			while ($row = $statement->fetch(PDO::FETCH_ASSOC))
				array_push($categories, $row);
			
			$newCategory = $categories[0]["name"];
		}
		
		// Build a query to insert the tag
		$query = 
			"INSERT INTO tag (category_id, text, difficulty_rating, edgy)
			VALUES ($categoryId, {$db->quote($text)}, $difficulty, $edgy)";
		
		// Insert the tag into the database
		$rowsAffected = $db->exec($query);
		
		// Validate the result
		if ($rowsAffected != 1) {
			http_response_code(500);
			echo 0;
			exit;
		}
	}
		
	// Build a query to remove the tag from the unapproved table
	$query = "DELETE FROM unapproved_tag WHERE id = $id";
	
	// Delete the tag from the unapproved table
	$rowsAffected = $db->exec($query);
	
	// Send email
	require_once "Mail.php";
	
	$from = "Grab Tag <grabtag@kangaroostandard.com>";
	$to = $userEmail;
	$subject = "Your new tag: \"{$tags[0]['text']}\"";
	if ($approve > 0) {
		if ($changedText || $changedCategory) {
			$body = "Your tag was approved with the following changes: \r\n";
			if ($changedText)
				$body .= "Your tag is now \"$text\". \r\n";
			if ($changedCategory)
				$body .= "Your tag's category is now $newCategory. \r\n";
		} else
			$body = "Your tag was approved. \r\n";
		$body .= "It is now being used in the game everywhere. \r\n";
	} else {
		$body = "Your tag was rejected for the following reason: \r\n";
		$body .= $reason." \r\n";
	}
	$body .= "Thank you! \r\n";
	
	$host = "ssl://smtp.gmail.com";
	$port = "465";
	$username = "danielpace6";
	$password = "uykfwntmcmfegyuw";
	
	$headers = array (
			"From" => $from,
			"To" => $to,
			"Subject" => $subject
	);
	
	$smtp = Mail::factory("smtp", array (
			"host" => $host,
			"port" => $port,
			"auth" => true,
			"username" => $username,
			"password" => $password
	));
	
	$mail = $smtp->send($to, $headers, $body);
	
	// Return the results
	echo 1;
?>