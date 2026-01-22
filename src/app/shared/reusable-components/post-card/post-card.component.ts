// post-card.component.ts (cập nhật)
import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { PostResponse } from '@core/models/post/post.model';
import { PostActionsComponent } from '../post-actions/post-actions.component';
import { PostCommentComponent } from '../post-comment/post-comment.component';

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
    PostCommentComponent
  ],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent {
  @Input() post!: PostResponse;

  postMenuItems: MenuItem[];
  selectedPostId: string | null = null;
  showComments = false;

  constructor() {
    this.postMenuItems = [
      { label: 'Lưu bài viết', icon: 'pi pi-bookmark' },
      { label: 'Ẩn bài viết', icon: 'pi pi-eye-slash' },
      { label: 'Báo cáo bài viết', icon: 'pi pi-flag' },
      { separator: true },
      { label: 'Bỏ theo dõi', icon: 'pi pi-user-minus' }
    ];
  }

  showPostMenu(menu: any, event: Event, postId: string): void {
    this.selectedPostId = postId;
    menu.toggle(event);
    event.stopPropagation();
  }

  handlePostAction(action: { type: string, postId: string }) {
    console.log(`Action '${action.type}' triggered for post ID: ${action.postId}`);
    if (action.type === 'comment') {
      this.showComments = !this.showComments;
    }
  }

  onLikeUpdated(newLikeCount: number) {
    this.post.likeCount = newLikeCount;
  }

  getFirstImageUrl(): string | null {
    return this.post.imageBase64s && this.post.imageBase64s.length > 0 ? this.post.imageBase64s[0] : null;
  }
}