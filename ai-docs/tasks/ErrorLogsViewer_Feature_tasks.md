# Error Logs Viewer Feature - Task Breakdown

**Source PRD:** `ErrorLogsViewer_Feature_prd.md`  
**Created:** 2026-01-18  
**Target Team:** Frontend  
**Status:** Ready for Development

---

## 1. [x] Project Setup & Planning

1.1 [x] Review PRD and confirm acceptance criteria with stakeholders  
1.2 [x] Identify reusable components from existing Admin Dashboard  
1.3 [x] Set up feature module/folder structure under admin section  
1.4 [x] Add route configuration for Error Logs page in admin routes  

---

## 2. [x] API Integration Layer

2.1 [x] Create ErrorLog TypeScript interfaces/models
   - 2.1.1 [x] Define `ErrorLogDto` interface (logId, metadata, createDate)
   - 2.1.2 [x] Define `ErrorLogListDto` interface (items, totalCount)
   - 2.1.3 [x] Define `ErrorLogFilterParams` interface (FromDate, ToDate, Level, Source, PageSize, PageStart)

2.2 [x] Create ErrorLog API service
   - 2.2.1 [x] Implement `getErrorLogs(params: ErrorLogFilterParams)` method → `GET /api/ErrorLog`
   - 2.2.2 [x] Implement `getErrorLogById(logId: string)` method → `GET /api/ErrorLog/{logId}`
   - 2.2.3 [x] Implement `getErrorLogsPaginated(params: ErrorLogFilterParams)` method → `GET /api/ErrorLog/paginated`
   - 2.2.4 [x] Add error handling with user-friendly messages (FR-05.4)

---

## 3. [x] Error Logs List View (FR-01)

3.1 [x] Create Error Logs list page component
   - 3.1.1 [x] Set up component structure with proper routing
   - 3.1.2 [x] Implement responsive data table layout (FR-01.1)
   - 3.1.3 [x] Configure table columns: Create Date, Level, Source, Message truncated to 100 chars (FR-01.2)
   - 3.1.4 [x] Add Log ID column (hidden/optional) (FR-01.2)

3.2 [x] Implement server-side pagination (FR-01.3)
   - 3.2.1 [x] Add pagination controls (Previous/Next buttons)
   - 3.2.2 [x] Implement page size selector with options: 10, 25, 50, 100 (FR-01.4)
   - 3.2.3 [x] Display total count of matching records (FR-01.5)
   - 3.2.4 [x] Display "Showing X-Y of Z logs" indicator

3.3 [x] Implement default sorting
   - 3.3.1 [x] Sort by createDate descending (newest first) by default (FR-01.6)

3.4 [x] Add loading states and empty states
   - 3.4.1 [x] Show loading spinner during data fetch
   - 3.4.2 [x] Display empty state message when no logs found
   - 3.4.3 [x] Display error message on API failure (NFR-03.3)

---

## 4. [x] Filtering Functionality (FR-02)

4.1 [x] Create filter panel component
   - 4.1.1 [x] Add FromDate date picker (FR-02.1)
   - 4.1.2 [x] Add ToDate date picker (FR-02.1)
   - 4.1.3 [x] Add Log Level dropdown with Serilog levels: Verbose, Debug, Information, Warning, Error, Fatal (FR-02.2)
   - 4.1.4 [x] Add Source text input filter (FR-02.3)

4.2 [x] Implement filter actions
   - 4.2.1 [x] Add "Apply Filters" button to execute filter (FR-02.4)
   - 4.2.2 [x] Add "Clear Filters" button to reset all filters (FR-02.5)
   - 4.2.3 [x] Persist filter state during session (FR-02.6)

4.3 [x] Connect filters to API
   - 4.3.1 [x] Build query parameters from filter state
   - 4.3.2 [x] Trigger API call on Apply Filters click
   - 4.3.3 [x] Reset pagination to page 1 when filters change

---

## 5. [x] Error Log Detail View (FR-03)

5.1 [x] Create detail view modal/side panel component (FR-03.1)
   - 5.1.1 [x] Design modal layout with header, content, and footer
   - 5.1.2 [x] Display Log ID and Create Date in header
   - 5.1.3 [x] Add close button to return to list view (FR-03.5)

5.2 [x] Implement JSON metadata display with syntax highlighting (FR-03.2)
   - 5.2.1 [x] Install/configure JSON syntax highlighting library (e.g., ngx-json-viewer, prism.js)
   - 5.2.2 [x] Parse metadata JSON string from API response
   - 5.2.3 [x] Display all fields: Timestamp, Level, Type, Source, Domain, Message, Exception (FR-03.3)

5.3 [x] Implement copy to clipboard functionality (FR-03.4)
   - 5.3.1 [x] Add "Copy JSON" button
   - 5.3.2 [x] Implement clipboard copy logic
   - 5.3.3 [x] Show success/error feedback after copy action

5.4 [x] Connect detail view to list
   - 5.4.1 [x] Add click handler on table row to open detail view
   - 5.4.2 [x] Fetch full log details via `GET /api/ErrorLog/{logId}` (FR-05.2)
   - 5.4.3 [x] Show loading state while fetching details

---

## 6. [x] Export Functionality (FR-04)

6.1 [x] Create export dropdown component (FR-04.1)
   - 6.1.1 [x] Add Export button with dropdown menu
   - 6.1.2 [x] Add "Export as CSV" option
   - 6.1.3 [x] Add "Export as JSON" option

6.2 [x] Implement CSV export (FR-04.3)
   - 6.2.1 [x] Fetch all filtered logs (respecting current filters) (FR-04.2)
   - 6.2.2 [x] Parse metadata JSON and extract fields: Timestamp, Level, Type, Source, Domain, Message, Exception
   - 6.2.3 [x] Generate CSV content with proper headers
   - 6.2.4 [x] Trigger file download with naming: `error_logs_YYYY-MM-DD_HH-mm-ss.csv` (FR-04.5)

6.3 [x] Implement JSON export (FR-04.4)
   - 6.3.1 [x] Fetch all filtered logs (respecting current filters) (FR-04.2)
   - 6.3.2 [x] Format as JSON array of error log objects
   - 6.3.3 [x] Trigger file download with naming: `error_logs_YYYY-MM-DD_HH-mm-ss.json` (FR-04.5)

6.4 [x] Add export loading state (FR-04.6)
   - 6.4.1 [x] Show loading indicator during export generation
   - 6.4.2 [x] Disable export button while processing
   - 6.4.3 [x] Show error message if export fails

---

## 7. [x] Security & Access Control (NFR-02)

7.1 [x] Implement route guard for Admin-only access (NFR-02.1)
   - 7.1.1 [x] Add auth guard to Error Logs route
   - 7.1.2 [x] Verify user has Admin role before allowing access
   - 7.1.3 [x] Redirect unauthorized users to appropriate page

7.2 [x] Ensure API calls include authentication token (NFR-02.2)
   - 7.2.1 [x] Verify HTTP interceptor attaches auth token to requests
   - 7.2.2 [x] Handle 401/403 responses appropriately

---

## 8. [x] UI/UX Polish (NFR-03, NFR-04)

8.1 [x] Ensure responsive design (NFR-03.1)
   - 8.1.1 [x] Test and adjust layout for desktop screens
   - 8.1.2 [x] Test and adjust layout for tablet screens
   - 8.1.3 [x] Ensure table is scrollable on smaller screens

8.2 [x] Ensure UI consistency with Admin Dashboard (NFR-03.2)
   - 8.2.1 [x] Use existing Admin Dashboard styling/theme
   - 8.2.2 [x] Match button, input, and table styles
   - 8.2.3 [x] Use consistent spacing and typography

8.3 [x] Implement log level visual indicators
   - 8.3.1 [x] Add color-coded badges for log levels (e.g., red for Error, yellow for Warning)
   - 8.3.2 [x] Ensure sufficient color contrast for accessibility (NFR-04.3)

8.4 [x] Implement accessibility features
   - 8.4.1 [x] Add keyboard navigation support for table and modal (NFR-04.1)
   - 8.4.2 [x] Add ARIA labels for screen reader compatibility (NFR-04.2)
   - 8.4.3 [x] Ensure focus management in modal

---

## Summary

| Category | Task Count |
|----------|------------|
| Project Setup | 4 |
| API Integration | 7 |
| List View | 11 |
| Filtering | 9 |
| Detail View | 11 |
| Export | 11 |
| Security | 5 |
| UI/UX | 11 |
| Testing | 18 |
| Documentation | 3 |
| **Total** | **90** |

---

*Generated from PRD: ErrorLogsViewer_Feature_prd.md*
