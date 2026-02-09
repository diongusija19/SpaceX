USE spacex_cloud;

-- Users
INSERT INTO users (email, password, role) VALUES
('admin@spacex.com', 'admin123', 'admin'),
('user@spacex.com', 'user123', 'user')
ON DUPLICATE KEY UPDATE password=VALUES(password), role=VALUES(role);

SET @admin_id = (SELECT id FROM users WHERE email='admin@spacex.com' LIMIT 1);
SET @user_id = (SELECT id FROM users WHERE email='user@spacex.com' LIMIT 1);

-- Clear existing demo resources (cascades to usage/alerts/activity)
DELETE FROM resources WHERE name IN (
  'Mission-VM-01','Telemetry-DB','Storage-Logs','Dev-VM-02','Analytics-DB','Backup-Storage'
);

-- Resources
INSERT INTO resources (user_id, name, type, region, status, size) VALUES
(@admin_id, 'Mission-VM-01', 'vm', 'east-us', 'running', 'medium'),
(@admin_id, 'Telemetry-DB', 'db', 'west-eu', 'running', 'small'),
(@user_id, 'Storage-Logs', 'storage', 'east-us', 'stopped', 'large'),
(@user_id, 'Dev-VM-02', 'vm', 'central-us', 'provisioning', 'small'),
(@admin_id, 'Analytics-DB', 'db', 'east-us', 'running', 'medium'),
(@user_id, 'Backup-Storage', 'storage', 'west-eu', 'running', 'small');

-- Usage (month format YYYY-MM)
INSERT INTO resource_usage (resource_id, hours_used, cost, month) VALUES
((SELECT id FROM resources WHERE name='Mission-VM-01' LIMIT 1), 120.5, 48.20, '2026-02'),
((SELECT id FROM resources WHERE name='Telemetry-DB' LIMIT 1), 85.0, 32.00, '2026-02'),
((SELECT id FROM resources WHERE name='Storage-Logs' LIMIT 1), 40.0, 12.50, '2026-02'),
((SELECT id FROM resources WHERE name='Dev-VM-02' LIMIT 1), 10.0, 4.00, '2026-02'),
((SELECT id FROM resources WHERE name='Analytics-DB' LIMIT 1), 90.0, 36.00, '2026-02'),
((SELECT id FROM resources WHERE name='Backup-Storage' LIMIT 1), 55.0, 18.00, '2026-02');

-- Activity Log
INSERT INTO activity_log (user_id, action, resource_id) VALUES
(@admin_id, 'create', (SELECT id FROM resources WHERE name='Mission-VM-01' LIMIT 1)),
(@admin_id, 'create', (SELECT id FROM resources WHERE name='Telemetry-DB' LIMIT 1)),
(@user_id, 'create', (SELECT id FROM resources WHERE name='Storage-Logs' LIMIT 1)),
(@user_id, 'create', (SELECT id FROM resources WHERE name='Dev-VM-02' LIMIT 1)),
(@admin_id, 'create', (SELECT id FROM resources WHERE name='Analytics-DB' LIMIT 1)),
(@user_id, 'create', (SELECT id FROM resources WHERE name='Backup-Storage' LIMIT 1)),
(@user_id, 'start', (SELECT id FROM resources WHERE name='Backup-Storage' LIMIT 1)),
(@user_id, 'stop', (SELECT id FROM resources WHERE name='Storage-Logs' LIMIT 1));

-- Alerts
INSERT INTO alerts (resource_id, severity, message, resolved) VALUES
((SELECT id FROM resources WHERE name='Mission-VM-01' LIMIT 1), 'medium', 'CPU usage above 80% for 10 minutes', 0),
((SELECT id FROM resources WHERE name='Telemetry-DB' LIMIT 1), 'low', 'Database storage at 70%', 1),
((SELECT id FROM resources WHERE name='Storage-Logs' LIMIT 1), 'high', 'Storage I/O errors detected', 0),
((SELECT id FROM resources WHERE name='Analytics-DB' LIMIT 1), 'medium', 'Query latency spikes detected', 0);
