import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { PostActionsComponent } from '../post-actions/post-actions.component'; 
import { PostResponse } from '@app/models/post/post.model';

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
  @Input() post!: PostResponse;

  postMenuItems: MenuItem[];
  selectedPostId: string | null = null;

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
    // Logic xử lý command cho menu items
  }

  // Hàm xử lý khi nhấn vào action (ví dụ like)
  // Cập nhật type để postId chấp nhận string | number, khớp với $event từ PostActionsComponent
  handlePostAction(action: { type: string, postId: string | number }) {
    console.log(`Action '${action.type}' triggered for post ID: ${action.postId}`);
    // Logic xử lý (like, comment,...)
    // Nếu cần, bạn có thể cast postId thành string: const postIdStr = action.postId.toString();
  }

  // Helper: Lấy ảnh đầu tiên nếu có (có thể mở rộng thành gallery cho nhiều ảnh)
  getFirstImageUrl(): string | null {
    return this.post.imageBase64s && this.post.imageBase64s.length > 0 ? this.post.imageBase64s[0] : null;
  }
}