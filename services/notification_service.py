from datetime import datetime

from models.notification import Notification
from models.student_notification import StudentNotification
from utils.notification_validation import NotificationValidator


class NotificationService:
    def __init__(self, notification_repo, student_notification_repo, teacher_repo, student_repo):
        self.notification_repo = notification_repo
        self.student_notification_repo = student_notification_repo
        self.teacher_repo = teacher_repo
        self.student_repo = student_repo

    def create_notification(self, title, message, teacher_id):
        NotificationValidator.validation_title(title)
        NotificationValidator.validation_message(message)
        if not isinstance(teacher_id, int):
            raise ValueError("Teacher ID must be an integer.")
        teacher = self.teacher_repo.get_teacher(teacher_id)
        if teacher is None:
            raise ValueError("Teacher not found.")
        notification = Notification(None, title, message, teacher, None, datetime.now())
        self.notification_repo.add_notification(notification)
        return notification

    def send_to_student(self, notification, student_id):
        if not isinstance(student_id, int):
            raise ValueError("Student ID must be an integer.")
        student = self.student_repo.get_student(student_id)
        if student is None:
            raise ValueError("Student not found.")
        self.student_notification_repo.add_student_notification(StudentNotification(None, student, notification))
        return "Notification sent to student."

    def send_to_all_students(self, notification):
        students = self.student_repo.get_all_student()
        if not students:
            raise ValueError("No students found.")
        for student in students:
            self.student_notification_repo.add_student_notification(StudentNotification(None, student, notification))
        return "Notification sent to all students."

    def send_notification_to_students(self, teacher_id, title, message):
        notification = self.create_notification(title, message, teacher_id)
        return self.send_to_all_students(notification)

    def send_notification_to_class_students(self, teacher_id, class_ids, title, message):
        """Send a broadcast notification only to students enrolled in the given classes."""
        notification = self.create_notification(title, message, teacher_id)
        students = []
        for class_id in class_ids:
            class_students = self.student_repo.get_students_by_class_id(class_id)
            students.extend(class_students)
        if not students:
            raise ValueError("No students found in your assigned classes.")
        for student in students:
            self.student_notification_repo.add_student_notification(
                StudentNotification(None, student, notification)
            )
        return f"Announcement sent to {len(students)} student(s) in your classes."

    def send_notification_to_student(self, teacher_id, student_id, title, message):
        notification = self.create_notification(title, message, teacher_id)
        return self.send_to_student(notification, student_id)

    def get_notification(self, notification_id):
        notification = self.notification_repo.get_notification(notification_id)
        if notification is None:
            raise ValueError("Notification not found.")
        return notification

    def get_all_notifications(self):
        return self.notification_repo.get_all_notifications()

    def update_notification(self, notification_id, **kwargs):
        self.get_notification(notification_id)
        if "title" in kwargs:
            NotificationValidator.validation_title(kwargs["title"])
        if "message" in kwargs:
            NotificationValidator.validation_message(kwargs["message"])
        self.notification_repo.update_notification(notification_id, **kwargs)
        return "Notification updated successfully."

    def search_notification(self, query):
        if not query.strip():
            raise ValueError("Search query cannot be empty.")
        return self.notification_repo.search_notification(query.strip())

    def count_notifications(self):
        return self.notification_repo.count_notifications()

    def get_student_notifications(self, student_id):
        if self.student_repo.get_student(student_id) is None:
            raise ValueError("Student not found.")
        return self.student_notification_repo.get_notifications_for_student(student_id)

    def mark_as_read(self, student_notification_id):
        if not self.student_notification_repo.mark_as_read(student_notification_id):
            raise ValueError("Student notification not found.")
        return "Notification marked as read."
