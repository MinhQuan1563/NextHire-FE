# Error Logs Viewer Feature PRD

## 1. Overview

### Feature Summary
The Error Logs Viewer is an administrative feature within the NextHire Admin Dashboard that provides system administrators with a centralized interface to view, filter, and export application error logs. The feature displays error log entries with JSON metadata captured from Serilog, enabling administrators to monitor and diagnose system issues.

### Problem Statement
System administrators need visibility into application errors to:
- Monitor system health and stability
- Diagnose and troubleshoot issues quickly
- Track error patterns and trends over time
- Export error data for further analysis or reporting

### Goals and Objectives
- Provide a clear, organized view of all system error logs
- Enable filtering by date range, log level, and source
- Display JSON metadata with syntax highlighting for easy readability
- Allow export of filtered logs in CSV and JSON formats
- Integrate seamlessly with the existing Admin Dashboard UI

---

## 2. Success Metrics (KPIs)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Page Load Time | < 2 seconds | Performance monitoring |
| Filter Response Time | < 1 second | Performance monitoring |
| Export Completion Time | < 5 seconds for 1000 records | Performance monitoring |
| Feature Adoption | 80% of admins use within first month | Usage analytics |
| User Satisfaction | No critical UX issues reported | User feedback |

---

## 3. User Personas

### Primary User: System Administrator
- **Role:** Admin with full system access
- **Goals:** Monitor system health, diagnose errors, maintain system stability
- **Needs:** Quick access to error details, ability to filter and search logs, export capabilities
- **Technical Level:** High - comfortable with JSON data and technical error messages

---

## 4. User Stories / Use Cases

### US-01: View Error Logs List
**As a** system administrator  
**I want to** view a paginated list of error logs  
**So that** I can monitor system errors and identify issues

**Acceptance Criteria:**
- Display error logs in a table format
- Show key columns: Log ID, Timestamp, Level, Source, Message (truncated)
- Support pagination with configurable page size
- Sort by creation date (newest first by default)

### US-02: Filter Error Logs
**As a** system administrator  
**I want to** filter error logs by date range, level, and source  
**So that** I can narrow down to specific errors I'm investigating

**Acceptance Criteria:**
- Date range picker for FromDate and ToDate
- Dropdown for log level selection (Serilog levels)
- Text input for source filter
- Filters apply immediately or via "Apply" button
- Clear filters option available

### US-03: View Error Log Details
**As a** system administrator  
**I want to** view the full details of a specific error log  
**So that** I can understand the complete error context

**Acceptance Criteria:**
- Click on a log entry to view full details
- Display metadata JSON with syntax highlighting
- Show all fields: Timestamp, Level, Type, Source, Domain, Message, Exception
- Option to copy JSON to clipboard

### US-04: Export Error Logs
**As a** system administrator  
**I want to** export filtered error logs to CSV or JSON format  
**So that** I can analyze data externally or share with team members

**Acceptance Criteria:**
- Export button available on the logs list page
- Support CSV and JSON export formats
- Export respects current filter settings
- Download initiates automatically after generation

---

## 5. Functional Requirements

### FR-01: Error Logs List View
| ID | Requirement |
|----|-------------|
| FR-01.1 | Display error logs in a responsive data table |
| FR-01.2 | Table columns: Log ID (hidden/optional), Create Date, Level, Source, Message (truncated to 100 chars) |
| FR-01.3 | Support server-side pagination with PageSize and PageStart parameters |
| FR-01.4 | Default page size: 10, 25, 50, 100 options |
| FR-01.5 | Display total count of matching records |
| FR-01.6 | Default sort: createDate descending (newest first) |

### FR-02: Filtering
| ID | Requirement |
|----|-------------|
| FR-02.1 | Date range filter with FromDate and ToDate date pickers |
| FR-02.2 | Log Level dropdown with Serilog levels: Verbose, Debug, Information, Warning, Error, Fatal |
| FR-02.3 | Source text input filter |
| FR-02.4 | Apply Filters button to execute filter |
| FR-02.5 | Clear Filters button to reset all filters |
| FR-02.6 | Persist filter state during session |

### FR-03: Error Log Detail View
| ID | Requirement |
|----|-------------|
| FR-03.1 | Modal or side panel to display full error log details |
| FR-03.2 | Display metadata JSON with syntax highlighting (using a JSON viewer component) |
| FR-03.3 | JSON fields to display: Timestamp, Level, Type, Source, Domain, Message, Exception |
| FR-03.4 | Copy to clipboard button for JSON content |
| FR-03.5 | Close button to return to list view |

### FR-04: Export Functionality
| ID | Requirement |
|----|-------------|
| FR-04.1 | Export dropdown with CSV and JSON options |
| FR-04.2 | Export applies current filter settings |
| FR-04.3 | CSV format: columns for each JSON field (Timestamp, Level, Type, Source, Domain, Message, Exception) |
| FR-04.4 | JSON format: array of error log objects |
| FR-04.5 | File naming: `error_logs_YYYY-MM-DD_HH-mm-ss.{csv|json}` |
| FR-04.6 | Show loading indicator during export generation |

### FR-05: API Integration
| ID | Requirement |
|----|-------------|
| FR-05.1 | Integrate with `GET /api/ErrorLog` for list with filters |
| FR-05.2 | Integrate with `GET /api/ErrorLog/{logId}` for single log detail |
| FR-05.3 | Integrate with `GET /api/ErrorLog/paginated` for paginated results |
| FR-05.4 | Handle API errors gracefully with user-friendly messages |

---

## 6. Non-Functional Requirements

### NFR-01: Performance
| ID | Requirement |
|----|-------------|
| NFR-01.1 | Initial page load < 2 seconds |
| NFR-01.2 | Filter/pagination response < 1 second |
| NFR-01.3 | Export generation < 5 seconds for up to 1000 records |

### NFR-02: Security
| ID | Requirement |
|----|-------------|
| NFR-02.1 | Feature accessible only to authenticated Admin users |
| NFR-02.2 | API calls must include valid authentication token |
| NFR-02.3 | No sensitive data exposed in client-side logs |

### NFR-03: Usability
| ID | Requirement |
|----|-------------|
| NFR-03.1 | Responsive design for desktop and tablet |
| NFR-03.2 | Consistent UI with existing Admin Dashboard |
| NFR-03.3 | Clear loading states and error messages |

### NFR-04: Accessibility
| ID | Requirement |
|----|-------------|
| NFR-04.1 | Keyboard navigation support |
| NFR-04.2 | Screen reader compatible |
| NFR-04.3 | Sufficient color contrast for log levels |

### NFR-05: Data Retention
| ID | Requirement |
|----|-------------|
| NFR-05.1 | No client-side data retention policy - display all available logs from backend |

---

## 7. Out of Scope

The following items are explicitly **not included** in this feature:

- Real-time updates / auto-refresh / polling
- Bulk actions (delete, archive)
- Alerts or notifications for critical errors
- Keyword search within metadata content
- Log level management or configuration
- Log deletion or archival from the UI
- Dashboard widgets or summary statistics for errors
- Integration with external monitoring tools (e.g., Application Insights, Datadog)

---

## 8. Dependencies & Assumptions

### Dependencies
| Dependency | Description |
|------------|-------------|
| Backend API | Error Log endpoints must be available and functional |
| Authentication | Admin authentication system must be in place |
| Serilog | Backend logging configured with Serilog |

### Assumptions
| Assumption | Description |
|------------|-------------|
| Metadata Format | Metadata JSON follows the structure: Timestamp, Level, Type, Source, Domain, Message, Exception |
| Admin Access | Only users with Admin role can access this feature |
| Browser Support | Modern browsers (Chrome, Firefox, Edge, Safari) |
| No Retention Limit | All historical logs are available from the backend |

---

## 9. Acceptance Criteria

### Feature-Level Acceptance Criteria

| ID | Criteria | Verification Method |
|----|----------|---------------------|
| AC-01 | Admin can view paginated list of error logs | Manual testing |
| AC-02 | Admin can filter logs by date range | Manual testing |
| AC-03 | Admin can filter logs by log level | Manual testing |
| AC-04 | Admin can filter logs by source | Manual testing |
| AC-05 | Admin can view full error log details with JSON syntax highlighting | Manual testing |
| AC-06 | Admin can copy JSON metadata to clipboard | Manual testing |
| AC-07 | Admin can export filtered logs to CSV format | Manual testing |
| AC-08 | Admin can export filtered logs to JSON format | Manual testing |
| AC-09 | Page loads within 2 seconds | Performance testing |
| AC-10 | Feature is only accessible to Admin users | Security testing |
| AC-11 | UI is consistent with existing Admin Dashboard | Visual review |

---

## 10. Technical Notes

### API Endpoints Reference

```
GET /api/ErrorLog
  Query Parameters:
    - FromDate: datetime
    - ToDate: datetime
    - Level: string
    - Source: string
    - PageSize: int
    - PageStart: int
  Response: ErrorLogListDto { items: ErrorLogDto[], totalCount: int }

GET /api/ErrorLog/{logId}
  Path Parameters:
    - logId: UUID
  Response: ErrorLogDto { logId, metadata, createDate }

GET /api/ErrorLog/paginated
  Query Parameters: (same as /api/ErrorLog)
  Response: PagedResultDto<ErrorLogDto>
```

### Metadata JSON Structure

```json
{
  "Timestamp": "2026-01-18T14:30:00Z",
  "Level": "Error",
  "Type": "System.NullReferenceException",
  "Source": "NextHireApp.Services.JobService",
  "Domain": "JobManagement",
  "Message": "Object reference not set to an instance of an object",
  "Exception": "System.NullReferenceException: Object reference not set..."
}
```

### Serilog Log Levels
- Verbose
- Debug
- Information
- Warning
- Error
- Fatal

---

## 11. UI Wireframe Description

### Error Logs List Page
```
+------------------------------------------------------------------+
| Admin Dashboard > Error Logs                                      |
+------------------------------------------------------------------+
| Filters:                                                          |
| [From Date: ____] [To Date: ____] [Level: ▼] [Source: ____]      |
| [Apply Filters] [Clear Filters]              [Export ▼]           |
+------------------------------------------------------------------+
| Showing 1-10 of 245 logs                                          |
+------------------------------------------------------------------+
| Create Date        | Level   | Source          | Message          |
+------------------------------------------------------------------+
| 2026-01-18 14:30  | Error   | JobService      | Object reference...|
| 2026-01-18 14:25  | Warning | AuthService     | Token expiring...  |
| ...                                                               |
+------------------------------------------------------------------+
| [< Prev] Page 1 of 25 [Next >]    Items per page: [10 ▼]         |
+------------------------------------------------------------------+
```

### Error Log Detail Modal
```
+------------------------------------------------------------------+
| Error Log Details                                          [X]    |
+------------------------------------------------------------------+
| Log ID: 550e8400-e29b-41d4-a716-446655440000                     |
| Created: 2026-01-18 14:30:00                                      |
+------------------------------------------------------------------+
| Metadata:                                          [Copy JSON]    |
| +--------------------------------------------------------------+ |
| | {                                                            | |
| |   "Timestamp": "2026-01-18T14:30:00Z",                      | |
| |   "Level": "Error",                                          | |
| |   "Type": "System.NullReferenceException",                   | |
| |   "Source": "NextHireApp.Services.JobService",               | |
| |   "Domain": "JobManagement",                                 | |
| |   "Message": "Object reference not set...",                  | |
| |   "Exception": "System.NullReferenceException:..."           | |
| | }                                                            | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| [Close]                                                           |
+------------------------------------------------------------------+
```

---

*Document Version: 1.0*  
*Created: 2026-01-18*  
*Status: Ready for Development*
