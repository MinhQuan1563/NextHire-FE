import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ErrorLogDto,
  ErrorLogListDto,
  PagedErrorLogDto,
  ErrorLogFilterParams,
  ParsedErrorLog,
  ErrorLogMetadata
} from '../../models/admin';

@Injectable({
  providedIn: 'root'
})
export class ErrorLogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ErrorLog`;

  /**
   * Get error logs with filters
   * GET /api/ErrorLog
   */
  getErrorLogs(params: ErrorLogFilterParams): Observable<ErrorLogListDto> {
    const httpParams = this.buildHttpParams(params);

    return this.http.get<ErrorLogListDto>(this.baseUrl, { params: httpParams })
      .pipe(
        catchError(this.handleError('getErrorLogs'))
      );
  }

  /**
   * Get single error log by ID
   * GET /api/ErrorLog/{logId}
   */
  getErrorLogById(logId: string): Observable<ErrorLogDto> {
    return this.http.get<ErrorLogDto>(`${this.baseUrl}/${logId}`)
      .pipe(
        catchError(this.handleError('getErrorLogById'))
      );
  }

  /**
   * Get paginated error logs
   * GET /api/ErrorLog/paginated
   */
  getErrorLogsPaginated(params: ErrorLogFilterParams): Observable<PagedErrorLogDto> {
    const httpParams = this.buildHttpParams(params);

    return this.http.get<PagedErrorLogDto>(`${this.baseUrl}/paginated`, { params: httpParams })
      .pipe(
        catchError(this.handleError('getErrorLogsPaginated'))
      );
  }

  /**
   * Parse error log metadata JSON string to object
   */
  parseMetadata(metadataString: string): ErrorLogMetadata | null {
    try {
      return JSON.parse(metadataString) as ErrorLogMetadata;
    } catch (error) {
      if (!environment.production) {
        console.error('[ErrorLogService] Failed to parse metadata:', error);
      }
      return null;
    }
  }

  /**
   * Parse error log DTO to display-friendly format
   */
  parseErrorLog(log: ErrorLogDto): ParsedErrorLog {
    const metadata = this.parseMetadata(log.metadata);
    return {
      logId: log.logId,
      createDate: new Date(log.createDate),
      metadata: metadata || {
        Timestamp: log.createDate,
        Level: 'Unknown',
        Type: null,
        Source: null,
        Domain: null,
        Message: 'Unable to parse metadata',
        Exception: null
      },
      rawMetadata: log.metadata
    };
  }

  /**
   * Parse array of error logs
   */
  parseErrorLogs(logs: ErrorLogDto[]): ParsedErrorLog[] {
    return logs.map(log => this.parseErrorLog(log));
  }

  /**
   * Export logs to CSV format
   */
  exportToCsv(logs: ParsedErrorLog[]): string {
    const headers = ['Timestamp', 'Level', 'Type', 'Source', 'Domain', 'Message', 'Exception'];
    const csvRows = [headers.join(',')];

    for (const log of logs) {
      const row = [
        this.escapeCsvValue(log.metadata.Timestamp),
        this.escapeCsvValue(log.metadata.Level),
        this.escapeCsvValue(log.metadata.Type || ''),
        this.escapeCsvValue(log.metadata.Source || ''),
        this.escapeCsvValue(log.metadata.Domain || ''),
        this.escapeCsvValue(log.metadata.Message),
        this.escapeCsvValue(log.metadata.Exception || '')
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Export logs to JSON format
   */
  exportToJson(logs: ParsedErrorLog[]): string {
    const exportData = logs.map(log => ({
      logId: log.logId,
      createDate: log.createDate.toISOString(),
      ...log.metadata
    }));
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Generate export filename with timestamp
   */
  generateExportFilename(extension: 'csv' | 'json'): string {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, 19);
    return `error_logs_${timestamp}.${extension}`;
  }

  /**
   * Trigger file download
   */
  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private buildHttpParams(params: ErrorLogFilterParams): HttpParams {
    let httpParams = new HttpParams();

    if (params.FromDate) {
      httpParams = httpParams.set('FromDate', params.FromDate);
    }
    if (params.ToDate) {
      httpParams = httpParams.set('ToDate', params.ToDate);
    }
    if (params.Level) {
      httpParams = httpParams.set('Level', params.Level);
    }
    if (params.Source) {
      httpParams = httpParams.set('Source', params.Source);
    }
    if (params.PageSize !== undefined) {
      httpParams = httpParams.set('PageSize', params.PageSize.toString());
    }
    if (params.PageStart !== undefined) {
      httpParams = httpParams.set('PageStart', params.PageStart.toString());
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
        console.error(`[ErrorLogService] ${operation} failed:`, {
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
