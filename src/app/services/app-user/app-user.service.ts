import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { AppUser, GetUsersInput } from '@app/models/app-user/app-user.model';
import { PagedResultDto } from '@app/models/page.model';

@Injectable({
  providedIn: 'root'
})
export class AppUserService extends BaseApiService<AppUser> {
  protected get resourceUrl(): string {
    return 'AppUser';
  }

  constructor(http: HttpClient) {
    super(http);
  }

  getUser(userCode: string): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.getUrl()}/${userCode}`);
  }
  
  toggleLockUser(userCode: string, isLocked: boolean): Observable<void> {
    return this.http.post<void>(`${this.getUrl()}/toggle-lock?userCode=${userCode}&isLocked=${isLocked}`, {});
  }

  getUsers(input: GetUsersInput): Observable<PagedResultDto<AppUser>> {
    let params = new HttpParams()
      .set('skipCount', input.skipCount.toString())
      .set('maxResultCount', input.maxResultCount.toString());

    if (input.filter) {
      params = params.set('Filter', input.filter);
    }
    
    if (input.isLocked !== undefined && input.isLocked !== null) {
      params = params.set('IsLocked', input.isLocked.toString());
    }

    // Kết quả URL sẽ trông giống: /api/AppUser/list?skipCount=0&maxResultCount=10&Filter=minhquan
    return this.http.get<PagedResultDto<AppUser>>(`${this.getUrl()}/list`, { params });
  }
}
