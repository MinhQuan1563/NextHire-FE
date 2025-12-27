import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="admin-overview">
      <h1>Admin Overview</h1>
      <p class="text-muted">Dashboard statistics and overview will be displayed here.</p>
      
      <div class="grid mt-4">
        <div class="col-12 md:col-6 lg:col-3">
          <p-card>
            <div class="text-center">
              <i class="pi pi-users text-4xl text-primary"></i>
              <h3 class="mt-3 mb-2">Total Users</h3>
              <p class="text-2xl font-bold">-</p>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-6 lg:col-3">
          <p-card>
            <div class="text-center">
              <i class="pi pi-briefcase text-4xl text-primary"></i>
              <h3 class="mt-3 mb-2">Total Jobs</h3>
              <p class="text-2xl font-bold">-</p>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-6 lg:col-3">
          <p-card>
            <div class="text-center">
              <i class="pi pi-building text-4xl text-primary"></i>
              <h3 class="mt-3 mb-2">Companies</h3>
              <p class="text-2xl font-bold">-</p>
            </div>
          </p-card>
        </div>
        
        <div class="col-12 md:col-6 lg:col-3">
          <p-card>
            <div class="text-center">
              <i class="pi pi-file text-4xl text-primary"></i>
              <h3 class="mt-3 mb-2">CV Templates</h3>
              <p class="text-2xl font-bold">-</p>
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-overview {
      h1 {
        margin-bottom: 0.5rem;
      }
      
      .text-muted {
        color: var(--text-color-secondary);
        margin-bottom: 2rem;
      }
    }
  `]
})
export class AdminOverviewComponent {}
