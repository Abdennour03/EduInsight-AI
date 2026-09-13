from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from utils.submission_storage import UPLOAD_ROOT
from api.routes.student_router import router as student_router
from api.routes.teacher_router import router as teacher_router
from api.routes.course_router import router as course_router
from api.routes.exercise_router import router as exercise_router
from api.routes.notification_router import router as notification_router
from api.routes.student_notification_router import (
    router as student_notification_router
)
from api.routes.submission_router import router as submission_router
from api.routes.grade_router import router as grade_router
from api.routes.auth_router import router as auth_router
from api.routes.admin_router import router as admin_router
from api.routes.attendance_router import router as attendance_router
app = FastAPI(
    title = "EduAnalytics API",
    description="Backend API for EduAnalytics",
    version="1.0.0"
)

UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_ROOT), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(student_router)
app.include_router(teacher_router)
app.include_router(course_router)
app.include_router(exercise_router)
app.include_router(notification_router)
app.include_router(student_notification_router)
app.include_router(submission_router)
app.include_router(grade_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(attendance_router)

@app.get("/")
def root():
    return {
        "message": "EduAnalytics API is running"
    }

