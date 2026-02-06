import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticCardComponent, CardState } from '../../../../../shared/reusable-components/statistic-card/statistic-card.component';
import { LineChartComponent, LineChartData } from '../../../../../shared/reusable-components/charts/line-chart/line-chart.component';
import { BarChartComponent, BarChartData } from '../../../../../shared/reusable-components/charts/bar-chart/bar-chart.component';
import { ApplicationStatisticsResponseDTO } from '../../../../../models/admin';
import { CHART_COLORS } from '../../../../../shared/reusable-components/charts/chart-config';

@Component({
  selector: 'app-application-statistics-card',
  standalone: true,
  imports: [
    CommonModule,
    StatisticCardComponent,
    LineChartComponent,
    BarChartComponent
  ],
  templateUrl: './application-statistics-card.component.html',
  styleUrl: './application-statistics-card.component.scss'
})
export class ApplicationStatisticsCardComponent {
  @Input() set data(value: ApplicationStatisticsResponseDTO | null) {
    this.statisticsData.set(value);
  }

  @Input() set loading(value: boolean) {
    this.isLoading.set(value);
  }

  @Input() set error(value: string | null) {
    this.errorMessage.set(value);
  }

  statisticsData = signal<ApplicationStatisticsResponseDTO | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  cardState = computed<CardState>(() => {
    if (this.isLoading()) return 'loading';
    if (this.errorMessage()) return 'error';
    if (!this.statisticsData()) return 'empty';
    return 'success';
  });

  trendChartData = computed<LineChartData | null>(() => {
    const data = this.statisticsData();
    if (!data || !data.applicationTrend || data.applicationTrend.length === 0) {
      return null;
    }

    return {
      labels: data.applicationTrend.map(point => {
        const date = new Date(point.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Applications',
        data: data.applicationTrend.map(point => point.value),
        borderColor: CHART_COLORS.warning,
        backgroundColor: CHART_COLORS.warning + '20',
        tension: 0.4,
        fill: true
      }]
    };
  });

  statusChartData = computed<BarChartData | null>(() => {
    const data = this.statisticsData();
    if (!data || !data.applicationsByStatus || data.applicationsByStatus.length === 0) {
      return null;
    }

    return {
      labels: data.applicationsByStatus.map(item => item.category),
      datasets: [{
        label: 'Applications by Status',
        data: data.applicationsByStatus.map(item => item.count),
        backgroundColor: [
          '#F59E0B',
          '#3B82F6',
          '#8B5CF6',
          '#10B981',
          '#EF4444',
          '#6B7280'
        ]
      }]
    };
  });

  pendingPercentage = computed(() => {
    const data = this.statisticsData();
    if (!data || data.totalApplications === 0) return 0;
    return (data.pendingApplications / data.totalApplications * 100);
  });

  onRetry(): void {
    this.errorMessage.set(null);
  }
}
