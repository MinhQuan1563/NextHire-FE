import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../models/auth/auth.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-info-sidebar',
  standalone: true,
  imports: [CommonModule, AvatarModule],
  templateUrl: './info-sidebar.component.html',
  styleUrls: ['./info-sidebar.component.scss']
})
export class InfoSidebarComponent implements OnInit {

  private destroyRef = inject(DestroyRef)
  currentUser : User | null = null;
  constructor(private authService: AuthService) {
  }
  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (user : User | null) => {
        this.currentUser = user;
      }
    })
  }
}