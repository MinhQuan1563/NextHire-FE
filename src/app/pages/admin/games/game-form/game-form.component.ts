import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageModule } from 'primeng/message';
import { GameService } from '../../../../services/admin/game.service';
import { GameDto, CreateGameDto, UpdateGameDto } from '../../../../models/admin/games';
import { SanitizeInputDirective } from '../../../../shared/directives/sanitize-input.directive';

@Component({
  selector: 'app-game-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputSwitchModule,
    MessageModule,
    SanitizeInputDirective
  ],
  templateUrl: './game-form.component.html',
  styleUrl: './game-form.component.scss'
})
export class GameFormComponent implements OnInit, OnChanges {
  @Input() game: GameDto | null = null;
  @Input() isEditMode = false;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly gameService = inject(GameService);

  gameForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['game'] || changes['isEditMode']) {
      this.initForm();
    }
  }

  private initForm(): void {
    this.gameForm = this.fb.group({
      gameCode: [
        this.game?.gameCode || '',
        [Validators.required, Validators.maxLength(50)]
      ],
      name: [
        this.game?.name || '',
        [Validators.required, Validators.maxLength(50)]
      ],
      description: [
        this.game?.description || '',
        [Validators.required]
      ],
      isActive: [this.game?.isActive ?? true]
    });

    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.gameForm.invalid) {
      this.gameForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    if (this.isEditMode && this.game) {
      this.updateGame();
    } else {
      this.createGame();
    }
  }

  private createGame(): void {
    const createDto: CreateGameDto = {
      gameCode: this.gameForm.value.gameCode.trim(),
      name: this.gameForm.value.name.trim(),
      description: this.gameForm.value.description.trim()
    };

    this.gameService.createGame(createDto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.message || 'Failed to create game');
      }
    });
  }

  private updateGame(): void {
    if (!this.game) return;

    const updateDto: UpdateGameDto = {
      name: this.gameForm.value.name.trim(),
      description: this.gameForm.value.description.trim(),
      isActive: this.gameForm.value.isActive
    };

    this.gameService.updateGame(this.game.gameCode, updateDto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.message || 'Failed to update game');
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.gameForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.gameForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must not exceed ${maxLength} characters`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      name: 'Name',
      description: 'Description'
    };
    return labels[fieldName] || fieldName;
  }

  get nameCharCount(): number {
    return this.gameForm.get('name')?.value?.length || 0;
  }
}
