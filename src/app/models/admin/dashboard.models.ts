/**
 * Time range enum for dashboard filtering
 * Maps to backend TimeRangeEnum values (1-5)
 */
export enum TimeRangeEnum {
  TODAY = 1,
  THIS_WEEK = 2,
  THIS_MONTH = 3,
  THIS_YEAR = 4,
  CUSTOM = 5
}

/**
 * Trend data point for time-series charts
 */
export interface TrendDataPointDTO {
  date: string;
  value: number;
}

/**
 * Job distribution by industry or type
 */
export interface JobDistributionDTO {
  category: string;
  count: number;
  percentage: number;
}

/**
 * User statistics response from API
 */
export interface UserStatisticsResponseDTO {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsers: number;
  userGrowthTrend: TrendDataPointDTO[];
}

/**
 * Job statistics response from API
 */
export interface JobStatisticsResponseDTO {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  jobsPostedToday: number;
  jobsPostedThisWeek: number;
  jobsPostedThisMonth: number;
  averageApplicationsPerJob: number;
  jobPostingTrend: TrendDataPointDTO[];
  jobsByIndustry: JobDistributionDTO[];
  jobsByType: JobDistributionDTO[];
}

/**
 * Company statistics response from API
 */
export interface CompanyStatisticsResponseDTO {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  newCompaniesToday: number;
  newCompaniesThisWeek: number;
  newCompaniesThisMonth: number;
  companyGrowthTrend: TrendDataPointDTO[];
}

/**
 * Application statistics response from API
 */
export interface ApplicationStatisticsResponseDTO {
  totalApplications: number;
  applicationsToday: number;
  applicationsThisWeek: number;
  applicationsThisMonth: number;
  pendingApplications: number;
  reviewedApplications: number;
  interviewedApplications: number;
  hiredApplications: number;
  rejectedApplications: number;
  cancelledApplications: number;
  applicationTrend: TrendDataPointDTO[];
  applicationsByStatus: JobDistributionDTO[];
}

/**
 * Complete dashboard overview response from API
 */
export interface DashboardOverviewResponseDTO {
  userStatistics: UserStatisticsResponseDTO;
  jobStatistics: JobStatisticsResponseDTO;
  companyStatistics: CompanyStatisticsResponseDTO;
  applicationStatistics: ApplicationStatisticsResponseDTO;
  lastUpdated: string;
}

/**
 * Time range filter parameters for API requests
 */
export interface TimeRangeFilterParams {
  timeRange: TimeRangeEnum;
  startDate?: string;
  endDate?: string;
}

/**
 * Time range option for selector component
 */
export interface TimeRangeOption {
  label: string;
  value: TimeRangeEnum;
  icon?: string;
}
