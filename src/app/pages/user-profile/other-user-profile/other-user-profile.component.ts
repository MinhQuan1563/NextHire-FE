import { Component, inject, OnInit, signal, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

// Models
import {
  UserProfileDto,
  ParsedUserProfile,
  Gender,
  GenderLabels,
  FriendshipStatus,
  FriendshipStatusLabels,
  FriendshipStatusResponse,
} from '../../../models/user-profile';
import {
  SkillsJson,
  ExperienceJson,
  EducationJson,
  PersonalProjectsJson,
} from '../../../models/user-profile/profile-json-structures.model';

// Services
import { UserProfileService } from '../../../services/user-profile/user-profile.service';
import { FriendshipService } from '../../../services/user-profile/friendship.service';

// Shared Components
import { ProfileAvatarComponent } from '../../../shared/reusable-components/profile-components/profile-avatar/profile-avatar.component';
import { SkillsDisplayComponent } from '../../../shared/reusable-components/profile-components/skills-display/skills-display.component';
import { ExperienceDisplayComponent } from '../../../shared/reusable-components/profile-components/experience-display/experience-display.component';
import { EducationDisplayComponent } from '../../../shared/reusable-components/profile-components/education-display/education-display.component';
import { PersonalProjectsDisplayComponent } from '../../../shared/reusable-components/profile-components/personal-projects-display/personal-projects-display.component';

@Component({
  selector: 'app-other-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    AccordionModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    ProfileAvatarComponent,
    SkillsDisplayComponent,
    ExperienceDisplayComponent,
    EducationDisplayComponent,
    PersonalProjectsDisplayComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './other-user-profile.component.html',
  styleUrls: ['./other-user-profile.component.scss']
})
export class OtherUserProfileComponent implements OnInit {
  // Dependency Injection
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userProfileService = inject(UserProfileService);
  private readonly friendshipService = inject(FriendshipService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // Route parameter
  userCode = signal<string | null>(null);

  // Loading states
  loading = signal<boolean>(false);
  friendshipActionLoading = signal<boolean>(false);

  // Error states
  error = signal<string | null>(null);
  profileNotFound = signal<boolean>(false);
  accessRestricted = signal<boolean>(false);

  // Profile data
  profileData = signal<ParsedUserProfile | null>(null);

  // Friendship status
  friendshipStatus = signal<FriendshipStatus>('none');

  // Previous friendship status for optimistic UI rollback
  private previousFriendshipStatus: FriendshipStatus = 'none';

  // Computed property for friendship status label
  friendshipStatusLabel = computed(() => {
    return FriendshipStatusLabels[this.friendshipStatus()];
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const code = params.get('userCode');
        if (code) {
          this.userCode.set(code);
          this.loadProfileData(code);
        } else {
          this.error.set('User code is required');
        }
      });
  }

  /**
   * Load profile data and friendship status
   */
  loadProfileData(userCode: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.profileNotFound.set(false);
    this.accessRestricted.set(false);

    forkJoin({
      profile: this.userProfileService.getUserProfileByCode(userCode).pipe(
        catchError((err: HttpErrorResponse) => {
          this.handleProfileError(err);
          return of(null);
        })
      ),
      friendship: this.friendshipService.getFriendshipStatus(userCode).pipe(
        catchError(() => of({ status: 'none' as FriendshipStatus, userCode }))
      )
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ profile, friendship }) => {
        if (profile) {
          this.profileData.set(this.parseProfile(profile));
        }
        if (friendship) {
          this.friendshipStatus.set(friendship.status);
          this.previousFriendshipStatus = friendship.status;
        }
      });
  }

  /**
   * Handle profile loading errors
   */
  private handleProfileError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this.profileNotFound.set(true);
      this.error.set('User profile not found. The user may not exist or the profile is not available.');
    } else if (error.status === 403) {
      this.accessRestricted.set(true);
      this.error.set('You do not have permission to view this profile.');
    } else if (error.status === 0) {
      this.error.set('Network error. Please check your internet connection and try again.');
    } else {
      this.error.set(this.getErrorMessage(error));
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'You are not authorized. Please log in again.';
    }
    if (error.status === 500) {
      return 'Server error. Please try again later.';
    }
    if (error.error?.message) {
      return error.error.message;
    }
    return `Failed to load profile. Please try again. (Error: ${error.status || 'Unknown'})`;
  }

  /**
   * Parse UserProfileDto to ParsedUserProfile
   */
  private parseProfile(profile: UserProfileDto): ParsedUserProfile {
    return {
      id: profile.id,
      userCode: profile.userCode,
      fullName: profile.fullName,
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
      gender: profile.gender,
      avatarUrl: profile.avatarUrl,
      skills: this.parseJsonField<SkillsJson>(profile.skills),
      experience: this.parseJsonField<ExperienceJson>(profile.experience),
      education: this.parseJsonField<EducationJson>(profile.education),
      personalProjects: this.parseJsonField<PersonalProjectsJson>(profile.personalProjects),
      portfolioUrl: profile.portfolioUrl,
      savedJobs: null, // Don't show saved jobs for other users
    };
  }

  /**
   * Parse JSON string field safely
   */
  private parseJsonField<T>(jsonString: string | null): T | null {
    if (!jsonString || jsonString.trim() === '') {
      return null;
    }
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('Error parsing JSON field:', error);
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
    const code = this.userCode();
    if (code) {
      this.loadProfileData(code);
    }
  }

  // ==================== Friendship Actions ====================

  /**
   * Send friend request (FR-OP-004)
   */
  sendFriendRequest(): void {
    const code = this.userCode();
    if (!code) return;

    this.performFriendshipAction(
      () => this.friendshipService.sendFriendRequest(code),
      'pending_sent',
      'Friend request sent successfully!',
      'Failed to send friend request'
    );
  }

  /**
   * Cancel friend request (FR-OP-005)
   */
  cancelFriendRequest(): void {
    const code = this.userCode();
    if (!code) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this friend request?',
      header: 'Cancel Friend Request',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.performFriendshipAction(
          () => this.friendshipService.cancelFriendRequest(code),
          'none',
          'Friend request cancelled',
          'Failed to cancel friend request'
        );
      }
    });
  }

  /**
   * Accept friend request (FR-OP-006)
   */
  acceptFriendRequest(): void {
    const code = this.userCode();
    if (!code) return;

    this.performFriendshipAction(
      () => this.friendshipService.acceptFriendRequest(code),
      'friends',
      'Friend request accepted!',
      'Failed to accept friend request'
    );
  }

  /**
   * Decline friend request (FR-OP-006)
   */
  declineFriendRequest(): void {
    const code = this.userCode();
    if (!code) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to decline this friend request?',
      header: 'Decline Friend Request',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.performFriendshipAction(
          () => this.friendshipService.declineFriendRequest(code),
          'none',
          'Friend request declined',
          'Failed to decline friend request'
        );
      }
    });
  }

  /**
   * Unfriend user (FR-OP-007)
   */
  unfriend(): void {
    const code = this.userCode();
    if (!code) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this person from your friends?',
      header: 'Remove Friend',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.performFriendshipAction(
          () => this.friendshipService.unfriend(code),
          'none',
          'Friend removed successfully',
          'Failed to remove friend'
        );
      }
    });
  }

  /**
   * Block user (FR-OP-008)
   */
  blockUser(): void {
    const code = this.userCode();
    if (!code) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to block this user? They will not be able to see your profile or send you messages.',
      header: 'Block User',
      icon: 'pi pi-ban',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.performFriendshipAction(
          () => this.friendshipService.blockUser(code),
          'blocked',
          'User blocked successfully',
          'Failed to block user'
        );
      }
    });
  }

  /**
   * Message user placeholder (FR-OP-009)
   */
  messageUser(): void {
    const code = this.userCode();
    if (!code) return;

    // Navigate to messaging page with user code
    this.router.navigate(['/messaging'], { queryParams: { user: code } });
  }

  /**
   * Perform friendship action with optimistic UI update (FR-OP-015, FR-OP-016)
   */
  private performFriendshipAction(
    action: () => ReturnType<typeof this.friendshipService.sendFriendRequest>,
    expectedStatus: FriendshipStatus,
    successMessage: string,
    errorMessage: string
  ): void {
    this.friendshipActionLoading.set(true);
    this.previousFriendshipStatus = this.friendshipStatus();

    // Optimistic UI update
    this.friendshipStatus.set(expectedStatus);

    action()
      .pipe(
        finalize(() => this.friendshipActionLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: successMessage,
            life: 3000
          });
        },
        error: (err: HttpErrorResponse) => {
          // Revert optimistic update on error
          this.friendshipStatus.set(this.previousFriendshipStatus);

          let detail = errorMessage;
          if (err.status === 400 && err.error?.message) {
            detail = err.error.message;
          } else if (err.status === 409) {
            detail = 'This action has already been performed.';
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail,
            life: 5000
          });
        }
      });
  }
}

