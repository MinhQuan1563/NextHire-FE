import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-modal-wrapper',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './modal-wrapper.component.html',
  styleUrls: ['./modal-wrapper.component.scss']
})
export class ModalWrapperComponent {
  @Input() header: string = 'Thông báo';
  @Input() visible: boolean = false;
  @Input() modalStyleClass: string = 'max-w-xl'; // Class css cho modal
  @Input() closable: boolean = true;
  @Input() draggable: boolean = false;
  @Input() showFooter: boolean = true;
  @Input() confirmLabel: string = 'Đồng ý';
  @Input() cancelLabel: string = 'Hủy';
  @Input() showConfirmButton: boolean = true;
  @Input() showCancelButton: boolean = true;
  @Input() confirmDisabled: boolean = false;

  @Output() visibleChange = new EventEmitter<boolean>(); // Để two-way binding [(visible)]
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onHide = new EventEmitter<void>(); // Khi modal bị đóng (bất kể cách nào)

  closeModal(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onCancel.emit();
    this.onHide.emit();
  }

  confirmAction(): void {
    this.onConfirm.emit();
    // Không tự đóng modal khi confirm, component cha sẽ quyết định
  }

  cancelAction(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onCancel.emit();
    this.onHide.emit();
  }

  handleHide(): void {
    this.visibleChange.emit(false);
    this.onHide.emit();
  }
}