import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { ChipModule } from 'primeng/chip';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CvTemplateService } from '../../../services/cv-builder/cv-template.service';
import { CvTemplate, CvTemplateType } from '../../../models/cv-builder/cv-template.model';

interface DropdownOption {
  label: string;
  value: any;
}

interface ViewModeOption {
  label: string;
  value: string;
  icon: string;
}

/**
 * ManageCvTemplatesComponent
 * 
 * Admin dashboard component for managing CV templates.
 * Provides CRUD operations, filtering, sorting, and pagination.
 * 
 * Features:
 * - Table and Grid view modes with localStorage persistence
 * - Search with 300ms debouncing
 * - Filter by template type and published status
 * - Sortable columns with server-side sorting
 * - Pagination with configurable page sizes
 * - Optimistic updates for publish/unpublish actions
 * - Skeleton loaders for loading states
 * - WCAG AA accessible with ARIA labels
 * 
 * @example
 * Route: /admin/cv-templates
 */
@Component({
  selector: 'app-manage-cv-templates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressSpinnerModule,
    PaginatorModule,
    ChipModule,
    SelectButtonModule,
    SkeletonModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './manage-cv-templates.component.html',
  styleUrls: ['./manage-cv-templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageCvTemplatesComponent implements OnInit, OnDestroy {
  templates: CvTemplate[] = [];
  loading = false;
  error: string | null = null;
  
  // Track loading state for individual template actions
  actionLoading: Map<string, boolean> = new Map();
  
  // Skeleton rows for loading state
  skeletonRows = Array(5).fill({});

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  searchText = '';
  selectedType: CvTemplateType | null = null;
  selectedPublishedStatus: boolean | null = null;
  sortField = '';
  sortOrder = -1;

  viewMode: 'table' | 'grid' = 'table';

  templateTypeOptions: DropdownOption[] = [
    { label: 'Resume', value: CvTemplateType.Resume },
    { label: 'Cover Letter', value: CvTemplateType.CoverLetter },
    { label: 'Portfolio', value: CvTemplateType.Portfolio }
  ];

  publishedStatusOptions: DropdownOption[] = [
    { label: 'Published', value: true },
    { label: 'Unpublished', value: false }
  ];

  viewModeOptions: ViewModeOption[] = [
    { label: 'Table', value: 'table', icon: 'pi pi-table' },
    { label: 'Grid', value: 'grid', icon: 'pi pi-th-large' }
  ];

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private cvTemplateService: CvTemplateService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadTemplates();
      });
  }

  ngOnInit(): void {
    this.loadViewPreference();
    this.loadTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads templates from the API with current filter, sort, and pagination settings.
   * Handles loading state and error display.
   */
  loadTemplates(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    const input = {
      skipCount: (this.currentPage - 1) * this.pageSize,
      maxResultCount: this.pageSize,
      filter: this.searchText || undefined,
      type: this.selectedType !== null ? this.selectedType : undefined,
      isPublished: this.selectedPublishedStatus !== null ? this.selectedPublishedStatus : undefined,
      sorting: this.getSortingString()
    };

    this.cvTemplateService.getCvTemplates(input)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.templates = result.items;
          this.totalCount = result.totalCount;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load templates. Please try again.';
          this.loading = false;
          this.cdr.markForCheck();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.error || undefined
          });
        }
      });
  }

  /**
   * TrackBy function for template list to optimize rendering
   */
  trackByTemplateCode(index: number, template: CvTemplate): string {
    return template.templateCode;
  }

  onSearchChange(): void {
    this.searchSubject$.next(this.searchText);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadTemplates();
  }

  onLazyLoad(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    
    if (event.sortField) {
      this.sortField = event.sortField;
      this.sortOrder = event.sortOrder;
    }
    
    this.loadTemplates();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadTemplates();
  }

  getSortingString(): string {
    // const direction = this.sortOrder === 1 ? 'asc' : 'desc';
    // return `${this.sortField} ${direction}`;

    return ''
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/cv-template/new']);
  }

  navigateToEdit(templateCode: string): void {
    this.router.navigate(['/admin/cv-template', templateCode]);
  }

  /**
   * Toggles the publish status of a template with optimistic update.
   * Reverts on API error.
   * @param template - The template to publish/unpublish
   */
  togglePublishStatus(template: CvTemplate): void {
    const actionKey = `publish-${template.templateCode}`;
    if (this.actionLoading.get(actionKey)) {
      return;
    }
    
    const action = template.isPublished ? 'unpublish' : 'publish';
    const service = template.isPublished 
      ? this.cvTemplateService.unpublishTemplate(template.templateCode)
      : this.cvTemplateService.publishTemplate(template.templateCode);

    const originalStatus = template.isPublished;
    template.isPublished = !template.isPublished;
    this.actionLoading.set(actionKey, true);
    this.cdr.markForCheck();

    service.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.actionLoading.set(actionKey, false);
        this.cdr.markForCheck();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Template ${action}ed successfully`
        });
      },
      error: (err) => {
        template.isPublished = originalStatus;
        this.actionLoading.set(actionKey, false);
        this.cdr.markForCheck();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || `Failed to ${action} template`
        });
      }
    });
  }
  
  isActionLoading(templateCode: string, action: string): boolean {
    return this.actionLoading.get(`${action}-${templateCode}`) || false;
  }

  /**
   * Shows confirmation dialog before deleting a template.
   * @param template - The template to delete
   */
  confirmDelete(template: CvTemplate): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteTemplate(template);
      }
    });
  }

  /**
   * Deletes a template via API and refreshes the list.
   * @param template - The template to delete
   */
  deleteTemplate(template: CvTemplate): void {
    const actionKey = `delete-${template.templateCode}`;
    this.actionLoading.set(actionKey, true);
    this.cdr.markForCheck();
    
    this.cvTemplateService.deleteTemplate(template.templateCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.actionLoading.set(actionKey, false);
          this.cdr.markForCheck();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Template deleted successfully'
          });
          this.loadTemplates();
        },
        error: (err) => {
          this.actionLoading.set(actionKey, false);
          this.cdr.markForCheck();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to delete template'
          });
        }
      });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedType = null;
    this.selectedPublishedStatus = null;
    this.currentPage = 1;
    this.loadTemplates();
  }

  clearSearch(): void {
    this.searchText = '';
    this.onFilterChange();
  }

  clearTypeFilter(): void {
    this.selectedType = null;
    this.onFilterChange();
  }

  clearPublishedFilter(): void {
    this.selectedPublishedStatus = null;
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchText || this.selectedType !== null || this.selectedPublishedStatus !== null);
  }

  getTypeLabel(type: CvTemplateType): string {
    switch (type) {
      case CvTemplateType.Resume:
        return 'Resume';
      case CvTemplateType.CoverLetter:
        return 'Cover Letter';
      case CvTemplateType.Portfolio:
        return 'Portfolio';
      default:
        return 'Unknown';
    }
  }

  getTypeSeverity(type: CvTemplateType): 'info' | 'success' | 'warning' | 'danger' {
    switch (type) {
      case CvTemplateType.Resume:
        return 'info';
      case CvTemplateType.CoverLetter:
        return 'success';
      case CvTemplateType.Portfolio:
        return 'warning';
      default:
        return 'info';
    }
  }

  loadViewPreference(): void {
    const savedView = localStorage.getItem('cvTemplateViewMode');
    if (savedView === 'table' || savedView === 'grid') {
      this.viewMode = savedView;
    }
  }

  saveViewPreference(): void {
    localStorage.setItem('cvTemplateViewMode', this.viewMode);
  }
}
