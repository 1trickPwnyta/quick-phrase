<?php
	include "mysql.php";
	require_once "global.php";
	
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
	
	$db = mysqlConnect();
	
	// Build a query
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