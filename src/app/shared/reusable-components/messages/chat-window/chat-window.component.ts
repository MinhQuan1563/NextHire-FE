import { Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatPartner, MessageDto, CreateMessageDto } from '@app/models/message/message.model';
import { AuthService } from '@app/services/auth/auth.service';
import { MessageStateService } from '@app/services/message/message-stage.service';
import { MessageService } from '@app/services/message/message.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ImageModule } from 'primeng/image';
import { MenuItem } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AvatarModule, 
    MenuModule, PickerComponent, ImageModule,
    ProgressSpinnerModule
  ],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss'
})
export class ChatWindowComponent implements OnInit, OnChanges {
  @Input() partner !: ChatPartner;
  @Output() toggleInfo = new EventEmitter<void>();
  @Output() onStartCall = new EventEmitter<{roomId: string, isVideo: boolean}>();
  
  // Các ElementRef cần thiết cho giao diện
  @ViewChild('chatScroll') private chatScroll!: ElementRef;
  @ViewChild('fileUpload') private fileUpload!: ElementRef;
  @ViewChild('attachMenu') private attachMenu: any;

  messages: MessageDto[] = [];
  currentUserCode = '';
  isLoadingHistory: boolean = false;
  
  // Trạng thái input và file
  messageContent = '';
  isSending = false;
  attachMenuItems: MenuItem[] = [];
  showEmojiPicker = false;
  fileAcceptType: string = '*/*';
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private messageService: MessageService,
    private messageStateService: MessageStateService,
    private authService: AuthService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.currentUserCode = this.authService.getUserCodeFromToken() || '';
    this.listenToIncomingMessages();

    this.attachMenuItems = [
      { label: 'Send Image or Video', icon: 'pi pi-image', command: () => this.triggerFileInput('image/*,video/*') },
      { label: 'Choose a File', icon: 'pi pi-file', command: () => this.triggerFileInput('.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar') },
      { label: 'Send a voice', icon: 'pi pi-microphone', command: () => this.comingSoon() },
      { label: 'Choose a sticker', icon: 'pi pi-slack', command: () => this.comingSoon() },
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
  if (changes['partner'] && changes['partner'].currentValue) {
    const current = changes['partner'].currentValue;
    const previous = changes['partner'].previousValue;
    
    this.partner = current;
    
    if (!previous || current.userCode !== previous.userCode) {
      this.loadHistory();
      this.messageStateService.markConversationAsRead(this.partner.userCode);
    }
  }
}

  loadHistory() {
    this.isLoadingHistory = true;

    this.messageService.getMessageHistory(this.partner.userCode)
    .pipe(finalize(() => this.isLoadingHistory = false))
    .subscribe({
      next: (res) => {
        this.messages = res.reverse();
        this.scrollToBottom();
      }
    });
  }

  listenToIncomingMessages() {
    this.messageStateService.incomingMessage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(msg => {
        if (msg && this.partner && msg.senderCode === this.partner.userCode) {
          this.messages.push({
            senderCode: msg.senderCode,
            receiverCode: this.currentUserCode,
            content: msg.content,
            createDate: new Date().toISOString(),
            isRead: true,
            attachmentUrl: msg.attachmentUrl,
            attachmentName: msg.attachmentName,
            attachmentType: msg.attachmentType
          } as any);
          this.scrollToBottom();
          this.messageStateService.markConversationAsRead(this.partner.userCode);
          this.messageService.markAsRead(this.partner.userCode).subscribe();
        }
      });
  }

  // Header Actions
  onToggleInfo() {
    this.toggleInfo.emit();
  }

  startCall(isVideo: boolean) {
    const roomId = `room_${this.currentUserCode}_${new Date().getTime()}`;

    this.messageService.sendCallSignal({
      receiverCode: this.partner.userCode,
      roomId: roomId,
      isVideoCall: isVideo
    }).subscribe();

    this.onStartCall.emit({ roomId, isVideo }); 
  }

  // ==========================================
  //     MESSAGING CORE LOGIC
  // ==========================================
  sendMessage() {
    const content = this.messageContent.trim();
    if (!content && !this.selectedFile) return;
    if (this.isSending) return;

    this.isSending = true;
    this.showEmojiPicker = false;

    if (this.selectedFile) {
      this.messageService.uploadAttachment(this.selectedFile).subscribe({
        next: (res) => {
          const dto: CreateMessageDto = { 
            receiverCode: this.partner.userCode, 
            content: content || '',
            attachmentUrl: res.attachmentUrl,
            attachmentName: res.attachmentName,
            attachmentType: res.attachmentType
          };
          this.executeSendMessage(dto);
          this.removeSelectedFile();
        },
        error: (err) => {
          console.error('Lỗi khi upload file:', err);
          alert('Upload file thất bại!');
          this.isSending = false;
        }
      });
    } else {
      const dto: CreateMessageDto = { receiverCode: this.partner.userCode, content: content };
      this.executeSendMessage(dto);
    }
  }

  executeSendMessage(dto: CreateMessageDto) {
    this.messageContent = '';
    this.messageService.sendMessage(dto).subscribe({
      next: (newMsg) => {
        newMsg.attachmentUrl = newMsg.attachmentUrl || dto.attachmentUrl;
        newMsg.attachmentName = newMsg.attachmentName || dto.attachmentName;
        newMsg.attachmentType = newMsg.attachmentType || dto.attachmentType;

        this.messages.push(newMsg);
        this.scrollToBottom();
        this.isSending = false;
        
        const previewText = dto.attachmentUrl ? 'Đã gửi một tệp đính kèm' : dto.content;
        this.messageStateService.updateConversationWhenSend(this.partner.userCode, previewText || '');
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.messageContent = dto.content || ''; 
        this.isSending = false;
      }
    });
  }

  sendLike() {
    this.messageContent = '👍';
    this.sendMessage();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.chatScroll) {
          this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
        }
      } catch (err) {}
    }, 50);
  }

  // ==========================================
  //     FILE UPLOAD LOGIC
  // ==========================================
  triggerFileInput(acceptType: string = '*/*') {
    this.fileAcceptType = acceptType;
    setTimeout(() => {
      this.fileUpload.nativeElement.click();
    }, 0);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 104857600) {
        alert('Dung lượng file vượt quá 100MB.');
        return;
      }
      this.selectedFile = file;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => this.previewUrl = e.target?.result || null;
        reader.readAsDataURL(file);
      } else {
        this.previewUrl = null; 
      }
      
      event.target.value = ''; 
      if (this.attachMenu) 
        this.attachMenu.hide();
    }
  }

  removeSelectedFile() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  // ==========================================
  //     CALL LOG LOGIC
  // ==========================================
  isCallLog(content: string): boolean {
    return content?.startsWith('[CALL|');
  }

  getCallStatus(content: string): string {
    return content.split('|')[1];
  }

  getCallType(content: string): string {
    return content.split('|')[2];
  }

  getCallDuration(content: string): number {
    return parseInt(content.split('|')[3]);
  }

  getCallTitle(content: string): string {
    const type = this.getCallType(content) === 'VIDEO' ? 'Video' : 'Audio';
    const status = this.getCallStatus(content);
    return status === 'MISSED' ? `Missed ${type.toLowerCase()} call` : `${type} call`;
  }

  getCallSubtitle(content: string, date: string): string {
    const status = this.getCallStatus(content);
    if (status === 'MISSED') {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const duration = this.getCallDuration(content);
    if (duration < 60) return `${duration} secs`;
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    return `${mins} min ${secs} secs`;
  }

  callAgain(content: string) {
    const isVideo = this.getCallType(content) === 'VIDEO';
    this.startCall(isVideo);
  }

  // ==========================================
  //     UI HELPERS
  // ==========================================
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    this.messageContent += emoji;
  }

  comingSoon() {
    alert('This feature is coming soon!');
  }
}