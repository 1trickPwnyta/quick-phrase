<?php

include "../mysql.php";

// Get parameters
$tag = $_GET["tag"];

// Build a query
$db = mysqlConnect();
$query = "SELECT (SELECT COUNT(*) FROM tag WHERE text = {$db->quote($tag)}) + 
			(SELECT COUNT(*) FROM unapproved_tag WHERE text = {$db->quote($tag)}) AS tagCount";

// Get count from the database
$statement = $db->query($query);
$tagCounts = array();
while ($row = $statement->fetch(PDO::FETCH_ASSOC))
	array_push($tagCounts, $row);

// Return the results
echo ($tagCounts[0]["tagCount"] > 0? 1: 0);