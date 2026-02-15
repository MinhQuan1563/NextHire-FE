import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-error.component.html',
  styleUrl: './form-error.component.scss'
})
export class FormErrorComponent {
  @Input() form!: FormGroup;
  @Input() fieldName!: string;

  /**
   * Error message mapper
   * Example:
   * {
   *   required: 'This field is required',
   *   minlength: 'Min {{requiredLength}} characters'
   * }
   */
  @Input() messages: Record<string, string> = {};
  get control(): AbstractControl | null {
    return this.form?.get(this.fieldName) ?? null;
  }

  get shouldShow(): boolean {
    return !!(
      this.control &&
      this.control.invalid &&
      (this.control.touched || this.control.dirty)
    );
  }

  get errorMessage(): string | null {
    if (!this.control?.errors) return null;

    const errors = this.control.errors;

    for (const errorKey of Object.keys(errors)) {
      const template = this.messages[errorKey];
      if (template) {
        return this.interpolate(template, errors[errorKey]);
      }
    }

    return 'Invalid value';
  }

  private interpolate(template: string, errorValue: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return errorValue?.[key] ?? '';
    });
  }
}
