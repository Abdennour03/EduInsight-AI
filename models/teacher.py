class Teacher:
    def __init__(self, teacher_id, full_name, email, password, phone_number, classes=None, admin_id=None):
            self.teacher_id = teacher_id
            self.full_name = full_name
            self.email = email
            self.password = password
            self.phone_number = phone_number
            self.classes = classes or []
            self.admin_id = admin_id
