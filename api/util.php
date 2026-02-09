<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

function json_response($data, $status = 200) {
  http_response_code($status);
  header('Content-Type: application/json');
  echo json_encode($data);
  exit;
}

function require_login() {
  if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Unauthorized'], 401);
  }
}

function current_user_id() {
  return (int)($_SESSION['user_id'] ?? 0);
}

function current_user_role() {
  return (string)($_SESSION['user_role'] ?? '');
}

function is_admin() {
  return current_user_role() === 'admin';
}

function require_admin() {
  if (!is_admin()) {
    json_response(['error' => 'Forbidden'], 403);
  }
}

function get_json_body() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function create_notification($conn, $user_id, $message) {
  $stmt = $conn->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)");
  $stmt->bind_param("is", $user_id, $message);
  $stmt->execute();
  $stmt->close();
}
?>
