<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $uid = current_user_id();
  $result = $conn->query("SELECT id, message, is_read, created_at FROM notifications WHERE user_id={$uid} ORDER BY created_at DESC LIMIT 50");
  $data = [];
  while ($row = $result->fetch_assoc()) {
    $data[] = $row;
  }
  json_response($data);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = get_json_body();
  $action = $data['action'] ?? '';
  $uid = current_user_id();

  if ($action === 'mark_read') {
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) json_response(['error' => 'Invalid request'], 400);
    $stmt = $conn->prepare("UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?");
    $stmt->bind_param("ii", $id, $uid);
    $stmt->execute();
    $stmt->close();
    json_response(['ok' => true]);
  }

  if ($action === 'mark_all') {
    $conn->query("UPDATE notifications SET is_read=1 WHERE user_id={$uid}");
    json_response(['ok' => true]);
  }

  json_response(['error' => 'Invalid request'], 400);
}

json_response(['error' => 'Method not allowed'], 405);
?>
