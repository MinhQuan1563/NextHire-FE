import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ExperienceJson, ExperienceItem } from '../../../../models/user-profile/profile-json-structures.model';

@Component({
  selector: 'app-experience-display',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './experience-display.component.html',
  styleUrls: ['./experience-display.component.scss']
})
export class ExperienceDisplayComponent {
  /**
   * Experience JSON data
   */
  @Input() experienceData: ExperienceJson | null = null;

  /**
   * Get experience items from the data
   */
  get experiences(): ExperienceItem[] {
    return this.experienceData?.experiences || [];
  }

  /**
   * Format date string to readable format
   */
  formatDate(dateString: string | null): string {
    if (!dateString) {
      return 'Present';
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch {
      return dateString;
    }
  }

  /**
   * Get date range string
   */
  getDateRange(experience: ExperienceItem): string {
    const startDate = this.formatDate(experience.startDate);
    const endDate = experience.isCurrent 
      ? 'Present' 
      : this.formatDate(experience.endDate);
    return `${startDate} - ${endDate}`;
  }

  /**
   * Calculate duration in years and months
   */
  calculateDuration(startDate: string, endDate: string | null, isCurrent: boolean): string {
    try {
      const start = new Date(startDate);
      const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : new Date());
      
      const years = end.getFullYear() - start.getFullYear();
      const months = end.getMonth() - start.getMonth();
      
      let totalMonths = years * 12 + months;
      if (totalMonths < 0) totalMonths = 0;
      
      const yearsPart = Math.floor(totalMonths / 12);
      const monthsPart = totalMonths % 12;
      
      if (yearsPart === 0) {
        return monthsPart === 1 ? '1 month' : `${monthsPart} months`;
      } else if (monthsPart === 0) {
        return yearsPart === 1 ? '1 year' : `${yearsPart} years`;
      } else {
        const yearStr = yearsPart === 1 ? '1 year' : `${yearsPart} years`;
        const monthStr = monthsPart === 1 ? '1 month' : `${monthsPart} months`;
        return `${yearStr} ${monthStr}`;
      }
    } catch {
      return '';
    }
  }
}

