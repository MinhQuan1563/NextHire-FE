import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { GetPermissionResponse, UpdatePermissionDto } from '@app/models/permission/permission.model';

@Injectable({ providedIn: 'root' })
export class PermissionManagementService {
  private apiUrl = `${environment.apiBaseUrl}/api/permission-management/permissions`;

  constructor(private http: HttpClient) {}

  // Lấy danh sách quyền theo Role (admin, recruiter, candidate)
  getPermissionsByRole(roleName: string): Observable<GetPermissionResponse> {
    return this.http.get<GetPermissionResponse>(`${this.apiUrl}?providerName=R&providerKey=${roleName}`);
  }

  // Cập nhật lại quyền cho Role
  updatePermissions(roleName: string, data: UpdatePermissionDto): Observable<any> {
    return this.http.put(`${this.apiUrl}?providerName=R&providerKey=${roleName}`, data);
  }
}