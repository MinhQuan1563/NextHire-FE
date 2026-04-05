import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { NetworkComponent } from './pages/network/network.component';
import { ConnectionsComponent } from './pages/network/connections/connections.component';
import { FollowingComponent } from './pages/network/following/following.component';
import { CompaniesComponent } from './pages/network/companies/companies.component';
import { InvitationsComponent } from './pages/network/invitations/invitations.component';
import { MessagingComponent } from './pages/messaging/messaging.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { GamesComponent } from './pages/games/games.component';
import { Game2048Component } from './pages/games/2048/game2048.component';
import { TangoComponent } from './pages/games/tango/tango.component';
import { QueensComponent } from './pages/games/queens/queens.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';

import { authGuard } from './guards/auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { PERMISSIONS } from '@shared/constants/permissions.constant';
import { gameAccessGuard } from './guards/game-access.guard';

export const routes: Routes = [
  // ==========================================
  // PUBLIC ROUTES (AUTH)
  // ==========================================
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },

  // ==========================================
  // PROTECTED ROUTES (MAIN LAYOUT)
  // ==========================================
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      
      // -- NETWORK --
      {
        path: 'network',
        children: [
          { path: '', component: NetworkComponent, pathMatch: 'full' },
          { path: 'connections', component: ConnectionsComponent },
          { path: 'following', component: FollowingComponent },
          { path: 'companies', component: CompaniesComponent },
          { path: 'invitations', component: InvitationsComponent },
        ]
      },

      // -- CV TEMPLATE --
      { 
        path: 'cv-template',
        children: [
          { 
            path: '', 
            loadComponent: () => import('./pages/cv-builder/template-list/template-list.component').then(m => m.TemplateListComponent)
          },
          { 
            path: 'editor/:templateCode', 
            loadComponent: () => import('./pages/cv-builder/cv-editor/cv-editor.component').then(m => m.CvEditorComponent)
          },
          { 
            path: 'editor', 
            loadComponent: () => import('./pages/cv-builder/cv-editor/cv-editor.component').then(m => m.CvEditorComponent)
          },
        ]
      },

      // -- JOBS --
      { 
        path: 'jobs',
        loadComponent: () => import('./pages/jobs/jobs.component').then(m => m.JobsComponent),
        canActivate: [PermissionGuard],
        // data: { requiredPolicy: PERMISSIONS.Jobs.Default }
      },

      // -- MESSAGE & NOTIFICATION --
      { path: 'messaging', component: MessagingComponent },
      { path: 'notifications', component: NotificationsComponent },
      
      {
        path: 'saved-posts',
        loadComponent: () => import('./pages/saved-posts/saved-posts.component').then(m => m.SavedPostsComponent)
      },

      // -- PROFILE --
      {
        path: 'profile',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./pages/user-profile/my-profile/my-profile.component').then(m => m.MyProfileComponent)
          },
          {
            path: 'edit',
            loadComponent: () => import('./pages/user-profile/edit-profile/edit-profile.component').then(m => m.EditProfileComponent),
            canActivate: [PermissionGuard],
            // data: { requiredPolicy: PERMISSIONS.UserProfiles.Update } 
          },
          {
            path: 'cvs',
            loadComponent: () => import('./pages/user-profile/user-cv/user-cv.component').then(m => m.UserCvComponent),
            canActivate: [PermissionGuard],
            // data: { requiredPolicy: PERMISSIONS.UserCvs.Default }
          },
          {
            path: 'activity',
            loadComponent: () => import('./pages/user-profile/user-activity/user-activity.component').then(m => m.UserActivityComponent)
          },
          {
            path: ':userCode',
            loadComponent: () => import('./pages/user-profile/other-user-profile/other-user-profile.component').then(m => m.OtherUserProfileComponent)
          },
        ]
      },

      // -- GAMES --
      {
        path: 'games',
        children: [
          { path: '', component: GamesComponent, pathMatch: 'full' },
          { path: '2048', component: Game2048Component, canActivate: [gameAccessGuard] },
          { path: 'tango', component: TangoComponent, canActivate: [gameAccessGuard] },
          { path: 'queens', component: QueensComponent, canActivate: [gameAccessGuard] },
        ]
      }
    ]
  },

  // ==========================================
  // ADMIN ROUTES & ERROR PAGES
  // ==========================================
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./pages/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];