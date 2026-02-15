import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalProjectsJson, PersonalProjectItem } from '../../../../models/user-profile/profile-json-structures.model';

@Component({
  selector: 'app-personal-projects-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personal-projects-display.component.html',
  styleUrls: ['./personal-projects-display.component.scss']
})
export class PersonalProjectsDisplayComponent {
  /**
   * Personal Projects JSON data
   */
  @Input() personalProjectsData: PersonalProjectsJson | null = null;

  /**
   * Get project items from the data
   */
  get projects(): PersonalProjectItem[] {
    return this.personalProjectsData?.projects || [];
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
  getDateRange(project: PersonalProjectItem): string {
    const startDate = this.formatDate(project.startDate);
    const endDate = project.isCurrent 
      ? 'Present' 
      : this.formatDate(project.endDate);
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

  /**
   * Open URL in new tab
   */
  openUrl(url: string): void {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}

