<?php
	require_once "../config.php";
	require_once "../mysql.php";
	
	// Get user attributes
	require_once($SIMPLESAML_AUTOLOAD_PATH);
	$authenticationSource = new SimpleSAML_Auth_Simple($SAML_SP_ID);
	$authenticationSource->requireAuth();
	$attributes = $authenticationSource->getAttributes();
	$authorized = filter_var($attributes["Admin"][0], FILTER_VALIDATE_BOOLEAN);
	
	if (!$authorized) {
		http_response_code(401);
		echo "You are not authorized.";
		exit;
	}
	
	// Build a query to get the flagged phrases
	$query = "SELECT flagged_tag.id AS id, tag_id, text, category.name AS category, category.id AS category_id, difficulty_rating, edgy, reason, ip_address FROM flagged_tag INNER JOIN tag ON tag.id = flagged_tag.tag_id INNER JOIN category on category.id = tag.category_id ORDER BY flagged_tag.id";
	
	// Get flagged phrases from the database
	$db = mysqlConnect();
	$statement = $db->query($query);
	$tags = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($tags, $row);
	
	include "top.inc";
?>

<div id="action-buttons">
	<a href="#" onclick="dismissAllFlaggedTags(); return false;">Dismiss all</a>
</div>
<table id="tagTable">
	<tr>
		<th></th><th>Phrase</th><th>Category</th><th>Difficulty</th><th>Adult</th><th>Reason</th><th>Submitted by</th>
	</tr>
	<?php
		for ($i = 0; $i < count($tags); $i++) {
			echo 
				"<tr id=\"tagRow{$tags[$i]['id']}\" class=\"{$tags[$i]['tag_id']}\">
					<td><a href=\"#\" onclick=\"dismissFlaggedTag({$tags[$i]['id']}); return false;\">Dismiss</a></td>
					<td><a id=\"textCell{$tags[$i]['id']}\" href=\"#\" onclick=\"setText({$tags[$i]['id']}); return false;\">".htmlentities($tags[$i]['text'])."</a></td>
					<td><a id=\"categoryCell{$tags[$i]['id']}\" href=\"#\" onclick=\"setCategory({$tags[$i]['id']}); return false;\">{$tags[$i]['category_id']} {$tags[$i]['category']}</td>
					<td><a id=\"difficultyCell{$tags[$i]['id']}\" href=\"#\" onclick=\"setDifficulty({$tags[$i]['id']}); return false;\">{$tags[$i]['difficulty_rating']}</a></td>
					<td><a id=\"edgyCell{$tags[$i]['id']}\" href=\"#\" onclick=\"setEdgy({$tags[$i]['id']}); return false;\">".($tags[$i]['edgy']? "true": "false")."</td>
					<td>{$tags[$i]['reason']}</td>
					<td>{$tags[$i]['ip_address']}</td>
				</tr>";
		}
	?>
</table>

<?php
	include "bottom.inc";
?>