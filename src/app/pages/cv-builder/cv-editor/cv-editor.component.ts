import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  effect,
  EffectRef,
  signal,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SidebarTabsComponent } from "./components/sidebar-tabs/sidebar-tabs.component";
import { DesignPanelComponent } from "./components/design-panel/design-panel.component";
import {
  LayoutPanelComponent,
  UsedSection,
} from "./components/layout-panel/layout-panel.component";
import { EditToolbarComponent } from "./components/edit-toolbar/edit-toolbar.component";
import { CvPreviewComponent } from "./components/cv-preview/cv-preview.component";
import {
  CVSection,
  LayoutConfiguration,
  LayoutRow,
  LayoutColumn,
  CvTemplate,
} from "../../../models/cv-builder/cv-template.model";
import {
  DesignHandlerService,
  DesignSettings,
} from "./services/design-handler.service";
import { EditToolbarService } from "./services/edit-toolbar.service";
import {
  CvPdfExportService,
  ValidationResult,
} from "./services/cv-pdf-export.service";
import { Subscription } from "rxjs";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { MessageService } from "primeng/api";
import { ManageSectionComponent } from "./components/manage-sections/manage-section.component";
import { LayoutConfigModalComponent } from "./components/layout-config-modal/layout-config-modal.component";
import { SaveTemplateDialogComponent } from "./components/save-template-dialog/save-template-dialog.component";
import { CvTemplateStore } from "./stores/cv-template.store";
import { AuthService } from "../../../services/auth/auth.service";
import { CvTemplateService } from "../../../services/cv-builder/cv-template.service";
import { CvTemplateType } from "../../../models/cv-builder/cv-template.model";

/**
 * CV Editor Component
 *
 * Main component for CV template editing with grid-based layout management.
 *
 * Features:
 * - Design panel for fonts, colors, and styling
 * - Layout panel with drag & drop for rows, columns, and sections
 * - Real-time CV preview that reflects layout changes immediately
 * - Section management modal for adding/editing sections
 * - Layout configuration modal for defining row/column structure
 *
 * Layout System:
 * - Grid-based: Rows → Columns → Sections
 * - Sections can be dragged between columns and rows
 * - Unused sections can be activated by dragging to layout
 * - Active sections can be deactivated by dragging to unused area
 * - Locked sections cannot be moved or removed
 */
@Component({
  selector: "app-admin-template",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarTabsComponent,
    DesignPanelComponent,
    LayoutPanelComponent,
    EditToolbarComponent,
    CvPreviewComponent,
    ManageSectionComponent,
    LayoutConfigModalComponent,
    SaveTemplateDialogComponent,
    ButtonModule,
    DialogModule,
    ToastModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService],
  templateUrl: "./cv-editor.component.html",
  styleUrls: ["./cv-editor.component.scss"],
})
export class CvEditorComponent implements OnInit, OnDestroy {
  // Sidebar state
  activeTab: string = "design";

  // Preview state
  isZoomed: boolean = false;

  // Design settings
  designSettings: DesignSettings;

  // Toolbar state - now managed by service
  showEditToolbar = false;
  editToolbarPosition = { x: 0, y: 0 };

  // Section management state
  showManagementModal: boolean = false;
  modalMode: "add" | "edit" = "add";

  // Layout management state
  showLayoutConfigModal: boolean = false;

  // Save template dialog state
  showSaveTemplateDialog: boolean = false;

  // PDF export state
  isExporting: boolean = false;

  // Reference to CV preview component for PDF export
  @ViewChild(CvPreviewComponent) cvPreviewComponent?: CvPreviewComponent;

  // Layout configuration from store
  layoutConfiguration?: LayoutConfiguration;

  // All sections from store
  allSections: CVSection[] = [];

  // Legacy support for flat layout (backward compatibility)
  usedSections: UsedSection[] = [];
  availableLayoutSections: UsedSection[] = [];

  // Subscriptions
  private subscriptions: Subscription = new Subscription();

  // Signal effect reference for reacting to store changes
  private layoutEffect?: EffectRef;

  // Admin check
  isAdmin = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  
  // Track if we're in admin context (for navigation after save)
  private isAdminContext = false;

  // Expose template store for template access
  cvTemplateStore = inject(CvTemplateStore);

  constructor(
    private designHandler: DesignHandlerService,
    private editToolbar: EditToolbarService,
    private pdfExportService: CvPdfExportService,
    private messageService: MessageService,
    private authService: AuthService,
    private cvTemplateService: CvTemplateService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.designSettings = this.designHandler.getDefaultDesignSettings();

    // React to section & layout changes in the store
    // This ensures the layout panel and preview always reflect the latest state
    this.layoutEffect = effect(() => {
      const sections = this.cvTemplateStore.sections();
      const layoutConfig = this.cvTemplateStore.layoutConfiguration();

      this.allSections = sections;
      this.layoutConfiguration = layoutConfig;

      // Also update legacy flat layout for backward compatibility
      this.rebuildLegacyLayout(sections, layoutConfig);
    });
  }

  ngOnInit() {
    this.setupSubscriptions();
    this.checkAdminStatus();
    this.handleRouteParams();

    // Apply initial font size after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.designHandler.applyFontSizeChange(this.designSettings.fontSize);
    }, 100);
  }

  /**
   * Check if current user is admin
   */
  private checkAdminStatus(): void {
    this.isAdmin.set(this.authService.isAdmin());
  }

  /**
   * Handle route parameters to load template or clear state for new template
   */
  private handleRouteParams(): void {
    // Detect if we're in admin context based on URL
    this.isAdminContext = this.router.url.startsWith('/admin');
    
    this.route.paramMap.subscribe((params) => {
      const templateCode = params.get('templateCode');

      if (!templateCode) {
        // No template code - clear state for new template
        this.clearStateForNewTemplate();
        return;
      }

      if (templateCode === 'new') {
        // Creating new template - clear all state
        this.clearStateForNewTemplate();
      } else {
        // Loading existing template - load from API
        this.loadTemplate(templateCode);
      }
    });
  }

  /**
   * Load template data from API and apply to store
   */
  private loadTemplate(templateCode: string): void {
    this.isLoading.set(true);
    
    this.cvTemplateService.getCvTemplateByCode(templateCode).subscribe({
      next: (template) => {
        // Parse JSON strings if API returns them as strings
        const parsedTemplate = this.parseTemplateFromApi(template);
        
        // Apply template to store - this will trigger the effect
        this.cvTemplateStore.setTemplate(parsedTemplate);
        
        // Apply design settings if available
        if (parsedTemplate.designSettings) {
          this.designSettings = {
            selectedFont: parsedTemplate.designSettings.selectedFont || this.designSettings.selectedFont,
            fontSize: parsedTemplate.designSettings.fontSize || this.designSettings.fontSize,
            lineSpacing: parsedTemplate.designSettings.lineSpacing || this.designSettings.lineSpacing,
            selectedColor: parsedTemplate.designSettings.selectedColor || this.designSettings.selectedColor,
            selectedBackground: parsedTemplate.designSettings.selectedBackground || this.designSettings.selectedBackground,
          };
          
          // Apply all design settings to the design handler service
          setTimeout(() => {
            this.designHandler.applyFontChange(this.designSettings.selectedFont);
            this.designHandler.applyFontSizeChange(this.designSettings.fontSize);
            this.designHandler.applyLineSpacingChange(this.designSettings.lineSpacing);
            this.designHandler.applyColorChange(this.designSettings.selectedColor);
            this.designHandler.applyBackgroundChange(this.designSettings.selectedBackground);
          }, 100);
        }
        
        // Force update local state to ensure UI reflects the changes
        // The effect should handle this, but we'll also update directly to be sure
        setTimeout(() => {
          const storeSections = this.cvTemplateStore.sections();
          const storeLayout = this.cvTemplateStore.layoutConfiguration();
          
          this.allSections = storeSections;
          this.layoutConfiguration = storeLayout;
          this.rebuildLegacyLayout(storeSections, storeLayout);
        }, 50);
        
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load Failed',
          detail: error.error?.message || 'Failed to load template. Please try again.',
        });
        // Navigate back to template list on error
        this.router.navigate([this.isAdminContext ? '/admin/cv-templates' : '/cv-template']);
      },
    });
  }

  /**
   * Parse template data from API response
   * Handles cases where API returns JSON strings instead of objects
   */
  private parseTemplateFromApi(template: CvTemplate): CvTemplate {
    const rawTemplate = template as any;
    let layoutConfiguration: LayoutConfiguration | undefined;
    let sections: CVSection[] | undefined;
    let designSettings: DesignSettings | undefined;

    // Parse layoutConfiguration - check raw value first
    if (rawTemplate.layoutConfiguration !== undefined) {
      try {
        if (typeof rawTemplate.layoutConfiguration === 'string') {
          layoutConfiguration = JSON.parse(rawTemplate.layoutConfiguration);
        } else if (rawTemplate.layoutConfiguration && typeof rawTemplate.layoutConfiguration === 'object') {
          layoutConfiguration = rawTemplate.layoutConfiguration;
        }
      } catch (e) {
        // Silently fail and use undefined
      }
    }

    // Parse sections - check both 'sections' (plural) and 'section' (singular) field names
    // API might return either field name
    const sectionsValue = rawTemplate.sections !== undefined 
      ? rawTemplate.sections 
      : rawTemplate.section !== undefined 
        ? rawTemplate.section 
        : undefined;
    
    if (sectionsValue !== undefined && sectionsValue !== null) {
      try {
        if (typeof sectionsValue === 'string') {
          sections = JSON.parse(sectionsValue);
        } else if (Array.isArray(sectionsValue)) {
          sections = sectionsValue;
        }
      } catch (e) {
        // Silently fail and use undefined
      }
    } else if (sectionsValue === null) {
      // If explicitly null, use empty array
      sections = [];
    }

    // Parse designSettings - check raw value first
    if (rawTemplate.designSettings !== undefined) {
      try {
        if (typeof rawTemplate.designSettings === 'string') {
          designSettings = JSON.parse(rawTemplate.designSettings);
        } else if (rawTemplate.designSettings && typeof rawTemplate.designSettings === 'object') {
          designSettings = rawTemplate.designSettings;
        }
      } catch (e) {
        // Silently fail and use undefined
      }
    }

    return {
      ...template,
      layoutConfiguration: layoutConfiguration ?? template.layoutConfiguration,
      section: sections ?? template.section ?? [],
      designSettings: designSettings ?? template.designSettings,
    };
  }

  /**
   * Clear all state when creating a new template
   */
  private clearStateForNewTemplate(): void {
    // Reset template store to initial state
    this.cvTemplateStore.reset();

    // Reset design settings to defaults
    this.designSettings = this.designHandler.getDefaultDesignSettings();

    // Reset UI state
    this.showManagementModal = false;
    this.showLayoutConfigModal = false;
    this.showSaveTemplateDialog = false;
    this.isExporting = false;
    this.showEditToolbar = false;
    this.activeTab = 'design';
    this.isZoomed = false;

    // Apply default font size
    setTimeout(() => {
      this.designHandler.applyFontSizeChange(this.designSettings.fontSize);
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.layoutEffect?.destroy();
  }

  private setupSubscriptions() {
    // Subscribe to toolbar state
    this.subscriptions.add(
      this.editToolbar.toolbarState$.subscribe((state) => {
        this.showEditToolbar = state.visible;
        this.editToolbarPosition = state.position;
      }),
    );
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // ========== Preview Controls ==========

  zoomCV() {
    this.isZoomed = !this.isZoomed;
  }

  async downloadCV() {
    if (this.isExporting) {
      this.messageService.add({
        severity: "warn",
        summary: "Export in Progress",
        detail: "Please wait for the current export to complete",
      });
      return;
    }

    this.isExporting = true;

    try {
      // Get all sections from store
      const sections = this.cvTemplateStore.sections();

      // Validate all fields
      const validation = this.pdfExportService.validateFields(sections);

      // Show validation errors if any
      if (!validation.isValid) {
        this.showValidationErrors(validation);
        this.isExporting = false;
        return;
      }

      // Show validation warnings if any
      if (validation.warnings.length > 0) {
        this.showValidationWarnings(validation);
      }

      // Get CV element from preview component
      const cvElement = this.cvPreviewComponent?.cvPaper?.nativeElement;

      if (!cvElement) {
        this.messageService.add({
          severity: "error",
          summary: "Export Failed",
          detail: "Could not find CV preview element",
        });
        this.isExporting = false;
        return;
      }

      // Show loading message
      this.messageService.add({
        severity: "info",
        summary: "Exporting...",
        detail: "Generating PDF file, please wait...",
        life: 3000,
      });

      // Export to PDF
      const result = await this.pdfExportService.exportToPdf(
        cvElement,
        sections,
        {
          filename: this.cvTemplateStore.template().name || "CV-Template",
          format: "a4",
          orientation: "portrait",
          quality: 2,
          includeMetadata: true,
        },
      );

      if (result.success) {
        this.messageService.add({
          severity: "success",
          summary: "Export Successful",
          detail: "CV has been exported to PDF successfully",
        });
      } else {
        this.messageService.add({
          severity: "error",
          summary: "Export Failed",
          detail: result.error || "Unknown error occurred",
        });
      }
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Export Failed",
        detail:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Show validation errors as toast messages
   */
  private showValidationErrors(validation: ValidationResult) {
    this.messageService.add({
      severity: "error",
      summary: "Validation Failed",
      detail: `Found ${validation.errors.length} error(s). Please fix them before exporting.`,
      life: 5000,
    });

    // Show first 3 errors in detail
    validation.errors.slice(0, 3).forEach((error, index) => {
      setTimeout(
        () => {
          this.messageService.add({
            severity: "error",
            summary: `${error.sectionName}`,
            detail: `${error.fieldLabel}: ${error.message}`,
            life: 5000,
          });
        },
        (index + 1) * 200,
      );
    });

    if (validation.errors.length > 3) {
      setTimeout(() => {
        this.messageService.add({
          severity: "warn",
          summary: "More Errors",
          detail: `And ${validation.errors.length - 3} more error(s)...`,
          life: 5000,
        });
      }, 800);
    }
  }

  /**
   * Show validation warnings as toast messages
   */
  private showValidationWarnings(validation: ValidationResult) {
    this.messageService.add({
      severity: "warn",
      summary: "Validation Warnings",
      detail: `Found ${validation.warnings.length} warning(s)`,
      life: 4000,
    });
  }

  // ========== Edit Toolbar ==========

  onEditableClick(event: MouseEvent, fieldName: string = "") {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    if (target) {
      this.editToolbar.showToolbarAt(event, target);
    }
  }

  // ========== Section Management Modal ==========

  openSectionManagementModal() {
    this.showManagementModal = true;
  }

  closeSectionManagementModal() {
    this.showManagementModal = false;
  }

  // ========== Layout Configuration Modal ==========

  openLayoutManagementModal() {
    this.showLayoutConfigModal = true;
  }

  closeLayoutManagementModal() {
    this.showLayoutConfigModal = false;
  }

  // ========== Layout Change Handler ==========

  /**
   * Handle layout changes from the Layout Panel
   * This is called whenever sections are dragged, added, or removed
   */
  onLayoutChange(updatedConfig: LayoutConfiguration) {
    // Update the store with the new layout configuration
    this.cvTemplateStore.updateLayoutConfiguration(updatedConfig);
  }

  // ========== Save Template ==========

  /**
   * Open save template dialog
   */
  openSaveTemplateDialog(): void {
    if (this.isSaving()) {
      return;
    }

    if (!this.isAdmin()) {
      this.messageService.add({
        severity: "error",
        summary: "Unauthorized",
        detail: "Only administrators can save templates",
      });
      return;
    }

    this.showSaveTemplateDialog = true;
  }

  /**
   * Close save template dialog
   */
  closeSaveTemplateDialog(): void {
    this.showSaveTemplateDialog = false;
  }

  /**
   * Handle save template data from dialog
   */
  onSaveTemplateData(saveData: { name: string; description?: string; type: CvTemplateType }): void {
    this.closeSaveTemplateDialog();
    this.performSave(saveData);
  }

  /**
   * Save CV template configuration to backend
   * Saves: layout, rows, columns, sections, fields, style for fields, design settings
   */
  private async performSave(saveData: { name: string; description?: string; type: CvTemplateType }): Promise<void> {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);

    try {
      const template = this.cvTemplateStore.template();
      const currentLayout = this.layoutConfiguration || { rows: [] };
      const allSections = this.allSections || [];

      // Prepare the template data with all configurations
      const templateData = {
        name: saveData.name,
        type: saveData.type,
        description: saveData.description || "",
        sampleFileUrl: template.sampleFileUrl || "",
        layoutConfiguration: currentLayout,
        section: allSections,
        designSettings: {
          selectedFont: this.designSettings.selectedFont,
          fontSize: this.designSettings.fontSize,
          lineSpacing: this.designSettings.lineSpacing,
          selectedColor: this.designSettings.selectedColor,
          selectedBackground: this.designSettings.selectedBackground,
        },
        isPublished: template.isPublished || false,
      };

      // Determine if this is create or update
      const isUpdate = template.templateCode && template.templateCode.trim() !== "";

      if (isUpdate) {
        // Update existing template
        this.cvTemplateService
          .updateTemplate(template.templateCode, templateData)
          .subscribe({
            next: (updatedTemplate) => {
              // Merge API response with current state to preserve all data
              // API might return incomplete data or JSON strings that need parsing
              const mergedTemplate = this.mergeTemplateWithCurrentState(updatedTemplate, templateData);
              this.cvTemplateStore.setTemplate(mergedTemplate);
              
              // Update design settings if they were changed
              if (mergedTemplate.designSettings) {
                this.designSettings = {
                  selectedFont: mergedTemplate.designSettings.selectedFont || this.designSettings.selectedFont,
                  fontSize: mergedTemplate.designSettings.fontSize || this.designSettings.fontSize,
                  lineSpacing: mergedTemplate.designSettings.lineSpacing || this.designSettings.lineSpacing,
                  selectedColor: mergedTemplate.designSettings.selectedColor || this.designSettings.selectedColor,
                  selectedBackground: mergedTemplate.designSettings.selectedBackground || this.designSettings.selectedBackground,
                };
                
                // Apply font size changes
                setTimeout(() => {
                  this.designHandler.applyFontSizeChange(this.designSettings.fontSize);
                }, 100);
              }

              this.messageService.add({
                severity: "success",
                summary: "Lưu thành công",
                detail: "Template đã được cập nhật thành công",
              });
              this.isSaving.set(false);
            },
            error: (error) => {
              this.messageService.add({
                severity: "error",
                summary: "Lỗi",
                detail:
                  error.error?.message ||
                  "Đã xảy ra lỗi khi cập nhật template. Vui lòng thử lại.",
              });
              this.isSaving.set(false);
            },
          });
      } else {
        // Create new template
        this.cvTemplateService.createTemplate(templateData).subscribe({
          next: (createdTemplate) => {
            this.messageService.add({
              severity: "success",
              summary: "Lưu thành công",
              detail: "Template đã được tạo thành công",
            });
            this.isSaving.set(false);
            
            // Navigate to template list after successful creation
            this.router.navigate([this.isAdminContext ? '/admin/cv-templates' : '/cv-template']);
          },
          error: (error) => {
            this.messageService.add({
              severity: "error",
              summary: "Lỗi",
              detail:
                error.error?.message ||
                "Đã xảy ra lỗi khi tạo template. Vui lòng thử lại.",
            });
            this.isSaving.set(false);
          },
        });
      }
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Lỗi",
        detail: "Đã xảy ra lỗi không mong đợi. Vui lòng thử lại.",
      });
      this.isSaving.set(false);
    }
  }

  /**
   * Merge API response template with current state to preserve all data
   * Handles cases where API returns incomplete data or JSON strings
   */
  private mergeTemplateWithCurrentState(
    apiTemplate: CvTemplate,
    currentTemplateData: any
  ): CvTemplate {
    const rawTemplate = apiTemplate as any;
    let layoutConfiguration = apiTemplate.layoutConfiguration;
    let sections = apiTemplate.section;
    let designSettings = apiTemplate.designSettings;

    // Parse layoutConfiguration if it's a string
    if (!layoutConfiguration && rawTemplate.layoutConfiguration) {
      try {
        if (typeof rawTemplate.layoutConfiguration === 'string') {
          layoutConfiguration = JSON.parse(rawTemplate.layoutConfiguration);
        } else if (rawTemplate.layoutConfiguration && typeof rawTemplate.layoutConfiguration === 'object') {
          layoutConfiguration = rawTemplate.layoutConfiguration;
        }
      } catch (e) {
        layoutConfiguration = currentTemplateData.layoutConfiguration;
      }
    }

    // Parse sections - check both 'sections' (plural) and 'section' (singular) field names
    const sectionsValue = rawTemplate.sections !== undefined 
      ? rawTemplate.sections 
      : rawTemplate.section !== undefined 
        ? rawTemplate.section 
        : undefined;
    
    if (!sections && sectionsValue !== undefined && sectionsValue !== null) {
      try {
        if (typeof sectionsValue === 'string') {
          sections = JSON.parse(sectionsValue);
        } else if (Array.isArray(sectionsValue)) {
          sections = sectionsValue;
        }
      } catch (e) {
        sections = currentTemplateData.sections;
      }
    } else if (sectionsValue === null) {
      sections = [];
    }

    // Parse designSettings if it's a string
    if (!designSettings && rawTemplate.designSettings) {
      try {
        if (typeof rawTemplate.designSettings === 'string') {
          designSettings = JSON.parse(rawTemplate.designSettings);
        } else if (rawTemplate.designSettings && typeof rawTemplate.designSettings === 'object') {
          designSettings = rawTemplate.designSettings;
        }
      } catch (e) {
        designSettings = currentTemplateData.designSettings;
      }
    }

    // Merge: Use API response as base, but preserve current data if API response is incomplete
    return {
      ...apiTemplate,
      layoutConfiguration: layoutConfiguration ?? currentTemplateData.layoutConfiguration,
      section: sections ?? currentTemplateData.sections,
      designSettings: designSettings ?? currentTemplateData.designSettings,
    };
  }

  // ========== Legacy Layout Support ==========

  /**
   * Build legacy flat layout structure for backward compatibility
   * This maintains the old usedSections/availableLayoutSections format
   * while the new grid-based system is being adopted
   */
  private rebuildLegacyLayout(
    sections: CVSection[],
    layoutConfig: LayoutConfiguration | { rows: LayoutRow[] },
  ) {
    const orderedIds = this.extractOrderedSectionIds(layoutConfig);

    let used: UsedSection[] = [];

    if (orderedIds.length > 0) {
      used = orderedIds
        .map((id, index): UsedSection | undefined => {
          const section = sections.find((s) => s.id === id);
          return section
            ? {
                id: section.id,
                name: section.name,
                order: index + 1,
                locked: section.locked,
              }
            : undefined;
        })
        .filter((s): s is UsedSection => !!s);
    } else {
      // If no layout configuration yet, default to all sections in their current order
      used = sections.map(
        (section, index): UsedSection => ({
          id: section.id,
          name: section.name,
          order: index + 1,
          locked: section.locked,
        }),
      );
    }

    this.usedSections = used;
    this.syncAvailableSections(sections);
  }

  /**
   * Sync available (unused) sections for legacy layout
   */
  private syncAvailableSections(sections: CVSection[]) {
    const usedIds = new Set(this.usedSections.map((s) => s.id));

    this.availableLayoutSections = sections
      .filter((section) => !usedIds.has(section.id))
      .map((section, index) => ({
        id: section.id,
        name: section.name,
        order: index + 1,
        locked: section.locked,
      }));
  }

  /**
   * Extract ordered section IDs from layout configuration
   * Iterates through rows → columns → sections to build a flat ordered list
   */
  private extractOrderedSectionIds(
    layoutConfig: LayoutConfiguration | { rows: LayoutRow[] },
  ): string[] {
    if (!layoutConfig || !layoutConfig.rows || layoutConfig.rows.length === 0) {
      return [];
    }

    const ids: string[] = [];
    layoutConfig.rows.forEach((row: LayoutRow) => {
      row.columns?.forEach((col: LayoutColumn) => {
        (col.sections || []).forEach((sectionId) => ids.push(sectionId));
      });
    });

    return ids;
  }
}
