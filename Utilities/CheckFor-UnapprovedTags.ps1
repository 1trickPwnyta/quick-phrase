## To use this utility:
# Download MySQL connector for C#.NET
# Fill in the database password below
# Fill in the SMTP password way below
# Change other deets as needed
##

## All variables will need changing to suit your environment
$server= "localhost"
$username= "quick_phrase"
$password= ""
$database= "quick_phrase"
 
## The path will need to match the mysql connector you downloaded
[void][system.reflection.Assembly]::LoadFrom(".\MySQL.Data.dll")

function global:Set-SqlConnection ( $server = $(Read-Host "SQL Server Name"), $username = $(Read-Host "Username"), $password = $(Read-Host "Password"), $database = $(Read-Host "Default Database") ) {
    $SqlConnection.ConnectionString = "server=$server;user id=$username;password=$password;database=$database;pooling=false;Allow Zero Datetime=True;"
}
 
function global:Get-SqlDataTable( $Query = $(if (-not ($Query -gt $null)) {Read-Host "Query to run"}) ) {
    if (-not ($SqlConnection.State -like "Open")) { $SqlConnection.Open() }
    $SqlCmd = New-Object MySql.Data.MySqlClient.MySqlCommand $Query, $SqlConnection
    $SqlAdapter = New-Object MySql.Data.MySqlClient.MySqlDataAdapter
    $SqlAdapter.SelectCommand = $SqlCmd
    $DataSet = New-Object System.Data.DataSet
    $SqlAdapter.Fill($DataSet) | Out-Null
    $SqlConnection.Close()
    return $DataSet.Tables[0]
}

Set-Variable SqlConnection (New-Object MySql.Data.MySqlClient.MySqlConnection) -Scope Global -Option AllScope -Description "Personal variable for Sql Query functions"
Set-SqlConnection $server $username $password $database

$global:Query = 'SELECT COUNT(*) AS c FROM unapproved_tag'
$mysqlresults = Get-SqlDataTable $Query
 
ForEach ($result in $mysqlresults){
    $count = $result.c
}

function sendMail($count) {
	$EmailFrom = "sarahpace37@gmail.com"
	$EmailTo = "sarahpace37@gmail.com"
	$Subject = "Quick Phrase Administration"
	$Body = "There are currently $count phrases pending approval. Go to https://www.kangaroostandard.com/QuickPhrase/admin to approve them.`r`n"  
	$SMTPServer = "smtp.gmail.com"

	$SMTPClient = New-Object Net.Mail.SmtpClient($SmtpServer, 587)
	$SMTPClient.EnableSsl = $true
	$SMTPClient.Credentials = New-Object System.Net.NetworkCredential("sarahpace37@gmail.com", "");
	$SMTPClient.Send($EmailFrom, $EmailTo, $Subject, $Body)
}

if ($count -gt 0) {
	sendMail($count)
}