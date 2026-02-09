USE spacex_cloud;

CREATE TABLE IF NOT EXISTS pipelines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  repo VARCHAR(120) NOT NULL,
  default_branch VARCHAR(60) NOT NULL DEFAULT 'main',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pipeline_id INT NOT NULL,
  status ENUM('queued','running','succeeded','failed') NOT NULL DEFAULT 'queued',
  trigger_type ENUM('manual','commit','schedule') NOT NULL DEFAULT 'manual',
  commit_sha VARCHAR(12) NOT NULL DEFAULT '0000000',
  initiated_by VARCHAR(120) NOT NULL DEFAULT 'system',
  started_at TIMESTAMP NULL DEFAULT NULL,
  finished_at TIMESTAMP NULL DEFAULT NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  FOREIGN KEY (pipeline_id) REFERENCES pipelines(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
