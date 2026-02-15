import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { SkillsJson, SkillItem } from '../../../../models/user-profile/profile-json-structures.model';
import { SkillLevel, SkillLevelLabels } from '../../../../models/user-profile/skill-level.enum';

@Component({
  selector: 'app-skills-display',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './skills-display.component.html',
  styleUrls: ['./skills-display.component.scss']
})
export class SkillsDisplayComponent {
  /**
   * Skills JSON data
   */
  @Input() skillsData: SkillsJson | null = null;

  /**
   * Get skill items from the data
   */
  get skills(): SkillItem[] {
    return this.skillsData?.skills || [];
  }

  /**
   * Get skill level label
   */
  getSkillLevelLabel(level: SkillLevel): string {
    return SkillLevelLabels[level] || level;
  }

  /**
   * Get severity color for skill level tag
   */
  getSkillLevelSeverity(level: SkillLevel): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    const severityMap: Record<SkillLevel, 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast'> = {
      beginner: 'secondary',
      intermediate: 'info',
      advanced: 'warning',
      expert: 'success'
    };
    return severityMap[level] || 'info';
  }

  /**
   * Format years of experience
   */
  formatYearsOfExperience(years?: number): string {
    if (!years && years !== 0) {
      return '';
    }
    return years === 1 ? '1 year' : `${years} years`;
  }
}

