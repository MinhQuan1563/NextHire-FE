import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
// Giả sử có interface/class JobSummary
// import { JobSummary } from 'src/app/core/models/interfaces/job.interface';

// Ví dụ interface
interface JobSummary {
  id: string | number;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  salary?: string;
  tags?: string[];
  postedDate?: Date | string;
}

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, AvatarModule],
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.scss']
})
export class JobCardComponent {
  @Input() job!: JobSummary;

  @Output() viewDetail = new EventEmitter<string | number>();
  @Output() saveJob = new EventEmitter<string | number>();

  onViewDetailClick(): void {
    this.viewDetail.emit(this.job.id);
  }

  onSaveJobClick(): void {
    this.saveJob.emit(this.job.id);
  }
}