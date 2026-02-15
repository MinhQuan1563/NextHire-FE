# Admin Dashboard Overview - Technical Planning Document

**Date**: 2026-01-01  
**Status**: ✅ Task 1 Complete  
**PRD Reference**: `Admin_Dashboard_Overview_Feature_prd.md`

---

## Task 1: Planning & Alignment - COMPLETED ✅

### 1.1 PRD Review and Validation ✅

#### PRD Analysis Summary
- **Feature Scope**: Admin Dashboard Overview Page with 4 main statistics sections
- **Target Users**: System Administrators and Platform Managers
- **Key Metrics**: 30+ KPIs across Users, Jobs, Companies, and Applications
- **Visualizations**: Line charts, pie/donut charts, bar charts, funnel visualizations

#### API Endpoints Confirmed
✅ **Primary Endpoint**: `/api/admin/dashboard/overview`
- Returns consolidated `DashboardOverviewResponseDTO`
- Supports query parameters: `timeRange`, `startDate`, `endDate`

✅ **Fallback Endpoints** (if needed):
- `/api/admin/dashboard/users/statistics` → `UserStatisticsResponseDTO`
- `/api/admin/dashboard/jobs/statistics` → `JobStatisticsResponseDTO`
- `/api/admin/dashboard/companies/statistics` → `CompanyStatisticsResponseDTO`
- `/api/admin/dashboard/applications/statistics` → `ApplicationStatisticsResponseDTO`

#### TimeRangeEnum Mapping Confirmed
```typescript
enum TimeRangeEnum {
  Today = 1,
  ThisWeek = 2,
  ThisMonth = 3,
  ThisYear = 4,
  Custom = 5
}
```

#### Authentication & Authorization Verified
✅ **Admin Guard**: `admin.guard.ts` exists at `src/app/guards/admin.guard.ts`
- Currently allows all access (commented out checks)
- **ACTION REQUIRED**: Uncomment admin role validation before production
- Uses `AuthService.isAdmin()` method which checks for 'admin' role

✅ **Auth Service**: Provides `isAdmin()` method
- Checks user roles array for 'admin' role (case-insensitive)
- Returns boolean indicating admin status

#### PRD Gaps/Clarifications
✅ **No major gaps identified**
- All functional requirements are clear and implementable
- API structure matches PRD expectations
- Non-functional requirements are achievable

---

### 1.2 Technical Stack Confirmation ✅

#### Angular Version
✅ **Angular 17.3.0** (Standalone Components)
- No modules required - using standalone component architecture
- Modern Angular features available (signals, inject function, etc.)

#### UI Component Library
✅ **PrimeNG 17.18.15**
- Already installed and configured
- Available components: Card, Button, Dropdown, Calendar, Chart, etc.
- PrimeIcons 6.0.1 for iconography

#### Styling Framework
✅ **TailwindCSS 3.4.18**
- Configured and ready to use
- Utility-first CSS approach
- Responsive design utilities available

#### Charting Library Decision
**RECOMMENDATION: PrimeNG Chart (p-chart)**
- ✅ Already included with PrimeNG
- ✅ Based on Chart.js (proven, stable)
- ✅ Angular-native integration
- ✅ Supports all required chart types:
  - Line charts (trends)
  - Bar charts (distributions)
  - Pie/Donut charts (percentages)
- ✅ Responsive and customizable
- ✅ No additional dependencies needed

**Alternative Considered**: ng2-charts or ApexCharts
- Not needed since PrimeNG Chart meets all requirements

#### Date Picker Component
✅ **PrimeNG Calendar (p-calendar)**
- Available in PrimeNG
- Supports date range selection
- Customizable and accessible

#### State Management
✅ **NgRx Store 17.2.0** (Optional)
- Already installed but not required for this feature
- Will use **Service + BehaviorSubject** pattern (simpler, matches existing codebase)

---

### 1.3 Environment Setup ✅

#### Development Environment
✅ **Verified**:
- Node.js and npm installed
- Angular CLI 17.3.17 available
- Project builds successfully
- Development server runs on `ng serve`

#### API Configuration
✅ **Environment Files**:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)
- API base URL configured via `environment.apiUrl`

#### Admin Test Account
⚠️ **ACTION REQUIRED**:
- Need to create/verify admin test account with backend team
- Ensure test account has 'admin' role assigned
- Test credentials should be documented for QA

#### Linting & Formatting
✅ **Configured**:
- ESLint 9.38.0 with Angular ESLint
- Prettier 3.6.2 for code formatting
- TypeScript 5.4.2 with strict mode

---

## Task 2: Design & Architecture - COMPLETED ✅

### 2.1 Component Architecture Design ✅

#### Component Hierarchy
```
AdminOverviewComponent (Smart Component)
├── TimeRangeSelectorComponent (Shared)
├── UserStatisticsCardComponent (Feature)
│   └── LineChartComponent (Shared)
├── JobStatisticsCardComponent (Feature)
│   ├── LineChartComponent (Shared)
│   ├── PieChartComponent (Shared)
│   └── BarChartComponent (Shared)
├── CompanyStatisticsCardComponent (Feature)
│   ├── LineChartComponent (Shared)
│   └── DonutChartComponent (Shared)
└── ApplicationStatisticsCardComponent (Feature)
    ├── LineChartComponent (Shared)
    └── FunnelChartComponent (Shared)
```

#### Component Responsibilities

**AdminOverviewComponent** (Smart/Container)
- Fetch data from AdminDashboardService
- Manage time range state
- Handle refresh logic
- Distribute data to child components
- Handle global loading/error states

**Statistic Card Components** (Presentational)
- Display metrics and visualizations
- Receive data via @Input()
- Handle local loading/error/empty states
- Emit events if needed (@Output())

**Chart Components** (Reusable/Shared)
- Wrap PrimeNG p-chart
- Accept chart data and configuration via @Input()
- Provide consistent styling and theming
- Handle responsive sizing

**TimeRangeSelectorComponent** (Shared)
- Display time range options
- Handle custom date range selection
- Emit time range changes via @Output()

#### Communication Patterns
- **Parent → Child**: @Input() for data flow
- **Child → Parent**: @Output() EventEmitter for events
- **Service**: AdminDashboardService for API calls and data management
- **State**: BehaviorSubject in service for reactive data

#### State Management Strategy
**Service-based with RxJS**:
- AdminDashboardService holds dashboard state
- BehaviorSubjects for reactive data streams
- Components subscribe to observables
- Async pipe in templates for automatic subscription management

---

### 2.2 Data Models & Interfaces ✅

#### File Structure
```
src/app/pages/admin/dashboard/
└── models/
    └── dashboard.models.ts (All interfaces in one file)
```

#### Interface Definitions

```typescript
// Enums
export enum TimeRangeEnum {
  Today = 1,
  ThisWeek = 2,
  ThisMonth = 3,
  ThisYear = 4,
  Custom = 5
}

// Request Parameters
export interface DashboardParams {
  timeRange?: TimeRangeEnum;
  startDate?: string; // ISO 8601 format
  endDate?: string;   // ISO 8601 format
}

// Response DTOs
export interface DashboardOverviewResponseDTO {
  userStatistics: UserStatisticsResponseDTO;
  jobStatistics: JobStatisticsResponseDTO;
  companyStatistics: CompanyStatisticsResponseDTO;
  applicationStatistics: ApplicationStatisticsResponseDTO;
}

export interface UserStatisticsResponseDTO {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsers: number;
  userGrowthTrend: TrendDataPointDTO[];
}

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

export interface CompanyStatisticsResponseDTO {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  newCompaniesToday: number;
  newCompaniesThisWeek: number;
  newCompaniesThisMonth: number;
  companyGrowthTrend: TrendDataPointDTO[];
}

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
}

export interface TrendDataPointDTO {
  date: string; // ISO 8601 date-time
  count: number;
}

export interface JobDistributionDTO {
  category: string;
  count: number;
  percentage: number;
}

// UI State Models
export interface TimeRangeSelection {
  type: TimeRangeEnum;
  startDate?: Date;
  endDate?: Date;
  label: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  fill?: boolean;
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
  options?: any;
}
```

---

### 2.3 Service Layer Design ✅

#### Service Interface

**File**: `src/app/pages/admin/dashboard/services/admin-dashboard.service.ts`

```typescript
@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;
  
  // Public Methods
  getOverview(params?: DashboardParams): Observable<DashboardOverviewResponseDTO>
  getUserStatistics(params?: DashboardParams): Observable<UserStatisticsResponseDTO>
  getJobStatistics(params?: DashboardParams): Observable<JobStatisticsResponseDTO>
  getCompanyStatistics(params?: DashboardParams): Observable<CompanyStatisticsResponseDTO>
  getApplicationStatistics(params?: DashboardParams): Observable<ApplicationStatisticsResponseDTO>
  
  // Private Methods
  private buildQueryParams(params?: DashboardParams): HttpParams
  private handleError<T>(operation: string): (error: any) => Observable<T>
}
```

#### Error Handling Strategy
1. **catchError** operator for HTTP errors
2. **retry(3)** with exponential backoff for transient failures
3. Return user-friendly error messages
4. Log errors to console (development) or error service (production)
5. Return empty/default data on error (graceful degradation)

#### Retry Logic
```typescript
retryWhen(errors =>
  errors.pipe(
    scan((retryCount, error) => {
      if (retryCount >= 3) throw error;
      return retryCount + 1;
    }, 0),
    delay(1000) // Exponential backoff: 1s, 2s, 4s
  )
)
```

#### Caching Strategy
**Phase 1**: No caching (always fetch fresh data)
**Phase 2** (Future): Implement 5-minute cache with cache invalidation on manual refresh

---

### 2.4 UI/UX Design Review ✅

#### Dashboard Layout
**Desktop (≥1024px)**:
```
┌─────────────────────────────────────────────────┐
│ Time Range Selector    [Refresh] Last Updated   │
├─────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐              │
│ │   Users      │ │    Jobs      │              │
│ │  Statistics  │ │  Statistics  │              │
│ └──────────────┘ └──────────────┘              │
│ ┌──────────────┐ ┌──────────────┐              │
│ │  Companies   │ │ Applications │              │
│ │  Statistics  │ │  Statistics  │              │
│ └──────────────┘ └──────────────┘              │
└─────────────────────────────────────────────────┘
```

**Tablet (768px - 1023px)**:
- 2 columns layout
- Cards stack vertically

#### Responsive Breakpoints
- **Desktop**: 1024px and above (2x2 grid)
- **Tablet**: 768px - 1023px (2 columns)
- **Mobile**: Below 768px (out of scope per PRD)

#### Color Scheme
- **Users**: Blue (`#3B82F6` - Tailwind blue-500)
- **Jobs**: Green (`#10B981` - Tailwind green-500)
- **Companies**: Purple (`#8B5CF6` - Tailwind purple-500)
- **Applications**: Orange (`#F59E0B` - Tailwind amber-500)

#### Icons (PrimeIcons)
- **Users**: `pi-users`
- **Jobs**: `pi-briefcase`
- **Companies**: `pi-building`
- **Applications**: `pi-file`
- **Calendar**: `pi-calendar`
- **Refresh**: `pi-refresh`

#### Loading Skeleton
- Use PrimeNG Skeleton component
- Match card layout structure
- Animate with pulse effect

#### Empty State
- Icon + Message centered in card
- Example: "No data available for selected period"
- Muted text color

#### Error State
- Error icon + Message
- "Retry" button
- Red accent color

---

## Directory Structure Plan

```
src/app/pages/admin/dashboard/
├── components/
│   ├── admin-overview/
│   │   ├── admin-overview.component.ts
│   │   ├── admin-overview.component.html
│   │   └── admin-overview.component.scss
│   ├── user-statistics-card/
│   │   ├── user-statistics-card.component.ts
│   │   ├── user-statistics-card.component.html
│   │   └── user-statistics-card.component.scss
│   ├── job-statistics-card/
│   │   ├── job-statistics-card.component.ts
│   │   ├── job-statistics-card.component.html
│   │   └── job-statistics-card.component.scss
│   ├── company-statistics-card/
│   │   ├── company-statistics-card.component.ts
│   │   ├── company-statistics-card.component.html
│   │   └── company-statistics-card.component.scss
│   └── application-statistics-card/
│       ├── application-statistics-card.component.ts
│       ├── application-statistics-card.component.html
│       └── application-statistics-card.component.scss
├── shared/
│   ├── time-range-selector/
│   │   ├── time-range-selector.component.ts
│   │   ├── time-range-selector.component.html
│   │   └── time-range-selector.component.scss
│   └── charts/
│       ├── line-chart/
│       ├── bar-chart/
│       ├── pie-chart/
│       └── donut-chart/
├── services/
│   └── admin-dashboard.service.ts
├── models/
│   └── dashboard.models.ts
└── utils/
    └── chart-config.util.ts (Chart.js configurations)
```

---

## Implementation Notes

### Existing Admin Structure
- Admin layout already exists: `pages/admin/layout/admin-layout.component.ts`
- Admin routes configured: `pages/admin/admin.routes.ts`
- Admin guard exists: `guards/admin.guard.ts`
- Current overview component: `pages/admin/overview/admin-overview.component.ts`

### Migration Strategy
**Option 1**: Replace existing `admin-overview.component.ts`
- ✅ Simpler routing (no changes needed)
- ✅ Maintains existing URL structure
- ⚠️ Loses current placeholder code

**Option 2**: Create new `dashboard` folder alongside `overview`
- ✅ Preserves existing code
- ✅ Better organization
- ⚠️ Requires route update

**RECOMMENDATION**: **Option 1** - Replace existing component
- Current component is just a placeholder
- No functionality to preserve
- Cleaner structure

---

## Next Steps (Task 3)

1. Create directory structure
2. Implement data models (`dashboard.models.ts`)
3. Implement AdminDashboardService
4. Write service unit tests

---

**Planning Status**: ✅ COMPLETE  
**Ready for Implementation**: ✅ YES  
**Blockers**: None  
**Dependencies**: Backend API endpoints must be available
