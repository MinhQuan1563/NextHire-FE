import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CVCategory, CVSection } from '../../../../models/cv-builder/cv-template.model';

export interface ModalState {
  showCategoryModal: boolean;
  showSectionModal: boolean;
  showManagementModal: boolean;
  showLayoutConfigModal: boolean;
  showLayoutManagementModal: boolean;
  modalMode: 'add' | 'edit';
}

export interface EditContext {
  editingCategory: CVCategory | null;
  editingSection: CVSection | null;
  currentCategoryId: string;
}

export interface FormData {
  categoryForm: {
    name: string;
    icon: string;
    description: string;
    allowMultiple: boolean;
  };
  sectionForm: {
    name: string;
    icon: string;
    allowMultiple: boolean;
  };
}

/**
 * Modal Management Service - Tương tự như useModal hook trong React
 * Quản lý tất cả modal states, forms và edit context
 */
@Injectable({
  providedIn: 'root'
})
export class ModalManagementService {
  private readonly _modalState$ = new BehaviorSubject<ModalState>({
    showCategoryModal: false,
    showSectionModal: false,
    showManagementModal: false,
    showLayoutConfigModal: false,
    showLayoutManagementModal: false,
    modalMode: 'add'
  });
  
  private readonly _editContext$ = new BehaviorSubject<EditContext>({
    editingCategory: null,
    editingSection: null,
    currentCategoryId: ''
  });
  
  private readonly _formData$ = new BehaviorSubject<FormData>({
    categoryForm: {
      name: '',
      icon: '',
      description: '',
      allowMultiple: false
    },
    sectionForm: {
      name: '',
      icon: '',
      allowMultiple: false
    }
  });
  
  // Public observables
  public readonly modalState$ = this._modalState$.asObservable();
  public readonly editContext$ = this._editContext$.asObservable();
  public readonly formData$ = this._formData$.asObservable();
  
  // Getters
  get currentModalState(): ModalState {
    return this._modalState$.value;
  }
  
  get currentEditContext(): EditContext {
    return this._editContext$.value;
  }
  
  get currentFormData(): FormData {
    return this._formData$.value;
  }
  
  // Modal Control Methods
  openCategoryModal(mode: 'add' | 'edit' = 'add', category?: CVCategory): void {
    this.updateModalState({
      showCategoryModal: true,
      modalMode: mode
    });
    
    if (mode === 'edit' && category) {
      this.setEditingCategory(category);
      this.updateCategoryForm({
        name: category.name,
        icon: category.icon,
        description: category.description || '',
        allowMultiple: category.allowMultiple
      });
    } else {
      this.resetCategoryForm();
    }
  }
  
  closeCategoryModal(): void {
    this.updateModalState({ showCategoryModal: false });
    this.setEditingCategory(null);
    this.resetCategoryForm();
  }
  
  openSectionModal(mode: 'add' | 'edit' = 'add', categoryId?: string, section?: CVSection): void {
    this.updateModalState({
      showSectionModal: true,
      modalMode: mode
    });
    
    if (categoryId) {
      this.setCurrentCategoryId(categoryId);
    }
    
    if (mode === 'edit' && section) {
      this.setEditingSection(section);
      this.updateSectionForm({
        name: section.name,
        icon: section.icon,
        allowMultiple: section.allowMultiple
      });
    } else {
      this.resetSectionForm();
    }
  }
  
  closeSectionModal(): void {
    this.updateModalState({ showSectionModal: false });
    this.setEditingSection(null);
    this.setCurrentCategoryId('');
    this.resetSectionForm();
  }
  
  openManagementModal(): void {
    this.updateModalState({ showManagementModal: true });
  }
  
  closeManagementModal(): void {
    this.updateModalState({ showManagementModal: false });
  }
  
  openLayoutConfigModal(): void {
    this.updateModalState({ showLayoutConfigModal: true });
  }
  
  closeLayoutConfigModal(): void {
    this.updateModalState({ showLayoutConfigModal: false });
  }
  
  openLayoutManagementModal(): void {
    this.updateModalState({ showLayoutManagementModal: true });
  }
  
  closeLayoutManagementModal(): void {
    this.updateModalState({ showLayoutManagementModal: false });
  }
  
  closeAllModals(): void {
    this._modalState$.next({
      showCategoryModal: false,
      showSectionModal: false,
      showManagementModal: false,
      showLayoutConfigModal: false,
      showLayoutManagementModal: false,
      modalMode: 'add'
    });
    this.resetAllForms();
    this.resetEditContext();
  }
  
  // Edit Context Methods
  setEditingCategory(category: CVCategory | null): void {
    this.updateEditContext({ editingCategory: category });
  }
  
  setEditingSection(section: CVSection | null): void {
    this.updateEditContext({ editingSection: section });
  }
  
  setCurrentCategoryId(categoryId: string): void {
    this.updateEditContext({ currentCategoryId: categoryId });
  }
  
  // Form Management Methods
  updateCategoryForm(formData: Partial<FormData['categoryForm']>): void {
    const currentForm = this.currentFormData.categoryForm;
    const updatedForm = { ...currentForm, ...formData };
    this.updateFormData({ categoryForm: updatedForm });
  }
  
  updateSectionForm(formData: Partial<FormData['sectionForm']>): void {
    const currentForm = this.currentFormData.sectionForm;
    const updatedForm = { ...currentForm, ...formData };
    this.updateFormData({ sectionForm: updatedForm });
  }
  
  resetCategoryForm(): void {
    this.updateFormData({
      categoryForm: {
        name: '',
        icon: '',
        description: '',
        allowMultiple: false
      }
    });
  }
  
  resetSectionForm(): void {
    this.updateFormData({
      sectionForm: {
        name: '',
        icon: '',
        allowMultiple: false
      }
    });
  }
  
  resetAllForms(): void {
    this.resetCategoryForm();
    this.resetSectionForm();
  }
  
  // Validation Methods
  validateCategoryForm(): boolean {
    const form = this.currentFormData.categoryForm;
    return form.name.trim().length > 0;
  }
  
  validateSectionForm(): boolean {
    const form = this.currentFormData.sectionForm;
    return form.name.trim().length > 0;
  }
  
  // Form Submission Helpers
  getCategoryFormData(): FormData['categoryForm'] {
    return { ...this.currentFormData.categoryForm };
  }
  
  getSectionFormData(): FormData['sectionForm'] {
    return { ...this.currentFormData.sectionForm };
  }
  
  // Utility Methods
  isModalOpen(modalName: keyof ModalState): boolean {
    return this.currentModalState[modalName] as boolean;
  }
  
  getActiveModalCount(): number {
    const state = this.currentModalState;
    return Object.keys(state)
      .filter(key => key.startsWith('show') && state[key as keyof ModalState])
      .length;
  }
  
  // Private update methods
  private updateModalState(partialState: Partial<ModalState>): void {
    const newState = { ...this.currentModalState, ...partialState };
    this._modalState$.next(newState);
  }
  
  private updateEditContext(partialContext: Partial<EditContext>): void {
    const newContext = { ...this.currentEditContext, ...partialContext };
    this._editContext$.next(newContext);
  }
  
  private updateFormData(partialData: Partial<FormData>): void {
    const newData = { ...this.currentFormData, ...partialData };
    this._formData$.next(newData);
  }
  
  private resetEditContext(): void {
    this._editContext$.next({
      editingCategory: null,
      editingSection: null,
      currentCategoryId: ''
    });
  }
  
  // Observable selectors for specific properties
  get categoryForm$(): Observable<FormData['categoryForm']> {
    return new BehaviorSubject(this.currentFormData.categoryForm);
  }
  
  get sectionForm$(): Observable<FormData['sectionForm']> {
    return new BehaviorSubject(this.currentFormData.sectionForm);
  }
  
  get isAnyModalOpen$(): Observable<boolean> {
    return new BehaviorSubject(this.getActiveModalCount() > 0);
  }
}