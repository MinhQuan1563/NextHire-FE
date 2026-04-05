import { Component, DestroyRef, inject, OnInit, Output } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@app/services/auth/auth.service';
import { SignalrService } from '@app/services/signalr/signalr.service';
import { MessageStateService } from '@app/services/message/message-stage.service';
import { User } from '@app/models/auth/auth.model';
import { ToastModule } from 'primeng/toast';
import { PermissionService } from '@app/services/permission/permission.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, ToastModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  currentUser: User | null = null;
  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private signalrService: SignalrService,
    private messageStateService: MessageStateService,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user: User | null) => {
          this.currentUser = user;
          
          if (user) {
            this.signalrService.startConnection();
            this.messageStateService.loadConversations();
            this.permissionService.loadPermissions();
          } 
          else {
            this.signalrService.stopConnection();
            this.messageStateService.clearConversations();
            this.permissionService.clearPermissions();
          }
        }
      });
  }
}