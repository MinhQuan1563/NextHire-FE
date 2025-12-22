# User Profile and CV Feature - Task Breakdown & Implementation Status

**Project:** NextHire User Profile and CV Management  
**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** 🔄 In Progress

---

## Overview

This document provides a comprehensive breakdown of all tasks and subtasks for the User Profile and CV Feature, with implementation status tracked using checkboxes.

**Legend:**
- [x] = Implemented and tested
- [ ] = Not yet implemented
- [⚠️] = Partially implemented or needs improvement

---

## Table of Contents

2. [Design & Architecture](#2-design--architecture)
3. [My Profile Page Implementation](#3-my-profile-page-implementation)
4. [Other User Profile Page Implementation](#4-other-user-profile-page-implementation)
5. [Edit Profile Page Implementation](#5-edit-profile-page-implementation)
6. [User CV Page Implementation](#6-user-cv-page-implementation)
7. [JSON Data Structure Handling](#7-json-data-structure-handling)
8. [Error Handling & Edge Cases](#8-error-handling--edge-cases)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Testing & QA](#10-testing--qa)
11. [Deployment & Release](#11-deployment--release)


## 2. Design & Architecture

### 2.1 Project Structure
- [x] 2.1.1 Create pages/user-profile directory structure
- [x] 2.1.2 Create my-profile component
- [x] 2.1.3 Create other-user-profile component
- [x] 2.1.4 Create edit-profile component
- [x] 2.1.5 Create user-cv component
- [x] 2.1.6 Create shared profile components directory

### 2.2 Data Models
- [x] 2.2.1 Define UserProfileDto interface
- [x] 2.2.2 Define UserCvDto interface
- [x] 2.2.3 Define UserCvDetailDto interface
- [x] 2.2.4 Define Skills JSON structure interface
- [x] 2.2.5 Define Experience JSON structure interface
- [x] 2.2.6 Define Education JSON structure interface
- [x] 2.2.7 Define Personal Projects JSON structure interface
- [x] 2.2.8 Define Saved Jobs JSON structure interface
- [x] 2.2.9 Define FriendshipStatus enum/type
- [x] 2.2.10 Define Gender enum/type

### 2.3 Service Layer
- [x] 2.3.1 Create UserProfileService
  - [x] 2.3.1.1 Implement getCurrentUserProfile() method
  - [x] 2.3.1.2 Implement getUserProfileByCode() method
  - [x] 2.3.1.3 Implement updateProfile() method
  - [x] 2.3.1.4 Implement uploadAvatar() method
- [x] 2.3.2 Create UserCvService
  - [x] 2.3.2.1 Implement getCvsByUser() method
  - [x] 2.3.2.2 Implement uploadCv() method
  - [x] 2.3.2.3 Implement updateCv() method
  - [x] 2.3.2.4 Implement deleteCv() method
  - [x] 2.3.2.5 Implement setDefaultCv() method
  - [x] 2.3.2.6 Implement downloadCv() method
- [x] 2.3.3 Create FriendshipService
  - [x] 2.3.3.1 Implement getFriendshipStatus() method
  - [x] 2.3.3.2 Implement sendFriendRequest() method
  - [x] 2.3.3.3 Implement acceptFriendRequest() method
  - [x] 2.3.3.4 Implement declineFriendRequest() method
  - [x] 2.3.3.5 Implement cancelFriendRequest() method
  - [x] 2.3.3.6 Implement unfriend() method
  - [x] 2.3.3.7 Implement blockUser() method

### 2.4 Routing Configuration
- [x] 2.4.1 Configure route for /profile (My Profile)
- [x] 2.4.2 Configure route for /profile/:userCode (Other User Profile)
- [x] 2.4.3 Configure route for /profile/edit (Edit Profile)
- [x] 2.4.4 Configure route for /profile/cvs (User CV Page)
- [x] 2.4.5 Add route guards if needed
- [x] 2.4.6 Configure lazy loading for profile feature

### 2.5 Shared Components
- [x] 2.5.1 Create ProfileAvatar component
- [x] 2.5.2 Create SkillsDisplay component
- [x] 2.5.3 Create ExperienceDisplay component
- [x] 2.5.4 Create EducationDisplay component
- [x] 2.5.5 Create PersonalProjectsDisplay component
- [x] 2.5.6 Create SavedJobsDisplay component
- [x] 2.5.7 Create JSONFieldEditor component (reusable for structured inputs)

---

## 3. My Profile Page Implementation

### 3.1 Component Setup
- [x] 3.1.1 Create my-profile.component.ts
- [x] 3.1.2 Create my-profile.component.html
- [x] 3.1.3 Create my-profile.component.scss
- [x] 3.1.4 Implement standalone component structure
- [x] 3.1.5 Set up dependency injection with inject()

### 3.2 Data Fetching
- [x] 3.2.1 Implement profile data fetching on init
- [x] 3.2.2 Handle loading state
- [x] 3.2.3 Handle error state
- [x] 3.2.4 Implement retry logic for failed requests
- [x] 3.2.5 Use signals for reactive state management

### 3.3 Profile Display (FR-MP-001 to FR-MP-015)
- [x] 3.3.1 Display User ID (UUID format) - FR-MP-001
- [x] 3.3.2 Display User Code (nullable) - FR-MP-002
- [x] 3.3.3 Display Full Name (nullable) - FR-MP-003
- [x] 3.3.4 Display Date of Birth (date-time format, nullable) - FR-MP-004
- [x] 3.3.5 Display Gender (human-readable enum value) - FR-MP-005
- [x] 3.3.6 Display Avatar Image (with placeholder fallback) - FR-MP-006
- [x] 3.3.7 Parse and display Skills JSON - FR-MP-007
- [x] 3.3.8 Parse and display Experience JSON - FR-MP-008
- [x] 3.3.9 Parse and display Education JSON - FR-MP-009
- [x] 3.3.10 Parse and display Personal Projects JSON - FR-MP-010
- [x] 3.3.11 Display Portfolio URL (clickable link if provided) - FR-MP-011
- [x] 3.3.12 Parse and display Saved Jobs JSON - FR-MP-012
- [x] 3.3.13 Add "Edit Profile" action button/link - FR-MP-013
- [x] 3.3.14 Implement loading state UI - FR-MP-014
- [x] 3.3.15 Implement error message display - FR-MP-015

### 3.4 UI Layout & Styling
- [x] 3.4.1 Design profile header section (avatar, name, basic info)
- [x] 3.4.2 Design skills section layout
- [x] 3.4.3 Design experience section layout
- [x] 3.4.4 Design education section layout
- [x] 3.4.5 Design personal projects section layout
- [x] 3.4.6 Design saved jobs section layout
- [x] 3.4.7 Implement responsive design (mobile, tablet, desktop)
- [x] 3.4.8 Apply TailwindCSS styling
- [x] 3.4.9 Use PrimeNG components where appropriate
- [x] 3.4.10 Handle empty/null data gracefully

### 3.5 Navigation
- [x] 3.5.1 Implement navigation to Edit Profile page
- [x] 3.5.2 Implement navigation to CV Page
- [x] 3.5.3 Add breadcrumb navigation if needed

---

## 4. Other User Profile Page Implementation

### 4.1 Component Setup
- [ ] 4.1.1 Create other-user-profile.component.ts
- [ ] 4.1.2 Create other-user-profile.component.html
- [ ] 4.1.3 Create other-user-profile.component.scss
- [ ] 4.1.4 Implement standalone component structure
- [ ] 4.1.5 Set up route parameter handling (userCode)

### 4.2 Data Fetching
- [ ] 4.2.1 Implement public profile data fetching (FR-OP-001)
- [ ] 4.2.2 Implement friendship status fetching (FR-OP-003)
- [ ] 4.2.3 Handle loading states (FR-OP-013, FR-OP-014)
- [ ] 4.2.4 Handle error states (FR-OP-010, FR-OP-011, FR-OP-012)
- [ ] 4.2.5 Handle profile not found scenario (FR-OP-010)
- [ ] 4.2.6 Handle restricted access scenario (FR-OP-011)

### 4.3 Profile Display (FR-OP-002, FR-OP-017 to FR-OP-020)
- [ ] 4.3.1 Display public profile fields (FR-OP-002)
- [ ] 4.3.2 Parse and display JSON fields (FR-OP-017)
- [ ] 4.3.3 Display portfolio URL as clickable link (FR-OP-018)
- [ ] 4.3.4 Handle avatar display with fallback (FR-OP-019)
- [ ] 4.3.5 Ensure accessibility via direct URL with userCode (FR-OP-020)

### 4.4 Friendship Status & Actions (FR-OP-004 to FR-OP-009, FR-OP-015, FR-OP-016)
- [ ] 4.4.1 Display friendship status indicator (FR-OP-003)
- [ ] 4.4.2 Show "Send Friend Request" button (not friends) - FR-OP-004
- [ ] 4.4.3 Show "Cancel Friend Request" button (pending sent) - FR-OP-005
- [ ] 4.4.4 Show "Accept/Decline" options (pending received) - FR-OP-006
- [ ] 4.4.5 Show "Unfriend" option (friends) - FR-OP-007
- [ ] 4.4.6 Show "Block User" option - FR-OP-008
- [ ] 4.4.7 Show "Message" button placeholder (friends) - FR-OP-009
- [ ] 4.4.8 Implement optimistic UI updates (FR-OP-015)
- [ ] 4.4.9 Handle friendship action errors and revert UI (FR-OP-016)
- [ ] 4.4.10 Prevent self-friend request (EC-FR-002)
- [ ] 4.4.11 Handle duplicate friend requests (EC-FR-003, EC-FR-004)

### 4.5 UI Layout & Styling
- [ ] 4.5.1 Reuse profile display components from My Profile
- [ ] 4.5.2 Design friendship action buttons section
- [ ] 4.5.3 Implement responsive design
- [ ] 4.5.4 Apply TailwindCSS styling
- [ ] 4.5.5 Handle different friendship status visual states

---

## 5. Edit Profile Page Implementation

### 5.1 Component Setup
- [x] 5.1.1 Create edit-profile.component.ts
- [x] 5.1.2 Create edit-profile.component.html
- [x] 5.1.3 Create edit-profile.component.scss
- [x] 5.1.4 Implement standalone component structure
- [x] 5.1.5 Set up reactive form with FormBuilder

### 5.2 Form Initialization (FR-EP-001)
- [x] 5.2.1 Load current profile data on init
- [x] 5.2.2 Pre-populate form with current data
- [x] 5.2.3 Parse JSON fields and populate structured inputs
- [x] 5.2.4 Handle null/empty values gracefully
- [x] 5.2.5 Mark read-only fields (id, userCode) - FR-EP-035

### 5.3 Basic Field Inputs (FR-EP-002 to FR-EP-004, FR-EP-011)
- [x] 5.3.1 Implement Full Name text input (nullable, validation) - FR-EP-002
- [x] 5.3.2 Implement Date of Birth date picker (nullable) - FR-EP-003
- [x] 5.3.3 Implement Gender dropdown/radio (integer enum) - FR-EP-004
- [x] 5.3.4 Implement Portfolio URL input (URL validation) - FR-EP-011
- [x] 5.3.5 Add field labels and help text - FR-EP-030
- [x] 5.3.6 Mark required fields clearly - FR-EP-031
- [x] 5.3.7 Validate date of birth not in future - FR-EP-033
- [x] 5.3.8 Validate portfolio URL format - FR-EP-034

### 5.4 Avatar Upload (FR-EP-005, FR-EP-006, FR-EP-018, FR-EP-023 to FR-EP-028)
- [x] 5.4.1 Display current avatar with change option - FR-EP-006
- [x] 5.4.2 Implement file input for avatar upload - FR-EP-005
- [x] 5.4.3 Validate image file type (JPEG, PNG, GIF, WebP) - FR-EP-026
- [x] 5.4.4 Validate image file size (max 5MB) - FR-EP-025
- [x] 5.4.5 Show image preview before upload - FR-EP-027
- [x] 5.4.6 Handle avatar upload separately via API - FR-EP-023
- [x] 5.4.7 Update avatar URL after successful upload - FR-EP-024
- [x] 5.4.8 Handle loading state during upload - FR-EP-018
- [x] 5.4.9 Handle avatar upload errors separately - FR-EP-028

### 5.5 Structured JSON Field Inputs (FR-EP-007 to FR-EP-010, FR-EP-012, FR-EP-020)
- [x] 5.5.1 Create Skills structured input component - FR-EP-007
  - [x] 5.5.1.1 Add/remove skill items
  - [x] 5.5.1.2 Input skill name (max 100 chars)
  - [x] 5.5.1.3 Select skill level (beginner/intermediate/advanced/expert)
  - [x] 5.5.1.4 Input years of experience (non-negative number)
  - [x] 5.5.1.5 Integrate skills editor in edit-profile page
  - [x] 5.5.1.6 Handle skills value changes and form updates
- [x] 5.5.2 Create Experience structured input component - FR-EP-008
  - [x] 5.5.2.1 Add/remove experience items
  - [x] 5.5.2.2 Input company (max 200 chars)
  - [x] 5.5.2.3 Input position (max 200 chars)
  - [x] 5.5.2.4 Date picker for start date
  - [x] 5.5.2.5 Date picker for end date (nullable if current)
  - [x] 5.5.2.6 Checkbox for isCurrent
  - [x] 5.5.2.7 Textarea for description (max 2000 chars)
  - [x] 5.5.2.8 Array input for achievements (max 500 chars each)
  - [x] 5.5.2.9 Create experience editor configuration in edit-profile
  - [x] 5.5.2.10 Add experience section to edit-profile template
  - [x] 5.5.2.11 Implement getExperienceJsonString() method
  - [x] 5.5.2.12 Implement onExperienceValueChange() handler
- [x] 5.5.3 Create Education structured input component - FR-EP-009
  - [x] 5.5.3.1 Add/remove education items
  - [x] 5.5.3.2 Input institution (max 200 chars)
  - [x] 5.5.3.3 Input degree (max 200 chars)
  - [x] 5.5.3.4 Input field of study (max 200 chars, optional)
  - [x] 5.5.3.5 Date picker for start date
  - [x] 5.5.3.6 Date picker for end date (nullable if current)
  - [x] 5.5.3.7 Checkbox for isCurrent
  - [x] 5.5.3.8 Input grade (max 50 chars, optional)
  - [x] 5.5.3.9 Textarea for description (max 1000 chars, optional)
  - [x] 5.5.3.10 Create education editor configuration in edit-profile
  - [x] 5.5.3.11 Add education section to edit-profile template
  - [x] 5.5.3.12 Implement getEducationJsonString() method
  - [x] 5.5.3.13 Implement onEducationValueChange() handler
- [x] 5.5.4 Create Personal Projects structured input component - FR-EP-010
  - [x] 5.5.4.1 Add/remove project items
  - [x] 5.5.4.2 Input project name (max 200 chars)
  - [x] 5.5.4.3 Textarea for description (max 2000 chars, optional)
  - [x] 5.5.4.4 Array input for technologies (max 100 chars each)
  - [x] 5.5.4.5 Date picker for start date
  - [x] 5.5.4.6 Date picker for end date (nullable if current)
  - [x] 5.5.4.7 Checkbox for isCurrent
  - [x] 5.5.4.8 Input project URL (URL validation, optional)
  - [x] 5.5.4.9 Input GitHub URL (URL validation, optional)
  - [x] 5.5.4.10 Create personal projects editor configuration in edit-profile
  - [x] 5.5.4.11 Add personal projects section to edit-profile template
  - [x] 5.5.4.12 Implement getPersonalProjectsJsonString() method
  - [x] 5.5.4.13 Implement onPersonalProjectsValueChange() handler
- [x] 5.5.5 Create Saved Jobs structured input component - FR-EP-012
  - [x] 5.5.5.1 Display saved jobs (read-only or editable based on requirements)
  - [x] 5.5.5.2 Input jobCode
  - [x] 5.5.5.3 Display savedDate
- [x] 5.5.6 Validate JSON structure before serialization - FR-EP-020
- [x] 5.5.7 Serialize structured data to JSON strings - FR-EP-014

### 5.6 Form Validation (FR-EP-013, FR-EP-033, FR-EP-034)
- [x] 5.6.1 Implement required field validation
- [x] 5.6.2 Implement format validations (dates, URLs)
- [x] 5.6.3 Implement JSON structure validations
- [x] 5.6.4 Implement date range validations (end date after start date)
- [x] 5.6.5 Implement future date prevention for date of birth
- [x] 5.6.6 Display validation error messages
- [x] 5.6.7 Prevent form submission if invalid

### 5.7 Form Submission (FR-EP-015 to FR-EP-019, FR-EP-032)
- [x] 5.7.1 Handle form submission
- [x] 5.7.2 Serialize form data to UserProfileDto format
- [x] 5.7.3 Submit profile update via PUT API - FR-EP-015
- [x] 5.7.4 Handle submission errors with user-friendly messages - FR-EP-015
- [x] 5.7.5 Show success message after update - FR-EP-016
- [x] 5.7.6 Update local state/UI immediately - FR-EP-017
- [x] 5.7.7 Handle loading state during update - FR-EP-019
- [x] 5.7.8 Handle concurrent update conflicts - FR-EP-032

### 5.8 Form Navigation (FR-EP-021, FR-EP-022)
- [x] 5.8.1 Implement "Cancel" option - FR-EP-021
- [x] 5.8.2 Confirm before discarding unsaved changes - FR-EP-022
- [x] 5.8.3 Track form dirty state
- [x] 5.8.4 Navigate back on cancel

### 5.9 Accessibility (FR-EP-029)
- [X] 5.9.1 Ensure keyboard navigation support
- [X] 5.9.2 Add screen reader support with ARIA labels
- [X] 5.9.3 Associate form labels with inputs
- [X] 5.9.4 Make error messages accessible

### 5.10 UI Layout & Styling
- [X] 5.10.1 Design form layout with sections
- [X] 5.10.2 Implement responsive form design
- [X] 5.10.3 Apply TailwindCSS styling
- [X] 5.10.4 Use PrimeNG form components
- [X] 5.10.5 Style structured input components
- [X] 5.10.6 Add form action buttons (Save, Cancel)

---

## 6. User CV Page Implementation

### 6.1 Component Setup
- [ ] 6.1.1 Create user-cv.component.ts
- [ ] 6.1.2 Create user-cv.component.html
- [ ] 6.1.3 Create user-cv.component.scss
- [ ] 6.1.4 Implement standalone component structure
- [ ] 6.1.5 Set up signals for reactive state

### 6.2 CV List Display (FR-CV-001 to FR-CV-003)
- [ ] 6.2.1 Fetch CV list from API on init - FR-CV-001
- [ ] 6.2.2 Display CV ID, Name, Created Date, Default Status, Version - FR-CV-002
- [ ] 6.2.3 Highlight default CV clearly - FR-CV-003
- [ ] 6.2.4 Handle empty state (no CVs) - EC-CV-001
- [ ] 6.2.5 Implement loading state
- [ ] 6.2.6 Implement error state

### 6.3 Upload New CV (FR-CV-004 to FR-CV-015)
- [ ] 6.3.1 Add "Upload New CV" button - FR-CV-004
- [ ] 6.3.2 Open upload dialog/form - FR-CV-005
- [ ] 6.3.3 Implement file selection (PDF, DOCX only) - FR-CV-006
- [ ] 6.3.4 Validate file type before upload - FR-CV-007
- [ ] 6.3.5 Validate file size before upload (max 10MB) - FR-CV-008
- [ ] 6.3.6 Require CV Name input - FR-CV-009
- [ ] 6.3.7 Add "Set as Default" checkbox option - FR-CV-010
- [ ] 6.3.8 Show file name and size after selection - FR-CV-011
- [ ] 6.3.9 Handle multipart/form-data upload - FR-CV-012
- [ ] 6.3.10 Display upload progress indicator - FR-CV-013
- [ ] 6.3.11 Handle upload success and refresh list - FR-CV-014
- [ ] 6.3.12 Handle upload errors with messages - FR-CV-015
- [ ] 6.3.13 Prevent invalid file type upload - EC-CV-003
- [ ] 6.3.14 Prevent file size exceeding 10MB - EC-CV-002
- [ ] 6.3.15 Handle upload failures - EC-CV-004

### 6.4 Edit CV Metadata (FR-CV-016 to FR-CV-019)
- [ ] 6.4.1 Add "Edit" action for each CV - FR-CV-016
- [ ] 6.4.2 Open edit dialog with current CV name - FR-CV-017
- [ ] 6.4.3 Allow updating CV Name only - FR-CV-018
- [ ] 6.4.4 Save updates via PUT API - FR-CV-019
- [ ] 6.4.5 Refresh CV list after update

### 6.5 Delete CV (FR-CV-020 to FR-CV-024)
- [ ] 6.5.1 Add "Delete" action for each CV - FR-CV-020
- [ ] 6.5.2 Show confirmation dialog before delete - FR-CV-021
- [ ] 6.5.3 Prevent deletion of only CV if it's default - FR-CV-022
- [ ] 6.5.4 Handle deletion via DELETE API - FR-CV-023
- [ ] 6.5.5 Refresh CV list after deletion - FR-CV-024
- [ ] 6.5.6 Handle deletion of only CV - EC-CV-005
- [ ] 6.5.7 Handle deletion of default CV (if only one) - EC-CV-006

### 6.6 Set Default CV (FR-CV-025 to FR-CV-027)
- [ ] 6.6.1 Add "Set as Default" action for non-default CVs - FR-CV-025
- [ ] 6.6.2 Handle set default via POST API - FR-CV-026
- [ ] 6.6.3 Update default status in UI immediately - FR-CV-027
- [ ] 6.6.4 Handle set default for non-existent CV - EC-CV-010

### 6.7 Preview & Download CV (FR-CV-028 to FR-CV-030)
- [ ] 6.7.1 Add "Preview" action - FR-CV-028
- [ ] 6.7.2 Display CV preview (thumbnail/embedded viewer)
- [ ] 6.7.3 Add "Download" action - FR-CV-029
- [ ] 6.7.4 Handle download via GET API - FR-CV-030
- [ ] 6.7.5 Handle corrupted/unreadable CV files - EC-CV-007
- [ ] 6.7.6 Handle download failures - EC-CV-009

### 6.8 Concurrent Operations (EC-CV-011)
- [ ] 6.8.1 Disable other actions during active operation
- [ ] 6.8.2 Queue operations if needed
- [ ] 6.8.3 Handle multiple CVs with same name - EC-CV-008

### 6.9 UI Layout & Styling
- [ ] 6.9.1 Design CV list layout (table or card view)
- [ ] 6.9.2 Style CV items with metadata
- [ ] 6.9.3 Design upload dialog
- [ ] 6.9.4 Design edit dialog
- [ ] 6.9.5 Design confirmation dialogs
- [ ] 6.9.6 Implement responsive design
- [ ] 6.9.7 Apply TailwindCSS styling
- [ ] 6.9.8 Use PrimeNG components (Dialog, FileUpload, etc.)

## Dependencies & Requirements

### Required Libraries
- [ ] Angular 17+
- [ ] PrimeNG (UI components)
- [ ] TailwindCSS (styling)
- [ ] TypeScript 5.0+
- [ ] RxJS (for observables if needed)
---

## Notes

- All tasks should be traceable to PRD requirements
- Tasks are organized by feature and functional area
- Subtasks represent concrete execution steps
- Default all checkboxes to unchecked [ ]
- Update checkboxes as tasks are completed
- This document should be updated regularly to reflect progress

---

End of task breakdown.

