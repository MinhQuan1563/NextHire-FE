import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-error-logs-viewer',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="error-logs-viewer">
      <h1>Error Logs Viewer</h1>
      <p class="text-muted">Error log table displaying JSON metadata from backend will be implemented here.</p>
      
      <p-card class="mt-4">
        <div class="text-center py-5">
          <i class="pi pi-exclamation-triangle text-6xl text-orange-500 mb-3"></i>
          <h3>Error Logs</h3>
          <p class="text-muted">Log viewer with JSON metadata display coming soon...</p>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .error-logs-viewer {
      h1 {
        margin-bottom: 0.5rem;
      }
      
      .text-muted {
        color: var(--text-color-secondary);
      }
    }
  `]
})
export class ErrorLogsViewerComponent {}
