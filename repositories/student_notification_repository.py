from models.student_notification import StudentNotification


class StudentNotificationRepo:

    def __init__(self, db, student_repo, notification_repo):
        self.db = db
        self.student_repo = student_repo
        self.notification_repo = notification_repo


    def add_student_notification(self, student_notification):
        organization_id = getattr(student_notification.student, "organization_id", None)

        self.db.cursor.execute("""
            INSERT INTO student_notifications
            (student_id, notification_id, is_read, organization_id)
            VALUES (?, ?, ?, ?)
        """, (
            student_notification.student.student_id,
            student_notification.notification.notification_id,
            int(student_notification.is_read),
            organization_id,
        ))

        self.db.connection.commit()

        student_notification.student_notification_id = (
            self.db.cursor.lastrowid
        )


    def get_notifications_for_student(self, student_id, organization_id=None):

        self.db.cursor.execute("""
            SELECT
                student_notification_id,
                student_id,
                notification_id,
                is_read, organization_id
            FROM student_notifications
            WHERE student_id = ?""" + (" AND organization_id = ?" if organization_id is not None else ""),
            (student_id, organization_id) if organization_id is not None else (student_id,))

        rows = self.db.cursor.fetchall()

        result = []

        for row in rows:

            notification_id = row[2]

            self.db.cursor.execute("""
                SELECT
                    notification_id,
                    title,
                    message,
                    sender_id,
                    created_at
                FROM notifications
                WHERE notification_id = ?
            """, (notification_id,))

            notification_row = self.db.cursor.fetchone()

            if notification_row is None:
                continue

            notification = self.notification_repo.get_notification(notification_id, organization_id)

            student = self.student_repo.get_student(
                row[1],
                organization_id=organization_id,
            )

            if student is None:
                continue

            student_notification = StudentNotification(
                row[0],
                student,
                notification,
                bool(row[3])
            )

            result.append(student_notification)

        return result


    def mark_as_read(self, student_notification_id, student_id=None, organization_id=None):

        self.db.cursor.execute("""
            UPDATE student_notifications
            SET is_read = 1
            WHERE student_notification_id = ?"""
            + (" AND student_id = ?" if student_id is not None else "")
            + (" AND organization_id = ?" if organization_id is not None else ""),
            tuple(value for value in (student_notification_id, student_id, organization_id) if value is not None),
        )

        self.db.connection.commit()

        return self.db.cursor.rowcount > 0