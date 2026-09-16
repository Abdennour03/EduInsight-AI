from models.admin import Admin
from utils.security import hash_password


class AdminService:
    def __init__(self, admin_repo, student_service, teacher_service, class_service):
        self.admin_repo = admin_repo
        self.student_service = student_service
        self.teacher_service = teacher_service
        self.class_service = class_service

    def create_admin(self, full_name, email, password):
        if not full_name.strip() or not email.strip() or not password:
            raise ValueError("Admin name, email, and password are required.")
        admin = Admin(None, full_name.strip(), email.strip(), hash_password(password))
        self.admin_repo.add_admin(admin)
        return admin

    def setup_admin(self, full_name, email, password):
        if self.admin_repo.has_admins():
            raise ValueError(
                "The administrator account is already initialized. "
                "Students and teachers must be added by the existing administrator."
            )
        return self.create_admin(full_name, email, password)

    def get_admin(self, admin_id):
        admin = self.admin_repo.get_admin(admin_id)
        if admin is None:
            raise ValueError("Admin not found.")
        return admin

    def get_profile(self, admin_id):
        admin = self.get_admin(admin_id)
        return {
            "admin_id": admin.admin_id,
            "full_name": admin.full_name,
            "email": admin.email,
        }

    def update_profile(self, admin_id, updates):
        if not updates:
            raise ValueError("No data to update.")
        if "full_name" in updates and not updates["full_name"].strip():
            raise ValueError("Admin name is required.")
        if "email" in updates and not updates["email"].strip():
            raise ValueError("Admin email is required.")
        if "password" in updates:
            if not updates["password"]:
                raise ValueError("Admin password is required.")
            updates["password"] = hash_password(updates["password"])
        self.get_admin(admin_id)
        self.admin_repo.update_admin(admin_id, **updates)
        return self.get_profile(admin_id)

    def create_student(self, data):
        class_ids = data.class_ids or ([data.class_id] if data.class_id is not None else [])
        if not class_ids:
            raise ValueError("Please select at least one valid class.")
        classes = [self.class_service.get_class(class_id) for class_id in class_ids]
        levels = {class_group.name.strip().split()[0].upper() for class_group in classes}
        if len(levels) > 1:
            raise ValueError(
                "Impossible to combine classes from different academic levels (e.g., 3AC and 1BAC)."
            )
        student = self.student_service.create_student(
            data.full_name, data.email, data.password, data.phone_number, classes[0].name,
            class_id=class_ids[0],
        )
        self.student_service.set_student_classes(student.student_id, class_ids)
        return student

    def create_teacher(self, data):
        if data.class_ids is not None:
            for class_id in data.class_ids:
                self.class_service.get_class(class_id)
            self.teacher_service.validate_class_assignments(data.class_ids)
        teacher = self.teacher_service.create_teacher(
            data.full_name, data.email, data.password, data.phone_number
        )
        if data.class_ids is not None:
            self.assign_teacher_to_classes(teacher.teacher_id, data.class_ids)
        return teacher

    def update_student(self, student_id, updates):
        class_ids = updates.pop("class_ids", None) if "class_ids" in updates else None
        class_id = updates.pop("class_id", None) if "class_id" in updates else None
        result = self.student_service.update_student(student_id, **updates)
        if class_ids is not None:
            self._validate_student_class_levels(class_ids)
            self.student_service.set_student_classes(student_id, class_ids)
        if class_id is not None:
            self.assign_student_to_class(student_id, class_id)
        return result

    def _validate_student_class_levels(self, class_ids):
        if not class_ids:
            raise ValueError("Select at least one class.")
        levels = set()
        for class_id in class_ids:
            class_group = self.class_service.get_class(class_id)
            level = class_group.name.strip().split()[0].upper()
            levels.add(level)
        if len(levels) > 1:
            raise ValueError(
                "Impossible to combine classes from different academic levels (e.g., 3AC and 1BAC)."
            )

    def update_teacher(self, teacher_id, updates):
        class_ids = updates.pop("class_ids", None) if "class_ids" in updates else None
        result = self.teacher_service.update_teacher(teacher_id, **updates)
        if class_ids is not None:
            self.assign_teacher_to_classes(teacher_id, class_ids)
        return result

    def assign_student_to_class(self, student_id, class_id):
        self.class_service.get_class(class_id)
        self.student_service.assign_to_class(student_id, class_id)
        return "Student assigned to class successfully."

    def assign_teacher_to_classes(self, teacher_id, class_ids):
        for class_id in class_ids:
            self.class_service.get_class(class_id)
        self.teacher_service.assign_to_classes(teacher_id, class_ids)
        return "Teacher assigned to classes successfully."

    def get_student_report(self, student_id):
        return self.student_service.get_academic_report(student_id)