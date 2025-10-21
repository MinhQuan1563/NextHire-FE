import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';

interface Connection {
  id: string;
  fullName: string;
  headline: string;
  avatar?: string;
  connectedDate: string;
}

@Component({
  selector: 'app-connections',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, DropdownModule, ButtonModule, DividerModule, MenuModule],
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss']
})
export class ConnectionsComponent {
  searchTerm = '';
  sortOptions = [
    { label: 'Recently added', value: 'recent' },
    { label: 'Last name', value: 'lastname' },
    { label: 'First name', value: 'firstname' }
  ];
  selectedSort = this.sortOptions[0];

  connections: Connection[] = [
    {
      id: '1',
      fullName: 'Nguyễn Văn An',
      headline: 'Senior Frontend Developer at TechCorp | Angular, React Expert',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      connectedDate: '2 months ago'
    },
    {
      id: '2',
      fullName: 'Trần Thị Bảo',
      headline: 'UX/UI Designer | Figma, Adobe Creative Suite',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      connectedDate: '3 weeks ago'
    },
    {
      id: '3',
      fullName: 'Lê Minh Đức',
      headline: 'Full Stack Developer | Node.js, Python, AWS',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      connectedDate: '1 month ago'
    },
    {
      id: '4',
      fullName: 'Phạm Thu Hương',
      headline: 'Product Manager at StartupXYZ | Agile, Scrum Master',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      connectedDate: '5 days ago'
    },
    {
      id: '5',
      fullName: 'Võ Minh Tuấn',
      headline: 'DevOps Engineer | Docker, Kubernetes, CI/CD',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      connectedDate: '2 weeks ago'
    }
  ];

  get filteredConnections(): Connection[] {
    let filtered = [...this.connections];

    // Search filter
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(conn => 
        conn.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        conn.headline.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (this.selectedSort.value) {
      case 'lastname':
        filtered.sort((a, b) => {
          const lastNameA = a.fullName.split(' ').pop() || '';
          const lastNameB = b.fullName.split(' ').pop() || '';
          return lastNameA.localeCompare(lastNameB);
        });
        break;
      case 'firstname':
        filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
        break;
      case 'recent':
      default:
        // Keep original order (most recent first)
        break;
    }

    return filtered;
  }

  onMessage(connection: Connection): void {
    console.log('Message clicked for:', connection.fullName);
    // Handle message functionality
  }

  onMenuClick(connection: Connection): void {
    console.log('Menu clicked for:', connection.fullName);
    // Handle menu options
  }
}
