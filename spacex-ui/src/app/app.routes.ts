import { Routes } from '@angular/router';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';
import { ResourcesPage } from './pages/resources.page';
import { ResourceDetailPage } from './pages/resource-detail.page';
import { ActivityPage } from './pages/activity.page';
import { AdminPage } from './pages/admin.page';
import { RegionsPage } from './pages/regions.page';
import { BoardsPage } from './pages/boards.page';
import { PipelinesPage } from './pages/pipelines.page';
import { PipelineDetailPage } from './pages/pipeline-detail.page';
import { ReposPage } from './pages/repos.page';
import { RepoDetailPage } from './pages/repo-detail.page';
import { ShellLayout } from './layout/shell.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: '',
    component: ShellLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardPage },
      { path: 'resources', component: ResourcesPage },
      { path: 'boards', component: BoardsPage },
      { path: 'pipelines', component: PipelinesPage },
      { path: 'pipelines/:id', component: PipelineDetailPage },
      { path: 'repos', component: ReposPage },
      { path: 'repos/:id', component: RepoDetailPage },
      { path: 'resources/:id', component: ResourceDetailPage },
      { path: 'activity', component: ActivityPage },
      { path: 'regions', component: RegionsPage },
      { path: 'admin', component: AdminPage, canActivate: [adminGuard] },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
