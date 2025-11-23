import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UsedSection {
  id: string;
  name: string;
  order: number;
}

@Component({
  selector: 'app-layout-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './layout-panel.component.html',
  styleUrls: ['./layout-panel.component.scss']
})
export class LayoutPanelComponent {
  @Input() usedSections: UsedSection[] = [];
  @Output() sectionRemove = new EventEmitter<UsedSection>();
  @Output() sectionsReorder = new EventEmitter<UsedSection[]>();
  @Output() dragStart = new EventEmitter<{event: DragEvent, section: UsedSection}>();
  @Output() drop = new EventEmitter<{event: DragEvent, targetSection: UsedSection}>();

  getSortedUsedSections() {
    return [...this.usedSections].sort((a, b) => a.order - b.order);
  }

  onRemoveSection(section: UsedSection) {
    this.sectionRemove.emit(section);
  }

  onDragStart(event: DragEvent, section: UsedSection) {
    this.dragStart.emit({ event, section });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetSection: UsedSection) {
    this.drop.emit({ event, targetSection });
  }
}