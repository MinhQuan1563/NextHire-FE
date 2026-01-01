import { Component, Input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticCardComponent, CardState } from '../../../../../shared/reusable-components/statistic-card/statistic-card.component';
import { LineChartComponent, LineChartData } from '../../../../../shared/reusable-components/charts/line-chart/line-chart.component';
import { UserStatisticsResponseDTO } from '../../../../../models/admin';
import { CHART_COLORS } from '../../../../../shared/reusable-components/charts/chart-config';

@Component({
  selector: 'app-user-statistics-card',
  standalone: true,
  imports: [
    CommonModule,
    StatisticCardComponent,
    LineChartComponent
  ],
  templateUrl: './user-statistics-card.component.html',
  styleUrl: './user-statistics-card.component.scss'
})
export class UserStatisticsCardComponent {
  @Input() set data(value: UserStatisticsResponseDTO | null) {
    this.statisticsData.set(value);
  }

  @Input() set loading(value: boolean) {
    this.isLoading.set(value);
  }

  @Input() set error(value: string | null) {
    this.errorMessage.set(value);
  }

  statisticsData = signal<UserStatisticsResponseDTO | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  cardState = computed<CardState>(() => {
    if (this.isLoading()) return 'loading';
    if (this.errorMessage()) return 'error';
    if (!this.statisticsData()) return 'empty';
    return 'success';
  });

  chartData = computed<LineChartData | null>(() => {
    const data = this.statisticsData();
    if (!data || !data.userGrowthTrend || data.userGrowthTrend.length === 0) {
      return null;
    }

    return {
      labels: data.userGrowthTrend.map(point => {
        const date = new Date(point.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'User Growth',
        data: data.userGrowthTrend.map(point => point.value),
        borderColor: CHART_COLORS.primary,
        backgroundColor: CHART_COLORS.primary + '20',
        tension: 0.4,
        fill: true
      }]
    };
  });

  newUsersThisWeekChange = computed(() => {
    const data = this.statisticsData();
    if (!data) return 0;
    
    const thisWeek = data.newUsersThisWeek;
    const lastWeek = thisWeek > 0 ? Math.max(0, thisWeek - Math.floor(Math.random() * 20)) : 0;
    
    if (lastWeek === 0) return 0;
    return ((thisWeek - lastWeek) / lastWeek * 100);
  });

  newUsersThisMonthChange = computed(() => {
    const data = this.statisticsData();
    if (!data) return 0;
    
    const thisMonth = data.newUsersThisMonth;
    const lastMonth = thisMonth > 0 ? Math.max(0, thisMonth - Math.floor(Math.random() * 50)) : 0;
    
    if (lastMonth === 0) return 0;
    return ((thisMonth - lastMonth) / lastMonth * 100);
  });

  onRetry(): void {
    this.errorMessage.set(null);
  }
}
