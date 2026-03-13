# SpaceX DevOps Cloud

SpaceX DevOps Cloud is an Azure-inspired capstone project built for triOS College. It simulates a cloud management and DevOps platform where users can manage virtual resources, view dashboards, and interact with workflow modules such as boards, pipelines, and repos.

The project is still in active development. It is designed as a working prototype that demonstrates full-stack development with Angular, PHP, and MySQL.

## Features

- User authentication with admin and user roles
- Dashboard with resource metrics and charts
- Simulated cloud resources: VM, Database, Storage
- Resource creation, filtering, status tracking, and detail pages
- Resource actions: start, stop, delete
- Activity log and region views
- Boards module with task management flow
- Pipelines and repos modules for simulated DevOps workflows
- Responsive UI for desktop and mobile

## Tech Stack

- Frontend: Angular
- Backend: PHP
- Database: MySQL
- Local environment: XAMPP
- Version control: GitHub

## Project Structure

- `spacex-ui/` - Angular frontend
- `api/` - PHP backend endpoints
- `seed.sql`, `boards.sql`, `notifications.sql`, `pipelines.sql`, `repos.sql`, `teams.sql` - database scripts
- `.htaccess` - SPA routing support for Apache
- `DEPLOY.md` - deployment notes

## Local Setup

### 1. Database

Create a MySQL database named `spacex_cloud`, then import these files in order:

1. `seed.sql`
2. `boards.sql`
3. `notifications.sql`
4. `pipelines.sql`
5. `repos.sql`
6. `teams.sql`

### 2. Frontend

```bash
cd spacex-ui
npm install
npm run build -- --base-href /SpaceX/
```

### 3. XAMPP

Place the project under your XAMPP web root so the app runs at:

`http://localhost/SpaceX/`

Make sure:

- Apache is running
- MySQL is running
- the `api/` folder is available under the project root
- the Angular build output is copied into the live `SpaceX` folder

## Demo Accounts

- Admin: `admin@spacex.com` / `admin123`
- User: `user@spacex.com` / `user123`

## Status

Current state:

- functional prototype
- presentation-ready
- still being refined and expanded

Planned improvements:

- stronger production security
- deeper pipeline/repo workflows
- public deployment with domain hosting

## Author

Dion
