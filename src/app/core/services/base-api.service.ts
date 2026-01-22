import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PagedResultDto } from '@core/models/page.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService<T> {
  protected baseUrl = environment.apiUrl;
  protected abstract get resourceUrl(): string;

  constructor(protected http: HttpClient) { }

  // Hàm tạo URL đầy đủ
  protected getUrl(endpoint?: string): string {
    return `${this.baseUrl}/${this.resourceUrl}${endpoint ? '/' + endpoint : ''}`;
  }

  // Dùng chung cho cả Cursor và Offset Pagination
  protected buildHttpParams(data: { [key: string]: any }): HttpParams {
    let params = new HttpParams();
    if (data) {
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
             value.forEach(val => params = params.append(key, val));
          } else {
             params = params.append(key, value);
          }
        }
      });
    }
    return params;
  }

  getList(params?: any): Observable<PagedResultDto<T>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<PagedResultDto<T>>(this.getUrl(), { params: httpParams });
  }

  getById(id: string): Observable<T> {
    return this.http.get<T>(this.getUrl(id));
  }

  create(data: any): Observable<T> {
    return this.http.post<T>(this.getUrl(), data);
  }

  update(id: string, data: any): Observable<T> {
    return this.http.put<T>(this.getUrl(id), data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.getUrl(id));
  }
}
