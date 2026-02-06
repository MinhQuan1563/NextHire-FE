# Admin Dashboard Base Layout - Product Requirements Document (PRD)

## 1. Overview

### Feature Summary
The Admin Dashboard Base Layout provides a foundational administrative interface for NextHire platform administrators. It establishes a consistent navigation structure and layout shell that hosts six core management pages: Admin Overview, Manage Users, Manage Companies, Manage CV Templates, Manage Games, and Error Logs Viewer.

### Problem Statement
Currently, there is no administrative interface for platform management. Administrators need a centralized, intuitive dashboard to manage users, companies, CV templates, games, and monitor system errors efficiently. Without this interface, administrative tasks cannot be performed effectively.

### Goals and Objectives
- Create a responsive, professional admin dashboard layout using PrimeNG Sakai theme
- Implement collapsible sidebar navigation for easy access to all admin pages
- Establish a consistent layout structure that can accommodate future admin features
- Ensure seamless integration with existing authentication system (role-based access)
- Provide breadcrumb navigation for improved user orientation
- Enable lazy-loaded routing for optimal performance

---

## 2. Success Metrics (KPIs)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Initial Load Time | < 2 seconds | Performance monitoring tools |
| Navigation Task Completion | < 3 clicks to any page | User flow analysis |
| Sidebar Toggle Response | < 100ms | Performance profiling |
| Mobile Responsiveness | 100% functional on tablets | Cross-device testing |
| Route Lazy Load Time | < 500ms per module | Angular DevTools |

---

## 3. User Personas

### Primary Persona: Super Administrator
- **Role:** Platform Administrator
- **Responsibilities:** 
  - Manage all users and companies
  - Oversee CV templates and game configurations
  - Monitor system errors and logs
- **Technical Proficiency:** High
- **Access Level:** Full administrative access (Admin role)
- **Goals:**
  - Quickly navigate between different management sections
  - Efficiently perform CRUD operations
  - Monitor platform health and user activities

---

## 4. User Stories / Use Cases

### US-1: Access Admin Dashboard
**As a** Super Administrator  
**I want to** access the admin dashboard after logging in with admin role  
**So that** I can manage the platform effectively

**Acceptance Criteria:**
- Admin users are redirected to `/admin` route after authentication
- Non-admin users cannot access admin routes
- Dashboard loads with sidebar navigation visible

---

### US-2: Navigate Between Admin Pages
**As a** Super Administrator  
**I want to** use sidebar navigation to switch between different admin pages  
**So that** I can quickly access different management functions

**Acceptance Criteria:**
- Sidebar displays all 6 admin page links
- Active page is visually highlighted in sidebar
- Navigation transitions are smooth (< 500ms)
- Breadcrumbs update based on current page

---

### US-3: Toggle Sidebar
**As a** Super Administrator  
**I want to** collapse/expand the sidebar  
**So that** I can maximize content viewing area when needed

**Acceptance Criteria:**
- Sidebar toggle button is clearly visible
- Sidebar state persists during session
- Content area adjusts responsively when sidebar toggles
- Toggle animation is smooth

---

### US-4: View Breadcrumb Navigation
**As a** Super Administrator  
**I want to** see breadcrumb navigation showing my current location  
**So that** I understand where I am in the admin dashboard hierarchy

**Acceptance Criteria:**
- Breadcrumbs display current page path
- Breadcrumbs are clickable for navigation
- Breadcrumbs update automatically on route change

---

### US-5: Responsive Admin Access
**As a** Super Administrator  
**I want to** access the admin dashboard on tablets  
**So that** I can manage the platform from different devices

**Acceptance Criteria:**
- Layout adapts to tablet screen sizes
- Sidebar converts to overlay/drawer on smaller screens
- All navigation elements remain accessible

---

## 5. Functional Requirements

### FR-1: Layout Structure
- **FR-1.1:** Implement main admin layout component with sidebar and content area
- **FR-1.2:** Use PrimeNG Sakai theme for consistent styling
- **FR-1.3:** Sidebar must be collapsible with toggle button
- **FR-1.4:** Content area must adjust width based on sidebar state
- **FR-1.5:** Layout must be responsive for desktop and tablet devices

### FR-2: Sidebar Navigation
- **FR-2.1:** Display navigation menu with 6 items:
  - Admin Overview (Dashboard icon)
  - Manage Users (Users icon)
  - Manage Companies (Building icon)
  - Manage CV Templates (Document icon)
  - Manage Games (Game icon)
  - Error Logs Viewer (Bug/Alert icon)
- **FR-2.2:** Highlight active menu item based on current route
- **FR-2.3:** Support collapsible/expandable sidebar state
- **FR-2.4:** Persist sidebar state in session storage
- **FR-2.5:** Show icons with text labels when expanded, icons only when collapsed

### FR-3: Breadcrumb Navigation
- **FR-3.1:** Display breadcrumb trail showing current page hierarchy
- **FR-3.2:** Format: "Admin Dashboard > [Current Page Name]"
- **FR-3.3:** Breadcrumb items must be clickable for navigation
- **FR-3.4:** Update breadcrumbs automatically on route change

### FR-4: Routing Configuration
- **FR-4.1:** Create separate routing file: `admin.routes.ts`
- **FR-4.2:** Implement lazy-loaded admin module
- **FR-4.3:** Define routes for all 6 admin pages:
  - `/admin` → Admin Overview
  - `/admin/users` → Manage Users
  - `/admin/companies` → Manage Companies
  - `/admin/cv-templates` → Manage CV Templates
  - `/admin/games` → Manage Games
  - `/admin/error-logs` → Error Logs Viewer
- **FR-4.4:** Apply auth guard to all admin routes (role-based)
- **FR-4.5:** Redirect unauthorized users to login/home page

### FR-5: Authentication & Authorization
- **FR-5.1:** Integrate with existing role-based authentication system
- **FR-5.2:** Verify user has "Admin" role before allowing access
- **FR-5.3:** Implement route guard for admin routes
- **FR-5.4:** Handle unauthorized access gracefully with redirect

### FR-6: Common Features (Placeholder)
- **FR-6.1:** Prepare layout for global toast notification system
- **FR-6.2:** Reserve space for future common actions (export, bulk operations)
- **FR-6.3:** Design layout to accommodate search/filter components per page

---

## 6. Non-Functional Requirements

### NFR-1: Performance
- **NFR-1.1:** Initial admin dashboard load time < 2 seconds
- **NFR-1.2:** Lazy-loaded routes load within 500ms
- **NFR-1.3:** Sidebar toggle animation completes within 100ms
- **NFR-1.4:** Route transitions complete within 300ms

### NFR-2: Usability
- **NFR-2.1:** Navigation must be intuitive with clear visual hierarchy
- **NFR-2.2:** Active page must be clearly distinguishable
- **NFR-2.3:** Sidebar icons must be recognizable and consistent
- **NFR-2.4:** Layout must follow PrimeNG Sakai design patterns

### NFR-3: Responsiveness
- **NFR-3.1:** Support desktop resolutions (1920x1080 and above)
- **NFR-3.2:** Support tablet resolutions (768px - 1024px)
- **NFR-3.3:** Sidebar converts to overlay on screens < 1024px
- **NFR-3.4:** All interactive elements must be touch-friendly on tablets

### NFR-4: Maintainability
- **NFR-4.1:** Use standalone components architecture
- **NFR-4.2:** Follow Angular 17 best practices
- **NFR-4.3:** Implement proper TypeScript typing (no `any`)
- **NFR-4.4:** Use Angular Signals for reactive state management
- **NFR-4.5:** Use `inject()` for dependency injection

### NFR-5: Scalability
- **NFR-5.1:** Layout structure must support adding new admin pages easily
- **NFR-5.2:** Sidebar menu must be configurable via data structure
- **NFR-5.3:** Routing configuration must be extensible

### NFR-6: Accessibility
- **NFR-6.1:** Sidebar navigation must be keyboard accessible
- **NFR-6.2:** Proper ARIA labels for navigation elements
- **NFR-6.3:** Focus management for sidebar toggle

### NFR-7: Security
- **NFR-7.1:** All admin routes protected by authentication guard
- **NFR-7.2:** Role verification on every route access
- **NFR-7.3:** No sensitive data exposed in route parameters

---

## 7. Out of Scope

The following items are explicitly **NOT** included in this base layout feature:

- **Detailed page implementations:** CRUD operations, forms, tables, and business logic for each admin page
- **Data fetching logic:** API integration for user data, company data, CV templates, games, or error logs
- **Search/filter functionality:** Specific search and filter implementations per page
- **Export functionality:** Data export mechanisms (CSV, Excel, PDF)
- **Bulk operations:** Multi-select and bulk action implementations
- **Toast notification system:** Global notification service implementation
- **User profile dropdown:** Admin user profile menu in header
- **Session timeout handling:** Automatic logout on inactivity
- **Audit logging:** Tracking admin actions and changes
- **Mobile phone support:** Responsive design for screens < 768px
- **Dark mode toggle:** Theme switching functionality
- **Multi-language support:** i18n for admin dashboard

---

## 8. Dependencies & Assumptions

### Dependencies
- **Angular 17:** Framework foundation
- **PrimeNG Sakai:** UI component library and theme
- **TailwindCSS:** Utility-first CSS framework
- **Angular Router:** For routing and navigation
- **Existing Auth System:** Role-based authentication with "Admin" role
- **Auth Guard Service:** To protect admin routes

### Assumptions
- **Single Admin Role:** Only one admin role exists (no role hierarchy)
- **Existing Authentication:** User authentication system is already implemented
- **Role Assignment:** Admin role is assigned through existing user management
- **Session Management:** Browser session storage is available
- **Modern Browsers:** Target browsers support ES2020+ features
- **Network Connectivity:** Stable internet connection for lazy-loaded modules
- **PrimeNG License:** Sakai theme is properly licensed and available

### Technical Assumptions
- **Standalone Components:** All components will use standalone architecture
- **Signals for State:** Angular Signals will be used for reactive state
- **TypeScript 5:** Full type safety with strict mode enabled
- **Lazy Loading:** Angular's lazy loading mechanism is functional

---

## 9. Acceptance Criteria

### AC-1: Layout Implementation
- [ ] Admin layout component created with sidebar and content area
- [ ] PrimeNG Sakai theme applied and styled correctly
- [ ] Layout is responsive for desktop (1920x1080+) and tablet (768px-1024px)
- [ ] Sidebar toggle functionality works smoothly

### AC-2: Navigation
- [ ] Sidebar displays all 6 admin page menu items with icons
- [ ] Active menu item is visually highlighted
- [ ] Clicking menu items navigates to correct routes
- [ ] Sidebar state persists during session
- [ ] Breadcrumb navigation displays and updates correctly

### AC-3: Routing
- [ ] Separate `admin.routes.ts` file created
- [ ] All 6 admin routes defined and functional
- [ ] Admin routes are lazy-loaded
- [ ] Auth guard applied to all admin routes
- [ ] Unauthorized users redirected appropriately

### AC-4: Authentication & Authorization
- [ ] Only users with "Admin" role can access admin routes
- [ ] Non-admin users are redirected to appropriate page
- [ ] Auth guard prevents unauthorized route access
- [ ] No console errors on unauthorized access attempts

### AC-5: Performance
- [ ] Initial admin dashboard loads in < 2 seconds
- [ ] Lazy-loaded routes load in < 500ms
- [ ] Sidebar toggle animation completes in < 100ms
- [ ] No memory leaks detected during navigation

### AC-6: Code Quality
- [ ] All components use standalone architecture
- [ ] TypeScript strict mode enabled with no `any` types
- [ ] Angular Signals used for reactive state
- [ ] `inject()` used instead of constructor injection
- [ ] Code follows Angular style guide and project conventions

### AC-7: Visual & UX
- [ ] Layout matches PrimeNG Sakai design patterns
- [ ] Sidebar icons are clear and recognizable
- [ ] Transitions and animations are smooth
- [ ] No layout shifts or flickering during navigation
- [ ] Breadcrumbs are readable and properly formatted

### AC-8: Testing
- [ ] Unit tests for layout component
- [ ] Unit tests for auth guard
- [ ] Route configuration tested
- [ ] Sidebar toggle functionality tested
- [ ] Responsive behavior verified on multiple screen sizes

---

## 10. Technical Implementation Notes

### File Structure
```
src/app/pages/admin/
├── layout/
│   ├── admin-layout.component.ts
│   ├── admin-layout.component.html
│   └── admin-layout.component.scss
├── overview/
│   └── admin-overview.component.ts (placeholder)
├── users/
│   └── manage-users.component.ts (placeholder)
├── companies/
│   └── manage-companies.component.ts (placeholder)
├── cv-templates/
│   └── manage-cv-templates.component.ts (placeholder)
├── games/
│   └── manage-games.component.ts (placeholder)
├── error-logs/
│   └── error-logs-viewer.component.ts (placeholder)
└── admin.routes.ts

src/app/guards/
└── admin.guard.ts
```

### Key Components
1. **AdminLayoutComponent:** Main layout shell with sidebar and router outlet
2. **AdminGuard:** Route guard for role-based access control
3. **Admin Routes:** Lazy-loaded routing configuration

### State Management
- Sidebar collapsed state: Angular Signal
- Active route: Angular Router state
- Breadcrumb data: Derived from route configuration

---

## 11. Future Enhancements (Post-MVP)

- User profile dropdown in header
- Global search across admin pages
- Dashboard widgets and statistics
- Real-time notifications for admin events
- Activity audit log viewer
- Dark mode support
- Advanced filtering and sorting
- Customizable dashboard layout
- Export functionality across all pages
- Bulk operations support

---

**Document Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Ready for Implementation  
**Approved By:** [Pending]
