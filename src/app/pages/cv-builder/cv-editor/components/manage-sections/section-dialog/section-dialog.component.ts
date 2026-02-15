import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  CVSection,
  CVSectionField,
} from "@app/models/cv-builder/cv-template.model";
import { CvTemplateStore } from "@pages/cv-builder/cv-editor/stores/cv-template.store";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { v4 as uuidv4 } from "uuid";
import { FieldDialogComponent } from "../field-dialog/field-dialog.component";
import { FloatLabelModule } from "primeng/floatlabel";
import { FormErrorComponent } from "@shared/reusable-components/form-error/form-error.component";
import { isFieldInvalid } from "@shared/helpers/formUtil";
@Component({
  selector: "app-section-dialog",
  templateUrl: "./section-dialog.component.html",
  imports: [
    ReactiveFormsModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    TagModule,
    TableModule,
    FieldDialogComponent,
    FloatLabelModule,
    FormErrorComponent,
  ],
  standalone: true,
})
export class SectionDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() section?: CVSection;
  @Output() onClose = new EventEmitter<void>();

  fieldDialogVisible = false;
  editingField?: CVSectionField;
  isFieldInvalid = isFieldInvalid;
  form = this.fb.nonNullable.group({
    name: ["", Validators.required],
    description: [""],
  });

  private localFields = signal<CVSectionField[]>([]);
  fields = computed(() => this.localFields());

  constructor(
    private fb: FormBuilder,
    public store: CvTemplateStore,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes["section"] &&
      changes["section"].currentValue !== changes["section"].previousValue
    ) {
      if (this.section) {
        this.form.patchValue(this.section);
        this.localFields.set(
          this.section.fields ? [...this.section.fields] : [],
        );
      } else {
        this.resetDialog();
      }
    }

    // Also reset when dialog visibility changes to true without a section
    if (
      changes["visible"] &&
      changes["visible"].currentValue === true &&
      !this.section
    ) {
      this.resetDialog();
    }
  }

  saveSection() {
    if (this.form.invalid) return;

    const fields = this.localFields();

    if (this.section) {
      this.store.updateSection(this.section.id, {
        ...this.form.getRawValue(),
        fields,
      });
    } else {
      this.store.addSection({
        id: uuidv4(),
        fields,
        ...this.form.getRawValue(),
      });
    }

    this.close();
  }

  // ===== Field actions =====
  createField() {
    this.editingField = undefined;
    this.fieldDialogVisible = true;
  }

  editField(field: CVSectionField) {
    this.editingField = field;
    this.fieldDialogVisible = true;
  }

  onFieldSaved(event: { field: CVSectionField; originalName?: string }) {
    const { field, originalName } = event;
    this.localFields.update((fields) => {
      const hasExisting = fields.some(
        (f) => f.name === (originalName ?? field.name),
      );

      if (hasExisting) {
        return fields.map((f) =>
          f.name === (originalName ?? field.name) ? field : f,
        );
      }

      return [...fields, field];
    });

    if (this.section) {
      if (originalName) {
        this.store.updateSectionField(this.section.id, originalName, field);
      } else {
        this.store.addFieldToSection(this.section.id, field);
      }
    }
  }

  deleteField(field: CVSectionField) {
    this.localFields.update((fields) =>
      fields.filter((f) => f.name !== field.name),
    );

    if (this.section) {
      this.store.removeSectionField(this.section.id, field.name);
    }
  }

  close() {
    this.resetDialog();
    this.onClose.emit();
  }

  private resetDialog() {
    this.form.reset({
      name: "",
      description: "",
    });
    this.localFields.set([]);
    this.editingField = undefined;
    this.fieldDialogVisible = false;
  }
}
