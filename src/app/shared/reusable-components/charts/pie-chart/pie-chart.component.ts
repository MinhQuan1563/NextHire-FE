import { Component, Input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CHART_COLOR_PALETTE, getDefaultChartOptions } from '../chart-config';

export interface PieChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent {
  @Input() set data(value: PieChartData | null) {
    this.chartData.set(value);
  }

  @Input() set height(value: string) {
    this.chartHeight.set(value);
  }

  @Input() showLegend = true;
  @Input() showPercentage = true;

  chartData = signal<PieChartData | null>(null);
  chartHeight = signal<string>('300px');
  
  chartOptions = signal<any>(null);
  processedData = signal<any>(null);

  constructor() {
    effect(() => {
      this.updateChart();
    });
  }

  private updateChart(): void {
    const data = this.chartData();
    if (!data) {
      this.processedData.set(null);
      return;
    }

    const processedDatasets = data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || CHART_COLOR_PALETTE.slice(0, data.labels.length),
      borderColor: dataset.borderColor || '#ffffff',
      borderWidth: dataset.borderWidth ?? 2
    }));

    this.processedData.set({
      labels: data.labels,
      datasets: processedDatasets
    });

    this.chartOptions.set({
      ...getDefaultChartOptions(),
      plugins: {
        ...getDefaultChartOptions().plugins,
        legend: {
          ...getDefaultChartOptions().plugins.legend,
          display: this.showLegend,
          position: 'right' as const
        },
        tooltip: {
          ...getDefaultChartOptions().plugins.tooltip,
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              
              if (this.showPercentage && context.dataset.data) {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
              
              return `${label}: ${value}`;
            }
          }
        }
      }
    });
  }
}
