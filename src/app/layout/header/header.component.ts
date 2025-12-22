import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/services/auth/auth.service';
import { User } from '@app/models/auth/auth.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class HeaderComponent implements OnInit {
  userMenuItems: MenuItem[];
  currentUser : User | null = null
  private destroyRef = inject(DestroyRef);
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
  ngOnInit(): void {
    this.authService.currentUser$
    .pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: (user : User | null) => {
        console.log(user)
        this.currentUser = user;
      }
    })
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
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
  }
}
