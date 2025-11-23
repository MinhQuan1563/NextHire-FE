import { 
  CVCategory, 
  CVSection, 
  LayoutConfiguration 
} from '../../../../models/cv-builder/cv-template.model';
import { DesignSettings } from '../services/design-settings.service';
import { CVData } from '../services/section-manager.service';

export interface CVEditorState {
  // UI State
  activeTab: string;
  isZoomed: boolean;
  selectedAvatarUrl: string;
  
  // Design Settings
  designSettings: DesignSettings;
  
  // CV Data
  cvData: CVData;
  
  // Categories & Sections
  categories: CVCategory[];
  availableSections: CVSection[];
  usedSections: any[];
  
  // Layout Management
  layoutConfigurations: LayoutConfiguration[];
  currentLayoutConfig: LayoutConfiguration | null;
  
  // Modal States
  modals: {
    showCategoryModal: boolean;
    showSectionModal: boolean;
    showManagementModal: boolean;
    showLayoutConfigModal: boolean;
    showLayoutManagementModal: boolean;
    modalMode: 'add' | 'edit';
  };
  
  // Edit States
  editStates: {
    editingCategory: CVCategory | null;
    editingSection: CVSection | null;
    currentCategoryId: string;
  };
  
  // Edit Toolbar
  editToolbar: {
    show: boolean;
    position: { x: number; y: number };
    activeElement: HTMLElement | null;
  };
  
  // Forms
  forms: {
    newCategory: {
      name: string;
      icon: string;
      description: string;
      allowMultiple: boolean;
    };
    newSection: {
      name: string;
      icon: string;
      allowMultiple: boolean;
    };
  };
}

export const initialCVEditorState: CVEditorState = {
  activeTab: 'design',
  isZoomed: false,
  selectedAvatarUrl: '',
  
  designSettings: {
    selectedFont: 'Roboto',
    fontSize: 14,
    lineSpacing: 1.5,
    selectedColor: '#00B14F',
    selectedBackground: 'white'
  },
  
  cvData: {
    experiences: [],
    education: [],
    activities: [],
    certificates: [],
    projects: [],
    references: []
  },
  
  categories: [],
  availableSections: [],
  usedSections: [],
  
  layoutConfigurations: [],
  currentLayoutConfig: null,
  
  modals: {
    showCategoryModal: false,
    showSectionModal: false,
    showManagementModal: false,
    showLayoutConfigModal: false,
    showLayoutManagementModal: false,
    modalMode: 'add'
  },
  
  editStates: {
    editingCategory: null,
    editingSection: null,
    currentCategoryId: ''
  },
  
  editToolbar: {
    show: false,
    position: { x: 0, y: 0 },
    activeElement: null
  },
  
  forms: {
    newCategory: {
      name: '',
      icon: '',
      description: '',
      allowMultiple: false
    },
    newSection: {
      name: '',
      icon: '',
      allowMultiple: false
    }
  }
};