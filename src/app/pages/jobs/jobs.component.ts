import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputFieldComponent } from '@shared/reusable-components/input-field/input-field.component';
import { InfoSidebarComponent } from '@shared/reusable-components/info-sidebar/info-sidebar.component';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
      CommonModule,
      ButtonModule,
      ReactiveFormsModule,
      InputFieldComponent,
      InfoSidebarComponent
   ],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {
    searchForm!: FormGroup;

    jobs = [
        { id: 1, title: 'Frontend Developer (Angular)', companyName: 'Công ty A', location: 'TP. Hồ Chí Minh', salary: 'Thỏa thuận', tags: ['Angular', 'TypeScript'], postedDate: new Date() },
        { id: 2, title: 'Backend Developer (.NET)', companyName: 'Công ty B', location: 'Hà Nội', salary: '20-30 triệu', tags: ['.NET', 'C#', 'SQL'], postedDate: new Date(Date.now() - 86400000) }, // Hôm qua
    ];

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.searchForm = this.fb.group({
            query: [''],
            location: ['']
        });
    }

    performSearch(): void {
        if (this.searchForm.valid) {
            const queryValue = this.searchForm.value.query;
            const locationValue = this.searchForm.value.location;
            console.log('Searching for:', queryValue, 'in', locationValue);
            // Gọi service để tìm kiếm việc làm với các giá trị này...
        }
    }
}