import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-manage-companies',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="manage-companies">
      <h1>Manage Companies</h1>
      <p class="text-muted">Company management, verification toggle, and status control will be implemented here.</p>
      
      <p-card class="mt-4">
        <div class="text-center py-5">
          <i class="pi pi-building text-6xl text-primary mb-3"></i>
          <h3>Company Management</h3>
          <p class="text-muted">Verification and status management coming soon...</p>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .manage-companies {
      h1 {
        margin-bottom: 0.5rem;
      }
      
      .text-muted {
        color: var(--text-color-secondary);
      }
    }
  `]
})
export class ManageCompaniesComponent {}
