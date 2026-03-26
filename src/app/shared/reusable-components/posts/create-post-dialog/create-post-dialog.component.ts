import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';

import { finalize } from 'rxjs/operators';
import { PostService } from '@app/services/posts/post.service';
import { ToastService } from '@app/services/toast/toast.service';
import { PostCreateForm, PostResponse } from '@app/models/post/post.model';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { SafePipe } from '@shared/pipes/safe.pipe';
import { LocationSearchComponent } from '@shared/reusable-components/location-search/location-search.component';

@Component({
  selector: 'app-create-post-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DialogModule, InputTextareaModule,
    ButtonModule, AvatarModule, TooltipModule, DropdownModule,
    OverlayPanelModule, PickerComponent, LocationSearchComponent,
    SafePipe
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
  @Input() currentUserName: string = 'You';
  
  // Sự kiện bắn ra để báo cho Home biết đóng modal
  @Output() visibleChange = new EventEmitter<boolean>();
  
  // Sự kiện bắn data bài viết mới tạo về cho Home
  @Output() postCreated = new EventEmitter<PostResponse>();

  // --- Form Data ---
  newPostContent = '';
  selectedPrivacy = 1;
  selectedFiles: File[] = [];
  previewImages: string[] = [];
  isPosting = false;
  currentView: 'main' | 'location' = 'main';
  selectedLocation: any = null;

  privacyOptions = [
    { label: 'Public', value: 1, icon: 'pi pi-globe' },
    { label: 'Friends', value: 2, icon: 'pi pi-users' },
    { label: 'Only Me', value: 3, icon: 'pi pi-lock' }
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

  openLocationSearch() {
    this.currentView = 'location';
  }

  removeLocation() {
    this.selectedLocation = null;
  }

  // Hàm hứng sự kiện từ Component con
  onLocationSelected(locationData: any) {
    this.selectedLocation = locationData;
    this.currentView = 'main';
  }

  backToMain() {
    this.currentView = 'main';
  }

  removeImage(index: number) {
    this.previewImages.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  resetForm() {
    this.newPostContent = '';
    this.selectedFiles = [];
    this.previewImages = [];
    this.selectedPrivacy = 1;
    
    this.selectedLocation = null; 
    this.currentView = 'main';
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    this.newPostContent += emoji;
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
          this.toastService.success('Success', 'New post created successfully');
          this.postCreated.emit(res);
          this.close();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', 'Failed to create new post');
        }
      });
  }
}