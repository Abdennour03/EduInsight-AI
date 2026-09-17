# EduInsight AI

EduInsight AI is a full-stack education platform for managing classes, students, teachers, courses, exercises, submissions, grades, attendance, notifications, and academic reports.

The project contains:

- A FastAPI backend with layered services and raw SQLite persistence.
- A Next.js App Router frontend with separate admin, teacher, and student workspaces.
- JWT authentication with role-based access control.
- PDF and image uploads for course materials, exercise materials, and student submissions.
- Admin student reports with score graphs and PDF export.

## Features

### Admin

- Admin setup and login.
- Manage students, teachers, and classes.
- Assign students to classes.
- Assign teachers to multiple existing classes.
- Add teachers while creating a class.
- Search and delete administrative records.
- View student academic reports.
- Download reports as PDFs containing student details, class level, average score, graphs, and exercise grades.

### Teacher

- View assigned classes and students.
- Create courses for assigned classes.
- Create exercises inside owned courses.
- Upload optional PDF or image materials for courses and exercises.
- View uploaded materials from My Courses.
- View student submissions for a selected exercise.
- Open student submission PDFs or images.
- Grade submissions and send student feedback.
- Record and review attendance.
- Send class announcements.

### Student

- View the student overview and class progress.
- View enrolled courses and exercises.
- Open teacher-uploaded course and exercise materials.
- Upload PDF or image submissions for exercises.
- View submission status and grades.
- View progress graphs.
- Read announcements and private feedback from the overview.

## Project Structure

```text
app.py                         FastAPI application entry point
ARCHITECTURE.md                Backend architecture and refactor record
README.md                      Full project overview
requirements.txt               Python dependencies

api/
  main.py                      FastAPI app and router registration
  dependencies.py              Composition root and auth dependencies
  routes/                      HTTP endpoints
  schemas/                     Pydantic request and response models

controllers/                   Thin use-case facades
services/                      Business rules and workflows
repositories/                  SQLite queries and persistence
models/                        Domain entities
database/database.py           SQLite schema and compatibility migrations
utils/                         Validation, security, and file storage helpers
uploads/                       Local uploaded files at runtime

tests/
  controllers/                 Controller tests
  repositories/                Repository tests
  services/                    Service and business-rule tests

frentend/education-ai/
  app/                          Next.js App Router routes
  components/admin/            Admin route entry
  components/teacher/          Teacher route entry
  components/student/          Student route entry
  components/app/              Shared authenticated app implementation
  lib/api.ts                   Typed frontend API client
  Documentation.md             Frontend setup and architecture guide
```

## Backend Setup

The backend is tested with Python 3.10 or newer. On Windows, create and activate the virtual environment from the project root:

```powershell
python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Start the API:

```powershell
uvicorn app:app --reload
```

The backend is available at:

- API root: `http://127.0.0.1:8000/`
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

The database is created automatically by `database/database.py`. Existing SQLite data is preserved. The default seeded admin account is:

```text
Email:    admin@eduinsight.ai
Password: adminpassword
```

Change default credentials in a real deployment.

## Frontend Setup

The frontend is a Next.js 16 application. See [frentend/education-ai/Documentation.md](frentend/education-ai/Documentation.md) for the complete frontend guide.

From the frontend directory:

```powershell
cd frentend\education-ai
npm ci
```

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Start the frontend:

```powershell
npm run dev
```

Open `http://localhost:3000`.

For a production build:

```powershell
npm run build
npm run start
```

Run the backend and frontend in separate terminals.

## Deployment

### Render Backend

The repository includes [render.yaml](render.yaml). In Render, create a
Blueprint from the repository or configure a Python web service with:

```text
Build command: pip install -r requirements.txt
Start command: uvicorn app:app --host 0.0.0.0 --port $PORT
```

Set the backend environment variable:

```text
CORS_ORIGINS=https://your-app.vercel.app
```

### Railway persistence

The backend uses SQLite. SQLite data must be stored on a persistent Railway
Volume, not the container filesystem. Mount a Volume at `/data` and set:

```text
EDUINSIGHT_DB_PATH=/data/eduinsight.db
SECRET_KEY=<long-random-secret>
```

Without this Volume, accounts and passwords can disappear when Railway
replaces or restarts the container. `SECRET_KEY` must remain unchanged or
existing login sessions will become invalid.

Multiple frontend origins can be comma-separated. For temporary testing,
`CORS_ORIGINS=*` is supported; wildcard mode disables credentialed CORS as
required by browsers. Render provides the `PORT` variable automatically.

The backend uses local SQLite and local upload storage. These are suitable for
development and simple demos. For production persistence, use a managed
database and object storage because Render web-service filesystems should not
be treated as permanent storage.

### Vercel Frontend

Create a Vercel project with the frontend root directory set to:

```text
frentend/education-ai
```

Vercel detects Next.js automatically. Set this environment variable in the
Vercel project settings:

```text
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com
```

In Vercel, set the project **Root Directory** to `frentend/education-ai` and
add `NEXT_PUBLIC_API_URL` for the **Production** environment. Redeploy after
saving the variable. Do not use `127.0.0.1` or `localhost` there: those URLs
refer to the Vercel build/runtime, not the local computer. The Render backend
must also allow the deployed Vercel origin in `CORS_ORIGINS`.

The production build command is `npm run build`. After deployment, update the
Render `CORS_ORIGINS` value with the real Vercel URL and redeploy or restart
the backend.

## Architecture

### Backend

The backend follows a layered architecture:

```text
HTTP request
  -> FastAPI route and schema
  -> Controller
  -> Service
  -> Repository
  -> Database gateway
  -> SQLite
```

- Routes handle HTTP parameters, authentication dependencies, and serialization.
- Controllers delegate use cases to services.
- Services enforce validation, authorization, and workflow rules.
- Repositories contain SQL and domain-model hydration.
- `database/database.py` owns the SQLite connection and schema creation.
- `api/dependencies.py` constructs the dependency graph.

The backend does not use SQLAlchemy or another ORM.

### Frontend

The frontend uses explicit role routes:

```text
app/page.tsx                 Authentication entry and role redirect
app/admin/page.tsx           Admin route
app/teacher/page.tsx         Teacher route
app/student/page.tsx         Student route
```

Role entry components are located under `components/admin`, `components/teacher`, and `components/student`. Authenticated users are redirected to the route matching their JWT role. Unauthenticated users see the login view.

## Important API Workflows

### Student submission upload

```text
POST /students/me/submissions
Content-Type: multipart/form-data

exercise_id: integer
file: PDF or JPEG or PNG
```

Files are stored under `uploads/submissions/` with unique names. The database stores the public relative path in `file_path`.

### Teacher material upload

The teacher course and exercise creation endpoints accept multipart form data and an optional file:

```text
POST /teachers/me/courses
POST /teachers/me/exercises
```

Materials are stored under `uploads/materials/`. Their paths are recorded in the `learning_materials` table and returned to teachers and students.

### Public file serving

The backend mounts the upload root at:

```text
/uploads
```

The frontend uses the Next.js `/api-proxy` rewrite when opening uploaded files in the browser.

### Teacher class assignment

```text
POST /admin/teachers/{teacher_id}/classes
```

Request body:

```json
{
  "class_ids": [1, 2]
}
```

The endpoint validates class IDs, rejects duplicate assignments, and preserves the teacher's existing classes when adding new classes.

## Authentication

Login returns a JWT containing the authenticated role. FastAPI dependencies enforce role access for admin, teacher, and student routes. The frontend stores the token and role in local storage and sends the token as a Bearer authorization header.

## File Validation

Supported file MIME types are:

- `application/pdf`
- `image/jpeg`
- `image/png`

Uploaded files use unique names containing the owning exercise/course or student identifiers, a timestamp, and a UUID component.

## Testing and Validation

Run backend tests from the project root:

```powershell
python -m pytest -q
```

Run the frontend production build:

```powershell
cd frentend\education-ai
npm run build
```

The frontend build is the primary validation for route imports, TypeScript compilation, and App Router bundling. Backend tests cover database initialization, repositories, services, controllers, grades, attendance, authentication, and admin workflows.

## Troubleshooting

### Backend is unavailable

Confirm the API is running on port `8000` and that `.env.local` points to the same address.

### Upload links return 404

Confirm the backend is running, the file exists under `uploads/`, and the path begins with `/uploads/`. Browser links should be generated through the frontend `getFileUrl()` helper.

### The user is redirected to the wrong workspace

Clear these local storage values and sign in again:

```text
eduinsight_access_token
eduinsight_role
```

### Reset local database state

Stop the backend, remove the local SQLite database file if a clean environment is required, and restart the API. The schema and seeded admin are recreated by the database gateway.

## Additional Documentation

- [Backend architecture](ARCHITECTURE.md)
- [Frontend documentation](frentend/education-ai/Documentation.md)
