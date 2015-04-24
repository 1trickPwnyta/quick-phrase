<?php

require_once "config.php";

function mysqlConnect() {
	global $MYSQL_DATABASE_NAME, $MYSQL_DATABASE_USERNAME, $MYSQL_DATABASE_PASSWORD;
	$db = new PDO("mysql:host=localhost;dbname=$MYSQL_DATABASE_NAME;charset=utf8", $MYSQL_DATABASE_USERNAME, $MYSQL_DATABASE_PASSWORD);
	return $db;
}