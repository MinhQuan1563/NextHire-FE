import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfileDto } from '../../models/user-profile';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/UserProfile`;

  /**
   * Get current user's profile
   * GET /api/UserProfile/Get
   */
  getCurrentUserProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.apiUrl}/Get`);
  }

  /**
   * Get user profile by user code (public profile)
   * GET /api/UserProfile/Get/{userCode}
   * Note: This endpoint may not be implemented yet in the backend
   */
  getUserProfileByCode(userCode: string): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.apiUrl}/Get/${userCode}`);
  }

  /**
   * Update user profile
   * PUT /api/UserProfile/Update
   */
  updateProfile(profile: UserProfileDto): Observable<UserProfileDto> {
    return this.http.put<UserProfileDto>(`${this.apiUrl}/Update`, profile);
  }

  /**
   * Upload avatar image
   * POST /api/UserProfile/UploadAvatar/avatar
   * Accepts multipart/form-data with file field
   */
  uploadAvatar(file: File): Observable<UserProfileDto> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UserProfileDto>(
      `${this.apiUrl}/UploadAvatar/avatar`,
      formData
    );
  }
}

