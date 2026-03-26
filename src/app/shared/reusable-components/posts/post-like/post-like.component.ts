import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { PostLikeService } from '@app/services/posts/post-like.service';

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
  likes: any[] = [];
  isLoading: boolean = false;

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
        console.log('Danh sách lượt thích:', this.likes);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách lượt thích', err);
        this.isLoading = false;
      }
    });
  }
}
