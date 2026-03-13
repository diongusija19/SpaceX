<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

function pipeline_accessible($conn, $id) {
  if (is_admin()) return true;
  $stmt = $conn->prepare("SELECT id FROM pipelines WHERE id=? AND user_id=?");
  $uid = current_user_id();
  $stmt->bind_param("ii", $id, $uid);
  $stmt->execute();
  $ok = $stmt->get_result()->fetch_assoc();
  $stmt->close();
  return !!$ok;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  $where = '';
  if (!is_admin()) {
    $where = ' WHERE p.user_id=' . current_user_id();
  }

  if ($id > 0) {
    if (!pipeline_accessible($conn, $id)) {
      json_response(['error' => 'Not found'], 404);
    }

    $stmt = $conn->prepare("SELECT p.id, p.name, p.repo, p.default_branch, p.created_at FROM pipelines p WHERE p.id=?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $pipeline = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$pipeline) {
      json_response(['error' => 'Not found'], 404);
    }

    $runs = $conn->query("SELECT id, status, trigger_type, commit_sha, initiated_by, started_at, finished_at, duration_seconds, stages_json, log_output FROM pipeline_runs WHERE pipeline_id={$id} ORDER BY id DESC LIMIT 20");
    $runsArr = [];
    while ($row = $runs->fetch_assoc()) {
      $row['stages'] = $row['stages_json'] ? json_decode($row['stages_json'], true) : [];
      if (!is_array($row['stages'])) $row['stages'] = [];
      unset($row['stages_json']);
      $row['log_output'] = $row['log_output'] ?? '';
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

    create_notification($conn, $uid, "Created pipeline: {$name}");
    json_response(['id' => $id]);
  }

  if ($action === 'run') {
    $pipeline_id = (int)($data['id'] ?? 0);
    $should_fail = !empty($data['should_fail']);
    if ($pipeline_id <= 0) json_response(['error' => 'Invalid request'], 400);
    if (!pipeline_accessible($conn, $pipeline_id)) json_response(['error' => 'Forbidden'], 403);

    $email = $_SESSION['user_email'] ?? 'user';
    $sha = substr(md5((string)microtime(true)), 0, 7);

    $stages = [
      ['name' => 'Build', 'status' => 'succeeded', 'duration_seconds' => 28],
      ['name' => 'Test', 'status' => $should_fail ? 'failed' : 'succeeded', 'duration_seconds' => 31],
      ['name' => 'Deploy', 'status' => $should_fail ? 'queued' : 'succeeded', 'duration_seconds' => $should_fail ? 0 : 24]
    ];

    $final_status = $should_fail ? 'failed' : 'succeeded';
    $duration = 0;
    foreach ($stages as $s) $duration += (int)$s['duration_seconds'];

    $logs = [];
    $logs[] = "[info] Starting pipeline run for #{$pipeline_id}";
    $logs[] = "[info] Commit {$sha}";
    $logs[] = "[build] Installing dependencies";
    $logs[] = "[build] Build complete";
    $logs[] = "[test] Running test suite";
    if ($should_fail) {
      $logs[] = "[test] ERROR: 1 test failed in auth.guard.spec.ts";
      $logs[] = "[deploy] Skipped because tests failed";
    } else {
      $logs[] = "[test] All tests passed";
      $logs[] = "[deploy] Deploying to production";
      $logs[] = "[deploy] Deployment finished";
    }
    $log_text = implode("\n", $logs);
    $stages_json = json_encode($stages);

    $stmt = $conn->prepare("INSERT INTO pipeline_runs (pipeline_id, status, trigger_type, commit_sha, initiated_by, started_at, finished_at, duration_seconds, stages_json, log_output) VALUES (?, ?, 'manual', ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? SECOND), ?, ?, ?)");
    $stmt->bind_param("isssiiss", $pipeline_id, $final_status, $sha, $email, $duration, $duration, $stages_json, $log_text);
    $stmt->execute();
    $run_id = $stmt->insert_id;
    $stmt->close();

    create_notification($conn, current_user_id(), "Ran pipeline #{$pipeline_id} ({$final_status})");
    json_response(['run_id' => $run_id]);
  }

  json_response(['error' => 'Invalid request'], 400);
}

json_response(['error' => 'Method not allowed'], 405);
?>
