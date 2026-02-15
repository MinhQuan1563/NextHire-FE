import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const messageService = inject(MessageService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';
      let severity: 'error' | 'warn' | 'info' = 'error';

      if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
        errorMessage = `Network error: ${error.error.message}`;
        logError('Client-side error', error);
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            severity = 'warn';
            break;
          case 400:
            errorMessage = error.error?.message || 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Your session has expired. Please log in again.';
            router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = error.error?.message || 'The requested resource was not found.';
            break;
          case 409:
            errorMessage = error.error?.message || 'A conflict occurred. The resource may already exist.';
            break;
          case 422:
            errorMessage = error.error?.message || 'Validation failed. Please check your input.';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            severity = 'error';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            severity = 'warn';
            break;
          default:
            errorMessage = error.error?.message || `Server error (${error.status}). Please try again.`;
        }

        logError(`HTTP ${error.status} error`, error);
      }

      if (error.status !== 401) {
        messageService.add({
          severity,
          summary: getErrorSummary(error.status),
          detail: errorMessage,
          life: 5000
        });
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};

function getErrorSummary(status: number): string {
  switch (status) {
    case 0:
      return 'Connection Error';
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Validation Error';
    case 500:
      return 'Server Error';
    case 503:
      return 'Service Unavailable';
    default:
      return 'Error';
  }
}

function logError(context: string, error: HttpErrorResponse): void {
  if (!environment.production) {
    console.error(`[ErrorInterceptor] ${context}:`, {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      url: error.url,
      error: error.error
    });
  }
}
