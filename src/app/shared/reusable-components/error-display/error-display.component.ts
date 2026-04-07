import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './error-display.component.html',
  styleUrls: ['./error-display.component.scss']
})
export class ErrorDisplayComponent {
  @Input() errorCode: string = '403';
  @Input() title: string = 'Access denied';
  @Input() message: string = 'You do not have permission to perform this action.';
  @Input() buttonLabel: string = 'Go to homepage';
  @Input() showButton: boolean = true;

  @Output() onAction = new EventEmitter<void>();

  handleAction() {
    this.onAction.emit();
  }
}