import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticCardComponent, CardState } from '../../../../../shared/reusable-components/statistic-card/statistic-card.component';
import { LineChartComponent, LineChartData } from '../../../../../shared/reusable-components/charts/line-chart/line-chart.component';
import { DonutChartComponent, DonutChartData } from '../../../../../shared/reusable-components/charts/donut-chart/donut-chart.component';
import { BarChartComponent, BarChartData } from '../../../../../shared/reusable-components/charts/bar-chart/bar-chart.component';
import { JobStatisticsResponseDTO } from '../../../../../models/admin';
import { CHART_COLORS } from '../../../../../shared/reusable-components/charts/chart-config';

@Component({
  selector: 'app-job-statistics-card',
  standalone: true,
  imports: [
    CommonModule,
    StatisticCardComponent,
    LineChartComponent,
    DonutChartComponent,
    BarChartComponent
  ],
  templateUrl: './job-statistics-card.component.html',
  styleUrl: './job-statistics-card.component.scss'
})
export class JobStatisticsCardComponent {
  @Input() set data(value: JobStatisticsResponseDTO | null) {
    this.statisticsData.set(value);
  }

  @Input() set loading(value: boolean) {
    this.isLoading.set(value);
  }

  @Input() set error(value: string | null) {
    this.errorMessage.set(value);
  }

  statisticsData = signal<JobStatisticsResponseDTO | null>(null);
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
    if (!data || !data.jobPostingTrend || data.jobPostingTrend.length === 0) {
      return null;
    }

    return {
      labels: data.jobPostingTrend.map(point => {
        const date = new Date(point.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Job Postings',
        data: data.jobPostingTrend.map(point => point.value),
        borderColor: CHART_COLORS.success,
        backgroundColor: CHART_COLORS.success + '20',
        tension: 0.4,
        fill: true
      }]
    };
  });

  industryChartData = computed<DonutChartData | null>(() => {
    const data = this.statisticsData();
    if (!data || !data.jobsByIndustry || data.jobsByIndustry.length === 0) {
      return null;
    }

    return {
      labels: data.jobsByIndustry.map(item => item.category),
      datasets: [{
        data: data.jobsByIndustry.map(item => item.count)
      }]
    };
  });

  typeChartData = computed<BarChartData | null>(() => {
    const data = this.statisticsData();
    if (!data || !data.jobsByType || data.jobsByType.length === 0) {
      return null;
    }

    return {
      labels: data.jobsByType.map(item => item.category),
      datasets: [{
        label: 'Jobs by Type',
        data: data.jobsByType.map(item => item.count)
      }]
    };
  });

  activeJobsPercentage = computed(() => {
    const data = this.statisticsData();
    if (!data || data.totalJobs === 0) return 0;
    return (data.activeJobs / data.totalJobs * 100);
  });

  onRetry(): void {
    this.errorMessage.set(null);
  }
}
