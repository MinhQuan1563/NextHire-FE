import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { InfoSidebarComponent } from '@shared/reusable-components/info-sidebar/info-sidebar.component';

interface NotificationItem {
  id: number;
  type: 'job' | 'post' | 'profile_view' | 'connection' | 'other';
  avatarUrl?: string;
  avatarLabel?: string;
  icon?: string;
  message: string;
  date: Date;
  isUnread?: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    MenuModule, 
    ButtonModule,
    SelectButtonModule,
    FormsModule,
    DatePipe,
    InfoSidebarComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {
  filterOptions: any[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Việc làm', value: 'job' },
    { label: 'Bài viết', value: 'post' }
  ];

  selectedFilter: string = 'all';
  notificationMenuItems: MenuItem[];
  selectedNotification: NotificationItem | null = null;

  allNotifications: NotificationItem[] = [
    {
      id: 1, type: 'profile_view', avatarUrl: 'favicon.ico',
      message: '<b>Minh Quan</b> và 3 người khác đã xem hồ sơ của bạn.', date: new Date(Date.now() - 2 * 3600 * 1000), isUnread: true // 2 giờ trước
    },
    {
      id: 2, type: 'job', icon: 'pi pi-briefcase',
      message: 'Có <b>5 việc làm mới</b> phù hợp với kỹ năng của bạn.', date: new Date(Date.now() - 86400000), isUnread: false // 1 ngày trước
    },
    {
      id: 3, type: 'connection', avatarLabel: 'A',
      message: '<b>Anh Nguyen</b> đã chấp nhận lời mời kết nối của bạn.', date: new Date(Date.now() - 3 * 86400000), isUnread: false // 3 ngày trước
    },
     {
      id: 4, type: 'post', avatarUrl: 'favicon.ico',
      message: '<b>Công ty X</b> đã đăng một bài viết mới.', date: new Date(Date.now() - 5 * 86400000), isUnread: false // 5 ngày trước
    },
  ];

  constructor() {
    this.notificationMenuItems = [
      {
        label: 'Xóa',
        icon: 'pi pi-fw pi-trash',
        command: () => this.deleteNotification(this.selectedNotification)
      },
      {
        label: 'Tắt thông báo này',
        icon: 'pi pi-fw pi-bell-slash',
        command: () => this.muteNotification(this.selectedNotification)
      },
    ];
  }

  get filteredNotifications(): NotificationItem[] {
    if (this.selectedFilter === 'all') {
      return this.allNotifications;
    }
    return this.allNotifications.filter(n => n.type === this.selectedFilter);
  }

  get hasNotifications(): boolean {
    return this.filteredNotifications && this.filteredNotifications.length > 0;
  }

  showNotificationMenu(menu: any, event: Event, notification: NotificationItem): void {
    this.selectedNotification = notification;
    menu.toggle(event);
    event.stopPropagation();
  }

  deleteNotification(notification: NotificationItem | null): void {
    if (!notification) return;
    console.log('Xóa thông báo:', notification.id);
    this.allNotifications = this.allNotifications.filter(n => n.id !== notification.id);
    this.selectedNotification = null;
  }

  muteNotification(notification: NotificationItem | null): void {
    if (!notification) return;
    console.log('Tắt thông báo:', notification.id);
    this.selectedNotification = null;
  }

  markAsRead(notification: NotificationItem): void {
      notification.isUnread = false;
      console.log('Đã đọc:', notification.id);
  }
}