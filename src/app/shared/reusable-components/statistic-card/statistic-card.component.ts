import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

export type CardState = 'loading' | 'success' | 'empty' | 'error';

@Component({
  selector: 'app-statistic-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    SkeletonModule
  ],
  templateUrl: './statistic-card.component.html',
  styleUrl: './statistic-card.component.scss'
})
export class StatisticCardComponent {
  @Input() title = '';
  @Input() icon = 'pi pi-chart-line';
  @Input() iconColor = 'text-blue-500';
  @Input() iconBackground = 'bg-blue-100';
  @Input() state: CardState = 'loading';
  @Input() errorMessage = 'Failed to load data';
  @Input() emptyMessage = 'No data available';
  
  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
