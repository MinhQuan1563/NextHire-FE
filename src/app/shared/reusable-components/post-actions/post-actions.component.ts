// import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ButtonModule } from 'primeng/button';

// @Component({
//   selector: 'app-post-actions',
//   standalone: true,
//   imports: [CommonModule, ButtonModule],
//   templateUrl: './post-actions.component.html',
//   styleUrls: ['./post-actions.component.scss']
// })
// export class PostActionsComponent {
//   @Input() postId!: string | number;
//   @Input() liked: boolean = false;

//   @Output() action = new EventEmitter<{ type: string, postId: string | number }>();

//   triggerAction(type: string): void {
//     this.action.emit({ type, postId: this.postId });
//     if (type === 'like') {
//         this.liked = !this.liked;
//     }
//   }
// }

// post-actions.component.ts (cập nhật)
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PostLikeService } from '@core/services/posts/post-like.service';
import { CreatePostLike } from '@core/models/post/post-like.model';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-post-actions',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './post-actions.component.html',
  styleUrls: ['./post-actions.component.scss']
})
export class PostActionsComponent implements OnInit {
  @Input() postId!: string;
  @Input() likeCount!: number;
  @Output() action = new EventEmitter<{ type: string, postId: string }>();
  @Output() likeUpdated = new EventEmitter<number>();

  hasLiked = false;
  currentUserCode = '';

  constructor(private likeService: PostLikeService, private authService: AuthService) {}

  ngOnInit() {
    const code = this.authService.getUserCodeFromToken() || '';

    if (code) {
      this.currentUserCode = code;
      this.checkLikeStatus();
    } 
    else {
      console.error('Không tìm thấy UserCode trong token. Vui lòng đăng nhập lại.');
    }
  }

  checkLikeStatus() {
    this.likeService.checkLikeStatus(this.postId).subscribe({
      next: (res) => this.hasLiked = res.hasLiked,
      error: (err) => console.error('Error checking like:', err)
    });
  }

  toggleLike() {
    if (this.hasLiked) {
      this.likeService.unlikePost(this.postId).subscribe({
        next: () => {
          this.hasLiked = false;
          this.likeUpdated.emit(--this.likeCount);
          this.action.emit({ type: 'unlike', postId: this.postId });
        },
        error: (err) => console.error('Error unliking:', err)
      });
    } else {
      const dto: CreatePostLike = { postCode: this.postId, type: 1 };
      this.likeService.likePost(dto).subscribe({
        next: () => {
          this.hasLiked = true;
          this.likeUpdated.emit(++this.likeCount);
          this.action.emit({ type: 'like', postId: this.postId });
        },
        error: (err) => console.error('Error liking:', err)
      });
    }
  }

  onComment() {
    this.action.emit({ type: 'comment', postId: this.postId });
  }

  onShare() {
    this.action.emit({ type: 'share', postId: this.postId });
  }
}