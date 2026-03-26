import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, DestroyRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ChatPartner, CreateMessageDto, MessageDto } from '@app/models/message/message.model';
import { AuthService } from '@app/services/auth/auth.service';
import { MessageService } from '@app/services/message/message.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MessageStateService } from '@app/services/message/message-stage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuModule } from 'primeng/menu';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ImageModule } from 'primeng/image';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-floating-chat',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AvatarModule, 
    MenuModule, PickerComponent, ImageModule,
    ProgressSpinnerModule
  ],
  templateUrl: './floating-chat.component.html',
  styleUrls: ['./floating-chat.component.scss']
})
export class FloatingChatComponent implements OnInit, OnChanges {
  @Input() partner!: ChatPartner; 
  @Output() closeChat = new EventEmitter<void>();
  @Output() onStartCall = new EventEmitter<{roomId: string, isVideo: boolean}>();
  
  @ViewChild('chatScroll') private chatScroll!: ElementRef;
  @ViewChild('fileUpload') private fileUpload!: ElementRef;
  @ViewChild('attachMenu') private attachMenu: any;

  messages: MessageDto[] = [];
  messageContent = '';
  currentUserCode = '';
  isSending = false;
  isLoadingHistory: boolean = false;
  attachMenuItems: MenuItem[] = [];
  showEmojiPicker = false;
  fileAcceptType: string = '*/*';
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router,
    private messageStateService: MessageStateService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.currentUserCode = this.authService.getUserCodeFromToken() || '';
    if (this.partner?.userCode) {
      this.loadHistory();
    }

    this.messageStateService.incomingMessage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(msg => {
        if (msg.senderCode === this.partner.userCode) {
          
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

    this.attachMenuItems = [
      { label: 'Send Image or Video', icon: 'pi pi-image', command: () => this.triggerFileInput('image/*,video/*') },
      { label: 'Choose a File', icon: 'pi pi-file', command: () => this.triggerFileInput('.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar') },
      { label: 'Send a voice', icon: 'pi pi-microphone', command: () => this.comingSoon() },
      { label: 'Choose a sticker', icon: 'pi pi-slack', command: () => this.comingSoon() },
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['partner'] && !changes['partner'].firstChange) {
      
      const prevPartner = changes['partner'].previousValue as ChatPartner;
      const currentPartner = changes['partner'].currentValue as ChatPartner;

      if (prevPartner && currentPartner && prevPartner.isOnline !== currentPartner.isOnline) {
        this.partner = currentPartner;
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
      },
      error: (err) => console.error('Error loading message history:', err)
    });
  }

  sendMessage() {
    const content = this.messageContent.trim();
    
    if (!content && !this.selectedFile) return;
    if (this.isSending) return;

    this.isSending = true;
    this.showEmojiPicker = false;

    if (this.selectedFile) {
      // TRƯỜNG HỢP 1: CÓ GỬI KÈM FILE
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
    } 
    else {
      // TRƯỜNG HỢP 2: CHỈ GỬI TEXT BÌNH THƯỜNG
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

  onClose() {
    this.closeChat.emit();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
      } catch (err) {}
    }, 50);
  }

  goToProfile() {
    this.router.navigate(['/profile', this.partner.userCode]);
  }

  sendLike() {
    const likeContent = '👍';
    this.messageContent = likeContent;
    this.sendMessage();
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
  //    CALL LOG UI PROCESSING FUNCTIONS
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

  comingSoon() {
    alert('This feature is coming soon!');
  }

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
      } 
      else {
        this.previewUrl = null;
      }
      
      event.target.value = '';
      if (this.attachMenu)
        this.attachMenu.hide();
    }
  }

  // XÓA FILE KHI BẤM NÚT (X) TRÊN PREVIEW
  removeSelectedFile() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  // FORMAT DUNG LƯỢNG FILE
  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    this.messageContent += emoji;
  }
}