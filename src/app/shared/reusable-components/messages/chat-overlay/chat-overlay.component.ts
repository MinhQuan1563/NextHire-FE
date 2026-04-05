import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MessageStateService } from '@app/services/message/message-stage.service';
import { AvatarModule } from 'primeng/avatar';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chat-overlay',
  standalone: true,
  imports: [OverlayPanelModule, AvatarModule, AsyncPipe, CommonModule, RouterLink],
  templateUrl: './chat-overlay.component.html',
  styleUrls: ['./chat-overlay.component.scss'],
})
export class ChatOverlayComponent {
  @ViewChild('op') op!: OverlayPanel;
  @Input() conversations$!: Observable<any[]>;
  @Output() chatSelected = new EventEmitter<any>();

  activeFilter: 'all' | 'unread' = 'all';

  constructor(public messageStateService: MessageStateService) {}

  getFilteredChats(chats: any[] | null): any[] {
    if (!chats) return [];
    if (this.activeFilter === 'unread') {
      return chats.filter(c => c.hasUnread === true);
    }
    return chats;
  }

  // Dịch chuỗi Call Log thành text hiển thị đẹp mắt
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

  toggle(event: Event) {
    this.op.toggle(event);
  }

  onChatClick(chat: any) {
    this.chatSelected.emit(chat);
    this.op.hide();
  }
}