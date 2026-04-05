import { Injectable, NgZone } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '@env/environment';
import { MessageStateService } from '../message/message-stage.service';
import { Subject } from 'rxjs';
import { NotificationDto } from '@app/models/notification/notification.model';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;
  
  public notificationReceived$ = new Subject<NotificationDto>();
  public accountLocked$ = new Subject<void>();

  constructor(
    private messageStateService: MessageStateService,
    private zone: NgZone
  ) {}

  public startConnection() {
    const tokenFactory = () => localStorage.getItem('access_token') || '';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiBaseUrl}/signalr-hubs/app`, {
        accessTokenFactory: tokenFactory 
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
         console.log('App SignalR connected successfully!');
         this.registerEvents();
      })
      .catch(err => console.error('App SignalR connection error: ', err));
  }

  private registerEvents() {
    // ==========================================
    // CÁC SỰ KIỆN TIN NHẮN & CUỘC GỌI
    // ==========================================
    this.hubConnection.on('ReceiveMessage', (
      senderCode: string, content: string, attachmentUrl?: string,
      attachmentName?: string, attachmentType?: string
    ) => {
      this.zone.run(() => {
        this.messageStateService.handleIncomingMessage(
          senderCode, content, attachmentUrl, attachmentName, attachmentType
        );
      });
    });

    this.hubConnection.on('UserOnlineStatus', (userCode: string, isOnline: boolean) => {
      this.zone.run(() => {
        this.messageStateService.updateOnlineStatus(userCode, isOnline);
      });
    });

    this.hubConnection.on('IncomingCall', (callerCode: string, callerName: string, roomId: string, isVideoCall: boolean) => {
      this.zone.run(() => {
        this.messageStateService.incomingCall$.next({ callerCode, callerName, roomId, isVideoCall });
      });
    });

    this.hubConnection.on('CallDeclined', (receiverCode: string) => {
      this.zone.run(() => {
        this.messageStateService.callDeclined$.next(receiverCode);
      });
    });

    // ==========================================
    // CÁC SỰ KIỆN THÔNG BÁO BÀI ĐĂNG (POSTS)
    // ==========================================
    this.hubConnection.on('ReceiveNotification', (notification: NotificationDto) => {
      this.zone.run(() => {
        console.log('New notification received:', notification);
        this.notificationReceived$.next(notification);
      });
    });

    // ==========================================
    // SỰ KIỆN BẢO MẬT: ADMIN KHÓA TÀI KHOẢN
    // ==========================================
    this.hubConnection.on('ForceLogout_AccountLocked', () => {
      this.zone.run(() => {
        console.warn('Account locked by Admin. Forcing logout...');
        this.accountLocked$.next();
      });
    });
  }

  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}