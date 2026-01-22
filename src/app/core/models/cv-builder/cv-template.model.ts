export enum CvTemplateType {
  Resume = 0,
  CoverLetter = 1,
  Portfolio = 2
}

export interface CVSection {
  id: string;
  name: string;
  icon: string;
  categoryId?: string;
  isDefault?: boolean;
  allowMultiple?: boolean;
  fields?: CVSectionField[];
}

export interface CVSectionField {
  name: string;
  type: 'text' | 'textarea' | 'date' | 'url' | 'email' | 'phone';
  label: string;
  required?: boolean;
  placeholder?: string;
}

// Layout Configuration Interfaces
export interface LayoutColumn {
  id: string;
  widthPercentage: number; // 0-100
  sections: string[]; // Array of section IDs placed in this column
  minWidth?: number; // Minimum width percentage
  maxWidth?: number; // Maximum width percentage
}

export interface LayoutRow {
  id: string;
  columns: LayoutColumn[];
  height?: number; // Optional height in pixels or 'auto'
  order: number;
}

export interface LayoutConfiguration {
  id: string;
  name: string;
  description?: string;
  rows: LayoutRow[];
  totalColumns: number; // Max columns across all rows
  isDefault?: boolean;
  createdDate?: Date;
  modifiedDate?: Date;
}

// Layout Management Types
export interface LayoutZone {
  rowId: string;
  columnId: string;
  sections: CVSection[];
  isDropZone: boolean;
}

export interface DragDropData {
  sectionId: string;
  sourceZone?: LayoutZone;
  targetZone: LayoutZone;
}

export interface CVCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  allowMultiple: boolean;
  isSystemCategory: boolean;
  sections: CVSection[];
  order: number;
}

export interface CvTemplate {
  id: string;
  templateCode: string;
  name: string;
  type: CvTemplateType;
  description: string;
  sampleFileUrl: string;
  isPublished: boolean;
  createDate: Date;
  modifiedDate: Date;
  layoutConfiguration?: LayoutConfiguration; // Changed to proper interface
  categories?: CVCategory[];
  defaultSections?: string[];
}

export interface CreateCvTemplate {
  name: string;
  type: CvTemplateType;
  description?: string;
  sampleFileUrl?: string;
  layoutConfiguration?: LayoutConfiguration; // Changed to proper interface
  isPublished?: boolean;
  categories?: CVCategory[];
  defaultSections?: string[];
}

export interface UpdateCvTemplate {
  name?: string;
  type?: CvTemplateType;
  description?: string;
  sampleFileUrl?: string;
  layoutConfiguration?: LayoutConfiguration; // Changed to proper interface
  categories?: CVCategory[];
  defaultSections?: string[];
}

export interface GetCvTemplatesInput {
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
  filter?: string;
}