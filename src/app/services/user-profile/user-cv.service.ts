import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserCvDto,
  UserCvDetailDto,
  CreateUserCvDto,
  UpdateUserCvDto,
  SetDefaultUserCvDto,
} from '../../models/user-profile';

@Injectable({
  providedIn: 'root',
})
export class UserCvService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/UserCv`;

  /**
   * Get all CVs for the current user
   * GET /api/UserCv/by-user
   */
  getCvsByUser(): Observable<UserCvDto[]> {
    return this.http.get<UserCvDto[]>(`${this.apiUrl}/by-user`);
  }

  /**
   * Upload a new CV
   * POST /api/UserCv
   * Accepts multipart/form-data with CvName, SetAsDefault, and CvFile
   */
  uploadCv(data: CreateUserCvDto): Observable<UserCvDto> {
    const formData = new FormData();
    formData.append('CvName', data.cvName);
    formData.append('CvFile', data.file);
    if (data.isDefault !== undefined) {
      formData.append('SetAsDefault', data.isDefault.toString());
    }

    return this.http.post<UserCvDto>(this.apiUrl, formData);
  }

  /**
   * Update CV metadata (name only, file cannot be changed)
   * PUT /api/UserCv/{cvId}
   * Accepts multipart/form-data with CvName
   */
  updateCv(cvId: string, data: UpdateUserCvDto): Observable<UserCvDto> {
    const formData = new FormData();
    formData.append('CvName', data.cvName);

    return this.http.put<UserCvDto>(`${this.apiUrl}/${cvId}`, formData);
  }

  /**
   * Delete a CV
   * DELETE /api/UserCv/{cvId}
   */
  deleteCv(cvId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${cvId}`);
  }

  /**
   * Set a CV as default
   * POST /api/UserCv/set-default
   */
  setDefaultCv(cvId: string): Observable<UserCvDto> {
    const payload: SetDefaultUserCvDto = { cvId };
    return this.http.post<UserCvDto>(`${this.apiUrl}/set-default`, payload);
  }

  /**
   * Download a CV file
   * GET /api/UserCv/download/{cvId}
   * Returns a blob that can be downloaded
   */
  downloadCv(cvId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${cvId}`, {
      responseType: 'blob',
    });
  }

  /**
   * Get CV detail by ID (includes file content)
   * GET /api/UserCv/{cvId}
   */
  getCvById(cvId: string): Observable<UserCvDetailDto> {
    return this.http.get<UserCvDetailDto>(`${this.apiUrl}/${cvId}`);
  }
}

