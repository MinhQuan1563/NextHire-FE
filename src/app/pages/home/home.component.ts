import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoSidebarComponent } from '@shared/reusable-components/info-sidebar/info-sidebar.component';
import { PostCardComponent } from '@shared/reusable-components/post-card/post-card.component';
import { PostService } from '@app/services/posts/post.service';
import { PostResponse } from '@app/models/post/post.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, InfoSidebarComponent, PostCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  feedPosts: PostResponse[] = [];
  currentUserCode = 'USR1002';
  pageSize = 10;
  lastCreatedAt?: string;
  lastPostCode?: string;
  isLoading = false;
  hasMore = true;

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.loadFeeds();
  }

  loadFeeds(loadMore = false) {
    if (this.isLoading || (!loadMore && !this.hasMore)) return;

    this.isLoading = true;
    this.postService.getHomeFeed(this.currentUserCode, this.pageSize, this.lastCreatedAt, this.lastPostCode)
      .subscribe({
        next: (posts: PostResponse[]) => {
          if (loadMore) {
            this.feedPosts = [...this.feedPosts, ...posts];
          } else {
            this.feedPosts = posts;
          }
          this.hasMore = posts.length === this.pageSize;
          if (posts.length > 0) {
            const lastPost = posts[posts.length - 1];
            this.lastCreatedAt = lastPost.createdAt;
            this.lastPostCode = lastPost.postCode;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading feeds:', err);
          this.isLoading = false;
        }
      });
  }

  loadMore() {
    this.loadFeeds(true);
  }
}