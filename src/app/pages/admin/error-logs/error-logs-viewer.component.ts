import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { ErrorLogService } from '../../../services/admin';
import {
  ParsedErrorLog,
  ErrorLogFilterParams,
  LOG_LEVEL_OPTIONS,
  PAGE_SIZE_OPTIONS,
  LogLevelOption
} from '../../../models/admin';

@Component({
  selector: 'app-error-logs-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    DialogModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    MenuModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './error-logs-viewer.component.html',
  styleUrl: './error-logs-viewer.component.scss'
})
export class ErrorLogsViewerComponent implements OnInit {
  private readonly errorLogService = inject(ErrorLogService);
  private readonly messageService = inject(MessageService);

  // Copy feedback
  copySuccess = signal<boolean>(false);

  // Data
  logs = signal<ParsedErrorLog[]>([]);
  totalRecords = signal<number>(0);
  selectedLog = signal<ParsedErrorLog | null>(null);

  // Loading states
  loading = signal<boolean>(false);
  exporting = signal<boolean>(false);
  loadingDetail = signal<boolean>(false);

  // Error state
  errorMessage = signal<string | null>(null);

  // Filter state
  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);
  selectedLevel = signal<string>('');
  sourceFilter = signal<string>('');

  // Pagination state
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);

  // Options
  readonly logLevelOptions = LOG_LEVEL_OPTIONS;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS.map(size => ({ label: `${size}`, value: size }));

  // Detail modal
  detailModalVisible = signal<boolean>(false);

  // Export menu items
  exportMenuItems: MenuItem[] = [
    {
      label: 'Export as CSV',
      icon: 'pi pi-file',
      command: () => this.exportToCsv()
    },
    {
      label: 'Export as JSON',
      icon: 'pi pi-file-export',
      command: () => this.exportToJson()
    }
  ];

  // Computed values
  showingFrom = computed(() => {
    const total = this.totalRecords();
    if (total === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  showingTo = computed(() => {
    const total = this.totalRecords();
    const to = this.currentPage() * this.pageSize();
    return Math.min(to, total);
  });

  totalPages = computed(() => {
    return Math.ceil(this.totalRecords() / this.pageSize());
  });

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const params = this.buildFilterParams();

    this.errorLogService.getErrorLogs(params).subscribe({
      next: (response) => {
        const parsedLogs = this.errorLogService.parseErrorLogs(response.items || []);
        this.logs.set(parsedLogs);
        this.totalRecords.set(response.totalCount || 0);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Failed to load error logs');
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadLogs();
  }

  clearFilters(): void {
    this.fromDate.set(null);
    this.toDate.set(null);
    this.selectedLevel.set('');
    this.sourceFilter.set('');
    this.currentPage.set(1);
    this.loadLogs();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadLogs();
    }
  }

  onPageSizeChange(): void {
    this.currentPage.set(1);
    this.loadLogs();
  }

  viewLogDetail(log: ParsedErrorLog): void {
    this.selectedLog.set(log);
    this.detailModalVisible.set(true);
  }

  closeDetailModal(): void {
    this.detailModalVisible.set(false);
    this.selectedLog.set(null);
  }

  copyToClipboard(): void {
    const log = this.selectedLog();
    if (log) {
      navigator.clipboard.writeText(log.rawMetadata).then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Copied',
          detail: 'JSON copied to clipboard',
          life: 2000
        });
      }).catch(err => {
        console.error('Failed to copy:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Copy Failed',
          detail: 'Failed to copy to clipboard',
          life: 3000
        });
      });
    }
  }

  async exportToCsv(): Promise<void> {
    await this.exportLogs('csv');
  }

  async exportToJson(): Promise<void> {
    await this.exportLogs('json');
  }

  private async exportLogs(format: 'csv' | 'json'): Promise<void> {
    this.exporting.set(true);

    const params = this.buildFilterParams();
    params.PageSize = 10000; // Get all filtered logs for export
    params.PageStart = 1;

    this.errorLogService.getErrorLogs(params).subscribe({
      next: (response) => {
        const parsedLogs = this.errorLogService.parseErrorLogs(response.items || []);
        
        if (format === 'csv') {
          const content = this.errorLogService.exportToCsv(parsedLogs);
          const filename = this.errorLogService.generateExportFilename('csv');
          this.errorLogService.downloadFile(content, filename, 'text/csv');
          this.messageService.add({
            severity: 'success',
            summary: 'Export Complete',
            detail: `Exported ${parsedLogs.length} logs to CSV`,
            life: 3000
          });
        } else {
          const content = this.errorLogService.exportToJson(parsedLogs);
          const filename = this.errorLogService.generateExportFilename('json');
          this.errorLogService.downloadFile(content, filename, 'application/json');
          this.messageService.add({
            severity: 'success',
            summary: 'Export Complete',
            detail: `Exported ${parsedLogs.length} logs to JSON`,
            life: 3000
          });
        }
        
        this.exporting.set(false);
      },
      error: (error) => {
        this.errorMessage.set(`Export failed: ${error.message}`);
        this.exporting.set(false);
      }
    });
  }

  getLogLevelSeverity(level: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    const option = this.logLevelOptions.find(opt => opt.value === level);
    return option?.severity || 'secondary';
  }

  truncateMessage(message: string, maxLength: number = 100): string {
    if (!message) return '';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  }

  formatDate(date: Date): string {
    return date.toLocaleString();
  }

  formatJsonForDisplay(json: string): string {
    try {
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return json;
    }
  }

  private buildFilterParams(): ErrorLogFilterParams {
    const params: ErrorLogFilterParams = {
      PageSize: this.pageSize(),
      PageStart: this.currentPage()
    };

    const from = this.fromDate();
    if (from) {
      params.FromDate = from.toISOString();
    }

    const to = this.toDate();
    if (to) {
      params.ToDate = to.toISOString();
    }

    const level = this.selectedLevel();
    if (level) {
      params.Level = level;
    }

    const source = this.sourceFilter();
    if (source) {
      params.Source = source;
    }

    return params;
  }
}
