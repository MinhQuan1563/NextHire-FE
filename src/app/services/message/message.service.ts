import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateMessageDto, MessageDto } from '@app/models/message/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/Message`;

  constructor(private http: HttpClient) {}

  sendMessage(data: CreateMessageDto): Observable<MessageDto> {
    return this.http.post<MessageDto>(this.apiUrl, data);
  }

  getMessageHistory(
    partnerCode: string, 
    limit: number = 20, 
    lastCreateDate?: string, 
    lastMessageId?: string
  ): Observable<MessageDto[]> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (lastCreateDate) params = params.set('lastCreateDate', lastCreateDate);
    if (lastMessageId) params = params.set('lastMessageId', lastMessageId);

    return this.http.get<MessageDto[]>(`${this.apiUrl}/history/${partnerCode}`, { params });
  }

  markAsRead(partnerCode: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-read/${partnerCode}`, {});
  }

  sendCallSignal(data: { receiverCode: string, roomId: string, isVideoCall: boolean }) {
    return this.http.post(`${this.apiUrl}/call-signal`, data);
  }

  declineCall(callerCode: string) {
    return this.http.post(`${this.apiUrl}/decline-call`, { callerCode });
  }

  uploadAttachment(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload-attachment`, formData);
  }
}