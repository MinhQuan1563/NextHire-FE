import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CVSection, CVSectionField } from '@app/models/cv-builder/cv-template.model';

export interface ValidationError {
  sectionId: string;
  sectionName: string;
  fieldId: string;
  fieldLabel: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ExportOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  includeMetadata?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CvPdfExportService {
  private readonly DEFAULT_FILENAME = 'CV-Template';
  private readonly A4_WIDTH = 210; // mm
  private readonly A4_HEIGHT = 297; // mm
  private readonly LETTER_WIDTH = 215.9; // mm
  private readonly LETTER_HEIGHT = 279.4; // mm

  constructor() {}

  /**
   * Validate all fields in sections before export
   */
  validateFields(sections: CVSection[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    sections.forEach(section => {
      if (!section.fields || section.fields.length === 0) {
        warnings.push({
          sectionId: section.id,
          sectionName: section.name,
          fieldId: '',
          fieldLabel: '',
          message: `Section "${section.name}" has no fields defined`
        });
        return;
      }

      section.fields.forEach(field => {
        // Check required fields
        if (field.required && !this.hasValue(field)) {
          errors.push({
            sectionId: section.id,
            sectionName: section.name,
            fieldId: field.name,
            fieldLabel: field.label,
            message: `Required field "${field.label}" is empty`
          });
        }

        // Check email format
        if (field.type === 'email' && field.value) {
          if (!this.isValidEmail(field.value)) {
            errors.push({
              sectionId: section.id,
              sectionName: section.name,
              fieldId: field.name,
              fieldLabel: field.label,
              message: `Invalid email format in "${field.label}"`
            });
          }
        }

        // Check phone format
        if (field.type === 'phone' && field.value) {
          if (!this.isValidPhone(field.value)) {
            warnings.push({
              sectionId: section.id,
              sectionName: section.name,
              fieldId: field.name,
              fieldLabel: field.label,
              message: `Phone format in "${field.label}" may be invalid`
            });
          }
        }

        // Check URL format
        if (field.type === 'url' && field.value) {
          if (!this.isValidUrl(field.value)) {
            errors.push({
              sectionId: section.id,
              sectionName: section.name,
              fieldId: field.name,
              fieldLabel: field.label,
              message: `Invalid URL format in "${field.label}"`
            });
          }
        }

        // Check image fields
        if (field.type === 'image' && field.required && !field.value) {
          errors.push({
            sectionId: section.id,
            sectionName: section.name,
            fieldId: field.name,
            fieldLabel: field.label,
            message: `Required image in "${field.label}" is missing`
          });
        }

        // Check text length limits
        if (field.maxLength && field.value) {
          const textLength = this.getTextLength(field.value);
          if (textLength > field.maxLength) {
            warnings.push({
              sectionId: section.id,
              sectionName: section.name,
              fieldId: field.name,
              fieldLabel: field.label,
              message: `Text in "${field.label}" exceeds maximum length (${textLength}/${field.maxLength})`
            });
          }
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Export CV to PDF with current styles and configuration
   */
  async exportToPdf(
    cvElement: HTMLElement,
    sections: CVSection[],
    options: ExportOptions = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate fields first
      const validation = this.validateFields(sections);

      if (!validation.isValid) {
        const errorMessages = validation.errors.map(e =>
          `${e.sectionName} - ${e.fieldLabel}: ${e.message}`
        ).join('\n');

        return {
          success: false,
          error: `Validation failed:\n${errorMessages}`
        };
      }
      // Set default options
      const exportOptions: Required<ExportOptions> = {
        filename: options.filename || this.DEFAULT_FILENAME,
        format: options.format || 'a4',
        orientation: options.orientation || 'portrait',
        quality: options.quality || 2,
        includeMetadata: options.includeMetadata !== false
      };

      // Get paper dimensions
      const [width, height] = this.getPaperDimensions(
        exportOptions.format,
        exportOptions.orientation
      );

      // Hide interactive elements before capture
      this.hideInteractiveElements(cvElement);

      // Capture CV as canvas with high quality
      const canvas = await html2canvas(cvElement, {
        scale: exportOptions.quality,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: cvElement.scrollWidth,
        windowHeight: cvElement.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure all styles are applied in cloned document
          const clonedElement = clonedDoc.querySelector('.cv-paper') as HTMLElement;
          if (clonedElement) {
            this.applyFinalStyles(clonedElement);
          }
        }
      });

      // Show interactive elements again
      this.showInteractiveElements(cvElement);

      // Create PDF
      const pdf = new jsPDF({
        orientation: exportOptions.orientation,
        unit: 'mm',
        format: exportOptions.format
      });

      // Calculate dimensions to fit content
      const imgWidth = width;
      const imgHeight = (canvas.height * width) / canvas.width;

      // Add image to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

      // Add metadata if enabled
      if (exportOptions.includeMetadata) {
        this.addMetadata(pdf, sections);
      }

      // Save PDF
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${exportOptions.filename}_${timestamp}.pdf`;
      pdf.save(filename);

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Export validation report as text
   */
  exportValidationReport(validation: ValidationResult): string {
    let report = '=== CV Validation Report ===\n\n';

    report += `Status: ${validation.isValid ? 'VALID ✓' : 'INVALID ✗'}\n`;
    report += `Errors: ${validation.errors.length}\n`;
    report += `Warnings: ${validation.warnings.length}\n\n`;

    if (validation.errors.length > 0) {
      report += '--- ERRORS ---\n';
      validation.errors.forEach((error, index) => {
        report += `${index + 1}. [${error.sectionName}] ${error.fieldLabel}\n`;
        report += `   ${error.message}\n\n`;
      });
    }

    if (validation.warnings.length > 0) {
      report += '--- WARNINGS ---\n';
      validation.warnings.forEach((warning, index) => {
        report += `${index + 1}. [${warning.sectionName}] ${warning.fieldLabel}\n`;
        report += `   ${warning.message}\n\n`;
      });
    }

    return report;
  }

  // ========== Private Helper Methods ==========

  /**
   * Check if field has a value
   */
  private hasValue(field: CVSectionField): boolean {
    if (!field.value) return false;
    if (typeof field.value === 'string') {
      return field.value.trim().length > 0;
    }
    return true;
  }

  /**
   * Get text length (strips HTML tags)
   */
  private getTextLength(value: any): number {
    if (typeof value !== 'string') return 0;
    // Strip HTML tags for length calculation
    const stripped = value.replace(/<[^>]*>/g, '');
    return stripped.length;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format (basic check)
   */
  private isValidPhone(phone: string): boolean {
    // Allow various phone formats
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const digitsOnly = phone.replace(/[\s\-\+\(\)]/g, '');
    return phoneRegex.test(phone) && digitsOnly.length >= 10 && digitsOnly.length <= 15;
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      // Try with https:// prefix
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Get paper dimensions based on format and orientation
   */
  private getPaperDimensions(
    format: 'a4' | 'letter',
    orientation: 'portrait' | 'landscape'
  ): [number, number] {
    let width: number;
    let height: number;

    if (format === 'a4') {
      width = this.A4_WIDTH;
      height = this.A4_HEIGHT;
    } else {
      width = this.LETTER_WIDTH;
      height = this.LETTER_HEIGHT;
    }

    if (orientation === 'landscape') {
      return [height, width];
    }
    return [width, height];
  }

  /**
   * Hide interactive elements before PDF capture
   */
  private hideInteractiveElements(element: HTMLElement): void {
    // Hide section controls
    const controls = element.querySelectorAll('.section-controls');
    controls.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    // Hide edit indicators
    const editables = element.querySelectorAll('[contenteditable="true"]');
    editables.forEach(el => {
      (el as HTMLElement).setAttribute('contenteditable', 'false');
    });

    // Remove hover effects
    const hovered = element.querySelectorAll('.hovered');
    hovered.forEach(el => {
      el.classList.remove('hovered');
    });

    // Remove focus/active states
    const focused = element.querySelectorAll('.focused, .active, .editing');
    focused.forEach(el => {
      el.classList.remove('focused', 'active', 'editing');
    });
  }

  /**
   * Show interactive elements after PDF capture
   */
  private showInteractiveElements(element: HTMLElement): void {
    // Show section controls
    const controls = element.querySelectorAll('.section-controls');
    controls.forEach(el => {
      (el as HTMLElement).style.display = '';
    });

    // Note: We don't restore contenteditable as it's managed by component logic
  }

  /**
   * Apply final styles to ensure PDF looks correct
   */
  private applyFinalStyles(element: HTMLElement): void {
    // Ensure white background
    element.style.backgroundColor = '#ffffff';

    // Remove any box shadows
    element.style.boxShadow = 'none';

    // Ensure proper padding
    if (!element.style.padding) {
      element.style.padding = '30mm';
    }

    // Remove borders from fields
    const fields = element.querySelectorAll('.cv-field');
    fields.forEach(field => {
      (field as HTMLElement).style.border = 'none';
      (field as HTMLElement).style.backgroundColor = 'transparent';
      (field as HTMLElement).style.boxShadow = 'none';
    });

    // Remove section borders/backgrounds
    const sections = element.querySelectorAll('.cv-section');
    sections.forEach(section => {
      (section as HTMLElement).style.border = 'none';
      (section as HTMLElement).style.backgroundColor = 'transparent';
      (section as HTMLElement).style.boxShadow = 'none';
    });
  }

  /**
   * Add metadata to PDF
   */
  private addMetadata(pdf: jsPDF, sections: CVSection[]): void {
    // Set PDF metadata
    pdf.setProperties({
      title: 'CV Template',
      subject: 'Curriculum Vitae',
      author: 'NextHire CV Builder',
      creator: 'NextHire',
      keywords: sections.map(s => s.name).join(', ')
    });
  }

  /**
   * Get validation summary for display
   */
  getValidationSummary(validation: ValidationResult): string {
    if (validation.isValid) {
      return validation.warnings.length > 0
        ? `Valid with ${validation.warnings.length} warning(s)`
        : 'All fields are valid';
    }
    return `${validation.errors.length} error(s) found`;
  }

  /**
   * Check if specific field type needs validation
   */
  needsValidation(fieldType: string): boolean {
    return ['text', 'email', 'phone', 'url', 'textarea', 'richtext', 'image'].includes(fieldType);
  }
}
