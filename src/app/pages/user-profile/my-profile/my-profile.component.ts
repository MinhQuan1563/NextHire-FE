import { Component, inject, OnInit, signal, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { AccordionModule } from 'primeng/accordion';
import { AuthService } from '@app/services/auth/auth.service';
import { ProfileAvatarComponent } from '@shared/reusable-components/profile-components/profile-avatar/profile-avatar.component';
import { SkillsDisplayComponent } from '@shared/reusable-components/profile-components/skills-display/skills-display.component';
import { ExperienceDisplayComponent } from '@shared/reusable-components/profile-components/experience-display/experience-display.component';
import { EducationDisplayComponent } from '@shared/reusable-components/profile-components/education-display/education-display.component';
import { PersonalProjectsDisplayComponent } from '@shared/reusable-components/profile-components/personal-projects-display/personal-projects-display.component';
import { SavedJobsDisplayComponent } from '@shared/reusable-components/profile-components/saved-jobs-display/saved-jobs-display.component';
import { EducationJson, ExperienceJson, Gender, GenderLabels, ParsedUserProfile, PersonalProjectsJson, SavedJobsJson, SkillsJson } from '@app/models/user-profile';
import { User } from '@app/models/auth/auth.model';
import { ToastService } from '@app/services/toast/toast.service';
import { PostResponse } from '@app/models/post/post.model';
import { PostCardComponent } from '@shared/reusable-components/posts/post-card/post-card.component';
import { PostService } from '@app/services/posts/post.service';
import { SkeletonModule } from "primeng/skeleton";
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ButtonModule, ProgressSpinnerModule,
    MessageModule, AccordionModule, ProfileAvatarComponent, SkillsDisplayComponent,
    ExperienceDisplayComponent, EducationDisplayComponent, PersonalProjectsDisplayComponent,
    SavedJobsDisplayComponent, PostCardComponent, SkeletonModule, HasPermissionDirective
],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent implements OnInit {
  // Dependency Injection
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly postService = inject(PostService);

  // State Management with Signals
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  profileData = signal<ParsedUserProfile | null>(null);

  // Activity
  myPosts = signal<PostResponse[]>([]);
  isPostsLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user: User | null) => {
          if (user) {
            this.profileData.set(this.parseProfile(user));
            this.error.set(null);

            if (user.userCode) {
              this.loadmyPosts(user.userCode);
            }
          } 
          else {
            this.profileData.set(null);
            this.error.set('You are not logged in or session has expired.');
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error fetching current user:', err);
          this.error.set('Failed to load profile data.');
          this.loading.set(false);
        }
      });
  }

  /**
   * Parse User object (từ Auth) sang ParsedUserProfile
   * Lưu ý: Hãy đảm bảo object `User` của bạn có chứa các thuộc tính JSON này.
   * Nếu không, bạn có thể phải gọi thêm API UserProfileService ở đây.
   */
  private parseProfile(user: User): ParsedUserProfile {
    return {
      id: user.id || '',
      userCode: user.userCode || '',
      fullName: user.fullName || 'Anonymous User',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      gender: user.gender as Gender,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl || null,
      skills: this.parseJsonField<SkillsJson>((user as any).skills),
      experience: this.parseJsonField<ExperienceJson>((user as any).experience),
      education: this.parseJsonField<EducationJson>((user as any).education),
      personalProjects: this.parseJsonField<PersonalProjectsJson>((user as any).personalProjects),
      portfolioUrl: (user as any).portfolioUrl,
      savedJobs: this.parseJsonField<SavedJobsJson>((user as any).savedJobs),
    };
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      .then(() => {
        this.toastService.showSuccess('Copied!', 'Account ID has been copied to clipboard.');
      })
      .catch(err => {
        console.error('Lỗi khi copy: ', err);
        this.toastService.showError('Error', 'Failed to copy Account ID.');
      });
    } 
    else {
      this.toastService.showWarning('Warning', 'Your browser does not support copying.');
    }
  }

  /**
   * Parse JSON string field safely
   */
  private parseJsonField<T>(jsonString: string | null | undefined): T | null {
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
   * Retry loading profile (Dùng trong trường hợp reload force)
   */
  retry(): void {
    this.loading.set(true);
    this.error.set(null);
    setTimeout(() => this.loading.set(false), 500); 
  }

  /**
   * Handle loading user's own posts for the "My Activity" tab
   */
  loadmyPosts(userCode: string) {
    this.isPostsLoading.set(true);
    this.postService.getMyFeed(userCode, 2, undefined, undefined).subscribe({
      next: (posts: PostResponse[]) => {
        this.myPosts.set(posts || []);
        this.isPostsLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load recent posts', err);
        this.isPostsLoading.set(false);
      }
    });
  }

  handleHidePost(postCode: string) {
    this.myPosts.update(posts => {
      const post = posts.find(p => p.postCode === postCode);
      if (post) post.isHidden = true;
      return [...posts];
    });

    this.postService.hidePost(postCode).subscribe({
      next: () => {},
      error: (err) => {
        this.myPosts.update(posts => {
          const post = posts.find(p => p.postCode === postCode);
          if (post) post.isHidden = false;
          return [...posts];
        });
        this.toastService.showError('Error', 'Could not hide post.');
        console.error('Hide post failed', err);
      }
    });
  }

  undoHidePost(post: PostResponse) {
    this.myPosts.update(posts => {
      const p = posts.find(x => x.postCode === post.postCode);
      if (p) p.isHidden = false;
      return [...posts];
    });

    this.postService.unhidePost(post.postCode).subscribe({
      next: () => {},
      error: (err) => {
        this.myPosts.update(posts => {
          const p = posts.find(x => x.postCode === post.postCode);
          if (p) p.isHidden = true;
          return [...posts];
        });
        this.toastService.showError('Error', 'Could not undo hide post.');
        console.error('Undo hide post failed', err);
      }
    });
  }
}