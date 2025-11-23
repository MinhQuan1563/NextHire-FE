import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CVSection } from '@app/models/cv-builder/cv-template.model';

@Component({
  selector: 'app-sections-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sections-panel.component.html',
  styleUrls: ['./sections-panel.component.scss']
})
export class SectionsPanelComponent {
  @Input() availableSections: CVSection[] = [];
  @Output() sectionAdd = new EventEmitter<CVSection>();

  onAddSection(section: CVSection) {
    this.sectionAdd.emit(section);
  }
}