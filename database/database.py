import sqlite3
import threading
import os


class _LockedCursor:
    def __init__(self, cursor, lock):
        self._cursor = cursor
        self._lock = lock

    def execute(self, *args, **kwargs):
        with self._lock:
            self._cursor.execute(*args, **kwargs)
        return self

    def executemany(self, *args, **kwargs):
        with self._lock:
            self._cursor.executemany(*args, **kwargs)
        return self

    def executescript(self, *args, **kwargs):
        with self._lock:
            self._cursor.executescript(*args, **kwargs)
        return self

    def fetchone(self):
        with self._lock:
            return self._cursor.fetchone()

    def fetchall(self):
        with self._lock:
            return self._cursor.fetchall()

    def fetchmany(self, *args, **kwargs):
        with self._lock:
            return self._cursor.fetchmany(*args, **kwargs)

    def __iter__(self):
        return iter(self.fetchall())

    def __getattr__(self, name):
        return getattr(self._cursor, name)


class _LockedConnection:
    def __init__(self, connection, lock):
        self._connection = connection
        self._lock = lock

    def cursor(self):
        return _LockedCursor(self._connection.cursor(), self._lock)

    def execute(self, *args, **kwargs):
        with self._lock:
            cursor = self._connection.execute(*args, **kwargs)
        return _LockedCursor(cursor, self._lock)

    def commit(self):
        with self._lock:
            self._connection.commit()

    def rollback(self):
        with self._lock:
            self._connection.rollback()

    def close(self):
        with self._lock:
            self._connection.close()

    def __getattr__(self, name):
        return getattr(self._connection, name)


class Database:
    def __init__(self, db_name=None):
        db_name = db_name or os.getenv("EDUINSIGHT_DB_PATH", "eduinsight.db")
        self._lock = threading.RLock()
        self.connection = _LockedConnection(
            sqlite3.connect(db_name, check_same_thread=False),
            self._lock,
        )
        self.connection.execute("PRAGMA foreign_keys = ON")
        self._cursor_storage = threading.local()
        self.create_tables()

    @property
    def cursor(self):
        cursor = getattr(self._cursor_storage, "cursor", None)
        if cursor is None:
            cursor = self.connection.cursor()
            self._cursor_storage.cursor = cursor
        return cursor

    def create_tables(self):
        existing_classes = self.cursor.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'classes'"
        ).fetchone()
        if existing_classes:
            existing_class_columns = {
                row[1] for row in self.cursor.execute("PRAGMA table_info(classes)")
            }
            if "id" not in existing_class_columns:
                self.cursor.execute("ALTER TABLE classes ADD COLUMN id INTEGER")
                if "class_id" in existing_class_columns:
                    self.cursor.execute(
                        "UPDATE classes SET id = class_id WHERE id IS NULL"
                    )
            self.cursor.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_classes_canonical_id ON classes(id)"
            )
        self.cursor.executescript(
            """
            CREATE TABLE IF NOT EXISTS organizations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL DEFAULT 'Default Organization',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                academic_year TEXT NOT NULL,
                admin_id INTEGER REFERENCES admins(id),
                organization_id INTEGER REFERENCES organizations(id)
            );
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                phone_number TEXT,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                organization_id INTEGER REFERENCES organizations(id)
            );
            CREATE TABLE IF NOT EXISTS students (
                student_id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                phone_number TEXT,
                level TEXT NOT NULL,
                class_id INTEGER,
                admin_id INTEGER REFERENCES admins(id),
                organization_id INTEGER REFERENCES organizations(id),
                FOREIGN KEY (class_id) REFERENCES classes(id)
            );
            CREATE TABLE IF NOT EXISTS teachers (
                teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                phone_number TEXT,
                class_id INTEGER,
                admin_id INTEGER REFERENCES admins(id),
                organization_id INTEGER REFERENCES organizations(id),
                FOREIGN KEY (class_id) REFERENCES classes(id)
            );
            CREATE TABLE IF NOT EXISTS teacher_classes (
                teacher_id INTEGER NOT NULL,
                class_id INTEGER NOT NULL,
                organization_id INTEGER REFERENCES organizations(id),
                PRIMARY KEY (teacher_id, class_id),
                FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS courses (
                course_id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_name TEXT NOT NULL,
                teacher_id INTEGER NOT NULL,
                semester TEXT NOT NULL,
                level TEXT NOT NULL,
                organization_id INTEGER REFERENCES organizations(id),
                FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
            );
            CREATE TABLE IF NOT EXISTS exercises (
                exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
                exercise_name TEXT NOT NULL,
                course_id INTEGER NOT NULL,
                max_score REAL NOT NULL DEFAULT 20,
                organization_id INTEGER REFERENCES organizations(id),
                FOREIGN KEY (course_id) REFERENCES courses(course_id)
            );
            CREATE TABLE IF NOT EXISTS learning_materials (
                material_id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_type TEXT NOT NULL CHECK (owner_type IN ('course', 'exercise')),
                owner_id INTEGER NOT NULL,
                file_path TEXT NOT NULL,
                organization_id INTEGER REFERENCES organizations(id)
            );
            CREATE TABLE IF NOT EXISTS submissions (
                submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                exercise_id INTEGER NOT NULL,
                submission_date TEXT NOT NULL,
                file_path TEXT NOT NULL,
                status TEXT NOT NULL,
                organization_id INTEGER REFERENCES organizations(id),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
            );
            CREATE TABLE IF NOT EXISTS grades (
                grade_id INTEGER PRIMARY KEY AUTOINCREMENT,
                score REAL NOT NULL,
                student_id INTEGER NOT NULL,
                exercise_id INTEGER NOT NULL,
                organization_id INTEGER REFERENCES organizations(id),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id),
                UNIQUE (student_id, exercise_id)
            );
            CREATE TABLE IF NOT EXISTS attendance (
                attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                class_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
                organization_id INTEGER REFERENCES organizations(id),
                FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                UNIQUE (student_id, class_id, date)
            );
            CREATE TABLE IF NOT EXISTS notifications (
                notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                sender_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                admin_id INTEGER REFERENCES admins(id),
                sender_type TEXT NOT NULL DEFAULT 'teacher',
                organization_id INTEGER REFERENCES organizations(id),
                FOREIGN KEY (sender_id) REFERENCES teachers(teacher_id)
            );
            CREATE TABLE IF NOT EXISTS student_notifications (
                student_notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                notification_id INTEGER NOT NULL,
                is_read INTEGER NOT NULL DEFAULT 0,
                organization_id INTEGER REFERENCES organizations(id),
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (notification_id) REFERENCES notifications(notification_id)
            );
            """
        )
        admin_columns = {row[1] for row in self.cursor.execute("PRAGMA table_info(admins)")}
        if "phone_number" not in admin_columns:
            self.cursor.execute("ALTER TABLE admins ADD COLUMN phone_number TEXT")
        self.cursor.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_phone_unique ON admins(phone_number) WHERE phone_number IS NOT NULL"
        )
        self.cursor.execute("DROP INDEX IF EXISTS idx_students_phone_unique")
        self.cursor.execute("DROP INDEX IF EXISTS idx_teachers_phone_unique")
        self.cursor.execute(
                """CREATE UNIQUE INDEX IF NOT EXISTS idx_students_org_phone_unique
                    ON students(organization_id, phone_number)
                    WHERE phone_number IS NOT NULL"""
        )
        self.cursor.execute(
                """CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_org_phone_unique
                    ON teachers(organization_id, phone_number)
                    WHERE phone_number IS NOT NULL"""
        )
        self.cursor.execute(
            """CREATE UNIQUE INDEX IF NOT EXISTS idx_students_unscoped_phone_unique
               ON students(phone_number)
               WHERE organization_id IS NULL AND phone_number IS NOT NULL"""
        )
        self.cursor.execute(
            """CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_unscoped_phone_unique
               ON teachers(phone_number)
               WHERE organization_id IS NULL AND phone_number IS NOT NULL"""
        )
        self.connection.commit()
        notification_schema = self.cursor.execute(
            "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'notifications'"
        ).fetchone()
        if notification_schema and "REFERENCES admins(admin_id)" in notification_schema[0]:
            self.connection.execute("PRAGMA foreign_keys = OFF")
            self.cursor.execute(
                """CREATE TABLE notifications_migrated (
                    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    sender_id INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    admin_id INTEGER REFERENCES admins(id),
                    sender_type TEXT NOT NULL DEFAULT 'teacher',
                    organization_id INTEGER REFERENCES organizations(id),
                    FOREIGN KEY (sender_id) REFERENCES teachers(teacher_id)
                )"""
            )
            self.cursor.execute(
                """INSERT INTO notifications_migrated
                   (notification_id, title, message, sender_id, created_at, admin_id, sender_type)
                   SELECT notification_id, title, message, sender_id, created_at,
                          admin_id, COALESCE(sender_type, 'teacher')
                   FROM notifications"""
            )
            self.cursor.execute("DROP TABLE notifications")
            self.cursor.execute("ALTER TABLE notifications_migrated RENAME TO notifications")
            self.connection.commit()
            self.connection.execute("PRAGMA foreign_keys = ON")
        exercise_columns = {
            row[1]
            for row in self.cursor.execute("PRAGMA table_info(exercises)")
        }
        if "max_score" not in exercise_columns:
            self.cursor.execute(
                "ALTER TABLE exercises ADD COLUMN max_score REAL NOT NULL DEFAULT 20"
            )
        notification_columns = {
            row[1]
            for row in self.cursor.execute("PRAGMA table_info(notifications)")
        }
        if "admin_id" not in notification_columns:
            self.cursor.execute(
                "ALTER TABLE notifications ADD COLUMN admin_id INTEGER REFERENCES admins(id)"
            )
        if "sender_type" not in notification_columns:
            self.cursor.execute(
                "ALTER TABLE notifications ADD COLUMN sender_type TEXT NOT NULL DEFAULT 'teacher'"
            )
        student_columns = {
            row[1] for row in self.cursor.execute("PRAGMA table_info(students)")
        }
        if "admin_id" not in student_columns:
            self.cursor.execute("ALTER TABLE students ADD COLUMN admin_id INTEGER REFERENCES admins(id)")
        if "class_id" not in student_columns:
            self.cursor.execute(
                "ALTER TABLE students ADD COLUMN class_id INTEGER REFERENCES classes(class_id)"
            )
        teacher_columns = {
            row[1] for row in self.cursor.execute("PRAGMA table_info(teachers)")
        }
        if "admin_id" not in teacher_columns:
            self.cursor.execute("ALTER TABLE teachers ADD COLUMN admin_id INTEGER REFERENCES admins(id)")
        if "class_id" not in teacher_columns:
            self.cursor.execute(
                "ALTER TABLE teachers ADD COLUMN class_id INTEGER REFERENCES classes(id)"
            )
        self.cursor.execute(
            "CREATE TABLE IF NOT EXISTS organizations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL DEFAULT 'Default Organization', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
        )
        org_exists = self.cursor.execute("SELECT 1 FROM organizations LIMIT 1").fetchone()
        if org_exists is None:
            self.cursor.execute("INSERT INTO organizations (name) VALUES ('Default Organization')")
        default_org_id = self.cursor.execute("SELECT id FROM organizations ORDER BY id LIMIT 1").fetchone()[0]
        for table_name in ["admins", "students", "teachers", "classes", "courses", "exercises", "grades", "submissions", "attendance", "notifications", "teacher_classes", "learning_materials", "student_notifications"]:
            columns = {row[1] for row in self.cursor.execute(f"PRAGMA table_info({table_name})")}
            if "organization_id" not in columns:
                self.cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN organization_id INTEGER REFERENCES organizations(id)")
        admin_columns = {
            row[1] for row in self.cursor.execute("PRAGMA table_info(admins)")
        }
        if "id" not in admin_columns:
            self.cursor.execute("ALTER TABLE admins ADD COLUMN id INTEGER")
        if "password_hash" not in admin_columns:
            self.cursor.execute("ALTER TABLE admins ADD COLUMN password_hash TEXT")
        if "created_at" not in admin_columns:
            self.cursor.execute("ALTER TABLE admins ADD COLUMN created_at TEXT")
        if "organization_id" not in admin_columns:
            self.cursor.execute("ALTER TABLE admins ADD COLUMN organization_id INTEGER REFERENCES organizations(id)")
        if "admin_id" in admin_columns:
            self.cursor.execute(
                """UPDATE admins
                   SET id = COALESCE(id, admin_id),
                       password_hash = COALESCE(password_hash, password),
                       created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
                       organization_id = COALESCE(organization_id, ?)
                   WHERE id IS NULL OR password_hash IS NULL OR created_at IS NULL OR organization_id IS NULL""",
                (default_org_id,),
            )
        self.cursor.execute("UPDATE admins SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        class_columns = {
            row[1] for row in self.cursor.execute("PRAGMA table_info(classes)")
        }
        if "admin_id" not in class_columns:
            self.cursor.execute("ALTER TABLE classes ADD COLUMN admin_id INTEGER REFERENCES admins(id)")
        if "id" not in class_columns:
            self.cursor.execute("ALTER TABLE classes ADD COLUMN id INTEGER")
            if "class_id" in class_columns:
                self.cursor.execute(
                    "UPDATE classes SET id = class_id WHERE id IS NULL"
                )
        self.cursor.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_classes_canonical_id ON classes(id)"
        )
        first_admin = self.cursor.execute("SELECT id FROM admins ORDER BY id LIMIT 1").fetchone()
        if first_admin:
            admin_id = first_admin[0]
            self.cursor.execute("UPDATE classes SET admin_id = ? WHERE admin_id IS NULL", (admin_id,))
            self.cursor.execute("UPDATE teachers SET admin_id = ? WHERE admin_id IS NULL", (admin_id,))
            self.cursor.execute("UPDATE students SET admin_id = ? WHERE admin_id IS NULL", (admin_id,))
        self.cursor.execute("UPDATE classes SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        self.cursor.execute("UPDATE teachers SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        self.cursor.execute("UPDATE students SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        self.cursor.execute("UPDATE courses SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        self.cursor.execute("UPDATE exercises SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        self.cursor.execute("UPDATE submissions SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        self.cursor.execute("UPDATE grades SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        self.cursor.execute("UPDATE attendance SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        self.cursor.execute("UPDATE notifications SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        self.cursor.execute("UPDATE student_notifications SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        self.cursor.execute("UPDATE learning_materials SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        self.cursor.execute("UPDATE teacher_classes SET organization_id = ? WHERE organization_id IS NULL", (default_org_id,))
        self.cursor.execute(
            """CREATE TABLE IF NOT EXISTS teacher_classes (
                teacher_id INTEGER NOT NULL,
                class_id INTEGER NOT NULL,
                organization_id INTEGER REFERENCES organizations(id),
                PRIMARY KEY (teacher_id, class_id),
                FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            )"""
        )
        self.cursor.execute(
            """CREATE TABLE IF NOT EXISTS student_classes (
                student_id INTEGER NOT NULL,
                class_id INTEGER NOT NULL,
                PRIMARY KEY (student_id, class_id),
                FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            )"""
        )
        self.cursor.execute(
            """INSERT OR IGNORE INTO teacher_classes (teacher_id, class_id)
               SELECT teacher_id, class_id FROM teachers
               WHERE class_id IS NOT NULL"""
        )
        self.cursor.execute(
            """INSERT OR IGNORE INTO student_classes (student_id, class_id)
               SELECT student_id, class_id FROM students
               WHERE class_id IS NOT NULL"""
        )
        if "admin_id" in admin_columns and "password" in admin_columns:
            self.cursor.execute(
                """UPDATE admins
                   SET id = COALESCE(id, admin_id),
                       password_hash = COALESCE(password_hash, password),
                       created_at = COALESCE(created_at, CURRENT_TIMESTAMP)
                   WHERE id IS NULL OR password_hash IS NULL OR created_at IS NULL"""
            )
        self.connection.commit()

    def close(self):
        self.connection.close()
