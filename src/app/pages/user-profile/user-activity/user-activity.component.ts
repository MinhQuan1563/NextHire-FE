import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';

import { AuthService } from '@app/services/auth/auth.service';
import { PostService } from '@app/services/posts/post.service';
import { ToastService } from '@app/services/toast/toast.service';
import { AppUserService } from '@app/services/app-user/app-user.service';

import { AppUser } from '@app/models/app-user/app-user.model';
import { PostResponse } from '@app/models/post/post.model';

import { InfoSidebarComponent } from '@shared/reusable-components/info-sidebar/info-sidebar.component';
import { PostCardComponent } from '@shared/reusable-components/posts/post-card/post-card.component';
import { PostLikeService } from '@app/services/posts/post-like.service';

@Component({
  selector: 'app-user-activity',
  standalone: true,
  imports: [
    CommonModule, InfoSidebarComponent, PostCardComponent, 
    ToastModule, SkeletonModule  
  ],
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss']
})
export class UserActivityComponent implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private appUserService = inject(AppUserService);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);
  private postLikeService = inject(PostLikeService);

  // States
  currentUserCode = '';
  currentUser: AppUser | null = null;
  
  // Tab management
  activeTab: 'POSTS' | 'REACTIONS' = 'POSTS';

  // Pagination
  feedPosts: PostResponse[] = [];
  pageSize = 10;
  lastCreatedAt?: string;
  lastPostCode?: string;

  isLoading = false;
  hasMore = true;
  isInitialLoading = true;

  ngOnInit() {
    this.currentUserCode = this.authService.getUserCodeFromToken() || '';
    
    if (this.currentUserCode) {
      this.appUserService.getUser(this.currentUserCode)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (user: AppUser) => {
            this.currentUser = user;
            this.loadData();
          },
          error: (err) => console.error('Error fetching user information:', err)
        });
    } 
    else {
      console.error('User not found. Please log in again.');
    }
  }

  // --- SWITCH TAB ---
  switchTab(tab: 'POSTS' | 'REACTIONS') {
    if (this.activeTab === tab) return;
    
    this.activeTab = tab;
    this.resetState();
    this.loadData();
  }

  resetState() {
    this.feedPosts = [];
    this.lastCreatedAt = undefined;
    this.lastPostCode = undefined;
    this.hasMore = true;
    this.isInitialLoading = true;
  }

  loadData() {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;

    const request$ = this.activeTab === 'POSTS'
      ? this.postService.getMyFeed(this.currentUserCode, this.pageSize, this.lastCreatedAt, this.lastPostCode)
      : this.postService.getMyReactedPosts(this.pageSize, this.lastCreatedAt, this.lastPostCode);

    request$
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
        error: (err) => console.error('Error loading activity:', err)
      });
  }

  loadMore() {
    this.loadData();
  }

  // --- HIDE / UNHIDE POST ---
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

  // Go back to Profile page
  goBack() {
    this.location.back();
  }
}