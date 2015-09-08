<?php
	include "../mysql.php";
	require_once "../global.php";
	
	header("Access-Control-Allow-Origin: null");
	
	// Get parameters
	$categories = json_decode($_POST["categories"]);
	$difficulty = intval($_POST["difficulty"]);
	$maxWordsPerTag = intval($_POST["maxWordsPerTag"]);
	$maxCharactersPerTag = intval($_POST["maxCharactersPerTag"]);
	$edgy = intval($_POST["edgy"]);
	$showCategory = intval($_POST["showCategory"]);
	$pointsToWin = intval($_POST["pointsToWin"]);
	$numberOfTeams = intval($_POST["numberOfTeams"]);
	$minRoundSeconds = intval($_POST["minRoundSeconds"]);
	$maxRoundSeconds = intval($_POST["maxRoundSeconds"]);
	$timerTick = $_POST["timerTick"];
	$theme = $_POST["theme"];
	$vibrate = intval($_POST["vibrate"]);
	
	// Validate parameters
	if (preg_match("/[^\\/\\w\\d\\.]/", $timerTick)) {
		http_response_code(400);
		echo 0;
		exit;
	}
	if (preg_match("/[^\\/\\w\\d\\.]/", $theme)) {
		http_response_code(400);
		echo 0;
		exit;
	}
	
	$db = mysqlConnect();
	
	// Build a query
	$query =
		"INSERT INTO usage_settings (
			categories, 
			difficulty, 
			max_words_per_tag, 
			max_characters_per_tag, 
			edgy, 
			show_category, 
			points_to_win,
			number_of_teams,
			min_round_seconds,
			max_round_seconds,
			timer_tick,
			theme,
			vibrate
		) VALUES (
			{$db->quote(json_encode($categories))},
			$difficulty,
			$maxWordsPerTag,
			$maxCharactersPerTag,
			$edgy,
			$showCategory,
			$pointsToWin,
			$numberOfTeams,
			$minRoundSeconds,
			$maxRoundSeconds,
			{$db->quote($timerTick)},
			{$db->quote($theme)},
			$vibrate
		)";

	// Insert the settings into the database
	$rowsAffected = $db->exec($query);

	// Validate the result
	if ($rowsAffected != 1) {
		http_response_code(500);
		echo 0;
		exit;
	}

	// Return the results
	echo 1;