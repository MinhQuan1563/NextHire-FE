import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messageService = inject(MessageService);

  /**
   * Hiển thị thông báo
   * @param title Tiêu đề thông báo
   * @param message Nội dung chi tiết
   */
  showSuccess(title: string, message: string) {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 3000 // Tự biến mất sau 3 giây
    });
  }

  showError(title: string, message: string) {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: 5000 
    });
  }

  showWarning(title: string, message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 4000
    });
  }

  showInfo(title: string, message: string) {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 3000
    });
  }

  clear() {
    this.messageService.clear();
  }
}