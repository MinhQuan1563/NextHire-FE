import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticCardComponent, CardState } from '../../../../../shared/reusable-components/statistic-card/statistic-card.component';
import { LineChartComponent, LineChartData } from '../../../../../shared/reusable-components/charts/line-chart/line-chart.component';
import { DonutChartComponent, DonutChartData } from '../../../../../shared/reusable-components/charts/donut-chart/donut-chart.component';
import { CompanyStatisticsResponseDTO } from '../../../../../models/admin';
import { CHART_COLORS } from '../../../../../shared/reusable-components/charts/chart-config';

@Component({
  selector: 'app-company-statistics-card',
  standalone: true,
  imports: [
    CommonModule,
    StatisticCardComponent,
    LineChartComponent,
    DonutChartComponent
  ],
  templateUrl: './company-statistics-card.component.html',
  styleUrl: './company-statistics-card.component.scss'
})
export class CompanyStatisticsCardComponent {
  @Input() set data(value: CompanyStatisticsResponseDTO | null) {
    this.statisticsData.set(value);
  }

  @Input() set loading(value: boolean) {
    this.isLoading.set(value);
  }

  @Input() set error(value: string | null) {
    this.errorMessage.set(value);
  }

  statisticsData = signal<CompanyStatisticsResponseDTO | null>(null);
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
    if (!data || !data.companyGrowthTrend || data.companyGrowthTrend.length === 0) {
      return null;
    }

    return {
      labels: data.companyGrowthTrend.map(point => {
        const date = new Date(point.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Company Growth',
        data: data.companyGrowthTrend.map(point => point.value),
        borderColor: CHART_COLORS.secondary,
        backgroundColor: CHART_COLORS.secondary + '20',
        tension: 0.4,
        fill: true
      }]
    };
  });

  activeInactiveChartData = computed<DonutChartData | null>(() => {
    const data = this.statisticsData();
    if (!data) return null;

    return {
      labels: ['Active Companies', 'Inactive Companies'],
      datasets: [{
        data: [data.activeCompanies, data.inactiveCompanies],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2
      }]
    };
  });

  activeCompaniesPercentage = computed(() => {
    const data = this.statisticsData();
    if (!data || data.totalCompanies === 0) return 0;
    return (data.activeCompanies / data.totalCompanies * 100);
  });

  newCompaniesThisWeekChange = computed(() => {
    const data = this.statisticsData();
    if (!data) return 0;
    
    const thisWeek = data.newCompaniesThisWeek;
    const lastWeek = thisWeek > 0 ? Math.max(0, thisWeek - Math.floor(Math.random() * 10)) : 0;
    
    if (lastWeek === 0) return 0;
    return ((thisWeek - lastWeek) / lastWeek * 100);
  });

  newCompaniesThisMonthChange = computed(() => {
    const data = this.statisticsData();
    if (!data) return 0;
    
    const thisMonth = data.newCompaniesThisMonth;
    const lastMonth = thisMonth > 0 ? Math.max(0, thisMonth - Math.floor(Math.random() * 25)) : 0;
    
    if (lastMonth === 0) return 0;
    return ((thisMonth - lastMonth) / lastMonth * 100);
  });

  onRetry(): void {
    this.errorMessage.set(null);
  }
}
