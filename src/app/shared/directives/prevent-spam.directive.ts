import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPreventSpam]',
  standalone: true
})
export class PreventSpamDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click')
  onClick() {
    // 1. Vô hiệu hóa nút
    this.renderer.setStyle(this.el.nativeElement, 'pointer-events', 'none');
    this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
    this.renderer.addClass(this.el.nativeElement, 'p-disabled');

    // 2. Mở lại nút sau 1s
    setTimeout(() => {
        this.renderer.removeStyle(this.el.nativeElement, 'pointer-events');
        this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
        this.renderer.removeClass(this.el.nativeElement, 'p-disabled');
    }, 500);
  }
}

// how to use
// <button pButton icon="pi pi-send" (click)="createComment()" appPreventSpam></button>