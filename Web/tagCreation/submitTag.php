<?php
	include "../mysql.php";
	session_start();
	$userid = $_SESSION["userid"];
	
	// Get parameters
	$text = $_POST["text"];
	$category = (int) $_POST["category"];
	
	// Validate parameters
	if (preg_match("/[<>]/", $text)) {
		http_response_code(400);
		echo "&lt; and &gt; characters are not allowed.";
		exit;
	}
	
	$db = mysqlConnect();
	
	// Build a query
	$query =
		"INSERT INTO unapproved_tag (category_id, text, submitter) VALUES (
			$category, {$db->quote($text)}, $userid
		)";

	// Insert the tag into the database
	$rowsAffected = $db->exec($query);

	// Validate the result
	if ($rowsAffected != 1) {
		http_response_code(500);
		echo 0;
		exit;
	}

	// Return the results
	echo 1;