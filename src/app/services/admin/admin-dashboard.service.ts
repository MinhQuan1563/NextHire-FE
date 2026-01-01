import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DashboardOverviewResponseDTO,
  UserStatisticsResponseDTO,
  JobStatisticsResponseDTO,
  CompanyStatisticsResponseDTO,
  ApplicationStatisticsResponseDTO,
  TimeRangeFilterParams
} from '../../models/admin';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/dashboard`;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  getOverview(params: TimeRangeFilterParams): Observable<DashboardOverviewResponseDTO> {
    const httpParams = this.buildHttpParams(params);
    
    if (!environment.production) {
      console.log('[AdminDashboardService] getOverview called with params:', params);
    }

    return this.http.get<DashboardOverviewResponseDTO>(`${this.baseUrl}/overview`, { params: httpParams })
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            if (!environment.production) {
              console.warn(`[AdminDashboardService] Retry attempt ${retryCount} for getOverview`, error);
            }
            return throwError(() => error).pipe(delay(this.retryDelay * retryCount));
          }
        }),
        catchError(this.handleError('getOverview'))
      );
  }

  getUserStatistics(params: TimeRangeFilterParams): Observable<UserStatisticsResponseDTO> {
    const httpParams = this.buildHttpParams(params);
    
    if (!environment.production) {
      console.log('[AdminDashboardService] getUserStatistics called with params:', params);
    }

    return this.http.get<UserStatisticsResponseDTO>(`${this.baseUrl}/user-statistics`, { params: httpParams })
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            if (!environment.production) {
              console.warn(`[AdminDashboardService] Retry attempt ${retryCount} for getUserStatistics`, error);
            }
            return throwError(() => error).pipe(delay(this.retryDelay * retryCount));
          }
        }),
        catchError(this.handleError('getUserStatistics'))
      );
  }

  getJobStatistics(params: TimeRangeFilterParams): Observable<JobStatisticsResponseDTO> {
    const httpParams = this.buildHttpParams(params);
    
    if (!environment.production) {
      console.log('[AdminDashboardService] getJobStatistics called with params:', params);
    }

    return this.http.get<JobStatisticsResponseDTO>(`${this.baseUrl}/job-statistics`, { params: httpParams })
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            if (!environment.production) {
              console.warn(`[AdminDashboardService] Retry attempt ${retryCount} for getJobStatistics`, error);
            }
            return throwError(() => error).pipe(delay(this.retryDelay * retryCount));
          }
        }),
        catchError(this.handleError('getJobStatistics'))
      );
  }

  getCompanyStatistics(params: TimeRangeFilterParams): Observable<CompanyStatisticsResponseDTO> {
    const httpParams = this.buildHttpParams(params);
    
    if (!environment.production) {
      console.log('[AdminDashboardService] getCompanyStatistics called with params:', params);
    }

    return this.http.get<CompanyStatisticsResponseDTO>(`${this.baseUrl}/company-statistics`, { params: httpParams })
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            if (!environment.production) {
              console.warn(`[AdminDashboardService] Retry attempt ${retryCount} for getCompanyStatistics`, error);
            }
            return throwError(() => error).pipe(delay(this.retryDelay * retryCount));
          }
        }),
        catchError(this.handleError('getCompanyStatistics'))
      );
  }

  getApplicationStatistics(params: TimeRangeFilterParams): Observable<ApplicationStatisticsResponseDTO> {
    const httpParams = this.buildHttpParams(params);
    
    if (!environment.production) {
      console.log('[AdminDashboardService] getApplicationStatistics called with params:', params);
    }

    return this.http.get<ApplicationStatisticsResponseDTO>(`${this.baseUrl}/application-statistics`, { params: httpParams })
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            if (!environment.production) {
              console.warn(`[AdminDashboardService] Retry attempt ${retryCount} for getApplicationStatistics`, error);
            }
            return throwError(() => error).pipe(delay(this.retryDelay * retryCount));
          }
        }),
        catchError(this.handleError('getApplicationStatistics'))
      );
  }

  private buildHttpParams(params: TimeRangeFilterParams): HttpParams {
    let httpParams = new HttpParams().set('timeRange', params.timeRange.toString());

    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }

    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }

    return httpParams;
  }

  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMessage = 'An unknown error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Client-side error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Invalid request parameters.';
            break;
          case 401:
            errorMessage = 'You are not authorized to access this resource. Please log in.';
            break;
          case 403:
            errorMessage = 'You do not have permission to access this resource.';
            break;
          case 404:
            errorMessage = 'The requested resource was not found.';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `Server error: ${error.status}`;
        }
      }

      if (!environment.production) {
        console.error(`[AdminDashboardService] ${operation} failed:`, {
          error,
          message: errorMessage,
          status: error.status,
          statusText: error.statusText
        });
      }

      return throwError(() => new Error(errorMessage));
    };
  }
}
