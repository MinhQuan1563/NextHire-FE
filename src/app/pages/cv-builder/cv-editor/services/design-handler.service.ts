import { Injectable } from '@angular/core';

export interface DesignSettings {
  selectedFont: string;
  fontSize: number;
  lineSpacing: number;
  selectedColor: string;
  selectedBackground: string;
}

@Injectable({
  providedIn: 'root'
})
export class DesignHandlerService {

  constructor() {}

  applyFontChange(font: string) {
    const cvPaper = this.getCvPaperElement();
    if (cvPaper) {
      cvPaper.style.fontFamily = font;
    }
  }

  applyFontSizeChange(fontSize: number) {
    const cvPaper = this.getCvPaperElement();
    if (cvPaper) {
      // Update the main font size
      cvPaper.style.fontSize = fontSize + 'px';
      
      // Force update all text elements that might have inherited font sizes
      const textElements = cvPaper.querySelectorAll('.section-content, .editable, .cv-name, .cv-title, .contact-item, .edu-degree, .exp-position, .activity-title, .cert-name, .project-title');
      textElements.forEach((element: any) => {
        if (!element.hasAttribute('data-custom-size')) {
          element.style.fontSize = fontSize + 'px';
        }
      });
      
      // Also update base font size for the paper
      cvPaper.style.setProperty('--base-font-size', fontSize + 'px');
    }
  }

  applyLineSpacingChange(lineSpacing: number) {
    const cvPaper = this.getCvPaperElement();
    if (cvPaper) {
      cvPaper.style.lineHeight = lineSpacing.toString();
    }
  }

  applyColorChange(color: string) {
    const sectionTitles = document.querySelectorAll('.section-title') as NodeListOf<HTMLElement>;
    sectionTitles.forEach(title => {
      title.style.color = color;
    });
  }

  applyBackgroundChange(background: string) {
    const cvPaper = this.getCvPaperElement();
    if (cvPaper) {
      cvPaper.className = cvPaper.className.replace(/bg-\w+/g, '');
      cvPaper.classList.add(`bg-${background}`);
    }
  }

  private getCvPaperElement(): HTMLElement | null {
    return document.querySelector('.cv-paper') as HTMLElement;
  }

  // Design presets
  getDefaultDesignSettings(): DesignSettings {
    return {
      selectedFont: 'Roboto',
      fontSize: 14,
      lineSpacing: 1.5,
      selectedColor: '#00B14F',
      selectedBackground: 'white'
    };
  }

  getAvailableFonts() {
    return [
      'Roboto',
      'Arial',
      'Times New Roman',
      'Georgia', 
      'Verdana',
      'Helvetica',
      'Calibri',
      'Open Sans',
      'Lato',
      'Montserrat'
    ];
  }

  getAvailableColors() {
    return [
      '#00B14F',
      '#2563eb',
      '#dc2626',
      '#7c3aed',
      '#ea580c',
      '#0891b2',
      '#059669',
      '#be185d'
    ];
  }

  getAvailableBackgrounds() {
    return [
      'white',
      'light-gray',
      'cream'
    ];
  }

  validateDesignSettings(settings: DesignSettings): boolean {
    return (
      settings.fontSize >= 8 && settings.fontSize <= 24 &&
      settings.lineSpacing >= 1 && settings.lineSpacing <= 3 &&
      this.getAvailableFonts().includes(settings.selectedFont) &&
      this.getAvailableColors().includes(settings.selectedColor) &&
      this.getAvailableBackgrounds().includes(settings.selectedBackground)
    );
  }
}