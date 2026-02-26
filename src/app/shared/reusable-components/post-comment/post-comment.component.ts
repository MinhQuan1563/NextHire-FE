import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CreatePostComment, PostComment } from '@app/models/post/post-comment.model';
import { PostCommentService } from '@app/services/posts/post-comment.service';
import { AuthService } from '@app/services/auth/auth.service';
import { AvatarModule } from 'primeng/avatar';
import { InputRichControlComponent } from '../input-rich-control/input-rich-control.component';

@Component({
  selector: 'app-post-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, 
    InputTextareaModule, AvatarModule, InputRichControlComponent],
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.scss']
})
export class PostCommentComponent implements OnInit {
  @Input() postCode!: string;

  comments: PostComment[] = [];
  newCommentContent = '';
  replyingTo: string | null = null;
  replyContent = '';
  pageSize = 5;
  lastCreateAt?: string;
  lastCommentId?: string;
  isLoading = false;
  hasMore = true;
  currentUserCode = '';

  constructor(private commentService: PostCommentService, private authService: AuthService) {}

  ngOnInit() {
    const code = this.authService.getUserCodeFromToken() || '';

    if (code) {
      this.currentUserCode = code;
      this.loadComments();
    } 
    else {
      console.error('Không tìm thấy UserCode trong token. Vui lòng đăng nhập lại.');
    }
  }

  loadComments(loadMore = false) {
    if (!loadMore) {
      this.hasMore = true;
      this.lastCreateAt = undefined;
      this.lastCommentId = undefined;
    }

    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    console.log('Loading comments for postCode:', this.postCode);

    this.commentService.getCommentsByPost(this.postCode, this.pageSize, this.lastCreateAt, this.lastCommentId)
      .subscribe({
        next: (newComments) => {
          if (loadMore) {
            // 1. LỌC TRÙNG LẶP: Chỉ lấy những comment mới chưa từng có trong mảng
            const uniqueNewComments = newComments.filter(
              (newC) => !this.comments.some((oldC) => oldC.commentId === newC.commentId)
            );

            this.comments = [...this.comments, ...uniqueNewComments];

            // 2. CHẶN VÒNG LẶP: Nếu API trả về toàn comment cũ (unique = 0) hoặc trả về ít hơn pageSize -> Chắc chắn hết data mới!
            if (uniqueNewComments.length === 0 || newComments.length < this.pageSize) {
              this.hasMore = false;
            } else {
              this.hasMore = true;
            }
          } else {
            // Load lần đầu tiên
            this.comments = newComments;
            this.hasMore = newComments.length === this.pageSize;
          }

          // Cập nhật lại con trỏ (Cursor) cho lần gọi API tiếp theo
          if (newComments.length > 0) {
            const last = newComments[newComments.length - 1];
            this.lastCreateAt = last.createAt;
            this.lastCommentId = last.commentId;
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading comments:', err);
          this.isLoading = false;
        }
      });
  }

  loadMore() {
    this.loadComments(true);
  }

  createComment() {
    if (!this.newCommentContent.trim()) return;
    const dto: CreatePostComment = { postCode: this.postCode, content: this.newCommentContent };
    this.commentService.createComment(dto).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.newCommentContent = '';
      },
      error: (err) => console.error('Error creating comment:', err)
    });
  }

  onCommentSubmit(content: string) {
    this.newCommentContent = content;
    this.createComment();
  }

  startReply(commentId: string) {
    this.replyingTo = commentId;
    this.replyContent = '';
  }

  cancelReply() {
    this.replyingTo = null;
    this.replyContent = '';
  }

  replyComment(parentId: string) {
    if (!this.replyContent.trim()) return;
    const dto: CreatePostComment = { parentId, postCode: this.postCode, content: this.replyContent };
    this.commentService.createComment(dto).subscribe({
      next: (reply) => {
        const parent = this.comments.find(c => c.commentId === parentId);
        if (parent) parent.childCommentCount++;
        this.cancelReply();
      },
      error: (err) => console.error('Error replying:', err)
    });
  }

  deleteComment(commentId: string) {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.commentId !== commentId);
      },
      error: (err) => console.error('Error deleting comment:', err)
    });
  }

  // Helper: Load replies (có thể mở rộng nếu cần)
  loadReplies(parentId: string) {
    // Implement nếu cần load replies riêng
  }
}