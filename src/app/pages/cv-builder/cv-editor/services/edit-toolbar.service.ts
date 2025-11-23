import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface EditToolbarState {
  isVisible: boolean;
  position: { x: number; y: number };
  activeElement: HTMLElement | null;
  selectedText: string;
}

export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

/**
 * Edit Toolbar Service - Tương tự như useEditToolbar hook trong React
 * Quản lý text editing, formatting và toolbar state
 */
@Injectable({
  providedIn: 'root'
})
export class EditToolbarService {
  private readonly _toolbarState$ = new BehaviorSubject<EditToolbarState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    activeElement: null,
    selectedText: ''
  });
  
  private readonly _currentFormat$ = new BehaviorSubject<TextFormat>({});
  
  // Public observables
  public readonly toolbarState$ = this._toolbarState$.asObservable();
  public readonly currentFormat$ = this._currentFormat$.asObservable();
  
  // Font size options
  readonly fontSizeOptions = [10, 12, 14, 16, 18, 20, 24, 28, 32];
  
  // Getters
  get currentToolbarState(): EditToolbarState {
    return this._toolbarState$.value;
  }
  
  get currentFormat(): TextFormat {
    return this._currentFormat$.value;
  }
  
  // Toolbar Visibility Management
  showToolbar(event: MouseEvent, element: HTMLElement): void {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString() : '';
    
    if (selectedText.trim().length === 0) {
      this.hideToolbar();
      return;
    }
    
    const rect = this.getSelectionRect();
    const position = this.calculateToolbarPosition(rect, event);
    
    this.updateToolbarState({
      isVisible: true,
      position,
      activeElement: element,
      selectedText
    });
    
    this.updateCurrentFormat(element);
  }
  
  hideToolbar(): void {
    this.updateToolbarState({
      isVisible: false,
      position: { x: 0, y: 0 },
      activeElement: null,
      selectedText: ''
    });
  }
  
  // Text Formatting Methods
  makeBold(): void {
    this.executeCommand('bold');
    this.updateFormatState({ bold: !this.currentFormat.bold });
  }
  
  makeItalic(): void {
    this.executeCommand('italic');
    this.updateFormatState({ italic: !this.currentFormat.italic });
  }
  
  makeUnderline(): void {
    this.executeCommand('underline');
    this.updateFormatState({ underline: !this.currentFormat.underline });
  }
  
  // List Creation
  createBulletList(): void {
    this.executeCommand('insertUnorderedList');
  }
  
  createNumberList(): void {
    this.executeCommand('insertOrderedList');
  }
  
  // Text Alignment
  alignLeft(): void {
    this.executeCommand('justifyLeft');
    this.updateFormatState({ alignment: 'left' });
  }
  
  alignCenter(): void {
    this.executeCommand('justifyCenter');
    this.updateFormatState({ alignment: 'center' });
  }
  
  alignRight(): void {
    this.executeCommand('justifyRight');
    this.updateFormatState({ alignment: 'right' });
  }
  
  alignJustify(): void {
    this.executeCommand('justifyFull');
    this.updateFormatState({ alignment: 'justify' });
  }
  
  // Font Size Management
  changeFontSize(size: number): void {
    const activeElement = this.currentToolbarState.activeElement;
    if (!activeElement) return;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      
      try {
        range.surroundContents(span);
        this.updateFormatState({ fontSize: size });
      } catch (e) {
        // Fallback for complex selections
        this.executeCommand('fontSize', '3');
        const fontElements = activeElement.querySelectorAll('font[size="3"]');
        fontElements.forEach(el => {
          (el as HTMLElement).style.fontSize = `${size}px`;
        });
      }
    }
  }
  
  // Advanced Text Operations
  removeFormatting(): void {
    this.executeCommand('removeFormat');
    this._currentFormat$.next({});
  }
  
  insertLink(url: string): void {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      this.executeCommand('createLink', url);
    }
  }
  
  removeLink(): void {
    this.executeCommand('unlink');
  }
  
  // Format Detection
  private updateCurrentFormat(element: HTMLElement): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const containerElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer as HTMLElement;
    
    if (!containerElement) return;
    
    const computedStyle = window.getComputedStyle(containerElement);
    
    const format: TextFormat = {
      bold: this.checkCommandState('bold') || computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 600,
      italic: this.checkCommandState('italic') || computedStyle.fontStyle === 'italic',
      underline: this.checkCommandState('underline') || computedStyle.textDecoration.includes('underline'),
      fontSize: parseInt(computedStyle.fontSize),
      alignment: this.detectAlignment(computedStyle.textAlign)
    };
    
    this._currentFormat$.next(format);
  }
  
  private detectAlignment(textAlign: string): 'left' | 'center' | 'right' | 'justify' {
    switch (textAlign) {
      case 'center': return 'center';
      case 'right': return 'right';
      case 'justify': return 'justify';
      default: return 'left';
    }
  }
  
  // Utility Methods
  private executeCommand(command: string, value?: string): void {
    try {
      document.execCommand(command, false, value);
    } catch (e) {
      console.warn(`Could not execute command: ${command}`, e);
    }
  }
  
  private checkCommandState(command: string): boolean {
    try {
      return document.queryCommandState(command);
    } catch (e) {
      return false;
    }
  }
  
  private getSelectionRect(): DOMRect {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return new DOMRect(0, 0, 0, 0);
    }
    
    const range = selection.getRangeAt(0);
    return range.getBoundingClientRect();
  }
  
  private calculateToolbarPosition(selectionRect: DOMRect, event: MouseEvent): { x: number; y: number } {
    const toolbarWidth = 450; // Approximate toolbar width
    const toolbarHeight = 48; // Approximate toolbar height
    const margin = 10;
    
    let x = selectionRect.left + (selectionRect.width / 2) - (toolbarWidth / 2);
    let y = selectionRect.top - toolbarHeight - margin;
    
    // Adjust if toolbar would go off-screen
    if (x < margin) {
      x = margin;
    } else if (x + toolbarWidth > window.innerWidth - margin) {
      x = window.innerWidth - toolbarWidth - margin;
    }
    
    if (y < margin) {
      y = selectionRect.bottom + margin; // Show below selection
    }
    
    return { x, y };
  }
  
  private updateToolbarState(partialState: Partial<EditToolbarState>): void {
    const newState = { ...this.currentToolbarState, ...partialState };
    this._toolbarState$.next(newState);
  }
  
  private updateFormatState(partialFormat: Partial<TextFormat>): void {
    const newFormat = { ...this.currentFormat, ...partialFormat };
    this._currentFormat$.next(newFormat);
  }
  
  // Event Handlers for component use
  onTextSelection(event: MouseEvent, element: HTMLElement): void {
    // Delay to ensure selection is complete
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        this.showToolbar(event, element);
      } else {
        this.hideToolbar();
      }
    }, 10);
  }
  
  onElementClick(event: MouseEvent, element: HTMLElement): void {
    // Store active element for future edits
    this.updateToolbarState({ activeElement: element });
  }
  
  onElementFocus(element: HTMLElement): void {
    this.updateToolbarState({ activeElement: element });
  }
  
  onElementBlur(): void {
    // Hide toolbar after a delay to allow for toolbar interactions
    setTimeout(() => {
      if (!this.isToolbarFocused()) {
        this.hideToolbar();
      }
    }, 150);
  }
  
  private isToolbarFocused(): boolean {
    const activeElement = document.activeElement;
    const toolbar = document.querySelector('.edit-toolbar');
    return toolbar?.contains(activeElement) ?? false;
  }
  
  // Keyboard Shortcuts
  handleKeyboardShortcut(event: KeyboardEvent): boolean {
    if (!event.ctrlKey && !event.metaKey) return false;
    
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault();
        this.makeBold();
        return true;
      case 'i':
        event.preventDefault();
        this.makeItalic();
        return true;
      case 'u':
        event.preventDefault();
        this.makeUnderline();
        return true;
      case 'l':
        if (event.shiftKey) {
          event.preventDefault();
          this.alignLeft();
          return true;
        }
        break;
      case 'e':
        if (event.shiftKey) {
          event.preventDefault();
          this.alignCenter();
          return true;
        }
        break;
      case 'r':
        if (event.shiftKey) {
          event.preventDefault();
          this.alignRight();
          return true;
        }
        break;
      default:
        return false;
    }
    
    return false;
  }
  
  // Cleanup
  cleanup(): void {
    this.hideToolbar();
    this._currentFormat$.next({});
  }
  
  // Observable getters for specific states
  get isVisible$(): Observable<boolean> {
    return new BehaviorSubject(this.currentToolbarState.isVisible);
  }
  
  get position$(): Observable<{ x: number; y: number }> {
    return new BehaviorSubject(this.currentToolbarState.position);
  }
  
  get activeElement$(): Observable<HTMLElement | null> {
    return new BehaviorSubject(this.currentToolbarState.activeElement);
  }
}