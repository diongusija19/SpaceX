# SpaceX — Cloud Resource Management Web App Prototype

SpaceX is a web-based cloud management dashboard prototype inspired by platforms like Microsoft Azure. The app simulates the creation, management, and monitoring of cloud resources through a structured portal UI. It does not provide real cloud infrastructure; instead, it demonstrates how cloud services can be organized, controlled, and visualized in an enterprise-style web app.

## Project Goal
Build a working web app prototype that allows users to manage simulated cloud resources (e.g., Virtual Machines, Databases, Storage) using a PHP + SQL backend, then implement the UI and features using Angular (with an optional React version later).

## Core Features (MVP)
- User authentication (login/logout)
- Dashboard overview of resources
- Create simulated cloud resources:
  - Virtual Machines
  - Databases
  - Storage services
- Resource list view with filters and status indicators
- Resource detail pages (configuration + status)
- Simulated actions: start / stop / delete resources
- Region-based organization
- Activity log of recent actions
- Responsive dashboard UI

## Tech Stack (Planned)
- Backend: PHP + SQL (MySQL)
- Frontend: Angular (later optional React version)
- Version Control: Git + GitHub
- Design: Adobe XD
- Environment: XAMPP (or MAMP) + Node.js + Angular CLI

## Milestones
1. **Backend foundation (PHP/SQL)**: Auth + database schema + API endpoints
2. **Angular UI**: Dashboard + resource CRUD views
3. **Polish & growth feature**: filters, logs, charts, responsive improvements
4. **Final demo & code review**: walkthrough + documentation

## How to Run (Will be updated)
### Prerequisites
- XAMPP (Apache + MySQL)
- Node.js (LTS) + npm

### 1) Database Setup (phpMyAdmin)
1. Open phpMyAdmin and create the database:
   - `spacex_cloud`
2. Run these SQL files (in order):
   - `seed.sql` (users + sample data)
   - `boards.sql` (boards table)
   - `pipelines.sql` (pipelines tables)

### 2) Backend (PHP API)
1. Copy the `api/` folder into:
   - `/Applications/XAMPP/xamppfiles/htdocs/SpaceX/api/`
2. Copy `.htaccess` into:
   - `/Applications/XAMPP/xamppfiles/htdocs/SpaceX/.htaccess`
3. Ensure Apache is running in XAMPP.

### 3) Frontend (Angular)
1. Install dependencies:
   - `cd spacex-ui`
   - `npm install`
2. Build the app:
   - `npm run build`
3. Copy the build output:
   - `cp -R /Applications/XAMPP/xamppfiles/htdocs/SpaceX/www/browser/. /Applications/XAMPP/xamppfiles/htdocs/SpaceX/`
4. Open:
   - `http://localhost/SpaceX/`

### Demo Credentials
- Admin: `admin@spacex.com` / `admin123`
- User: `user@spacex.com` / `user123`

### Notes
- The app is a SPA; routing is handled by `.htaccess`.
- If you see old assets, hard refresh: `Cmd+Shift+R`.

## Author
Joni
