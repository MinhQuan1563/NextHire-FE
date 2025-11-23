import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DesignSettings {
  selectedFont: string;
  fontSize: number;
  lineSpacing: number;
  selectedColor: string;
  selectedBackground: string;
}

/**
 * Design Settings Service - Tương tự như custom hook useDesignSettings trong React
 * Quản lý tất cả logic liên quan đến design và styling
 */
@Injectable({
  providedIn: 'root'
})
export class DesignSettingsService {
  private readonly _settings$ = new BehaviorSubject<DesignSettings>({
    selectedFont: 'Roboto',
    fontSize: 14,
    lineSpacing: 1.5,
    selectedColor: '#00B14F',
    selectedBackground: 'white'
  });
  
  // Public observables
  public readonly settings$ = this._settings$.asObservable();
  
  // Font options
  readonly fontOptions = [
    { label: 'Roboto', value: 'Roboto' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Calibri', value: 'Calibri' },
    { label: 'Georgia', value: 'Georgia' }
  ];
  
  // Color palette
  readonly colorPalette = [
    '#00B14F', '#007bff', '#dc3545', '#28a745', 
    '#ffc107', '#6f42c1', '#e83e8c', '#fd7e14'
  ];
  
  // Background options
  readonly backgroundOptions = [
    { name: 'White', value: 'white', class: 'bg-white' },
    { name: 'Light Gray', value: 'light-gray', class: 'bg-light-gray' },
    { name: 'Cream', value: 'cream', class: 'bg-cream' },
    { name: 'Light Blue', value: 'light-blue', class: 'bg-light-blue' }
  ];
  
  // Getters
  get currentSettings(): DesignSettings {
    return this._settings$.value;
  }
  
  // Font management
  updateFont(font: string): void {
    this.updateSettings({ selectedFont: font });
    this.applyFontToDocument(font);
  }
  
  updateFontSize(size: number): void {
    this.updateSettings({ fontSize: size });
    this.applyFontSizeToDocument(size);
  }
  
  updateLineSpacing(spacing: number): void {
    this.updateSettings({ lineSpacing: spacing });
    this.applyLineSpacingToDocument(spacing);
  }
  
  // Color management
  updateColor(color: string): void {
    this.updateSettings({ selectedColor: color });
    this.applyColorToDocument(color);
  }
  
  // Background management
  updateBackground(background: string): void {
    this.updateSettings({ selectedBackground: background });
    this.applyBackgroundToDocument(background);
  }
  
  // Private methods
  private updateSettings(partialSettings: Partial<DesignSettings>): void {
    const newSettings = { ...this.currentSettings, ...partialSettings };
    this._settings$.next(newSettings);
  }
  
  private applyFontToDocument(font: string): void {
    const cvPaper = document.querySelector('.cv-paper') as HTMLElement;
    if (cvPaper) {
      cvPaper.style.fontFamily = font;
    }
  }
  
  private applyFontSizeToDocument(size: number): void {
    const cvPaper = document.querySelector('.cv-paper') as HTMLElement;
    if (cvPaper) {
      cvPaper.style.setProperty('--base-font-size', `${size}px`);
      cvPaper.style.fontSize = `${size}px`;
    }
  }
  
  private applyLineSpacingToDocument(spacing: number): void {
    const cvPaper = document.querySelector('.cv-paper') as HTMLElement;
    if (cvPaper) {
      cvPaper.style.lineHeight = spacing.toString();
    }
  }
  
  private applyColorToDocument(color: string): void {
    const cvPaper = document.querySelector('.cv-paper') as HTMLElement;
    if (cvPaper) {
      const sectionHeaders = cvPaper.querySelectorAll('.section-header');
      sectionHeaders.forEach(header => {
        (header as HTMLElement).style.borderBottomColor = color;
      });
      
      // Apply to other color elements as needed
      cvPaper.style.setProperty('--primary-color', color);
    }
  }
  
  private applyBackgroundToDocument(background: string): void {
    const cvPaper = document.querySelector('.cv-paper') as HTMLElement;
    if (cvPaper) {
      // Remove existing background classes
      cvPaper.className = cvPaper.className.replace(/bg-\\w+/g, '');
      cvPaper.classList.add(`bg-${background}`);
    }
  }
  
  // Utility methods
  resetToDefaults(): void {
    const defaultSettings: DesignSettings = {
      selectedFont: 'Roboto',
      fontSize: 14,
      lineSpacing: 1.5,
      selectedColor: '#00B14F',
      selectedBackground: 'white'
    };
    
    this._settings$.next(defaultSettings);
    this.applyAllSettingsToDocument(defaultSettings);
  }
  
  private applyAllSettingsToDocument(settings: DesignSettings): void {
    this.applyFontToDocument(settings.selectedFont);
    this.applyFontSizeToDocument(settings.fontSize);
    this.applyLineSpacingToDocument(settings.lineSpacing);
    this.applyColorToDocument(settings.selectedColor);
    this.applyBackgroundToDocument(settings.selectedBackground);
  }
  
  // Load settings from localStorage
  loadSettings(): void {
    try {
      const saved = localStorage.getItem('cv-design-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this._settings$.next(settings);
        this.applyAllSettingsToDocument(settings);
      }
    } catch (error) {
      console.warn('Could not load design settings:', error);
    }
  }
  
  // Save settings to localStorage
  saveSettings(): void {
    try {
      localStorage.setItem('cv-design-settings', JSON.stringify(this.currentSettings));
    } catch (error) {
      console.warn('Could not save design settings:', error);
    }
  }
  
  // Get computed styles for preview
  getPreviewStyles(): any {
    const settings = this.currentSettings;
    return {
      fontFamily: settings.selectedFont,
      fontSize: `${settings.fontSize}px`,
      lineHeight: settings.lineSpacing.toString(),
      '--primary-color': settings.selectedColor,
      '--background': settings.selectedBackground
    };
  }
}