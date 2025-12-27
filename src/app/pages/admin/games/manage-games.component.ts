import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-manage-games',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="manage-games">
      <h1>Manage Games</h1>
      <p class="text-muted">Mini game management and enable/disable controls will be implemented here.</p>
      
      <p-card class="mt-4">
        <div class="text-center py-5">
          <i class="pi pi-box text-6xl text-primary mb-3"></i>
          <h3>Game Management</h3>
          <p class="text-muted">Enable/disable game controls coming soon...</p>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .manage-games {
      h1 {
        margin-bottom: 0.5rem;
      }
      
      .text-muted {
        color: var(--text-color-secondary);
      }
    }
  `]
})
export class ManageGamesComponent {}
