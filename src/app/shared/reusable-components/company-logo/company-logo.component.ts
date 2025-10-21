import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-logo.component.html',
  styleUrls: ['./company-logo.component.scss']
})
export class CompanyLogoComponent {
  @Input() src: string | undefined | null;
  @Input() alt: string = 'Company Logo';
  @Input() width: string = '60px';
  @Input() height: string = 'auto';
  @Input() defaultLogo: string = 'favicon.ico';

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultLogo;
  }
}