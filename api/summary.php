<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

$baseFilter = is_admin() ? '' : ('user_id=' . current_user_id());

function where_clause($base, $extra = '') {
  if ($base !== '' && $extra !== '') return " WHERE {$base} AND {$extra}";
  if ($base !== '') return " WHERE {$base}";
  if ($extra !== '') return " WHERE {$extra}";
  return '';
}

$total = $conn->query("SELECT COUNT(*) AS c FROM resources" . where_clause($baseFilter))->fetch_assoc()['c'] ?? 0;
$running = $conn->query("SELECT COUNT(*) AS c FROM resources" . where_clause($baseFilter, "status='running'"))->fetch_assoc()['c'] ?? 0;
$stopped = $conn->query("SELECT COUNT(*) AS c FROM resources" . where_clause($baseFilter, "status='stopped'"))->fetch_assoc()['c'] ?? 0;
$prov = $conn->query("SELECT COUNT(*) AS c FROM resources" . where_clause($baseFilter, "status='provisioning'"))->fetch_assoc()['c'] ?? 0;

$cost_sql = "SELECT COALESCE(SUM(ru.cost),0) AS c FROM resource_usage ru JOIN resources r ON ru.resource_id=r.id";
if (!is_admin()) {
  $cost_sql .= " WHERE r.user_id=" . current_user_id();
}
$cost = $conn->query($cost_sql)->fetch_assoc()['c'] ?? 0;

$type_vm = $conn->query("SELECT COUNT(*) AS c FROM resources" . where_clause($baseFilter, "type='vm'"))->fetch_assoc()['c'] ?? 0;
$type_storage = $conn->query("SELECT COUNT(*) AS c FROM resources" . where_clause($baseFilter, "type='storage'"))->fetch_assoc()['c'] ?? 0;
$type_db = $conn->query("SELECT COUNT(*) AS c FROM resources" . where_clause($baseFilter, "type='db'"))->fetch_assoc()['c'] ?? 0;

json_response([
  'total' => (int)$total,
  'running' => (int)$running,
  'stopped' => (int)$stopped,
  'provisioning' => (int)$prov,
  'cost' => (float)$cost,
  'types' => [
    'vm' => (int)$type_vm,
    'storage' => (int)$type_storage,
    'db' => (int)$type_db
  ]
]);
?>
