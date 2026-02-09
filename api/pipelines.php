<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  $where = '';
  if (!is_admin()) {
    $where = ' WHERE p.user_id=' . current_user_id();
  }

  if ($id > 0) {
    if (!is_admin()) {
      $stmt = $conn->prepare("SELECT p.id, p.name, p.repo, p.default_branch, p.created_at FROM pipelines p WHERE p.id=? AND p.user_id=?");
      $uid = current_user_id();
      $stmt->bind_param("ii", $id, $uid);
    } else {
      $stmt = $conn->prepare("SELECT p.id, p.name, p.repo, p.default_branch, p.created_at FROM pipelines p WHERE p.id=?");
      $stmt->bind_param("i", $id);
    }
    $stmt->execute();
    $pipeline = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$pipeline) {
      json_response(['error' => 'Not found'], 404);
    }

    $runs = $conn->query("SELECT id, status, trigger_type, commit_sha, initiated_by, started_at, finished_at, duration_seconds FROM pipeline_runs WHERE pipeline_id={$id} ORDER BY id DESC LIMIT 20");
    $runsArr = [];
    while ($row = $runs->fetch_assoc()) {
      $runsArr[] = $row;
    }

    json_response([
      'pipeline' => $pipeline,
      'runs' => $runsArr
    ]);
  }

  $sql = "SELECT p.id, p.name, p.repo, p.default_branch, p.created_at,
    r.status AS last_status, r.started_at AS last_started, r.finished_at AS last_finished
    FROM pipelines p
    LEFT JOIN pipeline_runs r ON r.id = (
      SELECT pr.id FROM pipeline_runs pr WHERE pr.pipeline_id = p.id ORDER BY pr.id DESC LIMIT 1
    )" . $where . " ORDER BY p.created_at DESC";

  $result = $conn->query($sql);
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
    $name = trim($data['name'] ?? '');
    $repo = trim($data['repo'] ?? '');
    $branch = trim($data['default_branch'] ?? 'main');
    if ($name === '' || $repo === '') {
      json_response(['error' => 'Invalid request'], 400);
    }

    $stmt = $conn->prepare("INSERT INTO pipelines (user_id, name, repo, default_branch) VALUES (?, ?, ?, ?)");
    $uid = current_user_id();
    $stmt->bind_param("isss", $uid, $name, $repo, $branch);
    $stmt->execute();
    $id = $stmt->insert_id;
    $stmt->close();

    json_response(['id' => $id]);
  }

  if ($action === 'run') {
    $pipeline_id = (int)($data['id'] ?? 0);
    if ($pipeline_id <= 0) json_response(['error' => 'Invalid request'], 400);

    if (!is_admin()) {
      $stmt = $conn->prepare("SELECT id FROM pipelines WHERE id=? AND user_id=?");
      $uid = current_user_id();
      $stmt->bind_param("ii", $pipeline_id, $uid);
      $stmt->execute();
      $ok = $stmt->get_result()->fetch_assoc();
      $stmt->close();
      if (!$ok) json_response(['error' => 'Forbidden'], 403);
    }

    $email = $_SESSION['user_email'] ?? 'user';
    $sha = substr(md5((string)microtime(true)), 0, 7);

    $stmt = $conn->prepare("INSERT INTO pipeline_runs (pipeline_id, status, trigger_type, commit_sha, initiated_by, started_at) VALUES (?, 'running', 'manual', ?, ?, NOW())");
    $stmt->bind_param("iss", $pipeline_id, $sha, $email);
    $stmt->execute();
    $run_id = $stmt->insert_id;
    $stmt->close();

    $stmt = $conn->prepare("UPDATE pipeline_runs SET status='succeeded', finished_at=DATE_ADD(started_at, INTERVAL 90 SECOND), duration_seconds=90 WHERE id=?");
    $stmt->bind_param("i", $run_id);
    $stmt->execute();
    $stmt->close();

    json_response(['run_id' => $run_id]);
  }

  json_response(['error' => 'Invalid request'], 400);
}

json_response(['error' => 'Method not allowed'], 405);
?>
