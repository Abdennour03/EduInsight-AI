class StudentController:
    def __init__(self, student_service):
        self.student_service = student_service

    def create_student(self, full_name, email, password, phone_number, level, class_id=None):
        return self.student_service.create_student(full_name, email, password, phone_number, level, class_id)

    def get_student(self, student_id, admin_id=None):
        return self.student_service.get_student(student_id, admin_id)

    def get_all_students(self):
        return self.student_service.get_all_students()

    def get_students_by_level(self, level):
        return self.student_service.get_students_by_level(level)

    def get_students_by_class_ids(self, class_ids):
        return self.student_service.get_students_by_class_ids(class_ids)

    def get_my_exercises(self, student_id, class_id, organization_id=None):
        return self.student_service.get_my_exercises(student_id, class_id, organization_id)
    
    def update_student(self, student_id, **kwargs):
        return self.student_service.update_student(student_id, **kwargs)

    def delete_student(self, student_id):
        return self.student_service.delete_student(student_id)
    
    def search_student(self, full_name, admin_id=None):
        return self.student_service.search_student(full_name, admin_id)

    def count_students(self, admin_id=None):
        return self.student_service.count_students(admin_id)

    def get_my_profile(self, current_user):
        return self.student_service.get_my_profile(current_user)

    def update_my_profile(self, current_user, updates):
        return self.student_service.update_my_profile(current_user, updates)