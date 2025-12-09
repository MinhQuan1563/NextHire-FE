import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyLogoComponent } from '../company-logo/company-logo.component';

export interface Company {
  id: string;
  name: string;
  industry: string;
  logo?: string;
  location: string;
  followersCount: number;
  followStatus: 'none' | 'following';
}

@Component({
  selector: 'app-company-card',
  standalone: true,
  imports: [CommonModule, CompanyLogoComponent],
  templateUrl: './company-card.component.html',
  styleUrls: ['./company-card.component.scss']
})
export class CompanyCardComponent {
  @Input() company!: Company;
  @Output() onFollow = new EventEmitter<Company>();

  handleFollow(): void {
    this.onFollow.emit(this.company);
  }

  getFollowButtonClass(): string {
    if (this.company.followStatus === 'following') {
      return 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300';
    }
    return 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600';
  }

  getFollowButtonText(): string {
    return this.company.followStatus === 'following' ? 'Đang theo dõi' : 'Theo dõi';
  }
}
