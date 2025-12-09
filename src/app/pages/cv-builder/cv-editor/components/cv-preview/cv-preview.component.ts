import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CVData {
  experiences: any[];
  education: any[];
  activities: any[];
  certificates: any[];
  projects: any[];
  references: any[];
}

export interface UsedSection {
  id: string;
  name: string;
  order: number;
}

export interface DesignSettings {
  selectedFont: string;
  fontSize: number;
  lineSpacing: number;
  selectedColor: string;
  selectedBackground: string;
}

@Component({
  selector: 'app-cv-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cv-preview.component.html',
  styleUrls: ['./cv-preview.component.scss']
})
export class CvPreviewComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  @Input() cvData: CVData = {
    experiences: [],
    education: [],
    activities: [],
    certificates: [],
    projects: [],
    references: []
  };
  @Input() usedSections: UsedSection[] = [];
  @Input() designSettings: DesignSettings = {
    selectedFont: 'Roboto',
    fontSize: 14,
    lineSpacing: 1.5,
    selectedColor: '#00B14F',
    selectedBackground: 'white'
  };
  @Input() selectedAvatarUrl: string = '';
  @Input() isZoomed: boolean = false;

  @Output() fileSelected = new EventEmitter<any>();
  @Output() fieldUpdate = new EventEmitter<{fieldName: string, event: any}>();
  @Output() editableClick = new EventEmitter<{event: MouseEvent, fieldName: string}>();
  @Output() zoomToggle = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() experienceAdd = new EventEmitter<void>();
  @Output() experienceRemove = new EventEmitter<number>();
  @Output() responsibilityAdd = new EventEmitter<number>();
  @Output() responsibilityRemove = new EventEmitter<{expIndex: number, respIndex: number}>();

  getSortedUsedSections() {
    return [...this.usedSections].sort((a, b) => a.order - b.order);
  }

  uploadAvatar() {
    // Trigger file input directly
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh!');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB!');
        return;
      }
      
      this.fileSelected.emit(event);
    }
  }

  updateField(fieldName: string, event: any) {
    this.fieldUpdate.emit({ fieldName, event });
  }

  onEditableClick(event: MouseEvent, fieldName: string = '') {
    this.editableClick.emit({ event, fieldName });
  }

  zoomCV() {
    this.zoomToggle.emit();
  }

  downloadCV() {
    this.download.emit();
  }

  addExperience() {
    this.experienceAdd.emit();
  }

  removeExperience(index: number) {
    this.experienceRemove.emit(index);
  }

  addResponsibility(expIndex: number) {
    this.responsibilityAdd.emit(expIndex);
  }

  removeResponsibility(expIndex: number, respIndex: number) {
    this.responsibilityRemove.emit({ expIndex, respIndex });
  }
}