<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_response(['error' => 'Method not allowed'], 405);
}

$data = get_json_body();
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

$stmt = $conn->prepare("SELECT id, email, password, role FROM users WHERE email=? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($user && $password === $user['password']) {
  $_SESSION['user_id'] = $user['id'];
  $_SESSION['user_email'] = $user['email'];
  $_SESSION['user_role'] = $user['role'];
  json_response(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']]);
}

json_response(['error' => 'Invalid credentials'], 401);
?>
