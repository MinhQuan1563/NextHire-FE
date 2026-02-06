import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { AppUser } from '@app/models/app-user/app-user.model';

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

  getCurrentUser(userCode: string): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.getUrl()}/${userCode}`);
  }
}
