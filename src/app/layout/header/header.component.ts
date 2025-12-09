import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/services/auth/auth.service';

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
    TieredMenuModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  userMenuItems: MenuItem[];
  currentUser$ = this.authService.currentUser$;
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.userMenuItems = [
      {
        label: 'Xem hồ sơ',
        icon: 'pi pi-fw pi-user',
        command: () => this.navigateToProfile(),
      },
      {
        label: 'Cài đặt',
        icon: 'pi pi-fw pi-cog',
      },
      { separator: true },
      {
        label: 'Đăng xuất',
        icon: 'pi pi-fw pi-sign-out',
        command: () => this.logout(),
      },
    ];
  }

  navigateToProfile() {
    console.log('Navigate to profile');
    // router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      },
    });
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    console.log('Searching for:', query);
  }
}
