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
	
	// Get parameters
	$tags = json_decode($_POST["tags"]);
	$approve = (int) $_POST["approve"];
	$reason = $_POST["reason"];
	
	// Sort the incoming phrases
	function compareTag($a, $b) {
		if ($a->id == $b->id) {
			return 0;
		}
		return ($a->id < $b->id)? -1: 1;
	}
	usort($tags, "compareTag");
	
	$ids = array();
	for ($i = 0; $i < count($tags); $i++) {
		array_push($ids, $tags[$i]->id);
	}
	$ids = preg_replace("/[\\[\\]]/", "", json_encode($ids));
	
	$db = mysqlConnect();
	
	// Build a query to get the original unapproved phrases
	$query = "
	SELECT text, category.id AS category_id, category.name AS category_name, submitter FROM unapproved_tag
	LEFT JOIN category ON category.id = unapproved_tag.category_id
	WHERE unapproved_tag.id IN ($ids)
	ORDER BY unapproved_tag.id";
	
	// Get unapproved phrases from the database
	$statement = $db->query($query);
	$databaseTags = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($databaseTags, $row);
	
	$tagsBySubmitter = array();
	$unapprovedTags = array();
	for ($i = 0; $i < count($databaseTags); $i++) {
		$legacy = $databaseTags[$i]["submitter"] != null;
		
		if ($legacy) {
			$changedText = false;
			$changedCategory = false;
		
			// Build a query to get submitter's email address
			$query = "
			SELECT email_address FROM user
			WHERE id = {$databaseTags[$i]["submitter"]}";
			
			// Get email address from the database
			$statement = $db->query($query);
			$users = array();
			while ($row = $statement->fetch(PDO::FETCH_ASSOC))
				array_push($users, $row);
			$userEmail = $users[0]["email_address"];
		}
		
		if ($approve > 0) {
			if ($legacy) {
				// Compare the original unapproved phrase to the one being approved
				if (trim(strtolower($databaseTags[$i]["text"])) != trim(strtolower($tags[$i]->text)))
					$changedText = true;
				if ($databaseTags[$i]["category_id"] != $tags[$i]->categoryId) {
					$changedCategory = true;
					
					// Build a query to get the new category name
					$query = "SELECT name FROM category WHERE id = {$tags[$i]->categoryId}";
					
					// Get category name from the database
					$statement = $db->query($query);
					$categories = array();
					while ($row = $statement->fetch(PDO::FETCH_ASSOC))
						array_push($categories, $row);
					
					$newCategory = $categories[0]["name"];
				}
			}
			
			// Build a query to insert the phrase
			if (!$legacy) {
				$databaseTags[$i]["submitter"] = "NULL";
			}
			$query = 
				"INSERT INTO tag (category_id, text, difficulty_rating, edgy, submitter)
				VALUES ({$tags[$i]->categoryId}, {$db->quote(html_entity_decode($tags[$i]->text))}, {$tags[$i]->difficulty}, {$tags[$i]->edgy}, {$databaseTags[$i]["submitter"]})";
			
			// Insert the phrase into the database
			$rowsAffected = $db->exec($query);
			
			// Validate the result
			if ($rowsAffected != 1) {
				array_push($unapprovedTags, array(
					"id" => $tags[$i]->id,
					"text" => $tags[$i]->text
				));
				continue;
			}
			
			if ($legacy) {
				// Add the phrase to the list of approved phrases for its submitter
				$submitterTags = $tagsBySubmitter[$userEmail];
				if ($submitterTags == null) {
					$submitterTags = array();
				}
				array_push($submitterTags, array(
					"original" => $databaseTags[$i],
					"approved" => $tags[$i],
					"changedText" => $changedText,
					"changedCategory" => $changedCategory,
					"newCategoryName" => $newCategory
				));
				$tagsBySubmitter[$userEmail] = $submitterTags;
			}
		} else if ($legacy) {
			// Add the phrase to the list of rejected phrases for its submitter
			$submitterTags = $tagsBySubmitter[$userEmail];
			if ($submitterTags == null) {
				$submitterTags = array();
			}
			array_push($submitterTags, array(
				"original" => $databaseTags[$i]
			));
			$tagsBySubmitter[$userEmail] = $submitterTags;
		}
			
		// Build a query to remove the phrase from the unapproved table
		$query = "DELETE FROM unapproved_tag WHERE id = {$tags[$i]->id}";
		
		// Delete the phrase from the unapproved table
		$rowsAffected = $db->exec($query);
	}
	
	// Send emails
	if (!$NO_EMAIL) {
		require_once "Mail.php";
	}
	
	foreach ($tagsBySubmitter as $userEmail => $submitterTags) {
		if (count($submitterTags) > 0) {
			$from = "Grab Tag <$APPLICATION_EMAIL_ADDRESS>";
			$to = $userEmail;
			$subject = "Your new phrase".(count($submitterTags) > 1? "s": "");
			
			$body = "";
			for ($i = 0; $i < count($submitterTags); $i++) {
				if ($approve > 0) {
					if ($submitterTags[$i]['changedText'] || $submitterTags[$i]['changedCategory']) {
						$body .= "Your phrase '{$submitterTags[$i]['original']['text']}' was approved with the following changes: \r\n";
						if ($submitterTags[$i]['changedText'])
							$body .= "Your phrase is now \"{$submitterTags[$i]['approved']->text}\". \r\n";
						if ($submitterTags[$i]['changedCategory'])
							$body .= "Your phrase's category is now {$submitterTags[$i]['newCategoryName']}. \r\n";
					} else
						$body .= "Your phrase '{$submitterTags[$i]['original']['text']}' was approved. \r\n";
				} else {
					$body .= "Your phrase '{$submitterTags[$i]['original']['text']}' was rejected for the following reason: \r\n";
					$body .= $reason." \r\n";
				}
				$body .= "\r\n";
			}
			if ($approve > 0) {
				$body .= "Your phrase".(count($submitterTags) > 1? "s are": " is")." now being used in the game everywhere. \r\n";
			}
			$body .= "Thank you! \r\n";
			
			if ($NO_EMAIL) {
				$myfile = fopen("C:\\Temp\\$userEmail.txt", "w") or die("Unable to open file!");
				fwrite($myfile, $body);
				fclose($myfile);
			}
			
			if (!$NO_EMAIL) {
				$headers = array (
						"From" => $from,
						"To" => $to,
						"Subject" => $subject
				);
				
				$smtp = Mail::factory("smtp", array (
						"host" => $SMTP_HOST,
						"port" => $SMTP_PORT,
						"auth" => true,
						"username" => $SMTP_USERNAME,
						"password" => $SMTP_PASSWORD
				));
			
				$mail = $smtp->send($to, $headers, $body);
			}
		}
	}
	
	// Return the results
	echo json_encode($unapprovedTags);
?>