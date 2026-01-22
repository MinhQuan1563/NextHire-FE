import { Injectable } from '@angular/core';
import { BaseApiService } from '../base-api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostLike, CreatePostLike } from '@core/models/post/post-like.model';

@Injectable({
  providedIn: 'root'
})
export class PostLikeService extends BaseApiService<PostLike> {
  protected get resourceUrl(): string {
    return 'PostLike';
  }

  constructor(http: HttpClient) {
    super(http);
  }

  likePost(data: CreatePostLike): Observable<PostLike> {
    return this.http.post<PostLike>(this.getUrl('like'), data);
  }

  unlikePost(postCode: string): Observable<boolean> {
    const params = this.buildHttpParams({ postCode });
    return this.http.delete<boolean>(this.getUrl('unlike'), { params });
  }

  checkLikeStatus(postCode: string): Observable<{ hasLiked: boolean }> {
    const params = this.buildHttpParams({ postCode });
    return this.http.get<{ hasLiked: boolean }>(this.getUrl('check'), { params });
  }

  getLikesByPost(postCode: string, limit: number = 10, lastCreateAt?: string, lastLikeId?: string): Observable<PostLike[]> {
    const queryPayload = { postCode, limit, lastCreateAt, lastLikeId };
    const params = this.buildHttpParams(queryPayload);
    return this.http.get<PostLike[]>(this.getUrl('list'), { params });
  }
}