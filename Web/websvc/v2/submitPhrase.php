<?php
	include "../../mysql.php";
	require_once "../../global.php";
	
	header("Access-Control-Allow-Origin: null");
	
	// Get parameters
	$text = $_POST["text"];
	$category = (int) $_POST["category"];
	$isCustomCategory = (int) $_POST["isCustomCategory"];
	
	// Validate parameters
	if (preg_match("/[<>]/", $text)) {
		http_response_code(400);
		echo "&lt; and &gt; characters are not allowed.";
		exit;
	}
	
	// Build a query to check if the phrase exists
	$db = mysqlConnect();
	$regex = "^".preg_replace("/[^a-zA-Z0-9]*/", "[^a-zA-Z0-9]*", $text)."$";
	$query = "SELECT (SELECT COUNT(*) FROM tag WHERE text REGEXP {$db->quote($regex)}) +
	(SELECT COUNT(*) FROM unapproved_tag WHERE text REGEXP {$db->quote($regex)}) AS tagCount";
	
	// Get count from the database
	$statement = $db->query($query);
	$tagCounts = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($tagCounts, $row);
	
	// Validate the count
	if ($tagCounts[0]["tagCount"] > 0) {
		http_response_code(409);
		echo "The phrase already exists.";
		exit;
	}
	
	// Build a query to insert the phrase as unapproved
	if (!$isCustomCategory) {
		$query =
			"INSERT INTO unapproved_tag (category_id, text, ip_address) VALUES (
				$category, {$db->quote($text)}, {$db->quote($_SERVER['REMOTE_ADDR'])}
			)";
	} else {
		$query =
			"INSERT INTO unapproved_tag (text, ip_address) VALUES (
				{$db->quote($text)}, {$db->quote($_SERVER['REMOTE_ADDR'])}
			)";
	}

	// Insert the phrase into the database
	$rowsAffected = $db->exec($query);

	// Validate the result
	if ($rowsAffected != 1) {
		http_response_code(500);
		echo 0;
		exit;
	}

	// Return the results
	echo 1;