import { Routes } from '@angular/router';
import { adminGuard } from '../../guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/admin-overview.component').then(m => m.AdminOverviewComponent),
        data: { breadcrumb: 'Overview' }
      },
      {
        path: 'users',
        loadComponent: () => import('./users/manage-users.component').then(m => m.ManageUsersComponent),
        data: { breadcrumb: 'Manage Users' }
      },
      {
        path: 'companies',
        loadComponent: () => import('./companies/manage-companies.component').then(m => m.ManageCompaniesComponent),
        data: { breadcrumb: 'Manage Companies' }
      },
      {
        path: 'cv-templates',
        loadComponent: () => import('./cv-templates/manage-cv-templates.component').then(m => m.ManageCvTemplatesComponent),
        data: { breadcrumb: 'Manage CV Templates' }
      },
      {
        path: 'games',
        loadComponent: () => import('./games/manage-games.component').then(m => m.ManageGamesComponent),
        data: { breadcrumb: 'Manage Games' }
      },
      {
        path: 'error-logs',
        loadComponent: () => import('./error-logs/error-logs-viewer.component').then(m => m.ErrorLogsViewerComponent),
        data: { breadcrumb: 'Error Logs' }
      }
    ]
  }
];
