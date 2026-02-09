<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $type = $_GET['type'] ?? 'all';
  $status = $_GET['status'] ?? 'all';
  $region = $_GET['region'] ?? 'all';

  $sql = "SELECT id, name, type, region, status, size, created_at FROM resources";
  $conditions = [];
  if (!is_admin()) $conditions[] = "user_id=" . current_user_id();
  if ($type !== 'all') $conditions[] = "type='" . $conn->real_escape_string($type) . "'";
  if ($status !== 'all') $conditions[] = "status='" . $conn->real_escape_string($status) . "'";
  if ($region !== 'all') $conditions[] = "region='" . $conn->real_escape_string($region) . "'";
  if (count($conditions) > 0) $sql .= " WHERE " . implode(" AND ", $conditions);
  $sql .= " ORDER BY created_at DESC";

  $result = $conn->query($sql);
  $data = [];
  while ($row = $result->fetch_assoc()) {
    $data[] = $row;
  }
  json_response($data);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = get_json_body();
  $name = trim($data['name'] ?? '');
  $type = $data['type'] ?? 'vm';
  $region = $data['region'] ?? 'east-us';
  $size = $data['size'] ?? 'small';
  $user_id = current_user_id();

  if ($name === '') {
    json_response(['error' => 'Name required'], 422);
  }

  $stmt = $conn->prepare("INSERT INTO resources (user_id, name, type, region, status, size) VALUES (?, ?, ?, ?, 'provisioning', ?)");
  $stmt->bind_param("issss", $user_id, $name, $type, $region, $size);
  $stmt->execute();
  $resource_id = $stmt->insert_id;
  $stmt->close();

  $log = $conn->prepare("INSERT INTO activity_log (user_id, action, resource_id) VALUES (?, 'create', ?)");
  $log->bind_param("ii", $user_id, $resource_id);
  $log->execute();
  $log->close();

  json_response(['id' => $resource_id]);
}

json_response(['error' => 'Method not allowed'], 405);
?>
