import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutColumn, LayoutConfiguration, LayoutRow } from '@core/models/cv-builder/cv-template.model';

@Component({
  selector: 'app-layout-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './layout-config-modal.component.html',
  styleUrls: ['./layout-config-modal.component.scss']
})
export class LayoutConfigModalComponent {
  @Input() show: boolean = false;
  @Input() layoutConfig: LayoutConfiguration | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<LayoutConfiguration>();

  configForm: Partial<LayoutConfiguration> = {
    name: '',
    description: '',
    rows: [],
    totalColumns: 1,
    isDefault: false
  };

  ngOnInit() {
    if (this.layoutConfig) {
      this.configForm = { ...this.layoutConfig };
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.configForm = {
      id: this.generateId(),
      name: '',
      description: '',
      rows: [this.createDefaultRow()],
      totalColumns: 1,
      isDefault: false,
      createdDate: new Date(),
      modifiedDate: new Date()
    };
  }

  createDefaultRow(): LayoutRow {
    return {
      id: this.generateId(),
      columns: [this.createDefaultColumn()],
      order: 0
    };
  }

  createDefaultColumn(): LayoutColumn {
    return {
      id: this.generateId(),
      widthPercentage: 100,
      sections: [],
      minWidth: 10,
      maxWidth: 90
    };
  }

  generateId(): string {
    return 'layout_' + Math.random().toString(36).substr(2, 9);
  }

  addRow() {
    if (!this.configForm.rows) this.configForm.rows = [];
    
    const newRow: LayoutRow = {
      id: this.generateId(),
      columns: [this.createDefaultColumn()],
      order: this.configForm.rows.length
    };
    
    this.configForm.rows.push(newRow);
    this.updateTotalColumns();
  }

  removeRow(rowIndex: number) {
    if (!this.configForm.rows) return;
    
    this.configForm.rows.splice(rowIndex, 1);
    // Reorder remaining rows
    this.configForm.rows.forEach((row, index) => {
      row.order = index;
    });
    this.updateTotalColumns();
  }

  addColumn(rowIndex: number) {
    if (!this.configForm.rows || !this.configForm.rows[rowIndex]) return;
    
    const row = this.configForm.rows[rowIndex];
    const currentColumnCount = row.columns.length;
    
    if (currentColumnCount >= 4) return; // Max 4 columns per row
    
    // Redistribute width
    const newWidthPerColumn = Math.floor(100 / (currentColumnCount + 1));
    
    // Update existing columns width
    row.columns.forEach(col => {
      col.widthPercentage = newWidthPerColumn;
    });
    
    // Add new column
    const newColumn: LayoutColumn = {
      id: this.generateId(),
      widthPercentage: newWidthPerColumn,
      sections: [],
      minWidth: 10,
      maxWidth: 90
    };
    
    row.columns.push(newColumn);
    this.updateTotalColumns();
  }

  removeColumn(rowIndex: number, columnIndex: number) {
    if (!this.configForm.rows || !this.configForm.rows[rowIndex]) return;
    
    const row = this.configForm.rows[rowIndex];
    if (row.columns.length <= 1) return; // Minimum 1 column per row
    
    row.columns.splice(columnIndex, 1);
    
    // Redistribute width among remaining columns
    const columnCount = row.columns.length;
    const widthPerColumn = Math.floor(100 / columnCount);
    
    row.columns.forEach((col, index) => {
      if (index === columnCount - 1) {
        // Last column gets remaining width
        col.widthPercentage = 100 - (widthPerColumn * (columnCount - 1));
      } else {
        col.widthPercentage = widthPerColumn;
      }
    });
    
    this.updateTotalColumns();
  }

  onWidthChange(rowIndex: number, columnIndex: number, event: any) {
    if (!this.configForm.rows) return;
    
    const newWidth = parseInt(event.target.value);
    const row = this.configForm.rows[rowIndex];
    
    if (newWidth < 10 || newWidth > 90) return;
    
    // Calculate total of other columns
    const otherColumnsTotal = row.columns.reduce((total, col, index) => {
      return index === columnIndex ? total : total + col.widthPercentage;
    }, 0);
    
    // Check if new width would exceed 100%
    if (otherColumnsTotal + newWidth > 100) return;
    
    row.columns[columnIndex].widthPercentage = newWidth;
  }

  updateTotalColumns() {
    if (!this.configForm.rows) return;
    
    this.configForm.totalColumns = Math.max(
      ...this.configForm.rows.map(row => row.columns.length),
      1
    );
  }

  onSave() {
    if (!this.configForm.name?.trim()) {
      alert('Vui lòng nhập tên layout');
      return;
    }

    const layout: LayoutConfiguration = {
      ...this.configForm as LayoutConfiguration,
      modifiedDate: new Date()
    };

    this.save.emit(layout);
  }

  onClose() {
    this.close.emit();
  }

  // Utility methods
  getTotalWidth(row: LayoutRow): number {
    return row.columns.reduce((total, col) => total + col.widthPercentage, 0);
  }

  getColumnCountOptions(): number[] {
    return [1, 2, 3, 4];
  }

  // TrackBy functions for performance
  trackByRow(index: number, row: LayoutRow): string {
    return row.id;
  }

  trackByColumn(index: number, column: LayoutColumn): string {
    return column.id;
  }

  // Helper method for template
  getTotalDropZones(): number {
    return (this.configForm.rows || []).reduce((total, row) => total + row.columns.length, 0);
  }
}