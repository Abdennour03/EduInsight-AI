from database.database import Database
from models.student import Student
from models.admin import Admin
from repositories.admin_repository import AdminRepo
from repositories.student_repository import StudentRepo
from repositories.teacher_repository import TeacherRepo
from services.auth_service import AuthService
from utils.security import decode_access_token, hash_password


def test_student_can_login_with_phone_number(tmp_path):
    db = Database(str(tmp_path / "phone-login.db"))
    password = "SecurePass123!"
    student = Student(
        None,
        "Phone Student",
        "student@example.com",
        hash_password(password),
        "0612345678",
        "3AC",
    )
    StudentRepo(db).add_student(student)
    auth_service = AuthService(StudentRepo(db), TeacherRepo(db), AdminRepo(db))

    result = auth_service.login(student.phone_number, password)

    assert result["role"] == "student"
    assert decode_access_token(result["access_token"])["sub"] == str(student.student_id)
    db.close()


def test_email_login_remains_supported(tmp_path):
    db = Database(str(tmp_path / "email-login.db"))
    password = "SecurePass123!"
    student = Student(
        None,
        "Email Student",
        "email@example.com",
        hash_password(password),
        "0612345679",
        "3AC",
    )
    StudentRepo(db).add_student(student)

    result = AuthService(StudentRepo(db), TeacherRepo(db), AdminRepo(db)).login(
        student.email, password
    )

    assert result["role"] == "student"
    db.close()


def test_admin_can_login_with_unique_phone_number(tmp_path):
    db = Database(str(tmp_path / "admin-phone-login.db"))
    password = "SecurePass123!"
    admin = Admin(
        None,
        "Phone Admin",
        "admin@example.com",
        hash_password(password),
        phone_number="0612345680",
    )
    AdminRepo(db).add_admin(admin)

    result = AuthService(StudentRepo(db), TeacherRepo(db), AdminRepo(db)).login(
        admin.phone_number, password
    )

    assert result["role"] == "admin"
    db.close()