<?php
	include "../mysql.php";
	require_once "../global.php";
	
	// Get parameters
	$location = $_GET["location"];
	
	$db = mysqlConnect();
	
	// Build a query
	$query =
		"INSERT INTO usage_clicks (location) VALUES (
			{$db->quote($location)}
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