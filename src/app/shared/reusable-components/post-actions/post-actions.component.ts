import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-post-actions',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './post-actions.component.html',
  styleUrls: ['./post-actions.component.scss']
})
export class PostActionsComponent {
  @Input() postId!: string | number;
  @Input() liked: boolean = false;

  @Output() action = new EventEmitter<{ type: string, postId: string | number }>();

  triggerAction(type: string): void {
    this.action.emit({ type, postId: this.postId });
    if (type === 'like') {
        this.liked = !this.liked;
    }
  }
}