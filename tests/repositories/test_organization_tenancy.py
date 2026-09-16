from utils.security import decode_access_token, hash_password
from database.database import Database
from models.admin import Admin
from models.class_group import ClassGroup
from models.student import Student
from repositories.admin_repository import AdminRepo
from repositories.class_repository import ClassRepo
from services.auth_service import AuthService
from repositories.student_repository import StudentRepo
from repositories.teacher_repository import TeacherRepo


def test_database_creates_organization_schema(tmp_path):
    db = Database(str(tmp_path / "org-schema.db"))

    tables = {
        row[0]
        for row in db.cursor.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table'"
        )
    }

    assert "organizations" in tables

    for table_name in ("admins", "students", "teachers", "classes", "courses", "exercises", "grades", "submissions", "attendance", "notifications", "teacher_classes"):
        if table_name in tables:
            columns = {
                row[1]
                for row in db.cursor.execute(f"PRAGMA table_info({table_name})")
            }
            assert "organization_id" in columns, f"Missing organization_id in {table_name}"

    assert db.cursor.execute("SELECT COUNT(*) FROM organizations").fetchone()[0] >= 1
    db.close()


def test_admin_login_includes_organization_id(tmp_path):
    db = Database(str(tmp_path / "org-login.db"))
    org_id = db.cursor.execute("SELECT id FROM organizations ORDER BY id LIMIT 1").fetchone()[0]
    admin_repo = AdminRepo(db)
    password = "SecurePass123!"
    admin_repo.db.cursor.execute(
        "INSERT INTO admins (full_name, email, password_hash, organization_id) VALUES (?, ?, ?, ?)",
        ("Org Admin", "admin@example.com", hash_password(password), org_id),
    )
    db.connection.commit()

    token = AuthService(StudentRepo(db), TeacherRepo(db), admin_repo).login("admin@example.com", password)
    payload = decode_access_token(token["access_token"])

    assert payload["role"] == "admin"
    assert payload["organization_id"] == org_id
    db.close()


def test_same_org_admins_share_data(tmp_path):
    db = Database(str(tmp_path / "same-org-share.db"))
    admin_repo = AdminRepo(db)
    org_id = db.cursor.execute("SELECT id FROM organizations ORDER BY id LIMIT 1").fetchone()[0]

    admin_a1 = Admin(None, "Admin A1", "a1@example.com", hash_password("Pass123!"), organization_id=org_id)
    admin_a2 = Admin(None, "Admin A2", "a2@example.com", hash_password("Pass123!"), organization_id=org_id)
    admin_repo.add_admin(admin_a1)
    admin_repo.add_admin(admin_a2)

    class_repo = ClassRepo(db)
    class_group = ClassGroup(None, "Shared Class", "2026")
    class_repo.add_class(class_group, admin_id=admin_a1.admin_id)

    assert class_repo.get_class(class_group.class_id, admin_id=admin_a2.admin_id).class_id == class_group.class_id
    assert [item.class_id for item in class_repo.get_all_classes_for_admin(admin_a2.admin_id)] == [class_group.class_id]
    db.close()


def test_cross_org_admin_cannot_access_other_org_data(tmp_path):
    db = Database(str(tmp_path / "cross-org.db"))
    admin_repo = AdminRepo(db)
    org_1 = db.cursor.execute("SELECT id FROM organizations ORDER BY id LIMIT 1").fetchone()[0]
    db.cursor.execute("INSERT INTO organizations (name) VALUES ('Org B')")
    db.connection.commit()
    org_2 = db.cursor.execute("SELECT id FROM organizations ORDER BY id DESC LIMIT 1").fetchone()[0]

    admin_a = Admin(None, "Org A Admin", "admin-a@example.com", hash_password("Pass123!"), organization_id=org_1)
    admin_b = Admin(None, "Org B Admin", "admin-b@example.com", hash_password("Pass123!"), organization_id=org_2)
    admin_repo.add_admin(admin_a)
    admin_repo.add_admin(admin_b)

    class_repo = ClassRepo(db)
    class_a = ClassGroup(None, "Org A Class", "2026")
    class_b = ClassGroup(None, "Org B Class", "2026")
    class_repo.add_class(class_a, admin_id=admin_a.admin_id)
    class_repo.add_class(class_b, admin_id=admin_b.admin_id)

    assert class_repo.get_class(class_a.class_id, admin_id=admin_b.admin_id) is None
    assert class_repo.get_class(class_b.class_id, admin_id=admin_a.admin_id) is None
    assert [item.class_id for item in class_repo.get_all_classes(admin_id=admin_a.admin_id)] == [class_a.class_id]
    assert [item.class_id for item in class_repo.get_all_classes(admin_id=admin_b.admin_id)] == [class_b.class_id]

    student_repo = StudentRepo(db)
    student_a = Student(None, "Student A", "student-a@example.com", "hash", "1", "A", class_a.class_id)
    student_b = Student(None, "Student B", "student-b@example.com", "hash", "1", "A", class_b.class_id)
    student_repo.add_student(student_a, admin_id=admin_a.admin_id)
    student_repo.add_student(student_b, admin_id=admin_b.admin_id)

    assert student_repo.get_student(student_a.student_id, admin_id=admin_b.admin_id) is None
    assert student_repo.get_student(student_b.student_id, admin_id=admin_a.admin_id) is None
    db.close()
