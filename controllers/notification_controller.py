class NotificationController:
    def __init__(self, notification_service):
        self.notification_service = notification_service

    def __getattr__(self, name):
        return getattr(self.notification_service, name)

    def create_notification(self, title, message, teacher_id):
        return self.notification_service.create_notification(title, message, teacher_id)

    def get_admin_notifications(self, admin_id):
        return self.notification_service.get_admin_notifications(admin_id)
