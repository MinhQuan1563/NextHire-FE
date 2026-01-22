import { Injectable } from '@angular/core';
import { BaseApiService } from '../base-api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostComment, CreatePostComment } from '@core/models/post/post-comment.model';

@Injectable({
  providedIn: 'root'
})
export class PostCommentService extends BaseApiService<PostComment> {
  protected get resourceUrl(): string {
    return 'post-comments';
  }

  constructor(http: HttpClient) {
    super(http);
  }

  createComment(data: CreatePostComment): Observable<PostComment> {
    return this.http.post<PostComment>(this.getUrl('comment'), data);
  }

  deleteComment(commentId: string): Observable<boolean> {
    const params = this.buildHttpParams({ commentId });
    return this.http.delete<boolean>(this.getUrl('comment'), { params });
  }

  getCommentsByPost(postCode: string, limit: number = 10, lastCreateAt?: string, lastCommentId?: string): Observable<PostComment[]> {
    const queryPayload = { postCode, limit, lastCreateAt, lastCommentId };
    const params = this.buildHttpParams(queryPayload);
    return this.http.get<PostComment[]>(this.getUrl('post'), { params });
  }

  getChildComments(parentId: string, limit: number = 10, lastCreateAt?: string, lastCommentId?: string): Observable<PostComment[]> {
    const queryPayload = { parentId, limit, lastCreateAt, lastCommentId };
    const params = this.buildHttpParams(queryPayload);
    return this.http.get<PostComment[]>(this.getUrl('comment/children'), { params });
  }
}