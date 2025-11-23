import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CVSection, DragDropData, LayoutColumn, LayoutConfiguration, LayoutRow, LayoutZone } from '@app/models/cv-builder/cv-template.model';


@Component({
  selector: 'app-layout-management',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './layout-management.component.html',
  styleUrls: ['./layout-management.component.scss']
})
export class LayoutManagementComponent implements OnInit {
  @Input() layoutConfig: LayoutConfiguration | null = null;
  @Input() availableSections: CVSection[] = [];
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() sectionPlaced = new EventEmitter<DragDropData>();
  @Output() layoutUpdated = new EventEmitter<LayoutConfiguration>();

  // Current layout state
  currentLayout: LayoutConfiguration | null = null;
  layoutZones: LayoutZone[] = [];
  
  // Drag drop lists
  availableSectionsList: CVSection[] = [];
  
  // Resizing state
  isResizing = false;
  resizingColumn: { rowIndex: number; columnIndex: number } | null = null;
  initialMouseX = 0;
  initialWidth = 0;

  ngOnInit() {
    if (this.layoutConfig) {
      this.currentLayout = { ...this.layoutConfig };
      this.initializeLayoutZones();
    }
    this.availableSectionsList = [...this.availableSections];
  }

  ngOnChanges() {
    if (this.layoutConfig) {
      this.currentLayout = { ...this.layoutConfig };
      this.initializeLayoutZones();
    }
    this.availableSectionsList = [...this.availableSections];
  }

  initializeLayoutZones() {
    if (!this.currentLayout) return;

    this.layoutZones = [];
    this.currentLayout.rows.forEach(row => {
      row.columns.forEach(column => {
        const zone: LayoutZone = {
          rowId: row.id,
          columnId: column.id,
          sections: this.getSectionsForColumn(column.sections),
          isDropZone: true
        };
        this.layoutZones.push(zone);
      });
    });
  }

  getSectionsForColumn(sectionIds: string[]): CVSection[] {
    return sectionIds.map(id => 
      this.availableSections.find(section => section.id === id)
    ).filter(Boolean) as CVSection[];
  }

  // Drag and Drop Handlers
  onSectionDrop(event: CdkDragDrop<CVSection[]>, targetZone: LayoutZone | null) {
    const sourceZone = this.findZoneByContainerIndex(event.previousContainer.data);
    
    if (event.previousContainer === event.container) {
      // Reordering within same zone
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between zones or from available sections
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    // Update layout configuration only if targetZone exists
    if (targetZone) {
      this.updateLayoutFromZones();
      
      // Emit events
      const dragData: DragDropData = {
        sectionId: event.item.data.id,
        sourceZone,
        targetZone
      };
      this.sectionPlaced.emit(dragData);
    }
  }

  findZoneByContainerIndex(containerData: CVSection[]): LayoutZone | undefined {
    return this.layoutZones.find(zone => zone.sections === containerData);
  }

  updateLayoutFromZones() {
    if (!this.currentLayout) return;

    this.currentLayout.rows.forEach(row => {
      row.columns.forEach(column => {
        const zone = this.layoutZones.find(z => 
          z.rowId === row.id && z.columnId === column.id
        );
        if (zone) {
          column.sections = zone.sections.map(section => section.id);
        }
      });
    });

    this.layoutUpdated.emit(this.currentLayout);
  }

  // Column Resizing Handlers
  startColumnResize(event: MouseEvent, rowIndex: number, columnIndex: number) {
    event.preventDefault();
    this.isResizing = true;
    this.resizingColumn = { rowIndex, columnIndex };
    this.initialMouseX = event.clientX;
    
    if (this.currentLayout?.rows[rowIndex]?.columns[columnIndex]) {
      this.initialWidth = this.currentLayout.rows[rowIndex].columns[columnIndex].widthPercentage;
    }

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent) => {
    if (!this.isResizing || !this.resizingColumn || !this.currentLayout) return;

    const deltaX = event.clientX - this.initialMouseX;
    const containerWidth = 800; // Approximate container width, should get from element
    const deltaPercent = (deltaX / containerWidth) * 100;
    
    const row = this.currentLayout.rows[this.resizingColumn.rowIndex];
    const column = row.columns[this.resizingColumn.columnIndex];
    const nextColumn = row.columns[this.resizingColumn.columnIndex + 1];
    
    if (!nextColumn) return;

    const newWidth = Math.max(10, Math.min(90, this.initialWidth + deltaPercent));
    const widthChange = newWidth - column.widthPercentage;
    
    // Update current and next column
    column.widthPercentage = newWidth;
    nextColumn.widthPercentage = Math.max(10, nextColumn.widthPercentage - widthChange);
  };

  onMouseUp = () => {
    this.isResizing = false;
    this.resizingColumn = null;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    
    if (this.currentLayout) {
      this.layoutUpdated.emit(this.currentLayout);
    }
  };

  // Zone Management
  getZoneForColumn(rowId: string, columnId: string): LayoutZone | undefined {
    return this.layoutZones.find(zone => 
      zone.rowId === rowId && zone.columnId === columnId
    );
  }

  getSectionsForZone(rowId: string, columnId: string): CVSection[] {
    const zone = this.getZoneForColumn(rowId, columnId);
    return zone ? zone.sections : [];
  }

  // UI Helpers
  getConnectedLists(): string[] {
    const zoneIds = this.layoutZones.map((_, index) => `zone-${index}`);
    return ['available-sections', ...zoneIds];
  }

  getZoneId(rowIndex: number, columnIndex: number): string {
    const zoneIndex = this.layoutZones.findIndex(zone => {
      if (!this.currentLayout) return false;
      const row = this.currentLayout.rows[rowIndex];
      const column = row?.columns[columnIndex];
      return zone.rowId === row?.id && zone.columnId === column?.id;
    });
    return `zone-${zoneIndex}`;
  }

  onClose() {
    this.close.emit();
  }

  // Track functions for performance
  trackByRow(index: number, row: LayoutRow): string {
    return row.id;
  }

  trackByColumn(index: number, column: LayoutColumn): string {
    return column.id;
  }

  trackBySection(index: number, section: CVSection): string {
    return section.id;
  }

  // Helper methods for template
  getTotalZones(): number {
    if (!this.currentLayout) return 0;
    return this.currentLayout.rows.reduce((total, row) => total + row.columns.length, 0);
  }

  getTotalPlacedSections(): number {
    if (!this.currentLayout) return 0;
    return this.currentLayout.rows.reduce((total, row) => 
      total + row.columns.reduce((colTotal, col) => colTotal + col.sections.length, 0), 0
    );
  }
}