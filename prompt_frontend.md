# Frontend Redesign Prompt for EduInsight AI

You are redesigning only the frontend of an existing education management platform called EduInsight AI.

Do not rewrite, replace, or modify the backend. Do not invent a new API. The existing FastAPI backend, routes, request bodies, response shapes, authentication behavior, file uploads, and role permissions are the source of truth.

## Product Context

EduInsight AI is a learning management platform for schools and learning communities. It has three authenticated roles:

- Administrator: manages students, teachers, classes, assignments, reports, and attendance reports.
- Teacher: manages assigned classes, courses, exercises, learning materials, grades, attendance, submissions, and announcements.
- Student: views courses, teacher materials, exercises, progress, grades, submissions, attendance-related information, and notifications.

The current backend architecture is:

```text
Next.js frontend
  -> FastAPI routes and Pydantic schemas
  -> controllers
  -> services
  -> repositories
  -> SQLite database
```

The backend uses JWT authentication. The frontend stores the access token and role in local storage and uses the Next.js `/api-proxy` rewrite to forward browser requests to the configured backend API.

## Existing Frontend Stack

Use the existing stack and dependencies:

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Lucide React icons
- Recharts for data visualization
- jsPDF for admin report downloads

Do not add a second UI framework unless there is a strong technical reason. Reuse the existing API client in `lib/api.ts` and existing backend integration helpers.

## Main Goal

Create a polished, modern, calm, and highly usable frontend redesign that feels like a focused education operations product rather than a generic dashboard.

The redesign should improve:

- Information hierarchy
- Navigation clarity
- Mobile responsiveness
- Empty, loading, and error states
- Form usability
- Accessibility
- Visual consistency between admin, teacher, and student workspaces
- Safe presentation of user data

Keep all existing backend functionality available.

## Important Backend and Security Rules

- Never expose passwords, password hashes, JWT tokens, or raw authorization headers in the UI.
- Password inputs must be masked by default.
- Error messages shown to users must be friendly and must not expose stack traces, SQL statements, internal file paths, or secrets.
- The `/setup` flow creates the first administrator account only. It must not be presented as a normal public registration flow.
- Students and teachers cannot create their own accounts. They are created and managed by the administrator.
- Do not add a public student registration page.
- Do not add a public teacher registration page.
- Do not add a public second-admin registration flow.
- Existing data is shared within the configured school database. Do not imply that each admin has a separate private school unless the backend is changed separately.
- Always respect the authenticated role returned by the backend.
- Redirect unauthenticated users to `/login`.
- Redirect authenticated users to the workspace matching their role.
- If a request returns HTTP 401, clear the local session and return the user to `/login`.

## Required Routes

Preserve these routes:

- `/login`: sign-in page
- `/setup`: first-admin bootstrap page
- `/admin`: administrator workspace
- `/teacher`: teacher workspace
- `/student`: student workspace

The root route may redirect based on the current session, but do not remove the role-specific routes.

## Login and First-Admin Setup

Design a professional authentication experience.

The login page should include:

- EduInsight AI brand mark and product name
- Email field
- Password field with an accessible show/hide control
- Sign-in button with loading state
- Clear inline validation
- Friendly authentication error state
- A small, clear note explaining that students and teachers cannot create accounts themselves
- A restrained link to first-admin setup only when appropriate
- No fake demo credentials
- No visible password values
- No misleading "no account required" message

The setup page should clearly say:

- This creates the first administrator account only.
- Students and teachers are added later by the administrator.
- The setup endpoint may reject the request if an administrator already exists.

The setup form should include:

- Full name
- Email
- Password
- Password confirmation if supported by the existing frontend flow
- Client-side validation
- Loading state
- Success state that directs the user to sign in
- Friendly backend error state
- Correct form reset behavior after a successful request

## Shared Application Shell

Create one reusable shell for authenticated workspaces:

- Desktop sidebar with clear active navigation
- Compact mobile navigation or drawer
- Top bar with page title, current user name, role label, notifications, and logout
- Consistent content width and spacing
- Breadcrumbs or contextual page labels where useful
- Responsive behavior for small screens
- Keyboard-accessible navigation
- Visible focus states

Do not make every item look like a floating card. Use full-width sections, restrained borders, and cards only for repeated data or genuinely framed tools.

## Administrator Workspace

The administrator should have an operational overview focused on people and classes.

Required capabilities:

- View total students
- View teaching staff
- View active classes
- Browse students, teachers, and classes using tabs or clear segmented navigation
- Search and filter records
- Add students
- Update student information
- Delete students with confirmation
- View student reports
- Add teachers
- Update teachers
- Delete teachers with confirmation
- Assign teachers to classes
- Create and update classes
- Assign students to classes
- View attendance reports
- Download student reports as PDF where the existing API supports it

Design priorities:

- Make the primary action obvious but not oversized.
- Use tables or dense list views for administration data.
- Make email, class, level, and status easy to scan.
- Use confirmation dialogs for destructive actions.
- Show useful empty states such as "No students yet" with the appropriate administrator action.
- Do not show passwords in tables or detail panels.

## Teacher Workspace

The teacher workspace should prioritize daily teaching work.

Required capabilities:

- View assigned classes
- View students in assigned classes
- Create and manage courses
- Upload course materials
- Create and manage exercises
- Upload exercise materials
- View submissions
- Grade submissions
- Track attendance
- Correct attendance for the same date when supported
- Send class announcements
- Send individual student feedback or notifications where supported

Use a teaching-oriented information hierarchy:

- Today's or current-term context
- Classes and student counts
- Pending submissions
- Attendance action
- Recent announcements
- Course and exercise management

## Student Workspace

The student workspace should be simple and focused on learning progress.

Required capabilities:

- View profile
- View enrolled courses
- View course materials
- View exercises
- Submit exercise files
- View grades and progress
- View notifications
- View teacher feedback

Use a student-friendly hierarchy:

- Current progress summary
- Upcoming or unfinished exercises
- Recent feedback
- Course list
- Latest learning materials

Do not overwhelm students with administrative controls.

## Visual Direction

Use a distinct, intentional visual system inspired by modern education tools and calm productivity software.

Suggested direction:

- Primary color: confident blue for actions and navigation
- Neutral background: very light cool gray or blue-gray
- Dark ink for headings and high-contrast text
- Green for successful completion
- Amber for attention or pending work
- Red only for destructive actions and errors
- Avoid purple-on-white defaults
- Avoid excessive gradients, neon effects, glassmorphism, and decorative blobs
- Avoid oversized marketing hero sections
- Avoid excessive rounded cards nested inside other cards
- Keep card corners restrained, around 6-10px
- Use expressive but readable typography; do not rely on Arial, Roboto, or Inter as the only visual identity
- Keep headings compact inside dashboards and data-heavy screens
- Use Lucide icons inside icon buttons and provide tooltips for unfamiliar icons

Use CSS variables or a central theme so colors, spacing, and radii remain consistent.

## Interaction and State Requirements

Every data-driven view must include appropriate states:

- Initial loading skeleton or progress state
- Empty state
- Successful data state
- Recoverable API error state
- Disabled submitting state
- Confirmation state for destructive actions
- Mobile layout state

Forms must:

- Validate required fields before sending requests
- Preserve accessible labels
- Show server validation errors near the relevant form
- Avoid duplicate submissions
- Clear stale success and error messages when a new request starts
- Reset forms only after successful completion

## API Integration Constraints

Use the existing typed API client in `lib/api.ts`.

Do not:

- Call SQLite directly from the frontend
- Add fake local data as a replacement for API data
- Change endpoint names
- Change request field names
- Change authentication token format
- Assume an endpoint exists without checking `lib/api.ts` and the FastAPI routes
- Put backend secrets in `NEXT_PUBLIC_*` variables

The frontend environment variable should point to the deployed backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-deployed-backend.example.com
```

Keep browser requests routed through `/api-proxy` as the current application does.

## Code Organization

Prefer this structure:

```text
app/
  login/page.tsx
  setup/page.tsx
  admin/page.tsx
  teacher/page.tsx
  student/page.tsx
components/
  layout/
  auth/
  admin/
  teacher/
  student/
  shared/
lib/
  api.ts
  auth.ts
  validation.ts
```

Extract reusable components for:

- Application shell
- Sidebar and mobile navigation
- Page headers
- Stat blocks
- Data tables
- Empty states
- Loading states
- Error notices
- Confirmation dialogs
- Form fields
- Status badges

Preserve public APIs and existing backend contracts while refactoring the visual layer.

## Accessibility Requirements

- Use semantic HTML.
- Every input must have a visible or screen-reader-accessible label.
- Buttons must have clear accessible names.
- Icon-only buttons need tooltips and `aria-label` values.
- Maintain keyboard navigation.
- Use visible focus rings.
- Keep text contrast readable.
- Do not rely on color alone to communicate status.
- Announce important asynchronous success and error messages appropriately.

## Responsive Requirements

The design must work at:

- 360px mobile width
- 390px mobile width
- 768px tablet width
- 1280px desktop width
- 1440px wide desktop width

On mobile:

- Replace the persistent sidebar with a drawer or compact navigation.
- Keep primary actions reachable.
- Convert wide tables to stacked rows or horizontally scrollable data regions with clear labels.
- Prevent buttons, labels, and text from overflowing.
- Keep forms comfortable to use with touch input.

## Validation Checklist

Before finishing:

1. Confirm login works with the existing backend.
2. Confirm first-admin setup works against a fresh database.
3. Confirm setup is rejected when an admin already exists.
4. Confirm students and teachers cannot access another role's workspace.
5. Confirm logout clears the session.
6. Confirm a 401 response redirects to login.
7. Confirm admin, teacher, and student data comes from the existing API.
8. Confirm file upload controls use the existing multipart API methods.
9. Confirm no password, token, or secret appears in rendered UI or logs.
10. Confirm all required routes build successfully.
11. Run the frontend typecheck or production build.
12. Test the main workflows at desktop and mobile widths.

## Expected Deliverable

Return a complete frontend redesign inside `frentend/education-ai` while preserving the existing backend.

The final result must be:

- Visually cohesive across all roles
- Faster to understand than the current dashboard
- Secure in its presentation of user data
- Fully responsive
- Connected to the real API
- Free of fake account creation flows
- Free of exposed credentials
- Buildable with the existing package scripts

Do not stop at a visual mockup. Implement the usable pages, states, navigation, forms, and API-connected workflows.
