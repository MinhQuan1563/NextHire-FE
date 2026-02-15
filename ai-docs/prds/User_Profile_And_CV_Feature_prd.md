# User Profile and CV Feature - Product Requirements Document

## 1. Overview

### Feature Summary
The User Profile and CV feature provides comprehensive profile management capabilities for users in the NextHire platform. It consists of four main components: My Profile Page (viewing own profile), Other User Profile Page (viewing other users' profiles), Edit Profile Page (updating profile information), and User CV Page (managing CV documents). This feature enables users to maintain their professional presence, showcase their skills and experience, and manage their CV documents for job applications.

### Problem Statement
Users need a centralized, intuitive interface to:
- Review and manage their personal and professional information
- View other users' profiles to understand their background and connect with them
- Update their profile information as their career evolves
- Manage multiple CV documents efficiently for different job applications

### Goals and Objectives
- Provide users with a clear view of their profile information
- Enable seamless profile editing and updates
- Support viewing and interaction with other users' profiles
- Facilitate efficient CV management (upload, view, update, delete, set default)
- Ensure all profile data is displayed according to the API DTO structure
- Support structured data input for complex fields (skills, experience, education, personal projects)
- Ensure mobile responsiveness and accessibility compliance

---

## 2. Success Metrics (KPIs)
*Note: Specific KPIs to be defined by product team*

---

## 3. User Personas

### Primary Persona: Job Seeker
- **Name**: Active Job Seeker
- **Description**: A professional actively looking for job opportunities
- **Goals**: Maintain up-to-date profile, manage multiple CVs for different applications
- **Pain Points**: Need to keep profile current, organize multiple CV versions

### Secondary Persona: Network Builder
- **Name**: Professional Networker
- **Description**: User focused on building professional connections
- **Goals**: View other users' profiles, connect with professionals
- **Pain Points**: Need clear profile information to make connection decisions

---

## 4. User Stories / Use Cases

### My Profile Page
**As a** logged-in user  
**I want to** view my complete profile information  
**So that** I can review my personal details, skills, experience, and professional information

**Acceptance Criteria**:
- User can view all fields from UserProfileDto
- Profile information is clearly organized and readable
- Avatar is displayed prominently
- All sections (personal info, skills, experience, education, projects, portfolio, saved jobs) are visible

### Other User Profile Page
**As a** logged-in user  
**I want to** view another user's public profile  
**So that** I can learn about them and decide whether to connect or message them

**Acceptance Criteria**:
- User can view public profile information of other users (when API is available)
- Friendship status is clearly indicated (not friends, pending request, friends, blocked)
- User can send friend requests (if not already friends)
- User can see interaction options based on friendship status
- Profile displays appropriate level of information based on privacy settings

### Edit Profile Page
**As a** logged-in user  
**I want to** edit my profile information  
**So that** my personal details, skills, avatar, and other information are always up to date

**Acceptance Criteria**:
- User can edit all editable fields from UserProfileDto
- Structured input is provided for JSON fields (skills, experience, education, personal projects)
- User can upload/change avatar
- Validation ensures data integrity
- Changes are saved and reflected immediately
- Success and error messages are clearly displayed

### User CV Page
**As a** logged-in user  
**I want to** view, upload, update, delete, and manage my CVs  
**So that** I can maintain organized CV documents for job applications

**Acceptance Criteria**:
- User can view list of all their CVs
- User can upload new CV files (PDF, DOCX, max 10MB)
- User can preview CVs (thumbnail/preview)
- User can update CV metadata (name)
- User can delete CVs
- User can set a default CV
- User can download CVs
- File size and type validation prevents invalid uploads

---

## 5. Functional Requirements

### 5.1 My Profile Page (FR-MP-001 to FR-MP-015)

**FR-MP-001**: Display User ID (UUID format)  
**FR-MP-002**: Display User Code (string, nullable)  
**FR-MP-003**: Display Full Name (string, nullable)  
**FR-MP-004**: Display Date of Birth (date-time format, nullable)  
**FR-MP-005**: Display Gender (integer enum, display human-readable value)  
**FR-MP-006**: Display Avatar Image (URL string, nullable, show placeholder if null)  
**FR-MP-007**: Display Skills (JSON string, parse and display as structured data)  
**FR-MP-008**: Display Experience (JSON string, parse and display as structured data)  
**FR-MP-009**: Display Education (JSON string, parse and display as structured data)  
**FR-MP-010**: Display Personal Projects (JSON string, parse and display as structured data)  
**FR-MP-011**: Display Portfolio URL (string, nullable, render as clickable link if provided)  
**FR-MP-012**: Display Saved Jobs (JSON string, parse and display as structured data)  
**FR-MP-013**: Provide "Edit Profile" action button/link  
**FR-MP-014**: Handle loading state while fetching profile data  
**FR-MP-015**: Display error message if profile data cannot be loaded

### 5.2 Other User Profile Page (FR-OP-001 to FR-OP-020)

**FR-OP-001**: Display public profile information for specified user (when API endpoint available)  
**FR-OP-002**: Display same fields as My Profile Page (based on API response)  
**FR-OP-003**: Check and display friendship status (not friends, pending, friends, blocked)  
**FR-OP-004**: Show "Send Friend Request" button if users are not friends  
**FR-OP-005**: Show "Cancel Friend Request" button if request is pending (sent by current user)  
**FR-OP-006**: Show "Accept/Decline" options if request is pending (received by current user)  
**FR-OP-007**: Show "Unfriend" option if users are friends  
**FR-OP-008**: Show "Block User" option  
**FR-OP-009**: Show "Message" button if users are friends (out of scope for implementation, but UI placeholder)  
**FR-OP-010**: Handle case where user profile is not found  
**FR-OP-011**: Handle case where profile access is restricted  
**FR-OP-012**: Display appropriate error messages for different scenarios  
**FR-OP-013**: Show loading state during profile fetch  
**FR-OP-014**: Show loading state during friendship status check  
**FR-OP-015**: Update friendship status UI immediately after action (optimistic update)  
**FR-OP-016**: Handle friendship action errors and revert UI if needed  
**FR-OP-017**: Parse and display JSON fields (skills, experience, education, personal projects)  
**FR-OP-018**: Display portfolio URL as clickable link if available  
**FR-OP-019**: Handle avatar display with fallback placeholder  
**FR-OP-020**: Ensure profile page is accessible via direct URL with userCode parameter

### 5.3 Edit Profile Page (FR-EP-001 to FR-EP-035)

**FR-EP-001**: Pre-populate form with current profile data from UserProfileDto  
**FR-EP-002**: Allow editing of Full Name (text input, nullable, max length validation based on API)  
**FR-EP-003**: Allow editing of Date of Birth (date picker, nullable, date-time format)  
**FR-EP-004**: Allow editing of Gender (dropdown/radio buttons, integer enum values)  
**FR-EP-005**: Allow uploading new Avatar (file input, image types only, with preview)  
**FR-EP-006**: Display current avatar with option to change  
**FR-EP-007**: Provide structured input for Skills (see JSON Structure Section 5.7)  
**FR-EP-008**: Provide structured input for Experience (see JSON Structure Section 5.7)  
**FR-EP-009**: Provide structured input for Education (see JSON Structure Section 5.7)  
**FR-EP-010**: Provide structured input for Personal Projects (see JSON Structure Section 5.7)  
**FR-EP-011**: Allow editing of Portfolio URL (URL input, nullable, URL format validation)  
**FR-EP-012**: Allow editing of Saved Jobs (structured input, see JSON Structure Section 5.7)  
**FR-EP-013**: Validate all inputs before submission  
**FR-EP-014**: Serialize structured data to JSON strings for API submission  
**FR-EP-015**: Handle form submission errors and display user-friendly messages  
**FR-EP-016**: Show success message after successful update  
**FR-EP-017**: Update local state/UI immediately after successful update  
**FR-EP-018**: Handle loading state during avatar upload  
**FR-EP-019**: Handle loading state during profile update  
**FR-EP-020**: Validate JSON structure before serialization  
**FR-EP-021**: Provide "Cancel" option to discard changes  
**FR-EP-022**: Confirm before discarding unsaved changes  
**FR-EP-023**: Handle avatar upload separately via dedicated API endpoint  
**FR-EP-024**: Update avatar URL in profile after successful upload  
**FR-EP-025**: Validate image file size for avatar (recommended max 5MB, but follow API constraints)  
**FR-EP-026**: Validate image file type for avatar (JPEG, PNG, GIF, WebP)  
**FR-EP-027**: Show image preview before avatar upload confirmation  
**FR-EP-028**: Handle avatar upload errors separately from profile update  
**FR-EP-029**: Ensure form is accessible (keyboard navigation, screen readers)  
**FR-EP-030**: Display field labels and help text where appropriate  
**FR-EP-031**: Mark required fields (if any) clearly  
**FR-EP-032**: Handle concurrent update conflicts (if API supports versioning)  
**FR-EP-033**: Validate date of birth is not in the future  
**FR-EP-034**: Validate portfolio URL format (http/https)  
**FR-EP-035**: Preserve userCode and id fields (read-only, not editable)

### 5.4 User CV Page (FR-CV-001 to FR-CV-030)

**FR-CV-001**: Display list of all user's CVs (from /api/UserCv/by-user endpoint)  
**FR-CV-002**: Display CV ID, Name, Created Date, Default Status, Version for each CV  
**FR-CV-003**: Highlight default CV clearly in the list  
**FR-CV-004**: Provide "Upload New CV" button/action  
**FR-CV-005**: Open upload dialog/form when "Upload New CV" is clicked  
**FR-CV-006**: Allow file selection for CV upload (PDF, DOCX only)  
**FR-CV-007**: Validate file type before upload (PDF, DOCX)  
**FR-CV-008**: Validate file size before upload (max 10MB)  
**FR-CV-009**: Require CV Name input (text field, required)  
**FR-CV-010**: Provide "Set as Default" checkbox option during upload  
**FR-CV-011**: Show file name and size after file selection  
**FR-CV-012**: Handle CV upload via multipart/form-data (CvFile as binary)  
**FR-CV-013**: Display upload progress indicator  
**FR-CV-014**: Handle upload success and refresh CV list  
**FR-CV-015**: Handle upload errors and display user-friendly messages  
**FR-CV-016**: Provide "Edit" action for each CV (edit name only, file cannot be changed)  
**FR-CV-017**: Open edit dialog/form for CV metadata  
**FR-CV-018**: Allow updating CV Name only  
**FR-CV-019**: Save CV metadata updates via PUT /api/UserCv/{cvId}  
**FR-CV-020**: Provide "Delete" action for each CV  
**FR-CV-021**: Confirm before deleting CV (confirmation dialog)  
**FR-CV-022**: Prevent deletion of default CV if it's the only CV  
**FR-CV-023**: Handle CV deletion via DELETE /api/UserCv/{cvId}  
**FR-CV-024**: Refresh CV list after deletion  
**FR-CV-025**: Provide "Set as Default" action for non-default CVs  
**FR-CV-026**: Handle set default via POST /api/UserCv/set-default  
**FR-CV-027**: Update default status in UI immediately  
**FR-CV-028**: Provide "Preview" action to view CV (thumbnail/preview)  
**FR-CV-029**: Provide "Download" action to download CV file  
**FR-CV-030**: Handle CV download via GET /api/UserCv/download/{cvId}

### 5.5 JSON Data Structures and Validation

#### Skills JSON Structure
```json
{
  "skills": [
    {
      "name": "string",
      "level": "beginner" | "intermediate" | "advanced" | "expert",
      "yearsOfExperience": number
    }
  ]
}
```

**Validation Rules**:
- Must be valid JSON array
- Each skill object must have "name" (non-empty string, max 100 chars)
- "level" must be one of the predefined values
- "yearsOfExperience" must be non-negative number (optional)

#### Experience JSON Structure
```json
{
  "experiences": [
    {
      "company": "string",
      "position": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD" | null,
      "isCurrent": boolean,
      "description": "string",
      "achievements": ["string"]
    }
  ]
}
```

**Validation Rules**:
- Must be valid JSON array
- Each experience must have "company" (non-empty string, max 200 chars)
- Each experience must have "position" (non-empty string, max 200 chars)
- "startDate" must be valid date in YYYY-MM-DD format
- "endDate" must be null or valid date after startDate (if not current)
- "isCurrent" must be boolean
- If "isCurrent" is true, "endDate" must be null
- "description" is optional (max 2000 chars)
- "achievements" is optional array of strings (each max 500 chars)

#### Education JSON Structure
```json
{
  "educations": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD" | null,
      "isCurrent": boolean,
      "grade": "string",
      "description": "string"
    }
  ]
}
```

**Validation Rules**:
- Must be valid JSON array
- Each education must have "institution" (non-empty string, max 200 chars)
- Each education must have "degree" (non-empty string, max 200 chars)
- "fieldOfStudy" is optional (max 200 chars)
- "startDate" must be valid date in YYYY-MM-DD format
- "endDate" must be null or valid date after startDate (if not current)
- "isCurrent" must be boolean
- If "isCurrent" is true, "endDate" must be null
- "grade" is optional (max 50 chars)
- "description" is optional (max 1000 chars)

#### Personal Projects JSON Structure
```json
{
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD" | null,
      "isCurrent": boolean,
      "url": "string",
      "githubUrl": "string"
    }
  ]
}
```

**Validation Rules**:
- Must be valid JSON array
- Each project must have "name" (non-empty string, max 200 chars)
- "description" is optional (max 2000 chars)
- "technologies" is optional array of strings (each max 100 chars)
- "startDate" must be valid date in YYYY-MM-DD format
- "endDate" must be null or valid date after startDate (if not current)
- "isCurrent" must be boolean
- If "isCurrent" is true, "endDate" must be null
- "url" is optional, must be valid URL format if provided
- "githubUrl" is optional, must be valid URL format if provided

#### Saved Jobs JSON Structure
```json
{
  "savedJobs": [
    {
      "jobCode": "string",
      "savedDate": "YYYY-MM-DDTHH:mm:ssZ"
    }
  ]
}
```

**Validation Rules**:
- Must be valid JSON array
- Each saved job must have "jobCode" (non-empty string)
- "savedDate" must be valid ISO 8601 date-time format

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Profile page should load within 2 seconds under normal network conditions
- CV list should load within 2 seconds
- Avatar upload should complete within 10 seconds for files under 5MB
- CV upload should show progress for files over 1MB
- Image preview should render immediately after file selection

### 6.2 Security
- All API calls must include authentication token (Bearer token)
- File uploads must validate file type on both client and server
- File size limits must be enforced on client side (10MB for CVs, 5MB recommended for avatars)
- User can only edit their own profile
- User can only manage their own CVs
- XSS prevention: All user-generated content must be sanitized before display
- CSRF protection via tokens (handled by framework)

### 6.3 Scalability
- Support handling of profiles with large JSON data structures
- Efficient rendering of CV lists with 100+ CVs (pagination may be needed in future)
- Optimize image loading (lazy loading, proper sizing)

### 6.4 Reliability
- Graceful handling of API failures with user-friendly error messages
- Retry logic for network failures (optional, implement if time permits)
- Offline detection and appropriate messaging
- Data validation prevents invalid data submission

### 6.5 Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support for all interactive elements
- Screen reader support with proper ARIA labels
- Color contrast ratios meet WCAG standards
- Form labels properly associated with inputs
- Error messages accessible to screen readers
- Focus indicators visible for keyboard navigation

### 6.6 Mobile Responsiveness
- Responsive design for mobile, tablet, and desktop viewports
- Touch-friendly interface elements (minimum 44x44px touch targets)
- Optimized layout for small screens
- Avatar and CV previews adapt to screen size
- Forms are usable on mobile devices
- File upload works on mobile devices

### 6.7 Browser Compatibility
- Support for modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- Graceful degradation for older browsers

---

## 7. User Flow / Journey Description

### 7.1 Viewing Own Profile
1. User navigates to "My Profile" page (via menu/navigation)
2. System fetches profile data from `/api/UserProfile/Get`
3. System displays loading indicator
4. System parses JSON fields (skills, experience, education, projects, saved jobs)
5. System renders profile information in organized sections
6. User reviews their profile information
7. User clicks "Edit Profile" to make changes (goes to Edit Profile flow)

### 7.2 Viewing Other User's Profile
1. User navigates to another user's profile (via userCode in URL or link)
2. System fetches user profile from public profile API endpoint (to be implemented)
3. System fetches friendship status from `/api/friendship/friends/{userCode}` or pending endpoint
4. System displays loading indicators
5. System renders profile information based on API response
6. System displays appropriate interaction buttons based on friendship status:
   - Not friends: "Send Friend Request"
   - Pending (sent): "Cancel Request"
   - Pending (received): "Accept" / "Decline"
   - Friends: "Message" (placeholder), "Unfriend"
   - All cases: "Block User"
7. User interacts with friendship buttons as needed
8. System updates UI optimistically and handles API responses

### 7.3 Editing Profile
1. User navigates to Edit Profile page (from My Profile or directly)
2. System loads current profile data from `/api/UserProfile/Get`
3. System populates form fields with current data
4. System parses JSON fields and populates structured input components
5. User modifies fields as needed:
   - Text inputs for simple fields
   - Date picker for date of birth
   - Dropdown for gender
   - Structured editors for JSON fields (add/remove/edit items)
   - File upload for avatar change
6. User clicks "Save" button
7. System validates all inputs:
   - Required fields (if any)
   - Format validations (dates, URLs, JSON structures)
   - File validations (if avatar changed)
8. If avatar changed, system uploads avatar first via `/api/UserProfile/UploadAvatar/avatar`
9. System serializes structured data to JSON strings
10. System submits profile update via PUT `/api/UserProfile/Update`
11. System displays success message
12. System redirects to My Profile page or updates current view

### 7.4 Managing CVs
1. User navigates to "My CVs" page
2. System fetches CV list from `/api/UserCv/by-user`
3. System displays list of CVs with metadata
4. User can perform various actions:

   **Upload New CV:**
   - User clicks "Upload New CV"
   - System shows upload form/dialog
   - User enters CV name (required)
   - User selects file (PDF or DOCX)
   - System validates file type and size
   - User optionally checks "Set as Default"
   - User clicks "Upload"
   - System uploads via POST `/api/UserCv` (multipart/form-data)
   - System refreshes CV list

   **Edit CV Metadata:**
   - User clicks "Edit" on a CV
   - System shows edit dialog with current CV name
   - User modifies CV name
   - User clicks "Save"
   - System updates via PUT `/api/UserCv/{cvId}`
   - System refreshes CV list

   **Set Default CV:**
   - User clicks "Set as Default" on a non-default CV
   - System calls POST `/api/UserCv/set-default` with cvId
   - System updates UI to reflect new default status

   **Delete CV:**
   - User clicks "Delete" on a CV
   - System shows confirmation dialog
   - User confirms deletion
   - System deletes via DELETE `/api/UserCv/{cvId}`
   - System refreshes CV list

   **Preview CV:**
   - User clicks "Preview"
   - System displays CV preview (thumbnail or embedded viewer)

   **Download CV:**
   - User clicks "Download"
   - System initiates download via GET `/api/UserCv/download/{cvId}`

---

## 8. Edge Cases & Error Handling

### 8.1 Profile Data Edge Cases

**EC-PROF-001**: Profile data is null or empty  
- **Handling**: Display appropriate placeholder messages ("No information available")

**EC-PROF-002**: JSON fields contain invalid JSON  
- **Handling**: Display raw string with error indicator, log error for debugging

**EC-PROF-003**: Avatar URL is invalid or image fails to load  
- **Handling**: Display default avatar placeholder

**EC-PROF-004**: Date of birth is in the future  
- **Handling**: Display as-is (validation should prevent this on edit, but handle gracefully)

**EC-PROF-005**: Portfolio URL is invalid  
- **Handling**: Display as plain text instead of clickable link

**EC-PROF-006**: User attempts to edit another user's profile  
- **Handling**: Redirect to own profile, show error message

**EC-PROF-007**: Network timeout during profile fetch  
- **Handling**: Show error message with retry option

**EC-PROF-008**: API returns 401 (Unauthorized)  
- **Handling**: Redirect to login page

**EC-PROF-009**: API returns 403 (Forbidden)  
- **Handling**: Show "Access Denied" message

**EC-PROF-010**: API returns 404 (Profile not found)  
- **Handling**: Show "Profile not found" message with navigation options

**EC-PROF-011**: API returns 500 (Server error)  
- **Handling**: Show generic error message, log error, offer to retry

### 8.2 CV Management Edge Cases

**EC-CV-001**: User has no CVs  
- **Handling**: Display empty state with "Upload Your First CV" call-to-action

**EC-CV-002**: User attempts to upload file exceeding 10MB  
- **Handling**: Show validation error before upload, prevent submission

**EC-CV-003**: User attempts to upload invalid file type  
- **Handling**: Show validation error, prevent file selection or submission

**EC-CV-004**: CV upload fails (network error, server error)  
- **Handling**: Show error message with specific details, allow retry

**EC-CV-005**: User attempts to delete their only CV  
- **Handling**: Show warning that at least one CV is required, prevent deletion or allow with confirmation

**EC-CV-006**: User attempts to delete default CV (if it's the only one)  
- **Handling**: Prevent deletion or automatically set another CV as default first

**EC-CV-007**: CV file is corrupted or unreadable  
- **Handling**: Show error during preview/download, allow user to re-upload

**EC-CV-008**: Multiple CVs with same name  
- **Handling**: Allow duplicates (backend handles uniqueness if needed), display with creation date to differentiate

**EC-CV-009**: CV download fails  
- **Handling**: Show error message, log error, allow retry

**EC-CV-010**: User attempts to set default CV that doesn't exist  
- **Handling**: Refresh CV list, show error if CV still not found

**EC-CV-011**: Concurrent CV operations (e.g., delete while uploading)  
- **Handling**: Disable other actions during active operation, queue operations if needed

### 8.3 Friendship Status Edge Cases

**EC-FR-001**: Friendship status API fails  
- **Handling**: Display profile without friendship actions, show error indicator

**EC-FR-002**: User attempts to send friend request to themselves  
- **Handling**: Disable friend request button, show appropriate message

**EC-FR-003**: User attempts to send friend request when already friends  
- **Handling**: Hide send request button, show appropriate status

**EC-FR-004**: Friend request fails (network error, already exists, etc.)  
- **Handling**: Show error message, revert optimistic UI update

**EC-FR-005**: Friendship status changes while viewing profile  
- **Handling**: Refresh status periodically or use real-time updates if available

### 8.4 Form Validation Edge Cases

**EC-FORM-001**: User submits form with invalid JSON in structured fields  
- **Handling**: Prevent submission, highlight invalid fields, show specific error messages

**EC-FORM-002**: User enters future date for experience/education end date  
- **Handling**: Validate and show error, prevent submission

**EC-FORM-003**: User enters end date before start date  
- **Handling**: Validate and show error, prevent submission

**EC-FORM-004**: User attempts to save without making changes  
- **Handling**: Allow submission (idempotent), or disable save button if no changes

**EC-FORM-005**: Form submission fails after avatar upload succeeds  
- **Handling**: Keep uploaded avatar, show error for profile update, allow retry

**EC-FORM-006**: User closes browser during file upload  
- **Handling**: Upload may continue in background, but user sees incomplete state on return

---

## 9. Out of Scope

### 9.1 Explicitly Excluded
- Password management (handled separately in account settings)
- Email/account settings management
- Real-time messaging integration (UI placeholder only, implementation out of scope)
- Profile privacy settings/controls
- Profile sharing functionality
- CV versioning/change history
- CV templates integration (separate feature)
- Advanced CV editing (text editing within CV)
- Profile completion percentage/progress indicator
- Profile analytics/views tracking
- Export profile as PDF/resume
- Social media integration
- Profile recommendations
- Public profile API endpoint implementation (backend work, out of scope for frontend PRD)

### 9.2 Future Enhancements (Not in Current Scope)
- Bulk CV operations
- CV categories/tags
- Profile visibility controls
- Profile comparison feature
- Advanced search within CVs
- CV sharing via link
- Profile badges/achievements

---

## 10. Dependencies & Assumptions

### 10.1 Dependencies

**Backend API Dependencies**:
- `/api/UserProfile/Get` - Must be available and return UserProfileDto
- `/api/UserProfile/Update` - Must accept UserProfileDto and update profile
- `/api/UserProfile/UploadAvatar/avatar` - Must handle multipart/form-data avatar upload
- `/api/UserCv` (POST) - Must handle CV upload with multipart/form-data
- `/api/UserCv/{cvId}` (GET, PUT, DELETE) - Must handle CV retrieval, update, deletion
- `/api/UserCv/by-user` - Must return array of UserCvDto for current user
- `/api/UserCv/set-default` - Must handle setting default CV
- `/api/UserCv/download/{cvId}` - Must return CV file for download
- `/api/friendship/send-request` - Must handle friend request sending
- `/api/friendship/accept` - Must handle friend request acceptance
- `/api/friendship/decline` - Must handle friend request decline
- `/api/friendship/cancel` - Must handle friend request cancellation
- `/api/friendship/block` - Must handle user blocking
- `/api/friendship/friends/{userCode}` - Must return friendship status
- `/api/friendship/pending/{userCode}` - Must return pending friend requests

**Frontend Dependencies**:
- Angular 17+ framework
- PrimeNG component library
- TailwindCSS for styling
- Authentication service/interceptor for API calls
- File upload utilities
- JSON parsing/stringifying utilities
- Date formatting utilities
- URL validation utilities

**External Dependencies**:
- Browser File API support
- Image rendering capabilities
- PDF viewing capabilities (for CV preview, may require external library)

### 10.2 Assumptions

**API Assumptions**:
- Public profile API endpoint will be implemented as `/api/UserProfile/Get/{userCode}` or similar
- API returns consistent error response format
- API supports CORS for authenticated requests
- Avatar upload returns updated UserProfileDto with new avatarUrl
- CV files are stored and accessible via download endpoint
- Base64 encoding is handled by backend for CV storage
- Friendship status can be determined via existing endpoints
- Gender enum values are: 0 = Unknown/Not Specified, 1 = Male, 2 = Female (or similar standard mapping)

**Data Assumptions**:
- UserProfileDto fields match API specification exactly
- JSON fields (skills, experience, education, personalProjects, savedJobs) can be null or empty strings
- CV files stored as base64 strings in UserCvDetailDto.fileCv
- CV metadata (name, default status) can be updated separately from file
- User can have multiple CVs
- At least one CV should exist (or system handles zero CVs gracefully)

**User Behavior Assumptions**:
- Users understand how to use file upload dialogs
- Users have basic understanding of their profile information structure
- Users will provide valid information when editing profile
- Users expect immediate feedback on actions

**Technical Assumptions**:
- Modern browsers with JavaScript enabled
- Sufficient network bandwidth for file uploads
- Client-side validation is sufficient for UX (backend also validates)
- Mobile devices support file upload via input elements

---