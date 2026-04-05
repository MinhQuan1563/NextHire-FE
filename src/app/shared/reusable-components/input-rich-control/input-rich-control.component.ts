import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { OverlayPanelModule, OverlayPanel } from 'primeng/overlaypanel';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-input-rich-control',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextareaModule, ButtonModule, 
    AvatarModule, OverlayPanelModule, PickerComponent],
  templateUrl: './input-rich-control.component.html',
  styleUrls: ['./input-rich-control.component.scss']
})
export class InputRichControlComponent {
  @Input() placeholder: string = 'Viết bình luận...';
  @Input() avatarUrl: string | undefined = undefined;
  @Input() userChar: string = 'U';
  @Input() disabled: boolean = false;
  
  @Output() onSend = new EventEmitter<string>();

  inputValue: string = '';

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    this.inputValue += emoji;
  }

  handleSend() {
    if (!this.inputValue.trim() || this.disabled) {
      return;
    }
    
    this.onSend.emit(this.inputValue.trim());
    this.inputValue = ''; 
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey) {
      event.preventDefault();
      this.handleSend();
    }
    else if (event.key === 'Enter' && event.ctrlKey) {
      this.inputValue += '\n';
    }
  }
}