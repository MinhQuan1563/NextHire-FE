import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';

import { PostService } from '@core/services/posts/post.service';
import { ToastService } from '@core/services/toast/toast.service';
import { PostCreateForm, PostResponse } from '@core/models/post/post.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-post-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DialogModule, InputTextareaModule,
    ButtonModule, AvatarModule, TooltipModule, DropdownModule
  ],
  templateUrl: './create-post-dialog.component.html',
  styleUrls: ['./create-post-dialog.component.scss']
})
export class CreatePostDialogComponent {
  private postService = inject(PostService);
  private toastService = inject(ToastService);

  // --- Inputs & Outputs ---
  @Input() visible: boolean = false;
  @Input() currentUserAvatar: string = '';
  @Input() currentUserName: string = 'Bạn';
  
  // Sự kiện bắn ra để báo cho Home biết đóng modal
  @Output() visibleChange = new EventEmitter<boolean>();
  
  // Sự kiện bắn data bài viết mới tạo về cho Home
  @Output() postCreated = new EventEmitter<PostResponse>();

  // --- Form Data ---
  newPostContent = '';
  selectedPrivacy = 0;
  selectedFiles: File[] = [];
  previewImages: string[] = [];
  isPosting = false;

  privacyOptions = [
    { label: 'Công khai', value: 0, icon: 'pi pi-globe' },
    { label: 'Chỉ mình tôi', value: 1, icon: 'pi pi-lock' }
  ];

  // Đóng dialog
  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.resetForm();
  }

  // Chọn file
  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.selectedFiles = [...this.selectedFiles, ...files];

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.previewImages.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  resetForm() {
    this.newPostContent = '';
    this.selectedFiles = [];
    this.previewImages = [];
    this.selectedPrivacy = 0;
  }

  submitPost() {
    if (!this.newPostContent.trim() && this.selectedFiles.length === 0) return;

    this.isPosting = true;
    const payload: PostCreateForm = {
      content: this.newPostContent,
      privacy: this.selectedPrivacy,
      images: this.selectedFiles
    };

    this.postService.createPost(payload)
      .pipe(finalize(() => this.isPosting = false))
      .subscribe({
        next: (res) => {
          this.toastService.success('Thành công', 'Đăng bài viết mới thành công');
          this.postCreated.emit(res);
          this.close();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Lỗi', 'Không thể đăng bài viết');
        }
      });
  }
}