import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { FormErrorComponent } from '../../form-error/form-error.component';
import { SkillLevel, SkillLevelLabels } from '../../../../models/user-profile/skill-level.enum';

/**
 * Field configuration for JSON field editor
 */
export interface JsonFieldConfig {
  type: 'skills' | 'experience' | 'education' | 'personalProjects' | 'savedJobs';
  label: string;
  addButtonLabel?: string;
  emptyMessage?: string;
}

@Component({
  selector: 'app-json-field-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    CalendarModule,
    CheckboxModule,
    DropdownModule,
    FormErrorComponent
  ],
  templateUrl: './json-field-editor.component.html',
  styleUrls: ['./json-field-editor.component.scss']
})
export class JsonFieldEditorComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);

  /**
   * Field configuration
   */
  @Input() config!: JsonFieldConfig;

  /**
   * Initial JSON data (string format from API)
   */
  @Input() initialValue: string | null = null;

  /**
   * Emits the JSON string when form value changes
   */
  @Output() valueChange = new EventEmitter<string>();

  /**
   * Form array for managing dynamic fields
   */
  formArray = this.fb.array<FormGroup>([]);

  /**
   * Skill level options
   */
  skillLevelOptions = Object.keys(SkillLevelLabels).map(key => ({
    label: SkillLevelLabels[key as SkillLevel],
    value: key
  }));

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && !changes['initialValue'].firstChange) {
      this.initializeForm();
    }
  }

  /**
   * Initialize form with data
   */
  private initializeForm(): void {
    this.formArray.clear();
    
    if (this.initialValue) {
      try {
        const parsed = JSON.parse(this.initialValue);
        const items = this.getItemsFromParsed(parsed);
        
        items.forEach(item => {
          this.addItem(item);
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  }

  /**
   * Get items array from parsed JSON based on config type
   */
  private getItemsFromParsed(parsed: any): any[] {
    switch (this.config.type) {
      case 'skills':
        return parsed.skills || [];
      case 'experience':
        return parsed.experiences || [];
      case 'education':
        return parsed.educations || [];
      case 'personalProjects':
        return parsed.projects || [];
      case 'savedJobs':
        return parsed.savedJobs || [];
      default:
        return [];
    }
  }

  /**
   * Add a new item to the form array
   */
  addItem(item?: any): void {
    const formGroup = this.createFormGroup(item);
    this.formArray.push(formGroup);
    this.emitValue();
  }

  /**
   * Remove an item from the form array
   */
  removeItem(index: number): void {
    this.formArray.removeAt(index);
    this.emitValue();
  }

  /**
   * Create form group based on config type
   */
  private createFormGroup(item?: any): FormGroup {
    switch (this.config.type) {
      case 'skills':
        return this.fb.group({
          name: [item?.name || '', [Validators.required, Validators.maxLength(100)]],
          level: [item?.level || 'beginner', Validators.required],
          yearsOfExperience: [item?.yearsOfExperience || null, [Validators.min(0)]]
        });
      case 'experience':
        const experienceGroup = this.fb.group({
          company: [item?.company || '', [Validators.required, Validators.maxLength(200)]],
          position: [item?.position || '', [Validators.required, Validators.maxLength(200)]],
          startDate: [item?.startDate ? new Date(item.startDate) : null, Validators.required],
          endDate: [item?.endDate ? new Date(item.endDate) : null],
          isCurrent: [item?.isCurrent || false],
          description: [item?.description || '', Validators.maxLength(2000)],
          achievements: this.fb.array(
            (item?.achievements || []).map((a: string) => 
              this.fb.control(a, [Validators.maxLength(500)])
            )
          )
        }, { validators: this.dateRangeValidator.bind(this) });

        // Clear endDate when isCurrent is checked
        experienceGroup.get('isCurrent')?.valueChanges.subscribe(isCurrent => {
          if (isCurrent) {
            experienceGroup.get('endDate')?.setValue(null, { emitEvent: false });
          }
        });

        return experienceGroup;
      case 'education':
        const educationGroup = this.fb.group({
          institution: [item?.institution || '', [Validators.required, Validators.maxLength(200)]],
          degree: [item?.degree || '', [Validators.required, Validators.maxLength(200)]],
          fieldOfStudy: [item?.fieldOfStudy || '', Validators.maxLength(200)],
          startDate: [item?.startDate ? new Date(item.startDate) : null, Validators.required],
          endDate: [item?.endDate ? new Date(item.endDate) : null],
          isCurrent: [item?.isCurrent || false],
          grade: [item?.grade || '', Validators.maxLength(50)],
          description: [item?.description || '', Validators.maxLength(1000)]
        }, { validators: this.dateRangeValidator.bind(this) });

        // Clear endDate when isCurrent is checked
        educationGroup.get('isCurrent')?.valueChanges.subscribe(isCurrent => {
          if (isCurrent) {
            educationGroup.get('endDate')?.setValue(null, { emitEvent: false });
          }
        });

        return educationGroup;
      case 'personalProjects':
        const personalProjectsGroup = this.fb.group({
          name: [item?.name || '', [Validators.required, Validators.maxLength(200)]],
          description: [item?.description || '', Validators.maxLength(2000)],
          technologies: this.fb.array(
            (item?.technologies || []).map((t: string) => 
              this.fb.control(t, [Validators.maxLength(100)])
            )
          ),
          startDate: [item?.startDate ? new Date(item.startDate) : null, Validators.required],
          endDate: [item?.endDate ? new Date(item.endDate) : null],
          isCurrent: [item?.isCurrent || false],
          url: [item?.url || '', Validators.pattern(/^https?:\/\/.+/)],
          githubUrl: [item?.githubUrl || '', Validators.pattern(/^https?:\/\/.+/)]
        }, { validators: this.dateRangeValidator.bind(this) });

        // Clear endDate when isCurrent is checked
        personalProjectsGroup.get('isCurrent')?.valueChanges.subscribe(isCurrent => {
          if (isCurrent) {
            personalProjectsGroup.get('endDate')?.setValue(null, { emitEvent: false });
          }
        });

        return personalProjectsGroup;
      case 'savedJobs':
        return this.fb.group({
          jobCode: [item?.jobCode || '', Validators.required],
          savedDate: [item?.savedDate ? new Date(item.savedDate) : new Date(), Validators.required]
        });
      default:
        return this.fb.group({});
    }
  }

  /**
   * Emit JSON string value
   */
  private emitValue(): void {
    // Validate form before serialization
    if (!this.validateFormArray()) {
      // If validation fails, emit empty string or null
      this.valueChange.emit('');
      return;
    }

    const items = this.formArray.value.map((item, index) => {
      const formGroup = this.formArray.at(index) as FormGroup;
      return this.serializeFormGroup(formGroup, item);
    });

    const jsonObject = this.createJsonObject(items);
    
    // Validate JSON structure before emitting
    if (!this.validateJsonStructure(jsonObject)) {
      // If structure validation fails, emit empty string
      this.valueChange.emit('');
      return;
    }

    const jsonString = JSON.stringify(jsonObject);
    this.valueChange.emit(jsonString);
  }

  /**
   * Serialize form group to item object
   */
  private serializeFormGroup(formGroup: FormGroup, item: any): any {
    const serialized: any = {};

    // Get all form controls and serialize them
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (!control) return;

      if (control instanceof FormArray) {
        // Handle form arrays (achievements, technologies)
        const arrayValue = control.value.filter((val: string) => val?.trim());
        if (arrayValue.length > 0 || key === 'achievements' || key === 'technologies') {
          serialized[key] = arrayValue;
        }
      } else if (control.value instanceof Date) {
        // Handle date fields
        if (this.config.type === 'savedJobs' && key === 'savedDate') {
          serialized[key] = control.value.toISOString();
        } else {
          serialized[key] = this.formatDateForApi(control.value);
        }
      } else if (key === 'isCurrent') {
        serialized[key] = control.value || false;
      } else if (control.value !== null && control.value !== '') {
        serialized[key] = control.value;
      } else if (key === 'endDate' && this.config.type !== 'savedJobs') {
        // endDate can be null for current positions
        serialized[key] = null;
      }
    });

    return serialized;
  }

  /**
   * Format date for API (YYYY-MM-DD)
   */
  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Create JSON object based on config type
   */
  private createJsonObject(items: any[]): any {
    switch (this.config.type) {
      case 'skills':
        return { skills: items };
      case 'experience':
        return { experiences: items };
      case 'education':
        return { educations: items };
      case 'personalProjects':
        return { projects: items };
      case 'savedJobs':
        return { savedJobs: items };
      default:
        return {};
    }
  }

  /**
   * Get form array for nested arrays (achievements, technologies)
   */
  getNestedArray(index: number, fieldName: string): FormArray {
    const formGroup = this.formArray.at(index) as FormGroup;
    return formGroup.get(fieldName) as FormArray;
  }

  /**
   * Add item to nested array
   */
  addNestedItem(index: number, fieldName: string): void {
    const array = this.getNestedArray(index, fieldName);
    const maxLength = fieldName === 'achievements' ? 500 : 100;
    array.push(this.fb.control('', [Validators.maxLength(maxLength)]));
    this.emitValue();
  }

  /**
   * Remove item from nested array
   */
  removeNestedItem(index: number, fieldName: string, nestedIndex: number): void {
    const array = this.getNestedArray(index, fieldName);
    array.removeAt(nestedIndex);
    this.emitValue();
  }

  /**
   * Handle form value changes
   */
  onFormChange(): void {
    this.emitValue();
  }

  /**
   * Check if field is required
   */
  isRequired(fieldName: string): boolean {
    const firstGroup = this.formArray.at(0) as FormGroup | null;
    if (!firstGroup) return false;
    const control = firstGroup.get(fieldName);
    return control ? control.hasError('required') && control.touched : false;
  }

  /**
   * Date range validator: endDate must be after startDate
   */
  private dateRangeValidator(control: AbstractControl): { [key: string]: any } | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;
    const isCurrent = control.get('isCurrent')?.value;

    // If current position, endDate should be null
    if (isCurrent && endDate) {
      return { currentPositionHasEndDate: true };
    }

    // If not current and both dates exist, validate range
    if (!isCurrent && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (end < start) {
        return { dateRangeInvalid: true };
      }
    }

    return null;
  }

  /**
   * Handle isCurrent checkbox change for experience/education/projects
   */
  onIsCurrentChange(index: number): void {
    const formGroup = this.formArray.at(index) as FormGroup;
    const isCurrent = formGroup.get('isCurrent')?.value;
    
    if (isCurrent) {
      formGroup.get('endDate')?.setValue(null);
    }
    
    this.onFormChange();
  }

  /**
   * Validate form array - check if all form groups are valid
   */
  private validateFormArray(): boolean {
    // Check if form array is valid
    if (!this.formArray.valid) {
      return false;
    }

    // Check each form group
    for (let i = 0; i < this.formArray.length; i++) {
      const formGroup = this.formArray.at(i) as FormGroup;
      if (!formGroup.valid) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate JSON structure before serialization (FR-EP-020)
   */
  private validateJsonStructure(jsonObject: any): boolean {
    if (!jsonObject || typeof jsonObject !== 'object') {
      return false;
    }

    try {
      switch (this.config.type) {
        case 'skills':
          return this.validateSkillsJson(jsonObject);
        case 'experience':
          return this.validateExperienceJson(jsonObject);
        case 'education':
          return this.validateEducationJson(jsonObject);
        case 'personalProjects':
          return this.validatePersonalProjectsJson(jsonObject);
        case 'savedJobs':
          return this.validateSavedJobsJson(jsonObject);
        default:
          return true;
      }
    } catch (error) {
      console.error('Error validating JSON structure:', error);
      return false;
    }
  }

  /**
   * Validate Skills JSON structure
   */
  private validateSkillsJson(json: any): boolean {
    if (!json.skills || !Array.isArray(json.skills)) {
      return false;
    }

    for (const skill of json.skills) {
      if (!skill.name || typeof skill.name !== 'string' || skill.name.length > 100) {
        return false;
      }
      if (!skill.level || !['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level)) {
        return false;
      }
      if (skill.yearsOfExperience !== undefined && (typeof skill.yearsOfExperience !== 'number' || skill.yearsOfExperience < 0)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate Experience JSON structure
   */
  private validateExperienceJson(json: any): boolean {
    if (!json.experiences || !Array.isArray(json.experiences)) {
      return false;
    }

    for (const exp of json.experiences) {
      if (!exp.company || typeof exp.company !== 'string' || exp.company.length > 200) {
        return false;
      }
      if (!exp.position || typeof exp.position !== 'string' || exp.position.length > 200) {
        return false;
      }
      if (!exp.startDate || typeof exp.startDate !== 'string' || !this.isValidDateFormat(exp.startDate)) {
        return false;
      }
      if (exp.isCurrent && exp.endDate !== null) {
        return false;
      }
      if (!exp.isCurrent && exp.endDate !== null && !this.isValidDateFormat(exp.endDate)) {
        return false;
      }
      if (typeof exp.isCurrent !== 'boolean') {
        return false;
      }
      if (exp.description && (typeof exp.description !== 'string' || exp.description.length > 2000)) {
        return false;
      }
      if (exp.achievements && Array.isArray(exp.achievements)) {
        for (const achievement of exp.achievements) {
          if (typeof achievement !== 'string' || achievement.length > 500) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Validate Education JSON structure
   */
  private validateEducationJson(json: any): boolean {
    if (!json.educations || !Array.isArray(json.educations)) {
      return false;
    }

    for (const edu of json.educations) {
      if (!edu.institution || typeof edu.institution !== 'string' || edu.institution.length > 200) {
        return false;
      }
      if (!edu.degree || typeof edu.degree !== 'string' || edu.degree.length > 200) {
        return false;
      }
      if (edu.fieldOfStudy && (typeof edu.fieldOfStudy !== 'string' || edu.fieldOfStudy.length > 200)) {
        return false;
      }
      if (!edu.startDate || typeof edu.startDate !== 'string' || !this.isValidDateFormat(edu.startDate)) {
        return false;
      }
      if (edu.isCurrent && edu.endDate !== null) {
        return false;
      }
      if (!edu.isCurrent && edu.endDate !== null && !this.isValidDateFormat(edu.endDate)) {
        return false;
      }
      if (typeof edu.isCurrent !== 'boolean') {
        return false;
      }
      if (edu.grade && (typeof edu.grade !== 'string' || edu.grade.length > 50)) {
        return false;
      }
      if (edu.description && (typeof edu.description !== 'string' || edu.description.length > 1000)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate Personal Projects JSON structure
   */
  private validatePersonalProjectsJson(json: any): boolean {
    if (!json.projects || !Array.isArray(json.projects)) {
      return false;
    }

    for (const project of json.projects) {
      if (!project.name || typeof project.name !== 'string' || project.name.length > 200) {
        return false;
      }
      if (project.description && (typeof project.description !== 'string' || project.description.length > 2000)) {
        return false;
      }
      if (project.technologies && Array.isArray(project.technologies)) {
        for (const tech of project.technologies) {
          if (typeof tech !== 'string' || tech.length > 100) {
            return false;
          }
        }
      }
      if (!project.startDate || typeof project.startDate !== 'string' || !this.isValidDateFormat(project.startDate)) {
        return false;
      }
      if (project.isCurrent && project.endDate !== null) {
        return false;
      }
      if (!project.isCurrent && project.endDate !== null && !this.isValidDateFormat(project.endDate)) {
        return false;
      }
      if (typeof project.isCurrent !== 'boolean') {
        return false;
      }
      if (project.url && !this.isValidUrl(project.url)) {
        return false;
      }
      if (project.githubUrl && !this.isValidUrl(project.githubUrl)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate Saved Jobs JSON structure
   */
  private validateSavedJobsJson(json: any): boolean {
    if (!json.savedJobs || !Array.isArray(json.savedJobs)) {
      return false;
    }

    for (const job of json.savedJobs) {
      if (!job.jobCode || typeof job.jobCode !== 'string') {
        return false;
      }
      if (!job.savedDate || typeof job.savedDate !== 'string' || !this.isValidIsoDate(job.savedDate)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if date string is in YYYY-MM-DD format
   */
  private isValidDateFormat(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Check if date string is valid ISO 8601 format
   */
  private isValidIsoDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Check if string is valid URL format
   */
  private isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

