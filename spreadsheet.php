<?php
$url = $_POST['url'];
$sheetName = urlencode($_POST['sheetName']);
$apiKey = $_POST['apiKey'];
$pURL=parse_url($url);
$parts = explode('/', $pURL['path']);
$sheetid = $parts[3];
$requestURL = 'https://sheets.googleapis.com/v4/spreadsheets/'.$sheetid."/values/".$sheetName."?key=".$apiKey;
$response = file_get_contents($requestURL);
echo $response;
?>