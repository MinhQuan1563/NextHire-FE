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
  @Input() title: string = 'Truy cập bị từ chối';
  @Input() message: string = 'Bạn không có quyền thực hiện thao tác này.';
  @Input() buttonLabel: string = 'Về trang chủ';
  @Input() showButton: boolean = true;

  @Output() onAction = new EventEmitter<void>();

  handleAction() {
    this.onAction.emit();
  }
}