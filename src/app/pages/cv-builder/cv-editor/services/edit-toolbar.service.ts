import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface ToolbarState {
  visible: boolean;
  position: { x: number; y: number };
  activeElement: HTMLElement | null;
  fieldType?: string;
  sectionId?: string;
  fieldId?: string;
}

export interface ToolbarConfig {
  width: number;
  height: number;
  margin: number;
}

export interface TextFormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: string;
  isList: boolean;
}

@Injectable({
  providedIn: "root",
})
export class EditToolbarService {
  private toolbarStateSubject = new BehaviorSubject<ToolbarState>({
    visible: false,
    position: { x: 0, y: 0 },
    activeElement: null,
  });

  public toolbarState$: Observable<ToolbarState> =
    this.toolbarStateSubject.asObservable();

  private config: ToolbarConfig = {
    width: 550,
    height: 50,
    margin: 20,
  };

  private outsideClickHandler?: (event: Event) => void;
  private keyboardHandler?: (event: KeyboardEvent) => void;

  constructor() {
    this.setupKeyboardShortcuts();
  }

  /**
   * Show toolbar at calculated position near the clicked element
   */
  showToolbarAt(
    event: MouseEvent,
    element: HTMLElement,
    fieldType: string = "richtext",
    sectionId?: string,
    fieldId?: string,
  ) {
    event.stopPropagation();

    // Ensure the element is editable
    if (fieldType === "richtext" || fieldType === "textarea") {
      element.contentEditable = "true";
    }

    // Focus the element
    element.focus();

    const position = this.calculateToolbarPosition(element);

    this.toolbarStateSubject.next({
      visible: true,
      position,
      activeElement: element,
      fieldType,
      sectionId,
      fieldId,
    });

    // Setup outside click handling
    this.setupOutsideClickHandler();
  }

  /**
   * Hide toolbar and cleanup
   */
  hideToolbar() {
    const currentState = this.toolbarStateSubject.value;

    // Make element non-editable if it was editable
    if (currentState.activeElement) {
      const element = currentState.activeElement;
      if (element.contentEditable === "true") {
        element.contentEditable = "false";
      }
    }

    this.toolbarStateSubject.next({
      visible: false,
      position: { x: 0, y: 0 },
      activeElement: null,
    });

    // Cleanup outside click handler
    this.removeOutsideClickHandler();
  }

  /**
   * Get current toolbar state
   */
  getCurrentState(): ToolbarState {
    return this.toolbarStateSubject.value;
  }

  /**
   * Get current text formatting state
   */
  getCurrentFormatState(): TextFormatState {
    const activeElement = this.getCurrentState().activeElement;

    if (!activeElement) {
      return this.getDefaultFormatState();
    }

    const computedStyle = window.getComputedStyle(activeElement);
    const selection = window.getSelection();

    return {
      bold:
        document.queryCommandState("bold") ||
        computedStyle.fontWeight === "bold" ||
        parseInt(computedStyle.fontWeight) >= 700,
      italic:
        document.queryCommandState("italic") ||
        computedStyle.fontStyle === "italic",
      underline:
        document.queryCommandState("underline") ||
        computedStyle.textDecoration.includes("underline"),
      fontSize: parseInt(computedStyle.fontSize) || 14,
      fontFamily:
        computedStyle.fontFamily.replace(/['"]/g, "").split(",")[0] || "Roboto",
      color: this.rgbToHex(computedStyle.color) || "#000000",
      alignment: this.getTextAlignment(activeElement),
      isList: this.isInList(activeElement),
    };
  }

  // ========== Text Formatting Methods ==========

  /**
   * Apply bold formatting
   */
  applyBold() {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.contentEditable = "true";
      activeElement.focus();

      setTimeout(() => {
        this.restoreOrCreateSelection(activeElement);
        document.execCommand("bold", false);
        activeElement.focus();
      }, 10);
    }
  }

  /**
   * Apply italic formatting
   */
  applyItalic() {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.contentEditable = "true";
      activeElement.focus();

      setTimeout(() => {
        this.restoreOrCreateSelection(activeElement);
        document.execCommand("italic", false);
        activeElement.focus();
      }, 10);
    }
  }

  /**
   * Apply underline formatting
   */
  applyUnderline() {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.contentEditable = "true";
      activeElement.focus();

      setTimeout(() => {
        this.restoreOrCreateSelection(activeElement);
        document.execCommand("underline", false);
        activeElement.focus();
      }, 10);
    }
  }

  /**
   * Create bullet list
   */
  createBulletList() {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.contentEditable = "true";
      activeElement.focus();

      setTimeout(() => {
        this.restoreOrCreateSelection(activeElement);
        document.execCommand("insertUnorderedList", false);
        activeElement.focus();
      }, 10);
    }
  }

  /**
   * Create numbered list
   */
  createNumberList() {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.contentEditable = "true";
      activeElement.focus();

      setTimeout(() => {
        this.restoreOrCreateSelection(activeElement);
        document.execCommand("insertOrderedList", false);
        activeElement.focus();
      }, 10);
    }
  }

  /**
   * Change font size
   */
  changeFontSize(size: number) {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.contentEditable = "true";
      activeElement.focus();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          // Has selection - wrap it
          const span = document.createElement("span");
          span.style.fontSize = size + "px";
          try {
            range.surroundContents(span);
          } catch (e) {
            // If can't surround (e.g., partial element), extract and wrap
            span.appendChild(range.extractContents());
            range.insertNode(span);
          }
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // No selection - apply to entire element
          activeElement.style.fontSize = size + "px";
        }
      } else {
        activeElement.style.fontSize = size + "px";
      }

      activeElement.focus();
    }
  }

  /**
   * Change font family
   */
  changeFontFamily(fontFamily: string) {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.contentEditable = "true";
      activeElement.focus();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          const span = document.createElement("span");
          span.style.fontFamily = fontFamily;
          try {
            range.surroundContents(span);
          } catch (e) {
            span.appendChild(range.extractContents());
            range.insertNode(span);
          }
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          activeElement.style.fontFamily = fontFamily;
        }
      } else {
        activeElement.style.fontFamily = fontFamily;
      }

      activeElement.focus();
    }
  }

  /**
   * Change text color
   */
  changeTextColor(color: string) {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.contentEditable = "true";
      activeElement.focus();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          const span = document.createElement("span");
          span.style.color = color;
          try {
            range.surroundContents(span);
          } catch (e) {
            span.appendChild(range.extractContents());
            range.insertNode(span);
          }
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          activeElement.style.color = color;
        }
      } else {
        activeElement.style.color = color;
      }

      activeElement.focus();
    }
  }

  // ========== Text Alignment Methods ==========

  /**
   * Align text left
   */
  alignLeft() {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.contentEditable = "true";
      activeElement.focus();

      setTimeout(() => {
        this.restoreOrCreateSelection(activeElement);
        document.execCommand("justifyLeft", false);
        activeElement.focus();
      }, 10);
    }
  }

  /**
   * Align text center
   */
  alignCenter() {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.contentEditable = "true";
      activeElement.focus();

      setTimeout(() => {
        this.restoreOrCreateSelection(activeElement);
        document.execCommand("justifyCenter", false);
        activeElement.focus();
      }, 10);
    }
  }

  /**
   * Align text right
   */
  alignRight() {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.contentEditable = "true";
      activeElement.focus();

      setTimeout(() => {
        this.restoreOrCreateSelection(activeElement);
        document.execCommand("justifyRight", false);
        activeElement.focus();
      }, 10);
    }
  }

  /**
   * Align text justify
   */
  alignJustify() {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.contentEditable = "true";
      activeElement.focus();

      setTimeout(() => {
        this.restoreOrCreateSelection(activeElement);
        document.execCommand("justifyFull", false);
        activeElement.focus();
      }, 10);
    }
  }

  // ========== Helper Methods ==========

  /**
   * Calculate optimal toolbar position near the element
   */
  private calculateToolbarPosition(element: HTMLElement): {
    x: number;
    y: number;
  } {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;

    // Calculate horizontal position (centered above element)
    let xPos = rect.left + rect.width / 2 - this.config.width / 2;

    // Ensure toolbar stays within viewport horizontally
    if (xPos + this.config.width > viewportWidth - this.config.margin) {
      xPos = viewportWidth - this.config.width - this.config.margin;
    }
    if (xPos < this.config.margin) {
      xPos = this.config.margin;
    }

    // Calculate vertical position (above the element)
    let yPos = rect.top + scrollY - this.config.height - 10;

    // If not enough space above, show below
    if (rect.top < this.config.height + this.config.margin) {
      yPos = rect.bottom + scrollY + 10;
    }

    return { x: xPos, y: yPos };
  }

  /**
   * Restore selection or create a new one in the element
   */
  private restoreOrCreateSelection(element: HTMLElement) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false); // Collapse to end
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  /**
   * Focus the active element
   */
  private focusActiveElement() {
    const activeElement = this.getCurrentState().activeElement;
    if (activeElement) {
      activeElement.focus();
    }
  }

  /**
   * Get text alignment of element
   */
  private getTextAlignment(element: HTMLElement): string {
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.textAlign || "left";
  }

  /**
   * Check if element is in a list
   */
  private isInList(element: HTMLElement): boolean {
    let current: HTMLElement | null = element;
    while (current) {
      if (
        current.tagName === "UL" ||
        current.tagName === "OL" ||
        current.tagName === "LI"
      ) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  /**
   * Convert RGB color to hex
   */
  private rgbToHex(rgb: string): string {
    if (rgb.startsWith("#")) {
      return rgb;
    }

    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) {
      return "#000000";
    }

    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);

    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }

  /**
   * Get default format state
   */
  private getDefaultFormatState(): TextFormatState {
    return {
      bold: false,
      italic: false,
      underline: false,
      fontSize: 14,
      fontFamily: "Roboto",
      color: "#000000",
      alignment: "left",
      isList: false,
    };
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts() {
    this.keyboardHandler = (event: KeyboardEvent) => {
      const state = this.getCurrentState();
      if (!state.visible || !state.activeElement) {
        return;
      }

      // Ctrl/Cmd + B: Bold
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        this.applyBold();
      }

      // Ctrl/Cmd + I: Italic
      if ((event.ctrlKey || event.metaKey) && event.key === "i") {
        event.preventDefault();
        this.applyItalic();
      }

      // Ctrl/Cmd + U: Underline
      if ((event.ctrlKey || event.metaKey) && event.key === "u") {
        event.preventDefault();
        this.applyUnderline();
      }

      // Escape: Close toolbar
      if (event.key === "Escape") {
        event.preventDefault();
        this.hideToolbar();
      }

      // Ctrl/Cmd + Shift + L: Bullet list
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "l"
      ) {
        event.preventDefault();
        this.createBulletList();
      }

      // Ctrl/Cmd + Shift + N: Number list
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "n"
      ) {
        event.preventDefault();
        this.createNumberList();
      }
    };

    document.addEventListener("keydown", this.keyboardHandler);
  }

  /**
   * Setup outside click handler to hide toolbar
   */
  private setupOutsideClickHandler() {
    this.outsideClickHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      const toolbar = document.querySelector(".edit-toolbar");
      const activeElement = this.getCurrentState().activeElement;

      // Don't hide if clicking on toolbar or active element
      if (
        toolbar &&
        !toolbar.contains(target) &&
        !activeElement?.contains(target)
      ) {
        // Check if clicking on another editable element
        const clickedEditable = target.closest('[data-editable="true"]');
        if (!clickedEditable) {
          this.hideToolbar();
        }
      }
    };

    // Delay to avoid immediate trigger
    setTimeout(() => {
      document.addEventListener("click", this.outsideClickHandler!, {
        capture: true,
      });
    }, 100);
  }

  /**
   * Remove outside click handler
   */
  private removeOutsideClickHandler() {
    if (this.outsideClickHandler) {
      document.removeEventListener("click", this.outsideClickHandler, {
        capture: true,
      });
      this.outsideClickHandler = undefined;
    }
  }

  /**
   * Cleanup method - call on service destroy
   */
  destroy() {
    this.removeOutsideClickHandler();

    if (this.keyboardHandler) {
      document.removeEventListener("keydown", this.keyboardHandler);
      this.keyboardHandler = undefined;
    }

    this.toolbarStateSubject.complete();
  }
}
