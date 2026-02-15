import { Component, inject, OnInit, Pipe, PipeTransform, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CvTemplate, CvTemplateType } from '@app/models/cv-builder/cv-template.model';
import { CvTemplateService } from '@app/services/cv-builder/cv-template.service';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { CardModule } from 'primeng/card';
import { AuthService } from '@app/services/auth/auth.service';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
@Pipe({
  name: 'cvTemplateType',
  standalone: true
})
export class CvTemplateTypePipe implements PipeTransform {
  transform(value: CvTemplateType): string {
    switch (value) {
      case CvTemplateType.Resume:
        return 'Resume';
      case CvTemplateType.CoverLetter:
        return 'Cover Letter';
      case CvTemplateType.Portfolio:
        return 'Portfolio';
      default:
        return 'Unknown';
    }
  }
}
@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CvTemplateTypePipe, TagModule, ImageModule, CardModule, ButtonModule, PaginatorModule, ProgressSpinnerModule, SkeletonModule],
  templateUrl:'./template-list.component.html',
  styleUrl: './template-list.component.scss',
})
export class TemplateListComponent implements OnInit {
  templates: CvTemplate[] = [];
  isAdmin = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  
  // Pagination state
  totalRecords = signal<number>(0);
  first = signal<number>(0);
  rows = signal<number>(12);
  rowsPerPageOptions = [12, 24, 36, 48];

  private cvTemplateService = inject(CvTemplateService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.checkAdminStatus();
    this.loadTemplates();
  }

  private checkAdminStatus(): void {
    this.isAdmin.set(this.authService.isAdmin());
  }

  navigateToTemplate(templateCode: string): void {
    this.router.navigate(['/cv-template/editor', templateCode]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/cv-template/editor', 'new']);
  }

  onPageChange(event: PaginatorState): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 12);
    this.loadTemplates();
  }

  private loadTemplates(): void {
    this.isLoading.set(true);
    const skipCount = this.first();
    const maxResultCount = this.rows();

    this.cvTemplateService.getCvTemplates({
      maxResultCount,
      skipCount,
      sorting: 'name asc'
    }).subscribe({
      next: (response) => {
        this.templates = response.items;
        this.totalRecords.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        console.error('Error loading templates:', error);
        this.isLoading.set(false);
        // TODO: Add error handling UIs
      }
    });
  }
}