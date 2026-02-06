import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SavedJobsJson, SavedJobItem } from '../../../../models/user-profile/profile-json-structures.model';

@Component({
  selector: 'app-saved-jobs-display',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './saved-jobs-display.component.html',
  styleUrls: ['./saved-jobs-display.component.scss']
})
export class SavedJobsDisplayComponent {
  /**
   * Saved Jobs JSON data
   */
  @Input() savedJobsData: SavedJobsJson | null = null;

  /**
   * Get saved job items from the data
   */
  get savedJobs(): SavedJobItem[] {
    return this.savedJobsData?.savedJobs || [];
  }

  /**
   * Format saved date to readable format
   */
  formatSavedDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Navigate to job details (placeholder - will be implemented when job page is ready)
   */
  navigateToJob(jobCode: string): void {
    // TODO: Implement navigation to job details page
    console.log('Navigate to job:', jobCode);
  }
}

