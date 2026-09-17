from database.database import Database
from models.student import Student
from models.admin import Admin
from models.teacher import Teacher
from repositories.admin_repository import AdminRepo
from repositories.student_repository import StudentRepo
from repositories.teacher_repository import TeacherRepo
from repositories.class_repository import ClassRepo
from models.class_group import ClassGroup
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


def test_duplicate_student_email_or_phone_is_rejected(tmp_path):
    db = Database(str(tmp_path / "duplicate-student.db"))
    repository = StudentRepo(db)
    first = Student(None, "First Student", "same@example.com", "hash", "0612345681", "3AC")
    repository.add_student(first)

    duplicate_email = Student(None, "Second Student", "same@example.com", "hash", "0612345682", "3AC")
    duplicate_phone = Student(None, "Third Student", "other@example.com", "hash", "0612345681", "3AC")

    import pytest
    with pytest.raises(ValueError, match="already exists"):
        repository.add_student(duplicate_email)
    with pytest.raises(ValueError, match="already exists"):
        repository.add_student(duplicate_phone)
    db.close()


def test_malformed_password_hash_is_rejected_without_crashing(tmp_path):
    db = Database(str(tmp_path / "malformed-password.db"))
    student = Student(None, "Bad Hash Student", "bad-hash@example.com", "not-a-password-hash", "0612345683", "3AC")
    StudentRepo(db).add_student(student)

    result = AuthService(StudentRepo(db), TeacherRepo(db), AdminRepo(db)).login(
        student.email, "any-password"
    )

    assert result is None
    db.close()


def test_account_persists_when_database_is_reopened(tmp_path):
    db_path = tmp_path / "persistent-auth.db"
    db = Database(str(db_path))
    password = "SecurePass123!"
    student = Student(
        None,
        "Persistent Student",
        "persistent@example.com",
        hash_password(password),
        "0612345684",
        "3AC",
    )
    StudentRepo(db).add_student(student)
    db.close()

    reopened_db = Database(str(db_path))
    result = AuthService(
        StudentRepo(reopened_db), TeacherRepo(reopened_db), AdminRepo(reopened_db)
    ).login(student.email, password)

    assert result["role"] == "student"
    reopened_db.close()


def test_teacher_assignment_preserves_organization_and_is_visible(tmp_path):
    db = Database(str(tmp_path / "teacher-assignment.db"))
    admin_repo = AdminRepo(db)
    admin = Admin(None, "Assignment Admin", "assignment@example.com", hash_password("SecurePass123!"), phone_number="0612345685")
    admin_repo.add_admin(admin)
    class_group = ClassGroup(None, "3AC Math", "2026")
    class_repo = ClassRepo(db)
    class_repo.add_class(class_group, admin_id=admin.admin_id)

    teacher = Teacher(None, "Assigned Teacher", "assigned@example.com", hash_password("SecurePass123!"), "0612345686")
    teacher_repo = TeacherRepo(db)
    teacher_repo.add_teacher(teacher, admin_id=admin.admin_id)
    teacher_repo.assign_teacher_to_classes(teacher.teacher_id, [class_group.class_id])

    visible_teacher = teacher_repo.get_all_teachers_for_admin(admin.admin_id)[0]

    assert [item.class_id for item in visible_teacher.classes] == [class_group.class_id]
    db.close()