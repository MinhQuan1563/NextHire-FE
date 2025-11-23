import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CVEditorState, initialCVEditorState } from './cv-editor.state';
import { 
  CVCategory, 
  CVSection, 
  LayoutConfiguration 
} from '../../../../models/cv-builder/cv-template.model';
import { DesignSettings } from '../services/design-settings.service';

/**
 * CV Editor Store Service - Quản lý state tập trung cho CV Editor
 * Tương tự như Redux store nhưng sử dụng RxJS
 */
@Injectable({
  providedIn: 'root'
})
export class CVEditorStore {
  private readonly _state$ = new BehaviorSubject<CVEditorState>(initialCVEditorState);
  
  // Public state observables
  public readonly state$ = this._state$.asObservable();
  
  // Getters for current state
  get currentState(): CVEditorState {
    return this._state$.value;
  }
  
  // Specific state selectors
  get activeTab$(): Observable<string> {
    return new BehaviorSubject(this.currentState.activeTab);
  }
  
  get designSettings$(): Observable<DesignSettings> {
    return new BehaviorSubject(this.currentState.designSettings);
  }
  
  get categories$(): Observable<CVCategory[]> {
    return new BehaviorSubject(this.currentState.categories);
  }
  
  get modals$(): Observable<CVEditorState['modals']> {
    return new BehaviorSubject(this.currentState.modals);
  }
  
  get editToolbar$(): Observable<CVEditorState['editToolbar']> {
    return new BehaviorSubject(this.currentState.editToolbar);
  }
  
  // State update methods (mutations)
  
  /**
   * Update partial state
   */
  private updateState(partialState: Partial<CVEditorState>): void {
    const newState = { ...this.currentState, ...partialState };
    this._state$.next(newState);
  }
  
  /**
   * UI Actions
   */
  setActiveTab(tab: string): void {
    this.updateState({ activeTab: tab });
  }
  
  toggleZoom(): void {
    this.updateState({ isZoomed: !this.currentState.isZoomed });
  }
  
  setAvatarUrl(url: string): void {
    this.updateState({ selectedAvatarUrl: url });
  }
  
  /**
   * Design Settings Actions
   */
  updateDesignSettings(settings: Partial<DesignSettings>): void {
    const newDesignSettings = { ...this.currentState.designSettings, ...settings };
    this.updateState({ designSettings: newDesignSettings });
  }
  
  /**
   * Categories Actions
   */
  setCategories(categories: CVCategory[]): void {
    this.updateState({ categories });
  }
  
  addCategory(category: CVCategory): void {
    const categories = [...this.currentState.categories, category];
    this.updateState({ categories });
  }
  
  updateCategory(updatedCategory: CVCategory): void {
    const categories = this.currentState.categories.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    );
    this.updateState({ categories });
  }
  
  removeCategory(categoryId: string): void {
    const categories = this.currentState.categories.filter(cat => cat.id !== categoryId);
    this.updateState({ categories });
  }
  
  /**
   * Modal Actions
   */
  openModal(modalName: keyof CVEditorState['modals'], mode: 'add' | 'edit' = 'add'): void {
    const modals = {
      ...this.currentState.modals,
      [modalName]: true,
      modalMode: mode
    };
    this.updateState({ modals });
  }
  
  closeModal(modalName: keyof CVEditorState['modals']): void {
    const modals = {
      ...this.currentState.modals,
      [modalName]: false
    };
    this.updateState({ modals });
  }
  
  closeAllModals(): void {
    const modals = {
      showCategoryModal: false,
      showSectionModal: false,
      showManagementModal: false,
      showLayoutConfigModal: false,
      showLayoutManagementModal: false,
      modalMode: 'add' as const
    };
    this.updateState({ modals });
  }
  
  /**
   * Edit States Actions
   */
  setEditingCategory(category: CVCategory | null): void {
    const editStates = { ...this.currentState.editStates, editingCategory: category };
    this.updateState({ editStates });
  }
  
  setEditingSection(section: CVSection | null): void {
    const editStates = { ...this.currentState.editStates, editingSection: section };
    this.updateState({ editStates });
  }
  
  setCurrentCategoryId(categoryId: string): void {
    const editStates = { ...this.currentState.editStates, currentCategoryId: categoryId };
    this.updateState({ editStates });
  }
  
  /**
   * Edit Toolbar Actions
   */
  showEditToolbar(position: { x: number; y: number }, element: HTMLElement): void {
    const editToolbar = {
      show: true,
      position,
      activeElement: element
    };
    this.updateState({ editToolbar });
  }
  
  hideEditToolbar(): void {
    const editToolbar = {
      show: false,
      position: { x: 0, y: 0 },
      activeElement: null
    };
    this.updateState({ editToolbar });
  }
  
  /**
   * Layout Management Actions
   */
  setLayoutConfigurations(configs: LayoutConfiguration[]): void {
    this.updateState({ layoutConfigurations: configs });
  }
  
  setCurrentLayoutConfig(config: LayoutConfiguration | null): void {
    this.updateState({ currentLayoutConfig: config });
  }
  
  addLayoutConfiguration(config: LayoutConfiguration): void {
    const layoutConfigurations = [...this.currentState.layoutConfigurations, config];
    this.updateState({ layoutConfigurations });
  }
  
  /**
   * Form Actions
   */
  updateCategoryForm(formData: Partial<CVEditorState['forms']['newCategory']>): void {
    const forms = {
      ...this.currentState.forms,
      newCategory: { ...this.currentState.forms.newCategory, ...formData }
    };
    this.updateState({ forms });
  }
  
  updateSectionForm(formData: Partial<CVEditorState['forms']['newSection']>): void {
    const forms = {
      ...this.currentState.forms,
      newSection: { ...this.currentState.forms.newSection, ...formData }
    };
    this.updateState({ forms });
  }
  
  resetCategoryForm(): void {
    const forms = {
      ...this.currentState.forms,
      newCategory: {
        name: '',
        icon: '',
        description: '',
        allowMultiple: false
      }
    };
    this.updateState({ forms });
  }
  
  resetSectionForm(): void {
    const forms = {
      ...this.currentState.forms,
      newSection: {
        name: '',
        icon: '',
        allowMultiple: false
      }
    };
    this.updateState({ forms });
  }
  
  /**
   * Reset entire state
   */
  resetState(): void {
    this._state$.next(initialCVEditorState);
  }
}