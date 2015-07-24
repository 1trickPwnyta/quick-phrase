<?php
	require_once "../config.php";
	require_once "../mysql.php";
	
	// Build a query to get the categories
	$query = "SELECT id, name FROM category ORDER BY name";
	
	// Get categories from the database
	$db = mysqlConnect();
	$statement = $db->query($query);
	$categories = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($categories, $row);
	
	// Build a query to get the highest difficulty rating
	$query = "SELECT MAX(max_rating) AS max_difficulty FROM difficulty_level";
	
	// Get max difficulty from the database
	$statement = $db->query($query);
	$maxDifficulties = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($maxDifficulties, $row);
	$maxDifficulty = $maxDifficulties[0]["max_difficulty"];
?>