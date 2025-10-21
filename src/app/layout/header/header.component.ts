import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    AvatarModule,
    MenuModule,
    TieredMenuModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isLoggedIn = true;
  username = 'Người Dùng';
  userInitial = 'N';
  userMenuItems: MenuItem[];

  constructor() {
      this.userMenuItems = [
          {
              label: 'Xem hồ sơ',
              icon: 'pi pi-fw pi-user',
              command: () => this.navigateToProfile()
          },
          {
              label: 'Cài đặt',
              icon: 'pi pi-fw pi-cog',
          },
          { separator: true },
          {
              label: 'Đăng xuất',
              icon: 'pi pi-fw pi-sign-out',
              command: () => this.logout()
          }
      ];
  }

  navigateToProfile() {
    console.log('Navigate to profile');
    // router.navigate(['/profile']);
  }

  logout() {
    console.log('Logout clicked');
    this.isLoggedIn = false;
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    console.log('Searching for:', query);
  }
}
