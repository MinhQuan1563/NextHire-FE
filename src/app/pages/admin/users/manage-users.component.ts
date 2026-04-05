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
import { AvatarModule } from 'primeng/avatar';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AppUserService } from '@app/services/app-user/app-user.service';
import { AppUser, GetUsersInput } from '@app/models/app-user/app-user.model';

interface StatusOption {
  label: string;
  value: boolean | null;
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    InputTextModule, DropdownModule, TagModule, TooltipModule,
    ConfirmDialogModule, ToastModule, DialogModule, InputSwitchModule, AvatarModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss'
})
export class ManageUsersComponent implements OnInit, OnDestroy {
  private readonly appUserService = inject(AppUserService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  users = signal<AppUser[]>([]);
  totalRecords = signal<number>(0);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  searchText = signal<string>('');
  
  selectedLockStatus = signal<boolean | null>(null); 
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);

  showUserDialog = signal<boolean>(false);
  selectedUser = signal<AppUser | null>(null);
  isEditMode = signal<boolean>(false);
  togglingUserCode = signal<string | null>(null);

  statusOptions: StatusOption[] = [
    { label: 'All Status', value: null },
    { label: 'Active', value: false }, 
    { label: 'Locked', value: true }
  ];

  pageSizeOptions = [5, 10, 20, 50];

  hasUsers = computed(() => this.users().length > 0);
  
  isSearching = computed(() => this.searchText().length > 0 || this.selectedLockStatus() !== null);

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage.set(0);
        this.loadUsers();
      });
  }

  loadUsers(): void {
    if (this.isLoading()) return;
    
    this.isLoading.set(true);
    this.error.set(null);

    const input: GetUsersInput = {
      filter: this.searchText() || undefined,
      isLocked: this.selectedLockStatus() ?? undefined, 
      skipCount: this.currentPage() * this.pageSize(),
      maxResultCount: this.pageSize()
    };

    this.appUserService.getUsers(input)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.users.set(result.items);
          this.totalRecords.set(result.totalCount);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load users');
          this.isLoading.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load user list' });
        }
      });
  }

  // Switch Khóa/Mở khóa tài khoản người dùng
  onToggleStatus(user: AppUser): void {
    this.togglingUserCode.set(user.userCode);
    
    const newLockStatus = !user.isLocked;

    this.appUserService.toggleLockUser(user.userCode, newLockStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const updatedUsers = this.users().map(u =>
            u.userCode === user.userCode ? { ...u, isLocked: newLockStatus } : u
          );
          this.users.set(updatedUsers);
          this.togglingUserCode.set(null);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `User account has been ${newLockStatus ? 'locked' : 'unlocked'}.`
          });
        },
        error: (err) => {
          this.togglingUserCode.set(null);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user status.' });
        }
      });
  }

  onSearchChange(value: string): void {
    this.searchText.set(value);
    this.searchSubject$.next(value);
  }

  onStatusChange(): void {
    this.currentPage.set(0);
    this.loadUsers();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.currentPage.set(event.first / event.rows);
    this.pageSize.set(event.rows);
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchText.set('');
    this.selectedLockStatus.set(null);
    this.currentPage.set(0);
    this.loadUsers();
  }

  openCreateDialog(): void {
    this.selectedUser.set(null);
    this.isEditMode.set(false);
    this.showUserDialog.set(true);
  }

  openEditDialog(user: AppUser): void {
    this.selectedUser.set(user);
    this.isEditMode.set(true);
    this.showUserDialog.set(true);
  }

  closeDialog(): void {
    this.showUserDialog.set(false);
    this.selectedUser.set(null);
    this.isEditMode.set(false);
  }

  confirmDelete(user: AppUser): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete account "${user.fullName}"? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteUser(user)
    });
  }

  private deleteUser(user: AppUser): void {
    this.messageService.add({ severity: 'info', summary: 'Mock', detail: 'API Delete User is not implemented yet' });
  }

  isToggling(userCode: string): boolean {
    return this.togglingUserCode() === userCode;
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warning' | 'danger' {
    if (!role) return 'info';
    switch (role.toLowerCase()) {
      case 'admin': return 'danger';
      case 'recruiter': return 'warning';
      default: return 'success';
    }
  }
}