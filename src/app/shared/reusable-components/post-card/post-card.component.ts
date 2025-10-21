import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { PostActionsComponent } from '../post-actions/post-actions.component'; 


export interface PostData {
  id: string | number;
  userAvatar?: string;
  userInitial?: string;
  userName: string;
  userTitle?: string; 
  postedTime: Date;
  content: string; 
  imageUrl?: string; 
  likeCount: number;
  commentCount: number;
  repostCount?: number; 
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    ButtonModule,
    MenuModule,
    DatePipe,
    PostActionsComponent
  ],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent {
  @Input() post!: PostData;

  postMenuItems: MenuItem[];
  selectedPostId: string | number | null = null;

  constructor() {
    this.postMenuItems = [
      { label: 'Lưu bài viết', icon: 'pi pi-bookmark' },
      { label: 'Ẩn bài viết', icon: 'pi pi-eye-slash' },
      { label: 'Báo cáo bài viết', icon: 'pi pi-flag' },
      { separator: true },
      { label: 'Bỏ theo dõi', icon: 'pi pi-user-minus' }
    ];
  }

  showPostMenu(menu: any, event: Event, postId: string | number): void {
    this.selectedPostId = postId;
    menu.toggle(event);
    event.stopPropagation();
    // logic xử lý command cho menu items nếu cần
  }

  // Hàm xử lý khi nhấn vào action (ví dụ like)
  handlePostAction(action: { type: string, postId: string | number }) {
      console.log(`Action '${action.type}' triggered for post ID: ${action.postId}`);
      // logic xử lý (like, comment,...)
  }
}