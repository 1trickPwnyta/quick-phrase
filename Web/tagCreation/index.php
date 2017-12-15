<?php 
	require_once "../config.php";
	require_once "../mysql.php";
	require_once "../global.php";
?>

<!DOCTYPE html>
<html lang="en-us">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="<?php echo $APPLICATION_ROOT_PATH; ?>favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="<?php echo $APPLICATION_ROOT_PATH; ?>favicon.ico" type="image/x-icon" />
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
		<title>Grab Tag - Tag Creation</title>
		<style>
			@font-face {
				font-family: 'standard';
				src: url('../font.woff') format('woff');
			}
			
			body {
				background-color: #474747;
				color: white;
				font-family: standard;
			}
			
			h1 {
				font-size: 1.5em;
				margin-bottom: 1%;
			}
			
			h2 {
				font-size: 1em;
				margin-top: 1%;
			}
			
			a {
				color: white;
				font-weight: bold;
				text-decoration: underline;
			}
		</style>
	</head>
	<body>
		<h1>Grab Tag</h1>
		<h2>Tag Creation</h2>
		<hr />
		<p>
			Hi! Tag Creation is no longer available. This functionality has 
			been integrated as "Custom Phrases" into the latest version of the 
			app, which has been renamed to "Quick Phrase".
		</p>
		<p>
			To download the latest version of Quick Phrase, visit  
			<a href="https://play.google.com/store/apps/details?id=com.kangaroostandard.quickphrase">Google Play</a>.
		</p>
	</body>
</html>