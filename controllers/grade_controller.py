class GradeController:
    def __init__(self, grade_service):
        self.grade_service = grade_service

    def create_grade(self, score, student_id, exercise_id, teacher_id=None, organization_id=None):
        return self.grade_service.create_grade(
            score, student_id, exercise_id, teacher_id, organization_id
        )

    def get_grade(self, grade_id, organization_id=None):
        return self.grade_service.get_grade(grade_id, organization_id)

    def get_all_grades(self, organization_id=None):
        return self.grade_service.get_all_grades(organization_id)

    def update_grade(self, grade_id, organization_id=None, **kwargs):
        return self.grade_service.update_grade(grade_id, organization_id, **kwargs)

    def delete_grade(self, grade_id, organization_id=None):
        return self.grade_service.delete_grade(grade_id, organization_id)

    def delete_grade_by_teacher(self, grade_id, teacher_id, organization_id=None):
        return self.grade_service.delete_grade_by_teacher(grade_id, teacher_id, organization_id)

    def search_grade_by_student(self, student_id, organization_id=None):
        return self.grade_service.search_grade_by_student(student_id, organization_id)

    def search_grade_by_exercise(self, exercise_id, organization_id=None):
        return self.grade_service.search_grade_by_exercise(exercise_id, organization_id)

    def count_grades(self, organization_id=None):
        return self.grade_service.count_grades(organization_id)

    def get_grades_by_student(self, student_id, organization_id=None):
        return self.grade_service.get_grades_by_student(student_id, organization_id)

    def get_grades_by_teacher(self, teacher_id, organization_id=None):
        return self.grade_service.get_grades_by_teacher(teacher_id, organization_id)

    def update_grade_by_teacher(self, grade_id, teacher_id, score, organization_id=None):
        return self.grade_service.update_grade_by_teacher(grade_id, teacher_id, score, organization_id)