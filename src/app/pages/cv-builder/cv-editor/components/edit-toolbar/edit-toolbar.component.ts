import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-toolbar.component.html',
  styleUrls: ['./edit-toolbar.component.scss']
})
export class EditToolbarComponent {
  @Input() show: boolean = false;
  @Input() position: { x: number; y: number } = { x: 0, y: 0 };
  
  @Output() hide = new EventEmitter<void>();
  @Output() bold = new EventEmitter<void>();
  @Output() italic = new EventEmitter<void>();
  @Output() underline = new EventEmitter<void>();
  @Output() bulletList = new EventEmitter<void>();
  @Output() numberList = new EventEmitter<void>();
  @Output() fontSizeChange = new EventEmitter<number>();
  @Output() alignLeft = new EventEmitter<void>();
  @Output() alignCenter = new EventEmitter<void>();
  @Output() alignRight = new EventEmitter<void>();
  @Output() alignJustify = new EventEmitter<void>();

  selectedFontSize: number = 14;

  onHide() {
    this.hide.emit();
  }

  onBold() {
    this.bold.emit();
  }

  onItalic() {
    this.italic.emit();
  }

  onUnderline() {
    this.underline.emit();
  }

  onBulletList() {
    this.bulletList.emit();
  }

  onNumberList() {
    this.numberList.emit();
  }

  onFontSizeChange(event: any) {
    this.selectedFontSize = parseInt(event.target.value);
    this.fontSizeChange.emit(this.selectedFontSize);
  }

  onAlignLeft() {
    this.alignLeft.emit();
  }

  onAlignCenter() {
    this.alignCenter.emit();
  }

  onAlignRight() {
    this.alignRight.emit();
  }

  onAlignJustify() {
    this.alignJustify.emit();
  }
}