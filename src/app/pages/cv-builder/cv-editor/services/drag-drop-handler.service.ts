import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface DragDropItem {
  id: string;
  data: any;
  type: "section" | "field" | "layout";
}

export interface DragDropState {
  isDragging: boolean;
  draggedItem: DragDropItem | null;
  dropZones: string[];
}

@Injectable({
  providedIn: "root",
})
export class DragDropHandlerService {
  private dragDropStateSubject = new BehaviorSubject<DragDropState>({
    isDragging: false,
    draggedItem: null,
    dropZones: [],
  });

  public dragDropState$: Observable<DragDropState> =
    this.dragDropStateSubject.asObservable();

  // Drop debouncing to prevent duplicate drops
  private lastDropTime = 0;
  private dropDebounceMs = 100;
  private lastDropItemId: string | null = null;

  constructor() {}

  // Drag operations
  startDrag(event: DragEvent, item: DragDropItem) {
    if (!event.dataTransfer) return;

    event.dataTransfer.setData("application/json", JSON.stringify(item));
    event.dataTransfer.effectAllowed = "move";

    // Add dragging visual feedback
    const target = event.target as HTMLElement;
    target.classList.add("dragging");

    this.dragDropStateSubject.next({
      isDragging: true,
      draggedItem: item,
      dropZones: this.getValidDropZones(item.type),
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = "move";
  }

  onDragEnter(event: DragEvent, dropZoneId?: string) {
    event.preventDefault();
    if (dropZoneId) {
      const dropZone = event.target as HTMLElement;
      dropZone.classList.add("drag-over");
    }
  }

  onDragLeave(event: DragEvent, dropZoneId?: string) {
    if (dropZoneId) {
      const dropZone = event.target as HTMLElement;
      dropZone.classList.remove("drag-over");
    }
  }

  onDrop(event: DragEvent, targetData?: any) {
    event.preventDefault();

    try {
      const draggedItemData = event.dataTransfer?.getData("application/json");
      if (!draggedItemData) return null;

      const draggedItem = JSON.parse(draggedItemData) as DragDropItem;

      // Debounce: Prevent duplicate drops within a short time window
      const now = Date.now();
      if (
        this.lastDropItemId === draggedItem.id &&
        now - this.lastDropTime < this.dropDebounceMs
      ) {
        return null;
      }

      // Update drop tracking
      this.lastDropTime = now;
      this.lastDropItemId = draggedItem.id;

      // Clean up drag visual feedback
      this.cleanupDragFeedback();

      // Reset state
      this.dragDropStateSubject.next({
        isDragging: false,
        draggedItem: null,
        dropZones: [],
      });

      return {
        draggedItem,
        targetData,
      };
    } catch (error) {
      this.cleanupDragFeedback();
      return null;
    }
  }

  // Section specific drag and drop
  handleSectionDrop(
    draggedSection: any,
    targetSection: any,
    usedSections: any[],
  ): any[] {
    const draggedIndex = usedSections.findIndex(
      (s) => s.id === draggedSection.id,
    );
    const targetIndex = usedSections.findIndex(
      (s) => s.id === targetSection.id,
    );

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Create a copy of the array to avoid mutation
      const newSections = [...usedSections];

      // Swap sections
      [newSections[draggedIndex], newSections[targetIndex]] = [
        newSections[targetIndex],
        newSections[draggedIndex],
      ];

      // Update order numbers
      newSections.forEach((section, index) => {
        section.order = index + 1;
      });

      return newSections;
    }

    return usedSections;
  }

  // Layout specific drag and drop
  handleLayoutDrop(
    draggedItem: any,
    targetZone: string,
    layoutConfig: any,
  ): any {
    // Implementation for layout-specific drop handling
    // This would depend on your layout configuration structure
    return layoutConfig;
  }

  // Field specific drag and drop
  handleFieldReorder(
    draggedField: any,
    targetField: any,
    fields: any[],
  ): any[] {
    const draggedIndex = fields.findIndex((f) => f.id === draggedField.id);
    const targetIndex = fields.findIndex((f) => f.id === targetField.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newFields = [...fields];

      // Remove dragged item and insert at target position
      const [removed] = newFields.splice(draggedIndex, 1);
      newFields.splice(targetIndex, 0, removed);

      return newFields;
    }

    return fields;
  }

  // Helper methods
  private getValidDropZones(itemType: string): string[] {
    switch (itemType) {
      case "section":
        return ["layout-zone", "section-container"];
      case "field":
        return ["field-container", "section-fields"];
      case "layout":
        return ["layout-container"];
      default:
        return [];
    }
  }

  private cleanupDragFeedback() {
    // Remove all dragging classes
    const draggingElements = document.querySelectorAll(".dragging");
    draggingElements.forEach((element) => {
      element.classList.remove("dragging");
    });

    // Remove all drag-over classes
    const dragOverElements = document.querySelectorAll(".drag-over");
    dragOverElements.forEach((element) => {
      element.classList.remove("drag-over");
    });
  }

  // Validation methods
  canDropItemInZone(item: DragDropItem, zoneType: string): boolean {
    const validZones = this.getValidDropZones(item.type);
    return validZones.includes(zoneType);
  }

  // Utility methods for creating drag drop items
  createSectionDragItem(section: any): DragDropItem {
    return {
      id: section.id,
      data: section,
      type: "section",
    };
  }

  createFieldDragItem(field: any): DragDropItem {
    return {
      id: field.id || field.name,
      data: field,
      type: "field",
    };
  }

  createLayoutDragItem(layout: any): DragDropItem {
    return {
      id: layout.id,
      data: layout,
      type: "layout",
    };
  }

  // Get current drag state
  getCurrentDragState(): DragDropState {
    return this.dragDropStateSubject.value;
  }

  // Check if currently dragging
  isDragging(): boolean {
    return this.getCurrentDragState().isDragging;
  }

  // Reset drop debouncing
  resetDropDebounce() {
    this.lastDropTime = 0;
    this.lastDropItemId = null;
  }

  // Cleanup
  destroy() {
    this.cleanupDragFeedback();
    this.resetDropDebounce();
    this.dragDropStateSubject.complete();
  }
}
