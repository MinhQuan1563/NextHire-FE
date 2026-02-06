import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  Renderer2,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  LayoutConfiguration,
  LayoutRow,
  LayoutColumn,
  CVSection,
  CVSectionField,
  FieldState,
} from "@app/models/cv-builder/cv-template.model";
import { EditToolbarService } from "../../services/edit-toolbar.service";
import { Subscription } from "rxjs";

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
  locked: boolean | undefined;
}

export interface DesignSettings {
  selectedFont: string;
  fontSize: number;
  lineSpacing: number;
  selectedColor: string;
  selectedBackground: string;
}

/**
 * CV Preview Component with Inline Editing Support
 *
 * Features:
 * - Renders CV based on layout configuration (rows → columns → sections)
 * - Inline editing for text fields with contextual toolbar
 * - Field state management (hover, active, editing)
 * - Real-time content updates
 * - Section hover controls for reordering
 * - Keyboard shortcuts support
 *
 * Layout Rendering:
 * - Iterates through rows in order
 * - Renders columns side-by-side within rows
 * - Displays sections in configured order within columns
 * - Supports both grid layout and legacy flat layout
 */
@Component({
  selector: "app-cv-preview",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./cv-preview.component.html",
  styleUrls: ["./cv-preview.component.scss"],
})
export class CvPreviewComponent implements OnInit, OnDestroy, AfterViewChecked {
  /** Layout configuration defining rows, columns, and section placement */
  @Input() layoutConfiguration?: LayoutConfiguration;

  /** All sections available in the template */
  @Input() allSections: CVSection[] = [];

  /** Legacy input for backward compatibility */
  @Input() usedSections: UsedSection[] = [];

  @Input() designSettings: DesignSettings = {
    selectedFont: "Roboto",
    fontSize: 14,
    lineSpacing: 1.5,
    selectedColor: "#00B14F",
    selectedBackground: "white",
  };

  @Input() isZoomed: boolean = false;

  @Output() editableClick = new EventEmitter<{
    event: MouseEvent;
    fieldName: string;
  }>();
  @Output() zoomToggle = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() sectionMove = new EventEmitter<{
    sectionId: string;
    direction: "up" | "down";
  }>();
  @Output() sectionDelete = new EventEmitter<string>();
  @Output() fieldValueChange = new EventEmitter<{
    sectionId: string;
    fieldId: string;
    value: any;
  }>();

  @Output() imageUpload = new EventEmitter<{
    sectionId: string;
    fieldId: string;
    file: File;
  }>();

  @ViewChild("cvPaper") cvPaper?: ElementRef<HTMLDivElement>;
  @ViewChild("fileInput") fileInput?: ElementRef<HTMLInputElement>;

  // Field state management
  activeFieldId: string | null = null;
  hoveredSectionId: string | null = null;
  hoveredFieldId: string | null = null;
  fieldStates: Map<string, FieldState> = new Map();

  // Subscriptions
  private subscriptions = new Subscription();

  // Cursor position tracking
  private cursorPositions: Map<string, number> = new Map();
  private shouldRestoreCursor = false;
  private pendingCursorRestore: string | null = null;

  // Image upload state
  private currentImageField: { sectionId: string; fieldId: string } | null =
    null;

  constructor(
    private editToolbarService: EditToolbarService,
    private renderer: Renderer2,
  ) {}

  ngOnInit() {
    this.initializeFieldStates();
    this.setupToolbarSubscription();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewChecked() {
    // Restore cursor position after view update
    if (this.shouldRestoreCursor && this.pendingCursorRestore) {
      this.restoreCursorPosition(this.pendingCursorRestore);
      this.shouldRestoreCursor = false;
      this.pendingCursorRestore = null;
    }
  }

  /**
   * Initialize field states for all sections
   */
  private initializeFieldStates() {
    this.allSections.forEach((section) => {
      if (section.fields) {
        section.fields.forEach((field) => {
          const fieldKey = this.getFieldKey(section.id, field.name);
          this.fieldStates.set(fieldKey, {
            fieldId: field.name,
            sectionId: section.id,
            isActive: false,
            isFocused: false,
            isEditing: false,
          });
        });
      }
    });
  }

  /**
   * Setup subscription to toolbar state
   */
  private setupToolbarSubscription() {
    this.subscriptions.add(
      this.editToolbarService.toolbarState$.subscribe((state) => {
        // Update active field when toolbar state changes
        if (state.visible && state.fieldId && state.sectionId) {
          const fieldKey = this.getFieldKey(state.sectionId, state.fieldId);
          this.activeFieldId = fieldKey;
          this.setFieldState(fieldKey, { isActive: true, isEditing: true });
        } else if (!state.visible && this.activeFieldId) {
          // Deactivate field when toolbar is hidden
          this.setFieldState(this.activeFieldId, {
            isActive: false,
            isEditing: false,
          });
          this.activeFieldId = null;
        }
      }),
    );
  }

  /**
   * Get unique field key
   */
  private getFieldKey(sectionId: string, fieldId: string): string {
    return `${sectionId}__${fieldId}`;
  }

  /**
   * Set field state
   */
  private setFieldState(fieldKey: string, updates: Partial<FieldState>): void {
    const currentState = this.fieldStates.get(fieldKey);
    if (currentState) {
      this.fieldStates.set(fieldKey, { ...currentState, ...updates });
    }
  }

  /**
   * Get field state
   */
  getFieldState(sectionId: string, fieldId: string): FieldState | undefined {
    const fieldKey = this.getFieldKey(sectionId, fieldId);
    return this.fieldStates.get(fieldKey);
  }

  /**
   * Check if field is active
   */
  isFieldActive(sectionId: string, fieldId: string): boolean {
    const state = this.getFieldState(sectionId, fieldId);
    return state?.isActive || false;
  }

  /**
   * Check if field is editable
   */
  isFieldEditable(field: CVSectionField): boolean {
    return (
      field.editable !== false &&
      (field.type === "text" ||
        field.type === "richtext" ||
        field.type === "textarea" ||
        field.type === "email" ||
        field.type === "phone" ||
        field.type === "url")
    );
  }

  // ========== Layout Rendering Methods ==========

  /**
   * Get section details by ID
   */
  getSectionById(sectionId: string): CVSection | undefined {
    return this.allSections.find((s) => s.id === sectionId);
  }

  /**
   * Get section name by ID
   */
  getSectionName(sectionId: string): string {
    const section = this.getSectionById(sectionId);
    return section?.name || sectionId;
  }

  /**
   * Check if layout configuration exists and has rows
   */
  hasLayoutConfiguration(): boolean {
    return !!(
      this.layoutConfiguration &&
      this.layoutConfiguration.rows &&
      this.layoutConfiguration.rows.length > 0
    );
  }

  /**
   * Get all rows from layout configuration
   */
  getLayoutRows(): LayoutRow[] {
    if (!this.hasLayoutConfiguration()) {
      return [];
    }
    return this.layoutConfiguration!.rows || [];
  }

  /**
   * Get columns for a specific row
   */
  getRowColumns(row: LayoutRow): LayoutColumn[] {
    return row.columns || [];
  }

  /**
   * Get section IDs for a specific column
   * Filters out section IDs that don't exist in allSections
   */
  getColumnSections(column: LayoutColumn): string[] {
    const sectionIds = column.sections || [];
    // Filter to only include sections that actually exist
    return sectionIds.filter(sectionId => this.getSectionById(sectionId) !== undefined);
  }

  /**
   * Fallback: Get sorted sections from legacy usedSections input
   * Used when no layout configuration is available
   */
  getSortedUsedSections(): UsedSection[] {
    return [...this.usedSections].sort((a, b) => a.order - b.order);
  }

  /**
   * Check if using legacy flat layout (no row/column structure)
   */
  isLegacyLayout(): boolean {
    return !this.hasLayoutConfiguration() && this.usedSections.length > 0;
  }

  /**
   * Calculate column width percentage for flex layout
   */
  getColumnWidth(column: LayoutColumn): number {
    return column.widthPercentage || 100;
  }

  // ========== Inline Editing Methods ==========

  /**
   * Handle click on editable field
   */
  onFieldClick(
    event: MouseEvent,
    section: CVSection,
    field: CVSectionField,
  ): void {
    event.stopPropagation();

    if (!this.isFieldEditable(field)) {
      return;
    }

    const target = event.target as HTMLElement;
    const fieldKey = this.getFieldKey(section.id, field.name);

    // Deactivate previous active field
    if (this.activeFieldId && this.activeFieldId !== fieldKey) {
      const prevState = this.fieldStates.get(this.activeFieldId);
      if (prevState?.element) {
        prevState.element.contentEditable = "false";
      }
      this.setFieldState(this.activeFieldId, {
        isActive: false,
        isEditing: false,
      });
    }

    // Make target editable
    target.contentEditable = "true";
    target.focus();

    // Activate clicked field
    this.activeFieldId = fieldKey;
    this.setFieldState(fieldKey, {
      isActive: true,
      isFocused: true,
      isEditing: true,
      element: target,
    });

    // Show toolbar
    this.editToolbarService.showToolbarAt(
      event,
      target,
      field.type,
      section.id,
      field.name,
    );

    // Emit event for parent component
    this.editableClick.emit({ event, fieldName: field.name });
  }

  /**
   * Handle field content change
   */
  onFieldChange(event: Event, section: CVSection, field: CVSectionField): void {
    const target = event.target as HTMLElement;
    const value = target.textContent || target.innerText || "";

    // Save cursor position before update
    const fieldKey = this.getFieldKey(section.id, field.name);
    this.saveCursorPosition(target, fieldKey);

    // Update field value
    field.value = value;

    // Mark that we should restore cursor after Angular updates
    this.shouldRestoreCursor = true;
    this.pendingCursorRestore = fieldKey;

    // Emit change event
    this.fieldValueChange.emit({
      sectionId: section.id,
      fieldId: field.name,
      value: value,
    });
  }

  /**
   * Handle field blur
   */
  onFieldBlur(
    event: FocusEvent,
    section: CVSection,
    field: CVSectionField,
  ): void {
    const target = event.target as HTMLElement;
    const fieldKey = this.getFieldKey(section.id, field.name);

    // Small delay to allow toolbar interactions
    setTimeout(() => {
      const toolbarState = this.editToolbarService.getCurrentState();
      if (!toolbarState.visible) {
        target.contentEditable = "false";
        this.setFieldState(fieldKey, {
          isFocused: false,
          isEditing: false,
        });
      }
    }, 200);
  }

  /**
   * Get field display value
   */
  getFieldValue(field: CVSectionField): string {
    return field.value || field.defaultValue || "";
  }

  /**
   * Get field CSS classes
   */
  getFieldClasses(section: CVSection, field: CVSectionField): string {
    const classes = ["cv-field"];
    const state = this.getFieldState(section.id, field.name);

    if (this.isFieldEditable(field)) {
      classes.push("editable");
    }

    if (state?.isActive) {
      classes.push("active");
    }

    if (state?.isFocused) {
      classes.push("focused");
    }

    if (state?.isEditing) {
      classes.push("editing");
    }

    if (this.hoveredFieldId === this.getFieldKey(section.id, field.name)) {
      classes.push("hovered");
    }

    if (field.type === "richtext" || field.type === "textarea") {
      classes.push("rich-text");
    }

    if (field.required) {
      classes.push("required");
    }

    return classes.join(" ");
  }

  /**
   * Handle field hover
   */
  onFieldMouseEnter(section: CVSection, field: CVSectionField): void {
    if (this.isFieldEditable(field)) {
      this.hoveredFieldId = this.getFieldKey(section.id, field.name);
    }
  }

  /**
   * Handle field hover end
   */
  onFieldMouseLeave(section: CVSection, field: CVSectionField): void {
    this.hoveredFieldId = null;
  }

  // ========== Section Hover Controls ==========

  /**
   * Handle section hover
   */
  onSectionMouseEnter(sectionId: string): void {
    this.hoveredSectionId = sectionId;
  }

  /**
   * Handle section hover end
   */
  onSectionMouseLeave(): void {
    this.hoveredSectionId = null;
  }

  /**
   * Check if section controls should be shown
   */
  showSectionControls(sectionId: string): boolean {
    return this.hoveredSectionId === sectionId;
  }

  /**
   * Move section up
   */
  onMoveSectionUp(sectionId: string): void {
    this.sectionMove.emit({ sectionId, direction: "up" });
  }

  /**
   * Move section down
   */
  onMoveSectionDown(sectionId: string): void {
    this.sectionMove.emit({ sectionId, direction: "down" });
  }

  /**
   * Delete section
   */
  onDeleteSection(sectionId: string): void {
    if (confirm("Bạn có chắc muốn xóa mục này khỏi CV?")) {
      this.sectionDelete.emit(sectionId);
    }
  }

  /**
   * Check if section can be moved up
   */
  canMoveSectionUp(sectionId: string, columnSections: string[]): boolean {
    const index = columnSections.indexOf(sectionId);
    return index > 0;
  }

  /**
   * Check if section can be moved down
   */
  canMoveSectionDown(sectionId: string, columnSections: string[]): boolean {
    const index = columnSections.indexOf(sectionId);
    return index >= 0 && index < columnSections.length - 1;
  }

  /**
   * Check if section is locked
   */
  isSectionLocked(sectionId: string): boolean {
    const section = this.getSectionById(sectionId);
    return section?.locked || false;
  }

  // ========== Preview Controls ==========

  /**
   * Handle click on editable elements (legacy support)
   */
  onEditableClick(event: MouseEvent, fieldName: string = ""): void {
    this.editableClick.emit({ event, fieldName });
  }

  /**
   * Toggle zoom state
   */
  zoomCV(): void {
    this.zoomToggle.emit();
  }

  /**
   * Trigger CV download
   */
  downloadCV(): void {
    this.download.emit();
  }

  // ========== Track By Functions ==========

  /**
   * Track by function for rows
   */
  trackByRowId(index: number, row: LayoutRow): string {
    return row.id;
  }

  /**
   * Track by function for columns
   */
  trackByColumnId(index: number, column: LayoutColumn): string {
    return column.id;
  }

  /**
   * Track by function for sections
   */
  trackBySectionId(index: number, sectionId: string): string {
    return sectionId;
  }

  /**
   * Track by function for fields
   */
  trackByFieldName(index: number, field: CVSectionField): string {
    return field.name;
  }

  // ========== Cursor Position Management ==========

  /**
   * Save cursor position in contenteditable element
   */
  private saveCursorPosition(element: HTMLElement, fieldKey: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const caretOffset = preCaretRange.toString().length;

    this.cursorPositions.set(fieldKey, caretOffset);
  }

  /**
   * Restore cursor position in contenteditable element
   */
  private restoreCursorPosition(fieldKey: string): void {
    const caretOffset = this.cursorPositions.get(fieldKey);
    if (caretOffset === undefined) return;

    // Find the element by data attributes
    const element = document.querySelector(
      `[data-editable="true"][data-field-id="${fieldKey.split("__")[1]}"][data-section-id="${fieldKey.split("__")[0]}"]`,
    ) as HTMLElement;

    if (!element) return;

    try {
      const selection = window.getSelection();
      const range = document.createRange();

      // Helper function to get text node and offset
      const getTextNodeAtPosition = (
        root: Node,
        position: number,
      ): { node: Node; offset: number } | null => {
        let currentPos = 0;
        const walker = document.createTreeWalker(
          root,
          NodeFilter.SHOW_TEXT,
          null,
        );

        let node = walker.nextNode();
        while (node) {
          const textLength = node.textContent?.length || 0;
          if (currentPos + textLength >= position) {
            return { node, offset: position - currentPos };
          }
          currentPos += textLength;
          node = walker.nextNode();
        }

        // If position is beyond text, place at end
        if (root.childNodes.length > 0) {
          const lastChild = root.childNodes[root.childNodes.length - 1];
          if (lastChild.nodeType === Node.TEXT_NODE) {
            return {
              node: lastChild,
              offset: lastChild.textContent?.length || 0,
            };
          }
        }

        return { node: root, offset: 0 };
      };

      const result = getTextNodeAtPosition(element, caretOffset);
      if (result) {
        range.setStart(result.node, result.offset);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    } catch (error) {
      console.warn("Could not restore cursor position:", error);
    }
  }

  // ========== Image Upload Methods ==========

  /**
   * Handle click on image field
   */
  onImageFieldClick(
    event: MouseEvent,
    section: CVSection,
    field: CVSectionField,
  ): void {
    event.stopPropagation();

    // Store current field context
    this.currentImageField = {
      sectionId: section.id,
      fieldId: field.name,
    };

    // Trigger file input click
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  /**
   * Handle file selection from input
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0 && this.currentImageField) {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chỉ chọn file hình ảnh (PNG, JPEG, JPG, GIF)");
        input.value = "";
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert("Kích thước file không được vượt quá 5MB");
        input.value = "";
        return;
      }

      // Emit upload event
      this.imageUpload.emit({
        sectionId: this.currentImageField.sectionId,
        fieldId: this.currentImageField.fieldId,
        file: file,
      });

      // Preview the image
      this.previewImage(file, this.currentImageField);

      // Clear input for next selection
      input.value = "";
    }

    this.currentImageField = null;
  }

  /**
   * Preview uploaded image
   */
  private previewImage(
    file: File,
    fieldContext: { sectionId: string; fieldId: string },
  ): void {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const imageUrl = e.target?.result as string;

      // Find the image field element and update it
      const imageElement = document.querySelector(
        `[data-section-id="${fieldContext.sectionId}"][data-field-id="${fieldContext.fieldId}"].cv-field-image`,
      ) as HTMLElement;

      if (imageElement) {
        imageElement.innerHTML = `
          <img src="${imageUrl}" alt="Uploaded image" class="uploaded-image" style="max-width: 100%; height: auto; border-radius: 4px;" />
        `;
      }

      // Update field value with image data
      this.fieldValueChange.emit({
        sectionId: fieldContext.sectionId,
        fieldId: fieldContext.fieldId,
        value: imageUrl,
      });
    };

    reader.readAsDataURL(file);
  }

  /**
   * Handle keydown events for contenteditable fields
   */
  onFieldKeyDown(
    event: KeyboardEvent,
    section: CVSection,
    field: CVSectionField,
  ): void {
    const fieldKey = this.getFieldKey(section.id, field.name);
    const target = event.target as HTMLElement;

    // Save cursor position on any key press
    this.saveCursorPosition(target, fieldKey);

    // Handle special keys
    if (event.key === "Escape") {
      event.preventDefault();
      target.blur();
      this.editToolbarService.hideToolbar();
    }
  }
}
