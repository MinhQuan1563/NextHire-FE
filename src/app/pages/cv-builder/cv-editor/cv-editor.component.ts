import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CvTemplate } from '@app/models/cv-builder/cv-template.model';
import { CvTemplateService } from '@app/services/cv-builder/cv-template.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-cv-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule, DragDropModule],
  template: `
    @if (template) {
      <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Editor Section -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold mb-6">{{template.name}}</h2>
            
            <!-- Personal Information -->
            <div class="mb-6">
              <h3 class="text-xl font-semibold mb-4">Personal Information</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" [(ngModel)]="cvData.name" 
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" [(ngModel)]="cvData.email" 
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" [(ngModel)]="cvData.phone" 
                         class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
              </div>
            </div>

            <!-- Rich Text Editor for Professional Summary -->
            <div class="mb-6">
              <h3 class="text-xl font-semibold mb-4">Professional Summary</h3>
              <quill-editor [(ngModel)]="cvData.summary" 
                           [styles]="{height: '200px'}"
                           [modules]="quillModules">
              </quill-editor>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-4">
              <button (click)="saveCV()" 
                      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Save
              </button>
              <button (click)="exportToPDF()" 
                      class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Export to PDF
              </button>
            </div>
          </div>

          <!-- Preview Section -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold mb-6">Preview</h2>
            <div #cvPreview class="cv-preview">
              <div [innerHTML]="previewTemplate"></div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center h-screen">
        <p class="text-xl text-gray-600">Loading template...</p>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .cv-preview {
      background: white;
      padding: 20px;
      border: 1px solid #e5e7eb;
      min-height: 297mm;
      width: 210mm;
      margin: 0 auto;
    }
  `]
})
export class CvEditorComponent implements OnInit {
  template: CvTemplate | null = null;
  cvData: any = {
    name: '',
    email: '',
    phone: '',
    summary: '',
    // Add more fields as needed
  };

  previewTemplate: string = '';
  
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private cvTemplateService: CvTemplateService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const templateCode = params['id']; // Keep the route param as 'id' for now
      if (templateCode) {
        this.loadTemplate(templateCode);
      }
    });
  }

  private loadTemplate(templateCode: string): void {
    this.cvTemplateService.getCvTemplateByCode(templateCode).subscribe({
      next: (template: CvTemplate) => {
        this.template = template;
        this.updatePreview();
      },
      error: (error: Error) => {
        console.error('Error loading template:', error);
        // TODO: Add error handling UI
      }
    });
  }

  private updatePreview(): void {
    if (!this.template?.layoutConfiguration) return;
    
    let preview = this.template.layoutConfiguration;
    // Replace placeholders with actual data
    preview = preview.replace(/{{name}}/g, this.cvData.name || '');
    preview = preview.replace(/{{email}}/g, this.cvData.email || '');
    preview = preview.replace(/{{phone}}/g, this.cvData.phone || '');
    preview = preview.replace(/{{summary}}/g, this.cvData.summary || '');
    
    this.previewTemplate = preview;
  }

  saveCV(): void {
    // TODO: Implement save functionality
    console.log('Saving CV...', this.cvData);
  }

  async exportToPDF(): Promise<void> {
    const element = document.querySelector('.cv-preview') as HTMLElement;
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      // A4 size: 210mm × 297mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('cv.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      // TODO: Add error handling UI
    }
  }
}