<?php
require __DIR__ . '/util.php';

if (!isset($_SESSION['user_id'])) {
  json_response(['user' => null]);
}

json_response([
  'id' => $_SESSION['user_id'],
  'email' => $_SESSION['user_email'] ?? '',
  'role' => $_SESSION['user_role'] ?? 'user'
]);
?>
