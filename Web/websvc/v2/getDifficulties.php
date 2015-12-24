<?php

include "../../mysql.php";

header("Access-Control-Allow-Origin: null");

// Build a query
$query = "SELECT * FROM difficulty_level ORDER BY id";

// Get difficulties from the database
$db = mysqlConnect();
$statement = $db->query($query);
$difficulties = array("");
while ($row = $statement->fetch(PDO::FETCH_ASSOC))
	array_push($difficulties, $row);

// Return the results
echo json_encode($difficulties);
