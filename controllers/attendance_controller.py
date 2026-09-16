class AttendanceController:
    def __init__(self, attendance_service):
        self.attendance_service = attendance_service

    def get_class_students(self, teacher_id, class_id, organization_id=None):
        return self.attendance_service.get_class_students(teacher_id, class_id, organization_id)

    def save_attendance(self, teacher_id, class_id, attendance_date, records, organization_id=None):
        return self.attendance_service.save_attendance(
            teacher_id, class_id, attendance_date, records, organization_id
        )

    def get_teacher_history(self, teacher_id, class_id=None, month=None, organization_id=None):
        return self.attendance_service.get_teacher_history(teacher_id, class_id, month, organization_id)

    def get_monthly_report(self, class_id, month, organization_id=None):
        return self.attendance_service.get_monthly_report(class_id, month, organization_id)
