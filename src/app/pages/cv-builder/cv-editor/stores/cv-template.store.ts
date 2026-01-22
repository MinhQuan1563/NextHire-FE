import { Injectable, signal, computed } from "@angular/core";
import { CvTemplate, CvTemplateType, CVSection, CVSectionField, LayoutConfiguration } from "@app/models/cv-builder/cv-template.model";
import { CvTemplateEditorService } from "../services/cv-template-editor.service";

const initialTemplate: CvTemplate = {
    id: '',
    name: 'Default Template',
    templateCode: '',
    type: CvTemplateType.Resume,
    description: '',
    sampleFileUrl: '',
    isPublished: false,
    section: [],
}

@Injectable({ providedIn: 'root' })
export class CvTemplateStore {
  template = signal<CvTemplate>(initialTemplate);

  // Computed properties
  sections = computed(() => this.template().section || []);
  layoutConfiguration = computed(() => this.template().layoutConfiguration || { rows: [] });
  
  constructor(private editor: CvTemplateEditorService) {}

  // Template management
  updateTemplate(updates: Partial<CvTemplate>) {
    this.template.update(current => ({
      ...current,
      ...updates,
      modifiedDate: new Date()
    }));
  }

  setTemplate(template: CvTemplate) {
    this.template.set(template);
  }

  // Section management methods
  addSection(section: CVSection) {
    this.template.update(current => ({
      ...current,
      section: [...(current.section || []), section],
      modifiedDate: new Date()
    }));
  }

  updateSection(sectionId: string, updates: Partial<CVSection>) {
    this.template.update(current => ({
      ...current,
      section: (current.section || []).map(section => 
        section.id === sectionId 
          ? { ...section, ...updates }
          : section
      ),
      modifiedDate: new Date()
    }));
  }

  deleteSection(sectionId: string) {
    this.template.update(current => ({
      ...current,
      sections: (current.section || []).filter(section => section.id !== sectionId),
      modifiedDate: new Date()
    }));
  }
  // Section field management
  addFieldToSection(sectionId: string, field: CVSectionField) {
    this.template.update(current => ({
      ...current,
      sections: (current.section || []).map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              fields: [...(section.fields || []), field] 
            }
          : section
      ),
      modifiedDate: new Date()
    }));
  }

  updateSectionField(sectionId: string, fieldName: string, updates: Partial<CVSectionField>) {
    this.template.update(current => ({
      ...current,
      sections: (current.section || []).map(section => 
        section.id === sectionId 
          ? {
              ...section,
              fields: (section.fields || []).map(field =>
                field.name === fieldName
                  ? { ...field, ...updates }
                  : field
              )
            }
          : section
      ),
      modifiedDate: new Date()
    }));
  }

  removeSectionField(sectionId: string, fieldName: string) {
    this.template.update(current => ({
      ...current,
      sections: (current.section || []).map(section => 
        section.id === sectionId 
          ? {
              ...section,
              fields: (section.fields || []).filter(field => field.name !== fieldName)
            }
          : section
      ),
      modifiedDate: new Date()
    }));
  }


  // Helper methods
  getSectionById(sectionId: string): CVSection | undefined {
    return this.sections().find(section => section.id === sectionId);
  }
  // Update layout configuration
  updateLayoutConfiguration(layoutConfig: LayoutConfiguration) {
    this.template.update(current => ({
      ...current,
      layoutConfiguration: layoutConfig,
      modifiedDate: new Date()
    }));
  }
  validateSection(section: CVSection): string[] {
    const errors: string[] = [];
    
    if (!section.name.trim()) {
      errors.push('Tên section không được để trống');
    }
    // Validate fields
    if (section.fields) {
      section.fields.forEach((field, index) => {
        if (!field.name.trim()) {
          errors.push(`Field ${index + 1}: Tên field không được để trống`);
        }
        if (!field.label.trim()) {
          errors.push(`Field ${index + 1}: Label không được để trống`);
        }
        if (!field.type) {
          errors.push(`Field ${index + 1}: Loại field phải được chọn`);
        }
      });
      
      // Check for duplicate field names
      const fieldNames = section.fields.map(f => f.name);
      const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        errors.push(`Tên field bị trùng lặp: ${duplicates.join(', ')}`);
      }
    }
    
    return errors;
  }

  reset() {
    this.template.set(initialTemplate);
  }
}
