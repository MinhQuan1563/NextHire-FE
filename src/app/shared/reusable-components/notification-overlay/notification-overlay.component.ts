import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationDto } from '@app/models/notification/notification.model';
import { NotificationService } from '@app/services/notification/notification.service';
import { SignalrService } from '@app/services/signalr/signalr.service';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'app-notification-overlay',
  standalone: true,
  imports: [OverlayPanelModule, CommonModule, DatePipe],
  templateUrl: './notification-overlay.component.html',
  styleUrl: './notification-overlay.component.scss'
})
export class NotificationOverlayComponent implements OnInit {
  @ViewChild('op') op!: OverlayPanel;
  
  notifications: NotificationDto[] = [];
  isLoading = false;
  isLoadingMore = false;
  hasMore = true;
  pageSize = 5;
  
  constructor(
    private notiService: NotificationService,
    private destroyRef: DestroyRef,
    private signalrService: SignalrService
  ) {}

  ngOnInit() {
    this.signalrService.notificationReceived$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newNotif: NotificationDto) => {
        this.notifications.unshift(newNotif);
      });
  }

  toggle(event: any) {
    this.op.toggle(event);
    if (this.notifications.length === 0) {
      this.loadNotifications();
    }
  }

  loadNotifications(isLoadMore = false) {
    if (this.isLoading || this.isLoadingMore) return;
    if (isLoadMore && !this.hasMore) return; 
    
    if (isLoadMore) this.isLoadingMore = true;
    else this.isLoading = true;

    const lastItem = isLoadMore && this.notifications.length > 0 
      ? this.notifications[this.notifications.length - 1] : null;

    let safeDate = undefined;
    if (lastItem && lastItem.createDate) {
      safeDate = lastItem?.createDate;
    }

    this.notiService.getList(this.pageSize, safeDate, lastItem?.notificationId).subscribe({
      next: (res) => {
        if (isLoadMore) {
          const newItems = res.filter(r => !this.notifications.some(n => n.notificationId === r.notificationId));
          this.notifications = [...this.notifications, ...newItems];
          
          if (newItems.length === 0) {
            this.hasMore = false; 
          } else {
            this.hasMore = res.length === this.pageSize;
          }
        } else {
          this.notifications = res;
          this.hasMore = res.length === this.pageSize;
        }

        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (err) => {
        console.error('Lỗi tải thông báo', err);
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  onScroll(event: any) {
    const el = event.target;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50 && !this.isLoadingMore) {
      this.loadNotifications(true);
    }
  }

  onNotiClick(noti: NotificationDto) {
    if (!noti.isRead) {
      noti.isRead = true;
      this.notiService.markAsRead(noti.notificationId).subscribe();
    }
    
    this.op.hide();
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
    this.notiService.markAllAsRead().subscribe();
  }
}