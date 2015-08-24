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
	
	// Build a query to get the unapproved phrases
	$query = "SELECT unapproved_tag.id AS id, text, category.name AS category, category.id AS category_id, time_submitted, user.username AS submitter FROM unapproved_tag INNER JOIN category on category.id = unapproved_tag.category_id INNER JOIN user on user.id = unapproved_tag.submitter ORDER BY unapproved_tag.id";
	
	// Get unapproved phrases from the database
	$db = mysqlConnect();
	$statement = $db->query($query);
	$tags = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($tags, $row);
	
	// Build a query to get the categories
	$query = "SELECT id, name FROM category ORDER BY name";
	
	// Get categories from the database
	$statement = $db->query($query);
	$categories = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($categories, $row);
	
	// Build a query to get the highest difficulty rating
	$query = "SELECT MAX(max_rating) AS max_difficulty FROM difficulty_level";
	
	// Get max difficulty from the database
	$statement = $db->query($query);
	$maxDifficulties = array();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC))
		array_push($maxDifficulties, $row);
	$maxDifficulty = $maxDifficulties[0]["max_difficulty"];
	
	include "top.inc";
?>

<div id="action-buttons">
	<a href="#" onclick="selectAll(); return false;">Select all</a>
	<a href="#" onclick="approve(); return false;">Approve</a>
	<a href="#" onclick="reject(); return false;">Reject</a>
</div>
<table id="tagTable">
	<tr>
		<th></th><th>Phrase</th><th>Category</th><th>Difficulty</th><th>Adult</th><th>Time submitted</th><th>Submitted by</th>
	</tr>
	<?php
		for ($i = 0; $i < count($tags); $i++) {
			echo 
				"<tr>
					<td><input id=\"selectCell{$tags[$i]['id']}\" type=\"checkbox\" /></td>
					<td><a id=\"textCell{$tags[$i]['id']}\" href=\"#\" onclick=\"setText({$tags[$i]['id']}); return false;\">".htmlentities($tags[$i]['text'])."</a></td>
					<td><a id=\"categoryCell{$tags[$i]['id']}\" href=\"#\" onclick=\"setCategory({$tags[$i]['id']}); return false;\">{$tags[$i]['category_id']} {$tags[$i]['category']}</td>
					<td><a id=\"difficultyCell{$tags[$i]['id']}\" href=\"#\" onclick=\"setDifficulty({$tags[$i]['id']}); return false;\">???</a></td>
					<td><a id=\"edgyCell{$tags[$i]['id']}\" href=\"#\" onclick=\"setEdgy({$tags[$i]['id']}); return false;\">false</td>
					<td>{$tags[$i]['time_submitted']}</td>
					<td>{$tags[$i]['submitter']}</td>
				</tr>";
		}
	?>
</table>

<?php
	include "bottom.inc";
?>