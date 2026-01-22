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
  success(title: string, message: string) {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 3000 // Tự biến mất sau 3 giây
    });
  }

  error(title: string, message: string) {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: 5000 
    });
  }

  warning(title: string, message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 4000
    });
  }

  info(title: string, message: string) {
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