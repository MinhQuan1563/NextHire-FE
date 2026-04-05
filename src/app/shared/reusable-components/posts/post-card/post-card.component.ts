import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { PostActionsComponent } from '../post-actions/post-actions.component';
import { PostResponse } from '@app/models/post/post.model';
import { PostCommentComponent } from '../post-comment/post-comment.component';
import { DialogModule } from 'primeng/dialog';
import { PostLikeComponent } from '../post-like/post-like.component';
import { AppUser } from '@app/models/app-user/app-user.model';
import { AppUserService } from '@app/services/app-user/app-user.service';
import { AuthService } from '@app/services/auth/auth.service';
import { FriendshipService } from '@app/services/user-profile/friendship.service';
import { ToastService } from '@app/services/toast/toast.service';
import { PostService } from '@app/services/posts/post.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    ButtonModule,
    MenuModule,
    DatePipe,
    PostActionsComponent,
    PostCommentComponent,
    DialogModule,
    PostLikeComponent
  ],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent implements OnInit {
  @Input() post!: PostResponse;
  @Output() onHidePost = new EventEmitter<string>();
  @Output() onUnfollow = new EventEmitter<string>();

  postMenuItems: MenuItem[] = [];
  postAuthor: AppUser | null = null;
  selectedPostId: string | null = null;
  currentUserCode: string = '';

  // Visibility states
  showComments = false;
  showLikes = false;
  canViewPost = true;

  constructor(
    private appUserService: AppUserService,
    private authService: AuthService,
    private friendshipService: FriendshipService,
    private toastService: ToastService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.currentUserCode = this.authService.getUserCodeFromToken() || '';

    if (this.post && this.post.userCode) {
      this.appUserService.getUser(this.post.userCode).subscribe({
        next: (userData: AppUser) => {
          this.postAuthor = userData;
        },
        error: (err) => {
          console.error('Lỗi khi tải thông tin người dùng:', err);
        }
      });
    }

    // Check Permission to View Post
    this.checkPrivacyView();
    // Update menu items based on post data
    this.updateMenuItems();
  }

  updateMenuItems() {
    this.postMenuItems = [
      {
        label: this.post.isSaved ? 'Unsave post' : 'Save post',
        icon: this.post.isSaved ? 'pi pi-bookmark-fill' : 'pi pi-bookmark',
        command: () => this.toggleSave()
      },
      { label: 'Hide post', icon: 'pi pi-eye-slash', command: () => this.hidePost() },
      { label: 'Report post', icon: 'pi pi-flag', command: () => this.reportPost() },
      { label: 'Unfollow', icon: 'pi pi-user-minus', command: () => this.unfollow() }
    ];
  }

  toggleSave() {
    const previousState = this.post.isSaved;
    this.post.isSaved = !previousState;
    this.updateMenuItems();

    this.postService.toggleSavePost(this.post.postCode).subscribe({
      next: (isSavedNow) => {
        const title = isSavedNow ? 'Post Saved' : 'Post Unsaved';
        const msg = isSavedNow ? 'Saved to your bookmarks' : 'Removed from your bookmarks';
        this.toastService.showSuccess(title, msg);

        if (this.post.isSaved !== isSavedNow) {
          this.post.isSaved = isSavedNow;
          this.updateMenuItems();
        }
      },
      error: (err) => {
        this.post.isSaved = previousState;
        this.updateMenuItems();
        this.toastService.showError('Error Post Saved', 'Something went wrong. Please try again.');
        console.error('Error toggling save state:', err);
      }
    });
  }

  hidePost() {
    this.onHidePost.emit(this.post.postCode);
  }

  reportPost() {
    this.toastService.showInfo('Report Submitted', 'Thank you for reporting. We will review this post.');
  }

  unfollow() {
    alert('Unfollow feature is not implemented yet.');
  }

  checkPrivacyView(): void {
    if (this.post.privacy === 1) {
      this.canViewPost = true;
    } 
    else if (this.post.privacy === 2) {
      if (this.currentUserCode === this.post.userCode) {
        this.canViewPost = true;
      } 
      else {
        this.canViewPost = false;
        
        this.friendshipService.getFriendshipStatus(this.currentUserCode).subscribe({
          next: (friends: any) => {
            const isFriend = friends.some((f: any) => f.userCode === this.post.userCode);
            this.canViewPost = isFriend;
          },
          error: (err) => {
            console.error('Error fetching friendship status:', err);
            this.canViewPost = false;
          }
        });
      }
    } 
    else if (this.post.privacy === 3) {
       this.canViewPost = this.currentUserCode === this.post.userCode;
    }
  }

  showPostMenu(menu: any, event: Event, postId: string): void {
    this.selectedPostId = postId;
    menu.toggle(event);
    event.stopPropagation();
  }

  // handlePostAction(action: { type: string, postId: string }) {
  //   if (action.type === 'comment') {
  //     this.showComments = !this.showComments;
  //   }
  //   else if (action.type === 'like') {
  //     this.showLikes = !this.showLikes;
  //   }
  // }

  onLikeUpdated(newLikeCount: number) {
    this.post.likeCount = newLikeCount;
  }

  getFirstImageUrl(): string | null {
    return this.post.imageBase64s && this.post.imageBase64s.length > 0 ? this.post.imageBase64s[0] : null;
  }
}