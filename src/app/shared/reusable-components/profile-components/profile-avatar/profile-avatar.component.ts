import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-profile-avatar',
  standalone: true,
  imports: [CommonModule, AvatarModule],
  templateUrl: './profile-avatar.component.html',
  styleUrls: ['./profile-avatar.component.scss']
})
export class ProfileAvatarComponent {
  /**
   * Avatar image URL
   */
  @Input() avatarUrl: string | null = null;

  /**
   * User's full name for fallback initials
   */
  @Input() fullName: string | null = null;

  /**
   * Size of the avatar
   * Options: 'small', 'normal', 'large', 'xlarge'
   */
  @Input() size: 'small' | 'normal' | 'large' | 'xlarge' = 'normal';

  /**
   * Shape of the avatar
   * Options: 'circle' | 'square'
   */
  @Input() shape: 'circle' | 'square' = 'circle';

  /**
   * Additional CSS classes
   */
  @Input() styleClass: string = '';

  /**
   * Get initials from full name for fallback
   */
  getInitials(): string {
    if (!this.fullName) {
      return 'U';
    }

    const names = this.fullName.trim().split(/\s+/);
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  /**
   * Get size class for PrimeNG Avatar
   */
  getSizeClass(): string {
    const sizeMap: Record<string, string> = {
      small: 'w-10 h-10 text-sm',
      normal: 'w-16 h-16 text-lg',
      large: 'w-24 h-24 text-2xl',
      xlarge: 'w-32 h-32 text-3xl'
    };
    return sizeMap[this.size] || sizeMap['normal'];
  }
}

