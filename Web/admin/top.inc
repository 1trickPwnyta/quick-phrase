<?php
	require_once("functions.php");
?>

<!DOCTYPE html>
<html lang="en-us">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="<?php echo $APPLICATION_ROOT_PATH; ?>favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="<?php echo $APPLICATION_ROOT_PATH; ?>favicon.ico" type="image/x-icon" />
		<link rel="stylesheet" href="./admin.css" />
		<link href="dialog.css" rel="stylesheet" />
		<title>Catch-Phrase Panic Administration</title>
		<script src="../ajax.js"></script>
		<script src="../applicationRoot.js"></script>
		<script src="../dialog.js"></script>
		<script src="./admin.js.php"></script>
	</head>
	<body>
		<div id="waitingScreen">
			<span>Please wait...</span>
		</div>
		<div style="float: right;">
			<a style="color: white;" href="<?php echo $SIMPLESAML_LOGOUT_URL_RELATIVE; ?>?AuthId=<?php echo $SAML_SP_ID; ?>&ReturnTo=<?php echo $APPLICATION_ROOT_PATH; ?>loggedOut.php">Log out</a>
		</div>
		<h2>Catch-Phrase Panic Administration</h2>
		<h4>Version 1.2.2</h4>
		<nav>
			<ul>
				<li><a href="index.php">Unapproved phrases</a></li>
				<li><a href="flags.php">Reported phrases</a></li>
			</ul>
		</nav>