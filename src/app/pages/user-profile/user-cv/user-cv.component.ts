import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-cv',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-cv.component.html',
  styleUrls: ['./user-cv.component.scss']
})
export class UserCvComponent {
  // Loading state
  loading = signal<boolean>(false);
  
  // Error state
  error = signal<string | null>(null);
  
  // CV list will be loaded here
  // cvList = signal<UserCv[]>([]);
}

