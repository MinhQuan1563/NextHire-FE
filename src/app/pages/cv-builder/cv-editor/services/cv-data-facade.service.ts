import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  CVCategory, 
  CVSection 
} from '@core/models/cv-builder/cv-template.model';
import { CVData, SectionManagerService } from './section-manager.service';

export interface UsedSection {
  id: string;
  name: string;
  icon: string;
  order: number;
  categoryId: string;
  allowMultiple: boolean;
}

/**
 * CV Data Facade Service - Tương tự như useCV hook trong React
 * Tập trung quản lý CV data operations và business logic
 */
@Injectable({
  providedIn: 'root'
})
export class CVDataFacadeService {
  private readonly _cvData$ = new BehaviorSubject<CVData>({
    experiences: [],
    education: [],
    activities: [],
    certificates: [],
    projects: [],
    references: []
  });
  
  private readonly _categories$ = new BehaviorSubject<CVCategory[]>([]);
  private readonly _usedSections$ = new BehaviorSubject<UsedSection[]>([]);
  
  // Public observables
  public readonly cvData$ = this._cvData$.asObservable();
  public readonly categories$ = this._categories$.asObservable();
  public readonly usedSections$ = this._usedSections$.asObservable();
  
  // Computed observables
  public readonly availableSections$ = combineLatest([
    this.categories$,
    this.usedSections$
  ]).pipe(
    map(([categories, usedSections]) => this.calculateAvailableSections(categories, usedSections))
  );
  
  constructor(private sectionManagerService: SectionManagerService) {
    this.initializeDefaultData();
  }
  
  // Getters
  get currentCVData(): CVData {
    return this._cvData$.value;
  }
  
  get currentCategories(): CVCategory[] {
    return this._categories$.value;
  }
  
  get currentUsedSections(): UsedSection[] {
    return this._usedSections$.value;
  }
  
  // Initialization
  private initializeDefaultData(): void {
    this.loadDefaultCategories();
    this.loadUsedSections();
  }
  
  private loadDefaultCategories(): void {
    // Initialize with empty categories - will be loaded from storage or created by user
    const defaultCategories: CVCategory[] = [];
    this._categories$.next(defaultCategories);
  }
  
  // Category Management
  addCategory(categoryData: Omit<CVCategory, 'id' | 'createdAt'>): CVCategory {
    const newCategory: CVCategory = {
      ...categoryData,
      id: this.generateId('category'),
      sections: categoryData.sections || []
    };
    
    const categories = [...this.currentCategories, newCategory];
    this._categories$.next(categories);
    this.saveCategoriesToStorage();
    
    return newCategory;
  }
  
  updateCategory(categoryId: string, updates: Partial<CVCategory>): void {
    const categories = this.currentCategories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, ...updates, updatedAt: new Date() }
        : cat
    );
    
    this._categories$.next(categories);
    this.saveCategoriesToStorage();
  }
  
  removeCategory(categoryId: string): void {
    // Remove category
    const categories = this.currentCategories.filter(cat => cat.id !== categoryId);
    this._categories$.next(categories);
    
    // Remove related used sections
    const usedSections = this.currentUsedSections.filter(section => 
      section.categoryId !== categoryId
    );
    this._usedSections$.next(usedSections);
    
    this.saveCategoriesToStorage();
    this.saveUsedSectionsToStorage();
  }
  
  // Section Management
  addSectionToCategory(categoryId: string, sectionData: Omit<CVSection, 'id'>): CVSection {
    const newSection: CVSection = {
      ...sectionData,
      id: this.generateId('section')
    };
    
    const categories = this.currentCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          sections: [...cat.sections, newSection],
          updatedAt: new Date()
        };
      }
      return cat;
    });
    
    this._categories$.next(categories);
    this.saveCategoriesToStorage();
    
    return newSection;
  }
  
  updateSectionInCategory(categoryId: string, sectionId: string, updates: Partial<CVSection>): void {
    const categories = this.currentCategories.map(cat => {
      if (cat.id === categoryId) {
        const sections = cat.sections.map(section =>
          section.id === sectionId ? { ...section, ...updates } : section
        );
        return { ...cat, sections, updatedAt: new Date() };
      }
      return cat;
    });
    
    this._categories$.next(categories);
    this.saveCategoriesToStorage();
  }
  
  removeSectionFromCategory(categoryId: string, sectionId: string): void {
    // Remove from category
    const categories = this.currentCategories.map(cat => {
      if (cat.id === categoryId) {
        const sections = cat.sections.filter(section => section.id !== sectionId);
        return { ...cat, sections, updatedAt: new Date() };
      }
      return cat;
    });
    
    this._categories$.next(categories);
    
    // Remove from used sections if exists
    const usedSections = this.currentUsedSections.filter(section => 
      section.id !== sectionId
    );
    this._usedSections$.next(usedSections);
    
    this.saveCategoriesToStorage();
    this.saveUsedSectionsToStorage();
  }
  
  // Used Sections Management
  addSectionToLayout(section: CVSection, categoryId: string): void {
    const category = this.findCategoryById(categoryId);
    if (!category) return;
    
    // Check if section can have multiple instances
    if (!section.allowMultiple) {
      const isAlreadyUsed = this.currentUsedSections.some(used => used.id === section.id);
      if (isAlreadyUsed) return;
    }
    
    const usedSection: UsedSection = {
      id: section.allowMultiple ? this.generateId('used_section') : section.id,
      name: section.name,
      icon: section.icon,
      order: this.currentUsedSections.length,
      categoryId,
      allowMultiple: section.allowMultiple ?? false
    };
    
    const usedSections = [...this.currentUsedSections, usedSection];
    this._usedSections$.next(usedSections);
    this.saveUsedSectionsToStorage();
  }
  
  removeSectionFromLayout(sectionId: string): void {
    const usedSections = this.currentUsedSections.filter(section => 
      section.id !== sectionId
    );
    
    // Reorder remaining sections
    const reorderedSections = usedSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    this._usedSections$.next(reorderedSections);
    this.saveUsedSectionsToStorage();
  }
  
  reorderSections(sectionIds: string[]): void {
    const reorderedSections = sectionIds
      .map((id, index) => {
        const section = this.currentUsedSections.find(s => s.id === id);
        return section ? { ...section, order: index } : null;
      })
      .filter(Boolean) as UsedSection[];
    
    this._usedSections$.next(reorderedSections);
    this.saveUsedSectionsToStorage();
  }
  
  // CV Data Management
  updateCVData(updates: Partial<CVData>): void {
    const newCVData = { ...this.currentCVData, ...updates };
    this._cvData$.next(newCVData);
    this.saveCVDataToStorage();
  }
  
  updateField(fieldName: string, value: any): void {
    // Handle nested field updates
    const fieldPath = fieldName.split('.');
    const newCVData = { ...this.currentCVData };
    
    if (fieldPath.length === 1) {
      (newCVData as any)[fieldName] = value;
    } else {
      // Handle nested updates (e.g., "experiences.0.position")
      let current = newCVData as any;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) {
          current[fieldPath[i]] = {};
        }
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = value;
    }
    
    this._cvData$.next(newCVData);
    this.saveCVDataToStorage();
  }
  
  // Experience Management
  addExperience(): void {
    const newExperience = {
      position: '',
      company: '',
      duration: '',
      responsibilities: ['']
    };
    
    const experiences = [...this.currentCVData.experiences, newExperience];
    this.updateCVData({ experiences });
  }
  
  removeExperience(index: number): void {
    const experiences = this.currentCVData.experiences.filter((_, i) => i !== index);
    this.updateCVData({ experiences });
  }
  
  addResponsibility(expIndex: number): void {
    const experiences = [...this.currentCVData.experiences];
    if (experiences[expIndex]) {
      experiences[expIndex].responsibilities.push('');
      this.updateCVData({ experiences });
    }
  }
  
  removeResponsibility(expIndex: number, respIndex: number): void {
    const experiences = [...this.currentCVData.experiences];
    if (experiences[expIndex] && experiences[expIndex].responsibilities.length > 1) {
      experiences[expIndex].responsibilities.splice(respIndex, 1);
      this.updateCVData({ experiences });
    }
  }
  
  // Utility Methods
  findCategoryById(categoryId: string): CVCategory | undefined {
    return this.currentCategories.find(cat => cat.id === categoryId);
  }
  
  findSectionById(sectionId: string): { category: CVCategory; section: CVSection } | undefined {
    for (const category of this.currentCategories) {
      const section = category.sections.find(sec => sec.id === sectionId);
      if (section) {
        return { category, section };
      }
    }
    return undefined;
  }
  
  getTotalSections(): number {
    return this.currentCategories.reduce((total, cat) => total + cat.sections.length, 0);
  }
  
  private calculateAvailableSections(categories: CVCategory[], usedSections: UsedSection[]): CVSection[] {
    const availableSections: CVSection[] = [];
    
    categories.forEach(category => {
      category.sections.forEach(section => {
        if (section.allowMultiple) {
          availableSections.push(section);
        } else {
          const isUsed = usedSections.some(used => used.id === section.id);
          if (!isUsed) {
            availableSections.push(section);
          }
        }
      });
    });
    
    return availableSections;
  }
  
  private generateId(prefix: string = 'item'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Storage Methods
  private saveCategoriesToStorage(): void {
    try {
      localStorage.setItem('cv-categories', JSON.stringify(this.currentCategories));
    } catch (error) {
      console.warn('Could not save categories:', error);
    }
  }
  
  private saveUsedSectionsToStorage(): void {
    try {
      localStorage.setItem('cv-used-sections', JSON.stringify(this.currentUsedSections));
    } catch (error) {
      console.warn('Could not save used sections:', error);
    }
  }
  
  private saveCVDataToStorage(): void {
    try {
      localStorage.setItem('cv-data', JSON.stringify(this.currentCVData));
    } catch (error) {
      console.warn('Could not save CV data:', error);
    }
  }
  
  private loadUsedSections(): void {
    try {
      const saved = localStorage.getItem('cv-used-sections');
      if (saved) {
        const usedSections = JSON.parse(saved);
        this._usedSections$.next(usedSections);
      }
    } catch (error) {
      console.warn('Could not load used sections:', error);
    }
  }
  
  loadFromStorage(): void {
    try {
      // Load categories
      const categoriesData = localStorage.getItem('cv-categories');
      if (categoriesData) {
        const categories = JSON.parse(categoriesData);
        this._categories$.next(categories);
      }
      
      // Load used sections
      const usedSectionsData = localStorage.getItem('cv-used-sections');
      if (usedSectionsData) {
        const usedSections = JSON.parse(usedSectionsData);
        this._usedSections$.next(usedSections);
      }
      
      // Load CV data
      const cvData = localStorage.getItem('cv-data');
      if (cvData) {
        const data = JSON.parse(cvData);
        this._cvData$.next(data);
      }
    } catch (error) {
      console.warn('Could not load data from storage:', error);
    }
  }
  
  // TrackBy functions for templates
  trackByCategory = (index: number, category: CVCategory): string => category.id;
  trackBySection = (index: number, section: CVSection): string => section.id;
  trackByUsedSection = (index: number, section: UsedSection): string => section.id;
}