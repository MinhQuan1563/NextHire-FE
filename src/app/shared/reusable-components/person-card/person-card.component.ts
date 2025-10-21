import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Person {
  id: string;
  fullName: string;
  headline: string;
  avatar?: string;
  location: string;
  mutualConnections: number;
  connectionStatus: 'none' | 'requested' | 'connected';
  followStatus: 'none' | 'following';
}

@Component({
  selector: 'app-person-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './person-card.component.html',
  styleUrls: ['./person-card.component.scss']
})
export class PersonCardComponent {
  @Input() person!: Person;
  @Output() onConnect = new EventEmitter<Person>();
  @Output() onFollow = new EventEmitter<Person>();

  handleConnect(): void {
    this.onConnect.emit(this.person);
  }

  handleFollow(): void {
    this.onFollow.emit(this.person);
  }

  getConnectButtonClass(): string {
    switch (this.person.connectionStatus) {
      case 'requested':
        return 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300';
      case 'connected':
        return 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600';
    }
  }

  getConnectButtonText(): string {
    switch (this.person.connectionStatus) {
      case 'requested':
        return 'Đã gửi lời mời';
      case 'connected':
        return 'Đã kết nối';
      default:
        return 'Kết nối';
    }
  }

  getFollowButtonClass(): string {
    if (this.person.followStatus === 'following') {
      return 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300';
    }
    return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300';
  }

  getFollowButtonText(): string {
    return this.person.followStatus === 'following' ? 'Đang theo dõi' : 'Theo dõi';
  }
}
