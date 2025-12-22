import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FriendRequestDto,
  FriendshipStatusResponse,
} from '../../models/user-profile';

@Injectable({
  providedIn: 'root',
})
export class FriendshipService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/friendship`;

  /**
   * Get friendship status with a user
   * GET /api/friendship/friends/{userCode}
   */
  getFriendshipStatus(userCode: string): Observable<FriendshipStatusResponse> {
    return this.http.get<FriendshipStatusResponse>(
      `${this.apiUrl}/friends/${userCode}`
    );
  }

  /**
   * Send a friend request to a user
   * POST /api/friendship/send-request
   */
  sendFriendRequest(userCode: string): Observable<void> {
    const payload: FriendRequestDto = { userCode };
    return this.http.post<void>(`${this.apiUrl}/send-request`, payload);
  }

  /**
   * Accept a friend request
   * POST /api/friendship/accept
   */
  acceptFriendRequest(userCode: string): Observable<void> {
    const payload: FriendRequestDto = { userCode };
    return this.http.post<void>(`${this.apiUrl}/accept`, payload);
  }

  /**
   * Decline a friend request
   * POST /api/friendship/decline
   */
  declineFriendRequest(userCode: string): Observable<void> {
    const payload: FriendRequestDto = { userCode };
    return this.http.post<void>(`${this.apiUrl}/decline`, payload);
  }

  /**
   * Cancel a sent friend request
   * POST /api/friendship/cancel
   */
  cancelFriendRequest(userCode: string): Observable<void> {
    const payload: FriendRequestDto = { userCode };
    return this.http.post<void>(`${this.apiUrl}/cancel`, payload);
  }

  /**
   * Unfriend a user (remove friendship)
   * POST /api/friendship/unfriend
   * Note: If the backend doesn't have an unfriend endpoint, this may use cancel or a similar endpoint
   */
  unfriend(userCode: string): Observable<void> {
    const payload: FriendRequestDto = { userCode };
    // Using cancel endpoint as unfriend - may need to be updated when backend provides explicit unfriend endpoint
    return this.http.post<void>(`${this.apiUrl}/cancel`, payload);
  }

  /**
   * Block a user
   * POST /api/friendship/block
   */
  blockUser(userCode: string): Observable<void> {
    const payload: FriendRequestDto = { userCode };
    return this.http.post<void>(`${this.apiUrl}/block`, payload);
  }

  /**
   * Get pending friend requests for a user
   * GET /api/friendship/pending/{userCode}
   */
  getPendingRequests(userCode: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.apiUrl}/pending/${userCode}`);
  }
}

