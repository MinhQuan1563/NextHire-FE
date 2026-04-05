import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { PostLikeService } from '@app/services/posts/post-like.service';
import { AppUserService } from '@app/services/app-user/app-user.service';
import { PostLike } from '@app/models/post/post-like.model';
import { AppUser } from '@app/models/app-user/app-user.model';

@Component({
  selector: 'app-post-like',
  standalone: true,
  imports: [CommonModule, AvatarModule],
  templateUrl: './post-like.component.html',
  styleUrl: './post-like.component.scss'
})
export class PostLikeComponent implements OnInit {
  @Input() postCode!: string;

  postLikeService = inject(PostLikeService);
  appUserService = inject(AppUserService);
  likes: any[] = [];
  isLoading: boolean = false;
  userByLike: { [userCode: string]: AppUser } = {};

  ngOnInit(): void {
    if (this.postCode) {
      this.fetchLikes();
    }
  }

  fetchLikes() {
    this.isLoading = true;

    this.postLikeService.getLikesByPost(this.postCode).subscribe({
      next: (response) => {
        this.likes = response;
        this.isLoading = false;
        this.loadAuthorNames(response);
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách lượt thích', err);
        this.isLoading = false;
      }
    });
  }

  loadAuthorNames(postLikes: PostLike[]) {
    const uniqueUserCodes = [...new Set(postLikes.map(p => p.userCode))];

    uniqueUserCodes.forEach(code => {
      if (!this.userByLike[code]) {
        this.appUserService.getUser(code).subscribe({
          next: (user) => {
            this.userByLike[code] = user;
          },
          error: () => {
            console.error('User not found in the Likes');
          }
        });
      }
    });
  }
}
