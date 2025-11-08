import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CvTemplate, CvTemplateType, CreateCvTemplate, UpdateCvTemplate } from '@app/models/cv-builder/cv-template.model';
import { CvTemplateService } from '@app/services/cv-builder/cv-template.service';

@Component({
  selector: 'app-admin-template',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Manage CV Templates</h1>
      
      <!-- Template List -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">Templates</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full table-auto">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-6 py-3 text-left">Name</th>
                <th class="px-6 py-3 text-left">Description</th>
                <th class="px-6 py-3 text-center">Status</th>
                <th class="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (template of templates; track template.templateCode) {
                <tr class="border-b">
                  <td class="px-6 py-4">{{template.name}}</td>
                  <td class="px-6 py-4">{{template.description}}</td>
                  <td class="px-6 py-4 text-center">
                    <span [class]="template.isPublished ? 'text-green-600' : 'text-red-600'">
                      {{template.isPublished ? 'Published' : 'Draft'}}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <button (click)="editTemplate(template)" 
                            class="text-blue-600 hover:text-blue-800 mr-2">
                      Edit
                    </button>
                    <button (click)="deleteTemplate(template.templateCode)" 
                            class="text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Template Editor -->
      @if (showEditor) {
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold mb-4">
            {{editingTemplate ? 'Edit Template' : 'Create New Template'}}
          </h2>
          <form (submit)="saveTemplate()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" [(ngModel)]="currentTemplate.name" name="name"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" [(ngModel)]="currentTemplate.description" name="description"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Template Type</label>
              <select [(ngModel)]="currentTemplate.type" name="type"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option [ngValue]="CvTemplateType.Resume">Resume</option>
                <option [ngValue]="CvTemplateType.CoverLetter">Cover Letter</option>
                <option [ngValue]="CvTemplateType.Portfolio">Portfolio</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Sample File URL</label>
              <input type="text" [(ngModel)]="currentTemplate.sampleFileUrl" name="sampleFileUrl"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Layout Configuration</label>
              <quill-editor [(ngModel)]="currentTemplate.layoutConfiguration" name="layoutConfiguration"
                           [styles]="{height: '200px'}"
                           [modules]="quillModules">
              </quill-editor>
            </div>

            @if (editingTemplate) {
              <div>
                <label class="flex items-center">
                  <input type="checkbox" [(ngModel)]="currentTemplate.isPublished" name="isPublished"
                         class="rounded border-gray-300 text-blue-600 shadow-sm">
                  <span class="ml-2">Published</span>
                </label>
              </div>
            }

            <div class="flex justify-end space-x-4">
              <button type="button" (click)="cancelEdit()"
                      class="px-4 py-2 border border-gray-300 rounded shadow-sm text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Save
              </button>
            </div>
          </form>
        </div>
      } @else {
        <button (click)="createNewTemplate()"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Create New Template
        </button>
      }
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
export class AdminTemplateComponent implements OnInit {
  templates: CvTemplate[] = [];
  showEditor = false;
  editingTemplate: boolean = false;
  CvTemplateType = CvTemplateType; // Make enum available in template
  
  currentTemplate: CreateCvTemplate & Partial<CvTemplate> = {
    name: '',
    type: CvTemplateType.Resume,
    description: '',
    sampleFileUrl: '',
    layoutConfiguration: '',
    isPublished: false
  };

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['code-block'],
      ['clean']
    ]
  };

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

  createNewTemplate(): void {
    this.editingTemplate = false;
    this.currentTemplate = {
      name: '',
      type: CvTemplateType.Resume,
      description: '',
      sampleFileUrl: '',
      layoutConfiguration: '',
      isPublished: false
    };
    this.showEditor = true;
  }

  editTemplate(template: CvTemplate): void {
    this.editingTemplate = true;
    this.currentTemplate = {
      ...template
    };
    this.showEditor = true;
  }

  cancelEdit(): void {
    this.showEditor = false;
    this.editingTemplate = false;
    this.currentTemplate = {
      name: '',
      type: CvTemplateType.Resume,
      description: '',
      sampleFileUrl: '',
      layoutConfiguration: '',
      isPublished: false
    };
  }

  saveTemplate(): void {
    if (this.editingTemplate && this.currentTemplate.templateCode) {
      this.cvTemplateService.updateTemplate(
        this.currentTemplate.templateCode,
        {
          name: this.currentTemplate.name,
          type: this.currentTemplate.type,
          description: this.currentTemplate.description,
          sampleFileUrl: this.currentTemplate.sampleFileUrl,
          layoutConfiguration: this.currentTemplate.layoutConfiguration
        }
      ).subscribe({
        next: () => {
          this.loadTemplates();
          this.cancelEdit();
        },
        error: (error: Error) => {
          console.error('Error updating template:', error);
          // TODO: Add error handling UI
        }
      });
    } else {
      this.cvTemplateService.createTemplate(this.currentTemplate)
        .subscribe({
          next: () => {
            this.loadTemplates();
            this.cancelEdit();
          },
          error: (error: Error) => {
            console.error('Error creating template:', error);
            // TODO: Add error handling UI
          }
        });
    }
  }

  deleteTemplate(templateCode: string): void {
    if (confirm('Are you sure you want to delete this template?')) {
      this.cvTemplateService.deleteTemplate(templateCode).subscribe({
        next: () => {
          this.loadTemplates();
        },
        error: (error: Error) => {
          console.error('Error deleting template:', error);
          // TODO: Add error handling UI
        }
      });
    }
  }
}