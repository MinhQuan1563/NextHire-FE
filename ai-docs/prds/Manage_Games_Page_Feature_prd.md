# Product Requirements Document: Manage Games Page

## 1. Overview

### 1.1 Feature Summary
The Manage Games Page is an administrative interface that enables administrators to manage mini-games within the NextHire platform. This feature provides centralized control over game metadata, status, and lifecycle through backend integration, replacing the current 100% frontend-based game management approach.

### 1.2 Problem Statement
Currently, mini-games in the NextHire platform are developed entirely in Angular without backend integration for game management. This creates several challenges:
- No centralized control over game availability and status
- Difficulty in managing game metadata and information
- Lack of ability to dynamically enable/disable games without code deployment
- No audit trail or tracking of game configuration changes
- Scalability issues when adding new games to the platform

### 1.3 Goals and Objectives
- **Primary Goal:** Provide administrators with a centralized interface to manage all mini-games through backend integration
- **Secondary Goals:**
  - Enable dynamic control of game availability without code deployments
  - Maintain consistent game metadata across the platform
  - Support scalable addition of new games
  - Preserve ongoing game sessions when games are disabled

## 2. Success Metrics (KPIs)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Admin adoption rate | 100% of admins use the new interface within 2 weeks | Usage analytics |
| Game management time reduction | 50% reduction in time to add/update games | Time tracking comparison |
| Zero disruption to active sessions | 0 interrupted sessions when games are disabled | Session monitoring logs |
| System uptime | 99.9% availability | Server monitoring |
| Response time | < 2 seconds for all CRUD operations | Performance monitoring |

## 3. User Personas

### 3.1 Primary User: Platform Administrator
- **Role:** System administrator with full platform access
- **Responsibilities:** Managing game catalog, enabling/disabling games, updating game information
- **Technical Proficiency:** High - comfortable with admin interfaces
- **Goals:** 
  - Quickly manage game availability
  - Maintain accurate game information
  - Respond to issues by disabling problematic games
- **Pain Points:** 
  - Currently requires developer intervention to manage games
  - No visibility into game status and metadata

## 4. User Stories / Use Cases

### US-1: View All Games
**As an** administrator  
**I want to** view a list of all games in the system  
**So that** I can see the current game catalog and their statuses

**Acceptance Criteria:**
- Display paginated list of games (10 per page by default)
- Show key information: name, game code, type, status, created date
- Support search by game name or code
- Filter by active/inactive status

### US-2: Create New Game
**As an** administrator  
**I want to** add a new game to the system  
**So that** it becomes available for candidates to play

**Acceptance Criteria:**
- Form with required fields: GameCode, Name, Description
- Validation for required fields and character limits
- Success confirmation after creation
- New game appears in the games list immediately

### US-3: Update Game Information
**As an** administrator  
**I want to** update game metadata  
**So that** I can keep game information accurate and current

**Acceptance Criteria:**
- Edit form with fields: Name, Description, IsActive status
- Validation for character limits
- Changes saved immediately
- Updated information reflected in games list

### US-4: Enable/Disable Game
**As an** administrator  
**I want to** toggle game active status  
**So that** I can control game availability without affecting ongoing sessions

**Acceptance Criteria:**
- Quick toggle for IsActive status
- Disabled games are not accessible to new users
- Ongoing game sessions continue uninterrupted
- Visual indicator of game status (active/inactive)

### US-5: Delete Game
**As an** administrator  
**I want to** permanently remove a game from the system  
**So that** I can clean up unused or deprecated games

**Acceptance Criteria:**
- Delete button with confirmation dialog
- Hard delete (permanent removal)
- Confirmation message before deletion
- Game removed from list immediately after deletion

### US-6: Search and Filter Games
**As an** administrator  
**I want to** search and filter the games list  
**So that** I can quickly find specific games

**Acceptance Criteria:**
- Search by game name or code
- Filter by active/inactive status
- Real-time search results
- Clear filter/search option

## 5. Functional Requirements

### FR-1: Game List Display
- **FR-1.1:** Display paginated list of games with configurable page size (default: 10)
- **FR-1.2:** Show columns: Game Code, Name, Type, Status (Active/Inactive), Created Date, Actions
- **FR-1.3:** Support sorting by name and created date
- **FR-1.4:** Display game thumbnail/image if ImageUrl is available
- **FR-1.5:** Show total count of games

### FR-2: Search and Filter
- **FR-2.1:** Implement search input that filters by game name or game code
- **FR-2.2:** Provide filter dropdown for IsActive status (All/Active/Inactive)
- **FR-2.3:** Apply filters and search in real-time with debouncing (300ms)
- **FR-2.4:** Maintain filter state during pagination

### FR-3: Create Game
- **FR-3.1:** Provide "Add New Game" button that opens creation form
- **FR-3.2:** Form fields:
  - GameCode (required, max 50 chars, unique)
  - Name (required, max 50 chars)
  - Description (required, textarea)
- **FR-3.3:** Validate all required fields before submission
- **FR-3.4:** Display validation errors inline
- **FR-3.5:** Call POST `/api/games` endpoint with CreateGameDto
- **FR-3.6:** Show success message and refresh list on successful creation
- **FR-3.7:** Handle error responses (duplicate GameCode, validation errors)

### FR-4: Update Game
- **FR-4.1:** Provide "Edit" button for each game in the list
- **FR-4.2:** Open edit form pre-populated with current values
- **FR-4.3:** Editable fields:
  - Name (max 50 chars)
  - Description (textarea)
  - IsActive (toggle/checkbox)
- **FR-4.4:** GameCode is read-only (not editable)
- **FR-4.5:** Call PUT/PATCH `/api/games/{gameCode}` endpoint with UpdateGameDto
- **FR-4.6:** Show success message and refresh list on successful update
- **FR-4.7:** Handle error responses

### FR-5: Delete Game
- **FR-5.1:** Provide "Delete" button for each game in the list
- **FR-5.2:** Show confirmation dialog before deletion
- **FR-5.3:** Confirmation message: "Are you sure you want to permanently delete [Game Name]? This action cannot be undone."
- **FR-5.4:** Call DELETE `/api/games/{gameCode}` endpoint
- **FR-5.5:** Show success message and refresh list on successful deletion
- **FR-5.6:** Handle error responses (e.g., game in use)

### FR-6: Quick Status Toggle
- **FR-6.1:** Provide toggle switch/button for IsActive status in the list view
- **FR-6.2:** Update status immediately without opening edit form
- **FR-6.3:** Call PATCH `/api/games/{gameCode}` with only IsActive field
- **FR-6.4:** Show visual feedback during status update
- **FR-6.5:** Revert toggle if update fails

### FR-7: Game Details View
- **FR-7.1:** Provide "View Details" option for each game
- **FR-7.2:** Display all game information:
  - GameCode, Name, Description, Type
  - ImageUrl (display image if available)
  - Instructions, Configuration (if available)
  - IsActive status
  - CreatedAt, UpdatedAt timestamps
- **FR-7.3:** Provide "Edit" and "Delete" actions from details view

### FR-8: API Integration
- **FR-8.1:** Implement service layer for game API calls
- **FR-8.2:** API Endpoints:
  - GET `/api/games` with GetGamesInput query parameters
  - POST `/api/games` with CreateGameDto
  - PUT/PATCH `/api/games/{gameCode}` with UpdateGameDto
  - DELETE `/api/games/{gameCode}`
  - GET `/api/games/{gameCode}` for details
- **FR-8.3:** Handle authentication tokens in API requests
- **FR-8.4:** Implement proper error handling for all API calls
- **FR-8.5:** Map backend DTOs to frontend models

### FR-9: Form Validation
- **FR-9.1:** Client-side validation matching backend constraints:
  - GameCode: required, max 50 characters
  - Name: required, max 50 characters
  - Description: required
- **FR-9.2:** Display validation errors inline with form fields
- **FR-9.3:** Disable submit button until form is valid
- **FR-9.4:** Display backend validation errors returned from API

### FR-10: Access Control
- **FR-10.1:** Restrict access to admin users only
- **FR-10.2:** Implement route guard to prevent unauthorized access
- **FR-10.3:** Redirect non-admin users to appropriate page
- **FR-10.4:** All admin users have full CRUD permissions

## 6. Non-Functional Requirements

### NFR-1: Performance
- **NFR-1.1:** Page load time < 2 seconds
- **NFR-1.2:** API response time < 1 second for CRUD operations
- **NFR-1.3:** Search/filter results display within 500ms
- **NFR-1.4:** Support pagination for large game catalogs (100+ games)

### NFR-2: Security
- **NFR-2.1:** All API calls must include authentication tokens
- **NFR-2.2:** Implement CSRF protection for state-changing operations
- **NFR-2.3:** Validate admin role on both frontend and backend
- **NFR-2.4:** Sanitize user inputs to prevent XSS attacks
- **NFR-2.5:** Use HTTPS for all API communications

### NFR-3: Usability
- **NFR-3.1:** Interface must be intuitive and require no training
- **NFR-3.2:** Provide clear visual feedback for all actions
- **NFR-3.3:** Display loading indicators during API calls
- **NFR-3.4:** Show clear error messages with actionable guidance
- **NFR-3.5:** Responsive design for desktop screens (tablet/mobile not required)

### NFR-4: Reliability
- **NFR-4.1:** Graceful error handling for network failures
- **NFR-4.2:** Retry mechanism for failed API calls (max 3 retries)
- **NFR-4.3:** No data loss during form submission
- **NFR-4.4:** Maintain data consistency between frontend and backend

### NFR-5: Maintainability
- **NFR-5.1:** Follow Angular best practices and style guide
- **NFR-5.2:** Implement reusable components for forms and lists
- **NFR-5.3:** Use TypeScript interfaces matching backend DTOs
- **NFR-5.4:** Comprehensive error logging for debugging
- **NFR-5.5:** Code documentation for complex logic

### NFR-6: Scalability
- **NFR-6.1:** Support growing game catalog (100+ games)
- **NFR-6.2:** Efficient pagination and lazy loading
- **NFR-6.3:** Optimized API calls (avoid N+1 queries)

### NFR-7: Accessibility
- **NFR-7.1:** Keyboard navigation support
- **NFR-7.2:** Proper ARIA labels for screen readers
- **NFR-7.3:** Sufficient color contrast for text and buttons
- **NFR-7.4:** Focus indicators for interactive elements

### NFR-8: Browser Compatibility
- **NFR-8.1:** Support latest versions of Chrome, Firefox, Edge, Safari
- **NFR-8.2:** Minimum browser version: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

## 7. Out of Scope

The following items are explicitly **not included** in this feature:

### OS-1: Game Development and Deployment
- Uploading or deploying actual game builds through the admin interface
- Modifying game logic or code
- Game version control or rollback functionality

### OS-2: Advanced Game Configuration
- Complex game configuration UI (Configuration field is stored as string only)
- Game-specific settings management
- Scoring rule configuration beyond metadata

### OS-3: Analytics and Reporting
- Game performance analytics
- Player statistics per game
- Usage reports and dashboards

### OS-4: Multi-language Support
- Internationalization of game metadata
- Multiple language versions of game descriptions

### OS-5: Game Session Management
- Viewing active game sessions
- Manually terminating game sessions
- Session history and logs

### OS-6: Advanced Permissions
- Role-based access control (RBAC) beyond admin/non-admin
- Granular permissions (view-only, edit-only roles)
- Approval workflows for game changes

### OS-7: Bulk Operations
- Bulk upload of games via CSV/Excel
- Bulk enable/disable multiple games
- Bulk delete operations

### OS-8: Game Preview
- Preview game functionality from admin interface
- Test mode for games

### OS-9: Audit Trail
- Detailed change history for each game
- User activity logs
- Rollback to previous versions

### OS-10: Mobile Admin Interface
- Mobile-optimized admin interface
- Native mobile app for game management

## 8. Dependencies & Assumptions

### 8.1 Dependencies

#### Technical Dependencies
- **Backend API:** Fully functional game management API with endpoints specified in FR-8.2
- **Authentication System:** Existing authentication and authorization system with admin role identification
- **Angular Framework:** Angular 15+ with necessary dependencies
- **UI Component Library:** Existing UI component library (e.g., PrimeNG, Angular Material) for consistent styling
- **HTTP Client:** Angular HttpClient for API communication

#### External Dependencies
- **Backend Development:** Backend team must complete API implementation before frontend integration
- **Database:** Backend database schema for games table
- **Image Storage:** If ImageUrl is used, CDN or storage service for game images

### 8.2 Assumptions

#### Business Assumptions
- **ASM-1:** Only administrators need access to game management functionality
- **ASM-2:** All administrators have equal permissions (no role hierarchy)
- **ASM-3:** Hard delete is acceptable (no soft delete or archive requirement)
- **ASM-4:** Games are deployed separately from metadata management
- **ASM-5:** Existing games (2.48, queens, tango) will be migrated to the new system

#### Technical Assumptions
- **ASM-6:** Backend API follows RESTful conventions
- **ASM-7:** Backend handles all business logic and validation
- **ASM-8:** Authentication tokens are managed by existing auth service
- **ASM-9:** Disabling a game (IsActive = false) prevents new game sessions but doesn't affect ongoing sessions (backend responsibility)
- **ASM-10:** GameCode is unique and immutable after creation
- **ASM-11:** Configuration field is stored as JSON string (parsing not required in admin interface)
- **ASM-12:** Type field is a simple string (no predefined enum or validation)

#### Data Assumptions
- **ASM-13:** Game catalog will start with 3 games and grow gradually
- **ASM-14:** Game names and descriptions are in English (single language)
- **ASM-15:** ImageUrl points to externally hosted images (no upload functionality)

#### User Assumptions
- **ASM-16:** Administrators are technically proficient and familiar with admin interfaces
- **ASM-17:** Administrators have desktop/laptop access (no mobile requirement)
- **ASM-18:** Administrators understand the impact of enabling/disabling games

## 9. Acceptance Criteria

The Manage Games Page feature is considered complete when the following criteria are met:

### AC-1: Core Functionality
- ✅ Admin can view paginated list of all games
- ✅ Admin can search games by name or code
- ✅ Admin can filter games by active/inactive status
- ✅ Admin can create a new game with required fields
- ✅ Admin can update game name, description, and status
- ✅ Admin can delete a game with confirmation
- ✅ Admin can toggle game active status quickly from list view

### AC-2: Data Integrity
- ✅ All CRUD operations correctly interact with backend API
- ✅ Form validation matches backend constraints
- ✅ GameCode uniqueness is enforced
- ✅ Required fields cannot be submitted empty
- ✅ Character limits are enforced (50 chars for GameCode and Name)

### AC-3: User Experience
- ✅ All actions provide immediate visual feedback
- ✅ Loading indicators display during API calls
- ✅ Success messages confirm completed actions
- ✅ Error messages are clear and actionable
- ✅ Confirmation dialog prevents accidental deletions
- ✅ Interface is responsive and intuitive

### AC-4: Access Control
- ✅ Only authenticated admin users can access the page
- ✅ Non-admin users are redirected appropriately
- ✅ All API calls include authentication tokens

### AC-5: Performance
- ✅ Page loads in under 2 seconds
- ✅ API operations complete in under 1 second
- ✅ Search/filter results display within 500ms
- ✅ Pagination works smoothly with 10+ games

### AC-6: Error Handling
- ✅ Network errors are handled gracefully
- ✅ Backend validation errors are displayed to user
- ✅ Failed operations don't leave UI in inconsistent state
- ✅ Duplicate GameCode error is handled and displayed

### AC-7: Game Status Behavior
- ✅ Disabling a game (IsActive = false) prevents new access
- ✅ Ongoing game sessions continue when game is disabled
- ✅ Status changes are reflected immediately in the UI

### AC-8: Integration
- ✅ Successfully integrates with existing authentication system
- ✅ Follows existing Angular project structure and patterns
- ✅ Uses existing UI component library consistently
- ✅ API service layer properly handles all endpoints

### AC-9: Code Quality
- ✅ Code follows Angular style guide and best practices
- ✅ TypeScript interfaces match backend DTOs
- ✅ Components are properly structured and reusable
- ✅ Error logging is implemented for debugging
- ✅ Code is documented where necessary

### AC-10: Testing
- ✅ All user stories can be completed successfully
- ✅ Edge cases are handled (empty lists, long text, special characters)
- ✅ Error scenarios are tested (network failure, validation errors)
- ✅ Existing games (2.48, queens, tango) are successfully managed

## 10. Technical Implementation Notes

### 10.1 Recommended Architecture

```
src/app/pages/admin/
├── games/
│   ├── games-list/
│   │   ├── games-list.component.ts
│   │   ├── games-list.component.html
│   │   └── games-list.component.scss
│   ├── game-form/
│   │   ├── game-form.component.ts
│   │   ├── game-form.component.html
│   │   └── game-form.component.scss
│   ├── game-details/
│   │   ├── game-details.component.ts
│   │   ├── game-details.component.html
│   │   └── game-details.component.scss
│   └── games-routing.module.ts

src/app/services/
├── game.service.ts

src/app/models/
├── game.model.ts
├── create-game.model.ts
├── update-game.model.ts
└── get-games-input.model.ts
```

### 10.2 Key TypeScript Interfaces

```typescript
export interface GameDto {
  gameCode: string;
  name: string;
  description: string;
  imageUrl: string;
  instructions: string;
  configuration: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateGameDto {
  gameCode: string;
  name: string;
  description: string;
}

export interface UpdateGameDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface GetGamesInput {
  searchText?: string;
  isActive?: boolean;
  skipCount: number;
  maxResultCount: number;
}

export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
}
```

### 10.3 API Service Methods

```typescript
export class GameService {
  getGames(input: GetGamesInput): Observable<PagedResultDto<GameDto>>
  getGameByCode(gameCode: string): Observable<GameDto>
  createGame(input: CreateGameDto): Observable<GameDto>
  updateGame(gameCode: string, input: UpdateGameDto): Observable<GameDto>
  deleteGame(gameCode: string): Observable<void>
}
```

### 10.4 Routing Configuration

```typescript
{
  path: 'admin/games',
  component: GamesListComponent,
  canActivate: [AdminGuard]
}
```

## 11. Migration Plan

### 11.1 Existing Games Migration
The following existing games need to be added to the backend database:
1. **2.48** - Game code, name, and description to be defined
2. **Queens** - Game code, name, and description to be defined
3. **Tango** - Game code, name, and description to be defined

### 11.2 Migration Steps
1. Backend team creates initial game records in database
2. Frontend team updates game references to use backend data
3. Verify all existing games function correctly with new system
4. Remove hardcoded game references from Angular code

## 12. Future Enhancements (Post-MVP)

While out of scope for initial release, the following enhancements may be considered for future iterations:

1. **Analytics Dashboard:** View game usage statistics and player engagement
2. **Audit Trail:** Track all changes made to game configurations
3. **Bulk Operations:** Enable/disable multiple games simultaneously
4. **Game Preview:** Test games directly from admin interface
5. **Advanced Permissions:** Role-based access with granular permissions
6. **Game Categories:** Organize games into categories or tags
7. **Scheduling:** Schedule games to be enabled/disabled at specific times
8. **A/B Testing:** Support multiple versions of games for testing
9. **Export/Import:** Backup and restore game configurations
10. **Notification System:** Alert admins of game-related events

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-17 | System | Initial PRD creation |

---

**Document Status:** ✅ Ready for Review  
**Next Steps:** Review with stakeholders, obtain approval, begin implementation planning
