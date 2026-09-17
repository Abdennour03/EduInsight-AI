from database.database import Database
from models.student import Student
from repositories.student_repository import StudentRepo
import sqlite3
import pytest


def test_database_creates_core_schema(tmp_path):
    db = Database(str(tmp_path / "schema.db"))
    tables = {
        row[0]
        for row in db.cursor.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table'"
        )
    }
    assert {"students", "teachers", "courses", "exercises", "grades"} <= tables
    assert db.cursor.execute("PRAGMA foreign_keys").fetchone()[0] == 1
    db.close()


def test_railway_requires_explicit_database_path(monkeypatch):
    monkeypatch.delenv("EDUINSIGHT_DB_PATH", raising=False)
    monkeypatch.setenv("RAILWAY_ENVIRONMENT_NAME", "production")

    with pytest.raises(RuntimeError, match="EDUINSIGHT_DB_PATH"):
        Database()


def test_non_sqlite_database_url_is_rejected(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@host/db")
    monkeypatch.delenv("EDUINSIGHT_DB_PATH", raising=False)
    monkeypatch.delenv("RAILWAY_ENVIRONMENT_NAME", raising=False)
    monkeypatch.delenv("RAILWAY_PROJECT_ID", raising=False)

    with pytest.raises(RuntimeError, match="raw SQLite"):
        Database()


def test_database_path_survives_reopen(tmp_path, monkeypatch):
    db_path = tmp_path / "persistent.db"
    monkeypatch.setenv("EDUINSIGHT_DB_PATH", str(db_path))
    db = Database()
    db.cursor.execute("INSERT INTO organizations (name) VALUES (?)", ("Persistent",))
    db.connection.commit()
    db.close()

    reopened_db = Database()
    assert reopened_db.cursor.execute(
        "SELECT name FROM organizations WHERE name = ?", ("Persistent",)
    ).fetchone()[0] == "Persistent"
    reopened_db.close()


def test_failed_write_is_rolled_back(tmp_path):
    db_path = tmp_path / "rollback.db"
    db = Database(str(db_path))
    db.cursor.execute("INSERT INTO organizations (name) VALUES (?)", ("Should Roll Back",))

    with pytest.raises(sqlite3.IntegrityError):
        db.cursor.execute("INSERT INTO organizations (id, name) VALUES (?, ?)", (1, "Duplicate"))
    db.close()

    reopened_db = Database(str(db_path))
    assert reopened_db.cursor.execute(
        "SELECT 1 FROM organizations WHERE name = ?", ("Should Roll Back",)
    ).fetchone() is None
    reopened_db.close()


def test_student_academic_report_joins_class_by_id(tmp_path):
    db = Database(str(tmp_path / "report.db"))
    db.cursor.execute(
        "INSERT INTO classes (name, academic_year) VALUES (?, ?)",
        ("3ac math", "3AC"),
    )
    class_id = db.cursor.lastrowid
    student = Student(
        None,
        "Yassin",
        "yassin@example.com",
        "password",
        "0679120023",
        "3AC",
        class_id,
    )
    StudentRepo(db).add_student(student)
    db.cursor.execute(
        "INSERT INTO teachers (full_name, email, password, phone_number) VALUES (?, ?, ?, ?)",
        ("Teacher", "teacher@example.com", "password", "0600000000"),
    )
    teacher_id = db.cursor.lastrowid
    db.cursor.execute(
        "INSERT INTO courses (course_name, teacher_id, semester, level) VALUES (?, ?, ?, ?)",
        ("Mathematics", teacher_id, "S1", "3ac math"),
    )
    course_id = db.cursor.lastrowid
    db.cursor.execute(
        "INSERT INTO exercises (exercise_name, course_id, max_score) VALUES (?, ?, ?)",
        ("Algebra test", course_id, 20),
    )
    exercise_id = db.cursor.lastrowid
    db.cursor.execute(
        "INSERT INTO grades (score, student_id, exercise_id) VALUES (?, ?, ?)",
        (17, student.student_id, exercise_id),
    )
    db.connection.commit()

    report = StudentRepo(db).get_academic_report(student.student_id)

    assert report["class_info"] == {
        "class_id": class_id,
        "name": "3ac math",
        "academic_year": "3AC",
    }
    assert report["exercises_and_exams"] == [{
        "exercise_id": exercise_id,
        "exercise_name": "Algebra test",
        "score": 17.0,
    }]
    db.close()
