import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, InputTextModule, FormsModule, ReactiveFormsModule],
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss'],
  providers: [ // Provider để component hoạt động với ngModel và formControlName
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFieldComponent),
      multi: true
    }
  ]
})
export class InputFieldComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() inputId: string = `input-${Math.random().toString(36).substring(2, 9)}`;
  @Input() type: string = 'text'; // type của input (text, password, email, ...)
  @Input() control: FormControl = new FormControl(); // Nhận FormControl từ bên ngoài để hiển thị lỗi

  _value: any = ''; // Giá trị nội bộ
  onChange: any = () => {};
  onTouched: any = () => {};

  get value(): any {
    return this._value;
  }

  set value(val: any) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
      this.onTouched();
    }
  }

  // --- Implementation của ControlValueAccessor ---
  writeValue(value: any): void {
    this._value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Disable input
  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  // Helper để kiểm tra lỗi validation
  hasError(errorCode: string): boolean {
    return this.control && this.control.hasError(errorCode) && (this.control.dirty || this.control.touched);
  }
}