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
	
	$db = mysqlConnect();
	for ($i = 0; $i < count($tags); $i++) {
		// Build a query to update the phrase
		$query = 
			"UPDATE tag 
			SET category_id = {$tags[$i]->categoryId}, 
			text = {$db->quote(html_entity_decode($tags[$i]->text))}, 
			difficulty_rating = {$tags[$i]->difficulty}, 
			edgy = {$tags[$i]->edgy}
			WHERE id = {$tags[$i]->tag_id}";
		
		// Update the phrase in the database
		$db->exec($query);
			
		// Build a query to remove the phrase from the flagged table
		$query = "DELETE FROM flagged_tag WHERE id = {$tags[$i]->id}";
		
		// Delete the phrase from the flagged table
		$rowsAffected = $db->exec($query);
	}
?>