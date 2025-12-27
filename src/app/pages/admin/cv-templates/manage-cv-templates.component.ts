import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-manage-cv-templates',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="manage-cv-templates">
      <h1>Manage CV Templates</h1>
      <p class="text-muted">CV template management, upload, preview, and download functionality will be implemented here.</p>
      
      <p-card class="mt-4">
        <div class="text-center py-5">
          <i class="pi pi-file text-6xl text-primary mb-3"></i>
          <h3>CV Template Management</h3>
          <p class="text-muted">Upload, preview, and download features coming soon...</p>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .manage-cv-templates {
      h1 {
        margin-bottom: 0.5rem;
      }
      
      .text-muted {
        color: var(--text-color-secondary);
      }
    }
  `]
})
export class ManageCvTemplatesComponent {}
