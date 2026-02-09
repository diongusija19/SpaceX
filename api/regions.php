<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

$where = '';
if (!is_admin()) {
  $where = ' WHERE user_id=' . current_user_id();
}

$sql = "SELECT region,
  COUNT(*) AS total,
  SUM(status='running') AS running,
  SUM(status='stopped') AS stopped,
  SUM(status='provisioning') AS provisioning
  FROM resources{$where}
  GROUP BY region
  ORDER BY region";

$result = $conn->query($sql);
$data = [];
while ($row = $result->fetch_assoc()) {
  $row['total'] = (int)$row['total'];
  $row['running'] = (int)$row['running'];
  $row['stopped'] = (int)$row['stopped'];
  $row['provisioning'] = (int)$row['provisioning'];
  $data[] = $row;
}

json_response($data);
?>
