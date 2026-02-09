USE spacex_cloud;

ALTER TABLE users
  ADD COLUMN team VARCHAR(60) NOT NULL DEFAULT 'alpha' AFTER role;

ALTER TABLE board_items
  ADD COLUMN team VARCHAR(60) NOT NULL DEFAULT 'alpha' AFTER user_id;

UPDATE users SET team='alpha' WHERE team='';
UPDATE board_items SET team='alpha' WHERE team='';
