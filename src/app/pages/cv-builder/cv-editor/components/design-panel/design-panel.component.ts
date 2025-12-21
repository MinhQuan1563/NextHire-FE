import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DesignSettings, DesignHandlerService } from '../../services/design-handler.service';

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

  fonts = ['Roboto', 'Arial', 'Times New Roman', 'Open Sans', 'Lato', 'Montserrat'];
  colors = ['#00B14F', '#2563EB', '#DC2626', '#7C3AED', '#059669', '#EA580C', '#6366F1', '#EC4899'];
  backgrounds = ['white', 'light-gray', 'cream', 'light-blue'];

  constructor(private designHandler: DesignHandlerService) {}

  onFontChange(event: any) {
    this.settings.selectedFont = event.target.value;
    this.designHandler.applyFontChange(this.settings.selectedFont);
  }

  onFontSizeChange(event: any) {
    this.settings.fontSize = parseInt(event.target.value);
    this.designHandler.applyFontSizeChange(this.settings.fontSize);
  }

  onLineSpacingChange(event: any) {
    this.settings.lineSpacing = parseFloat(event.target.value);
    this.designHandler.applyLineSpacingChange(this.settings.lineSpacing);
  }

  onColorChange(color: string) {
    this.settings.selectedColor = color;
    this.designHandler.applyColorChange(color);
  }

  onColorPickerChange(event: any) {
    this.settings.selectedColor = event.target.value;
    this.designHandler.applyColorChange(this.settings.selectedColor);
  }

  onBackgroundChange(background: string) {
    this.settings.selectedBackground = background;
    this.designHandler.applyBackgroundChange(background);
  }
}