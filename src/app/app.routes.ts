import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { NetworkComponent } from './pages/network/network.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { MessagingComponent } from './pages/messaging/messaging.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' }, // Trang chủ
      { path: 'network', component: NetworkComponent },           // Mạng lưới
      { path: 'jobs', component: JobsComponent },                 // Việc làm
      { path: 'messaging', component: MessagingComponent },       // Nhắn tin
      { path: 'notifications', component: NotificationsComponent }, // Thông báo
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
