<?php

include "mysql.php";

header("Access-Control-Allow-Origin: null");

// Build a query
$query = "SELECT * FROM category ORDER BY name";

// Get difficulties from the database
$db = mysqlConnect();
$statement = $db->query($query);
$categories = array("");
while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
	$row["id"] = intval($row["id"]);
	array_push($categories, $row);
}

// Return the results
echo json_encode($categories);
