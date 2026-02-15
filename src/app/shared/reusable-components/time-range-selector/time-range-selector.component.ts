import { Component, EventEmitter, Output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TimeRangeEnum, TimeRangeOption, TimeRangeFilterParams } from '../../../models/admin';

@Component({
  selector: 'app-time-range-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    ButtonModule
  ],
  templateUrl: './time-range-selector.component.html',
  styleUrl: './time-range-selector.component.scss'
})
export class TimeRangeSelectorComponent {
  @Output() timeRangeChange = new EventEmitter<TimeRangeFilterParams>();

  readonly timeRangeOptions: TimeRangeOption[] = [
    { label: 'Today', value: TimeRangeEnum.TODAY, icon: 'pi pi-calendar' },
    { label: 'This Week', value: TimeRangeEnum.THIS_WEEK, icon: 'pi pi-calendar' },
    { label: 'This Month', value: TimeRangeEnum.THIS_MONTH, icon: 'pi pi-calendar' },
    { label: 'This Year', value: TimeRangeEnum.THIS_YEAR, icon: 'pi pi-calendar' },
    { label: 'Custom Range', value: TimeRangeEnum.CUSTOM, icon: 'pi pi-calendar-plus' }
  ];

  selectedTimeRange = signal<TimeRangeEnum>(TimeRangeEnum.THIS_MONTH);
  customStartDate = signal<Date | null>(null);
  customEndDate = signal<Date | null>(null);

  isCustomRange = computed(() => this.selectedTimeRange() === TimeRangeEnum.CUSTOM);
  isCustomRangeValid = computed(() => {
    if (!this.isCustomRange()) {
      return true;
    }
    return this.customStartDate() !== null && this.customEndDate() !== null;
  });

  maxDate = new Date();

  onTimeRangeChange(value: TimeRangeEnum): void {
    this.selectedTimeRange.set(value);
    
    if (value !== TimeRangeEnum.CUSTOM) {
      this.customStartDate.set(null);
      this.customEndDate.set(null);
      this.emitTimeRangeChange();
    }
  }

  onCustomDateChange(): void {
    if (this.isCustomRangeValid()) {
      this.emitTimeRangeChange();
    }
  }

  applyCustomRange(): void {
    if (this.isCustomRangeValid()) {
      this.emitTimeRangeChange();
    }
  }

  private emitTimeRangeChange(): void {
    const params: TimeRangeFilterParams = {
      timeRange: this.selectedTimeRange()
    };

    if (this.isCustomRange() && this.customStartDate() && this.customEndDate()) {
      params.startDate = this.formatDate(this.customStartDate()!);
      params.endDate = this.formatDate(this.customEndDate()!);
    }

    this.timeRangeChange.emit(params);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
