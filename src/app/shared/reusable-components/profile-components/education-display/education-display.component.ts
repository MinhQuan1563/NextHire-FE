import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EducationJson, EducationItem } from '../../../../models/user-profile/profile-json-structures.model';

@Component({
  selector: 'app-education-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education-display.component.html',
  styleUrls: ['./education-display.component.scss']
})
export class EducationDisplayComponent {
  /**
   * Education JSON data
   */
  @Input() educationData: EducationJson | null = null;

  /**
   * Get education items from the data
   */
  get educations(): EducationItem[] {
    return this.educationData?.educations || [];
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
  getDateRange(education: EducationItem): string {
    const startDate = this.formatDate(education.startDate);
    const endDate = education.isCurrent 
      ? 'Present' 
      : this.formatDate(education.endDate);
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

