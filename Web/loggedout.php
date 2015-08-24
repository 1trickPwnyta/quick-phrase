<?php
	require_once "config.php";
?>

<!DOCTYPE html>
<html lang="en-us">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="<?php echo $APPLICATION_ROOT_PATH; ?>favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="<?php echo $APPLICATION_ROOT_PATH; ?>favicon.ico" type="image/x-icon" />
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
		<title>Catch-Phrase Panic Logout</title>
		<style>
			@font-face {
				font-family: 'standard';
				src: url('./font.woff') format('woff');
			}
			
			body {
				background-color: #474747;
				color: white;
				font-family: standard;
			}
			
			a {
				color: white;
				font-weight: bold;
				text-decoration: underline;
			}
		</style>
	</head>
	<body>
		<p>You are logged out.</p>
		<p><a href="#" onclick="window.history.back(); return false;">Log back in</a></p>
	</body>
</html>