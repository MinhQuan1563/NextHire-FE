import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { AvatarModule } from 'primeng/avatar';
import { AccordionModule } from 'primeng/accordion';

// Models
import {
  UserProfileDto,
  ParsedUserProfile,
  Gender,
  GenderLabels,
} from '../../../models/user-profile';
import {
  SkillsJson,
  ExperienceJson,
  EducationJson,
  PersonalProjectsJson,
  SavedJobsJson,
} from '../../../models/user-profile/profile-json-structures.model';

// Services
import { UserProfileService } from '../../../services/user-profile/user-profile.service';

// Shared Components
import { ProfileAvatarComponent } from '../../../shared/reusable-components/profile-components/profile-avatar/profile-avatar.component';
import {
  JsonFieldEditorComponent,
  JsonFieldConfig,
} from '../../../shared/reusable-components/profile-components/json-field-editor/json-field-editor.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    InputTextModule,
    InputTextareaModule,
    CalendarModule,
    DropdownModule,
    FileUploadModule,
    AvatarModule,
    AccordionModule,
    ProfileAvatarComponent,
    JsonFieldEditorComponent,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  // Dependency Injection
  private readonly formBuilder = inject(FormBuilder);
  private readonly userProfileService = inject(UserProfileService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  // State Management with Signals
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  isFormDirty = signal<boolean>(false);
  submitting = signal<boolean>(false);

  // Avatar Upload State
  avatarUploading = signal<boolean>(false);
  avatarError = signal<string | null>(null);
  avatarPreview = signal<string | null>(null);
  selectedAvatarFile = signal<File | null>(null);

  // Reactive Form
  profileForm!: FormGroup;

  // Gender options for dropdown
  genderOptions = [
    { label: GenderLabels[Gender.Unknown], value: Gender.Unknown },
    { label: GenderLabels[Gender.Male], value: Gender.Male },
    { label: GenderLabels[Gender.Female], value: Gender.Female },
  ];

  // Maximum date for date picker (today - no future dates)
  maxDate = new Date();

  // Skills editor configuration
  skillsConfig: JsonFieldConfig = {
    type: 'skills',
    label: 'Skills',
    addButtonLabel: 'Add Skill',
    emptyMessage: 'No skills added yet. Click "Add Skill" to get started.',
  };

  // Experience editor configuration
  experienceConfig: JsonFieldConfig = {
    type: 'experience',
    label: 'Work Experience',
    addButtonLabel: 'Add Experience',
    emptyMessage: 'No work experience added yet. Click "Add Experience" to get started.',
  };

  // Education editor configuration
  educationConfig: JsonFieldConfig = {
    type: 'education',
    label: 'Education',
    addButtonLabel: 'Add Education',
    emptyMessage: 'No education added yet. Click "Add Education" to get started.',
  };

  // Personal Projects editor configuration
  personalProjectsConfig: JsonFieldConfig = {
    type: 'personalProjects',
    label: 'Personal Projects',
    addButtonLabel: 'Add Project',
    emptyMessage: 'No personal projects added yet. Click "Add Project" to get started.',
  };

  /**
   * Component initialization
   */
  ngOnInit(): void {
    this.initializeForm();
    this.loadProfile();
    this.setupFormDirtyTracking();
  }

  /**
   * Initialize the reactive form structure
   */
  private initializeForm(): void {
    this.profileForm = this.formBuilder.group({
      // Read-only fields (will be disabled)
      id: [{ value: '', disabled: true }],
      userCode: [{ value: '', disabled: true }],

      // Editable fields
      fullName: ['', [Validators.maxLength(200)]],
      dateOfBirth: [null as Date | null, [this.dateNotInFutureValidator]],
      gender: [Gender.Unknown, Validators.required],
      portfolioUrl: [
        '',
        [this.urlValidator],
      ],

      // JSON fields (will be handled by structured input components)
      skills: [null],
      experience: [null],
      education: [null],
      personalProjects: [null],
      savedJobs: [null],

      // Avatar URL (managed separately)
      avatarUrl: [null],
    });
  }

  /**
   * Load current user profile and populate form
   */
  private loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userProfileService
      .getCurrentUserProfile()
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(err);
          this.error.set(errorMessage);
          console.error('Error loading profile:', err);
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((profile) => {
        if (profile) {
          this.populateForm(profile);
        }
      });
  }

  /**
   * Populate form with profile data
   * Handles null/empty values gracefully and parses JSON fields
   */
  private populateForm(profile: UserProfileDto): void {
    // Parse date of birth safely
    let dateOfBirth: Date | null = null;
    if (profile.dateOfBirth) {
      try {
        const parsedDate = new Date(profile.dateOfBirth);
        // Validate the date is not invalid
        if (!isNaN(parsedDate.getTime())) {
          dateOfBirth = parsedDate;
        }
      } catch (error) {
        console.error('Error parsing date of birth:', error);
      }
    }

    // Parse JSON fields safely
    const parsedSkills = this.parseJsonField<SkillsJson>(profile.skills);
    const parsedExperience = this.parseJsonField<ExperienceJson>(profile.experience);
    const parsedEducation = this.parseJsonField<EducationJson>(profile.education);
    const parsedPersonalProjects = this.parseJsonField<PersonalProjectsJson>(
      profile.personalProjects
    );
    const parsedSavedJobs = this.parseJsonField<SavedJobsJson>(profile.savedJobs);

    // Populate form with parsed data
    this.profileForm.patchValue({
      // Read-only fields
      id: profile.id || '',
      userCode: profile.userCode || '',

      // Editable fields with null handling
      fullName: profile.fullName || '',
      dateOfBirth: dateOfBirth,
      gender: profile.gender ?? Gender.Unknown,
      portfolioUrl: profile.portfolioUrl || '',
      avatarUrl: profile.avatarUrl || '',

      // Parsed JSON fields (null if parsing failed or field is empty)
      skills: parsedSkills,
      experience: parsedExperience,
      education: parsedEducation,
      personalProjects: parsedPersonalProjects,
      savedJobs: parsedSavedJobs,
    }, { emitEvent: false }); // Don't trigger valueChanges during initialization

    // Reset dirty state after populating
    this.profileForm.markAsPristine();
    this.isFormDirty.set(false);

    // Reset avatar upload state
    this.avatarPreview.set(null);
    this.selectedAvatarFile.set(null);
    this.avatarError.set(null);
  }

  /**
   * Parse JSON string field safely
   * Returns null if parsing fails or field is null/empty
   * Handles invalid JSON gracefully with error logging
   */
  private parseJsonField<T>(jsonString: string | null): T | null {
    // Handle null or empty strings
    if (!jsonString || jsonString.trim() === '') {
      return null;
    }

    try {
      const parsed = JSON.parse(jsonString) as T;
      return parsed;
    } catch (error) {
      // Log parsing errors for debugging but don't break the form
      console.error('Error parsing JSON field:', error, 'JSON string:', jsonString);
      return null;
    }
  }

  /**
   * Setup form dirty state tracking
   */
  private setupFormDirtyTracking(): void {
    this.profileForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isFormDirty.set(this.profileForm.dirty);
      });
  }

  /**
   * Get user-friendly error message based on HTTP error response
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error. Please check your internet connection and try again.';
    }

    switch (error.status) {
      case 401:
        return 'You are not authorized to view this profile. Please log in again.';
      case 403:
        return 'You do not have permission to access this profile.';
      case 404:
        return 'Profile not found.';
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
        return `Failed to load profile. Please try again. (Error: ${error.status || 'Unknown'})`;
    }
  }

  /**
   * Custom validator: Date of birth must not be in the future
   */
  private dateNotInFutureValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    if (!control.value) {
      return null; // Allow null/empty values (field is nullable)
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today

    if (selectedDate > today) {
      return { dateInFuture: true };
    }

    return null;
  }

  /**
   * Custom validator: URL format validation (only validates if value is provided)
   */
  private urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value.trim() === '') {
      return null; // Allow empty values (field is optional)
    }

    const urlPattern =
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

    if (!urlPattern.test(control.value)) {
      return { pattern: true };
    }

    return null;
  }

  /**
   * Get validation error message for a form control
   */
  getFieldErrorMessage(controlName: string): string | null {
    const control = this.profileForm.get(controlName);
    if (!control || !control.errors || !control.touched) {
      return null;
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `${this.getFieldLabel(controlName)} must be less than ${maxLength} characters`;
    }
    if (control.errors['pattern']) {
      if (controlName === 'portfolioUrl') {
        return 'Please enter a valid URL (e.g., https://example.com)';
      }
      return `Please enter a valid ${this.getFieldLabel(controlName).toLowerCase()}`;
    }
    if (control.errors['dateInFuture']) {
      return 'Date of birth cannot be in the future';
    }

    return null;
  }

  /**
   * Get field label for error messages
   */
  private getFieldLabel(controlName: string): string {
    const labels: Record<string, string> = {
      fullName: 'Full Name',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      portfolioUrl: 'Portfolio URL',
    };
    return labels[controlName] || controlName;
  }

  /**
   * Check if a field is required
   */
  isFieldRequired(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    if (!control) {
      return false;
    }
    return control.hasValidator(Validators.required);
  }

  /**
   * Get gender label for display
   */
  getGenderLabel(gender: Gender): string {
    return GenderLabels[gender] || 'Not Specified';
  }

  /**
   * Handle file selection for avatar upload
   */
  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.avatarError.set('Invalid file type. Please select JPEG, PNG, GIF, or WebP image.');
      input.value = '';
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.avatarError.set('File size exceeds 5MB. Please select a smaller image.');
      input.value = '';
      return;
    }

    // Clear previous errors
    this.avatarError.set(null);

    // Store selected file
    this.selectedAvatarFile.set(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.avatarPreview.set(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Upload avatar image
   */
  uploadAvatar(): void {
    const file = this.selectedAvatarFile();
    if (!file) {
      this.avatarError.set('Please select an image file first.');
      return;
    }

    this.avatarUploading.set(true);
    this.avatarError.set(null);

    this.userProfileService
      .uploadAvatar(file)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const errorMessage = this.getAvatarUploadErrorMessage(err);
          this.avatarError.set(errorMessage);
          console.error('Error uploading avatar:', err);
          return of(null);
        }),
        finalize(() => this.avatarUploading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((updatedProfile) => {
        if (updatedProfile) {
          // Update avatar URL in form
          this.profileForm.patchValue(
            { avatarUrl: updatedProfile.avatarUrl },
            { emitEvent: false }
          );

          // Clear preview and selected file
          this.avatarPreview.set(null);
          this.selectedAvatarFile.set(null);

          // Clear file input
          const fileInput = document.getElementById('avatarFileInput') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }

          // Mark form as dirty since avatar was updated
          this.profileForm.markAsDirty();
          this.isFormDirty.set(true);
        }
      });
  }

  /**
   * Cancel avatar upload and clear preview
   */
  cancelAvatarUpload(): void {
    this.avatarPreview.set(null);
    this.selectedAvatarFile.set(null);
    this.avatarError.set(null);

    // Clear file input
    const fileInput = document.getElementById('avatarFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Get user-friendly error message for avatar upload
   */
  private getAvatarUploadErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error. Please check your internet connection and try again.';
    }

    switch (error.status) {
      case 400:
        return 'Invalid file. Please ensure the file is a valid image (JPEG, PNG, GIF, or WebP) and is less than 5MB.';
      case 401:
        return 'You are not authorized to upload avatars. Please log in again.';
      case 403:
        return 'You do not have permission to upload avatars.';
      case 413:
        return 'File is too large. Maximum size is 5MB.';
      case 415:
        return 'Unsupported file type. Please use JPEG, PNG, GIF, or WebP.';
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
        return `Failed to upload avatar. Please try again. (Error: ${error.status || 'Unknown'})`;
    }
  }

  /**
   * Get current avatar URL for display (preview or existing)
   */
  getCurrentAvatarUrl(): string | null {
    // Show preview if available
    if (this.avatarPreview()) {
      return this.avatarPreview();
    }
    // Otherwise show existing avatar
    return this.profileForm.get('avatarUrl')?.value || null;
  }

  /**
   * Get skills JSON string for editor component
   * Converts SkillsJson object to JSON string format expected by editor
   */
  getSkillsJsonString(): string | null {
    const skillsValue = this.profileForm.get('skills')?.value;
    if (!skillsValue) {
      return null;
    }
    try {
      // If it's already a SkillsJson object with skills array, stringify it
      if (skillsValue.skills && Array.isArray(skillsValue.skills)) {
        return JSON.stringify(skillsValue);
      }
      // If it's just an array, wrap it in the SkillsJson structure
      if (Array.isArray(skillsValue)) {
        return JSON.stringify({ skills: skillsValue });
      }
      // Otherwise, stringify as-is
      return JSON.stringify(skillsValue);
    } catch (error) {
      console.error('Error serializing skills:', error);
      return null;
    }
  }

  /**
   * Handle skills value change from editor
   * Converts JSON string from editor to SkillsJson object for form
   */
  onSkillsValueChange(jsonString: string): void {
    try {
      const parsed = JSON.parse(jsonString);
      // Editor returns { skills: [...] }, store it as SkillsJson object
      this.profileForm.patchValue({ skills: parsed }, { emitEvent: false });
      this.profileForm.markAsDirty();
      this.isFormDirty.set(true);
    } catch (error) {
      console.error('Error parsing skills JSON:', error);
    }
  }

  /**
   * Get experience JSON string for editor component
   * Converts ExperienceJson object to JSON string format expected by editor
   */
  getExperienceJsonString(): string | null {
    const experienceValue = this.profileForm.get('experience')?.value;
    if (!experienceValue) {
      return null;
    }
    try {
      // If it's already an ExperienceJson object with experiences array, stringify it
      if (experienceValue.experiences && Array.isArray(experienceValue.experiences)) {
        return JSON.stringify(experienceValue);
      }
      // If it's just an array, wrap it in the ExperienceJson structure
      if (Array.isArray(experienceValue)) {
        return JSON.stringify({ experiences: experienceValue });
      }
      // Otherwise, stringify as-is
      return JSON.stringify(experienceValue);
    } catch (error) {
      console.error('Error serializing experience:', error);
      return null;
    }
  }

  /**
   * Handle experience value change from editor
   * Converts JSON string from editor to ExperienceJson object for form
   */
  onExperienceValueChange(jsonString: string): void {
    try {
      const parsed = JSON.parse(jsonString);
      // Editor returns { experiences: [...] }, store it as ExperienceJson object
      this.profileForm.patchValue({ experience: parsed }, { emitEvent: false });
      this.profileForm.markAsDirty();
      this.isFormDirty.set(true);
    } catch (error) {
      console.error('Error parsing experience JSON:', error);
    }
  }

  /**
   * Get education JSON string for editor component
   * Converts EducationJson object to JSON string format expected by editor
   */
  getEducationJsonString(): string | null {
    const educationValue = this.profileForm.get('education')?.value;
    if (!educationValue) {
      return null;
    }
    try {
      // If it's already an EducationJson object with educations array, stringify it
      if (educationValue.educations && Array.isArray(educationValue.educations)) {
        return JSON.stringify(educationValue);
      }
      // If it's just an array, wrap it in the EducationJson structure
      if (Array.isArray(educationValue)) {
        return JSON.stringify({ educations: educationValue });
      }
      // Otherwise, stringify as-is
      return JSON.stringify(educationValue);
    } catch (error) {
      console.error('Error serializing education:', error);
      return null;
    }
  }

  /**
   * Handle education value change from editor
   * Converts JSON string from editor to EducationJson object for form
   */
  onEducationValueChange(jsonString: string): void {
    try {
      const parsed = JSON.parse(jsonString);
      // Editor returns { educations: [...] }, store it as EducationJson object
      this.profileForm.patchValue({ education: parsed }, { emitEvent: false });
      this.profileForm.markAsDirty();
      this.isFormDirty.set(true);
    } catch (error) {
      console.error('Error parsing education JSON:', error);
    }
  }

  /**
   * Get personal projects JSON string for editor component
   * Converts PersonalProjectsJson object to JSON string format expected by editor
   */
  getPersonalProjectsJsonString(): string | null {
    const projectsValue = this.profileForm.get('personalProjects')?.value;
    if (!projectsValue) {
      return null;
    }
    try {
      // If it's already a PersonalProjectsJson object with projects array, stringify it
      if (projectsValue.projects && Array.isArray(projectsValue.projects)) {
        return JSON.stringify(projectsValue);
      }
      // If it's just an array, wrap it in the PersonalProjectsJson structure
      if (Array.isArray(projectsValue)) {
        return JSON.stringify({ projects: projectsValue });
      }
      // Otherwise, stringify as-is
      return JSON.stringify(projectsValue);
    } catch (error) {
      console.error('Error serializing personal projects:', error);
      return null;
    }
  }

  /**
   * Handle personal projects value change from editor
   * Converts JSON string from editor to PersonalProjectsJson object for form
   */
  onPersonalProjectsValueChange(jsonString: string): void {
    try {
      const parsed = JSON.parse(jsonString);
      // Editor returns { projects: [...] }, store it as PersonalProjectsJson object
      this.profileForm.patchValue({ personalProjects: parsed }, { emitEvent: false });
      this.profileForm.markAsDirty();
      this.isFormDirty.set(true);
    } catch (error) {
      console.error('Error parsing personal projects JSON:', error);
    }
  }

  /**
   * Retry loading profile
   */
  retry(): void {
    this.loadProfile();
  }

  /**
   * Handle form submission with validation (FR-EP-015, FR-EP-013)
   */
  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched(this.profileForm);

    // Validate form
    if (!this.profileForm.valid) {
      this.error.set('Please fix the errors in the form before submitting.');
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix the errors in the form before submitting.',
        life: 5000
      });
      return;
    }

    // Validate JSON structures
    if (!this.validateJsonFields()) {
      this.error.set('Please fix the errors in the structured fields (Skills, Experience, Education, etc.) before submitting.');
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix the errors in the structured fields (Skills, Experience, Education, etc.) before submitting.',
        life: 5000
      });
      return;
    }

    // Form is valid, proceed with submission
    this.submitProfileUpdate();
  }

  /**
   * Submit profile update via PUT API (FR-EP-015)
   */
  private submitProfileUpdate(): void {
    this.submitting.set(true);
    this.error.set(null);

    // Serialize form data to UserProfileDto format
    const profileDto = this.serializeFormToDto();

    this.userProfileService
      .updateProfile(profileDto)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.handleSubmissionError(err);
          return of(null);
        }),
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((updatedProfile) => {
        if (updatedProfile) {
          this.handleSubmissionSuccess(updatedProfile);
        }
      });
  }

  /**
   * Serialize form data to UserProfileDto format (FR-EP-014)
   */
  private serializeFormToDto(): UserProfileDto {
    const formValue = this.profileForm.getRawValue(); // Use getRawValue to include disabled fields

    // Serialize date of birth to ISO 8601 format
    let dateOfBirthString: string | null = null;
    if (formValue.dateOfBirth) {
      const date = new Date(formValue.dateOfBirth);
      dateOfBirthString = date.toISOString();
    }

    // Serialize JSON fields to JSON strings
    const skillsJson = formValue.skills ? JSON.stringify(formValue.skills) : null;
    const experienceJson = formValue.experience ? JSON.stringify(formValue.experience) : null;
    const educationJson = formValue.education ? JSON.stringify(formValue.education) : null;
    const personalProjectsJson = formValue.personalProjects ? JSON.stringify(formValue.personalProjects) : null;
    const savedJobsJson = formValue.savedJobs ? JSON.stringify(formValue.savedJobs) : null;

    // Build UserProfileDto
    const profileDto: UserProfileDto = {
      id: formValue.id || '',
      userCode: formValue.userCode || null,
      fullName: formValue.fullName || null,
      dateOfBirth: dateOfBirthString,
      gender: formValue.gender ?? 0, // Default to Unknown (0)
      avatarUrl: formValue.avatarUrl || null,
      skills: skillsJson,
      experience: experienceJson,
      education: educationJson,
      personalProjects: personalProjectsJson,
      portfolioUrl: formValue.portfolioUrl || null,
      savedJobs: savedJobsJson,
    };

    return profileDto;
  }

  /**
   * Handle submission success (FR-EP-016, FR-EP-017)
   */
  private handleSubmissionSuccess(updatedProfile: UserProfileDto): void {
    // Update local state/UI immediately (FR-EP-017)
    this.populateForm(updatedProfile);

    // Mark form as pristine since we just saved
    this.profileForm.markAsPristine();
    this.isFormDirty.set(false);

    // Show success message (FR-EP-016)
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Profile updated successfully!',
      life: 5000
    });

    // Clear error state
    this.error.set(null);

    // Optionally navigate back to profile page after a short delay
    setTimeout(() => {
      this.router.navigate(['/profile']);
    }, 1500);
  }

  /**
   * Handle submission errors with user-friendly messages (FR-EP-015)
   */
  private handleSubmissionError(error: HttpErrorResponse): void {
    const errorMessage = this.getSubmissionErrorMessage(error);
    this.error.set(errorMessage);

    // Show error toast
    this.messageService.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: errorMessage,
      life: 7000
    });

    console.error('Error updating profile:', error);
  }

  /**
   * Get user-friendly error message for profile update
   */
  private getSubmissionErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error. Please check your internet connection and try again.';
    }

    // Handle concurrent update conflicts (FR-EP-032)
    if (error.status === 409) {
      return 'The profile was modified by another process. Please refresh and try again.';
    }

    switch (error.status) {
      case 400:
        if (error.error?.message) {
          return error.error.message;
        }
        return 'Invalid data. Please check your input and try again.';
      case 401:
        return 'You are not authorized to update this profile. Please log in again.';
      case 403:
        return 'You do not have permission to update this profile.';
      case 404:
        return 'Profile not found. Please refresh and try again.';
      case 409:
        return 'The profile was modified by another process. Please refresh and try again.';
      case 422:
        if (error.error?.errors) {
          const validationErrors = Object.values(error.error.errors).flat() as string[];
          return `Validation errors: ${validationErrors.join(', ')}`;
        }
        return 'Validation error. Please check your input.';
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
        return `Failed to update profile. Please try again. (Error: ${error.status || 'Unknown'})`;
    }
  }

  /**
   * Mark all form controls as touched to trigger validation display
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Validate JSON structure fields (FR-EP-020)
   */
  private validateJsonFields(): boolean {
    const jsonFields = ['skills', 'experience', 'education', 'personalProjects', 'savedJobs'];
    
    for (const fieldName of jsonFields) {
      const fieldValue = this.profileForm.get(fieldName)?.value;
      
      // If field has a value, validate it's a valid JSON structure
      if (fieldValue !== null && fieldValue !== '') {
        try {
          // Try to stringify and parse to ensure it's valid JSON
          const jsonString = typeof fieldValue === 'string' 
            ? fieldValue 
            : JSON.stringify(fieldValue);
          
          const parsed = JSON.parse(jsonString);
          
          // Basic structure validation based on field type
          if (!this.validateJsonStructureByType(fieldName, parsed)) {
            return false;
          }
        } catch (error) {
          console.error(`Invalid JSON structure for ${fieldName}:`, error);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validate JSON structure based on field type
   */
  private validateJsonStructureByType(fieldName: string, parsed: any): boolean {
    switch (fieldName) {
      case 'skills':
        return parsed.skills !== undefined && Array.isArray(parsed.skills);
      case 'experience':
        return parsed.experiences !== undefined && Array.isArray(parsed.experiences);
      case 'education':
        return parsed.educations !== undefined && Array.isArray(parsed.educations);
      case 'personalProjects':
        return parsed.projects !== undefined && Array.isArray(parsed.projects);
      case 'savedJobs':
        return parsed.savedJobs !== undefined && Array.isArray(parsed.savedJobs);
      default:
        return true;
    }
  }
}

