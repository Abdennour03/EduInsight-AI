from models.teacher import Teacher
from models.class_group import ClassGroup

class TeacherRepo:
    def __init__(self, db):
        self.db = db

    def _organization_for_admin(self, admin_id):
        if admin_id is None:
            return None
        row = self.db.cursor.execute(
            "SELECT organization_id FROM admins WHERE id = ?",
            (admin_id,),
        ).fetchone()
        return row[0] if row else None

    def _classes_for_teacher(self, teacher_id, organization_id=None):
        self.db.cursor.execute(
            """SELECT c.id, c.name, c.academic_year
               FROM classes c
               JOIN teacher_classes tc ON tc.class_id = c.id
               WHERE tc.teacher_id = ?""" + (" AND (tc.organization_id = ? OR ? IS NULL)" if organization_id is not None else ""),
            (teacher_id, organization_id, organization_id) if organization_id is not None else (teacher_id,),
        )
        return [ClassGroup(*row) for row in self.db.cursor.fetchall()]

    def _teacher_from_row(self, row, organization_id=None):
        teacher = Teacher(row[0], row[1], row[2], row[3], row[4], organization_id=row[5] if len(row) > 5 else None)
        teacher.classes = self._classes_for_teacher(teacher.teacher_id, organization_id)
        return teacher

    def add_teacher(self, teacher, admin_id=None, organization_id=None):
        organization_id = organization_id if organization_id is not None else self._organization_for_admin(admin_id)
        self.db.cursor.execute(
                """INSERT INTO teachers (full_name, email, password, phone_number, admin_id, organization_id)
                    VALUES (?, ?, ?, ?, ?, ?)""",
                (teacher.full_name, teacher.email, teacher.password, teacher.phone_number, admin_id, organization_id),
        )
        self.db.connection.commit()
        teacher.teacher_id = self.db.cursor.lastrowid
        teacher.organization_id = organization_id
        teacher.classes = []

    def get_teacher(self, teacher_id, admin_id=None, organization_id=None):
        organization_id = organization_id if organization_id is not None else self._organization_for_admin(admin_id)
        self.db.cursor.execute(
                """SELECT teacher_id, full_name, email, password, phone_number, organization_id
                    FROM teachers WHERE teacher_id = ?""" + (" AND (? IS NULL OR organization_id = ?)" if organization_id is not None else ""),
                (teacher_id, organization_id, organization_id) if organization_id is not None else (teacher_id,),
        )
        row = self.db.cursor.fetchone()
        return self._teacher_from_row(row, organization_id) if row else None

    def get_all_teachers(self, admin_id=None, organization_id=None):
        organization_id = organization_id if organization_id is not None else self._organization_for_admin(admin_id)
        if organization_id is not None:
            self.db.cursor.execute(
                """SELECT teacher_id, full_name, email, password, phone_number, organization_id
                   FROM teachers WHERE organization_id = ? ORDER BY full_name""", (organization_id,)
            )
        elif admin_id is not None:
            self.db.cursor.execute(
                """SELECT teacher_id, full_name, email, password, phone_number, organization_id
                   FROM teachers WHERE admin_id = ? ORDER BY full_name""", (admin_id,)
            )
        else:
            self.db.cursor.execute(
                """SELECT teacher_id, full_name, email, password, phone_number, organization_id
                   FROM teachers ORDER BY full_name"""
            )
        return [self._teacher_from_row(row, organization_id) for row in self.db.cursor.fetchall()]

    def get_all_teachers_for_admin(self, admin_id):
        organization_id = self._organization_for_admin(admin_id)
        self.db.cursor.execute(
            """SELECT teacher_id, full_name, email, password, phone_number, organization_id
               FROM teachers WHERE organization_id = ? ORDER BY full_name""",
            (organization_id,),
        )
        return [self._teacher_from_row(row, organization_id) for row in self.db.cursor.fetchall()]

    def get_teacher_id_for_class(self, class_id, organization_id=None):
        if organization_id is not None:
            self.db.cursor.execute(
                "SELECT teacher_id FROM teacher_classes WHERE class_id = ? AND organization_id = ?",
                (class_id, organization_id),
            )
        else:
            self.db.cursor.execute(
                "SELECT teacher_id FROM teacher_classes WHERE class_id = ?",
                (class_id,),
            )
        row = self.db.cursor.fetchone()
        return row[0] if row else None

    def update_teacher(self, teacher_id, **kwargs):
        fields = [field for field in ("full_name", "email", "password", "phone_number") if field in kwargs]
        if fields:
            values = [kwargs[field] for field in fields] + [teacher_id]
            self.db.cursor.execute(
                f"UPDATE teachers SET {', '.join(f'{field} = ?' for field in fields)} WHERE teacher_id = ?",
                values,
            )
            self.db.connection.commit()
        return True

    def assign_teacher_to_classes(self, teacher_id, class_ids):
        self.db.cursor.execute(
            "DELETE FROM teacher_classes WHERE teacher_id = ?", (teacher_id,)
        )
        self.db.cursor.executemany(
            "INSERT INTO teacher_classes (teacher_id, class_id) VALUES (?, ?)",
            [(teacher_id, class_id) for class_id in class_ids],
        )
        self.db.connection.commit()

    def delete_teacher(self, teacher_id):
        if self.get_teacher(teacher_id) is None:
            return False
        self.db.cursor.execute("DELETE FROM teachers WHERE teacher_id = ?", (teacher_id,))
        self.db.connection.commit()
        return True

    def belongs_to_admin(self, teacher_id, admin_id):
        organization_id = self._organization_for_admin(admin_id)
        return self.db.cursor.execute(
            "SELECT 1 FROM teachers WHERE teacher_id = ? AND organization_id = ?",
            (teacher_id, organization_id),
        ).fetchone() is not None

    def search_teacher(self, full_name, admin_id=None):
        organization_id = self._organization_for_admin(admin_id)
        self.db.cursor.execute(
                """SELECT teacher_id, full_name, email, password, phone_number
                    FROM teachers WHERE full_name LIKE ?""" + (" AND organization_id = ?" if organization_id is not None else "") + " ORDER BY full_name",
                (f"%{full_name}%", organization_id) if organization_id is not None else (f"%{full_name}%",),
        )
        return [self._teacher_from_row(row) for row in self.db.cursor.fetchall()]

    def count_teacher(self, admin_id=None):
        organization_id = self._organization_for_admin(admin_id)
        self.db.cursor.execute("SELECT COUNT(*) FROM teachers" + (" WHERE organization_id = ?" if organization_id is not None else ""), (organization_id,) if organization_id is not None else ())
        return self.db.cursor.fetchone()[0]

    def get_teacher_by_email(self, email):
        self.db.cursor.execute(
            """SELECT teacher_id, full_name, email, password, phone_number
               FROM teachers WHERE email = ?""",
            (email,),
        )
        row = self.db.cursor.fetchone()
        return self._teacher_from_row(row) if row else None