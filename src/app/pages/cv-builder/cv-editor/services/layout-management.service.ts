import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  LayoutConfiguration, 
  LayoutRow, 
  LayoutColumn, 
  DragDropData,
  CVSection 
} from '../../../../models/cv-builder/cv-template.model';

export interface LayoutManagementState {
  configurations: LayoutConfiguration[];
  currentConfig: LayoutConfiguration | null;
  isDragging: boolean;
  dragData: DragDropData | null;
}

/**
 * Layout Management Service - Tương tự như useLayoutManager hook trong React
 * Quản lý layout configurations và drag-drop logic
 */
@Injectable({
  providedIn: 'root'
})
export class LayoutManagementService {
  private readonly _state$ = new BehaviorSubject<LayoutManagementState>({
    configurations: [],
    currentConfig: null,
    isDragging: false,
    dragData: null
  });
  
  // Public observables
  public readonly state$ = this._state$.asObservable();
  
  // Getters
  get currentState(): LayoutManagementState {
    return this._state$.value;
  }
  
  get configurations$(): Observable<LayoutConfiguration[]> {
    return new BehaviorSubject(this.currentState.configurations);
  }
  
  get currentConfig$(): Observable<LayoutConfiguration | null> {
    return new BehaviorSubject(this.currentState.currentConfig);
  }
  
  // Layout Configuration Management
  addConfiguration(config: LayoutConfiguration): void {
    const configurations = [...this.currentState.configurations, config];
    this.updateState({ configurations });
  }
  
  updateConfiguration(updatedConfig: LayoutConfiguration): void {
    const configurations = this.currentState.configurations.map(config =>
      config.id === updatedConfig.id ? updatedConfig : config
    );
    this.updateState({ configurations });
  }
  
  removeConfiguration(configId: string): void {
    const configurations = this.currentState.configurations.filter(
      config => config.id !== configId
    );
    this.updateState({ configurations });
    
    // If current config is removed, clear it
    if (this.currentState.currentConfig?.id === configId) {
      this.updateState({ currentConfig: null });
    }
  }
  
  setCurrentConfiguration(config: LayoutConfiguration | null): void {
    this.updateState({ currentConfig: config });
  }
  
  // Layout Builder Methods
  createDefaultLayout(name: string = 'Layout mặc định'): LayoutConfiguration {
    const defaultConfig: LayoutConfiguration = {
      id: this.generateId(),
      name,
      description: 'Layout CV cơ bản với 2 cột',
      rows: [
        {
          id: this.generateId(),
          columns: [
            {
              id: this.generateId(),
              widthPercentage: 70,
              sections: []
            },
            {
              id: this.generateId(),
              widthPercentage: 30,
              sections: []
            }
          ],
          order: 0
        }
      ],
      totalColumns: 2,
      isDefault: true,
      createdDate: new Date(),
      modifiedDate: new Date()
    };
    
    return defaultConfig;
  }
  
  addRow(configId: string, rowIndex?: number): void {
    const config = this.findConfiguration(configId);
    if (!config) return;
    
    const newRow: LayoutRow = {
      id: this.generateId(),
      columns: [
        {
          id: this.generateId(),
          widthPercentage: 100,
          sections: []
        }
      ],
      order: config.rows.length
    };
    
    const updatedRows = [...config.rows];
    if (rowIndex !== undefined) {
      updatedRows.splice(rowIndex + 1, 0, newRow);
    } else {
      updatedRows.push(newRow);
    }
    
    this.updateConfiguration({
      ...config,
      rows: updatedRows,
      modifiedDate: new Date()
    });
  }
  
  removeRow(configId: string, rowId: string): void {
    const config = this.findConfiguration(configId);
    if (!config || config.rows.length <= 1) return; // Keep at least one row
    
    const updatedRows = config.rows.filter(row => row.id !== rowId);
    this.updateConfiguration({
      ...config,
      rows: updatedRows,
      modifiedDate: new Date()
    });
  }
  
  addColumn(configId: string, rowId: string): void {
    const config = this.findConfiguration(configId);
    if (!config) return;
    
    const updatedRows = config.rows.map(row => {
      if (row.id === rowId && row.columns.length < 4) { // Max 4 columns
        const currentColumnCount = row.columns.length;
        const newWidthPercentage = Math.floor(100 / (currentColumnCount + 1));
        
        // Redistribute existing columns
        const redistributedColumns = row.columns.map(col => ({
          ...col,
          widthPercentage: newWidthPercentage
        }));
        
        // Add new column
        const newColumn: LayoutColumn = {
          id: this.generateId(),
          widthPercentage: newWidthPercentage,
          sections: []
        };
        
        return {
          ...row,
          columns: [...redistributedColumns, newColumn]
        };
      }
      return row;
    });
    
    this.updateConfiguration({
      ...config,
      rows: updatedRows,
      modifiedDate: new Date()
    });
  }
  
  removeColumn(configId: string, rowId: string, columnId: string): void {
    const config = this.findConfiguration(configId);
    if (!config) return;
    
    const updatedRows = config.rows.map(row => {
      if (row.id === rowId && row.columns.length > 1) { // Keep at least one column
        const remainingColumns = row.columns.filter(col => col.id !== columnId);
        const newWidthPercentage = Math.floor(100 / remainingColumns.length);
        
        // Redistribute remaining columns
        const redistributedColumns = remainingColumns.map(col => ({
          ...col,
          widthPercentage: newWidthPercentage
        }));
        
        return {
          ...row,
          columns: redistributedColumns
        };
      }
      return row;
    });
    
    this.updateConfiguration({
      ...config,
      rows: updatedRows,
      modifiedDate: new Date()
    });
  }
  
  updateColumnWidth(configId: string, rowId: string, columnId: string, newWidth: number): void {
    const config = this.findConfiguration(configId);
    if (!config) return;
    
    const updatedRows = config.rows.map(row => {
      if (row.id === rowId) {
        const updatedColumns = row.columns.map(col => {
          if (col.id === columnId) {
            return { ...col, widthPercentage: Math.max(10, Math.min(90, newWidth)) };
          }
          return col;
        });
        
        return { ...row, columns: updatedColumns };
      }
      return row;
    });
    
    this.updateConfiguration({
      ...config,
      rows: updatedRows,
      modifiedDate: new Date()
    });
  }
  
  // Drag and Drop Management
  startDragging(section: CVSection, sourceZone?: string): void {
    const dragData: any = {
      sectionId: section.id,
      section: section,
      sourceZone: sourceZone || 'available-sections'
    };
    
    this.updateState({
      isDragging: true,
      dragData
    });
  }
  
  endDragging(): void {
    this.updateState({
      isDragging: false,
      dragData: null
    });
  }
  
  dropSection(configId: string, rowId: string, columnId: string, section: CVSection): boolean {
    const config = this.findConfiguration(configId);
    if (!config || !this.currentState.dragData) return false;
    
    const dragData = this.currentState.dragData;
    let updatedConfig = { ...config };
    
    // Remove from source if moving within layout
    if (dragData.sourceZone && (dragData.sourceZone as any) !== 'available-sections') {
      updatedConfig = this.removeSectionFromLayout(updatedConfig, section.id);
    }
    
    // Add to target zone
    const updatedRows = updatedConfig.rows.map(row => {
      if (row.id === rowId) {
        const updatedColumns = row.columns.map(col => {
          if (col.id === columnId) {
            return {
              ...col,
              sections: [...col.sections, section.id]
            };
          }
          return col;
        });
        
        return { ...row, columns: updatedColumns };
      }
      return row;
    });
    
    this.updateConfiguration({
      ...updatedConfig,
      rows: updatedRows,
      modifiedDate: new Date()
    });
    
    this.endDragging();
    return true;
  }
  
  removeSectionFromLayout(config: LayoutConfiguration, sectionId: string): LayoutConfiguration {
    const updatedRows = config.rows.map(row => ({
      ...row,
      columns: row.columns.map(col => ({
        ...col,
        sections: col.sections.filter(id => id !== sectionId)
      }))
    }));
    
    return {
      ...config,
      rows: updatedRows
    };
  }
  
  // Utility Methods
  generateId(): string {
    return 'layout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  findConfiguration(configId: string): LayoutConfiguration | undefined {
    return this.currentState.configurations.find(config => config.id === configId);
  }
  
  getTotalDropZones(config: LayoutConfiguration): number {
    return config.rows.reduce((total, row) => total + row.columns.length, 0);
  }
  
  getPlacedSectionsCount(config: LayoutConfiguration): number {
    return config.rows.reduce((total, row) => 
      total + row.columns.reduce((colTotal, col) => colTotal + col.sections.length, 0), 0
    );
  }
  
  getSectionsInZone(config: LayoutConfiguration, rowId: string, columnId: string): string[] {
    const row = config.rows.find(r => r.id === rowId);
    if (!row) return [];
    
    const column = row.columns.find(c => c.id === columnId);
    return column ? column.sections : [];
  }
  
  isValidDropZone(rowId: string, columnId: string): boolean {
    const config = this.currentState.currentConfig;
    if (!config) return false;
    
    const sections = this.getSectionsInZone(config, rowId, columnId);
    return sections.length < 5; // Max 5 sections per zone
  }
  
  // Export/Import
  exportConfiguration(configId: string): string {
    const config = this.findConfiguration(configId);
    if (!config) throw new Error('Configuration not found');
    
    return JSON.stringify(config, null, 2);
  }
  
  importConfiguration(configData: string): LayoutConfiguration {
    try {
      const config = JSON.parse(configData) as LayoutConfiguration;
      config.id = this.generateId(); // Generate new ID to avoid conflicts
      
      this.addConfiguration(config);
      return config;
    } catch (error) {
      throw new Error('Invalid configuration data');
    }
  }
  
  // Private methods
  private updateState(partialState: Partial<LayoutManagementState>): void {
    const newState = { ...this.currentState, ...partialState };
    this._state$.next(newState);
  }
  
  // Observable getters for specific data
  get isDragging$(): Observable<boolean> {
    return new BehaviorSubject(this.currentState.isDragging);
  }
  
  get dragData$(): Observable<DragDropData | null> {
    return new BehaviorSubject(this.currentState.dragData);
  }
  
  // Load/Save to localStorage
  loadConfigurations(): void {
    try {
      const saved = localStorage.getItem('cv-layout-configurations');
      if (saved) {
        const configurations = JSON.parse(saved);
        this.updateState({ configurations });
      }
    } catch (error) {
      console.warn('Could not load layout configurations:', error);
    }
  }
  
  saveConfigurations(): void {
    try {
      localStorage.setItem(
        'cv-layout-configurations', 
        JSON.stringify(this.currentState.configurations)
      );
    } catch (error) {
      console.warn('Could not save layout configurations:', error);
    }
  }
}