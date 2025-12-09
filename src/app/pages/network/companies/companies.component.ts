import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { CompanyLogoComponent } from '../../../shared/reusable-components/company-logo/company-logo.component';

interface CompanyPage {
  id: string;
  name: string;
  logo?: string;
  followersCount: number;
  isFollowing: boolean;
}

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, ButtonModule, DividerModule, CompanyLogoComponent],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent {
  companies: CompanyPage[] = [
    {
      id: '1',
      name: 'TechViet Solutions',
      logo: 'https://logo.clearbit.com/techviet.com',
      followersCount: 177485,
      isFollowing: true
    },
    {
      id: '2',
      name: 'VinTech Innovation',
      logo: 'https://logo.clearbit.com/vingroup.net',
      followersCount: 285674,
      isFollowing: false
    },
    {
      id: '3',
      name: 'FPT Software',
      logo: 'https://logo.clearbit.com/fpt.com.vn',
      followersCount: 456892,
      isFollowing: true
    },
    {
      id: '4',
      name: 'Sendo Technology',
      logo: 'https://logo.clearbit.com/sendo.vn',
      followersCount: 127583,
      isFollowing: false
    },
    {
      id: '5',
      name: 'Tiki Corporation',
      logo: 'https://logo.clearbit.com/tiki.vn',
      followersCount: 203947,
      isFollowing: true
    },
    {
      id: '6',
      name: 'Shopee Vietnam',
      logo: 'https://logo.clearbit.com/shopee.vn',
      followersCount: 678234,
      isFollowing: false
    },
    {
      id: '7',
      name: 'Zalo (VNG Corporation)',
      logo: 'https://logo.clearbit.com/vng.com.vn',
      followersCount: 892456,
      isFollowing: true
    },
    {
      id: '8',
      name: 'BAEMIN Vietnam',
      logo: 'https://logo.clearbit.com/baemin.vn',
      followersCount: 156789,
      isFollowing: false
    }
  ];

  get followingCount(): number {
    return this.companies.filter(company => company.isFollowing).length;
  }

  toggleFollow(company: CompanyPage): void {
    company.isFollowing = !company.isFollowing;
    console.log(`${company.isFollowing ? 'Following' : 'Unfollowed'} ${company.name}`);
  }

  getFollowButtonClass(isFollowing: boolean): string {
    if (isFollowing) {
      return 'p-button-outlined p-button-sm';
    }
    return 'p-button-sm';
  }

  getFollowButtonText(isFollowing: boolean): string {
    return isFollowing ? 'Following' : 'Follow';
  }

  formatFollowersCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toString();
  }
}
