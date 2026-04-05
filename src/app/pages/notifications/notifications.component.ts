import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InfoSidebarComponent } from '@shared/reusable-components/info-sidebar/info-sidebar.component';
import { NotificationDto } from '@app/models/notification/notification.model';
import { NotificationService } from '@app/services/notification/notification.service';
import { SignalrService } from '@app/services/signalr/signalr.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule, AvatarModule, MenuModule, ButtonModule,
    SelectButtonModule, FormsModule, DatePipe, InfoSidebarComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  filterOptions: any[] = [
    { label: 'All', value: 'all' },
    { label: 'Jobs', value: 'NEW_POST' },
    { label: 'Interactions', value: 'INTERACTION' }
  ];

  selectedFilter: string = 'all';
  notificationMenuItems: MenuItem[];
  selectedNotification: NotificationDto | null = null;

  // Data and pagination management variables
  allNotifications: NotificationDto[] = [];
  isLoading = false;
  isLoadingMore = false;
  hasMore = true;
  pageSize = 10; // Load 10 items each time scrolling

  private destroyRef = inject(DestroyRef);

  constructor(
    private notiService: NotificationService,
    private signalrService: SignalrService
  ) {
    this.notificationMenuItems = [
      {
        label: 'Mark as read',
        icon: 'pi pi-fw pi-check',
        command: () => this.markAsRead(this.selectedNotification!)
      },
      {
        label: 'Delete',
        icon: 'pi pi-fw pi-trash',
        command: () => this.deleteNotification(this.selectedNotification)
      }
    ];
  }

  ngOnInit() {
    // 1. Load the initial list
    this.loadNotifications();

    // 2. Listen for real-time updates from SignalR
    this.signalrService.notificationReceived$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newNotif: NotificationDto) => {
        // Push directly to the top of the main list
        this.allNotifications.unshift(newNotif);
      });
  }

  // --- DATA LOADING & PAGINATION LOGIC ---
  loadNotifications(isLoadMore = false) {
    if (this.isLoading || this.isLoadingMore) return;
    if (isLoadMore && !this.hasMore) return;

    if (isLoadMore) this.isLoadingMore = true;
    else this.isLoading = true;

    // Get the last item as the pagination cursor
    const lastItem = isLoadMore && this.allNotifications.length > 0
      ? this.allNotifications[this.allNotifications.length - 1] : null;

    let safeDate: any = undefined;
    if (lastItem && lastItem.createDate) {
      safeDate = lastItem.createDate;
    }

    this.notiService.getList(this.pageSize, safeDate, lastItem?.notificationId).subscribe({
      next: (res) => {
        if (isLoadMore) {
          // Remove duplicates in case a real-time item was added
          const newItems = res.filter(r => !this.allNotifications.some(n => n.notificationId === r.notificationId));
          this.allNotifications = [...this.allNotifications, ...newItems];

          this.hasMore = newItems.length > 0 ? res.length === this.pageSize : false;
        } else {
          this.allNotifications = res;
          this.hasMore = res.length === this.pageSize;
        }

        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (err) => {
        console.error('Error loading notifications', err);
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  onScroll(event: any) {
    const el = event.target;
    // Automatically load more when scrolled within 50px of the bottom
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50 && !this.isLoadingMore) {
      this.loadNotifications(true);
    }
  }

  // --- DISPLAY & FILTER LOGIC ---
  get filteredNotifications(): NotificationDto[] {
    if (this.selectedFilter === 'all') {
      return this.allNotifications;
    }
    // Group LIKE and COMMENT under "Interactions"
    if (this.selectedFilter === 'INTERACTION') {
      return this.allNotifications.filter(n => n.type === 'POST_LIKE' || n.type === 'POST_COMMENT');
    }
    return this.allNotifications.filter(n => n.type === this.selectedFilter);
  }

  get hasNotifications(): boolean {
    return this.filteredNotifications && this.filteredNotifications.length > 0;
  }

  getIconForType(type: string): string {
    switch(type) {
      case 'POST_LIKE': return 'pi pi-heart text-red-500 bg-red-100';
      case 'POST_COMMENT': return 'pi pi-comment text-blue-500 bg-blue-100';
      case 'NEW_POST': return 'pi pi-briefcase text-orange-500 bg-orange-100';
      default: return 'pi pi-bell text-gray-500 bg-gray-100';
    }
  }

  // --- INTERACTION LOGIC ---
  showNotificationMenu(menu: any, event: Event, notification: NotificationDto): void {
    this.selectedNotification = notification;
    menu.toggle(event);
    event.stopPropagation(); // Prevent click bubbling to the parent element
  }

  markAsRead(notification: NotificationDto): void {
    if (!notification || notification.isRead) return;
    notification.isRead = true;
    this.notiService.markAsRead(notification.notificationId).subscribe();
  }

  deleteNotification(notification: NotificationDto | null): void {
    if (!notification) return;
    this.allNotifications = this.allNotifications.filter(n => n.notificationId !== notification.notificationId);
    this.selectedNotification = null;

    // this.notiService.delete(notification.notificationId).subscribe();
  }
}