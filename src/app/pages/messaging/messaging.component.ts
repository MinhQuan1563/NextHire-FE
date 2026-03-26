import { Component, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatPartner } from '@app/models/message/message.model';
import { ChatSidebarComponent } from '@shared/reusable-components/messages/chat-sidebar/chat-sidebar.component';
import { ChatWindowComponent } from '@shared/reusable-components/messages/chat-window/chat-window.component';
import { ChatInfoComponent } from '@shared/reusable-components/messages/chat-info/chat-info.component';
import { User } from '@app/models/auth/auth.model';
import { SignalrService } from '@app/services/signalr/signalr.service';
import { MessageStateService } from '@app/services/message/message-stage.service';
import { AuthService } from '@app/services/auth/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkeletonModule } from 'primeng/skeleton';
import { VideoCallComponent } from '@shared/reusable-components/messages/video-call/video-call.component';
import { MessageService } from '@app/services/message/message.service';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [
    CommonModule, ChatSidebarComponent, ChatWindowComponent, 
    ChatInfoComponent, SkeletonModule, VideoCallComponent
  ],
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit {
  activeUserCode: string = '';

  currentUser: User | null = null;
  activePartner: ChatPartner | null = null;
  showRightSidebar: boolean = true;
  isInitialLoading: boolean = true;

  activeCallRoomId: string | null = null;
  activeCallType: 'AUDIO' | 'VIDEO' | null = null;
  callStartTime: number = 0;

  constructor(
    private signalrService: SignalrService,
    private messageStateService: MessageStateService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    // Nếu có URL param (vd: /messaging?user=123), bạn có thể xử lý chọn user ở đây
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user: User | null) => {
          this.currentUser = user;
          if (user) {
            this.signalrService.startConnection();
            this.messageStateService.loadConversations();
          } 
          else {
            this.signalrService.stopConnection();
            this.messageStateService.clearConversations();
          }
        }
      });

    this.messageStateService.conversations$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(chats => {
        setTimeout(() => {
          this.isInitialLoading = false;
        }, 600); 
      });
  }

  onChatSelected(partner: ChatPartner) {
    this.activePartner = partner;
    this.activeUserCode = partner.userCode;
    this.showRightSidebar = true;
  }

  toggleRightSidebar() {
    this.showRightSidebar = !this.showRightSidebar;
  }

  onStartCall(event: {roomId: string, isVideo: boolean}) {
    this.activeCallRoomId = event.roomId;
    this.activeCallType = event.isVideo ? 'VIDEO' : 'AUDIO';
    this.callStartTime = Date.now(); // Bắt đầu đếm thời gian
  }

  // 5. THÊM HÀM XỬ LÝ KHI KẾT THÚC CUỘC GỌI
  onCallEnded() {
    if (this.activePartner && this.activeCallType) {
      const durationSecs = Math.floor((Date.now() - this.callStartTime) / 1000);
      const content = `[CALL|COMPLETED|${this.activeCallType}|${durationSecs}]`;
      
      this.messageService.sendMessage({ receiverCode: this.activePartner.userCode, content }).subscribe();
      this.messageStateService.updateConversationWhenSend(this.activePartner.userCode, "Call ended");
    }
    
    this.activeCallRoomId = null;
    this.activeCallType = null;
  }
}