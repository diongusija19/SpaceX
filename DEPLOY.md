# SpaceX DevOps Deployment Guide

## What is ready
- Frontend is production-built and path-agnostic (works on root domain or subfolder).
- API endpoints use dynamic base path.
- Database config supports environment variables in `api/db.php`.

## Deploy package (already generated)
- Folder: `/Users/diongusija/Documents/New project/deploy/spacex-online-20260306-163018`
- Zip: `/Users/diongusija/Documents/New project/deploy/spacex-online-20260306-163018.zip`

## 1) Create hosting + database
- Use any PHP + MySQL host (Hostinger/cPanel/InfinityFree/000webhost/Railway PHP container).
- Create a MySQL database, user, and password.

## 2) Upload files
- Upload everything from the deploy folder (or extract the zip) into your public web root (`public_html` or `htdocs`).
- Keep this structure:
  - `/index.html`
  - `/api/*.php`
  - `/.htaccess`

## 3) Import SQL (in this order)
1. `seed.sql`
2. `boards.sql`
3. `notifications.sql`
4. `pipelines.sql`
5. `repos.sql`
6. `teams.sql`

## 4) Set DB credentials
Set environment variables on host (recommended):
- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`

If your host does not support env vars, edit `api/db.php` with your production DB values.

## 5) Verify
- Open your domain.
- Login with your seeded account.
- Check these endpoints quickly:
  - `/api/me.php`
  - `/api/resources.php`

## Rebuild package later
```bash
cd "/Users/diongusija/Documents/New project/spacex-ui"
npm install
npm run build
```
Then copy `/Users/diongusija/Documents/New project/www/browser/*` plus `/Users/diongusija/Documents/New project/api` and `/Users/diongusija/Documents/New project/.htaccess` to hosting.
