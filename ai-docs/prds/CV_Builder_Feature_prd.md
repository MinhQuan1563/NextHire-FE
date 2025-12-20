# CV Builder Feature - Complete Documentation

**Version:** 2.0.0  
**Last Updated:** 2024  
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Developer Quick Reference](#developer-quick-reference)
4. [PDF Export Feature](#pdf-export-feature)
5. [Inline Editing Implementation](#inline-editing-implementation)
6. [CV Layout System](#cv-layout-system)
7. [API Reference](#api-reference)
8. [Testing Guide](#testing-guide)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Overview

The CV Builder is a comprehensive feature that allows users to create, customize, and export professional CVs. It includes:

- **Drag-and-drop layout system** - Flexible section arrangement
- **Inline content editing** - Real-time text editing with cursor preservation
- **PDF export** - High-quality PDF generation with validation
- **Template management** - Multiple CV templates with customization
- **Responsive design** - Works on desktop and mobile devices

---

## Quick Start Guide

### For Users

1. **Create a New CV**
   - Navigate to CV Builder
   - Select a template
   - Click "Create New CV"

2. **Fill in Your Information**
   - Click on any text to edit inline
   - Upload profile photo
   - Add/remove sections as needed

3. **Customize Layout**
   - Drag sections to reorder
   - Adjust column widths
   - Change fonts and colors

4. **Export to PDF**
   - Click "Tải xuống" button
   - Fix any validation errors
   - PDF downloads automatically

### For Developers

1. **Setup Development Environment**
   ```bash
   npm install
   ng serve
   ```

2. **Key Components**
   - `cv-builder/` - Main CV builder container
   - `cv-preview/` - Preview component with editing
   - `cv-pdf-export.service.ts` - PDF generation service
   - `drag-drop-handler.service.ts` - Drag & drop logic

3. **Common Tasks**
   - Add new field type: Extend field configuration
   - Add validation rule: Update validation service
   - Modify PDF layout: Adjust export options

---

# Developer Quick Reference

## Quick Navigation
- [Dialog Reset Pattern](#dialog-reset-pattern)
- [Drag-Drop Best Practices](#drag-drop-best-practices)
- [Contenteditable Implementation](#contenteditable-implementation)

---

## Dialog Reset Pattern

### Problem
Forms and dialogs retaining state between open/close cycles.

### Solution Template
```typescript
export class YourDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() data?: YourDataType;
  
  form = this.fb.group({ /* your fields */ });
  localState = signal<any[]>([]);

  ngOnChanges(changes: SimpleChanges) {
    // Reset when opening in create mode
    if (changes['visible']?.currentValue === true && !this.data) {
      this.resetDialog();
    }
    
    // Load data when opening in edit mode
    if (changes['data'] && this.data) {
      this.form.patchValue(this.data);
      this.localState.set(this.data.items || []);
    } else if (changes['data']) {
      this.resetDialog();
    }
  }

  private resetDialog() {
    this.form.reset({
      field1: '',
      field2: defaultValue,
    });
    this.localState.set([]);
    // Reset any other component state
  }

  close() {
    this.resetDialog(); // Always reset on close
    this.onClose.emit();
  }
}
```

### Key Points
- ✅ Always reset in both `close()` and `ngOnChanges`
- ✅ Check `visible` changes to true without data
- ✅ Reset ALL component state (signals, flags, arrays)
- ❌ Don't rely on form.reset() alone
- ❌ Don't forget nested state (dialogs within dialogs)

---

## Drag-Drop Best Practices

### Problem
Events bubble causing duplicate handler execution.

### Solution Template
```typescript
onDropHandler(event: DragEvent, targetId: string): void {
  // CRITICAL: Stop propagation first
  event.stopPropagation();
  event.preventDefault();

  const dropResult = this.dragDropService.onDrop(event);
  if (!dropResult) return;

  // Your drop logic here
  const newConfig = this.cloneConfiguration();
  // ... modify config
  this.configChange.emit(newConfig);
}
```

### Event Flow Diagram
```
User drops item
    ↓
onDropOnSection() ← Add stopPropagation() here
    ↓ (bubbles without stopPropagation)
onDropOnColumn()  ← Would also fire = DUPLICATE
    ↓ (bubbles)
onDropOnRow()     ← Would also fire = TRIPLICATE
```

### Debouncing Service Pattern
```typescript
export class DragDropHandlerService {
  private lastDropTime = 0;
  private lastDropItemId: string | null = null;
  private dropDebounceMs = 100;

  onDrop(event: DragEvent) {
    const item = this.getItemFromEvent(event);
    const now = Date.now();
    
    // Reject duplicates within time window
    if (this.lastDropItemId === item.id && 
        now - this.lastDropTime < this.dropDebounceMs) {
      console.warn('Duplicate drop prevented');
      return null;
    }
    
    this.lastDropTime = now;
    this.lastDropItemId = item.id;
    
    return { draggedItem: item };
  }
}
```

### Checklist
- ✅ Call `stopPropagation()` in ALL drop handlers
- ✅ Call `preventDefault()` to prevent browser defaults
- ✅ Implement time-based debouncing (50-100ms)
- ✅ Track last dropped item ID
- ✅ Clean up drag state after drop
- ❌ Don't forget nested drop zones
- ❌ Don't rely on `once` event listeners (Angular doesn't support)

---

## Contenteditable Implementation

### ❌ WRONG WAY - Don't Do This
```html
<!-- This BREAKS cursor position -->
<div contenteditable="true">
  {{ fieldValue }}  <!-- Angular re-renders this! -->
</div>
```

### ✅ CORRECT WAY
```html
<!-- Use textContent binding instead -->
<div 
  contenteditable="true"
  [textContent]="getFieldValue(field)"
  (input)="onFieldChange($event, field)"
  (keydown)="onFieldKeyDown($event, field)"
  (blur)="onFieldBlur($event, field)"
></div>
```

### Component Implementation
```typescript
export class ContentEditableComponent implements AfterViewChecked {
  private cursorPositions = new Map<string, number>();
  private shouldRestoreCursor = false;
  private pendingCursorRestore: string | null = null;

  ngAfterViewChecked() {
    if (this.shouldRestoreCursor && this.pendingCursorRestore) {
      this.restoreCursorPosition(this.pendingCursorRestore);
      this.shouldRestoreCursor = false;
      this.pendingCursorRestore = null;
    }
  }

  onFieldChange(event: Event, fieldId: string): void {
    const target = event.target as HTMLElement;
    const value = target.textContent || '';
    
    // Save cursor BEFORE updating value
    this.saveCursorPosition(target, fieldId);
    
    // Update the model
    this.updateFieldValue(fieldId, value);
    
    // Schedule cursor restoration
    this.shouldRestoreCursor = true;
    this.pendingCursorRestore = fieldId;
  }

  onFieldKeyDown(event: KeyboardEvent, fieldId: string): void {
    const target = event.target as HTMLElement;
    
    // Save on every keystroke
    this.saveCursorPosition(target, fieldId);
    
    // Handle special keys
    if (event.key === 'Escape') {
      event.preventDefault();
      target.blur();
    }
  }

  private saveCursorPosition(element: HTMLElement, fieldId: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    
    const caretOffset = preCaretRange.toString().length;
    this.cursorPositions.set(fieldId, caretOffset);
  }

  private restoreCursorPosition(fieldId: string): void {
    const caretOffset = this.cursorPositions.get(fieldId);
    if (caretOffset === undefined) return;

    const element = document.querySelector(
      `[data-field-id="${fieldId}"]`
    ) as HTMLElement;
    
    if (!element) return;

    try {
      const range = document.createRange();
      const selection = window.getSelection();
      
      // Use TreeWalker to find text node at offset
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
      );

      let currentPos = 0;
      let node = walker.nextNode();
      
      while (node) {
        const textLength = node.textContent?.length || 0;
        
        if (currentPos + textLength >= caretOffset) {
          range.setStart(node, caretOffset - currentPos);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
          return;
        }
        
        currentPos += textLength;
        node = walker.nextNode();
      }
      
      // Fallback: place at end
      if (element.lastChild) {
        range.setStartAfter(element.lastChild);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    } catch (error) {
      console.warn('Could not restore cursor:', error);
    }
  }
}
```

### Key Principles

#### 1. Never Use Interpolation Inside Contenteditable
```typescript
// ❌ WRONG
<div contenteditable>{{ value }}</div>

// ✅ CORRECT
<div contenteditable [textContent]="value"></div>
```

#### 2. Always Save Cursor Before Model Update
```typescript
onInput(event) {
  this.saveCursor();     // 1. Save first
  this.updateModel();     // 2. Update model
  this.scheduleRestore(); // 3. Schedule restore
}
```

#### 3. Restore After View Update
```typescript
ngAfterViewChecked() {
  if (this.needsRestore) {
    this.restoreCursor();
  }
}
```

#### 4. Handle All Input Methods
- Keyboard typing
- Backspace/Delete
- Arrow key navigation
- Mouse selection
- Copy/paste
- Drag text

### Common Pitfalls

| Issue | Cause | Solution |
|-------|-------|----------|
| Cursor jumps to start | Angular re-renders content | Use `[textContent]` instead of `{{}}` |
| Backspace doesn't work | Cursor at position 0 | Save cursor before update |
| Can't select text | Selection cleared | Don't modify DOM during selection |
| Paste duplicates text | Event not prevented | Handle paste event explicitly |
| Formatting lost | Using textContent | Use innerHTML for rich text |

### Testing Checklist
- [ ] Type naturally - cursor stays at end
- [ ] Backspace deletes last character
- [ ] Delete key works
- [ ] Arrow keys navigate
- [ ] Home/End keys work
- [ ] Shift+arrows select text
- [ ] Ctrl+A selects all
- [ ] Copy/paste works
- [ ] Drag text works
- [ ] Undo/redo works (browser default)

---

# PDF Export Feature - Complete Guide

## Overview
The CV Builder includes a comprehensive PDF export feature that validates all fields before generating a high-quality PDF with the current design, fonts, and styles.

---

## Features

### ✅ Field Validation
- **Required fields** - Ensures all required fields are filled
- **Email validation** - Checks valid email format
- **Phone validation** - Validates phone number format
- **URL validation** - Checks valid URL format
- **Text length limits** - Warns if text exceeds maximum length
- **Image validation** - Ensures required images are uploaded

### ✅ PDF Generation
- **High quality** - 2x scale for crisp text and images
- **Current styles** - Preserves fonts, colors, and formatting
- **A4 format** - Standard paper size (210mm x 297mm)
- **Portrait orientation** - Vertical layout
- **Metadata** - Includes title, author, and keywords

### ✅ User Experience
- **Loading indicators** - Shows progress during export
- **Toast notifications** - Clear success/error messages
- **Validation feedback** - Lists all errors and warnings
- **Automatic filename** - Includes template name and date

---

## How to Use

### Step 1: Fill in All Required Fields
1. Navigate through all sections in the CV
2. Fill in all fields marked as required (*)
3. Upload any required images

### Step 2: Click Download Button
1. Click the **"Tải xuống"** (Download) button in CV Preview header
2. System will automatically validate all fields

### Step 3: Fix Validation Errors (if any)
If validation fails, you'll see toast messages with:
- Number of errors found
- Section name and field label
- Specific error message

**Example Error:**
```
Personal Info - Email: Required field "Email" is empty
```

Fix all errors and try again.

### Step 4: Review Warnings (optional)
Warnings don't block export but indicate potential issues:
- Phone format may be invalid
- Text exceeds recommended length
- Section has no fields defined

### Step 5: PDF Downloads Automatically
Once validation passes:
- PDF is generated (takes 2-5 seconds)
- File downloads automatically
- Filename format: `{TemplateName}_{Date}.pdf`
- Example: `CV-Template_2024-01-15.pdf`

---

## Validation Rules

### Required Fields
All fields marked with `required: true` must have a value.

**Example:**
```typescript
{
  name: 'fullName',
  label: 'Full Name',
  type: 'text',
  required: true // Must be filled
}
```

**Error Message:**
```
Required field "Full Name" is empty
```

---

### Email Validation
Fields of type `email` must match email format.

**Valid Formats:**
- `user@example.com`
- `john.doe@company.co.uk`
- `test+tag@domain.org`

**Invalid Formats:**
- `user@` (missing domain)
- `@example.com` (missing user)
- `user@domain` (missing TLD)

**Error Message:**
```
Invalid email format in "Email Address"
```

---

### Phone Validation
Fields of type `phone` should contain valid phone numbers.

**Valid Formats:**
- `+1 (555) 123-4567`
- `0123456789`
- `+84 912 345 678`
- `555-1234`

**Rules:**
- Must contain 10-15 digits
- Can include: spaces, hyphens, parentheses, plus sign
- Numbers only (no letters)

**Warning Message:**
```
Phone format in "Phone Number" may be invalid
```

Note: This is a warning, not an error. Export will still proceed.

---

### URL Validation
Fields of type `url` must be valid URLs.

**Valid Formats:**
- `https://example.com`
- `http://www.website.org`
- `example.com` (auto-adds https://)

**Invalid Formats:**
- `htp://wrong.com` (typo in protocol)
- `not a url` (no domain)

**Error Message:**
```
Invalid URL format in "Website"
```

---

### Image Validation
Fields of type `image` with `required: true` must have an uploaded image.

**Error Message:**
```
Required image in "Profile Photo" is missing
```

---

### Text Length Validation
Fields with `maxLength` property warn if exceeded.

**Example:**
```typescript
{
  name: 'summary',
  label: 'Professional Summary',
  type: 'textarea',
  maxLength: 500
}
```

**Warning Message:**
```
Text in "Professional Summary" exceeds maximum length (650/500)
```

---

## Technical Implementation

### PDF Export Flow

```
1. User clicks "Download" button
   ↓
2. Validate all fields
   ↓
3. Show validation errors (if any)
   → User fixes errors and tries again
   ↓
4. Hide interactive elements (controls, buttons)
   ↓
5. Capture CV as high-res canvas (html2canvas)
   ↓
6. Convert canvas to JPEG image
   ↓
7. Create PDF document (jsPDF)
   ↓
8. Add image to PDF
   ↓
9. Add metadata (title, author, keywords)
   ↓
10. Save PDF file
   ↓
11. Show interactive elements again
   ↓
12. Display success message
```

---

### Libraries Used

**html2canvas (v1.4.1)**
- Converts HTML/CSS to canvas
- Preserves all styles and formatting
- Supports images and custom fonts

**jsPDF (v3.0.3)**
- Generates PDF files
- Supports A4 and Letter formats
- Adds metadata and properties

---

### Export Options

```typescript
{
  filename: string,        // Base filename (without extension)
  format: 'a4' | 'letter', // Paper size
  orientation: 'portrait' | 'landscape',
  quality: number,         // Scale factor (1-3)
  includeMetadata: boolean // Add PDF properties
}
```

**Default Options:**
```typescript
{
  filename: 'CV-Template',
  format: 'a4',
  orientation: 'portrait',
  quality: 2,
  includeMetadata: true
}
```

---

# CV Layout System

## Overview

The CV Layout System provides a flexible, drag-and-drop interface for customizing CV templates with multiple layout configurations.

---

## Architecture

### Core Components

1. **CV Preview Component**
   - Renders the CV layout
   - Handles inline editing
   - Manages layout configuration

2. **Layout Configuration**
   - Defines rows, columns, and sections
   - Stores field values
   - Supports multiple layouts (1-column, 2-column, 3-column)

3. **Drag & Drop Service**
   - Manages drag events
   - Prevents duplicates
   - Handles section movement

4. **Field Types**
   - Text input
   - Textarea
   - Email
   - Phone
   - URL
   - Image
   - Date
   - Rich text

---

## Layout Structure

```typescript
interface CVConfiguration {
  rows: CVRow[];
}

interface CVRow {
  id: string;
  columns: CVColumn[];
}

interface CVColumn {
  id: string;
  sections: CVSection[];
  width: string; // e.g., "33.33%", "50%", "100%"
}

interface CVSection {
  id: string;
  title: string;
  fields: CVField[];
  isRepeatable?: boolean;
  items?: any[];
}

interface CVField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
}
```

---

## Supported Layouts

### 1-Column Layout
```
┌─────────────────────────┐
│      Full Width         │
│                         │
│   All sections stack    │
│   vertically in one     │
│   column                │
│                         │
└─────────────────────────┘
```

### 2-Column Layout (70/30)
```
┌────────────────┬────────┐
│                │        │
│   Main (70%)   │ Side   │
│   Content      │ (30%)  │
│                │        │
└────────────────┴────────┘
```

### 3-Column Layout (40/30/30)
```
┌──────────┬──────┬──────┐
│          │      │      │
│   Main   │ Mid  │ Side │
│   (40%)  │ (30%)│ (30%)│
│          │      │      │
└──────────┴──────┴──────┘
```

---

## Drag & Drop Implementation

### Making Sections Draggable

```html
<div 
  [draggable]="true"
  (dragstart)="onDragStart($event, section)"
  (dragend)="onDragEnd($event)"
  class="cv-section">
  <!-- Section content -->
</div>
```

### Making Areas Drop Targets

```html
<div 
  (dragover)="onDragOver($event)"
  (drop)="onDrop($event, column.id)"
  class="drop-zone">
  <!-- Drop zone content -->
</div>
```

### Handler Implementation

```typescript
onDragStart(event: DragEvent, section: CVSection): void {
  this.dragDropService.setDragData(section);
  event.dataTransfer!.effectAllowed = 'move';
}

onDragOver(event: DragEvent): void {
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'move';
}

onDrop(event: DragEvent, columnId: string): void {
  event.stopPropagation();
  event.preventDefault();
  
  const result = this.dragDropService.onDrop(event);
  if (!result) return;
  
  // Update layout configuration
  this.moveSection(result.draggedItem, columnId);
}
```

---

## Inline Editing

### Text Field Editing

```html
<div 
  contenteditable="true"
  [textContent]="getFieldValue(field)"
  (input)="onFieldChange($event, field)"
  (blur)="onFieldBlur($event, field)"
  [attr.data-field-id]="field.name"
  class="editable-field">
</div>
```

### Image Upload

```html
<div class="image-field">
  <img 
    *ngIf="getFieldValue(field)"
    [src]="getFieldValue(field)"
    alt="Profile photo">
  
  <input 
    type="file"
    accept="image/*"
    (change)="onImageUpload($event, field)"
    #fileInput>
  
  <button (click)="fileInput.click()">
    Upload Image
  </button>
</div>
```

### Rich Text Editing

```html
<div 
  contenteditable="true"
  [innerHTML]="getFieldValue(field)"
  (input)="onRichTextChange($event, field)"
  (blur)="onRichTextBlur($event, field)"
  class="rich-text-field">
</div>
```

---

## Performance Tips

### 1. Debounce Expensive Operations
```typescript
private debounceTimer?: number;

onFieldChange(event: Event): void {
  clearTimeout(this.debounceTimer);
  this.debounceTimer = setTimeout(() => {
    this.saveToBackend();
  }, 500);
}
```

### 2. Use TrackBy Functions
```html
<div *ngFor="let item of items; trackBy: trackById">
  {{ item.name }}
</div>
```

```typescript
trackById(index: number, item: any): any {
  return item.id; // Prevents unnecessary re-renders
}
```

### 3. Avoid Unnecessary Change Detection
```typescript
constructor(private cdr: ChangeDetectorRef) {}

updateWithoutCD(): void {
  this.data = newValue;
  // Don't trigger change detection
}

updateWithCD(): void {
  this.data = newValue;
  this.cdr.markForCheck(); // Manual trigger
}
```

---

## Debugging Tips

### Enable Verbose Logging
```typescript
const DEBUG = true;

private log(...args: any[]): void {
  if (DEBUG) {
    console.log('[YourComponent]', ...args);
  }
}

onFieldChange(event: Event): void {
  this.log('Field changed', { 
    value: event.target.textContent,
    cursorPos: this.getCurrentCursorPosition() 
  });
}
```

### Check Event Propagation
```typescript
onDrop(event: DragEvent): void {
  console.log('Drop on:', event.currentTarget);
  console.log('Drop target:', event.target);
  console.log('Bubbling?', event.bubbles);
  
  event.stopPropagation(); // Add this if bubbling
}
```

### Monitor Cursor Position
```typescript
onFieldClick(event: MouseEvent): void {
  const selection = window.getSelection();
  console.log('Cursor at:', {
    anchorOffset: selection?.anchorOffset,
    focusOffset: selection?.focusOffset,
    collapsed: selection?.isCollapsed,
  });
}
```

---

## Common Angular Patterns

### Signal-Based State
```typescript
// Modern Angular with signals
private items = signal<Item[]>([]);
public itemsComputed = computed(() => this.items());

addItem(item: Item): void {
  this.items.update(current => [...current, item]);
}

removeItem(id: string): void {
  this.items.update(current => 
    current.filter(item => item.id !== id)
  );
}
```

### Effect for Side Effects
```typescript
constructor() {
  // React to signal changes
  effect(() => {
    const items = this.items();
    console.log('Items changed:', items.length);
    this.saveToLocalStorage(items);
  });
}
```

---

# API Reference

## CvPdfExportService

### validateFields(sections: CVSection[]): ValidationResult

Validates all fields in sections.

**Parameters:**
- `sections` - Array of CV sections to validate

**Returns:**
```typescript
{
  isValid: boolean,      // true if no errors
  errors: ValidationError[],
  warnings: ValidationError[]
}
```

**Example:**
```typescript
const validation = this.pdfExportService.validateFields(sections);
if (!validation.isValid) {
  console.log('Errors:', validation.errors);
}
```

---

### exportToPdf(element, sections, options): Promise<Result>

Exports CV to PDF file.

**Parameters:**
- `element: HTMLElement` - CV container element
- `sections: CVSection[]` - All CV sections
- `options: ExportOptions` - Export configuration

**Returns:**
```typescript
Promise<{
  success: boolean,
  error?: string
}>
```

**Example:**
```typescript
const result = await this.pdfExportService.exportToPdf(
  cvElement,
  sections,
  {
    filename: 'My-CV',
    format: 'a4',
    orientation: 'portrait'
  }
);

if (result.success) {
  console.log('PDF exported!');
} else {
  console.error('Export failed:', result.error);
}
```

---

### getValidationSummary(validation): string

Gets user-friendly validation summary.

**Parameters:**
- `validation: ValidationResult` - Validation result

**Returns:**
- `string` - Summary message

**Example:**
```typescript
const summary = this.pdfExportService.getValidationSummary(validation);
// "All fields are valid"
// "Valid with 2 warning(s)"
// "3 error(s) found"
```

---

## DragDropHandlerService

### setDragData(data: any): void

Sets data for current drag operation.

**Parameters:**
- `data: any` - Data being dragged (usually a section)

---

### getDragData(): any

Gets data from current drag operation.

**Returns:**
- `any` - Data being dragged

---

### onDrop(event: DragEvent): DropResult | null

Processes drop event with debouncing.

**Parameters:**
- `event: DragEvent` - Drop event

**Returns:**
```typescript
{
  draggedItem: any
} | null
```

Returns `null` if duplicate drop detected.

---

# Testing Guide

## Test Case 1: Export with Valid Data

**Steps:**
1. Fill all required fields
2. Upload required images
3. Click "Tải xuống"
4. Wait for PDF generation (2-5 seconds)

**Expected Result:**
- ✅ Success toast: "CV has been exported to PDF successfully"
- ✅ PDF downloads automatically
- ✅ PDF opens correctly
- ✅ All content visible
- ✅ Styles preserved (fonts, colors, spacing)

---

## Test Case 2: Export with Missing Required Field

**Steps:**
1. Leave a required field empty
2. Click "Tải xuống"

**Expected Result:**
- ❌ Error toast: "Validation Failed - Found X error(s)"
- ❌ Specific error toast: "[Section] Field: Required field is empty"
- ❌ PDF not generated
- ❌ Export blocked until fixed

---

## Test Case 3: Drag and Drop Section

**Steps:**
1. Open CV with multiple sections
2. Drag a section from one column
3. Drop into another column

**Expected Result:**
- ✅ Section moves to new column
- ✅ No duplicate sections created
- ✅ Layout updates correctly
- ✅ Other sections remain intact

---

## Test Case 4: Inline Text Editing

**Steps:**
1. Click on editable text field
2. Type several characters
3. Press Backspace
4. Move cursor with arrow keys
5. Continue typing

**Expected Result:**
- ✅ Cursor stays at correct position
- ✅ Characters appear where cursor is
- ✅ Backspace deletes correct character
- ✅ Arrow keys move cursor
- ✅ No cursor jumping to start/end

---

## Test Case 5: Image Upload

**Steps:**
1. Click on image upload button
2. Select image file (PNG, 2MB)
3. Wait for upload
4. View image in preview

**Expected Result:**
- ✅ Image uploads successfully
- ✅ Image displays in correct size
- ✅ Image position correct
- ✅ Can replace image

---

## Test Case 6: Dialog Reset

**Steps:**
1. Open "Add Education" dialog
2. Fill in fields
3. Click "Cancel"
4. Open dialog again

**Expected Result:**
- ✅ All fields empty
- ✅ No previous data showing
- ✅ Form in default state
- ✅ Validation messages cleared

---

## Test Case 7: Long Text Handling

**Steps:**
1. Type very long text (>1000 chars) in textarea
2. Save changes
3. Export to PDF

**Expected Result:**
- ⚠️ Warning about text length
- ✅ Text still saves
- ✅ PDF includes all text
- ✅ Text wraps correctly in PDF

---

## Test Case 8: Multiple Drop Zones

**Steps:**
1. Drag section over multiple drop zones
2. Drop in specific zone
3. Check other zones

**Expected Result:**
- ✅ Section only appears in target zone
- ✅ No duplicates in other zones
- ✅ Drop zones clear after drop
- ✅ Visual feedback accurate

---

# Troubleshooting

## Issue: "Could not find CV preview element"

**Cause:** CV preview component not loaded

**Solution:**
1. Wait for page to fully load
2. Refresh the page
3. Ensure CV preview is visible

---

## Issue: "Export Failed - Unknown error"

**Cause:** Browser security or memory issue

**Solution:**
1. Check browser console (F12) for errors
2. Try reducing image sizes
3. Try in different browser
4. Disable browser extensions

---

## Issue: PDF file is blank

**Cause:** Content not rendered before capture

**Solution:**
1. Wait 1-2 seconds after page load
2. Scroll through entire CV before exporting
3. Check if all images loaded

---

## Issue: Fonts look different in PDF

**Cause:** Font not embedded or different rendering

**Solution:**
1. Use web-safe fonts (Arial, Times New Roman, Courier)
2. Ensure custom fonts fully loaded before export
3. Try different browser

---

## Issue: Images missing in PDF

**Cause:** Images not fully loaded or CORS issue

**Solution:**
1. Wait for all images to load
2. Use smaller image files (<5MB)
3. Ensure images from same domain

---

## Issue: Export takes too long (>10 seconds)

**Cause:** Large images or complex content

**Solution:**
1. Compress images before upload
2. Reduce image size/resolution
3. Simplify CV content
4. Lower quality setting (quality: 1)

---

## Issue: Validation errors won't go away

**Cause:** Hidden required fields or cached data

**Solution:**
1. Check ALL sections for required fields
2. Look for red asterisks (*)
3. Clear browser cache
4. Refresh page and re-enter data

---

## Issue: Cursor jumps when typing

**Cause:** Using interpolation in contenteditable

**Solution:**
1. Replace `{{ value }}` with `[textContent]="value"`
2. Implement cursor save/restore
3. Use `ngAfterViewChecked` for restoration

---

## Issue: Drag and drop creates duplicates

**Cause:** Event bubbling not stopped

**Solution:**
1. Add `event.stopPropagation()` to drop handler
2. Implement debouncing in service
3. Track last drop time and ID

---

## Issue: Dialog shows old data

**Cause:** Component state not reset

**Solution:**
1. Reset in `ngOnChanges` when visible changes
2. Reset in `close()` method
3. Clear all signals and form state

---

# Best Practices

## For Users

1. **Save Often** - Save CV before exporting
2. **Check Preview** - Verify content before export
3. **Test Early** - Try export with sample data first
4. **Use Web Fonts** - Stick to common fonts for compatibility
5. **Optimize Images** - Use compressed images (<1MB)
6. **Validate First** - Check all fields before clicking download

---

## For Developers

1. **Handle Errors** - Wrap export in try-catch
2. **Show Progress** - Display loading indicators
3. **Validate Early** - Check fields before canvas capture
4. **Clean DOM** - Hide interactive elements before capture
5. **Test Cross-browser** - Verify in Chrome, Firefox, Edge
6. **Log Errors** - Console.log for debugging
7. **Use TypeScript** - Strong typing prevents errors
8. **Document Code** - Add comments for complex logic
9. **Write Tests** - Unit and integration tests
10. **Code Review** - Peer review before merging

---

## Performance Optimization

### Current Performance

| CV Size | Export Time | File Size |
|---------|-------------|-----------|
| 1 page, no images | 2-3 sec | ~50 KB |
| 2 pages, 1 image | 3-5 sec | ~200 KB |
| 3 pages, 3 images | 5-8 sec | ~500 KB |

### Optimization Tips

1. **Reduce Image Size**
   - Compress images before upload
   - Resize to max 800x600px
   - Use JPEG instead of PNG

2. **Lower Quality Setting**
   - Use `quality: 1` instead of `quality: 2`
   - Faster export, smaller file
   - Still readable for most CVs

3. **Simplify Content**
   - Reduce number of sections
   - Limit text length
   - Remove unnecessary formatting

4. **Cache Results**
   - Store last validation result
   - Don't re-validate if unchanged
   - Clear cache when content changes

---

## Security Considerations

### Data Privacy
- User data stored locally only
- No automatic cloud sync
- PDF generated client-side

### Image Upload
- Validate file type (images only)
- Limit file size (max 5MB)
- Sanitize file names

### XSS Prevention
- Sanitize HTML content
- Use textContent for plain text
- Validate URLs before embedding

---

## Browser Compatibility

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 90+ | ✅ Full | Recommended |
| Firefox | 88+ | ✅ Full | Good performance |
| Edge | 90+ | ✅ Full | Chromium-based |
| Safari | 14+ | ⚠️ Partial | Font issues possible |
| Opera | 76+ | ✅ Full | Chromium-based |
| IE 11 | - | ❌ None | Not supported |

---

## Future Enhancements

### Short-term (1-2 sprints)

- [ ] Export progress bar with percentage
- [ ] Preview PDF before download
- [ ] Multiple page support
- [ ] Custom paper sizes
- [ ] Landscape orientation option
- [ ] Undo/redo functionality
- [ ] Auto-save feature

### Medium-term (3-6 months)

- [ ] Server-side PDF generation
- [ ] Batch export multiple CVs
- [ ] Email PDF directly
- [ ] Cloud storage integration
- [ ] PDF templates library
- [ ] Collaboration features
- [ ] Version history

### Long-term (6+ months)

- [ ] Interactive PDF forms
- [ ] Digital signatures
- [ ] ATS-friendly formatting
- [ ] QR code generation
- [ ] Multi-language support
- [ ] AI-powered suggestions
- [ ] Mobile app version

---

## Resources

### Browser APIs
- [Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection)
- [Range API](https://developer.mozilla.org/en-US/docs/Web/API/Range)
- [TreeWalker API](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker)
- [ContentEditable](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable)
- [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)

### Angular
- [Signals Guide](https://angular.io/guide/signals)
- [Change Detection](https://angular.io/guide/change-detection)
- [Lifecycle Hooks](https://angular.io/guide/lifecycle-hooks)
- [Forms](https://angular.io/guide/forms)
- [Directives](https://angular.io/guide/directives)

### Libraries
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [PrimeNG Components](https://primeng.org/)

---

## Glossary

**CV Configuration** - The data structure defining layout and content of a CV

**Section** - A logical grouping of fields (e.g., Personal Info, Education)

**Field** - A single data input (e.g., Name, Email, Phone)

**Contenteditable** - HTML attribute allowing inline text editing

**Cursor Position** - The caret location in editable text

**Drag Data** - Information about the item being dragged

**Drop Zone** - Area where dragged items can be dropped

**Validation** - Process of checking field values for correctness

**Export** - Converting CV to PDF format

**Debouncing** - Preventing rapid repeated execution of an action

**Signal** - Angular's reactive state primitive

**Change Detection** - Angular's mechanism for updating the view

---

## Contributing

### Code Style
- Follow Angular style guide
- Use TypeScript strict mode
- Add JSDoc comments for public APIs
- Format with Prettier

### Git Workflow
1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Write/update tests
4. Submit pull request
5. Address review comments
6. Merge after approval

### Testing Requirements
- Unit tests for services
- Component tests for UI
- E2E tests for critical flows
- Maintain >80% code coverage

---

## Changelog

### Version 2.0.0 (2024)
- ✨ Added PDF export feature
- ✨ Implemented inline editing
- ✨ Added drag-and-drop layout
- 🐛 Fixed cursor jumping issues
- 🐛 Fixed duplicate drop events
- 🐛 Fixed dialog reset issues
- 📝 Comprehensive documentation

### Version 1.0.0 (2024)
- 🎉 Initial release
- ✨ Basic CV builder
- ✨ Template selection
- ✨ Form-based editing

---

## Support

### Getting Help
- Check troubleshooting section
- Search existing issues
- Ask in team chat
- Contact development team

### Reporting Bugs
Include the following:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and version
5. Screenshots/videos if applicable

### Feature Requests
Include the following:
1. Use case description
2. Desired behavior
3. Current workaround (if any)
4. Priority/importance

---

## License

This project is proprietary software. All rights reserved.

---

**Maintained by:** NextHire Development Team  
**Last Updated:** 2024  
**Version:** 2.0.0

---

*For additional support or questions, please contact the development team or refer to the internal wiki.*