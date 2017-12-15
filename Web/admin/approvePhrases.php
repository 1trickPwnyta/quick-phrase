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
		if ($approve > 0) {
			// Build a query to insert the phrase
			$query = 
				"INSERT INTO tag (category_id, text, difficulty_rating, edgy)
				VALUES ({$tags[$i]->categoryId}, {$db->quote(html_entity_decode($tags[$i]->text))}, {$tags[$i]->difficulty}, {$tags[$i]->edgy})";
			
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
		}
			
		// Build a query to remove the phrase from the unapproved table
		$query = "DELETE FROM unapproved_tag WHERE id = {$tags[$i]->id}";
		
		// Delete the phrase from the unapproved table
		$rowsAffected = $db->exec($query);
	}
	
	// Return the results
	echo json_encode($unapprovedTags);
?>