import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-info-sidebar',
  standalone: true,
  imports: [CommonModule, AvatarModule],
  templateUrl: './info-sidebar.component.html',
  styleUrls: ['./info-sidebar.component.scss']
})
export class InfoSidebarComponent {
  userName = 'Tên Người Dùng';
  userTitle = 'Chức danh công việc tại Công ty';
  profileViews = 120;
  postImpressions = 880;
  userInitial = this.userName.charAt(0);
  coverImageUrl = ''; // 'assets/images/default-cover.jpg'
  avatarUrl: string | undefined = undefined;
}