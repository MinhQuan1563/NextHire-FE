import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-cv-section',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './cv-section.component.html',
  styleUrls: ['./cv-section.component.scss']
})
export class CvSectionComponent {
  @Input() sectionTitle: string = '';
  @Input() iconClass: string | undefined;
}