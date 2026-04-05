import { Component, inject } from '@angular/core';
import { ErrorDisplayComponent } from '@shared/reusable-components/error-display/error-display.component';
import { Router } from 'express';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ErrorDisplayComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  private router = inject(Router);

  goHome() {
    this.router.navigate(['/']);
  }
}
