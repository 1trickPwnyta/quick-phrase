<?php
	include "mysql.php";
	
	header("Access-Control-Allow-Origin: null");
	
	// Get parameters
	$id = (int) $_POST["id"];
	$reason = $_POST["reason"];
	
	$db = mysqlConnect();
	
	// Build a query
	$query =
		"INSERT INTO flagged_tag (tag_id, reason) VALUES (
			$id, {$db->quote($reason)}
		)";

	// Insert the flag into the database
	$rowsAffected = $db->exec($query);

	// Validate the result
	if ($rowsAffected != 1) {
		http_response_code(500);
		echo 0;
		exit;
	}

	// Return the results
	echo 1;