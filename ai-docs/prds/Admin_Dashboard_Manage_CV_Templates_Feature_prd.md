# Admin Dashboard - Manage CV Templates Page - Product Requirements Document (PRD)

## 1. Overview

### Feature Summary
The Admin Dashboard Manage CV Templates Page is a comprehensive template management interface that enables system administrators to view, create, edit, delete, and publish CV templates. The feature integrates with the existing CV Editor component for template creation and modification, providing a seamless template management workflow.

### Problem Statement
System administrators need a centralized interface to:
- View all available CV templates in the system
- Create new CV templates with custom layouts and designs
- Edit existing templates to improve quality or fix issues
- Delete outdated or unused templates
- Publish/unpublish templates to control user visibility
- Filter and search templates by type, status, and other criteria
- Monitor template usage and metadata

### Goals and Objectives
- **Primary Goal**: Provide administrators with complete control over CV template lifecycle management
- **Objective 1**: Enable efficient template browsing with filtering and search capabilities
- **Objective 2**: Seamlessly integrate CV Editor for create/update operations
- **Objective 3**: Support template publishing workflow to control template availability
- **Objective 4**: Ensure data integrity and prevent accidental template deletion
- **Objective 5**: Provide clear visual feedback for template status and metadata

---

## 2. Success Metrics (KPIs)

### Quantifiable Outcomes
- **Template Management Efficiency**: Reduce time to create/edit template by 40% through editor reuse
- **Page Load Time**: Template list loads within 1.5 seconds
- **User Adoption**: 100% of admin users use this interface for template management
- **Template Quality**: 90% of published templates have complete metadata (name, description, type)
- **Error Rate**: Less than 0.5% failure rate for CRUD operations
- **Search Performance**: Filter/search results return within 500ms
- **Editor Integration**: Zero navigation friction when jumping to CV Editor

---

## 3. User Personas

### Primary User: System Administrator
- **Role**: Platform administrator with full template management access
- **Responsibilities**: Create, maintain, and curate CV templates for users
- **Technical Proficiency**: High - understands template structure and design principles
- **Usage Frequency**: Daily to weekly
- **Key Needs**: Quick template overview, efficient editing workflow, bulk operations

### Secondary User: Content Manager
- **Role**: Manages template content and quality
- **Responsibilities**: Review templates, update descriptions, ensure consistency
- **Technical Proficiency**: Medium - focuses on content rather than technical details
- **Usage Frequency**: Weekly
- **Key Needs**: Easy template browsing, clear status indicators, simple editing

---

## 4. User Stories / Use Cases

### User Story 1: Browse Available Templates
**As a** system administrator  
**I want to** view all CV templates in a paginated list  
**So that** I can quickly see what templates exist in the system

### User Story 2: Create New Template
**As a** system administrator  
**I want to** create a new CV template using the CV Editor  
**So that** I can provide users with additional template options

### User Story 3: Edit Existing Template
**As a** system administrator  
**I want to** edit an existing template's layout and design  
**So that** I can improve template quality or fix issues

### User Story 4: Filter Templates by Type
**As a** content manager  
**I want to** filter templates by type (Standard, Premium, Custom)  
**So that** I can focus on specific template categories

### User Story 5: Publish/Unpublish Templates
**As a** system administrator  
**I want to** toggle template published status  
**So that** I can control which templates are visible to users

### User Story 6: Delete Unused Templates
**As a** system administrator  
**I want to** delete templates that are no longer needed  
**So that** I can keep the template library clean and manageable

### User Story 7: Search Templates
**As a** content manager  
**I want to** search templates by name or description  
**So that** I can quickly find specific templates

---

## 5. Functional Requirements

### FR-1: Template List Display
**FR-1.1**: Display CV templates in a paginated table/grid view with the following columns:
- Template Code (unique identifier)
- Template Name
- Template Type (Standard, Premium, Custom)
- Description (truncated with "show more" option)
- Published Status (boolean indicator)
- Sample File URL (if available)
- Creation Date
- Last Modified Date
- Actions (Edit, Delete, Publish/Unpublish)

**FR-1.2**: Support both table and card/grid view modes

**FR-1.3**: Display template thumbnail/preview if sample file URL is available

**FR-1.4**: Show clear visual indicators for published vs unpublished templates

**FR-1.5**: Implement pagination with configurable page size (10, 25, 50, 100 items)

### FR-2: Filtering and Search
**FR-2.1**: Provide filter controls for:
- Template Type (Standard, Premium, Custom, All)
- Published Status (Published, Unpublished, All)
- Date Range (creation date or last modified date)

**FR-2.2**: Implement text search that filters by:
- Template Name
- Template Description
- Template Code

**FR-2.3**: Support combined filters (multiple filters active simultaneously)

**FR-2.4**: Display active filter indicators with clear option

**FR-2.5**: Persist filter state in URL query parameters for bookmarking

### FR-3: Create New Template
**FR-3.1**: Provide "Create New Template" button prominently displayed

**FR-3.2**: On click, navigate to CV Editor at route `/cv-editor/new` or `/admin/cv-template/new`

**FR-3.3**: CV Editor must open in "create mode" with empty/default state

**FR-3.4**: After successful creation in CV Editor, navigate back to template list

**FR-3.5**: Display success notification showing newly created template

### FR-4: Edit Existing Template
**FR-4.1**: Provide "Edit" action button for each template

**FR-4.2**: On click, navigate to CV Editor at route `/cv-editor/{templateCode}` or `/admin/cv-template/{templateCode}`

**FR-4.3**: CV Editor must load with existing template data (layout, sections, design settings)

**FR-4.4**: After successful update in CV Editor, navigate back to template list

**FR-4.5**: Display success notification showing updated template

**FR-4.6**: Preserve scroll position and filter state when returning from editor

### FR-5: Delete Template
**FR-5.1**: Provide "Delete" action button for each template

**FR-5.2**: Display confirmation dialog before deletion with:
- Template name
- Warning message about permanent deletion
- Confirm and Cancel buttons

**FR-5.3**: Call DELETE `/api/CVTemplate/{templateCode}` endpoint

**FR-5.4**: On success, remove template from list and show success notification

**FR-5.5**: On error, display error message with retry option

**FR-5.6**: Prevent deletion of templates currently in use (if applicable)

### FR-6: Publish/Unpublish Template
**FR-6.1**: Provide toggle or button to change published status

**FR-6.2**: Call PUT `/api/CVTemplate/{templateCode}/publish` endpoint with `isPublished` parameter

**FR-6.3**: Update template status in list immediately (optimistic update)

**FR-6.4**: Revert on error and show error notification

**FR-6.5**: Display clear visual feedback for published vs unpublished status

**FR-6.6**: Show tooltip explaining published status meaning

### FR-7: Template Details View (Optional)
**FR-7.1**: Provide "View Details" action to see full template information

**FR-7.2**: Display modal or side panel with:
- All template metadata
- Full description
- Layout configuration summary
- Section count
- Design settings preview

**FR-7.3**: Provide "Edit" button within details view

### FR-8: API Integration
**FR-8.1**: Integrate with GET `/api/CVTemplate` endpoint for listing templates
- Support query parameters: Filter, Type, IsPublished, Sorting, SkipCount, MaxResultCount

**FR-8.2**: Integrate with GET `/api/CVTemplate/{templateCode}` for single template retrieval

**FR-8.3**: Integrate with POST `/api/CVTemplate` for template creation (handled by CV Editor)

**FR-8.4**: Integrate with PUT `/api/CVTemplate/{templateCode}` for template updates (handled by CV Editor)

**FR-8.5**: Integrate with DELETE `/api/CVTemplate/{templateCode}` for template deletion

**FR-8.6**: Integrate with PUT `/api/CVTemplate/{templateCode}/publish` for publish status toggle

**FR-8.7**: Implement proper error handling for all API calls

**FR-8.8**: Support pagination through SkipCount and MaxResultCount parameters

### FR-9: Sorting
**FR-9.1**: Support sorting by:
- Template Name (A-Z, Z-A)
- Creation Date (Newest, Oldest)
- Last Modified Date (Newest, Oldest)
- Template Type

**FR-9.2**: Display sort indicator in column headers

**FR-9.3**: Persist sort preference in URL or local storage

### FR-10: Loading and Empty States
**FR-10.1**: Display skeleton loaders while fetching template list

**FR-10.2**: Show empty state when no templates exist with "Create First Template" CTA

**FR-10.3**: Show "No results found" state when filters return empty results

**FR-10.4**: Display error state with retry button on API failures

### FR-11: Bulk Operations (Future Enhancement)
**FR-11.1**: Support multi-select checkboxes for templates

**FR-11.2**: Provide bulk actions: Delete, Publish, Unpublish

**FR-11.3**: Display confirmation dialog for bulk operations

---

## 6. Non-Functional Requirements

### NFR-1: Performance
- Template list loads in < 1.5 seconds for up to 1000 templates
- Search/filter operations complete in < 500ms
- Pagination navigation is instant (< 100ms)
- Smooth scrolling and interactions (60 FPS)
- CV Editor navigation completes in < 1 second

### NFR-2: Security
- Page accessible only to authenticated admin users
- Implement role-based access control (Admin role required)
- Secure API communication via HTTPS
- Validate all inputs (template codes, filter values)
- Protect against XSS and injection attacks
- Prevent unauthorized template deletion or modification

### NFR-3: Scalability
- Support up to 10,000 templates in database
- Efficient pagination to handle large datasets
- Lazy loading for template thumbnails/previews
- Optimized API queries with proper indexing

### NFR-4: Reliability
- Graceful degradation if thumbnails fail to load
- Retry logic for transient API failures (3 retries with exponential backoff)
- Optimistic UI updates with rollback on error
- Auto-save draft state in CV Editor (handled by editor)

### NFR-5: Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support for all actions
- Screen reader compatible table/grid
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators visible and clear
- ARIA labels for action buttons

### NFR-6: Usability
- Intuitive navigation and layout
- Clear visual hierarchy
- Consistent with existing admin interface design
- Responsive design (desktop and tablet)
- Contextual tooltips for actions
- Confirmation dialogs for destructive actions
- Clear success/error feedback

### NFR-7: Maintainability
- Modular component architecture
- Reusable table/grid components
- Service layer for API calls
- Comprehensive unit tests (>80% coverage)
- Integration tests for CRUD operations
- Clear code documentation
- Consistent with Angular style guide

### NFR-8: Browser Compatibility
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

---

## 7. Out of Scope

The following features are explicitly **NOT** included in this release:

- **Template Duplication**: Clone existing template as starting point
- **Template Categories/Tags**: Advanced categorization beyond Type
- **Template Analytics**: Usage statistics, user ratings, download counts
- **Version History**: Track template changes over time
- **Template Preview**: Live preview without opening editor
- **Bulk Import/Export**: Import/export templates as JSON/ZIP
- **Template Marketplace**: Public template sharing
- **Collaborative Editing**: Multiple admins editing same template
- **Template Comments**: Admin notes or feedback on templates
- **Advanced Permissions**: Granular permissions per template
- **Template Scheduling**: Auto-publish/unpublish on specific dates
- **A/B Testing**: Test multiple template versions

---

## 8. Dependencies & Assumptions

### Dependencies
- **Backend API**: All `/api/CVTemplate` endpoints must be fully functional
- **CV Editor Component**: Existing CV Editor at `src/app/pages/cv-builder/cv-editor` must support:
  - Route parameter for template code
  - Create mode (new template)
  - Edit mode (existing template)
  - Navigation back to template list after save
- **Authentication System**: Admin role verification must be implemented
- **UI Component Library**: PrimeNG or Angular Material for table, dialogs, buttons
- **Routing**: Angular Router for navigation between list and editor

### Assumptions
- **Data Availability**: Backend provides complete template data via API
- **Template Types**: Enum values for CvTemplateType are: Standard, Premium, Custom
- **Admin Access**: Only users with admin role can access this page
- **CV Editor Integration**: CV Editor handles all template creation/update logic
- **Navigation Flow**: Users navigate from list → editor → back to list
- **Template Code**: Unique identifier generated by backend on creation
- **Browser Support**: Users access via modern browsers (no IE11 support)
- **Angular Version**: Project uses Angular 15+ with standalone components
- **Styling Framework**: TailwindCSS is available for styling
- **Icon Library**: Lucide icons or similar for action buttons

### Technical Constraints
- Must follow existing Angular project structure and coding standards
- Must use TypeScript with strict mode enabled
- Must integrate with existing authentication/authorization system
- Must follow reactive programming patterns (RxJS)
- Must reuse CV Editor component without modification (or minimal changes)

---

## 9. Acceptance Criteria

### AC-1: Template List Display
- [ ] Template list displays all templates from API
- [ ] Pagination works correctly with configurable page size
- [ ] Table/grid shows all required columns/fields
- [ ] Published status is clearly indicated visually
- [ ] Layout is responsive on screens ≥768px width

### AC-2: Filtering and Search
- [ ] Type filter works correctly (Standard, Premium, Custom, All)
- [ ] Published status filter works correctly
- [ ] Text search filters by name, description, and code
- [ ] Multiple filters can be applied simultaneously
- [ ] Active filters are clearly displayed
- [ ] Clear filters button resets all filters

### AC-3: Create New Template
- [ ] "Create New Template" button is prominently displayed
- [ ] Clicking button navigates to CV Editor in create mode
- [ ] CV Editor opens with empty/default state
- [ ] After saving in editor, user returns to template list
- [ ] Success notification displays after creation
- [ ] New template appears in list

### AC-4: Edit Existing Template
- [ ] "Edit" button is available for each template
- [ ] Clicking edit navigates to CV Editor with template data loaded
- [ ] Template data (layout, sections, design) loads correctly in editor
- [ ] After saving in editor, user returns to template list
- [ ] Success notification displays after update
- [ ] Updated template reflects changes in list
- [ ] Scroll position and filters are preserved on return

### AC-5: Delete Template
- [ ] "Delete" button is available for each template
- [ ] Confirmation dialog appears before deletion
- [ ] Dialog shows template name and warning message
- [ ] Clicking confirm deletes template via API
- [ ] Template is removed from list on success
- [ ] Success notification displays after deletion
- [ ] Error message displays if deletion fails

### AC-6: Publish/Unpublish Template
- [ ] Publish toggle/button is available for each template
- [ ] Clicking toggle calls publish API endpoint
- [ ] Published status updates immediately in UI
- [ ] Status reverts on API error
- [ ] Success/error notification displays
- [ ] Tooltip explains published status meaning

### AC-7: Sorting
- [ ] Templates can be sorted by name, date, type
- [ ] Sort indicator shows current sort direction
- [ ] Sorting works correctly in both directions
- [ ] Sort preference persists across page reloads

### AC-8: API Integration
- [ ] GET `/api/CVTemplate` retrieves template list correctly
- [ ] Pagination parameters (SkipCount, MaxResultCount) work
- [ ] Filter parameters (Type, IsPublished, Filter) work
- [ ] DELETE endpoint removes templates successfully
- [ ] PUT publish endpoint toggles status successfully
- [ ] All API errors are handled gracefully

### AC-9: Performance
- [ ] Template list loads in under 1.5 seconds
- [ ] Search/filter results appear in under 500ms
- [ ] Navigation to CV Editor completes in under 1 second
- [ ] No visual lag or jank during interactions

### AC-10: Error Handling
- [ ] Loading states display while fetching data
- [ ] Empty states show when no templates exist
- [ ] "No results" state shows when filters return nothing
- [ ] Error messages display with retry option on failures
- [ ] Optimistic updates revert on API errors

### AC-11: Security
- [ ] Non-admin users cannot access page (redirected or 403 error)
- [ ] All API calls include authentication headers
- [ ] Template codes are validated before API calls
- [ ] No sensitive data exposed in console or network tab

### AC-12: Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader announces table data and actions
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] ARIA labels present on action buttons

### AC-13: Code Quality
- [ ] Unit tests cover ≥80% of component logic
- [ ] Integration tests verify CRUD operations
- [ ] Code passes linting without errors
- [ ] Components follow Angular style guide
- [ ] Service layer properly abstracts API calls

---

## 10. Technical Implementation Notes

### Recommended Component Structure
```
src/app/features/admin/cv-templates/
├── pages/
│   └── manage-templates/
│       ├── manage-templates.component.ts
│       ├── manage-templates.component.html
│       ├── manage-templates.component.scss
│       └── manage-templates.component.spec.ts
├── components/
│   ├── template-list-table/
│   │   ├── template-list-table.component.ts
│   │   ├── template-list-table.component.html
│   │   └── template-list-table.component.scss
│   ├── template-filters/
│   │   ├── template-filters.component.ts
│   │   ├── template-filters.component.html
│   │   └── template-filters.component.scss
│   ├── template-card/
│   │   ├── template-card.component.ts
│   │   ├── template-card.component.html
│   │   └── template-card.component.scss
│   └── delete-confirmation-dialog/
│       ├── delete-confirmation-dialog.component.ts
│       ├── delete-confirmation-dialog.component.html
│       └── delete-confirmation-dialog.component.scss
├── services/
│   ├── cv-template.service.ts
│   └── cv-template.service.spec.ts
├── models/
│   └── cv-template.models.ts
└── cv-templates-routing.module.ts
```

### Routing Configuration
```typescript
const routes: Routes = [
  {
    path: 'admin/cv-templates',
    component: ManageTemplatesComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/cv-template/new',
    component: CvEditorComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/cv-template/:templateCode',
    component: CvEditorComponent,
    canActivate: [AdminGuard],
  },
];
```

### Service Interface
```typescript
interface CvTemplateListParams {
  filter?: string;
  type?: CvTemplateType;
  isPublished?: boolean;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
}

interface CVTemplateDto {
  templateCode: string;
  name: string;
  type: CvTemplateType;
  description?: string;
  isPublished: boolean;
  sampleFileUrl?: string;
  layoutConfiguration?: LayoutConfiguration;
  section?: CVSection[];
  designSettings?: DesignSettings;
  creationTime?: Date;
  lastModificationTime?: Date;
}

enum CvTemplateType {
  Standard = 0,
  Premium = 1,
  Custom = 2,
}
```

### Navigation Flow
1. **List → Create**: Navigate to `/admin/cv-template/new`
2. **Create → List**: After save, navigate back to `/admin/cv-templates`
3. **List → Edit**: Navigate to `/admin/cv-template/{templateCode}`
4. **Edit → List**: After save, navigate back to `/admin/cv-templates`

### State Management Considerations
- Use query parameters for filters, sorting, pagination
- Preserve state when navigating to/from editor
- Consider using route resolver for template data loading
- Implement optimistic updates for publish/unpublish actions

---

## 11. Design Considerations

### Visual Hierarchy
1. Page header with title and "Create New Template" button
2. Filter/search controls bar
3. Template list (table or grid)
4. Pagination controls at bottom

### Layout Options
**Option 1: Table View**
- Traditional data table with sortable columns
- Action buttons in last column
- Compact, information-dense

**Option 2: Grid/Card View**
- Card-based layout with template preview
- Better for visual browsing
- More space for metadata

**Recommendation**: Provide both views with toggle switch

### Color Coding
- **Published**: Green indicator/badge (#10B981)
- **Unpublished**: Gray indicator/badge (#6B7280)
- **Standard Type**: Blue accent (#3B82F6)
- **Premium Type**: Purple accent (#8B5CF6)
- **Custom Type**: Orange accent (#F59E0B)

### Action Buttons
- **Edit**: Primary button or icon (Pencil icon)
- **Delete**: Danger button or icon (Trash icon)
- **Publish/Unpublish**: Toggle switch or secondary button
- **View Details**: Link or secondary button (Eye icon)

### Iconography
- Use Lucide icons (as per project standards)
- Icons: Plus (create), Pencil (edit), Trash (delete), Eye (view), Filter, Search, ChevronLeft/Right (pagination)

---

## 12. Integration with CV Editor

### Editor Modes
**Create Mode** (`/admin/cv-template/new`):
- Empty template state
- All sections available but unused
- Default design settings
- Save button creates new template via POST API
- On success, navigate to `/admin/cv-templates`

**Edit Mode** (`/admin/cv-template/{templateCode}`):
- Load existing template data via GET API
- Populate layout, sections, design settings
- Save button updates template via PUT API
- On success, navigate to `/admin/cv-templates`

### Required CV Editor Modifications (Minimal)
1. **Route Parameter Handling**: Already implemented (see `handleRouteParams()` in cv-editor.component.ts)
2. **Navigation After Save**: Already implemented (navigates to `/cv-template` after create)
3. **Update Navigation Target**: Change navigation from `/cv-template` to `/admin/cv-templates` for admin context

### Data Flow
1. **List → Editor**: Pass templateCode via route parameter
2. **Editor**: Load template data using CvTemplateService
3. **Editor**: User edits template using existing editor features
4. **Editor**: Save template via CvTemplateService (create or update)
5. **Editor → List**: Navigate back with success notification

---

## 13. Future Enhancements (Post-MVP)

- Template duplication/cloning feature
- Template preview modal without opening editor
- Template usage analytics (how many users use each template)
- Template version history and rollback
- Bulk operations (delete, publish multiple templates)
- Template import/export (JSON format)
- Template categories and tags for better organization
- Template marketplace for sharing
- Collaborative editing with conflict resolution
- Template scheduling (auto-publish/unpublish)
- A/B testing for template effectiveness
- Template recommendations based on user preferences

---

## 14. Testing Strategy

### Unit Tests
- Component logic (filtering, sorting, pagination)
- Service methods (API calls, error handling)
- State management (optimistic updates, rollback)
- Input validation

### Integration Tests
- CRUD operations via API
- Navigation flow (list ↔ editor)
- Filter and search functionality
- Pagination behavior

### E2E Tests
- Complete create template workflow
- Complete edit template workflow
- Delete template with confirmation
- Publish/unpublish toggle
- Filter and search combinations

### Manual Testing Checklist
- [ ] Create new template and verify it appears in list
- [ ] Edit existing template and verify changes persist
- [ ] Delete template and verify it's removed
- [ ] Toggle publish status and verify API call
- [ ] Test all filters individually and combined
- [ ] Test search with various queries
- [ ] Test pagination with different page sizes
- [ ] Test sorting in both directions
- [ ] Test error scenarios (network failure, invalid data)
- [ ] Test accessibility with keyboard and screen reader
- [ ] Test on different screen sizes and browsers

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-18  
**Status**: Ready for Development  
**Approved By**: [Pending]
