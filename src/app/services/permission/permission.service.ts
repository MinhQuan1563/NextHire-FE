import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  public grantedPolicies = signal<Record<string, boolean>>({});

  constructor(private http: HttpClient) {}

  public loadPermissions() {
    this.http.get<any>(`${environment.apiBaseUrl}/api/abp/application-configuration`)
      .subscribe({
        next: (res) => {
          if (res?.auth?.grantedPolicies) {
            this.grantedPolicies.set(res.auth.grantedPolicies);
          }
        },
        error: (err) => console.error('Lỗi tải quyền ABP:', err)
      });
  }

  // Hàm kiểm tra xem user có quyền không
  public hasPermission(policyName: string): boolean {
    return !!this.grantedPolicies()[policyName];
  }

  // Xóa quyền khi đăng xuất
  public clearPermissions() {
    this.grantedPolicies.set({});
  }
}