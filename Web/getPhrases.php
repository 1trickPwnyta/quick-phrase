<?php

include "mysql.php";

header("Access-Control-Allow-Origin: null");

// Get parameters
$numberOfTags = (int) $_GET["numberOfPhrases"];
$categoryIds = (array) json_decode($_GET["categoryIds"]);
for ($i = 0; $i < count($categoryIds); $i++)
	$categoryIds[$i] = (int) $categoryIds[$i];
$difficultyId = (int) $_GET["difficultyId"];
$maxCharacters = (int) $_GET["maxCharacters"];
$maxWords = (int) $_GET["maxWords"];
$edgy = (int) $_GET["edgy"];

// Validate parameters
if ($numberOfTags < 1) {
	$numberOfTags = (int) $_GET["numberOfTags"];
	if ($numberOfTags < 1) {
		http_response_code(400);
		echo "numberOfPhrases must be an integer greater than 0.";
		exit;
	}
}
if ($categoryIds == null) {
	$categoryIds = array();
}
if ($difficultyId < 1) {
	http_response_code(400);
	echo "difficultyId must be an integer greater than 0.";
	exit;
}
if ($maxCharacters < 0) {
	http_response_code(400);
	echo "maxCharacters must be an integer greater than -1.";
	exit;
}
if ($maxWords < 0) {
	http_response_code(400);
	echo "maxWords must be an integer greater than -1.";
	exit;
}

// Build a query
$query = "SELECT t.*, u.username AS authorName FROM tag t ";
$query .= "LEFT JOIN user u ON u.id = t.submitter ";
$query .= "WHERE category_id IN (";
if (count($categoryIds) > 0) {
	foreach ($categoryIds as $categoryId)
		$query .= "$categoryId, ";
	$query .= "-1) ";
} else
	$query .= "category_id) ";
$query .= "AND difficulty_rating <= (SELECT max_rating FROM difficulty_level WHERE id = $difficultyId) ";
if ($maxCharacters > 0)
	$query .= "AND LENGTH(text) <= $maxCharacters ";
if ($maxWords > 0)
	$query .= "AND LENGTH(text) - LENGTH(REPLACE(text, ' ', '')) <= $maxWords - 1 ";
if ($edgy == 0)
	$query .= "AND edgy = 0 ";
$query .= "ORDER BY RAND() ";
$query .= "LIMIT $numberOfTags ";

// Get phrases from the database
$db = mysqlConnect();
$statement = $db->query($query);
$tags = array();
while ($row = $statement->fetch(PDO::FETCH_ASSOC))
	array_push($tags, $row);

// Return the results
echo json_encode($tags);
