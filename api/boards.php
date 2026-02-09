<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

$allowed = ['todo','doing','done'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $where = '';
  if (!is_admin()) {
    $where = ' WHERE user_id=' . current_user_id();
  }

  $result = $conn->query("SELECT id, title, description, status, priority, assignee, tags, due_date, created_at, user_id FROM board_items{$where} ORDER BY created_at DESC");
  $items = [];
  while ($row = $result->fetch_assoc()) {
    $items[] = $row;
  }

  json_response($items);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = get_json_body();
  $action = $data['action'] ?? '';

  if ($action === 'create') {
    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $status = $data['status'] ?? 'todo';
    $priority = $data['priority'] ?? 'medium';
    $assignee = trim($data['assignee'] ?? '');
    $tags = trim($data['tags'] ?? '');
    $due_date = $data['due_date'] ?? null;

    if ($title === '' || !in_array($status, $allowed, true)) {
      json_response(['error' => 'Invalid request'], 400);
    }

    $stmt = $conn->prepare("INSERT INTO board_items (user_id, title, description, status, priority, assignee, tags, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $uid = current_user_id();
    $stmt->bind_param("isssssss", $uid, $title, $description, $status, $priority, $assignee, $tags, $due_date);
    $stmt->execute();
    $id = $stmt->insert_id;
    $stmt->close();

    json_response(['id' => $id]);
  }

  if ($action === 'move') {
    $id = (int)($data['id'] ?? 0);
    $status = $data['status'] ?? '';
    if ($id <= 0 || !in_array($status, $allowed, true)) {
      json_response(['error' => 'Invalid request'], 400);
    }

    if (!is_admin()) {
      $stmt = $conn->prepare("UPDATE board_items SET status=? WHERE id=? AND user_id=?");
      $uid = current_user_id();
      $stmt->bind_param("sii", $status, $id, $uid);
    } else {
      $stmt = $conn->prepare("UPDATE board_items SET status=? WHERE id=?");
      $stmt->bind_param("si", $status, $id);
    }
    $stmt->execute();
    $stmt->close();

    json_response(['ok' => true]);
  }

  if ($action === 'delete') {
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) json_response(['error' => 'Invalid request'], 400);

    if (!is_admin()) {
      $stmt = $conn->prepare("DELETE FROM board_items WHERE id=? AND user_id=?");
      $uid = current_user_id();
      $stmt->bind_param("ii", $id, $uid);
    } else {
      $stmt = $conn->prepare("DELETE FROM board_items WHERE id=?");
      $stmt->bind_param("i", $id);
    }
    $stmt->execute();
    $stmt->close();

    json_response(['ok' => true]);
  }

  json_response(['error' => 'Invalid request'], 400);
}

json_response(['error' => 'Method not allowed'], 405);
?>
