/**
 * CV Editor Services - Clean Architecture Pattern
 * 
 * Tổ chức services theo pattern tương tự React hooks:
 * - Store: Quản lý state tập trung (như Redux)
 * - Services: Tách biệt logic theo domain (như custom hooks)
 * - Facade: Gom nhóm operations phức tạp
 */

// Store
export { CVEditorStore } from './store/cv-editor.store';
export { CVEditorState, initialCVEditorState } from './store/cv-editor.state';

// Domain Services
export { DesignSettingsService, DesignSettings } from './services/design-settings.service';
export { 
  ModalManagementService, 
  ModalState, 
  EditContext, 
  FormData 
} from './services/modal-management.service';
export { 
  LayoutManagementService, 
  LayoutManagementState 
} from './services/layout-management.service';
export { 
  EditToolbarService, 
  EditToolbarState, 
  TextFormat 
} from './services/edit-toolbar.service';

// Facade Services
export { 
  CVDataFacadeService, 
  UsedSection 
} from './services/cv-data-facade.service';

// Main Component (Refactored)
export { CvEditorComponent as CvEditorRefactoredComponent } from './cv-editor-refactored.component';