import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DesignSettings {
  selectedFont: string;
  fontSize: number;
  lineSpacing: number;
  selectedColor: string;
  selectedBackground: string;
}

@Component({
  selector: 'app-design-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './design-panel.component.html',
  styleUrls: ['./design-panel.component.scss']
})
export class DesignPanelComponent {
  @Input() settings: DesignSettings = {
    selectedFont: 'Roboto',
    fontSize: 14,
    lineSpacing: 1.5,
    selectedColor: '#00B14F',
    selectedBackground: 'white'
  };

  @Output() fontChange = new EventEmitter<string>();
  @Output() fontSizeChange = new EventEmitter<number>();
  @Output() lineSpacingChange = new EventEmitter<number>();
  @Output() colorChange = new EventEmitter<string>();
  @Output() colorPickerChange = new EventEmitter<string>();
  @Output() backgroundChange = new EventEmitter<string>();

  fonts = ['Roboto', 'Arial', 'Times New Roman', 'Open Sans', 'Lato', 'Montserrat'];
  colors = ['#00B14F', '#2563EB', '#DC2626', '#7C3AED', '#059669', '#EA580C', '#6366F1', '#EC4899'];
  backgrounds = ['white', 'light-gray', 'cream', 'light-blue'];

  onFontChange(event: any) {
    this.settings.selectedFont = event.target.value;
    this.fontChange.emit(this.settings.selectedFont);
  }

  onFontSizeChange(event: any) {
    this.settings.fontSize = parseInt(event.target.value);
    this.fontSizeChange.emit(this.settings.fontSize);
  }

  onLineSpacingChange(event: any) {
    this.settings.lineSpacing = parseFloat(event.target.value);
    this.lineSpacingChange.emit(this.settings.lineSpacing);
  }

  onColorChange(color: string) {
    this.settings.selectedColor = color;
    this.colorChange.emit(color);
  }

  onColorPickerChange(event: any) {
    this.settings.selectedColor = event.target.value;
    this.colorPickerChange.emit(this.settings.selectedColor);
  }

  onBackgroundChange(background: string) {
    this.settings.selectedBackground = background;
    this.backgroundChange.emit(background);
  }
}