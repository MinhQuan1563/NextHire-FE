import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoSidebarComponent } from '@shared/reusable-components/info-sidebar/info-sidebar.component';
import { PostCardComponent, PostData } from '@shared/reusable-components/post-card/post-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, InfoSidebarComponent, PostCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  feedPosts: PostData[] = [
    {
      id: 'post1',
      userName: 'Minh Quan',
      userTitle: 'Software Engineer | Angular | .NET',
      userInitial: 'M',
      postedTime: new Date(Date.now() - 3 * 3600 * 1000),
      content: 'Vừa hoàn thành xong module notification cho dự án NextHire! Sử dụng Angular 17, PrimeNG và Tailwind thật tuyệt vời. 🎉 #angular #primeng #tailwindcss',
      imageUrl: 'favicon.ico',
      likeCount: 15,
      commentCount: 3
    },
    {
      id: 'post2',
      userName: 'Một Công Ty Khác',
      userAvatar: 'favicon.ico',
      userTitle: 'Công ty · Công nghệ thông tin',
      postedTime: new Date(Date.now() - 2 * 86400000),
      content: 'Chúng tôi đang tuyển dụng vị trí Senior Frontend Developer, làm việc với các công nghệ mới nhất. Xem chi tiết tại link...',
      likeCount: 52,
      commentCount: 11,
      repostCount: 5
    },
    
  ];
}