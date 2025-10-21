import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-skill-tags',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './skill-tags.component.html',
  styleUrls: ['./skill-tags.component.scss']
})
export class SkillTagsComponent {
  @Input() skills: string[] = [];
  @Input() severity: 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' = 'info';
}