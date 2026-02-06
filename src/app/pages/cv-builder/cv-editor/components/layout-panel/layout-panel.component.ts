import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DragDropHandlerService } from "../../services/drag-drop-handler.service";
import {
  LayoutConfiguration,
  LayoutRow,
  LayoutColumn,
  CVSection,
} from "@app/models/cv-builder/cv-template.model";

export interface UsedSection {
  id: string;
  name: string;
  order: number;
  locked: boolean | undefined;
}

/**
 * Layout Panel Component
 *
 * Manages the CV layout using a grid-based system:
 * - Rows: Stacked vertically
 * - Columns: Within each row, with configurable widths
 * - Sections: Placed inside columns, can be dragged/reordered
 *
 * Features:
 * - Drag & drop sections within the same column (reorder)
 * - Drag & drop sections between columns in the same row
 * - Drag & drop sections between different rows
 * - Drag & drop sections between layout and "Unused Sections"
 * - Locked sections cannot be dragged or removed
 * - No duplicate sections allowed across the entire layout
 */
@Component({
  selector: "app-layout-panel",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./layout-panel.component.html",
  styleUrls: ["./layout-panel.component.scss"],
})
export class LayoutPanelComponent implements OnChanges {
  /** Current layout configuration from the store */
  @Input() layoutConfiguration?: LayoutConfiguration;

  /** All sections defined in the template */
  @Input() allSections: CVSection[] = [];

  /** Sections that are currently enabled in the CV layout (kept for backward compatibility) */
  @Input() usedSections: UsedSection[] = [];

  /** Sections that exist in the template but are not currently used in the layout */
  @Input() availableSections: UsedSection[] = [];

  /** Emits whenever the layout configuration changes */
  @Output() layoutChange = new EventEmitter<LayoutConfiguration>();

  // Internal state for rendering
  rows: LayoutRow[] = [];
  unusedSections: UsedSection[] = [];

  constructor(private dragDropHandler: DragDropHandlerService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["layoutConfiguration"] || changes["allSections"]) {
      this.rebuildLayoutState();
    }
  }

  /**
   * Rebuilds the internal state based on layoutConfiguration and allSections.
   * Calculates which sections are used vs. unused.
   */
  private rebuildLayoutState(): void {
    if (!this.layoutConfiguration || !this.layoutConfiguration.rows) {
      this.rows = [];
      this.unusedSections = this.allSections.map((s, idx) => ({
        id: s.id,
        name: s.name,
        order: idx + 1,
        locked: s.locked,
      }));
      return;
    }

    this.rows = this.layoutConfiguration.rows || [];

    // Collect all section IDs that are placed in the layout
    const usedSectionIds = new Set<string>();
    this.rows.forEach((row) => {
      row.columns?.forEach((col) => {
        col.sections?.forEach((sectionId) => usedSectionIds.add(sectionId));
      });
    });

    // Build unused sections list
    this.unusedSections = this.allSections
      .filter((s) => !usedSectionIds.has(s.id))
      .map((s, idx) => ({
        id: s.id,
        name: s.name,
        order: idx + 1,
        locked: s.locked,
      }));
  }

  /**
   * Get section details by ID from allSections
   */
  getSectionById(sectionId: string): CVSection | undefined {
    return this.allSections.find((s) => s.id === sectionId);
  }

  /**
   * Check if a section is locked
   */
  isSectionLocked(sectionId: string): boolean {
    const section = this.getSectionById(sectionId);
    return section?.locked || false;
  }

  /**
   * Get section name by ID
   */
  getSectionName(sectionId: string): string {
    const section = this.getSectionById(sectionId);
    return section?.name || sectionId;
  }

  // ========== Drag & Drop Handlers ==========

  /**
   * Drag start - section from layout grid
   */
  onDragStartFromLayout(
    event: DragEvent,
    sectionId: string,
    rowId: string,
    columnId: string,
  ): void {
    if (this.isSectionLocked(sectionId)) {
      event.preventDefault();
      return;
    }

    const dragItem = {
      id: sectionId,
      data: {
        sectionId,
        rowId,
        columnId,
        source: "layout",
      },
      type: "section" as const,
    };

    this.dragDropHandler.startDrag(event, dragItem);
  }

  /**
   * Drag start - section from unused area
   */
  onDragStartFromUnused(event: DragEvent, section: UsedSection): void {
    if (section.locked) {
      event.preventDefault();
      return;
    }

    const dragItem = {
      id: section.id,
      data: {
        sectionId: section.id,
        source: "unused",
      },
      type: "section" as const,
    };

    this.dragDropHandler.startDrag(event, dragItem);
  }

  onDragOver(event: DragEvent): void {
    this.dragDropHandler.onDragOver(event);
  }

  /**
   * Drop onto a specific section within a column (inserts before the target)
   */
  onDropOnSection(
    event: DragEvent,
    targetSectionId: string,
    targetRowId: string,
    targetColumnId: string,
  ): void {
    event.stopPropagation();
    event.preventDefault();

    const dropResult = this.dragDropHandler.onDrop(event);
    if (!dropResult) return;

    const { draggedItem } = dropResult;
    const dragData = draggedItem.data as any;

    if (this.isSectionLocked(dragData.sectionId)) {
      return;
    }

    const newConfig = this.cloneConfiguration();
    const targetRow = newConfig.rows.find((r) => r.id === targetRowId);
    const targetColumn = targetRow?.columns?.find(
      (c) => c.id === targetColumnId,
    );

    if (!targetColumn) return;

    // Remove from original position
    if (dragData.source === "layout") {
      this.removeSectionFromLayout(newConfig, dragData.sectionId);
    }

    // Insert before target section
    const targetIndex = targetColumn.sections?.indexOf(targetSectionId) ?? -1;
    if (targetIndex >= 0) {
      targetColumn.sections?.splice(targetIndex, 0, dragData.sectionId);
    } else {
      // Target not found, add at end
      if (!targetColumn.sections) {
        targetColumn.sections = [];
      }
      targetColumn.sections.push(dragData.sectionId);
    }

    this.layoutChange.emit(newConfig);
  }

  /**
   * Drop onto a column (adds at the end of the column)
   */
  onDropOnColumn(event: DragEvent, rowId: string, columnId: string): void {
    event.stopPropagation();
    event.preventDefault();

    const dropResult = this.dragDropHandler.onDrop(event);
    if (!dropResult) return;

    const { draggedItem } = dropResult;
    const dragData = draggedItem.data as any;

    if (this.isSectionLocked(dragData.sectionId)) {
      return;
    }

    const newConfig = this.cloneConfiguration();
    const targetRow = newConfig.rows.find((r) => r.id === rowId);
    const targetColumn = targetRow?.columns?.find((c) => c.id === columnId);

    if (!targetColumn) return;

    // Remove from original position
    if (dragData.source === "layout") {
      this.removeSectionFromLayout(newConfig, dragData.sectionId);
    }

    // Add to end of target column
    if (!targetColumn.sections) {
      targetColumn.sections = [];
    }
    targetColumn.sections.push(dragData.sectionId);

    this.layoutChange.emit(newConfig);
  }

  /**
   * Drop onto unused sections area (removes from layout)
   */
  onDropOnUnused(event: DragEvent): void {
    event.stopPropagation();
    event.preventDefault();

    const dropResult = this.dragDropHandler.onDrop(event);
    if (!dropResult) return;

    const { draggedItem } = dropResult;
    const dragData = draggedItem.data as any;

    if (dragData.source !== "layout") {
      return; // Already unused
    }

    if (this.isSectionLocked(dragData.sectionId)) {
      return;
    }

    const newConfig = this.cloneConfiguration();
    this.removeSectionFromLayout(newConfig, dragData.sectionId);

    this.layoutChange.emit(newConfig);
  }

  /**
   * Quick add from unused sections (click to add to first available column)
   */
  onQuickAddSection(section: UsedSection): void {
    if (section.locked) {
      return;
    }

    const newConfig = this.cloneConfiguration();

    // Find first row and first column, or create default structure
    if (!newConfig.rows || newConfig.rows.length === 0) {
      newConfig.rows = [
        {
          id: "row-1",
          order: 1,
          columns: [
            {
              id: "col-1",
              widthPercentage: 100,
              sections: [section.id],
            },
          ],
        },
      ];
      newConfig.totalColumns = 1;
    } else {
      const firstRow = newConfig.rows[0];
      const firstColumn = firstRow.columns?.[0];

      if (firstColumn) {
        if (!firstColumn.sections) {
          firstColumn.sections = [];
        }
        firstColumn.sections.push(section.id);
      }
    }

    this.layoutChange.emit(newConfig);
  }

  /**
   * Remove section from layout (click trash icon)
   */
  onRemoveSectionFromLayout(
    sectionId: string,
    rowId: string,
    columnId: string,
  ): void {
    if (this.isSectionLocked(sectionId)) {
      return;
    }

    const newConfig = this.cloneConfiguration();
    this.removeSectionFromLayout(newConfig, sectionId);

    this.layoutChange.emit(newConfig);
  }

  // ========== Helper Methods ==========

  /**
   * Clone the current layout configuration for immutable updates
   */
  private cloneConfiguration(): LayoutConfiguration {
    if (!this.layoutConfiguration) {
      return { rows: [], totalColumns: 1 };
    }

    return {
      ...this.layoutConfiguration,
      rows: this.layoutConfiguration.rows.map((row) => ({
        ...row,
        columns: row.columns?.map((col) => ({
          ...col,
          sections: [...(col.sections || [])],
        })),
      })),
    };
  }

  /**
   * Remove a section from anywhere in the layout configuration
   */
  private removeSectionFromLayout(
    config: LayoutConfiguration,
    sectionId: string,
  ): void {
    config.rows.forEach((row) => {
      row.columns?.forEach((col) => {
        if (col.sections) {
          col.sections = col.sections.filter((id) => id !== sectionId);
        }
      });
    });
  }

  /**
   * Track by function for row rendering
   */
  trackByRowId(index: number, row: LayoutRow): string {
    return row.id;
  }

  /**
   * Track by function for column rendering
   */
  trackByColumnId(index: number, column: LayoutColumn): string {
    return column.id;
  }

  /**
   * Track by function for section rendering
   */
  trackBySectionId(index: number, sectionId: string): string {
    return sectionId;
  }

  /**
   * Track by function for unused sections
   */
  trackByUnusedId(index: number, section: UsedSection): string {
    return section.id;
  }
}
