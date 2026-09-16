from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from controllers.auth_controller import AuthController
from controllers.admin_controller import AdminController
from controllers.attendance_controller import AttendanceController
from controllers.class_controller import ClassController
from controllers.course_controller import CourseController
from controllers.exercise_controller import ExerciseController
from controllers.grade_controller import GradeController
from controllers.notification_controller import NotificationController
from controllers.student_controller import StudentController
from controllers.submission_controller import SubmissionController
from controllers.teacher_controller import TeacherController
from database.database import Database
from repositories.course_repository import CourseRepo
from repositories.admin_repository import AdminRepo
from repositories.attendance_repository import AttendanceRepo
from repositories.class_repository import ClassRepo
from repositories.exercise_repository import ExerciseRepo
from repositories.grade_repository import GradeRepo
from repositories.notification_repository import NotificationRepo
from repositories.student_notification_repository import StudentNotificationRepo
from repositories.student_repository import StudentRepo
from repositories.submission_repository import SubmissionRepo
from repositories.teacher_repository import TeacherRepo
from services.auth_service import AuthService
from services.admin_service import AdminService
from services.attendance_service import AttendanceService
from services.class_service import ClassService
from services.course_service import CourseService
from services.exercise_service import ExerciseService
from services.grade_service import GradeService
from services.notification_service import NotificationService
from services.student_service import StudentService
from services.submission_service import SubmissionService
from services.teacher_service import TeacherService
from utils.security import decode_access_token


db = Database()
student_repo = StudentRepo(db)
teacher_repo = TeacherRepo(db)
admin_repo = AdminRepo(db)
attendance_repo = AttendanceRepo(db)
class_repo = ClassRepo(db)
course_repo = CourseRepo(db)
exercise_repo = ExerciseRepo(db)
submission_repo = SubmissionRepo(db, student_repo, exercise_repo)
grade_repo = GradeRepo(db, student_repo, exercise_repo)
notification_repo = NotificationRepo(db)
student_notification_repo = StudentNotificationRepo(db, student_repo, notification_repo)

student_service = StudentService(student_repo, exercise_repo)
teacher_service = TeacherService(teacher_repo)
course_service = CourseService(course_repo, teacher_repo)
exercise_service = ExerciseService(exercise_repo, course_repo)
submission_service = SubmissionService(submission_repo, student_repo, exercise_repo)
grade_service = GradeService(
    grade_repo,
    student_repo,
    exercise_repo,
    course_repo,
    submission_repo,
)
notification_service = NotificationService(notification_repo, student_notification_repo, teacher_repo, student_repo, admin_repo)
class_service = ClassService(class_repo)
attendance_service = AttendanceService(attendance_repo, teacher_repo, class_service)
admin_service = AdminService(admin_repo, student_service, teacher_service, class_service)
auth_service = AuthService(student_repo, teacher_repo, admin_repo)

student_controller = StudentController(student_service)
teacher_controller = TeacherController(teacher_service)
course_controller = CourseController(course_service)
exercise_controller = ExerciseController(exercise_service)
submission_controller = SubmissionController(submission_service)
grade_controller = GradeController(grade_service)
notification_controller = NotificationController(notification_service)
auth_controller = AuthController(auth_service)
class_controller = ClassController(class_service)
admin_controller = AdminController(admin_service)
attendance_controller = AttendanceController(attendance_service)

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload.get("sub"))
        role = payload.get("role")
    except (Exception, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    try:
        if role == "student":
            return student_service.get_student(user_id)
        if role == "teacher":
            return teacher_service.get_teacher(user_id)
        if role == "admin":
            return admin_service.get_admin(user_id)
    except ValueError:
        pass
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")


def require_student(current_user=Depends(get_current_user)):
    if not hasattr(current_user, "student_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required")
    return current_user


def require_teacher(current_user=Depends(get_current_user)):
    if not hasattr(current_user, "teacher_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher access required")
    return current_user


def get_current_admin(current_user=Depends(get_current_user)):
    if not hasattr(current_user, "admin_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


admin_required = get_current_admin
