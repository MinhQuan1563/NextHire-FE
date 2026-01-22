import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';

// Components
import { SidebarTabsComponent } from './components/sidebar-tabs/sidebar-tabs.component';
import { DesignPanelComponent } from './components/design-panel/design-panel.component';
import { SectionsPanelComponent } from './components/sections-panel/sections-panel.component';
import { LayoutPanelComponent } from './components/layout-panel/layout-panel.component';
import { EditToolbarComponent } from './components/edit-toolbar/edit-toolbar.component';
import { CvPreviewComponent } from './components/cv-preview/cv-preview.component';
import { LayoutConfigModalComponent } from './components/layout-config-modal/layout-config-modal.component';
import { LayoutManagementComponent } from './components/layout-management/layout-management.component';

// Services
import { CVEditorStore } from './store/cv-editor.store';
import { DesignSettingsService } from './services/design-settings.service';
import { ModalManagementService } from './services/modal-management.service';
import { LayoutManagementService } from './services/layout-management.service';
import { CVDataFacadeService, UsedSection } from './services/cv-data-facade.service';
import { EditToolbarService } from './services/edit-toolbar.service';

// Models
import { 
  CVCategory, 
  CVSection, 
  LayoutConfiguration,
  DragDropData 
} from '@core/models/cv-builder/cv-builder.model';

/**
 * Refactored CV Editor Component - Clean và maintainable
 * Sử dụng services để tách biệt logic tương tự React hooks
 */
@Component({
  selector: 'app-cv-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarTabsComponent,
    DesignPanelComponent,
    SectionsPanelComponent,
    LayoutPanelComponent,
    EditToolbarComponent,
    CvPreviewComponent,
    LayoutConfigModalComponent,
    LayoutManagementComponent
  ],
  templateUrl: './cv-editor.component.html',
  styleUrls: ['./cv-editor.component.scss']
})
export class CvEditorComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  private destroy$ = new Subject<void>();
  
  // Public observables for template
  designSettings$ = this.designSettingsService.settings$;
  modalState$ = this.modalManagementService.modalState$;
  editContext$ = this.modalManagementService.editContext$;
  formData$ = this.modalManagementService.formData$;
  toolbarState$ = this.editToolbarService.toolbarState$;
  
  // CV Data observables
  categories$ = this.cvDataFacade.categories$;
  usedSections$ = this.cvDataFacade.usedSections$;
  availableSections$ = this.cvDataFacade.availableSections$;
  cvData$ = this.cvDataFacade.cvData$;
  
  // Layout observables
  layoutConfigurations$ = this.layoutManagementService.configurations$;
  currentLayoutConfig$ = this.layoutManagementService.currentConfig$;
  
  // UI State (minimal, most moved to services)
  activeTab = 'design';
  isZoomed = false;
  selectedAvatarUrl = '';
  
  constructor(
    private cvEditorStore: CVEditorStore,
    private designSettingsService: DesignSettingsService,
    private modalManagementService: ModalManagementService,
    private layoutManagementService: LayoutManagementService,
    private cvDataFacade: CVDataFacadeService,
    private editToolbarService: EditToolbarService
  ) {}
  
  ngOnInit(): void {
    this.initializeServices();
    this.subscribeToStateChanges();
    console.log('CV Builder initialized with clean architecture');
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.editToolbarService.cleanup();
  }
  
  /**
   * Service Initialization
   */
  private initializeServices(): void {
    // Load saved data
    this.designSettingsService.loadSettings();
    this.layoutManagementService.loadConfigurations();
    this.cvDataFacade.loadFromStorage();
    
    // Initialize default layout if none exists
    this.initializeDefaultLayoutIfNeeded();
  }
  
  private initializeDefaultLayoutIfNeeded(): void {
    this.layoutConfigurations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(configs => {
        if (configs.length === 0) {
          const defaultLayout = this.layoutManagementService.createDefaultLayout();
          this.layoutManagementService.addConfiguration(defaultLayout);
          this.layoutManagementService.setCurrentConfiguration(defaultLayout);
        }
      });
  }
  
  /**
   * State Subscriptions
   */
  private subscribeToStateChanges(): void {
    // Auto-save when settings change
    this.designSettings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.designSettingsService.saveSettings();
      });
    
    // Auto-save layout configurations
    this.layoutConfigurations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.layoutManagementService.saveConfigurations();
      });
  }
  
  /**
   * ===================
   * TEMPLATE METHODS - Simplified event handlers
   * ===================
   */
  
  // Tab Management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  // Design Panel Events
  onFontChange(font: string): void {
    this.designSettingsService.updateFont(font);
  }
  
  onFontSizeChange(size: number): void {
    this.designSettingsService.updateFontSize(size);
  }
  
  onLineSpacingChange(spacing: number): void {
    this.designSettingsService.updateLineSpacing(spacing);
  }
  
  onColorChange(color: string): void {
    this.designSettingsService.updateColor(color);
  }
  
  onColorPickerChange(color: string): void {
    this.designSettingsService.updateColor(color);
  }
  
  onBackgroundChange(background: string): void {
    this.designSettingsService.updateBackground(background);
  }
  
  // Modal Management
  openCategoryModal(mode: 'add' | 'edit' = 'add'): void {
    this.modalManagementService.openCategoryModal(mode);
  }
  
  closeCategoryModal(): void {
    this.modalManagementService.closeCategoryModal();
  }
  
  openSectionModal(mode: 'add' | 'edit', categoryId?: string): void {
    this.modalManagementService.openSectionModal(mode, categoryId);
  }
  
  closeSectionModal(): void {
    this.modalManagementService.closeSectionModal();
  }
  
  openManagementModal(): void {
    this.modalManagementService.openManagementModal();
  }
  
  closeManagementModal(): void {
    this.modalManagementService.closeManagementModal();
  }
  
  openLayoutConfigModal(): void {
    this.modalManagementService.openLayoutConfigModal();
  }
  
  closeLayoutConfigModal(): void {
    this.modalManagementService.closeLayoutConfigModal();
  }
  
  openLayoutManagementModal(): void {
    this.modalManagementService.openLayoutManagementModal();
  }
  
  closeLayoutManagementModal(): void {
    this.modalManagementService.closeLayoutManagementModal();
  }
  
  // Category Management
  addCategory(): void {
    const formData = this.modalManagementService.getCategoryFormData();
    if (!this.modalManagementService.validateCategoryForm()) return;
    
    const newCategory = this.cvDataFacade.addCategory({
      name: formData.name,
      icon: formData.icon,
      description: formData.description,
      allowMultiple: formData.allowMultiple,
      sections: [],
      isSystemCategory: false,
      order: 0
    });
    
    this.modalManagementService.closeCategoryModal();
  }
  
  updateCategory(): void {
    const formData = this.modalManagementService.getCategoryFormData();
    const editContext = this.modalManagementService.currentEditContext;
    
    if (!editContext.editingCategory || !this.modalManagementService.validateCategoryForm()) return;
    
    this.cvDataFacade.updateCategory(editContext.editingCategory.id, {
      name: formData.name,
      icon: formData.icon,
      description: formData.description,
      allowMultiple: formData.allowMultiple
    });
    
    this.modalManagementService.closeCategoryModal();
  }
  
  editCategory(category: CVCategory): void {
    this.modalManagementService.openCategoryModal('edit', category);
  }
  
  deleteCategory(categoryId: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      this.cvDataFacade.removeCategory(categoryId);
    }
  }
  
  // Section Management
  addSectionToCategory(): void {
    const formData = this.modalManagementService.getSectionFormData();
    const editContext = this.modalManagementService.currentEditContext;
    
    if (!editContext.currentCategoryId || !this.modalManagementService.validateSectionForm()) return;
    
    this.cvDataFacade.addSectionToCategory(editContext.currentCategoryId, {
      name: formData.name,
      icon: formData.icon,
      allowMultiple: formData.allowMultiple
    });
    
    this.modalManagementService.closeSectionModal();
  }
  
  updateSection(): void {
    const formData = this.modalManagementService.getSectionFormData();
    const editContext = this.modalManagementService.currentEditContext;
    
    if (!editContext.editingSection || !editContext.currentCategoryId) return;
    
    this.cvDataFacade.updateSectionInCategory(
      editContext.currentCategoryId,
      editContext.editingSection.id,
      {
        name: formData.name,
        icon: formData.icon,
        allowMultiple: formData.allowMultiple
      }
    );
    
    this.modalManagementService.closeSectionModal();
  }
  
  editSection(section: CVSection): void {
    const categoryResult = this.cvDataFacade.findSectionById(section.id);
    if (categoryResult) {
      this.modalManagementService.openSectionModal('edit', categoryResult.category.id, section);
    }
  }
  
  deleteSectionFromCategory(categoryId: string, sectionId: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa section này?')) {
      this.cvDataFacade.removeSectionFromCategory(categoryId, sectionId);
    }
  }
  
  // Layout Management
  addSectionToLayout(section: CVSection): void {
    const categoryResult = this.cvDataFacade.findSectionById(section.id);
    if (categoryResult) {
      this.cvDataFacade.addSectionToLayout(section, categoryResult.category.id);
    }
  }
  
  removeSection(sectionId: string): void {
    this.cvDataFacade.removeSectionFromLayout(sectionId);
  }
  
  reorderSections(sectionIds: string[]): void {
    this.cvDataFacade.reorderSections(sectionIds);
  }
  
  onLayoutConfigSave(config: LayoutConfiguration): void {
    this.layoutManagementService.addConfiguration(config);
    this.layoutManagementService.setCurrentConfiguration(config);
    this.modalManagementService.closeLayoutConfigModal();
  }
  
  onLayoutUpdated(config: LayoutConfiguration): void {
    this.layoutManagementService.updateConfiguration(config);
  }
  
  onSectionPlaced(data: { section: CVSection; config: LayoutConfiguration }): void {
    this.layoutManagementService.updateConfiguration(data.config);
    // Remove from available sections if not allowing multiple
    if (!data.section.allowMultiple) {
      this.cvDataFacade.removeSectionFromLayout(data.section.id);
    }
  }
  
  // Drag & Drop Events
  onDragStart(event: DragEvent, section: CVSection): void {
    this.layoutManagementService.startDragging(section);
  }
  
  onDrop(event: DragEvent, targetSection?: UsedSection): void {
    // Handle drop logic through layout management service
    this.layoutManagementService.endDragging();
  }
  
  // CV Data Events
  updateField(fieldName: string, event: Event): void {
    const target = event.target as HTMLElement;
    const value = target.textContent || target.innerText;
    this.cvDataFacade.updateField(fieldName, value);
  }
  
  addExperience(): void {
    this.cvDataFacade.addExperience();
  }
  
  removeExperience(index: number): void {
    this.cvDataFacade.removeExperience(index);
  }
  
  addResponsibility(expIndex: number): void {
    this.cvDataFacade.addResponsibility(expIndex);
  }
  
  removeResponsibility(expIndex: number, respIndex: number): void {
    this.cvDataFacade.removeResponsibility(expIndex, respIndex);
  }
  
  // Edit Toolbar Events
  onEditableClick(event: MouseEvent, fieldName: string): void {
    const element = event.target as HTMLElement;
    this.editToolbarService.onElementClick(event, element);
  }
  
  showEditToolbar(): boolean {
    return this.editToolbarService.currentToolbarState.isVisible;
  }
  
  get editToolbarPosition(): { x: number; y: number } {
    return this.editToolbarService.currentToolbarState.position;
  }
  
  hideEditToolbar(): void {
    this.editToolbarService.hideToolbar();
  }
  
  // Text formatting methods
  makeBold(): void {
    this.editToolbarService.makeBold();
  }
  
  makeItalic(): void {
    this.editToolbarService.makeItalic();
  }
  
  makeUnderline(): void {
    this.editToolbarService.makeUnderline();
  }
  
  createBulletList(): void {
    this.editToolbarService.createBulletList();
  }
  
  createNumberList(): void {
    this.editToolbarService.createNumberList();
  }
  
  changeFontSize(size: string): void {
    this.editToolbarService.changeFontSize(parseInt(size));
  }
  
  alignLeft(): void {
    this.editToolbarService.alignLeft();
  }
  
  alignCenter(): void {
    this.editToolbarService.alignCenter();
  }
  
  alignRight(): void {
    this.editToolbarService.alignRight();
  }
  
  alignJustify(): void {
    this.editToolbarService.alignJustify();
  }
  
  // Preview Events
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedAvatarUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  
  zoomCV(): void {
    this.isZoomed = !this.isZoomed;
  }
  
  downloadCV(): void {
    // Implement download logic
    window.print();
  }
  
  // Computed properties for template
  get getUnusedSections(): CVSection[] {
    // This will be handled by the availableSections$ observable
    return [];
  }
  
  // TrackBy functions
  trackByCategory = this.cvDataFacade.trackByCategory;
  trackBySection = this.cvDataFacade.trackBySection;
  trackByUsedSection = this.cvDataFacade.trackByUsedSection;
  
  // Helper methods for template
  getTotalSections(): number {
    return this.cvDataFacade.getTotalSections();
  }
}