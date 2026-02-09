<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

if (is_admin()) {
  $sql = "SELECT a.id, a.action, a.timestamp, r.name AS resource_name, u.email AS user_email FROM activity_log a JOIN resources r ON a.resource_id=r.id JOIN users u ON a.user_id=u.id ORDER BY a.timestamp DESC LIMIT 50";
  $result = $conn->query($sql);
} else {
  $user_id = current_user_id();
  $stmt = $conn->prepare("SELECT a.id, a.action, a.timestamp, r.name AS resource_name, u.email AS user_email FROM activity_log a JOIN resources r ON a.resource_id=r.id JOIN users u ON a.user_id=u.id WHERE a.user_id=? ORDER BY a.timestamp DESC LIMIT 50");
  $stmt->bind_param("i", $user_id);
  $stmt->execute();
  $result = $stmt->get_result();
}

$data = [];
while ($row = $result->fetch_assoc()) {
  $data[] = $row;
}

json_response($data);
?>
