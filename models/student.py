class Student:
    def __init__(self, student_id, full_name, email, password, phone_number, level, class_id=None, class_ids=None):
        self.student_id = student_id
        self.full_name = full_name
        self.email = email
        self.password = password
        self.phone_number = phone_number
        self.level = level
        self.class_id = class_id
        self.class_ids = class_ids or ([class_id] if class_id is not None else [])