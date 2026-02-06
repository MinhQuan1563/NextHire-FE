import { Component, Input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CHART_COLOR_PALETTE, getDefaultChartOptions } from '../chart-config';

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent {
  @Input() set data(value: BarChartData | null) {
    this.chartData.set(value);
  }

  @Input() set height(value: string) {
    this.chartHeight.set(value);
  }

  @Input() showLegend = true;
  @Input() showGrid = true;
  @Input() horizontal = false;

  chartData = signal<BarChartData | null>(null);
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

    const processedDatasets = data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || this.getColors(data.labels.length),
      borderColor: dataset.borderColor || this.getColors(data.labels.length, true),
      borderWidth: dataset.borderWidth ?? 1,
      borderRadius: 4
    }));

    this.processedData.set({
      labels: data.labels,
      datasets: processedDatasets
    });

    const indexAxis = this.horizontal ? 'y' : 'x';

    this.chartOptions.set({
      ...getDefaultChartOptions(),
      indexAxis,
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
            display: this.horizontal ? this.showGrid : false,
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
            display: this.horizontal ? false : this.showGrid,
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

  private getColors(count: number, darker = false): string[] {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const color = CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length];
      colors.push(darker ? this.darkenColor(color) : color);
    }
    return colors;
  }

  private darkenColor(color: string): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 20);
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 20);
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 20);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
