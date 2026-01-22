import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Person, PersonCardComponent } from '@shared/reusable-components/person-card/person-card.component';
import { Company, CompanyCardComponent } from '@shared/reusable-components/company-card/company-card.component';

// Type aliases for better readability
type SuggestedPerson = Person;
type SuggestedCompany = Company;

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [CommonModule, RouterModule, PersonCardComponent, CompanyCardComponent],
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent {
  // Network stats
  connectionsCount = 142;
  followingCount = 89;
  companiesCount = 23;

  // Mock data for invitation requests
  invitationRequests: SuggestedPerson[] = [
    {
      id: 'inv1',
      fullName: 'Lê Minh Hoàng',
      headline: 'Senior Backend Developer at VinTech | Java, Spring Boot',
      avatar: 'https://randomuser.me/api/portraits/men/21.jpg',
      location: 'Hà Nội, Việt Nam',
      mutualConnections: 8,
      connectionStatus: 'none',
      followStatus: 'none'
    },
    {
      id: 'inv2',
      fullName: 'Nguyễn Thị Lan',
      headline: 'Product Designer | UI/UX Expert at TechCorp',
      avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
      location: 'Hồ Chí Minh, Việt Nam',
      mutualConnections: 12,
      connectionStatus: 'none',
      followStatus: 'none'
    },
    {
      id: 'inv3',
      fullName: 'Trần Quốc Huy',
      headline: 'DevOps Engineer | AWS Certified | Docker & Kubernetes',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      location: 'Đà Nẵng, Việt Nam',
      mutualConnections: 5,
      connectionStatus: 'none',
      followStatus: 'none'
    },
    {
      id: 'inv4',
      fullName: 'Phạm Thị Mai',
      headline: 'Data Analyst | Python, SQL, Tableau Expert',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      location: 'Hồ Chí Minh, Việt Nam',
      mutualConnections: 15,
      connectionStatus: 'none',
      followStatus: 'none'
    },
    {
      id: 'inv5',
      fullName: 'Võ Đình Khoa',
      headline: 'Mobile Developer | React Native & Flutter',
      avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
      location: 'Hà Nội, Việt Nam',
      mutualConnections: 7,
      connectionStatus: 'none',
      followStatus: 'none'
    },
    {
      id: 'inv6',
      fullName: 'Đặng Thu Thảo',
      headline: 'QA Engineer | Automation Testing Specialist',
      avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
      location: 'Hồ Chí Minh, Việt Nam',
      mutualConnections: 9,
      connectionStatus: 'none',
      followStatus: 'none'
    }
  ];



  // Mock data for suggested people
  suggestedPeople: SuggestedPerson[] = [
    {
      id: '1',
      fullName: 'Nguyễn Văn An',
      headline: 'Senior Frontend Developer tại TechCorp | Angular, React Expert',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      location: 'Hồ Chí Minh, Việt Nam',
      mutualConnections: 12,
      connectionStatus: 'none',
      followStatus: 'none'
    },
    {
      id: '2',
      fullName: 'Trần Thị Bảo',
      headline: 'UX/UI Designer | Figma, Adobe Creative Suite',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      location: 'Hà Nội, Việt Nam',
      mutualConnections: 8,
      connectionStatus: 'none',
      followStatus: 'none'
    },
    {
      id: '3',
      fullName: 'Lê Minh Đức',
      headline: 'Full Stack Developer | Node.js, Python, AWS',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      location: 'Đà Nẵng, Việt Nam',
      mutualConnections: 5,
      connectionStatus: 'none',
      followStatus: 'none'
    },
    {
      id: '4',
      fullName: 'Phạm Thu Hương',
      headline: 'Product Manager tại StartupXYZ | Agile, Scrum Master',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      location: 'Hồ Chí Minh, Việt Nam',
      mutualConnections: 15,
      connectionStatus: 'none',
      followStatus: 'none'
    }
  ];

  // Mock data for suggested companies
  suggestedCompanies: SuggestedCompany[] = [
    {
      id: '1',
      name: 'TechViet Solutions',
      industry: 'Công nghệ thông tin',
      logo: 'https://logo.clearbit.com/techviet.com',
      location: 'Hồ Chí Minh, Việt Nam',
      followersCount: 15420,
      followStatus: 'none'
    },
    {
      id: '2',
      name: 'VinTech Innovation',
      industry: 'Phát triển phần mềm',
      logo: 'https://logo.clearbit.com/vingroup.net',
      location: 'Hà Nội, Việt Nam',
      followersCount: 28350,
      followStatus: 'none'
    },
    {
      id: '3',
      name: 'FPT Software',
      industry: 'Dịch vụ IT',
      logo: 'https://logo.clearbit.com/fpt.com.vn',
      location: 'Hà Nội, Việt Nam',
      followersCount: 45680,
      followStatus: 'none'
    },
    {
      id: '4',
      name: 'Sendo Technology',
      industry: 'E-commerce',
      logo: 'https://logo.clearbit.com/sendo.vn',
      location: 'Hồ Chí Minh, Việt Nam',
      followersCount: 12750,
      followStatus: 'none'
    }
  ];

  // Connection methods
  toggleConnection(person: SuggestedPerson): void {
    if (person.connectionStatus === 'none') {
      person.connectionStatus = 'requested';
    } else if (person.connectionStatus === 'requested') {
      person.connectionStatus = 'none';
    } else if (person.connectionStatus === 'connected') {
      person.connectionStatus = 'none';
      this.connectionsCount--;
    }
  }

  toggleFollow(person: SuggestedPerson): void {
    if (person.followStatus === 'none') {
      person.followStatus = 'following';
      this.followingCount++;
    } else {
      person.followStatus = 'none';
      this.followingCount--;
    }
  }

  toggleCompanyFollow(company: SuggestedCompany): void {
    if (company.followStatus === 'none') {
      company.followStatus = 'following';
      this.companiesCount++;
    } else {
      company.followStatus = 'none';
      this.companiesCount--;
    }
  }

  // Invitation methods
  get displayedInvitations(): SuggestedPerson[] {
    return this.invitationRequests.slice(0, 5);
  }

  acceptInvitation(person: SuggestedPerson): void {
    // Remove from invitations
    this.invitationRequests = this.invitationRequests.filter(inv => inv.id !== person.id);
    
    // Update connection status and count
    person.connectionStatus = 'connected';
    this.connectionsCount++;
    
    console.log(`Accepted invitation from ${person.fullName}`);
  }

  declineInvitation(person: SuggestedPerson): void {
    // Remove from invitations
    this.invitationRequests = this.invitationRequests.filter(inv => inv.id !== person.id);
    
    console.log(`Declined invitation from ${person.fullName}`);
  }



}