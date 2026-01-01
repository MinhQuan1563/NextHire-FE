import { Component, Input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CHART_COLORS, getDefaultChartOptions } from '../chart-config';

export interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    tension?: number;
    fill?: boolean;
  }[];
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent {
  @Input() set data(value: LineChartData | null) {
    this.chartData.set(value);
  }

  @Input() set height(value: string) {
    this.chartHeight.set(value);
  }

  @Input() set color(value: string) {
    this.primaryColor.set(value);
  }

  @Input() showLegend = true;
  @Input() showGrid = true;
  @Input() tension = 0.4;

  chartData = signal<LineChartData | null>(null);
  chartHeight = signal<string>('300px');
  primaryColor = signal<string>(CHART_COLORS.primary);
  
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

    const processedDatasets = data.datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: dataset.borderColor || this.primaryColor(),
      backgroundColor: dataset.backgroundColor || this.getBackgroundColor(dataset.borderColor || this.primaryColor()),
      tension: dataset.tension ?? this.tension,
      fill: dataset.fill ?? true,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: dataset.borderColor || this.primaryColor(),
      pointBorderColor: '#fff',
      pointBorderWidth: 2
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
          display: this.showLegend
        }
      },
      scales: {
        x: {
          grid: {
            display: this.showGrid,
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 11,
              family: "'Inter', sans-serif"
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            display: this.showGrid,
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 11,
              family: "'Inter', sans-serif"
            }
          }
        }
      }
    });
  }

  private getBackgroundColor(borderColor: string): string {
    const alpha = '20';
    if (borderColor.startsWith('#')) {
      return borderColor + alpha;
    }
    return borderColor.replace('rgb', 'rgba').replace(')', `, 0.${alpha})`);
  }
}
