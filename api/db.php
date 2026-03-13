<?php
$host = getenv('DB_HOST') ?: 'localhost';
$db   = getenv('DB_NAME') ?: 'spacex_cloud';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
  die("DB connection failed: " . $conn->connect_error);
}
?>
