import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { AvatarModule } from 'primeng/avatar';
import { PostService } from '@core/services/posts/post.service';
import { AuthService } from '@core/services/auth/auth.service';
import { PostResponse } from '@core/models/post/post.model';
import { InfoSidebarComponent } from '@shared/reusable-components/info-sidebar/info-sidebar.component';
import { PostCardComponent } from '@shared/reusable-components/post-card/post-card.component';
import { CreatePostDialogComponent } from '@shared/reusable-components/create-post-dialog/create-post-dialog.component';
import { ToastService } from '@core/services/toast/toast.service';
import { AppUser } from '@core/models/app-user/app-user.model';
import { AppUserService } from '@core/services/app-user/app-user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, InfoSidebarComponent, PostCardComponent,
    CreatePostDialogComponent, AvatarModule, ToastModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(
    private postService: PostService,
    private authService: AuthService,
    private toastService: ToastService,
    private appUserService: AppUserService

  ) {}

  feedPosts: PostResponse[] = []; 
  currentUserCode = '';
  currentUser: AppUser | null = null;

  pageSize = 10;
  lastCreatedAt?: string;
  lastPostCode?: string;

  isLoading = false;
  hasMore = true;
  showCreateModal = false;

  ngOnInit() {
    this.currentUserCode = this.authService.getUserCodeFromToken() || '';
    
    if (this.currentUserCode) {
      this.appUserService.getCurrentUser(this.currentUserCode).subscribe({
        next: (user: AppUser) => {
          this.currentUser = user;
          this.loadFeeds();
        },
        error: (err) => {
          console.error('Lỗi khi lấy thông tin người dùng:', err);
        }
      });
    } 
    else {
      console.error('Không tìm thấy Người dùng. Vui lòng đăng nhập lại.');
    }
  }

  loadFeeds() {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;

    this.postService.getHomeFeed(this.currentUserCode, this.pageSize, this.lastCreatedAt, this.lastPostCode)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res: PostResponse[]) => {
          if (res && res.length > 0) {
            this.feedPosts = [...this.feedPosts, ...res];

            const lastPost = res[res.length - 1];
            this.lastCreatedAt = lastPost.createdAt;
            this.lastPostCode = lastPost.postCode;

            if (res.length < this.pageSize) {
              this.hasMore = false;
            }
          } 
          else {
            this.hasMore = false;
          }
        },
        error: (err) => console.error('Lỗi tải feed:', err)
      });
  }

  loadMore() {
    this.loadFeeds();
  }

  onPostCreated(newPostDto: PostResponse) {
    this.feedPosts = [newPostDto, ...this.feedPosts];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}