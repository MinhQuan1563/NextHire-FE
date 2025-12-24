import { Component, inject, OnInit, signal, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import { UserCvDto } from '../../../models/user-profile';
import { UserCvService } from '../../../services/user-profile/user-cv.service';

@Component({
  selector: 'app-user-cv',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    CardModule,
    DialogModule,
    FileUploadModule,
    InputTextModule,
    CheckboxModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-cv.component.html',
  styleUrls: ['./user-cv.component.scss']
})
export class UserCvComponent implements OnInit {
  private readonly userCvService = inject(UserCvService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  cvList = signal<UserCvDto[]>([]);
  uploadDialogVisible = signal<boolean>(false);
  editDialogVisible = signal<boolean>(false);
  uploadLoading = signal<boolean>(false);
  editLoading = signal<boolean>(false);
  selectedCv = signal<UserCvDto | null>(null);
  selectedFile = signal<File | null>(null);
  uploadError = signal<string | null>(null);
  operationInProgress = signal<boolean>(false);

  uploadForm: FormGroup;
  editForm: FormGroup;

  readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
  readonly ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  readonly ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

  fileInfo = computed(() => {
    const file = this.selectedFile();
    if (!file) return null;
    return {
      name: file.name,
      size: this.formatFileSize(file.size),
      type: file.type,
    };
  });

  constructor() {
    this.uploadForm = this.fb.group({
      cvName: ['', [Validators.required, Validators.maxLength(200)]],
      setAsDefault: [false],
    });

    this.editForm = this.fb.group({
      cvName: ['', [Validators.required, Validators.maxLength(200)]],
    });
  }

  ngOnInit(): void {
    this.loadCvList();
  }

  loadCvList(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userCvService
      .getCvsByUser()
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(err);
          this.error.set(errorMessage);
          console.error('Error loading CV list:', err);
          return of([]);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((cvs) => {
        this.cvList.set(cvs);
      });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error. Please check your internet connection and try again.';
    }

    switch (error.status) {
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'You do not have permission to access CVs.';
      case 404:
        return 'CVs not found.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        if (error.error?.message) {
          return error.error.message;
        }
        if (error.message) {
          return error.message;
        }
        return `Failed to load CVs. Please try again. (Error: ${error.status || 'Unknown'})`;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  retry(): void {
    this.loadCvList();
  }

  openUploadDialog(): void {
    this.uploadDialogVisible.set(true);
    this.resetUploadForm();
  }

  closeUploadDialog(): void {
    this.uploadDialogVisible.set(false);
    this.resetUploadForm();
  }

  resetUploadForm(): void {
    this.uploadForm.reset({ cvName: '', setAsDefault: false });
    this.selectedFile.set(null);
    this.uploadError.set(null);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const validation = this.validateFile(file);

    if (!validation.isValid) {
      this.uploadError.set(validation.error!);
      this.selectedFile.set(null);
      input.value = '';
      return;
    }

    this.uploadError.set(null);
    this.selectedFile.set(file);
  }

  validateFile(file: File): { isValid: boolean; error?: string } {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only PDF and DOCX files are allowed.',
      };
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.type) && file.type !== '') {
      return {
        isValid: false,
        error: 'Invalid file type. Only PDF and DOCX files are allowed.',
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds the maximum limit of ${this.formatFileSize(this.MAX_FILE_SIZE)}.`,
      };
    }

    return { isValid: true };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  canUpload(): boolean {
    return this.uploadForm.valid && this.selectedFile() !== null && !this.uploadLoading();
  }

  uploadCv(): void {
    if (!this.canUpload()) {
      return;
    }

    const file = this.selectedFile();
    if (!file) {
      return;
    }

    const cvName = this.uploadForm.get('cvName')?.value;
    const setAsDefault = this.uploadForm.get('setAsDefault')?.value || false;

    this.uploadLoading.set(true);
    this.uploadError.set(null);

    this.userCvService
      .uploadCv({ cvName, file, isDefault: setAsDefault })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMessage = this.getUploadErrorMessage(err);
          this.uploadError.set(errorMessage);
          this.messageService.add({
            severity: 'error',
            summary: 'Upload Failed',
            detail: errorMessage,
            life: 5000,
          });
          console.error('Error uploading CV:', err);
          return of(null);
        }),
        finalize(() => this.uploadLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        if (result) {
          this.messageService.add({
            severity: 'success',
            summary: 'Upload Successful',
            detail: `CV "${cvName}" has been uploaded successfully.`,
            life: 3000,
          });
          this.closeUploadDialog();
          this.loadCvList();
        }
      });
  }

  private getUploadErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error. Please check your internet connection and try again.';
    }

    switch (error.status) {
      case 400:
        return error.error?.message || 'Invalid file or data. Please check your input.';
      case 401:
        return 'You are not authorized. Please log in again.';
      case 413:
        return 'File is too large. Maximum file size is 10MB.';
      case 415:
        return 'Unsupported file type. Only PDF and DOCX files are allowed.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        if (error.error?.message) {
          return error.error.message;
        }
        return 'Failed to upload CV. Please try again.';
    }
  }

  openEditDialog(cv: UserCvDto): void {
    this.selectedCv.set(cv);
    this.editForm.patchValue({ cvName: cv.cvName || '' });
    this.editDialogVisible.set(true);
  }

  closeEditDialog(): void {
    this.editDialogVisible.set(false);
    this.selectedCv.set(null);
    this.editForm.reset();
  }

  updateCv(): void {
    if (!this.editForm.valid || !this.selectedCv()) {
      return;
    }

    const cv = this.selectedCv()!;
    const cvName = this.editForm.get('cvName')?.value;

    this.editLoading.set(true);
    this.operationInProgress.set(true);

    this.userCvService
      .updateCv(cv.cvId, { cvName })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: errorMessage,
            life: 5000,
          });
          console.error('Error updating CV:', err);
          return of(null);
        }),
        finalize(() => {
          this.editLoading.set(false);
          this.operationInProgress.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        if (result) {
          this.messageService.add({
            severity: 'success',
            summary: 'Update Successful',
            detail: `CV name has been updated to "${cvName}".`,
            life: 3000,
          });
          this.closeEditDialog();
          this.loadCvList();
        }
      });
  }

  setDefaultCv(cv: UserCvDto): void {
    if (cv.isDefault) {
      return;
    }

    this.operationInProgress.set(true);

    this.userCvService
      .setDefaultCv(cv.cvId)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Set Default Failed',
            detail: errorMessage,
            life: 5000,
          });
          console.error('Error setting default CV:', err);
          return of(null);
        }),
        finalize(() => this.operationInProgress.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        if (result) {
          this.messageService.add({
            severity: 'success',
            summary: 'Default CV Updated',
            detail: `"${cv.cvName || 'CV'}" is now your default CV.`,
            life: 3000,
          });
          this.loadCvList();
        }
      });
  }

  confirmDeleteCv(cv: UserCvDto): void {
    const cvList = this.cvList();

    if (cvList.length === 1 && cv.isDefault) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cannot Delete',
        detail: 'You cannot delete your only CV if it is set as default. Please upload another CV first.',
        life: 5000,
      });
      return;
    }

    if (cvList.length === 1) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cannot Delete',
        detail: 'You must have at least one CV. Please upload another CV before deleting this one.',
        life: 5000,
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${cv.cvName || 'this CV'}"? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteCv(cv);
      },
    });
  }

  private deleteCv(cv: UserCvDto): void {
    this.operationInProgress.set(true);

    this.userCvService
      .deleteCv(cv.cvId)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Delete Failed',
            detail: errorMessage,
            life: 5000,
          });
          console.error('Error deleting CV:', err);
          return of(null);
        }),
        finalize(() => this.operationInProgress.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        if (result) {
          this.messageService.add({
            severity: 'success',
            summary: 'Delete Successful',
            detail: `"${cv.cvName || 'CV'}" has been deleted.`,
            life: 3000,
          });
          this.loadCvList();
        }
      });
  }

  downloadCv(cv: UserCvDto): void {
    this.operationInProgress.set(true);

    this.userCvService
      .downloadCv(cv.cvId)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMessage = this.getDownloadErrorMessage(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Download Failed',
            detail: errorMessage,
            life: 5000,
          });
          console.error('Error downloading CV:', err);
          return of(null);
        }),
        finalize(() => this.operationInProgress.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((blob) => {
        if (blob) {
          this.saveFile(blob, cv);
          this.messageService.add({
            severity: 'success',
            summary: 'Download Successful',
            detail: `"${cv.cvName || 'CV'}" has been downloaded.`,
            life: 3000,
          });
        }
      });
  }

  private saveFile(blob: Blob, cv: UserCvDto): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = this.generateFileName(cv);
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private generateFileName(cv: UserCvDto): string {
    const baseName = cv.cvName || 'CV';
    const sanitizedName = baseName.replace(/[^a-z0-9]/gi, '_');
    const timestamp = new Date().getTime();
    return `${sanitizedName}_${timestamp}.pdf`;
  }

  private getDownloadErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error. Please check your internet connection and try again.';
    }

    switch (error.status) {
      case 404:
        return 'CV file not found. It may have been deleted.';
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'You do not have permission to download this CV.';
      case 410:
        return 'CV file is no longer available.';
      case 422:
        return 'CV file is corrupted or unreadable. Please upload a new version.';
      case 500:
        return 'Server error while downloading CV. Please try again later.';
      default:
        if (error.error?.message) {
          return error.error.message;
        }
        return 'Failed to download CV. Please try again.';
    }
  }
}

