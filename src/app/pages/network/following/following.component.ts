import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';

interface NetworkUser {
  id: string;
  fullName: string;
  headline: string;
  avatar?: string;
  isFollowing?: boolean;
  isFollower?: boolean;
}

@Component({
  selector: 'app-following',
  standalone: true,
  imports: [CommonModule, TabViewModule, ButtonModule],
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.scss']
})
export class FollowingComponent {
  userName = 'Phong KP';

  followingUsers: NetworkUser[] = [
    {
      id: '1',
      fullName: 'Nguyễn Hải Đăng',
      headline: '.NET Developer | Code for work',
      avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
      isFollowing: true
    },
    {
      id: '2',
      fullName: 'Trần Minh Khôi',
      headline: 'Senior React Developer | JavaScript Enthusiast',
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
      isFollowing: true
    },
    {
      id: '3',
      fullName: 'Lê Thị Ngọc',
      headline: 'Data Scientist | Python, Machine Learning',
      avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
      isFollowing: true
    },
    {
      id: '4',
      fullName: 'Phạm Quang Huy',
      headline: 'Mobile Developer | Flutter, React Native',
      avatar: 'https://randomuser.me/api/portraits/men/13.jpg',
      isFollowing: true
    }
  ];

  followers: NetworkUser[] = [
    {
      id: '5',
      fullName: 'Võ Thị Mai',
      headline: 'Frontend Developer | Vue.js, Angular',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      isFollower: true
    },
    {
      id: '6',
      fullName: 'Hoàng Minh Tâm',
      headline: 'Backend Developer | Java, Spring Boot',
      avatar: 'https://randomuser.me/api/portraits/men/14.jpg',
      isFollower: true
    },
    {
      id: '7',
      fullName: 'Đặng Thu Hà',
      headline: 'UI/UX Designer | Figma, Sketch Expert',
      avatar: 'https://randomuser.me/api/portraits/women/13.jpg',
      isFollower: true
    }
  ];

  get followingCount(): number {
    return this.followingUsers.filter(user => user.isFollowing).length;
  }

  get totalNetworkCount(): number {
    // This would be calculated from all connections
    return 142; // Mock data from network component
  }

  toggleFollowing(user: NetworkUser): void {
    user.isFollowing = !user.isFollowing;
    console.log(`${user.isFollowing ? 'Following' : 'Unfollowed'} ${user.fullName}`);
  }

  followUser(user: NetworkUser): void {
    // Add to following list if not already following
    const existingUser = this.followingUsers.find(u => u.id === user.id);
    if (!existingUser) {
      this.followingUsers.push({
        ...user,
        isFollowing: true
      });
    } else {
      existingUser.isFollowing = true;
    }
    console.log(`Now following ${user.fullName}`);
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
}
