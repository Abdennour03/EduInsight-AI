# EduInsight AI Frontend Documentation

## Overview

The frontend is a Next.js 16 application using the App Router, React 19, TypeScript, Tailwind CSS, Recharts, Lucide icons, and jsPDF.

It provides separate workspaces for:

- Administrators: people, classes, teacher assignments, reports, and PDF report downloads.
- Teachers: courses, exercises, course/exercise material uploads, submissions, grading, attendance, announcements, and classes.
- Students: overview, courses, teacher-uploaded materials, progress, submissions, grades, and notifications.

## Requirements

- Node.js 20 or newer recommended.
- The FastAPI backend running on `http://127.0.0.1:8000`.
- A configured backend database and user account.

## Installation

From this directory:

```powershell
cd frentend\education-ai
npm install
```

For a clean dependency installation, use:

```powershell
npm ci
```

## Environment Configuration

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

The frontend uses the Next.js rewrite in `next.config.mjs` to proxy browser requests through `/api-proxy`. This avoids browser CORS problems while the backend remains responsible for authentication and authorization.

## Development

Start the frontend development server:

```powershell
npm run dev
```

Open `http://localhost:3000`.

Start the backend separately from the project root:

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app:app --reload
```

## Production Build

```powershell
npm run build
npm run start
```

The production server normally runs at `http://localhost:3000`.

## App Routes

| Route | Purpose |
| --- | --- |
| `/` | Authentication entry. Redirects authenticated users to their role workspace. |
| `/login` | Login screen. |
| `/setup` | Admin setup screen. |
| `/admin` | Admin workspace. |
| `/teacher` | Teacher workspace. |
| `/student` | Student workspace. |

The role pages do not re-export the root page. Each route imports its own role entry component:

```text
app/admin/page.tsx   -> components/admin/AdminWorkspace.tsx
app/teacher/page.tsx -> components/teacher/TeacherWorkspace.tsx
app/student/page.tsx -> components/student/StudentWorkspace.tsx
```

## Component Structure

```text
components/
  admin/
    AdminWorkspace.tsx
  teacher/
    TeacherWorkspace.tsx
  student/
    StudentWorkspace.tsx
  app/
    LegacyApp.tsx
```

`LegacyApp.tsx` contains the shared authenticated shell and existing dashboard implementations. The role entry components provide route-specific role guards and preserve the current UI while the workspace code is progressively separated.

## Authentication

The API client stores the JWT and role in browser local storage:

- `eduinsight_access_token`
- `eduinsight_role`

The authenticated role controls the workspace route. A user visiting the wrong role route is redirected to the route matching the stored role. Logging out clears the stored session and returns to `/login`.

## API Client

The client is located at `lib/api.ts`. It provides typed helpers for:

- Authentication and session handling.
- Admin students, teachers, classes, assignments, and reports.
- Teacher courses, exercises, grades, attendance, submissions, and notifications.
- Student profiles, courses, exercises, grades, submissions, and notifications.
- Multipart file uploads for student submissions and teacher course/exercise materials.

JSON requests use `Content-Type: application/json`. Requests containing `FormData` intentionally do not set `Content-Type`; the browser supplies the multipart boundary.

## File Uploads

Supported upload types are:

- PDF: `application/pdf`
- JPEG: `image/jpeg`
- PNG: `image/png`

Teachers can upload course and exercise materials. Students can upload exercise submissions. Uploaded files are served by the backend through `/uploads/...` and opened from the frontend through the `/api-proxy` path.

## Admin Reports

The admin report view provides:

- Student name and email.
- Class and academic level.
- Average score and graded-exercise result.
- Exercise score graph.
- Exercise-grade details.
- Client-side PDF download using `jspdf`.

## Styling and UI

The application uses utility classes from Tailwind CSS. Existing visual conventions include:

- Blue primary actions using `#0052CC`.
- Light blue borders and panels.
- Responsive grid layouts.
- Lucide icons for navigation and actions.
- Recharts for progress and report graphs.

Keep new screens consistent with the existing workspace layouts and avoid changing shared API or authentication behavior without updating the route components and this document.

## Useful Commands

```powershell
npm run dev       # Start development server
npm run build     # Create production build
npm run start     # Serve production build
npm ci            # Install package-lock dependencies exactly
```

## Troubleshooting

### Backend requests fail

Confirm the FastAPI server is running on `http://127.0.0.1:8000` and that `.env.local` points to the correct backend URL.

### Files return 404

Confirm the backend is running and that the uploaded path begins with `/uploads/`. The frontend should open uploaded files through `getFileUrl()` so browser requests use `/api-proxy/uploads/...`.

### Session redirects unexpectedly

Clear the browser local storage entries `eduinsight_access_token` and `eduinsight_role`, then sign in again.

### Build issues after dependency changes

Remove the local build output and reinstall dependencies:

```powershell
Remove-Item -Recurse -Force .next
npm ci
npm run build
```
