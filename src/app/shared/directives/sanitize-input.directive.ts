import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appSanitizeInput], textarea[appSanitizeInput]',
  standalone: true
})
export class SanitizeInputDirective {
  private readonly el = inject(ElementRef);
  private readonly control = inject(NgControl, { optional: true });

  @HostListener('blur')
  onBlur(): void {
    this.sanitizeValue();
  }

  @HostListener('paste', ['$event'])
  onPaste(event: Event): void {
    event.preventDefault();

    const clipboardEvent = event as ClipboardEvent;
    const pastedText = clipboardEvent.clipboardData?.getData('text/plain');

    if (pastedText) {
      const sanitized = this.sanitize(pastedText);
      document.execCommand('insertText', false, sanitized);
    }
  }

  private sanitizeValue(): void {
    const element = this.el.nativeElement as HTMLInputElement | HTMLTextAreaElement;
    const sanitized = this.sanitize(element.value);
    
    if (sanitized !== element.value) {
      element.value = sanitized;
      
      if (this.control?.control) {
        this.control.control.setValue(sanitized);
      }
    }
  }

  private sanitize(value: string): string {
    if (!value) return value;

    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .trim();
  }
}
