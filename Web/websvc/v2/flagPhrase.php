<?php
	include "../../mysql.php";
	
	header("Access-Control-Allow-Origin: null");
	
	// Get parameters
	$id = (int) $_POST["id"];
	$reason = $_POST["reason"];
	
	$db = mysqlConnect();
	
	// Build a query
	$query =
		"INSERT INTO flagged_tag (tag_id, reason, ip_address) VALUES (
			$id, {$db->quote($reason)}, {$db->quote($_SERVER['REMOTE_ADDR'])}
		)";

	// Insert the flag into the database
	$rowsAffected = $db->exec($query);

	// Return the results
	echo 1;