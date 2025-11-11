import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../models/auth/auth.model';

@Component({
  selector: 'app-info-sidebar',
  standalone: true,
  imports: [CommonModule, AvatarModule],
  templateUrl: './info-sidebar.component.html',
  styleUrls: ['./info-sidebar.component.scss']
})
export class InfoSidebarComponent {
  // Fallback values shown when no user is available
  userName = 'Tên Người Dùng';
  userTitle = 'Chức danh công việc tại Công ty';
  profileViews = 120;
  postImpressions = 880;
  coverImageUrl = ''; // 'assets/images/default-cover.jpg'
  avatarUrl: string | undefined = undefined;

  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }
}