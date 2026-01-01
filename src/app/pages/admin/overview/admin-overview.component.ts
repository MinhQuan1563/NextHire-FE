import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil, switchMap, startWith } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AdminDashboardService } from '../../../services/admin/admin-dashboard.service';
import { TimeRangeSelectorComponent } from '../../../shared/reusable-components/time-range-selector/time-range-selector.component';
import { UserStatisticsCardComponent } from './components/user-statistics-card/user-statistics-card.component';
import { JobStatisticsCardComponent } from './components/job-statistics-card/job-statistics-card.component';
import { CompanyStatisticsCardComponent } from './components/company-statistics-card/company-statistics-card.component';
import { ApplicationStatisticsCardComponent } from './components/application-statistics-card/application-statistics-card.component';
import {
  DashboardOverviewResponseDTO,
  TimeRangeFilterParams,
  TimeRangeEnum
} from '../../../models/admin';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MessageModule,
    TimeRangeSelectorComponent,
    UserStatisticsCardComponent,
    JobStatisticsCardComponent,
    CompanyStatisticsCardComponent,
    ApplicationStatisticsCardComponent
  ],
  templateUrl: './admin-overview.component.html',
  styleUrl: './admin-overview.component.scss'
})
export class AdminOverviewComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(AdminDashboardService);
  private readonly destroy$ = new Subject<void>();
  private autoRefreshSubscription?: Subscription;

  dashboardData = signal<DashboardOverviewResponseDTO | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  lastUpdated = signal<Date | null>(null);
  
  currentTimeRange = signal<TimeRangeFilterParams>({
    timeRange: TimeRangeEnum.THIS_MONTH
  });

  autoRefreshEnabled = signal<boolean>(false);
  autoRefreshInterval = 5 * 60 * 1000;

  lastUpdatedText = computed(() => {
    const updated = this.lastUpdated();
    if (!updated) return '';
    
    const now = new Date();
    const diff = now.getTime() - updated.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoRefresh();
  }

  onTimeRangeChange(params: TimeRangeFilterParams): void {
    this.currentTimeRange.set(params);
    this.loadDashboardData();
  }

  onRefresh(): void {
    this.loadDashboardData();
  }

  toggleAutoRefresh(): void {
    const enabled = !this.autoRefreshEnabled();
    this.autoRefreshEnabled.set(enabled);
    
    if (enabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  onRetry(): void {
    this.error.set(null);
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService.getOverview(this.currentTimeRange())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData.set(data);
          this.lastUpdated.set(new Date());
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load dashboard data');
          this.isLoading.set(false);
        }
      });
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    
    this.autoRefreshSubscription = interval(this.autoRefreshInterval)
      .pipe(
        startWith(0),
        switchMap(() => this.dashboardService.getOverview(this.currentTimeRange())),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.dashboardData.set(data);
          this.lastUpdated.set(new Date());
          this.error.set(null);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to refresh dashboard data');
        }
      });
  }

  private stopAutoRefresh(): void {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
      this.autoRefreshSubscription = undefined;
    }
  }
}
