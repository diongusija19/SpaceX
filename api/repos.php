<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

function repo_accessible($conn, $repo_id) {
  if (is_admin()) return true;
  $stmt = $conn->prepare("SELECT id FROM repos WHERE id=? AND user_id=?");
  $uid = current_user_id();
  $stmt->bind_param("ii", $repo_id, $uid);
  $stmt->execute();
  $ok = $stmt->get_result()->fetch_assoc();
  $stmt->close();
  return !!$ok;
}

function ensure_branch_exists($conn, $repo_id, $branch, $created_by) {
  $stmt = $conn->prepare("INSERT IGNORE INTO repo_branches (repo_id, name, created_by) VALUES (?, ?, ?)");
  $stmt->bind_param("iss", $repo_id, $branch, $created_by);
  $stmt->execute();
  $stmt->close();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  $where = '';
  if (!is_admin()) {
    $where = ' WHERE r.user_id=' . current_user_id();
  }

  if ($id > 0) {
    if (!repo_accessible($conn, $id)) {
      json_response(['error' => 'Not found'], 404);
    }

    $stmt = $conn->prepare("SELECT r.id, r.name, r.default_branch, r.created_at FROM repos r WHERE r.id=?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $repo = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$repo) json_response(['error' => 'Not found'], 404);
    ensure_branch_exists($conn, $id, $repo['default_branch'], $_SESSION['user_email'] ?? 'system');

    $commits = $conn->query("SELECT id, branch_name, message, author, sha, created_at FROM repo_commits WHERE repo_id={$id} ORDER BY id DESC LIMIT 30");
    $commitsArr = [];
    while ($row = $commits->fetch_assoc()) $commitsArr[] = $row;

    $branches = $conn->query("SELECT id, name, created_by, created_at FROM repo_branches WHERE repo_id={$id} ORDER BY name ASC");
    $branchesArr = [];
    while ($row = $branches->fetch_assoc()) $branchesArr[] = $row;

    $prs = $conn->query("SELECT id, source_branch, target_branch, title, status, created_by, created_at FROM pull_requests WHERE repo_id={$id} ORDER BY id DESC LIMIT 30");
    $prsArr = [];
    while ($row = $prs->fetch_assoc()) $prsArr[] = $row;

    json_response([
      'repo' => $repo,
      'commits' => $commitsArr,
      'branches' => $branchesArr,
      'pull_requests' => $prsArr
    ]);
  }

  $sql = "SELECT r.id, r.name, r.default_branch, r.created_at,
    c.message AS last_message, c.author AS last_author, c.sha AS last_sha, c.created_at AS last_commit
    FROM repos r
    LEFT JOIN repo_commits c ON c.id = (
      SELECT rc.id FROM repo_commits rc WHERE rc.repo_id = r.id ORDER BY rc.id DESC LIMIT 1
    )" . $where . " ORDER BY r.created_at DESC";

  $result = $conn->query($sql);
  $data = [];
  while ($row = $result->fetch_assoc()) $data[] = $row;

  json_response($data);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = get_json_body();
  $action = $data['action'] ?? '';

  if ($action === 'create') {
    $name = trim($data['name'] ?? '');
    $branch = trim($data['default_branch'] ?? 'main');
    if ($name === '') json_response(['error' => 'Invalid request'], 400);

    $stmt = $conn->prepare("INSERT INTO repos (user_id, name, default_branch) VALUES (?, ?, ?)");
    $uid = current_user_id();
    $stmt->bind_param("iss", $uid, $name, $branch);
    $stmt->execute();
    $id = (int)$stmt->insert_id;
    $stmt->close();

    $author = $_SESSION['user_email'] ?? 'user';
    ensure_branch_exists($conn, $id, $branch, $author);

    create_notification($conn, $uid, "Created repo: {$name}");
    json_response(['id' => $id]);
  }

  if ($action === 'create_branch') {
    $repo_id = (int)($data['repo_id'] ?? 0);
    $branch = trim($data['name'] ?? '');
    if ($repo_id <= 0 || $branch === '') json_response(['error' => 'Invalid request'], 400);
    if (!repo_accessible($conn, $repo_id)) json_response(['error' => 'Forbidden'], 403);

    $author = $_SESSION['user_email'] ?? 'user';
    ensure_branch_exists($conn, $repo_id, $branch, $author);

    create_notification($conn, current_user_id(), "Created branch {$branch} on repo #{$repo_id}");
    json_response(['ok' => true]);
  }

  if ($action === 'commit') {
    $repo_id = (int)($data['repo_id'] ?? 0);
    $branch = trim($data['branch_name'] ?? 'main');
    $message = trim($data['message'] ?? '');
    if ($repo_id <= 0 || $message === '') json_response(['error' => 'Invalid request'], 400);
    if (!repo_accessible($conn, $repo_id)) json_response(['error' => 'Forbidden'], 403);

    $author = $_SESSION['user_email'] ?? 'user';
    ensure_branch_exists($conn, $repo_id, $branch, $author);

    $sha = substr(md5((string)microtime(true)), 0, 7);
    $stmt = $conn->prepare("INSERT INTO repo_commits (repo_id, branch_name, message, author, sha) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issss", $repo_id, $branch, $message, $author, $sha);
    $stmt->execute();
    $stmt->close();

    create_notification($conn, current_user_id(), "New commit on {$branch} in repo #{$repo_id}");
    json_response(['ok' => true]);
  }

  if ($action === 'create_pr') {
    $repo_id = (int)($data['repo_id'] ?? 0);
    $source = trim($data['source_branch'] ?? '');
    $target = trim($data['target_branch'] ?? '');
    $title = trim($data['title'] ?? '');
    if ($repo_id <= 0 || $source === '' || $target === '' || $title === '') json_response(['error' => 'Invalid request'], 400);
    if (!repo_accessible($conn, $repo_id)) json_response(['error' => 'Forbidden'], 403);

    $author = $_SESSION['user_email'] ?? 'user';
    ensure_branch_exists($conn, $repo_id, $source, $author);
    ensure_branch_exists($conn, $repo_id, $target, $author);

    $stmt = $conn->prepare("INSERT INTO pull_requests (repo_id, source_branch, target_branch, title, status, created_by) VALUES (?, ?, ?, ?, 'open', ?)");
    $stmt->bind_param("issss", $repo_id, $source, $target, $title, $author);
    $stmt->execute();
    $stmt->close();

    create_notification($conn, current_user_id(), "Opened PR: {$source} -> {$target}");
    json_response(['ok' => true]);
  }

  if ($action === 'pr_status') {
    $repo_id = (int)($data['repo_id'] ?? 0);
    $pr_id = (int)($data['pr_id'] ?? 0);
    $status = trim($data['status'] ?? '');
    if ($repo_id <= 0 || $pr_id <= 0 || !in_array($status, ['merged','closed'], true)) {
      json_response(['error' => 'Invalid request'], 400);
    }
    if (!repo_accessible($conn, $repo_id)) json_response(['error' => 'Forbidden'], 403);

    $stmt = $conn->prepare("UPDATE pull_requests SET status=? WHERE id=? AND repo_id=?");
    $stmt->bind_param("sii", $status, $pr_id, $repo_id);
    $stmt->execute();
    $stmt->close();

    create_notification($conn, current_user_id(), ucfirst($status) . " PR #{$pr_id}");
    json_response(['ok' => true]);
  }

  json_response(['error' => 'Invalid request'], 400);
}

json_response(['error' => 'Method not allowed'], 405);
?>
