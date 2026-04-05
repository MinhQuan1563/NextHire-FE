import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '@env/environment';
import { ConversationDto } from '@app/models/message/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageStateService {
  // For conversation list
  public conversationsSubject = new BehaviorSubject<ConversationDto[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();
  public incomingMessage$ = new Subject<{
    senderCode: string, 
    content: string,
    attachmentUrl?: string,
    attachmentName?: string,
    attachmentType?: string
  }>();
  // For call signaling
  public incomingCall$ = new BehaviorSubject<{callerCode: string, callerName: string, roomId: string, isVideoCall: boolean} | null>(null);
  public callDeclined$ = new Subject<string>();

  constructor(private http: HttpClient) { }

  loadConversations() {
    this.http.get<ConversationDto[]>(`${environment.apiUrl}/Message/conversations`)
      .subscribe({
        next: (res) => {
          this.conversationsSubject.next(res);
        },
        error: (err) => {
          console.error('Error loading conversation list', err);
        }
      });
  }

  // Update the list immediately if there are new messages (For SignalR later)
  updateConversationList(newConversations: ConversationDto[]) {
    this.conversationsSubject.next(newConversations);
  }

  clearConversations() {
    this.conversationsSubject.next([]);
  }

  // Handle incoming message from SignalR and update the conversation list accordingly
  handleIncomingMessage(
    senderCode: string, 
    content: string,
    attachmentUrl?: string,
    attachmentName?: string,
    attachmentType?: string
  ) {
    const currentChats = this.conversationsSubject.getValue();
    const chatIndex = currentChats.findIndex(c => c.partnerCode === senderCode);

    // UX tip: If sending an image without text, the chat list will display "Sent a file..."
    const displayContent = content || (attachmentUrl ? "Sent a file attachment" : "");

    if (chatIndex > -1) {
      const updatedChat = { 
        ...currentChats[chatIndex],
        lastMessageContent: displayContent,
        lastMessageTime: new Date(),
        hasUnread: true,
        isLastMessageFromMe: false
      };

      const otherChats = currentChats.filter(c => c.partnerCode !== senderCode);
      this.conversationsSubject.next([updatedChat, ...otherChats]);
    } 
    else {
      this.loadConversations();
    }

    this.incomingMessage$.next({ 
      senderCode, 
      content,
      attachmentUrl,
      attachmentName,
      attachmentType
    });
  }

  // Call this when the user sends a message to update the conversation list immediately
  updateConversationWhenSend(receiverCode: string, content: string) {
    const currentChats = this.conversationsSubject.getValue();
    const chatIndex = currentChats.findIndex(c => c.partnerCode === receiverCode);

    if (chatIndex > -1) {
      const updatedChat = { 
        ...currentChats[chatIndex],
        lastMessageContent: content,
        lastMessageTime: new Date(),
        hasUnread: false,
        isLastMessageFromMe: true
      };
      const otherChats = currentChats.filter(c => c.partnerCode !== receiverCode);
      this.conversationsSubject.next([updatedChat, ...otherChats]);
    }
  }

  markConversationAsRead(partnerCode: string) {
    const currentChats = this.conversationsSubject.getValue();
    
    const updatedChats = currentChats.map(chat => 
      (chat.partnerCode === partnerCode && chat.hasUnread)
        ? { ...chat, hasUnread: false }
        : chat
    );

    this.conversationsSubject.next(updatedChats);
  }

  updateOnlineStatus(userCode: string, isOnline: boolean) {
    const currentChats = this.conversationsSubject.getValue();

    const updatedChats = currentChats.map(chat => 
      chat.partnerCode === userCode 
        ? { ...chat, isOnline: isOnline }
        : chat
    );
    this.conversationsSubject.next(updatedChats);
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}