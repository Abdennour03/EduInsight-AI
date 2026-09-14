from models.admin import Admin


class AdminRepo:
    def __init__(self, db):
        self.db = db

    def add_admin(self, admin):
        columns = {row[1] for row in self.db.cursor.execute("PRAGMA table_info(admins)")}
        next_id = self.db.cursor.execute(
            "SELECT COALESCE(MAX(id), 0) + 1 FROM admins"
        ).fetchone()[0]
        if "password" in columns:
            self.db.cursor.execute(
                """INSERT INTO admins
                   (id, full_name, email, password, password_hash, created_at)
                   VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                (next_id, admin.full_name, admin.email, admin.password, admin.password),
            )
        else:
            self.db.cursor.execute(
                "INSERT INTO admins (id, full_name, email, password_hash) VALUES (?, ?, ?, ?)",
                (next_id, admin.full_name, admin.email, admin.password),
            )
        self.db.connection.commit()
        admin.admin_id = next_id
        admin.id = admin.admin_id

    def get_admin(self, admin_id):
        self.db.cursor.execute(
            "SELECT id, full_name, email, password_hash, created_at FROM admins WHERE id = ?",
            (admin_id,),
        )
        row = self.db.cursor.fetchone()
        return Admin(row[0], row[1], row[2], row[3], row[4]) if row else None

    def get_admin_by_email(self, email):
        self.db.cursor.execute(
            "SELECT id, full_name, email, password_hash, created_at FROM admins WHERE email = ?",
            (email,),
        )
        row = self.db.cursor.fetchone()
        return Admin(row[0], row[1], row[2], row[3], row[4]) if row else None

    def has_admins(self):
        return self.db.cursor.execute("SELECT 1 FROM admins LIMIT 1").fetchone() is not None

    def get_all_admins(self):
        self.db.cursor.execute(
            "SELECT id, full_name, email, password_hash, created_at FROM admins"
        )
        return [Admin(row[0], row[1], row[2], row[3], row[4]) for row in self.db.cursor.fetchall()]

    def update_admin(self, admin_id, **updates):
        fields = [field for field in ("full_name", "email", "password_hash") if field in updates]
        if "password" in updates:
            updates["password_hash"] = updates.pop("password")
            fields = [field for field in ("full_name", "email", "password_hash") if field in updates]
        if fields:
            values = [updates[field] for field in fields] + [admin_id]
            self.db.cursor.execute(
                f"UPDATE admins SET {', '.join(f'{field} = ?' for field in fields)} WHERE admin_id = ?",
                values,
            )
            self.db.connection.commit()