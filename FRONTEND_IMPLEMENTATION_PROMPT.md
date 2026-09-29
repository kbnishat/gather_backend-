# Frontend Implementation Prompt

Build a responsive university student portal named **Verisity University** using the backend API documented in `API_DOCUMENTATION.md`.

## Product scope

Create a real working frontend, not a landing page. The application must support:

- Student registration, login, logout, and automatic access-token refresh.
- Protected student dashboard with current profile information.
- Course discovery with search, pagination, department filtering, prerequisite eligibility, and section details.
- Course enrollment and a page showing the logged-in student's enrolled courses.
- Profile editing with optional profile-image upload.
- Admin views for managing students, academic semesters, departments, faculties, courses, offered courses, semester registration, and enrollments.
- Faculty/admin role-aware navigation. Hide actions the current role cannot perform.
- Loading, empty, validation, unauthorized, and server-error states for every data workflow.

## Required pages

1. Login
2. Student registration
3. Student dashboard
4. My profile
5. Available courses
6. My enrolled courses
7. Admin dashboard
8. Students management
9. Academic setup management
10. Courses and offered courses management

## API behavior

Use `/api/v1` as the API base URL. Send `Authorization: Bearer <accessToken>` for protected requests. Use `credentials: "include"` for login, refresh-token, and logout requests so the refresh cookie is stored and sent.

When an API request returns `401`, call `POST /auth/refresh-token` once, replace the access token, retry the original request, and redirect to login if refresh fails. Never store passwords or refresh tokens in local storage. Store the short-lived access token in memory where practical.

Use the exact request bodies and roles in `API_DOCUMENTATION.md`. Registration requires the complete nested student object and creates an active student. Course enrollment uses `POST /enrolled-course/create-enrolled-course` with `{ "offeredCourse": "..." }`. Semester registration statuses must be uppercase: `UPCOMING`, `ONGOING`, and `COMPLETED`. Preserve the backend field spelling `semseterRegistration` when creating offered courses.

## Visual direction

Use a calm academic product interface with a distinctive editorial touch: deep ink text, warm paper background, vivid teal primary actions, and coral highlights for important status changes. Use an expressive serif for page titles and a clean sans-serif for controls and tables. Keep dashboards dense and practical, with clear hierarchy rather than oversized marketing sections.

Use:

- Desktop sidebar navigation and a compact mobile navigation pattern.
- Tables for admin resource management.
- Filter bars with search input, select menus, and pagination controls.
- Status badges for active, pending, blocked, upcoming, ongoing, and completed states.
- Confirmation dialogs before destructive actions.
- Toast feedback after successful mutations.
- Accessible labels, keyboard navigation, visible focus states, and responsive layouts.

Do not expose implementation instructions as visible page copy. Use icons for familiar actions such as edit, delete, refresh, search, upload, and logout, with tooltips for unfamiliar icons.

## Core user flows

### Student flow

1. Register with personal, guardian, semester, and department information.
2. Log in with the generated student ID and password.
3. View the dashboard and profile.
4. Search available courses.
5. Open course details and enroll when eligible.
6. Review enrolled courses and marks.
7. Edit profile details or upload a profile image.
8. Log out.

### Admin flow

1. Log in with an admin account.
2. View dashboard counts and recent records.
3. Create and manage academic semesters, faculties, departments, and courses.
4. Create offered courses and assign faculty members.
5. Review students and activate, block, or delete accounts.
6. Review enrollments and update marks.

## Engineering requirements

- Use reusable API client functions and typed response models.
- Keep authentication state in one provider/store.
- Centralize error parsing so backend validation messages are displayed beside the correct fields.
- Debounce search inputs.
- Disable submit buttons while mutations are pending.
- Confirm destructive operations.
- Do not hardcode MongoDB IDs, credentials, API secrets, or tokens.
- Put the API base URL in an environment variable such as `VITE_API_BASE_URL`.
- Test login, registration validation, token refresh, course search, enrollment, profile update, and logout on desktop and mobile widths.
- Treat enrollment deletion as unavailable until the backend endpoint is repaired; do not claim success when the API returns.
