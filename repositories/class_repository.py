from models.class_group import ClassGroup


class ClassRepo:
    def __init__(self, db):
        self.db = db

    def add_class(self, class_group, admin_id=None):
        next_id = self.db.cursor.execute(
            "SELECT COALESCE(MAX(id), 0) + 1 FROM classes"
        ).fetchone()[0]
        self.db.cursor.execute(
            "INSERT INTO classes (id, name, academic_year, admin_id) VALUES (?, ?, ?, ?)",
            (next_id, class_group.name, class_group.academic_year, admin_id),
        )
        self.db.connection.commit()
        class_group.class_id = self.db.cursor.lastrowid

    def get_class(self, class_id, admin_id=None):
        self.db.cursor.execute(
            "SELECT id, name, academic_year, admin_id FROM classes WHERE id = ?" + (" AND admin_id = ?" if admin_id is not None else ""),
            (class_id, admin_id) if admin_id is not None else (class_id,),
        )
        row = self.db.cursor.fetchone()
        return ClassGroup(*row) if row else None

    def get_all_classes(self, admin_id=None):
        self.db.cursor.execute(
            "SELECT id, name, academic_year, admin_id FROM classes" + (" WHERE admin_id = ?" if admin_id is not None else "") + " ORDER BY name",
            (admin_id,) if admin_id is not None else (),
        )
        return [ClassGroup(*row) for row in self.db.cursor.fetchall()]

    def search_classes(self, query, admin_id=None):
        self.db.cursor.execute(
                """SELECT id, name, academic_year FROM classes
                    WHERE (name LIKE ? OR academic_year LIKE ?)""" + (" AND admin_id = ?" if admin_id is not None else "") + " ORDER BY name",
                (f"%{query}%", f"%{query}%", admin_id) if admin_id is not None else (f"%{query}%", f"%{query}%"),
        )
        return [ClassGroup(*row) for row in self.db.cursor.fetchall()]

    def update_class(self, class_id, admin_id=None, **updates):
        fields = [field for field in ("name", "academic_year") if field in updates]
        if fields:
            values = [updates[field] for field in fields] + [class_id]
            self.db.cursor.execute(
                f"UPDATE classes SET {', '.join(f'{field} = ?' for field in fields)} WHERE id = ?" + (" AND admin_id = ?" if admin_id is not None else ""),
                values + ([admin_id] if admin_id is not None else []),
            )
            self.db.connection.commit()

    def delete_class(self, class_id, admin_id=None):
        self.db.cursor.execute(
            "DELETE FROM classes WHERE id = ?" + (" AND admin_id = ?" if admin_id is not None else ""),
            (class_id, admin_id) if admin_id is not None else (class_id,),
        )
        deleted = self.db.cursor.rowcount > 0
        self.db.connection.commit()
        return deleted

    def belongs_to_admin(self, class_id, admin_id):
        return self.db.cursor.execute(
            "SELECT 1 FROM classes WHERE id = ? AND admin_id = ?", (class_id, admin_id)
        ).fetchone() is not None