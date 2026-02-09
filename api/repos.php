<?php
require __DIR__ . '/db.php';
require __DIR__ . '/util.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  $where = '';
  if (!is_admin()) {
    $where = ' WHERE r.user_id=' . current_user_id();
  }

  if ($id > 0) {
    if (!is_admin()) {
      $stmt = $conn->prepare("SELECT r.id, r.name, r.default_branch, r.created_at FROM repos r WHERE r.id=? AND r.user_id=?");
      $uid = current_user_id();
      $stmt->bind_param("ii", $id, $uid);
    } else {
      $stmt = $conn->prepare("SELECT r.id, r.name, r.default_branch, r.created_at FROM repos r WHERE r.id=?");
      $stmt->bind_param("i", $id);
    }
    $stmt->execute();
    $repo = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$repo) json_response(['error' => 'Not found'], 404);

    $commits = $conn->query("SELECT id, message, author, sha, created_at FROM repo_commits WHERE repo_id={$id} ORDER BY id DESC LIMIT 30");
    $arr = [];
    while ($row = $commits->fetch_assoc()) $arr[] = $row;

    json_response(['repo' => $repo, 'commits' => $arr]);
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
    $id = $stmt->insert_id;
    $stmt->close();

    create_notification($conn, $uid, "Created repo: {$name}");
    json_response(['id' => $id]);
  }

  if ($action === 'commit') {
    $repo_id = (int)($data['repo_id'] ?? 0);
    $message = trim($data['message'] ?? '');
    if ($repo_id <= 0 || $message === '') json_response(['error' => 'Invalid request'], 400);

    if (!is_admin()) {
      $stmt = $conn->prepare("SELECT id FROM repos WHERE id=? AND user_id=?");
      $uid = current_user_id();
      $stmt->bind_param("ii", $repo_id, $uid);
      $stmt->execute();
      $ok = $stmt->get_result()->fetch_assoc();
      $stmt->close();
      if (!$ok) json_response(['error' => 'Forbidden'], 403);
    }

    $sha = substr(md5((string)microtime(true)), 0, 7);
    $author = $_SESSION['user_email'] ?? 'user';
    $stmt = $conn->prepare("INSERT INTO repo_commits (repo_id, message, author, sha) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $repo_id, $message, $author, $sha);
    $stmt->execute();
    $stmt->close();

    create_notification($conn, current_user_id(), "New commit on repo #{$repo_id}");
    json_response(['ok' => true]);
  }

  json_response(['error' => 'Invalid request'], 400);
}

json_response(['error' => 'Method not allowed'], 405);
?>
