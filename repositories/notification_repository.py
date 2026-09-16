from models.notification import Notification
from models.teacher import Teacher
from models.admin import Admin


class NotificationRepo:

    def __init__(self, db):
        self.db = db


    def add_notification(self, notification):
        organization_id = getattr(notification, "organization_id", None)
        if organization_id is None:
            sender = notification.sender or notification.admin_sender
            organization_id = getattr(sender, "organization_id", None)

        self.db.cursor.execute("""
            INSERT INTO notifications
            (title, message, sender_id, admin_id, sender_type, created_at, organization_id)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        """, (
            notification.title,
            notification.message,
            notification.sender.teacher_id if notification.sender else notification.admin_sender.id,
            notification.admin_sender.admin_id if notification.admin_sender else None,
            "admin" if notification.admin_sender else "teacher",
            organization_id,
        ))

        self.db.connection.commit()

        notification.notification_id = self.db.cursor.lastrowid


    def get_notification(self, notification_id, organization_id=None):

        self.db.cursor.execute("""
            SELECT
                notifications.notification_id,
                notifications.title,
                notifications.message,
                notifications.sender_id,
                notifications.created_at,
                notifications.admin_id,
                notifications.sender_type,
                teachers.full_name,
                teachers.email,
                teachers.password,
                teachers.phone_number,
                admins.full_name,
                notifications.organization_id
            FROM notifications

            JOIN teachers
                ON notifications.sender_id = teachers.teacher_id
            LEFT JOIN admins
                ON notifications.admin_id = admins.id

            WHERE notifications.notification_id = ?""" + (" AND notifications.organization_id = ?" if organization_id is not None else ""),
            (notification_id, organization_id) if organization_id is not None else (notification_id,))

        row = self.db.cursor.fetchone()

        if row is None:
            return None

        teacher = Teacher(row[3], row[7], row[8], row[9], row[10])
        admin = Admin(row[5], row[11], "", "") if row[6] == "admin" else None
        return Notification(
            row[0],
            row[1],
            row[2],
            teacher,
            None,
            row[4],
            admin_sender=admin,
            organization_id=row[12],
        )


    def get_all_notifications(self, organization_id=None):

        self.db.cursor.execute("""
            SELECT
                notifications.notification_id,
                notifications.title,
                notifications.message,
                notifications.sender_id,
                notifications.created_at,
                notifications.admin_id,
                notifications.sender_type,
                teachers.full_name,
                teachers.email,
                teachers.password,
                teachers.phone_number,
                admins.full_name,
                notifications.organization_id
            FROM notifications

            JOIN teachers
                ON notifications.sender_id = teachers.teacher_id
            LEFT JOIN admins
                ON notifications.admin_id = admins.id
        """ + (" WHERE notifications.organization_id = ?" if organization_id is not None else ""),
            (organization_id,) if organization_id is not None else ())

        rows = self.db.cursor.fetchall()

        notifications = []

        for row in rows:

            teacher = Teacher(row[3], row[7], row[8], row[9], row[10])

            admin = Admin(row[5], row[11], "", "") if row[6] == "admin" else None
            notification = Notification(
                                row[0],
                                row[1],
                                row[2],
                                teacher,
                                None,
                                row[4],
                                admin_sender=admin,
                                organization_id=row[12],
                            )

            notifications.append(notification)

        return notifications

    def get_admin_notifications(self, admin_id):
        self.db.cursor.execute("""
            SELECT
                notifications.notification_id,
                notifications.title,
                notifications.message,
                notifications.sender_id,
                notifications.created_at,
                notifications.admin_id,
                notifications.sender_type,
                teachers.full_name,
                teachers.email,
                teachers.password,
                teachers.phone_number,
                admins.full_name
            FROM notifications
            JOIN teachers ON notifications.sender_id = teachers.teacher_id
            JOIN admins ON notifications.admin_id = admins.id
            WHERE notifications.sender_type = 'admin'
              AND notifications.admin_id = ?
            ORDER BY notifications.created_at DESC
        """, (admin_id,))

        notifications = []
        for row in self.db.cursor.fetchall():
            teacher = Teacher(row[3], row[7], row[8], row[9], row[10])
            admin = Admin(row[5], row[11], "", "")
            notifications.append(Notification(
                row[0], row[1], row[2], teacher, None, row[4], admin_sender=admin
            ))
        return notifications


    def update_notification(self, notification_id, organization_id=None, **kwargs):
        fields = {
            "title": kwargs.get("title"),
            "message": kwargs.get("message"),
            "sender_id": kwargs["sender"].teacher_id if "sender" in kwargs else None,
            "created_at": kwargs.get("created_at"),
        }
        for field, value in fields.items():
            if value is None:
                continue
            sql = f"UPDATE notifications SET {field} = ? WHERE notification_id = ?"
            values = [value, notification_id]
            if organization_id is not None:
                sql += " AND organization_id = ?"
                values.append(organization_id)
            self.db.cursor.execute(sql, values)


        self.db.connection.commit()

        return True


    def delete_notification(self, notification_id, organization_id=None):

        notification = self.get_notification(notification_id, organization_id)

        if notification is None:
            return False

        self.db.cursor.execute("""
            DELETE FROM notifications
            WHERE notification_id = ?""" + (" AND organization_id = ?" if organization_id is not None else ""),
            (notification_id, organization_id) if organization_id is not None else (notification_id,))

        self.db.connection.commit()

        return True


    def search_notification(self, query):

        self.db.cursor.execute("""
            SELECT
                notifications.notification_id,
                notifications.title,
                notifications.message,
                notifications.sender_id,
                notifications.created_at,
                teachers.full_name,
                teachers.email,
                teachers.password,
                teachers.phone_number
            FROM notifications

            JOIN teachers
                ON notifications.sender_id = teachers.teacher_id

            WHERE notifications.title LIKE ?
               OR notifications.message LIKE ?
        """, (
            f"%{query}%",
            f"%{query}%"
        ))

        rows = self.db.cursor.fetchall()

        notifications = []

        for row in rows:

            teacher = Teacher(
                row[3],
                row[5],
                row[6],
                row[7],
                row[8]
            )

            notification = Notification(
                    row[0],
                    row[1],
                    row[2],
                    teacher,
                    None,
                    row[4]
                )

            notifications.append(notification)

        return notifications


    def count_notifications(self, organization_id=None):
        self.db.cursor.execute(
            "SELECT COUNT(*) FROM notifications" + (" WHERE organization_id = ?" if organization_id is not None else ""),
            (organization_id,) if organization_id is not None else (),
        )

        result = self.db.cursor.fetchone()

        return result[0]