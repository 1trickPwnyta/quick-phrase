<?php
	include "../mysql.php";
	require_once "../global.php";
	
	header("Access-Control-Allow-Origin: null");
	
	// Get parameters
	$location = $_POST["location"];
	
	// Validate parameters
	if ($location == "") {
		http_response_code(400);
		echo 0;
		exit;
	}
	if (preg_match("/[^\\/\\w\\d]/", $location)) {
		http_response_code(400);
		echo 0;
		exit;
	}
	
	$db = mysqlConnect();
	
	// Build a query
	$query =
		"INSERT INTO usage_clicks (location) VALUES (
			{$db->quote($location)}
		)";

	// Insert the click into the database
	$rowsAffected = $db->exec($query);

	// Validate the result
	if ($rowsAffected != 1) {
		http_response_code(500);
		echo 0;
		exit;
	}

	// Return the results
	echo 1;