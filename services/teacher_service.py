from models.teacher import Teacher
from utils.teacher_validation import TeacherValidator
from utils.security import hash_password

class TeacherService:
    def __init__(self, teacher_repo):
        self.teacher_repo = teacher_repo
        
    def create_teacher(self, full_name, email, password, phone_number, admin_id=None):
        validation = TeacherValidator()
        validation.validate_name(full_name)
        validation.validate_email(email)
        validation.validate_password(password)
        validation.validate_phone_number(phone_number)
        hashed_password = hash_password(password)
        teacher = Teacher(None, full_name, email, hashed_password, phone_number)
        self.teacher_repo.add_teacher(teacher, admin_id)
        return teacher
        

    def get_teacher(self, teacher_id, admin_id=None):
        if not isinstance(teacher_id, int):
            raise ValueError("Teacher Id must be an integer.")
        teacher = self.teacher_repo.get_teacher(teacher_id, admin_id)
        if teacher is None:
            raise ValueError("Teacher not found.")
        return teacher


    def get_all_teachers(self, admin_id=None):
        teachers = self.teacher_repo.get_all_teachers(admin_id)
        return teachers

    def assign_to_classes(self, teacher_id, class_ids):
        self.get_teacher(teacher_id)
        self.validate_class_assignments(class_ids, teacher_id)
        self.teacher_repo.assign_teacher_to_classes(teacher_id, class_ids)

    def validate_class_assignments(self, class_ids, teacher_id=None):
        if len(class_ids) != len(set(class_ids)):
            raise ValueError("Class IDs must be unique.")
        for class_id in class_ids:
            if not isinstance(class_id, int):
                raise ValueError("Class IDs must be integers.")
            assigned_teacher_id = self.teacher_repo.get_teacher_id_for_class(class_id)
            if assigned_teacher_id is not None and assigned_teacher_id != teacher_id:
                raise ValueError(
                    f"Class ID {class_id} is already assigned to another teacher."
                )
        
    def update_teacher(self, teacher_id, **kwargs):
        teacher = self.teacher_repo.get_teacher(teacher_id)

        if teacher is None:
            raise ValueError("Teacher not found.")

        if "full_name" in kwargs:
            TeacherValidator.validate_name(kwargs["full_name"])

        if "email" in kwargs:
            TeacherValidator.validate_email(kwargs["email"])

        if "password" in kwargs:
            TeacherValidator.validate_password(kwargs["password"])
            kwargs["password"] = hash_password(kwargs["password"])

        if "phone_number" in kwargs:
            TeacherValidator.validate_phone_number(kwargs["phone_number"])

        self.teacher_repo.update_teacher(
            teacher_id,
            **kwargs
        )

        return "Teacher updated successfully"
    
    def delete_teacher(self, teacher_id):
        if not isinstance(teacher_id, int):
            raise ValueError("teacher ID must be an integer")
        teacher = self.teacher_repo.get_teacher(teacher_id)
        if teacher is None:
            raise ValueError("teacher is not found.")
        self.teacher_repo.delete_teacher(teacher_id)
        return "teacher deleted successfully."
        
    def search_teacher(self, full_name, admin_id=None):
        TeacherValidator.validate_name(full_name)
        teachers = self.teacher_repo.search_teacher(full_name, admin_id)
        return teachers
    
    def count_teachers(self, admin_id=None):
        return self.teacher_repo.count_teacher(admin_id)
