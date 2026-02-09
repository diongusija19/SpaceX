<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

$allowed = ['todo','doing','done'];

function current_team($conn) {
  $uid = current_user_id();
  $stmt = $conn->prepare("SELECT team FROM users WHERE id=?");
  $stmt->bind_param("i", $uid);
  $stmt->execute();
  $row = $stmt->get_result()->fetch_assoc();
  $stmt->close();
  return $row['team'] ?? 'alpha';
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $team = current_team($conn);
  $result = $conn->query("SELECT id, title, description, status, priority, assignee, tags, due_date, created_at, user_id, team FROM board_items WHERE team='" . $conn->real_escape_string($team) . "' ORDER BY created_at DESC");
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

    $uid = current_user_id();
    $team = current_team($conn);
    $stmt = $conn->prepare("INSERT INTO board_items (user_id, team, title, description, status, priority, assignee, tags, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssssss", $uid, $team, $title, $description, $status, $priority, $assignee, $tags, $due_date);
    $stmt->execute();
    $id = $stmt->insert_id;
    $stmt->close();

    create_notification($conn, $uid, "Created work item: {$title}");
    json_response(['id' => $id]);
  }

  if ($action === 'move') {
    $id = (int)($data['id'] ?? 0);
    $status = $data['status'] ?? '';
    if ($id <= 0 || !in_array($status, $allowed, true)) {
      json_response(['error' => 'Invalid request'], 400);
    }

    $team = current_team($conn);
    $stmt = $conn->prepare("UPDATE board_items SET status=? WHERE id=? AND team=?");
    $stmt->bind_param("sis", $status, $id, $team);
    $stmt->execute();
    $stmt->close();

    create_notification($conn, current_user_id(), "Moved work item #{$id} to {$status}");
    json_response(['ok' => true]);
  }

  if ($action === 'delete') {
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) json_response(['error' => 'Invalid request'], 400);

    $team = current_team($conn);
    $stmt = $conn->prepare("DELETE FROM board_items WHERE id=? AND team=?");
    $stmt->bind_param("is", $id, $team);
    $stmt->execute();
    $stmt->close();

    create_notification($conn, current_user_id(), "Deleted work item #{$id}");
    json_response(['ok' => true]);
  }

  json_response(['error' => 'Invalid request'], 400);
}

json_response(['error' => 'Method not allowed'], 405);
?>
