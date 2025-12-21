import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormErrorComponent } from '@shared/reusable-components/form-error/form-error.component';
import { isFieldInvalid } from '@shared/helpers/formUtil';
import { CvTemplateType } from '@app/models/cv-builder/cv-template.model';

interface SaveTemplateData {
  name: string;
  description?: string;
  type: CvTemplateType;
}

@Component({
  selector: 'app-save-template-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    FloatLabelModule,
    FormErrorComponent,
  ],
  templateUrl: './save-template-dialog.component.html',
  styleUrls: ['./save-template-dialog.component.scss'],
})
export class SaveTemplateDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() templateName = '';
  @Input() templateDescription = '';
  @Input() templateType: CvTemplateType = CvTemplateType.Resume;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<SaveTemplateData>();

  private fb = inject(FormBuilder);
  isFieldInvalid = isFieldInvalid;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    type: [CvTemplateType.Resume, Validators.required],
  });

  templateTypes = [
    { label: 'Resume', value: CvTemplateType.Resume },
    { label: 'Cover Letter', value: CvTemplateType.CoverLetter },
    { label: 'Portfolio', value: CvTemplateType.Portfolio },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      // Load current template data when dialog opens
      this.form.patchValue({
        name: this.templateName || '',
        description: this.templateDescription || '',
        type: this.templateType || CvTemplateType.Resume,
      });
    }

    // Reset form when dialog closes
    if (changes['visible']?.previousValue === true && changes['visible']?.currentValue === false) {
      this.resetForm();
    }
  }

  close(): void {
    this.resetForm();
    this.onClose.emit();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    this.onSave.emit({
      name: formValue.name,
      description: formValue.description || undefined,
      type: formValue.type,
    });
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      description: '',
      type: CvTemplateType.Resume,
    });
    this.form.markAsUntouched();
  }
}

