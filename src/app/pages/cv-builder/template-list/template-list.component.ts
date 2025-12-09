import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CvTemplate, CvTemplateType } from '@app/models/cv-builder/cv-template.model';
import { CvTemplateService } from '@app/services/cv-builder/cv-template.service';

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
  imports: [CommonModule, RouterModule, CvTemplateTypePipe],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Choose Your CV Template</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (template of templates; track template.templateCode) {
          <div class="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
               [routerLink]="['/cv-builder/editor', template.templateCode]">
            <img [src]="template.sampleFileUrl" [alt]="template.name" class="w-full h-48 object-cover">
            <div class="p-4">
              <h3 class="text-xl font-semibold mb-2">{{template.name}}</h3>
              <p class="text-gray-600">{{template.description}}</p>
              <div class="mt-2 flex justify-between items-center">
                <span class="text-sm text-gray-500">{{template.type | cvTemplateType}}</span>
                <span [class]="template.isPublished ? 'text-green-600' : 'text-gray-400'">
                  {{template.isPublished ? 'Published' : 'Draft'}}
                </span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f5f5f5;
      min-height: 100vh;
    }
  `]
})
export class TemplateListComponent implements OnInit {
  templates: CvTemplate[] = [];

  constructor(private cvTemplateService: CvTemplateService) {}

  ngOnInit() {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    this.cvTemplateService.getCvTemplates({
      maxResultCount: 10,
      skipCount: 0,
      sorting: 'name asc'
    }).subscribe({
      next: (response) => {
        this.templates = response.items;
      },
      error: (error: Error) => {
        console.error('Error loading templates:', error);
        // TODO: Add error handling UI
      }
    });
  }
}