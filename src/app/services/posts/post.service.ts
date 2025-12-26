import { Injectable } from '@angular/core';
import { BaseApiService } from '../base-api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostCreateForm, PostResponse, PostUpdateForm } from '@app/models/post/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService extends BaseApiService<PostResponse> {
  protected get resourceUrl(): string {
    return 'Post';
  }

  constructor(http: HttpClient) {
    super(http);
  }

  override getById(code: string): Observable<PostResponse> {
    // Sử dụng helper mới từ Base
    const params = this.buildHttpParams({ code });
    return this.http.get<PostResponse>(this.getUrl(), { params });
  }

  deletePost(code: string): Observable<boolean> {
    const params = this.buildHttpParams({ code });
    return this.http.delete<boolean>(this.getUrl(), { params });
  }

  getListCursor(pageSize: number, lastCreatedAt?: string, lastPostCode?: string): Observable<PostResponse[]> {
    const queryPayload = {
      pageSize,
      lastCreatedAt,
      lastPostCode
    };

    const params = this.buildHttpParams(queryPayload);

    return this.http.get<PostResponse[]>(this.getUrl('List'), { params });
  }

  getHomeFeed(userCode: string, pageSize: number, lastCreatedAt?: string, lastPostCode?: string): Observable<PostResponse[]> {
    const queryPayload = {
      userCode,
      pageSize,
      lastCreatedAt,
      lastPostCode
    };
    const params = this.buildHttpParams(queryPayload);
    return this.http.get<PostResponse[]>(this.getUrl('feeds'), { params });
  }

  getMyFeed(userCode: string, pageSize: number, lastCreatedAt?: string, lastPostCode?: string): Observable<PostResponse[]> {
    const queryPayload = {
      userCode,
      pageSize,
      lastCreatedAt,
      lastPostCode
    };
    const params = this.buildHttpParams(queryPayload);
    return this.http.get<PostResponse[]>(this.getUrl('feeds/me'), { params });
  }

  createPost(data: PostCreateForm): Observable<PostResponse> {
    const formData = new FormData();
    if (data.content) formData.append('Content', data.content);
    formData.append('Privacy', data.privacy.toString());
    
    if (data.images && data.images.length > 0) {
      data.images.forEach(file => {
        formData.append('Images', file);
      });
    }
    return this.http.post<PostResponse>(this.getUrl(), formData);
  }

  updatePost(data: PostUpdateForm): Observable<PostResponse> {
    const formData = new FormData();
    formData.append('PostCode', data.postCode);
    if (data.content) formData.append('Content', data.content);
    if (data.privacy !== undefined) formData.append('Privacy', data.privacy.toString());

    if (data.images && data.images.length > 0) {
      data.images.forEach(file => {
        formData.append('Images', file);
      });
    }
    return this.http.put<PostResponse>(this.getUrl(), formData);
  }
}
