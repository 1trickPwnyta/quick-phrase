<?php

include "mysql.php";

header("Access-Control-Allow-Origin: null");

// Build a query
$query = "SELECT (";
$query .= "SELECT COUNT(*) FROM tag ";
$query .= "WHERE DATEDIFF(NOW(), time_approved) < 1";
$query .= ") AS today, (";
$query .= "SELECT COUNT(*) FROM tag ";
$query .= "WHERE DATEDIFF(NOW(), time_approved) < 7";
$query .= ") AS this_week, (";
$query .= "SELECT COUNT(*) FROM tag ";
$query .= "WHERE DATEDIFF(NOW(), time_approved) < 30";
$query .= ") AS this_month, (";
$query .= "SELECT COUNT(*) FROM tag";
$query .= ") AS all_time";

// Get stats from the database
$db = mysqlConnect();
$statement = $db->query($query);
$stats = array();
while ($row = $statement->fetch(PDO::FETCH_ASSOC))
	array_push($stats, $row);

// Return the results
echo json_encode($stats[0]);
