class TeacherController:
    def __init__(self, teacher_service):
        self.teacher_service = teacher_service
        
    def create_teacher(self, full_name, email, password, phone_number):
        return self.teacher_service.create_teacher(full_name, email, password, phone_number)

    def get_teacher(self, teacher_id, admin_id=None):
        return self.teacher_service.get_teacher(teacher_id, admin_id)

    def get_all_teachers(self):
        return self.teacher_service.get_all_teachers()
        
    def update_teacher(self, teacher_id, **kwargs):
        return self.teacher_service.update_teacher(teacher_id, **kwargs)
    
    def delete_teacher(self, teacher_id):
        return self.teacher_service.delete_teacher(teacher_id)
        
    def search_teacher(self, full_name, admin_id=None):
        return self.teacher_service.search_teacher(full_name, admin_id)
    
    def count_teachers(self, admin_id=None):
        return self.teacher_service.count_teachers(admin_id)

    def assign_teacher_to_classes(self, teacher_id, class_ids):
        return self.teacher_service.assign_to_classes(teacher_id, class_ids)