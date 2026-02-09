<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $result = $conn->query("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC");
  $data = [];
  while ($row = $result->fetch_assoc()) {
    $data[] = $row;
  }
  json_response($data);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = get_json_body();
  $action = $data['action'] ?? '';

  if ($action === 'create') {
    $email = trim($data['email'] ?? '');
    $password = trim($data['password'] ?? '');
    $role = $data['role'] ?? 'user';

    if ($email === '' || $password === '' || !in_array($role, ['admin','user'], true)) {
      json_response(['error' => 'Invalid request'], 400);
    }

    $stmt = $conn->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $email, $password, $role);
    if (!$stmt->execute()) {
      $stmt->close();
      json_response(['error' => 'Create failed'], 409);
    }
    $stmt->close();
    json_response(['ok' => true]);
  }

  if ($action === 'reset') {
    $id = (int)($data['id'] ?? 0);
    $password = trim($data['password'] ?? '');
    if ($id <= 0 || $password === '') {
      json_response(['error' => 'Invalid request'], 400);
    }
    $stmt = $conn->prepare("UPDATE users SET password=? WHERE id=?");
    $stmt->bind_param("si", $password, $id);
    $stmt->execute();
    $stmt->close();
    json_response(['ok' => true]);
  }

  // Backward compatible role update
  $id = (int)($data['id'] ?? 0);
  $role = $data['role'] ?? '';
  if ($id <= 0 || !in_array($role, ['admin','user'], true)) {
    json_response(['error' => 'Invalid request'], 400);
  }

  $stmt = $conn->prepare("UPDATE users SET role=? WHERE id=?");
  $stmt->bind_param("si", $role, $id);
  $stmt->execute();
  $stmt->close();

  json_response(['ok' => true]);
}

json_response(['error' => 'Method not allowed'], 405);
?>
