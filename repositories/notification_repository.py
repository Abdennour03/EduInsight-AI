from models.notification import Notification
from models.teacher import Teacher
from models.admin import Admin


class NotificationRepo:

    def __init__(self, db):
        self.db = db


    def add_notification(self, notification):

        self.db.cursor.execute("""
            INSERT INTO notifications
            (title, message, sender_id, admin_id, sender_type, created_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            notification.title,
            notification.message,
            notification.sender.teacher_id if notification.sender else notification.admin_sender.id,
            notification.admin_sender.admin_id if notification.admin_sender else None,
            "admin" if notification.admin_sender else "teacher",
        ))

        self.db.connection.commit()

        notification.notification_id = self.db.cursor.lastrowid


    def get_notification(self, notification_id):

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

            JOIN teachers
                ON notifications.sender_id = teachers.teacher_id
            LEFT JOIN admins
                ON notifications.admin_id = admins.id

            WHERE notifications.notification_id = ?
        """, (notification_id,))

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
        )


    def get_all_notifications(self):

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

            JOIN teachers
                ON notifications.sender_id = teachers.teacher_id
            LEFT JOIN admins
                ON notifications.admin_id = admins.id
        """)

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


    def update_notification(self, notification_id, **kwargs):

        if "title" in kwargs:

            self.db.cursor.execute("""
                UPDATE notifications
                SET title = ?
                WHERE notification_id = ?
            """, (
                kwargs["title"],
                notification_id
            ))


        if "message" in kwargs:

            self.db.cursor.execute("""
                UPDATE notifications
                SET message = ?
                WHERE notification_id = ?
            """, (
                kwargs["message"],
                notification_id
            ))


        if "sender" in kwargs:

            self.db.cursor.execute("""
                UPDATE notifications
                SET sender_id = ?
                WHERE notification_id = ?
            """, (
                kwargs["sender"].teacher_id,
                notification_id
            ))


        if "created_at" in kwargs:

            self.db.cursor.execute("""
                UPDATE notifications
                SET created_at = ?
                WHERE notification_id = ?
            """, (
                kwargs["created_at"],
                notification_id
            ))


        self.db.connection.commit()

        return True


    def delete_notification(self, notification_id):

        notification = self.get_notification(notification_id)

        if notification is None:
            return False

        self.db.cursor.execute("""
            DELETE FROM notifications
            WHERE notification_id = ?
        """, (notification_id,))

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


    def count_notifications(self):

        self.db.cursor.execute("""
            SELECT COUNT(*)
            FROM notifications
        """)

        result = self.db.cursor.fetchone()

        return result[0]