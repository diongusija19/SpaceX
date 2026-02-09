<?php
require __DIR__ . '/util.php';

session_destroy();
json_response(['ok' => true]);
?>
