from models.class_group import ClassGroup


class ClassRepo:
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

    def add_class(self, class_group, admin_id=None, organization_id=None):
        organization_id = organization_id if organization_id is not None else self._organization_for_admin(admin_id)
        next_id = self.db.cursor.execute(
            "SELECT COALESCE(MAX(id), 0) + 1 FROM classes"
        ).fetchone()[0]
        self.db.cursor.execute(
            "INSERT INTO classes (id, name, academic_year, admin_id, organization_id) VALUES (?, ?, ?, ?, ?)",
            (next_id, class_group.name, class_group.academic_year, admin_id, organization_id),
        )
        self.db.connection.commit()
        class_group.class_id = self.db.cursor.lastrowid
        class_group.organization_id = organization_id

    def get_class(self, class_id, admin_id=None, organization_id=None):
        organization_id = organization_id if organization_id is not None else self._organization_for_admin(admin_id)
        self.db.cursor.execute(
            "SELECT id, name, academic_year, admin_id, organization_id FROM classes WHERE id = ?" + (" AND (? IS NULL OR organization_id = ?)" if organization_id is not None or admin_id is not None else ""),
            (class_id, organization_id, organization_id) if organization_id is not None else (class_id,),
        )
        row = self.db.cursor.fetchone()
        if row is None:
            return None
        return ClassGroup(row[0], row[1], row[2], row[3], row[4])

    def get_all_classes(self, admin_id=None, organization_id=None):
        organization_id = organization_id if organization_id is not None else self._organization_for_admin(admin_id)
        if organization_id is not None:
            self.db.cursor.execute(
                "SELECT id, name, academic_year, admin_id, organization_id FROM classes WHERE organization_id = ? ORDER BY name",
                (organization_id,),
            )
        else:
            self.db.cursor.execute(
                "SELECT id, name, academic_year, admin_id, organization_id FROM classes ORDER BY name",
            )
        return [ClassGroup(row[0], row[1], row[2], row[3], row[4]) for row in self.db.cursor.fetchall()]

    def get_all_classes_for_admin(self, admin_id):
        organization_id = self._organization_for_admin(admin_id)
        self.db.cursor.execute(
            "SELECT id, name, academic_year, admin_id, organization_id FROM classes WHERE organization_id = ? ORDER BY name",
            (organization_id,),
        )
        return [ClassGroup(row[0], row[1], row[2], row[3], row[4]) for row in self.db.cursor.fetchall()]

    def search_classes(self, query, admin_id=None, organization_id=None):
        organization_id = organization_id if organization_id is not None else self._organization_for_admin(admin_id)
        if organization_id is not None:
            self.db.cursor.execute(
                """SELECT id, name, academic_year, admin_id, organization_id FROM classes
                    WHERE (name LIKE ? OR academic_year LIKE ?) AND organization_id = ? ORDER BY name""",
                (f"%{query}%", f"%{query}%", organization_id),
            )
        else:
            self.db.cursor.execute(
                """SELECT id, name, academic_year, admin_id, organization_id FROM classes
                    WHERE (name LIKE ? OR academic_year LIKE ?) ORDER BY name""",
                (f"%{query}%", f"%{query}%"),
            )
        return [ClassGroup(row[0], row[1], row[2], row[3], row[4]) for row in self.db.cursor.fetchall()]

    def update_class(self, class_id, admin_id=None, organization_id=None, **updates):
        organization_id = organization_id if organization_id is not None else self._organization_for_admin(admin_id)
        fields = [field for field in ("name", "academic_year") if field in updates]
        if fields:
            values = [updates[field] for field in fields] + [class_id]
            if organization_id is not None:
                values += [organization_id]
                self.db.cursor.execute(
                    f"UPDATE classes SET {', '.join(f'{field} = ?' for field in fields)} WHERE id = ? AND organization_id = ?",
                    values,
                )
            else:
                self.db.cursor.execute(
                    f"UPDATE classes SET {', '.join(f'{field} = ?' for field in fields)} WHERE id = ?",
                    values,
                )
            self.db.connection.commit()

    def delete_class(self, class_id, admin_id=None, organization_id=None):
        organization_id = organization_id if organization_id is not None else self._organization_for_admin(admin_id)
        if organization_id is not None:
            self.db.cursor.execute(
                "DELETE FROM classes WHERE id = ? AND organization_id = ?",
                (class_id, organization_id),
            )
        else:
            self.db.cursor.execute("DELETE FROM classes WHERE id = ?", (class_id,))
        deleted = self.db.cursor.rowcount > 0
        self.db.connection.commit()
        return deleted

    def belongs_to_admin(self, class_id, admin_id):
        organization_id = self._organization_for_admin(admin_id)
        return self.db.cursor.execute(
            "SELECT 1 FROM classes WHERE id = ? AND organization_id = ?", (class_id, organization_id)
        ).fetchone() is not None