import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PostResponse } from '@app/models/post/post.model';
import { AppUserService } from '@app/services/app-user/app-user.service';
import { PostService } from '@app/services/posts/post.service';
import { InfoSidebarComponent } from '@shared/reusable-components/info-sidebar/info-sidebar.component';
import { PostCardComponent } from '@shared/reusable-components/posts/post-card/post-card.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-saved-posts',
  standalone: true,
  imports: [
    CommonModule, DialogModule, PostCardComponent, 
    ButtonModule, MenuModule, InfoSidebarComponent
  ],
  templateUrl: './saved-posts.component.html',
  styleUrl: './saved-posts.component.scss'
})
export class SavedPostsComponent {
  savedPosts: PostResponse[] = [];
  isLoading = false;
  displayPostModal = false;
  selectedPost: PostResponse | null = null;
  authorDictionary: { [userCode: string]: string } = {};

  constructor(
    private postService: PostService,
    private appUserService: AppUserService
  ) {}

  ngOnInit() {
    this.loadSavedPosts();
  }

  loadSavedPosts() {
    this.isLoading = true;
    this.postService.getMySavedPosts().subscribe({
      next: (posts) => {
        this.savedPosts = posts;
        this.isLoading = false;
        this.loadAuthorNames(posts);
      }
    });
  }

  loadAuthorNames(posts: PostResponse[]) {
    const uniqueUserCodes = [...new Set(posts.map(p => p.userCode))];

    uniqueUserCodes.forEach(code => {
      if (!this.authorDictionary[code]) {
        this.appUserService.getUser(code).subscribe({
          next: (user) => {
            this.authorDictionary[code] = user.fullName || user.userCode; 
          },
          error: () => {
            this.authorDictionary[code] = code; 
          }
        });
      }
    });
  }

  viewPostDetail(post: PostResponse) {
    this.selectedPost = post;
    this.displayPostModal = true;
  }

  unsavePost(postCode: string, event: Event) {
    event.stopPropagation();
    
    this.savedPosts = this.savedPosts.filter(p => p.postCode !== postCode);
    
    if (this.selectedPost?.postCode === postCode) {
      this.displayPostModal = false;
    }

    this.postService.toggleSavePost(postCode).subscribe();
  }

  sharePost(postCode: string, event: Event) {
    event.stopPropagation();
    alert('Share link copied!');
  }

  handlePostUnsaved(postCode: string) {
      this.savedPosts = this.savedPosts.filter(p => p.postCode !== postCode);
      this.displayPostModal = false;
  }
}
