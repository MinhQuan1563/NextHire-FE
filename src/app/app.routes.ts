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
import { AuthGuard } from './core/guards/auth.guard';

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
        path: 'cv-builder',
        children: [
          { 
            path: '', 
            loadComponent: () => import('./pages/cv-builder/template-list/template-list.component')
              .then(m => m.TemplateListComponent)
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
      { path: 'games', component: GamesComponent },               // Games list
      { path: 'games/2048', component: Game2048Component },       // 2048 game
      { path: 'games/tango', component: TangoComponent },         // Tango game
      { path: 'games/queens', component: QueensComponent },       // Queens game
      // ... Các route khác sử dụng layout này
    ]
  },
  // { path: 'login', component: LoginComponent },
  // { path: '**', component: NotFoundComponent },
  // {
  //   path: 'admin',
  //   component: AdminLayoutComponent, // Ví dụ layout khác cho trang admin
  //   children: [
  //     // ... admin routes
  //   ]
  // },
  // { path: 'login', component: LoginComponent }, // Trang login có thể không cần layout
  // { path: '**', component: NotFoundComponent } // Trang 404
];
