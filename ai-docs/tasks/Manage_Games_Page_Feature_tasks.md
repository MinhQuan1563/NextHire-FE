# Manage Games Page Feature - Task Breakdown

## Overview
This document provides a detailed task breakdown for implementing the Manage Games Page feature, which enables administrators to manage mini-games through backend integration.

---

## Task List

### 1. [x] Planning & Alignment
   1.1 [x] Review PRD goals, scope, and acceptance criteria
   1.2 [x] Confirm backend API endpoints availability and specifications
   1.3 [x] Verify authentication system supports admin role identification
   1.4 [x] Identify UI component library to be used (PrimeNG, Angular Material, etc.)
   1.5 [x] Review existing Angular project structure and patterns
   1.6 [x] Plan migration strategy for existing games (2.48, queens, tango)

### 2. [x] Design & Architecture
   2.1 [x] Design component hierarchy and folder structure
   2.2 [x] Define TypeScript interfaces matching backend DTOs (GameDto, CreateGameDto, UpdateGameDto, GetGamesInput, PagedResultDto)
   2.3 [x] Design game service architecture for API integration
   2.4 [x] Plan routing configuration with admin guard
   2.5 [x] Design form validation strategy (client-side + backend error handling)
   2.6 [x] Plan state management approach for games list and filters
   2.7 [x] Design error handling and retry mechanism strategy

### 3. [x] Implementation - Models & Interfaces
   3.1 [x] Create `game.model.ts` with GameDto interface
   3.2 [x] Create `create-game.model.ts` with CreateGameDto interface
   3.3 [x] Create `update-game.model.ts` with UpdateGameDto interface
   3.4 [x] Create `get-games-input.model.ts` with GetGamesInput interface
   3.5 [x] Create `paged-result.model.ts` with PagedResultDto interface

### 4. [x] Implementation - Game Service
   4.1 [x] Create `game.service.ts` in services folder
   4.2 [x] Implement `getGames(input: GetGamesInput)` method with pagination support
   4.3 [x] Implement `getGameByCode(gameCode: string)` method
   4.4 [x] Implement `createGame(input: CreateGameDto)` method
   4.5 [x] Implement `updateGame(gameCode: string, input: UpdateGameDto)` method
   4.6 [x] Implement `deleteGame(gameCode: string)` method
   4.7 [x] Add authentication token handling in all API requests
   4.8 [x] Implement error handling and logging for all service methods
   4.9 [x] Add retry mechanism for failed API calls (max 3 retries)

### 5. [x] Implementation - Admin Route Guard
   5.1 [x] Create or update admin guard to restrict access to admin users only
   5.2 [x] Implement role validation logic
   5.3 [x] Configure redirect for non-admin users
   5.4 [ ] Test guard with authenticated and non-authenticated users

### 6. [x] Implementation - Games List Component
   6.1 [x] Create `games-list` component structure (ts, html, scss)
   6.2 [x] Implement component initialization and game data fetching
   6.3 [x] Implement pagination logic (default 10 items per page)
   6.4 [x] Display game columns: Game Code, Name, Type, Status, Created Date, Actions
   6.5 [x] Implement sorting by name and created date
   6.6 [x] Display game thumbnail/image if ImageUrl is available
   6.7 [x] Show total count of games
   6.8 [x] Add loading indicators during API calls
   6.9 [x] Implement error display for failed API calls

### 7. [x] Implementation - Search & Filter Functionality
   7.1 [x] Add search input field for game name or code
   7.2 [x] Implement search with debouncing (300ms delay)
   7.3 [x] Add filter dropdown for IsActive status (All/Active/Inactive)
   7.4 [x] Implement real-time filter application
   7.5 [x] Maintain filter state during pagination
   7.6 [x] Add clear filter/search functionality
   7.7 [ ] Update URL query parameters to preserve filter state

### 8. [x] Implementation - Quick Status Toggle
   8.1 [x] Add toggle switch/button for IsActive status in list view
   8.2 [x] Implement immediate status update without opening edit form
   8.3 [x] Call PATCH endpoint with only IsActive field
   8.4 [x] Add visual feedback during status update (loading spinner)
   8.5 [x] Implement toggle revert on update failure
   8.6 [x] Display success/error messages for status changes

### 9. [x] Implementation - Game Form Component (Create/Edit)
   9.1 [x] Create `game-form` component structure (ts, html, scss)
   9.2 [x] Design form layout with required fields
   9.3 [x] Add form fields: GameCode, Name, Description
   9.4 [x] Implement reactive form with FormBuilder
   9.5 [x] Add client-side validation (required fields, max length 50 for GameCode and Name)
   9.6 [x] Display validation errors inline with form fields
   9.7 [x] Disable submit button until form is valid
   9.8 [x] Implement create mode (all fields editable)
   9.9 [x] Implement edit mode (GameCode read-only, add IsActive toggle)
   9.10 [x] Handle form submission for create operation
   9.11 [x] Handle form submission for update operation
   9.12 [x] Display backend validation errors returned from API
   9.13 [x] Show success messages after successful operations
   9.14 [x] Implement form reset after successful creation
   9.15 [x] Add cancel button to close form

### 10. [x] Implementation - Create Game Functionality
   10.1 [x] Add "Add New Game" button in games list
   10.2 [x] Open game form in create mode (modal or separate view)
   10.3 [x] Validate all required fields before submission
   10.4 [x] Call game service createGame method
   10.5 [x] Handle successful creation (show message, refresh list, close form)
   10.6 [x] Handle error responses (duplicate GameCode, validation errors)
   10.7 [x] Display appropriate error messages to user

### 11. [x] Implementation - Update Game Functionality
   11.1 [x] Add "Edit" button for each game in the list
   11.2 [x] Open game form in edit mode pre-populated with current values
   11.3 [x] Ensure GameCode field is read-only
   11.4 [x] Allow editing of Name, Description, and IsActive fields
   11.5 [x] Call game service updateGame method
   11.6 [x] Handle successful update (show message, refresh list, close form)
   11.7 [x] Handle error responses and display to user

### 12. [x] Implementation - Delete Game Functionality
   12.1 [x] Add "Delete" button for each game in the list
   12.2 [x] Create confirmation dialog component or use existing
   12.3 [x] Display confirmation message: "Are you sure you want to permanently delete [Game Name]? This action cannot be undone."
   12.4 [x] Implement cancel action in confirmation dialog
   12.5 [x] Call game service deleteGame method on confirmation
   12.6 [x] Handle successful deletion (show message, refresh list)
   12.7 [x] Handle error responses (e.g., game in use)

### 13. [x] Implementation - Game Details Component
   13.1 [x] Create `game-details` component structure (ts, html, scss)
   13.2 [x] Add "View Details" option for each game in list
   13.3 [x] Fetch and display complete game information
   13.4 [x] Display GameCode, Name, Description, Type
   13.5 [x] Display ImageUrl (show image if available)
   13.6 [x] Display Instructions and Configuration (if available)
   13.7 [x] Display IsActive status with visual indicator
   13.8 [x] Display CreatedAt and UpdatedAt timestamps
   13.9 [x] Add "Edit" and "Delete" action buttons in details view
   13.10 [x] Implement navigation back to games list

### 14. [x] Implementation - Routing Configuration
   14.1 [x] Create `games-routing.module.ts`
   14.2 [x] Configure route for games list: `/admin/games`
   14.3 [x] Configure route for game details: `/admin/games/:gameCode`
   14.4 [x] Apply AdminGuard to all game management routes
   14.5 [x] Configure lazy loading if applicable
   14.6 [ ] Test navigation between routes

### 15. [x] Implementation - UI/UX Enhancements
   15.1 [x] Apply consistent styling using project's UI component library
   15.2 [x] Implement responsive design for desktop screens
   15.3 [x] Add loading spinners for all async operations
   15.4 [x] Implement success toast/snackbar notifications
   15.5 [x] Implement error toast/snackbar notifications
   15.6 [x] Add visual indicators for active/inactive game status
   15.7 [x] Ensure sufficient color contrast for accessibility
   15.8 [x] Add keyboard navigation support
   15.9 [x] Add proper ARIA labels for screen readers
   15.10 [x] Add focus indicators for interactive elements

### 16. [x] Implementation - Error Handling & Validation
   16.1 [x] Implement global error interceptor for API calls
   16.2 [x] Handle network failures gracefully
   16.3 [x] Display user-friendly error messages
   16.4 [x] Implement error logging for debugging
   16.5 [x] Handle 401/403 authentication/authorization errors
   16.6 [x] Handle 404 errors for non-existent games
   16.7 [x] Handle 409 conflict errors (duplicate GameCode)
   16.8 [x] Handle 500 server errors
   16.9 [x] Prevent UI inconsistent state on failed operations
   16.10 [x] Sanitize user inputs to prevent XSS attacks

### 17. [x] Migration - Existing Games
   17.1 [x] Coordinate with backend team on game data migration
   17.2 [x] Verify 2.48 game is added to backend database
   17.3 [x] Verify Queens game is added to backend database
   17.4 [x] Verify Tango game is added to backend database
   17.5 [x] Update frontend game references to use backend data
   17.6 [ ] Test all existing games function correctly with new system
   17.7 [x] Remove hardcoded game references from Angular code
   17.8 [ ] Verify game sessions continue working after migration
---

## Notes

### Priority Levels
- **High Priority:** Tasks 1-16 (Core functionality and implementation)
- **Medium Priority:** Tasks 17-20 (Testing and security)
- **Standard Priority:** Tasks 21-27 (Migration, documentation, deployment)

### Dependencies
- Backend API must be fully functional before integration testing (Task 18)
- Admin guard must be implemented before routing configuration (Task 14)
- Models and service must be complete before component implementation (Tasks 3-4 before 6-13)
- All implementation must be complete before UAT (Task 19)

### Estimated Timeline
- Planning & Design: 2-3 days
- Implementation: 10-12 days
- Testing: 5-7 days
- Migration & Deployment: 2-3 days
- **Total: 19-25 days**

### Risk Mitigation
- Backend API delays: Implement mock service for parallel development
- Authentication issues: Early integration testing with auth system
- Performance concerns: Load testing with large datasets early
- Migration issues: Thorough testing with existing games before production

---

**Document Status:** ✅ Ready for Execution  
**Last Updated:** 2026-01-17
