from models.admin import Admin


class AdminRepo:
    def __init__(self, db):
        self.db = db

    def add_admin(self, admin):
        columns = {row[1] for row in self.db.cursor.execute("PRAGMA table_info(admins)")}
        next_id = self.db.cursor.execute(
            "SELECT COALESCE(MAX(id), 0) + 1 FROM admins"
        ).fetchone()[0]
        organization_id = getattr(admin, "organization_id", None)
        if organization_id is None:
            organization_id = self.db.cursor.execute(
                "SELECT id FROM organizations ORDER BY id LIMIT 1"
            ).fetchone()
            organization_id = organization_id[0] if organization_id else None
        if "password" in columns:
            self.db.cursor.execute(
                """INSERT INTO admins
                   (id, full_name, email, password, password_hash, created_at, organization_id)
                   VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)""",
                (next_id, admin.full_name, admin.email, admin.password, admin.password, organization_id),
            )
        else:
            self.db.cursor.execute(
                "INSERT INTO admins (id, full_name, email, password_hash, organization_id) VALUES (?, ?, ?, ?, ?)",
                (next_id, admin.full_name, admin.email, admin.password, organization_id),
            )
        self.db.connection.commit()
        admin.admin_id = next_id
        admin.id = admin.admin_id
        admin.organization_id = organization_id

    def get_admin(self, admin_id):
        self.db.cursor.execute(
            "SELECT id, full_name, email, password_hash, created_at, organization_id FROM admins WHERE id = ?",
            (admin_id,),
        )
        row = self.db.cursor.fetchone()
        return Admin(row[0], row[1], row[2], row[3], row[4], row[5]) if row else None

    def get_admin_by_email(self, email):
        self.db.cursor.execute(
            "SELECT id, full_name, email, password_hash, created_at, organization_id FROM admins WHERE email = ?",
            (email,),
        )
        row = self.db.cursor.fetchone()
        return Admin(row[0], row[1], row[2], row[3], row[4], row[5]) if row else None

    def has_admins(self):
        return self.db.cursor.execute("SELECT 1 FROM admins LIMIT 1").fetchone() is not None

    def get_all_admins(self):
        self.db.cursor.execute(
            "SELECT id, full_name, email, password_hash, created_at, organization_id FROM admins"
        )
        return [Admin(row[0], row[1], row[2], row[3], row[4], row[5]) for row in self.db.cursor.fetchall()]

    def update_admin(self, admin_id, **updates):
        fields = [field for field in ("full_name", "email", "password_hash") if field in updates]
        if "password" in updates:
            updates["password_hash"] = updates.pop("password")
            fields = [field for field in ("full_name", "email", "password_hash") if field in updates]
        if fields:
            values = [updates[field] for field in fields] + [admin_id]
            self.db.cursor.execute(
                f"UPDATE admins SET {', '.join(f'{field} = ?' for field in fields)} WHERE id = ?",
                values,
            )
            self.db.connection.commit()