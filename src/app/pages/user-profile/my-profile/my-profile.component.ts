import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
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
import { SkillsDisplayComponent } from '../../../shared/reusable-components/profile-components/skills-display/skills-display.component';
import { ExperienceDisplayComponent } from '../../../shared/reusable-components/profile-components/experience-display/experience-display.component';
import { EducationDisplayComponent } from '../../../shared/reusable-components/profile-components/education-display/education-display.component';
import { PersonalProjectsDisplayComponent } from '../../../shared/reusable-components/profile-components/personal-projects-display/personal-projects-display.component';
import { SavedJobsDisplayComponent } from '../../../shared/reusable-components/profile-components/saved-jobs-display/saved-jobs-display.component';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    AccordionModule,
    ProfileAvatarComponent,
    SkillsDisplayComponent,
    ExperienceDisplayComponent,
    EducationDisplayComponent,
    PersonalProjectsDisplayComponent,
    SavedJobsDisplayComponent,
  ],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent implements OnInit {
  // Dependency Injection
  private readonly userProfileService = inject(UserProfileService);
  private readonly destroyRef = inject(DestroyRef);

  // State Management with Signals
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  profileData = signal<ParsedUserProfile | null>(null);

  /**
   * Component initialization
   */
  ngOnInit(): void {
    this.loadProfile();
  }

  /**
   * Load current user profile
   * Implements retry logic and proper error handling
   */
  loadProfile(): void {
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
          this.profileData.set(this.parseProfile(profile));
        }
      });
  }

  /**
   * Get user-friendly error message based on HTTP error response
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    // Handle network errors
    if (error.status === 0) {
      return 'Network error. Please check your internet connection and try again.';
    }

    // Handle specific HTTP status codes
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
        // Try to get error message from response
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
   * Parse UserProfileDto to ParsedUserProfile
   * Converts JSON strings to typed objects and date strings to Date objects
   */
  private parseProfile(profile: UserProfileDto): ParsedUserProfile {
    return {
      id: profile.id,
      userCode: profile.userCode,
      fullName: profile.fullName,
      dateOfBirth: profile.dateOfBirth
        ? new Date(profile.dateOfBirth)
        : null,
      gender: profile.gender,
      avatarUrl: profile.avatarUrl,
      skills: this.parseJsonField<SkillsJson>(profile.skills),
      experience: this.parseJsonField<ExperienceJson>(profile.experience),
      education: this.parseJsonField<EducationJson>(profile.education),
      personalProjects: this.parseJsonField<PersonalProjectsJson>(
        profile.personalProjects
      ),
      portfolioUrl: profile.portfolioUrl,
      savedJobs: this.parseJsonField<SavedJobsJson>(profile.savedJobs),
    };
  }

  /**
   * Parse JSON string field safely
   * Returns null if parsing fails or field is null/empty
   */
  private parseJsonField<T>(jsonString: string | null): T | null {
    if (!jsonString || jsonString.trim() === '') {
      return null;
    }

    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('Error parsing JSON field:', error, jsonString);
      return null;
    }
  }

  /**
   * Get gender label for display
   */
  getGenderLabel(gender: Gender): string {
    return GenderLabels[gender] || 'Not Specified';
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | null): string {
    if (!date) {
      return 'Not specified';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Retry loading profile
   */
  retry(): void {
    this.loadProfile();
  }
}

