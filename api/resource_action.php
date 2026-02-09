<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

$data = get_json_body();
$id = (int)($data['id'] ?? 0);
$action = $data['action'] ?? '';

if ($id <= 0 || !in_array($action, ['start','stop','delete'], true)) {
  json_response(['error' => 'Invalid request'], 400);
}

$stmt = $conn->prepare("SELECT id, user_id FROM resources WHERE id=?");
$stmt->bind_param("i", $id);
$stmt->execute();
$resource = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$resource) {
  json_response(['error' => 'Not found'], 404);
}

if (!is_admin() && (int)$resource['user_id'] !== current_user_id()) {
  json_response(['error' => 'Forbidden'], 403);
}

if ($action === 'delete' && !is_admin()) {
  json_response(['error' => 'Forbidden'], 403);
}

// For delete, log first to avoid FK errors after deletion
if ($action === 'delete') {
  $log = $conn->prepare("INSERT INTO activity_log (user_id, action, resource_id) VALUES (?, ?, ?)");
  $log->bind_param("isi", $_SESSION['user_id'], $action, $id);
  $log->execute();
  $log->close();

  create_notification($conn, current_user_id(), "Deleted resource #{$id}.");

  $stmt = $conn->prepare("DELETE FROM resources WHERE id=?");
  $stmt->bind_param("i", $id);
  $stmt->execute();
  $stmt->close();

  json_response(['ok' => true]);
}

if ($action === 'start' || $action === 'stop') {
  $status = $action === 'start' ? 'running' : 'stopped';
  $stmt = $conn->prepare("UPDATE resources SET status=? WHERE id=?");
  $stmt->bind_param("si", $status, $id);
  $stmt->execute();
  $stmt->close();
}

$log = $conn->prepare("INSERT INTO activity_log (user_id, action, resource_id) VALUES (?, ?, ?)");
$log->bind_param("isi", $_SESSION['user_id'], $action, $id);
$log->execute();
$log->close();

create_notification($conn, current_user_id(), ucfirst($action) . " resource #{$id}.");

json_response(['ok' => true]);
?>
