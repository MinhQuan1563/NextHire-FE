import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  CVFieldType,
  CVSectionField,
} from "@app/models/cv-builder/cv-template.model";
import { FormErrorComponent } from "@shared/reusable-components/form-error/form-error.component";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { Dialog, DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from "primeng/inputnumber";
import { MultiSelectModule } from "primeng/multiselect";
import { isFieldInvalid } from "@shared/helpers/formUtil";
interface SaveFieldEvent {
  field: CVSectionField;
  originalName?: string;
}

@Component({
  selector: "app-field-dialog",
  templateUrl: "./field-dialog.component.html",
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CheckboxModule,
    DropdownModule,
    DialogModule,
    ReactiveFormsModule,
    InputNumberModule,
    MultiSelectModule,
    FormErrorComponent,
  ],
})
export class FieldDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() field?: CVSectionField; // undefined = create
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saveField = new EventEmitter<SaveFieldEvent>();
  isFieldInvalid = isFieldInvalid;
  fieldTypes: CVFieldType[] = ["text", "image"];
  fieldTypeOptions = this.fieldTypes.map((type) => ({
    label: type.replace("_", " "),
    value: type,
  }));

  mimeTypes = ["image/png", "image/jpeg", "application/pdf"];
  mimeTypeOptions = this.mimeTypes.map((type) => ({
    label: type,
    value: type,
  }));

  form = this.fb.nonNullable.group({
    name: ["", Validators.required],
    label: ["", Validators.required],
    type: ["text" as CVFieldType, Validators.required],
    required: [false],
    placeholder: ["", Validators.required],
    uploadConfig: this.fb.nonNullable.group({
      allowedMimeTypes: [[] as string[]],
      maxFileSizeMB: [5],
      maxWidth: [0],
      maxHeight: [0],
      aspectRatio: [""],
      allowCrop: [false],
      multiple: [false],
    }),
  });

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes["field"] &&
      changes["field"].currentValue !== changes["field"].previousValue
    ) {
      if (this.field) {
        this.form.patchValue(this.field);
      } else {
        this.resetForm();
      }
    }

    // Also reset when dialog becomes visible without a field (create mode)
    if (
      changes["visible"] &&
      changes["visible"].currentValue === true &&
      !this.field
    ) {
      this.resetForm();
    }
  }

  get isUploadField() {
    return this.form.value.type === "image";
  }
  save() {
    if (this.form.invalid) return;

    const value = this.form.getRawValue();

    this.saveField.emit({
      field: value,
      originalName: this.field?.name,
    });

    this.close();
  }

  close() {
    this.resetForm();
    this.visibleChange.emit(false);
  }

  private resetForm() {
    this.form.reset({
      name: "",
      label: "",
      type: "text",
      required: false,
      placeholder: "",
      uploadConfig: {
        allowedMimeTypes: [],
        maxFileSizeMB: 5,
        maxWidth: 0,
        maxHeight: 0,
        aspectRatio: "",
        allowCrop: false,
        multiple: false,
      },
    });
  }
}
