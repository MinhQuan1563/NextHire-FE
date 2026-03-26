import { Injectable, NgZone } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '@env/environment';
import { MessageStateService } from '../message/message-stage.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;

  constructor(
    private messageStateService: MessageStateService,
    private zone: NgZone
  ) {}

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiBaseUrl}/signalr-hubs/message`, {
        accessTokenFactory: () => localStorage.getItem('access_token') || '' 
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('⚡ SignalR Connected successfully!'))
      .catch(err => console.error('Lỗi kết nối SignalR: ', err));

    this.listenForNewMessages();
  }

  private listenForNewMessages() {
    // Receive new messages from the server
    this.hubConnection.on('ReceiveMessage', (
      senderCode: string, content: string, attachmentUrl?: string,
      attachmentName?: string, attachmentType?: string
    ) => {
      this.zone.run(() => {
        this.messageStateService.handleIncomingMessage(
          senderCode, content, attachmentUrl, 
          attachmentName, attachmentType
        );
      });
    });

    // Receive online status updates
    this.hubConnection.on('UserOnlineStatus', (userCode: string, isOnline: boolean) => {
      this.zone.run(() => {
        this.messageStateService.updateOnlineStatus(userCode, isOnline);
      });
    });

    // Listen for incoming call signals
    this.hubConnection.on('IncomingCall', (callerCode: string, callerName: string, roomId: string, isVideoCall: boolean) => {
      this.zone.run(() => {
        this.messageStateService.incomingCall$.next({ callerCode, callerName, roomId, isVideoCall });
      });
    });

    // Listen for call decline signals
    this.hubConnection.on('CallDeclined', (receiverCode: string) => {
      this.zone.run(() => {
        this.messageStateService.callDeclined$.next(receiverCode);
      });
    });
  }

  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}