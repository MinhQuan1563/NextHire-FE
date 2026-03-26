import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatPartner } from '@app/models/message/message.model';
import { MessageStateService } from '@app/services/message/message-stage.service';
import { AvatarModule } from 'primeng/avatar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [OverlayPanelModule, AvatarModule, AsyncPipe, CommonModule],
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.scss'
})
export class ChatSidebarComponent {
  @Input() activeUserCode: string = '';
  @Output() onSelectChat = new EventEmitter<ChatPartner>();

  conversations$ = this.messageStateService.conversations$;

  constructor(
    public messageStateService: MessageStateService
  ) {}

  selectChat(chat: any) {
    const parner: ChatPartner = {
      userCode: chat.partnerCode,
      fullName: chat.partnerName,
      avatarUrl: chat.partnerAvatar,
      isOnline: chat.isOnline
    };
    this.onSelectChat.emit(parner);
  }

  getLastMessagePreview(content: string): string {
    if (!content) return '';
    if (content.startsWith('[CALL|')) {
      const parts = content.split('|');
      const status = parts[1];
      const type = parts[2];
      
      if (status === 'MISSED') {
        return type === 'VIDEO' ? 'Missed video call' : 'Missed call';
      }
      return type === 'VIDEO' ? 'Video call' : 'Voice call';
    }
    return content;
  }
}
