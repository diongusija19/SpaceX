<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
  json_response(['error' => 'Invalid id'], 400);
}

if (is_admin()) {
  $stmt = $conn->prepare("SELECT id, name, type, region, status, size, created_at FROM resources WHERE id=?");
  $stmt->bind_param("i", $id);
} else {
  $user_id = current_user_id();
  $stmt = $conn->prepare("SELECT id, name, type, region, status, size, created_at FROM resources WHERE id=? AND user_id=?");
  $stmt->bind_param("ii", $id, $user_id);
}

$stmt->execute();
$resource = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$resource) {
  json_response(['error' => 'Not found'], 404);
}

$usage = $conn->query("SELECT COALESCE(SUM(hours_used),0) AS hours, COALESCE(SUM(cost),0) AS cost FROM resource_usage WHERE resource_id={$id}")->fetch_assoc();
$alerts = $conn->query("SELECT id, severity, message, created_at, resolved FROM alerts WHERE resource_id={$id} ORDER BY created_at DESC");
$alertsArr = [];
while ($row = $alerts->fetch_assoc()) {
  $alertsArr[] = $row;
}

json_response([
  'resource' => $resource,
  'usage' => $usage,
  'alerts' => $alertsArr
]);
?>
