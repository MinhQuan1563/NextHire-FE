/**
 * Serilog log levels
 */
export enum LogLevel {
  VERBOSE = 'Verbose',
  DEBUG = 'Debug',
  INFORMATION = 'Information',
  WARNING = 'Warning',
  ERROR = 'Error',
  FATAL = 'Fatal'
}

/**
 * Log level option for dropdown selector
 */
export interface LogLevelOption {
  label: string;
  value: string;
  severity: 'info' | 'success' | 'warning' | 'danger' | 'secondary' | 'contrast';
}

/**
 * Error log metadata structure from Serilog
 */
export interface ErrorLogMetadata {
  Timestamp: string;
  Level: string;
  Type: string | null;
  Source: string | null;
  Domain: string | null;
  Message: string;
  Exception: string | null;
}

/**
 * Error log DTO from API
 */
export interface ErrorLogDto {
  logId: string;
  metadata: string;
  createDate: string;
}

/**
 * Error log list response from API
 */
export interface ErrorLogListDto {
  items: ErrorLogDto[];
  totalCount: number;
}

/**
 * Paginated error log response from API
 */
export interface PagedErrorLogDto {
  items: ErrorLogDto[];
  totalCount: number;
}

/**
 * Error log filter parameters for API requests
 */
export interface ErrorLogFilterParams {
  FromDate?: string;
  ToDate?: string;
  Level?: string;
  Source?: string;
  PageSize?: number;
  PageStart?: number;
}

/**
 * Parsed error log for display
 */
export interface ParsedErrorLog {
  logId: string;
  createDate: Date;
  metadata: ErrorLogMetadata;
  rawMetadata: string;
}

/**
 * Log level options for dropdown
 */
export const LOG_LEVEL_OPTIONS: LogLevelOption[] = [
  { label: 'All Levels', value: '', severity: 'secondary' },
  { label: 'Verbose', value: LogLevel.VERBOSE, severity: 'secondary' },
  { label: 'Debug', value: LogLevel.DEBUG, severity: 'info' },
  { label: 'Information', value: LogLevel.INFORMATION, severity: 'success' },
  { label: 'Warning', value: LogLevel.WARNING, severity: 'warning' },
  { label: 'Error', value: LogLevel.ERROR, severity: 'danger' },
  { label: 'Fatal', value: LogLevel.FATAL, severity: 'danger' }
];

/**
 * Page size options for pagination
 */
export const PAGE_SIZE_OPTIONS: number[] = [10, 25, 50, 100];
