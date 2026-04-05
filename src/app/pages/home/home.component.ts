import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '@app/services/auth/auth.service';
import { PostResponse } from '@app/models/post/post.model';
import { InfoSidebarComponent } from '@shared/reusable-components/info-sidebar/info-sidebar.component';
import { PostService } from '@app/services/posts/post.service';
import { ToastService } from '@app/services/toast/toast.service';
import { AppUserService } from '@app/services/app-user/app-user.service';
import { AppUser } from '@app/models/app-user/app-user.model';
import { PostCardComponent } from '@shared/reusable-components/posts/post-card/post-card.component';
import { CreatePostDialogComponent } from '@shared/reusable-components/posts/create-post-dialog/create-post-dialog.component';
import { SkeletonModule } from 'primeng/skeleton';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, InfoSidebarComponent, PostCardComponent,
    CreatePostDialogComponent, AvatarModule, ToastModule,
    SkeletonModule, HasPermissionDirective
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
  isInitialLoading = true;

  ngOnInit() {
    this.currentUserCode = this.authService.getUserCodeFromToken() || '';
    
    if (this.currentUserCode) {
      this.appUserService.getUser(this.currentUserCode).subscribe({
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
      .pipe(finalize(() => {
        this.isLoading = false;
        this.isInitialLoading = false;
      }))
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

  handleHidePost(postCode: string) {
    const targetPost = this.feedPosts.find(p => p.postCode === postCode);
    
    if (targetPost) {
      targetPost.isHidden = true; 

      this.postService.hidePost(postCode).subscribe({
        next: () => {},
        error: (err) => {
          targetPost.isHidden = false; 
          this.toastService.showError('Error', 'Could not hide post.');
          console.error('Hide post failed', err);
        }
      });
    }
  }

  undoHidePost(post: PostResponse) { 
    post.isHidden = false; 

    this.postService.unhidePost(post.postCode).subscribe({
      next: () => {},
      error: (err) => {
        post.isHidden = true; 
        this.toastService.showError('Error', 'Could not undo hide post.');
        console.error('Undo hide post failed', err);
      }
    });
  }
}