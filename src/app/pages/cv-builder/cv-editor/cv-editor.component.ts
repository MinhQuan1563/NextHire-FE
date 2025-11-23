import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarTabsComponent } from './components/sidebar-tabs/sidebar-tabs.component';
import { DesignPanelComponent, DesignSettings } from './components/design-panel/design-panel.component';
import { SectionsPanelComponent } from './components/sections-panel/sections-panel.component';
import { LayoutPanelComponent, UsedSection } from './components/layout-panel/layout-panel.component';
import { EditToolbarComponent } from './components/edit-toolbar/edit-toolbar.component';
import { CvPreviewComponent } from './components/cv-preview/cv-preview.component';
import { LayoutConfigModalComponent } from './components/layout-config-modal/layout-config-modal.component';
import { LayoutManagementComponent } from './components/layout-management/layout-management.component';
import { SectionManagerService, CVData } from './services/section-manager.service';
import { 
  CVCategory, 
  CVSection, 
  LayoutConfiguration, 
  LayoutRow, 
  LayoutColumn, 
  DragDropData 
} from '../../../models/cv-builder/cv-template.model';

@Component({
  selector: 'app-admin-template',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    SidebarTabsComponent,
    DesignPanelComponent,
    SectionsPanelComponent,
    LayoutPanelComponent,
    EditToolbarComponent,
    CvPreviewComponent,
    LayoutConfigModalComponent,
    LayoutManagementComponent
  ],
  templateUrl: './cv-editor.component.html',
  styleUrls: ['./cv-editor.component.scss']
})
export class CvEditorComponent implements OnInit {
  // Sidebar state
  activeTab: string = 'design';
  
  // Preview state
  isZoomed: boolean = false;
  selectedAvatarUrl: string = '';
  
  // Design settings
  designSettings: DesignSettings = {
    selectedFont: 'Roboto',
    fontSize: 14,
    lineSpacing: 1.5,
    selectedColor: '#00B14F',
    selectedBackground: 'white'
  };
  
  // Edit toolbar state
  showEditToolbar = false;
  editToolbarPosition = { x: 0, y: 0 };
  activeEditElement: HTMLElement | null = null;
  
  // CV data structure
  cvData: CVData = {
    experiences: [],
    education: [],
    activities: [],
    certificates: [],
    projects: [],
    references: []
  };
  
  // CV sections that can be added (now loaded dynamically)
  availableSections: CVSection[] = [];
  categories: CVCategory[] = [];
  
  // Category management state
  showCategoryModal: boolean = false;
  showSectionModal: boolean = false;
  showManagementModal: boolean = false; // New modal for category management
  modalMode: 'add' | 'edit' = 'add';
  editingCategory: CVCategory | null = null;
  editingSection: CVSection | null = null;
  currentCategoryId: string = '';
  
  // Layout management state
  showLayoutConfigModal: boolean = false;
  showLayoutManagementModal: boolean = false;
  currentLayoutConfig: LayoutConfiguration | null = null;
  layoutConfigurations: LayoutConfiguration[] = [];
  
  newCategoryForm = {
    name: '',
    icon: '',
    description: '',
    allowMultiple: false
  };
  
  // Section management state
  newSectionForm = {
    name: '',
    icon: '',
    categoryId: '',
    allowMultiple: false
  };
  
  // CV layout sections (sections currently used in CV)
  usedSections: UsedSection[] = [
    { id: 'personal-info', name: 'Thông tin cá nhân', order: 1 },
    { id: 'objective', name: 'Mục tiêu nghề nghiệp', order: 2 },
    { id: 'education', name: 'Học vấn', order: 3 },
    { id: 'experience', name: 'Kinh nghiệm làm việc', order: 4 }
  ];
  
  constructor(
    private sectionManager: SectionManagerService,
  ) {}

  ngOnInit() {
    // Initialize component
    this.initializeDefaults();
    
    // Initialize layout system
    this.initializeDefaultLayout();
    
    // Subscribe to CV data changes
    this.sectionManager.cvData$.subscribe(data => {
      this.cvData = data;
    });
    
    // Apply initial font size after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.applyFontSizeChange();
    }, 100);
  }
  
  // Get sections that are available but not used yet
  getUnusedSections() {
    return this.availableSections.filter(section => 
      !this.usedSections.some(used => used.id === section.id)
    );
  }
  
  // Get sorted used sections for display in CV
  getSortedUsedSections() {
    return [...this.usedSections].sort((a, b) => a.order - b.order);
  }

  private initializeDefaults() {
    // Initialize default categories if empty
    if (this.categories.length === 0) {
      this.initializeDefaultCategories();
    }
    console.log('CV Builder initialized with modern interface');
  }
  
  private initializeDefaultCategories() {
    this.categories = [
      {
        id: 'basic-info',
        name: 'Thông tin cơ bản',
        icon: '📝',
        description: 'Thông tin cá nhân và liên hệ',
        allowMultiple: false,
        isSystemCategory: true,
        order: 1,
        sections: [
          { id: 'personal-info', name: 'Thông tin cá nhân', icon: '👤', isDefault: true },
          { id: 'objective', name: 'Mục tiêu nghề nghiệp', icon: '🎯' }
        ]
      },
      {
        id: 'education-experience',
        name: 'Học vấn & Kinh nghiệm',
        icon: '🎓',
        description: 'Học vấn và kinh nghiệm làm việc',
        allowMultiple: true,
        isSystemCategory: true,
        order: 2,
        sections: [
          { id: 'education', name: 'Học vấn', icon: '🎓', allowMultiple: true },
          { id: 'experience', name: 'Kinh nghiệm làm việc', icon: '💼', allowMultiple: true }
        ]
      },
      {
        id: 'skills-projects',
        name: 'Kỹ năng & Dự án',
        icon: '⚙️',
        description: 'Kỹ năng và dự án đã thực hiện',
        allowMultiple: true,
        isSystemCategory: false,
        order: 3,
        sections: [
          { id: 'skills', name: 'Kỹ năng', icon: '⚡' },
          { id: 'projects', name: 'Dự án', icon: '📁', allowMultiple: true },
          { id: 'certificates', name: 'Chứng chỉ', icon: '📜', allowMultiple: true }
        ]
      },
      {
        id: 'additional',
        name: 'Thông tin bổ sung',
        icon: 'ℹ️',
        description: 'Các thông tin khác',
        allowMultiple: true,
        isSystemCategory: false,
        order: 4,
        sections: [
          { id: 'languages', name: 'Ngoại ngữ', icon: '🌐', allowMultiple: true },
          { id: 'activities', name: 'Hoạt động', icon: '🎯', allowMultiple: true },
          { id: 'interests', name: 'Sở thích', icon: '🎨' },
          { id: 'references', name: 'Người tham chiếu', icon: '👥', allowMultiple: true }
        ]
      }
    ];
    
    // Flatten all sections from categories
    this.availableSections = this.categories.flatMap(cat => cat.sections);
  }
  
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  
  onFontChange(font: string) {
    this.designSettings.selectedFont = font;
    this.applyFontChange();
  }
  
  onFontSizeChange(fontSize: number) {
    this.designSettings.fontSize = fontSize;
    this.applyFontSizeChange();
    console.log('Font size changed to:', this.designSettings.fontSize);
  }
  
  onLineSpacingChange(lineSpacing: number) {
    this.designSettings.lineSpacing = lineSpacing;
    this.applyLineSpacingChange();
  }
  
  onColorChange(color: string) {
    this.designSettings.selectedColor = color;
    this.applyColorChange();
  }

  onColorPickerChange(color: string) {
    this.designSettings.selectedColor = color;
    this.applyColorChange();
  }
  
  onBackgroundChange(background: string) {
    this.designSettings.selectedBackground = background;
    this.applyBackgroundChange();
  }
  
  addSection(section: any) {
    // Add section to available sections if not already there
    if (!this.availableSections.find(s => s.id === section.id)) {
      this.availableSections.push(section);
    }
    console.log('Section added to available sections:', section);
  }
  
  addSectionToLayout(section: any) {
    // Check if section allows multiple instances
    const category = this.categories.find(cat => 
      cat.sections.some(s => s.id === section.id)
    );
    
    if (category && !category.allowMultiple) {
      // Check if section is already used
      const existingSection = this.usedSections.find(s => s.id === section.id);
      if (existingSection) {
        alert(`Danh mục "${category.name}" chỉ cho phép thêm một mục.`);
        return;
      }
    }
    
    // Add section to used sections (layout)
    const maxOrder = Math.max(...this.usedSections.map(s => s.order), 0);
    this.usedSections.push({
      id: section.id,
      name: section.name,
      order: maxOrder + 1
    });
    console.log('Section added to layout:', section);
  }
  
  removeSection(section: any) {
    // Remove section from used sections
    this.usedSections = this.usedSections.filter(s => s.id !== section.id);
    // Reorder remaining sections
    this.usedSections.forEach((s, index) => {
      s.order = index + 1;
    });
    console.log('Section removed from layout:', section);
  }
  
  reorderSections(sections: any[]) {
    // Logic to reorder CV sections
    this.usedSections = sections;
  }

  // Font application methods
  private applyFontChange() {
    // Apply font change to CV preview
    const cvPaper = document.querySelector('.cv-paper') as HTMLElement;
    if (cvPaper) {
      cvPaper.style.fontFamily = this.designSettings.selectedFont;
    }
  }

  private applyFontSizeChange() {
    // Apply font size change to CV preview immediately
    const cvPaper = document.querySelector('.cv-paper') as HTMLElement;
    if (cvPaper) {
      // Update the main font size
      cvPaper.style.fontSize = this.designSettings.fontSize + 'px';
      
      // Force update all text elements that might have inherited font sizes
      const textElements = cvPaper.querySelectorAll('.section-content, .editable, .cv-name, .cv-title, .contact-item, .edu-degree, .exp-position, .activity-title, .cert-name, .project-title');
      textElements.forEach((element: any) => {
        if (!element.hasAttribute('data-custom-size')) {
          element.style.fontSize = this.designSettings.fontSize + 'px';
        }
      });
      
      // Also update base font size for the paper
      cvPaper.style.setProperty('--base-font-size', this.designSettings.fontSize + 'px');
    }
    console.log('Font size applied:', this.designSettings.fontSize + 'px');
  }

  private applyLineSpacingChange() {
    // Apply line spacing change to CV preview
    const cvPaper = document.querySelector('.cv-paper') as HTMLElement;
    if (cvPaper) {
      cvPaper.style.lineHeight = this.designSettings.lineSpacing.toString();
    }
  }

  private applyColorChange() {
    // Apply color change to CV preview
    const sectionTitles = document.querySelectorAll('.section-title') as NodeListOf<HTMLElement>;
    sectionTitles.forEach(title => {
      title.style.color = this.designSettings.selectedColor;
    });
  }

  private applyBackgroundChange() {
    // Apply background change to CV preview
    const cvPaper = document.querySelector('.cv-paper') as HTMLElement;
    if (cvPaper) {
      cvPaper.className = cvPaper.className.replace(/bg-\w+/g, '');
      cvPaper.classList.add(`bg-${this.designSettings.selectedBackground}`);
    }
  }

  // Drag and drop functionality for layout sections
  onDragStart(event: DragEvent, section: any) {
    event.dataTransfer?.setData('text/plain', JSON.stringify(section));
    const target = event.target as HTMLElement;
    target.classList.add('dragging');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetSection: any) {
    event.preventDefault();
    const draggedSection = JSON.parse(event.dataTransfer?.getData('text/plain') || '{}');
    
    // Remove dragging class
    const draggingElement = document.querySelector('.dragging');
    if (draggingElement) {
      draggingElement.classList.remove('dragging');
    }
    
    // Implement reordering logic
    const draggedIndex = this.usedSections.findIndex(s => s.id === draggedSection.id);
    const targetIndex = this.usedSections.findIndex(s => s.id === targetSection.id);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Swap sections
      [this.usedSections[draggedIndex], this.usedSections[targetIndex]] = 
      [this.usedSections[targetIndex], this.usedSections[draggedIndex]];
      
      // Update order numbers
      this.usedSections.forEach((section, index) => {
        section.order = index + 1;
      });
    }
  }

  // CV editing functionality
  uploadAvatar() {
    // Trigger file input from cv-preview component
    const fileInput = document.querySelector('#cvFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh!');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB!');
        return;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedAvatarUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  updateField(fieldName: string, event: any) {
    const value = event.target.innerText || event.target.textContent;
    console.log(`Updating ${fieldName}:`, value);
    // Here you would save the updated field value to your CV data model
  }

  // Preview controls
  zoomCV() {
    this.isZoomed = !this.isZoomed;
  }

  downloadCV() {
    console.log('Downloading CV...');
    // Here you would implement CV download functionality
    // For example, converting to PDF using jsPDF or similar library
  }
  
  // Edit toolbar methods
  hideEditToolbar() {
    this.showEditToolbar = false;
    this.activeEditElement = null;
  }
  
  // Toolbar actions
  makeBold() {
    document.execCommand('bold', false);
    this.focusActiveElement();
  }
  
  makeItalic() {
    document.execCommand('italic', false);
    this.focusActiveElement();
  }
  
  makeUnderline() {
    document.execCommand('underline', false);
    this.focusActiveElement();
  }
  
  createBulletList() {
    if (this.activeEditElement) {
      // Ensure element is properly focused and editable
      this.activeEditElement.contentEditable = 'true';
      this.activeEditElement.focus();
      
      // Wait for focus to be established
      setTimeout(() => {
        // Try to restore selection or create a new one
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          const range = document.createRange();
          range.selectNodeContents(this.activeEditElement!);
          range.collapse(false); // Collapse to end
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        
        // Execute the command
        document.execCommand('insertUnorderedList', false);
        this.activeEditElement!.focus();
      }, 10);
    }
  }
  
  createNumberList() {
    if (this.activeEditElement) {
      // Ensure element is properly focused and editable
      this.activeEditElement.contentEditable = 'true';
      this.activeEditElement.focus();
      
      // Wait for focus to be established
      setTimeout(() => {
        // Try to restore selection or create a new one
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          const range = document.createRange();
          range.selectNodeContents(this.activeEditElement!);
          range.collapse(false); // Collapse to end
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        
        // Execute the command
        document.execCommand('insertOrderedList', false);
        this.activeEditElement!.focus();
      }, 10);
    }
  }
  
  changeFontSize(size: string) {
    // Use CSS style for precise font size control
    if (this.activeEditElement) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          const span = document.createElement('span');
          span.style.fontSize = size + 'px';
          try {
            range.surroundContents(span);
          } catch (e) {
            span.appendChild(range.extractContents());
            range.insertNode(span);
          }
          selection.removeAllRanges();
        } else {
          this.activeEditElement.style.fontSize = size + 'px';
        }
      } else {
        this.activeEditElement.style.fontSize = size + 'px';
      }
    }
    this.focusActiveElement();
  }
  
  onToolbarFontSizeChange(event: any) {
    this.changeFontSize(event.target.value);
  }
  
  alignLeft() {
    document.execCommand('justifyLeft', false);
    this.focusActiveElement();
  }
  
  alignCenter() {
    document.execCommand('justifyCenter', false);
    this.focusActiveElement();
  }
  
  alignRight() {
    document.execCommand('justifyRight', false);
    this.focusActiveElement();
  }
  
  alignJustify() {
    document.execCommand('justifyFull', false);
    this.focusActiveElement();
  }
  
  private focusActiveElement() {
    if (this.activeEditElement) {
      this.activeEditElement.focus();
    }
  }
  
  // Safe click handler for edit toolbar
  onEditableClick(event: MouseEvent, fieldName: string = '') {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    if (target) {
      this.showEditToolbarAt(event, target);
    }
  }
  
  // Show edit toolbar at specific position
  showEditToolbarAt(event: MouseEvent, element: HTMLElement) {
    event.stopPropagation();
    this.activeEditElement = element;
    
    // Ensure the element is editable
    element.contentEditable = 'true';
    
    // Store current selection for later restoration
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      // Selection exists, store it
    }
    
    // Smart positioning of the toolbar
    const rect = element.getBoundingClientRect();
    const toolbarWidth = 450; // Increased width for more buttons
    const toolbarHeight = 50;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate horizontal position
    let xPos = rect.left + (rect.width / 2) - (toolbarWidth / 2);
    if (xPos + toolbarWidth > viewportWidth - 20) {
      xPos = viewportWidth - toolbarWidth - 20;
    }
    if (xPos < 20) {
      xPos = 20;
    }
    
    // Calculate vertical position (above the element)
    let yPos = rect.top - toolbarHeight - 10;
    if (yPos < 20) {
      yPos = rect.bottom + 10; // Show below if not enough space above
    }
    
    this.editToolbarPosition.x = xPos;
    this.editToolbarPosition.y = yPos;
    this.showEditToolbar = true;
    
    // Add click listener to hide toolbar when clicking outside
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick.bind(this), { capture: true });
    }, 100);
  }
  
  private handleOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    const toolbar = document.querySelector('.edit-toolbar');
    
    if (toolbar && !toolbar.contains(target) && !this.activeEditElement?.contains(target)) {
      this.hideEditToolbar();
      document.removeEventListener('click', this.handleOutsideClick, { capture: true });
    }
  }
  
  // Section management methods
  addExperience() {
    this.sectionManager.addExperience();
  }
  
  removeExperience(index: number) {
    this.sectionManager.removeExperience(index);
  }
  
  addResponsibility(expIndex: number) {
    this.sectionManager.addResponsibility(expIndex);
  }
  
  removeResponsibility(data: {expIndex: number, respIndex: number}) {
    this.sectionManager.removeResponsibility(data.expIndex, data.respIndex);
  }
  
  addEducation() {
    this.sectionManager.addEducation();
  }
  
  removeEducation(index: number) {
    this.sectionManager.removeEducation(index);
  }
  
  addActivity() {
    this.sectionManager.addActivity();
  }
  
  removeActivity(index: number) {
    this.sectionManager.removeActivity(index);
  }
  
  addCertificate() {
    this.sectionManager.addCertificate();
  }
  
  removeCertificate(index: number) {
    this.sectionManager.removeCertificate(index);
  }
  
  addProject() {
    this.sectionManager.addProject();
  }
  
  removeProject(index: number) {
    this.sectionManager.removeProject(index);
  }
  
  addReference() {
    this.sectionManager.addReference();
  }
  
  removeReference(index: number) {
    this.sectionManager.removeReference(index);
  }
  
  // Category Management Methods
  openManagementModal() {
    this.showManagementModal = true;
  }
  
  closeManagementModal() {
    this.showManagementModal = false;
    // Also close any sub-modals
    this.showCategoryModal = false;
    this.showSectionModal = false;
  }

  // Layout Management Methods
  openLayoutConfigModal() {
    this.showLayoutConfigModal = true;
    this.currentLayoutConfig = null; // Start with new layout
  }

  openLayoutManagementModal() {
    if (!this.currentLayoutConfig) {
      alert('Vui lòng tạo layout configuration trước');
      this.openLayoutConfigModal();
      return;
    }
    this.showLayoutManagementModal = true;
  }

  closeLayoutConfigModal() {
    this.showLayoutConfigModal = false;
    this.currentLayoutConfig = null;
  }

  closeLayoutManagementModal() {
    this.showLayoutManagementModal = false;
  }

  onLayoutConfigSave(layoutConfig: LayoutConfiguration) {
    // Save to layouts list
    const existingIndex = this.layoutConfigurations.findIndex(l => l.id === layoutConfig.id);
    if (existingIndex >= 0) {
      this.layoutConfigurations[existingIndex] = layoutConfig;
    } else {
      this.layoutConfigurations.push(layoutConfig);
    }

    // Set as current if it's default or first one
    if (layoutConfig.isDefault || !this.currentLayoutConfig) {
      this.currentLayoutConfig = layoutConfig;
    }

    this.closeLayoutConfigModal();
    console.log('Layout saved:', layoutConfig);
  }

  onLayoutUpdated(layoutConfig: LayoutConfiguration) {
    this.currentLayoutConfig = layoutConfig;
    console.log('Layout updated:', layoutConfig);
  }

  onSectionPlaced(dragData: DragDropData) {
    console.log('Section placed:', dragData);
    // Update CV data based on section placement
    this.updateCVFromLayout();
  }

  updateCVFromLayout() {
    if (!this.currentLayoutConfig) return;
    
    // Update usedSections based on layout
    const placedSections: string[] = [];
    this.currentLayoutConfig.rows.forEach(row => {
      row.columns.forEach(column => {
        placedSections.push(...column.sections);
      });
    });

    // Update used sections list
    this.usedSections = placedSections.map(sectionId => {
      const section = this.availableSections.find((s: CVSection) => s.id === sectionId);
      return section ? {
        id: section.id,
        name: section.name,
        icon: section.icon,
        isVisible: true,
        order: 0
      } : null;
    }).filter(Boolean) as UsedSection[];
  }

  // Initialize default layout
  initializeDefaultLayout() {
    if (this.layoutConfigurations.length === 0) {
      const defaultLayout: LayoutConfiguration = {
        id: 'default_layout_1',
        name: 'Layout Cơ Bản',
        description: 'Layout 2 cột cơ bản cho CV',
        rows: [
          {
            id: 'row_1',
            columns: [
              {
                id: 'col_1_1',
                widthPercentage: 35,
                sections: [],
                minWidth: 25,
                maxWidth: 45
              },
              {
                id: 'col_1_2', 
                widthPercentage: 65,
                sections: [],
                minWidth: 55,
                maxWidth: 75
              }
            ],
            order: 0
          }
        ],
        totalColumns: 2,
        isDefault: true,
        createdDate: new Date(),
        modifiedDate: new Date()
      };

      this.layoutConfigurations.push(defaultLayout);
      this.currentLayoutConfig = defaultLayout;
    }
  }
  
  openCategoryModal(mode: 'add' | 'edit' = 'add', category?: CVCategory) {
    this.modalMode = mode;
    this.showCategoryModal = true;
    
    if (mode === 'edit' && category) {
      this.editingCategory = { ...category };
      this.newCategoryForm = {
        name: category.name,
        icon: category.icon,
        description: category.description || '',
        allowMultiple: category.allowMultiple
      };
    } else {
      this.editingCategory = null;
      this.resetCategoryForm();
    }
  }
  
  closeCategoryModal() {
    this.showCategoryModal = false;
    this.editingCategory = null;
    this.resetCategoryForm();
    // Don't close management modal, just the category form modal
  }
  
  openSectionModal(mode: 'add' | 'edit' = 'add', categoryId: string = '', section?: CVSection) {
    this.modalMode = mode;
    this.showSectionModal = true;
    this.currentCategoryId = categoryId;
    
    if (mode === 'edit' && section) {
      this.editingSection = { ...section };
      this.newSectionForm = {
        name: section.name,
        icon: section.icon,
        categoryId: section.categoryId || categoryId,
        allowMultiple: section.allowMultiple || false
      };
    } else {
      this.editingSection = null;
      this.newSectionForm = {
        name: '',
        icon: '',
        categoryId: categoryId,
        allowMultiple: false
      };
    }
  }
  
  closeSectionModal() {
    this.showSectionModal = false;
    this.editingSection = null;
    this.currentCategoryId = '';
    this.resetSectionForm();
    // Don't close management modal, just the section form modal
  }
  
  addCategory() {
    if (!this.newCategoryForm.name.trim()) {
      alert('Tên danh mục không được để trống!');
      return;
    }
    
    const newCategory: CVCategory = {
      id: this.generateId(),
      name: this.newCategoryForm.name,
      icon: this.newCategoryForm.icon || '📁',
      description: this.newCategoryForm.description,
      allowMultiple: this.newCategoryForm.allowMultiple,
      isSystemCategory: false,
      order: this.categories.length + 1,
      sections: []
    };
    
    this.categories.push(newCategory);
    this.closeCategoryModal();
    console.log('Category added:', newCategory);
  }
  
  editCategory(category: CVCategory) {
    this.openCategoryModal('edit', category);
  }
  
  updateCategory() {
    if (!this.editingCategory || !this.newCategoryForm.name.trim()) {
      alert('Tên danh mục không được để trống!');
      return;
    }
    
    const index = this.categories.findIndex(cat => cat.id === this.editingCategory!.id);
    if (index !== -1) {
      this.categories[index] = {
        ...this.editingCategory,
        name: this.newCategoryForm.name,
        icon: this.newCategoryForm.icon || '📁',
        description: this.newCategoryForm.description,
        allowMultiple: this.newCategoryForm.allowMultiple
      };
    }
    
    this.closeCategoryModal();
    console.log('Category updated');
  }
  
  deleteCategory(categoryId: string) {
    const category = this.categories.find(cat => cat.id === categoryId);
    if (category?.isSystemCategory) {
      alert('Không thể xóa danh mục hệ thống!');
      return;
    }
    
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      this.categories = this.categories.filter(cat => cat.id !== categoryId);
      // Remove sections from this category from available sections
      this.availableSections = this.availableSections.filter(section => 
        !category?.sections.some(catSection => catSection.id === section.id)
      );
      // Update order
      this.categories.forEach((cat, index) => {
        cat.order = index + 1;
      });
      console.log('Category deleted:', categoryId);
    }
  }
  
  // Section Management Methods
  addSectionToCategory(categoryId?: string) {
    const targetCategoryId = categoryId || this.currentCategoryId;
    if (!this.newSectionForm.name.trim()) {
      alert('Tên mục không được để trống!');
      return;
    }
    
    const category = this.categories.find(cat => cat.id === targetCategoryId);
    if (!category) {
      alert('Không tìm thấy danh mục!');
      return;
    }
    
    const newSection: CVSection = {
      id: this.generateId(),
      name: this.newSectionForm.name,
      icon: this.newSectionForm.icon || '📄',
      categoryId: targetCategoryId,
      allowMultiple: this.newSectionForm.allowMultiple
    };
    
    category.sections.push(newSection);
    this.availableSections.push(newSection);
    this.closeSectionModal();
    console.log('Section added to category:', newSection);
  }
  
  editSection(section: CVSection) {
    this.openSectionModal('edit', section.categoryId || '', section);
  }
  
  updateSection() {
    if (!this.editingSection || !this.newSectionForm.name.trim()) {
      alert('Tên mục không được để trống!');
      return;
    }
    
    // Update in category
    const category = this.categories.find(cat => 
      cat.sections.some(s => s.id === this.editingSection!.id)
    );
    
    if (category) {
      const sectionIndex = category.sections.findIndex(s => s.id === this.editingSection!.id);
      if (sectionIndex !== -1) {
        category.sections[sectionIndex] = {
          ...this.editingSection,
          name: this.newSectionForm.name,
          icon: this.newSectionForm.icon || '📄',
          allowMultiple: this.newSectionForm.allowMultiple
        };
      }
    }
    
    // Update in available sections
    const availableIndex = this.availableSections.findIndex(s => s.id === this.editingSection!.id);
    if (availableIndex !== -1) {
      this.availableSections[availableIndex] = {
        ...this.editingSection,
        name: this.newSectionForm.name,
        icon: this.newSectionForm.icon || '📄',
        allowMultiple: this.newSectionForm.allowMultiple
      };
    }
    
    this.closeSectionModal();
    console.log('Section updated');
  }
  
  deleteSectionFromCategory(categoryId: string, sectionId: string) {
    if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      const category = this.categories.find(cat => cat.id === categoryId);
      if (category) {
        category.sections = category.sections.filter(s => s.id !== sectionId);
        this.availableSections = this.availableSections.filter(s => s.id !== sectionId);
        // Also remove from used sections if exists
        this.usedSections = this.usedSections.filter(s => s.id !== sectionId);
        console.log('Section deleted from category:', sectionId);
      }
    }
  }
  
  // Helper Methods
  generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  }
  
  resetCategoryForm() {
    this.newCategoryForm = {
      name: '',
      icon: '',
      description: '',
      allowMultiple: false
    };
  }
  
  resetSectionForm() {
    this.newSectionForm = {
      name: '',
      icon: '',
      categoryId: '',
      allowMultiple: false
    };
  }
  
  // Performance optimization methods
  trackByCategory(index: number, category: CVCategory): string {
    return category.id;
  }
  
  trackBySection(index: number, section: CVSection): string {
    return section.id;
  }

  // Utility function for modal stats
  getTotalSections(): number {
    return this.categories.reduce((total, category) => total + category.sections.length, 0);
  }
}