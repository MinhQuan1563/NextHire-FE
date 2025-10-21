import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationCardComponent } from '../../../shared/reusable-components/invitation-card/invitation-card.component';
import { Person } from '../../../shared/reusable-components/person-card/person-card.component';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, InvitationCardComponent],
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss']
})
export class InvitationsComponent {
  invitationRequests: Person[] = [
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
    },
    {
      id: 'inv7',
      fullName: 'Bùi Văn Nam',
      headline: 'Full Stack Developer | MEAN Stack Expert',
      avatar: 'https://randomuser.me/api/portraits/men/24.jpg',
      location: 'Cần Thơ, Việt Nam',
      mutualConnections: 11,
      connectionStatus: 'none',
      followStatus: 'none'
    },
    {
      id: 'inv8',
      fullName: 'Hoàng Thị Yến',
      headline: 'Business Analyst | Agile & Scrum Certified',
      avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
      location: 'Hà Nội, Việt Nam',
      mutualConnections: 6,
      connectionStatus: 'none',
      followStatus: 'none'
    }
  ];

  acceptInvitation(person: Person): void {
    // Remove from invitations
    this.invitationRequests = this.invitationRequests.filter(inv => inv.id !== person.id);
    
    console.log(`Accepted invitation from ${person.fullName}`);
  }

  declineInvitation(person: Person): void {
    // Remove from invitations
    this.invitationRequests = this.invitationRequests.filter(inv => inv.id !== person.id);
    
    console.log(`Declined invitation from ${person.fullName}`);
  }

  acceptAll(): void {
    console.log(`Accepted all ${this.invitationRequests.length} invitations`);
    this.invitationRequests = [];
  }

  declineAll(): void {
    console.log(`Declined all ${this.invitationRequests.length} invitations`);
    this.invitationRequests = [];
  }
}
