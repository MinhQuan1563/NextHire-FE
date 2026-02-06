import { Component, inject } from '@angular/core';
import { ErrorDisplayComponent } from '@shared/reusable-components/error-display/error-display.component';
import { Router } from 'express';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [ErrorDisplayComponent],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.scss'
})
export class ForbiddenComponent {
  private router = inject(Router);

  goHome() {
    this.router.navigate(['/']);
  }
}
