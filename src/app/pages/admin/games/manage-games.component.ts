import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GameService } from '../../../services/admin/game.service';
import { GameDto, GetGamesInput } from '../../../models/admin/games';
import { GameFormComponent } from './game-form/game-form.component';

interface StatusOption {
  label: string;
  value: boolean | null;
}

@Component({
  selector: 'app-manage-games',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    InputSwitchModule,
    GameFormComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './manage-games.component.html',
  styleUrl: './manage-games.component.scss'
})
export class ManageGamesComponent implements OnInit, OnDestroy {
  private readonly gameService = inject(GameService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  games = signal<GameDto[]>([]);
  totalRecords = signal<number>(0);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  searchText = signal<string>('');
  selectedStatus = signal<boolean | null>(null);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);

  showGameDialog = signal<boolean>(false);
  selectedGame = signal<GameDto | null>(null);
  isEditMode = signal<boolean>(false);
  togglingGameCode = signal<string | null>(null);

  statusOptions: StatusOption[] = [
    { label: 'All Status', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  pageSizeOptions = [5, 10, 20, 50];

  hasGames = computed(() => this.games().length > 0);
  isSearching = computed(() => this.searchText().length > 0 || this.selectedStatus() !== null);

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadGames();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage.set(0);
        this.loadGames();
      });
  }

  loadGames(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const input: GetGamesInput = {
      searchText: this.searchText() || undefined,
      isActive: this.selectedStatus() ?? undefined,
      skipCount: this.currentPage() * this.pageSize(),
      maxResultCount: this.pageSize()
    };

    this.gameService.getGames(input)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.games.set(result.items);
          this.totalRecords.set(result.totalCount);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load games');
          this.isLoading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to load games'
          });
        }
      });
  }

  onSearchChange(value: string): void {
    this.searchText.set(value);
    this.searchSubject$.next(value);
  }

  onStatusChange(): void {
    this.currentPage.set(0);
    this.loadGames();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.currentPage.set(event.first / event.rows);
    this.pageSize.set(event.rows);
    this.loadGames();
  }

  clearFilters(): void {
    this.searchText.set('');
    this.selectedStatus.set(null);
    this.currentPage.set(0);
    this.loadGames();
  }

  openCreateDialog(): void {
    this.selectedGame.set(null);
    this.isEditMode.set(false);
    this.showGameDialog.set(true);
  }

  openEditDialog(game: GameDto): void {
    this.selectedGame.set(game);
    this.isEditMode.set(true);
    this.showGameDialog.set(true);
  }

  closeDialog(): void {
    this.showGameDialog.set(false);
    this.selectedGame.set(null);
    this.isEditMode.set(false);
  }

  onGameSaved(): void {
    this.closeDialog();
    this.loadGames();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: this.isEditMode() ? 'Game updated successfully' : 'Game created successfully'
    });
  }

  onToggleStatus(game: GameDto): void {
    this.togglingGameCode.set(game.gameCode);
    const newStatus = !game.isActive;

    this.gameService.updateGame(game.gameCode, { name: game.name, description: game.description, isActive: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const updatedGames = this.games().map(g =>
            g.gameCode === game.gameCode ? { ...g, isActive: newStatus } : g
          );
          this.games.set(updatedGames);
          this.togglingGameCode.set(null);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Game ${newStatus ? 'activated' : 'deactivated'} successfully`
          });
        },
        error: (err) => {
          this.togglingGameCode.set(null);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to update game status'
          });
        }
      });
  }

  confirmDelete(game: GameDto): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete "${game.name}"? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteGame(game)
    });
  }

  private deleteGame(game: GameDto): void {
    this.gameService.deleteGame(game.gameCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadGames();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Game deleted successfully'
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to delete game'
          });
        }
      });
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  isToggling(gameCode: string): boolean {
    return this.togglingGameCode() === gameCode;
  }

  viewGameDetails(game: GameDto): void {
    this.router.navigate(['/admin/games', game.gameCode]);
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
