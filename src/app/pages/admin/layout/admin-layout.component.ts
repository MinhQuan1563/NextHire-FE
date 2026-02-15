import { Component, signal, computed, effect, inject, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';
import { PLATFORM_ID } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { HeaderComponent } from '@app/layout/header/header.component';

interface AdminMenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenuModule,
    ButtonModule,
    BreadcrumbModule,
    HeaderComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AdminLayoutComponent {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  sidebarCollapsed = signal<boolean>(false);
  currentRoute = signal<string>('');
  isMobile = signal<boolean>(false);
  isTablet = signal<boolean>(false);

  sidebarClass = computed(() => 
    this.sidebarCollapsed() ? 'collapsed' : 'expanded'
  );

  showOverlay = computed(() => 
    (this.isTablet() || this.isMobile()) && !this.sidebarCollapsed()
  );

  menuItems: AdminMenuItem[] = [
    { label: 'Overview', icon: 'pi pi-home', route: '/admin' },
    { label: 'Manage Users', icon: 'pi pi-users', route: '/admin/users' },
    { label: 'Manage Companies', icon: 'pi pi-building', route: '/admin/companies' },
    { label: 'CV Templates', icon: 'pi pi-file', route: '/admin/cv-templates' },
    { label: 'Manage Games', icon: 'pi pi-box', route: '/admin/games' },
    { label: 'Error Logs', icon: 'pi pi-exclamation-triangle', route: '/admin/error-logs' }
  ];

  breadcrumbItems = signal<MenuItem[]>([]);
  breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/admin' };

  constructor() {
    this.loadSidebarState();
    this.setupRouteListener();
    this.setupSidebarPersistence();
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (!this.isBrowser) return;

    const width = window.innerWidth;
    this.isMobile.set(width < 768);
    this.isTablet.set(width >= 768 && width < 1024);

    if (width < 1024) {
      this.sidebarCollapsed.set(true);
    }
  }

  private loadSidebarState(): void {
    if (this.isBrowser) {
      const savedState = sessionStorage.getItem('adminSidebarCollapsed');
      if (savedState !== null) {
        this.sidebarCollapsed.set(savedState === 'true');
      }
    }
  }

  private setupRouteListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentRoute.set(this.router.url);
        this.updateBreadcrumbs();
      });
    
    this.currentRoute.set(this.router.url);
    this.updateBreadcrumbs();
  }

  private setupSidebarPersistence(): void {
    effect(() => {
      if (this.isBrowser) {
        sessionStorage.setItem('adminSidebarCollapsed', String(this.sidebarCollapsed()));
      }
    });
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url;
    const items: MenuItem[] = [];

    const menuItem = this.menuItems.find(item => item.route === url);
    if (menuItem && url !== '/admin') {
      items.push({
        label: menuItem.label,
        routerLink: menuItem.route,
        command: () => this.navigateTo(menuItem.route)
      });
    }

    this.breadcrumbItems.set(items);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute() === route;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    
    if (this.isMobile() || this.isTablet()) {
      this.sidebarCollapsed.set(true);
    }
  }

  closeSidebar(): void {
    if (this.isMobile() || this.isTablet()) {
      this.sidebarCollapsed.set(true);
    }
  }

  onOverlayClick(): void {
    this.closeSidebar();
  }
}
