export enum CvTemplateType {
  Resume = 0,
  CoverLetter = 1,
  Portfolio = 2,
}
export type CVFieldType =
  | "text"
  | "richtext"
  | "date"
  | "email"
  | "phone"
  | "url"
  | "textarea"
  | "image";

export interface CVSectionField {
  name: string;
  type: CVFieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  uploadConfig?: CVUploadConfig;
  editable?: boolean; // Whether the field can be edited inline
  multiline?: boolean; // Whether the field supports multiple lines
  maxLength?: number; // Maximum character length
  value?: any; // Current field value
}

export interface FieldState {
  fieldId: string;
  sectionId: string;
  isActive: boolean;
  isFocused: boolean;
  isEditing: boolean;
  element?: HTMLElement;
}

export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  alignment?: "left" | "center" | "right" | "justify";
  listType?: "bullet" | "number" | "none";
}

export interface CVSection {
  id: string;
  name: string;
  description?: string;
  fields?: CVSectionField[];
  /**
   * Locked sections cannot be removed from the CV layout and are not draggable.
   * Example: Personal Info/header section.
   */
  locked?: boolean;
}

export interface CVUploadConfig {
  allowedMimeTypes: string[];
  maxFileSizeMB: number;

  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: string;

  allowCrop?: boolean;
  multiple?: boolean;
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
  rows: LayoutRow[];
  totalColumns?: number; // Max columns across all rows
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
  section?: CVSection[];
  designSettings?: DesignSettings; // Design settings (fonts, colors, etc.)
}

export interface CreateCvTemplate {
  name: string;
  type: CvTemplateType;
  description?: string;
  sampleFileUrl?: string;
  layoutConfiguration?: LayoutConfiguration; // Changed to proper interface
  isPublished?: boolean;
  section?: CVSection[];
  designSettings?: DesignSettings; // Design settings (fonts, colors, etc.)
}

export interface UpdateCvTemplate {
  name?: string;
  type?: CvTemplateType;
  description?: string;
  sampleFileUrl?: string;
  layoutConfiguration?: LayoutConfiguration; // Changed to proper interface
  section?: CVSection[];
  designSettings?: DesignSettings; // Design settings (fonts, colors, etc.)
}

export interface GetCvTemplatesInput {
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
  filter?: string;
}

// Design Settings Interface
export interface DesignSettings {
  selectedFont: string;
  fontSize: number;
  lineSpacing: number;
  selectedColor: string;
  selectedBackground: string;
}

// Extended interfaces with design settings
export interface CvTemplateWithDesign extends CvTemplate {
  designSettings?: DesignSettings;
}

export interface CreateCvTemplateWithDesign extends CreateCvTemplate {
  designSettings?: DesignSettings;
}

export interface UpdateCvTemplateWithDesign extends UpdateCvTemplate {
  designSettings?: DesignSettings;
}
