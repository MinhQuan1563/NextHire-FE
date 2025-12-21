import { Injectable, signal } from '@angular/core';
import { CvTemplate, CvTemplateType, CVSection, CVSectionField, CVFieldType } from '@app/models/cv-builder/cv-template.model';

const initialTemplate: CvTemplate = {
  id: '',
  templateCode: '',
  name: 'Mẫu CV mới',
  type: CvTemplateType.Resume,
  description: '',
  sampleFileUrl: '',
  isPublished: false,
  createDate: new Date(),
  modifiedDate: new Date(),
  section: [],
} 

@Injectable({
  providedIn: 'root'
})
export class CvTemplateEditorService {
  template = signal<CvTemplate>(initialTemplate);
  
  constructor() {}
  
  // Section validation
  validateSection(section: CVSection): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required field validations
    if (!section.name?.trim()) {
      errors.push('Tên section là bắt buộc');
    }
    // Validate fields if they exist
    if (section.fields && section.fields.length > 0) {
      const fieldErrors = this.validateSectionFields(section.fields);
      errors.push(...fieldErrors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  // Field validation
  validateSectionFields(fields: CVSectionField[]): string[] {
    const errors: string[] = [];
    const fieldNames = new Set<string>();
    
    fields.forEach((field, index) => {
      const fieldNumber = index + 1;
      
      // Check required properties
      if (!field.name?.trim()) {
        errors.push(`Field ${fieldNumber}: Tên field là bắt buộc`);
      }
      
      if (!field.label?.trim()) {
        errors.push(`Field ${fieldNumber}: Label là bắt buộc`);
      }
      
      if (!field.type) {
        errors.push(`Field ${fieldNumber}: Loại field phải được chọn`);
      }
      
      // Check for duplicate field names
      if (field.name) {
        if (fieldNames.has(field.name)) {
          errors.push(`Field ${fieldNumber}: Tên field "${field.name}" đã tồn tại`);
        } else {
          fieldNames.add(field.name);
        }
      }
      
      // Validate field name format (no spaces, special chars)
      if (field.name && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name)) {
        errors.push(`Field ${fieldNumber}: Tên field chỉ được chứa chữ, số và dấu gạch dưới, bắt đầu bằng chữ`);
      }
      
      // Type-specific validation
      const typeValidation = this.validateFieldType(field, fieldNumber);
      errors.push(...typeValidation);
    });
    
    return errors;
  }
  // Type-specific field validation
  private validateFieldType(field: CVSectionField, fieldNumber: number): string[] {
    const errors: string[] = [];
    
    switch (field.type) {
      case 'image':
      // case 'file':
      //   if (field.uploadConfig) {
      //     if (!field.uploadConfig.allowedMimeTypes || field.uploadConfig.allowedMimeTypes.length === 0) {
      //       errors.push(`Field ${fieldNumber}: File upload phải có ít nhất một loại file được phép`);
      //     }
          
      //     if (!field.uploadConfig.maxFileSizeMB || field.uploadConfig.maxFileSizeMB <= 0) {
      //       errors.push(`Field ${fieldNumber}: Kích thước file tối đa phải lớn hơn 0`);
      //     }
      //   }
      //   break;
        
      // case 'select':
      //   // Could validate select options if they existed in the model
      //   break;
        
      // case 'rating':
      //   // Could validate rating scale if it existed in the model
      //   break;
        
      // case 'email':
      //   if (field.defaultValue && !this.isValidEmail(field.defaultValue)) {
      //     errors.push(`Field ${fieldNumber}: Giá trị mặc định không phải là email hợp lệ`);
      //   }
      //   break;
        
      // case 'url':
      //   if (field.defaultValue && !this.isValidUrl(field.defaultValue)) {
      //     errors.push(`Field ${fieldNumber}: Giá trị mặc định không phải là URL hợp lệ`);
      //   }
      //   break;
        
      // case 'phone':
      //   if (field.defaultValue && !this.isValidPhone(field.defaultValue)) {
      //     errors.push(`Field ${fieldNumber}: Giá trị mặc định không phải là số điện thoại hợp lệ`);
      //   }
      //   break;
    }
    
    return errors;
  }
  // Section generation helpers
  generateSectionId(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and multiple separators with single dash
      .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
      .trim();
  }
  // Template field generation
  generateFieldTemplate(type: CVFieldType): Partial<CVSectionField> {
    const baseField: Partial<CVSectionField> = {
      type,
      required: false
    };
    switch (type) {
      case 'text':
        return { ...baseField, placeholder: 'Nhập văn bản...' };
        
      // case 'textarea':
      //   return { ...baseField, placeholder: 'Nhập mô tả chi tiết...' };
        
      // case 'email':
      //   return { ...baseField, placeholder: 'example@email.com' };
        
      // case 'phone':
      //   return { ...baseField, placeholder: '+84 xxx xxx xxx' };
        
      // case 'url':
      //   return { ...baseField, placeholder: 'https://example.com' };
        
      // case 'date':
      //   return { ...baseField, placeholder: 'dd/mm/yyyy' };
        
      // case 'date_range':
      //   return { ...baseField, placeholder: 'Từ - Đến' };
        
      // case 'number':
      //   return { ...baseField, placeholder: '0' };
        
      case 'image':
        return {
          ...baseField,
          uploadConfig: {
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
            maxFileSizeMB: 5,
            maxWidth: 1920,
            maxHeight: 1920,
            allowCrop: true
          }
        };
      // case 'file':
      //   return {
      //     ...baseField,
      //     uploadConfig: {
      //       allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      //       maxFileSizeMB: 10
      //     }
      //   };
      // case 'select':
      //   return { ...baseField };
      // case 'checkbox':
      //   return { ...baseField, defaultValue: false };
      // case 'rating':
      //   return { ...baseField, defaultValue: 0 };
      default:
        return baseField;
    }
  }
  // Validation helpers
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  private isValidPhone(phone: string): boolean {
    // Simple phone validation - adjust based on requirements
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }
  // Cleanup and formatting
  sanitizeFieldName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/^[0-9]/, '_$&') // Ensure doesn't start with number
      .replace(/_+/g, '_') // Remove multiple underscores
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  }
}
