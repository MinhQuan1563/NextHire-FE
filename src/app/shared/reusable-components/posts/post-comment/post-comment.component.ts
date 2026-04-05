import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CreatePostComment, PostComment } from '@app/models/post/post-comment.model';
import { PostCommentService } from '@app/services/posts/post-comment.service';
import { AuthService } from '@app/services/auth/auth.service';
import { AvatarModule } from 'primeng/avatar';
import { InputRichControlComponent } from '@shared/reusable-components/input-rich-control/input-rich-control.component';
import { ConfirmationService } from 'primeng/api';

export interface UIComment extends PostComment {
  replies?: UIComment[];
  isLoadingReplies?: boolean;
  repliesLoaded?: boolean;
}

@Component({
  selector: 'app-post-comments',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, 
    InputTextareaModule, AvatarModule,
    InputRichControlComponent
  ],
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.scss']
})

export class PostCommentComponent implements OnInit {
  @Input() postCode!: string;

  comments: UIComment[] = [];
  newCommentContent = '';
  replyingTo: string | null = null;
  replyContent = '';
  pageSize = 10;
  lastCreateAt?: string;
  lastCommentId?: string;
  isLoading = false;
  hasMore = true;
  currentUserCode = '';

  constructor(
    private commentService: PostCommentService, 
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) {}

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

    if (this.isLoading || !this.hasMore) {
      return;
    }

    this.isLoading = true;
    this.commentService.getCommentsByPost(this.postCode, this.pageSize, this.lastCreateAt, this.lastCommentId)
      .subscribe({
        next: (newComments) => {
          if (loadMore) {
            this.comments = [...this.comments, ...newComments];
          } 
          else {
            this.comments = newComments;
          }

          this.hasMore = newComments.length === this.pageSize;
          
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
        if (parent) {
          parent.childCommentCount++;
          if (!parent.replies) {
            parent.replies = [];
          }
          parent.replies.unshift(reply);
        }
        this.cancelReply();
      },
      error: (err) => console.error('Error replying:', err)
    });
  }

  loadReplies(parent: UIComment) {
    if (parent.isLoadingReplies) return;
    
    parent.isLoadingReplies = true;
    
    this.commentService.getChildComments(parent.commentId, 10).subscribe({
      next: (replies: PostComment[]) => {
        parent.replies = replies;
        parent.repliesLoaded = true;
        parent.isLoadingReplies = false;
      },
      error: (err) => {
        console.error('Lỗi tải replies', err);
        parent.isLoadingReplies = false;
      }
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

  confirmDelete(commentId: string) {
  this.confirmationService.confirm({
    message: 'Are you sure you want to delete this comment?',
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle text-red-500',
    acceptButtonStyleClass: 'p-button-danger p-button-sm border-round-md shadow-1 hover:shadow-2 transition-all',
    rejectButtonStyleClass: 'p-button-text p-button-plain p-button-sm text-600 hover:text-900 hover:surface-200 border-round-md transition-all mr-3',
    
    accept: () => {
      this.executeDelete(commentId);
    }
  });
}

  executeDelete(commentId: string) {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        const initialLength = this.comments.length;
        this.comments = this.comments.filter(c => c.commentId !== commentId);

        if (this.comments.length === initialLength) {
          this.comments.forEach(parent => {
            if (parent.replies && parent.replies.some(r => r.commentId === commentId)) {
              parent.replies = parent.replies.filter(r => r.commentId !== commentId);
              parent.childCommentCount = Math.max(0, parent.childCommentCount - 1); 
            }
          });
        }
      },
      error: (err) => console.error('Error deleting comment:', err)
    });
  }

  getVnTime(utcString: string): Date | null {
    if (!utcString) return null;

    let cleanStr = utcString.replace(/Z/ig, '');
    cleanStr = cleanStr.split('.')[0];
    
    return new Date(cleanStr + 'Z');
  }
}