from models.student import Student
from utils.student_validation import StudentValidator
from utils.security import hash_password

class StudentService:
    def __init__(self, student_repo, exercise_repo):
        self.student_repo = student_repo
        self.exercise_repo = exercise_repo

    def create_student(self, full_name, email, password, phone_number, level, class_id=None, admin_id=None):
        validation = StudentValidator()
        validation.validate_name(full_name)
        validation.validate_email(email)
        validation.validate_password(password)
        validation.validate_phone_number(phone_number)
        validation.validate_level(level)
        hashed_password = hash_password(password)
        student = Student(None, full_name, email, hashed_password, phone_number, level, class_id)
        self.student_repo.add_student(student, admin_id)
        return student

    def get_student(self, student_id, admin_id=None):
        if not isinstance(student_id, int):
            raise ValueError("student Id must be an integer.")
        student = self.student_repo.get_student(student_id, admin_id)
        if student is None:
            raise ValueError("student not found.")
        return student

    def get_all_students(self, admin_id=None):
        students = self.student_repo.get_all_student(admin_id)
        for student in students:
            student.class_ids = self.student_repo.get_student_class_ids(student.student_id)
        return students

    def set_student_classes(self, student_id, class_ids):
        self.get_student(student_id)
        self.student_repo.set_student_class_ids(student_id, class_ids)

    def get_students_by_level(self, level):
        if not isinstance(level, str):
            raise ValueError("Level must be a string.")
        return self.student_repo.get_students_by_level(level)

    def get_students_by_class_ids(self, class_ids):
        if not all(isinstance(class_id, int) for class_id in class_ids):
            raise ValueError("Class IDs must be integers.")
        return self.student_repo.get_students_by_class_ids(class_ids)

    def get_my_exercises(self, student_id, class_id, organization_id=None):
        if not isinstance(student_id, int):
            raise ValueError("Student ID must be an integer.")
        # If class_id is None (new student without class assignment),
        # fall back to the student's level to fetch exercises.
        if class_id is None:
            # Retrieve the student to know their level.
            student = self.get_student(student_id)
            # Try to use class_id if the student already has one.
            if student.class_id:
                class_id = student.class_id
            else:
                # No class_id – use the level string to fetch exercises.
                return self.exercise_repo.get_exercises_by_level_for_student(
                    student.level, student_id, organization_id
                )
        # Existing behavior: if class_id is a string (treated as level)
        if isinstance(class_id, str):
            return self.exercise_repo.get_exercises_by_level_for_student(
                class_id, student_id, organization_id
            )
        # At this point class_id should be an integer.
        if not isinstance(class_id, int):
            raise ValueError("Class ID must be an integer.")
        return self.exercise_repo.get_exercises_by_class_id_for_student(
            class_id, student_id, organization_id
        )

    def assign_to_class(self, student_id, class_id):
        self.get_student(student_id)
        self.student_repo.update_student(student_id, class_id=class_id)

    def get_academic_report(self, student_id):
        self.get_student(student_id)
        return self.student_repo.get_academic_report(student_id)

    def update_student(self, student_id, **kwargs):
        student = self.student_repo.get_student(student_id)
        if student is None:
            raise ValueError("studentnot found.")
        if "full_name" in kwargs:
            StudentValidator.validate_name(kwargs["full_name"])

        if "email" in kwargs:
            StudentValidator.validate_email(kwargs["email"])

        if "password" in kwargs:
            StudentValidator.validate_password(kwargs["password"])
            kwargs["password"] = hash_password(kwargs["password"])

        if "phone_number" in kwargs:
            StudentValidator.validate_phone_number(kwargs["phone_number"])
        if "level" in kwargs:
            StudentValidator.validate_level(kwargs["level"])

        self.student_repo.update_student(student_id, **kwargs)
        return "Student updated successfully"

    def delete_student(self, student_id):
        if not isinstance(student_id, int):
            raise ValueError("Student ID must be an integer")
        student = self.student_repo.get_student(student_id)
        if student is None:
            raise ValueError("Student is not found.")
        self.student_repo.delete_student(student_id)
        return "Student deleted successfully."

    def search_student(self, full_name, admin_id=None):
        StudentValidator.validate_name(full_name)
        students = self.student_repo.search_student(full_name, admin_id)
        return students

    def count_students(self, admin_id=None):
        return self.student_repo.count_students(admin_id)

    # Profile methods
    def get_my_profile(self, current_user):
        """Return the profile of the authenticated student as a dict."""
        return {
            "student_id": current_user.student_id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone_number": current_user.phone_number,
            "level": current_user.level,
            "class_id": current_user.class_id,
        }

    def update_my_profile(self, current_user, updates):
        """Update the authenticated student's profile and return updated dict."""
        if not updates:
            raise ValueError("No data to update")
        # Reuse existing update logic
        self.update_student(current_user.student_id, **updates)
        updated = self.student_repo.get_student(current_user.student_id)
        return {
            "student_id": updated.student_id,
            "full_name": updated.full_name,
            "email": updated.email,
            "phone_number": updated.phone_number,
            "level": updated.level,
            "class_id": updated.class_id,
        }
