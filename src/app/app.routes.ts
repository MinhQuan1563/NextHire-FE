import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { NetworkComponent } from './pages/network/network.component';
import { ConnectionsComponent } from './pages/network/connections/connections.component';
import { FollowingComponent } from './pages/network/following/following.component';
import { CompaniesComponent } from './pages/network/companies/companies.component';
import { InvitationsComponent } from './pages/network/invitations/invitations.component';
import { JobsComponent } from './pages/jobs/jobs.component';
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
import { AuthGuard } from './guards/auth.guard';
import { gameAccessGuard } from './guards/game-access.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'network', component: NetworkComponent },
      { path: 'network/connections', component: ConnectionsComponent },
      { 
        path: 'cv-template',
        children: [
          { 
            path: '', 
            loadComponent: () => import('./pages/cv-builder/template-list/template-list.component')
              .then(m => m.TemplateListComponent)
          },
          { 
            path: 'editor/:templateCode', 
            loadComponent: () => import('./pages/cv-builder/cv-editor/cv-editor.component')
              .then(m => m.CvEditorComponent)
          },
          { 
            path: 'editor', 
            loadComponent: () => import('./pages/cv-builder/cv-editor/cv-editor.component')
              .then(m => m.CvEditorComponent)
          },
         
        ]
      },
      { path: 'network/following', component: FollowingComponent },     // Theo dõi
      { path: 'network/companies', component: CompaniesComponent },     // Công ty
      { path: 'network/invitations', component: InvitationsComponent }, // Lời mời
      { path: 'jobs', component: JobsComponent },                 // Việc làm
      { path: 'messaging', component: MessagingComponent },       // Nhắn tin
      { path: 'notifications', component: NotificationsComponent }, // Thông báo
      {
        path: 'profile',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./pages/user-profile/my-profile/my-profile.component')
              .then(m => m.MyProfileComponent)
          },
          {
            path: 'edit',
            loadComponent: () => import('./pages/user-profile/edit-profile/edit-profile.component')
              .then(m => m.EditProfileComponent)
          },
          {
            path: 'cvs',
            loadComponent: () => import('./pages/user-profile/user-cv/user-cv.component')
              .then(m => m.UserCvComponent)
          },
          {
            path: ':userCode',
            loadComponent: () => import('./pages/user-profile/other-user-profile/other-user-profile.component')
              .then(m => m.OtherUserProfileComponent)
          }
        ]
      },
      { path: 'games', component: GamesComponent },               // Games list
      { path: 'games/2048', component: Game2048Component, canActivate: [gameAccessGuard] },       // 2048 game
      { path: 'games/tango', component: TangoComponent, canActivate: [gameAccessGuard] },         // Tango game
      { path: 'games/queens', component: QueensComponent, canActivate: [gameAccessGuard] },       // Queens game
      // ... Các route khác sử dụng layout này
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.adminRoutes)
  }
];
