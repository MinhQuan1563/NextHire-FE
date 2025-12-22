import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-other-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './other-user-profile.component.html',
  styleUrls: ['./other-user-profile.component.scss']
})
export class OtherUserProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  
  // Route parameter
  userCode = signal<string | null>(null);
  
  // Loading state
  loading = signal<boolean>(false);
  
  // Error state
  error = signal<string | null>(null);
  
  // Profile data will be loaded here
  // profileData = signal<UserProfile | null>(null);
  
  // Friendship status will be loaded here
  // friendshipStatus = signal<FriendshipStatus | null>(null);
  
  ngOnInit(): void {
    // Get userCode from route params
    this.route.paramMap.subscribe(params => {
      const code = params.get('userCode');
      if (code) {
        this.userCode.set(code);
        // Load profile data here
      }
    });
  }
}

