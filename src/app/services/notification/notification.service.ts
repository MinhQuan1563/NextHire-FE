import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { NotificationDto } from '@app/models/notification/notification.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/Notification`;
  
  constructor(private http: HttpClient) {}

  private unreadCountSubj = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubj.asObservable();

  getList(limit: number, lastDate?: string, lastId?: string): Observable<NotificationDto[]> {
    let params = new HttpParams().set('limit', limit);
    if (lastDate && lastId) {
      params = params.set('lastCreateDate', lastDate).set('lastNotiId', lastId);
    }
    return this.http.get<NotificationDto[]>(this.apiUrl, { params });
  }

  fetchUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).subscribe(res => {
      this.unreadCountSubj.next(res.count);
    });
  }

  decrementUnreadCount() {
    const current = this.unreadCountSubj.getValue();
    if (current > 0) this.unreadCountSubj.next(current - 1);
  }

  markAsRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.decrementUnreadCount())
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubj.next(0))
    );
  }
}