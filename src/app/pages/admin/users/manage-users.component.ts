import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="manage-users">
      <h1>Manage Users</h1>
      <p class="text-muted">User management, CRUD operations, and role assignment will be implemented here.</p>
      
      <p-card class="mt-4">
        <div class="text-center py-5">
          <i class="pi pi-users text-6xl text-primary mb-3"></i>
          <h3>User Management</h3>
          <p class="text-muted">CRUD operations and role assignment coming soon...</p>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .manage-users {
      h1 {
        margin-bottom: 0.5rem;
      }
      
      .text-muted {
        color: var(--text-color-secondary);
      }
    }
  `]
})
export class ManageUsersComponent {}
