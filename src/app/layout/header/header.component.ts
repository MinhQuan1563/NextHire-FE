import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
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
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { FloatingChatComponent } from '@shared/reusable-components/messages/floating-chat/floating-chat.component';
import { ChatPartner } from '@app/models/message/message.model';
import { MessageStateService } from '@app/services/message/message-stage.service';
import { ChatOverlayComponent } from '@shared/reusable-components/messages/chat-overlay/chat-overlay.component';
import { NotificationOverlayComponent } from '@shared/reusable-components/notification-overlay/notification-overlay.component';
import { MessageService } from '@app/services/message/message.service';
import { VideoCallComponent } from '@shared/reusable-components/messages/video-call/video-call.component';
import { map } from 'rxjs';
import { NotificationService } from '@app/services/notification/notification.service';
import { NotificationDto } from '@app/models/notification/notification.model';
import { SignalrService } from '@app/services/signalr/signalr.service';
import { MessageService as PrimeMessageService } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ButtonModule, InputTextModule,
    AvatarModule, MenuModule, TieredMenuModule, OverlayPanelModule,
    TooltipModule, FloatingChatComponent, ChatOverlayComponent,
    NotificationOverlayComponent, VideoCallComponent, AsyncPipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  conversations$ = this.messageStateService.conversations$;
  @Input() currentUser: User | null = null;

  userMenuItems: MenuItem[];
  private destroyRef = inject(DestroyRef);
  activeCallType: 'AUDIO' | 'VIDEO' | null = null;
  isCaller: boolean = false;
  callStartTime: number = 0;
  isLoggingOut = false;

  // Controls floating chat window in the bottom corner when clicking a person in chat list
  isFloatingChatOpen = false;
  activeChatPartner!: ChatPartner;

  // Incoming call data from SignalR
  incomingCallData: any = null;
  activeCallRoomId: string | null = null;

  totalUnreadCount$ = this.conversations$.pipe(
    map(chats => chats.filter(chat => chat.hasUnread).length)
  );

  // For notification overlay
  public notifications: NotificationDto[] = [];
  public unreadCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    public messageStateService: MessageStateService,
    public notificationService: NotificationService,
    private signalrService: SignalrService,
    private primeMessageService: PrimeMessageService
  ) {
    this.userMenuItems = [
      {
        label: 'View Profile',
        icon: 'pi pi-fw pi-user',
        command: () => this.navigateToProfile(),
      },
      {
        label: 'Manage CV',
        icon: 'pi pi-fw pi-user',
        command: () => this.navigateToCVPage(),
      },
      {
        label: 'Settings',
        icon: 'pi pi-fw pi-cog',
      },
      { separator: true },
      {
        label: 'Log out',
        icon: 'pi pi-fw pi-sign-out',
        command: () => this.logout(),
      },
    ];
  }

  ngOnInit(): void {
    // Lắng nghe trạng thái online của bạn chat
    this.messageStateService.conversations$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(chats => {
        if (this.isFloatingChatOpen && this.activeChatPartner) {
          const chatInfo = chats.find(c => c.partnerCode === this.activeChatPartner.userCode);
          
          if (chatInfo && chatInfo.isOnline !== this.activeChatPartner.isOnline) {
            this.activeChatPartner = { 
              ...this.activeChatPartner, 
              isOnline: chatInfo.isOnline 
            };
          }
        }
      });

    // Lắng nghe cuộc gọi đến
    this.messageStateService.incomingCall$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(callData => {
        this.incomingCallData = callData;
      });

    // Lắng nghe khi bị từ chối cuộc gọi
    this.messageStateService.callDeclined$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(receiverCode => {
        alert("User is busy or has declined the call.");
        
        if (this.activeChatPartner && this.activeCallType) {
          const content = `[CALL|MISSED|${this.activeCallType}|0]`;
          this.messageService.sendMessage({ receiverCode: this.activeChatPartner.userCode, content }).subscribe();
          this.messageStateService.updateConversationWhenSend(this.activeChatPartner.userCode, "Missed call");
        }
        this.activeCallRoomId = null; 
        this.activeCallType = null;
      });

    // Lắng nghe Thông báo Real-time
    this.signalrService.notificationReceived$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newNotif: any) => {
        this.unreadCount++;
        this.notifications.unshift(newNotif);

        let severity = 'info';
        if (newNotif.type === 'POST_LIKE') severity = 'success';
        if (newNotif.type === 'NEW_POST') severity = 'warn';

        this.primeMessageService.add({
          severity: severity,
          summary: newNotif.title,
          detail: newNotif.content,
          life: 4000
        });

        // Nếu notificationService của bạn có quản lý state, có thể update nó ở đây
        // this.notificationService.updateState(newNotif);
      });

    // Lắng nghe sự kiện tài khoản bị khóa
    this.signalrService.accountLocked$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.authService.clearLocalData();
        this.router.navigate(['/auth/login'], { queryParams: { locked: 'true' } });
      });

    this.notificationService.fetchUnreadCount();
  }

  // Mở cửa sổ chat khi click vào 1 người trong danh sách chat
  openFloatingChat(userCode: string, name: string, avatar?: string) {
    this.messageStateService.markConversationAsRead(userCode);

    const currentChats = this.messageStateService.conversationsSubject.getValue();
    const chatInfo = currentChats.find(c => c.partnerCode === userCode);
    const isOnlineNow = chatInfo ? chatInfo.isOnline : false;

    this.activeChatPartner = {
      userCode: userCode,
      fullName: name,
      avatarUrl: avatar,
      isOnline: isOnlineNow
    };
    
    this.messageService.markAsRead(userCode).subscribe({
      next: () => { },
      error: (err) => {
        console.error(`Error marking messages from ${userCode} as read: `, err);
      }
    });

    this.isFloatingChatOpen = true;
  }

  closeFloatingChat() {
    this.isFloatingChatOpen = false;
  }

  onStartCall(event: {roomId: string, isVideo: boolean}) {
    this.activeCallRoomId = event.roomId;
    this.activeCallType = event.isVideo ? 'VIDEO' : 'AUDIO';
    this.isCaller = true;
    this.callStartTime = Date.now(); // Start timer
  }

  // CALLEE presses Answer
  acceptCall() {
    if (this.incomingCallData) {
      this.activeCallRoomId = this.incomingCallData.roomId;
      this.activeCallType = this.incomingCallData.isVideoCall ? 'VIDEO' : 'AUDIO';
      this.isCaller = false;
      this.incomingCallData = null;
    }
  }

  // Close video call screen
  handleCallEnded() {
    if (this.isCaller && this.activeChatPartner && this.activeCallType) {
      const durationSecs = Math.floor((Date.now() - this.callStartTime) / 1000);
      const content = `[CALL|COMPLETED|${this.activeCallType}|${durationSecs}]`;
      
      this.messageService.sendMessage({ receiverCode: this.activeChatPartner.userCode, content }).subscribe();
      this.messageStateService.updateConversationWhenSend(this.activeChatPartner.userCode, "Call ended");
    }
    
    this.activeCallRoomId = null;
    this.activeCallType = null;
  }

  // CALLEE presses Decline
  declineCall() {
    if (this.incomingCallData) {
      this.messageService.declineCall(this.incomingCallData.callerCode).subscribe();
      this.incomingCallData = null;
    }
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToCVPage() {
    this.router.navigate(['/profile/cvs']);
  }

  logout() {
    this.isLoggingOut = true;
    
    this.primeMessageService.add({ 
      severity: 'info', 
      summary: 'Goodbye!', 
      detail: 'Logging you out securely...', 
      life: 1500 
    });

    setTimeout(() => {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Logout failed:', error);
          this.authService.clearLocalData();
          this.router.navigate(['/auth/login']);
        },
      });
    }, 1500);
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
  }
}
