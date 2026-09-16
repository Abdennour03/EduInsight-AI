from models.grade import Grade
from utils.validators import validate_score

class GradeService:

    def __init__(
        self,
        grade_repo,
        student_repo,
        exercise_repo,
        course_repo,
        submission_repo=None,
    ):
        self.grade_repo = grade_repo
        self.student_repo = student_repo
        self.exercise_repo = exercise_repo
        self.course_repo = course_repo
        self.submission_repo = submission_repo

    # =====================================================
    # CREATE GRADE
    # =====================================================

    def create_grade(self, score, student_id, exercise_id, teacher_id=None, organization_id=None):

        if not isinstance(student_id, int):
            raise ValueError("Invalid student.")

        if not isinstance(exercise_id, int):
            raise ValueError("Invalid exercise.")

        student = self.student_repo.get_student(student_id, organization_id=organization_id)

        if student is None:
            raise ValueError("Student not found.")

        exercise = self.exercise_repo.get_exercise(exercise_id, organization_id)

        if exercise is None:
            raise ValueError("Exercise not found.")

        if self.submission_repo is not None:
            submission = self.submission_repo.get_submission_by_student_and_exercise(
                student_id,
                exercise_id,
                organization_id,
            )
            if submission is None:
                raise ValueError(
                    "The student must submit the exercise before it can be graded."
                )

        validate_score(score, exercise.max_score)

        if teacher_id is not None:
            if exercise.course.teacher.teacher_id != teacher_id:
                raise ValueError("You can only grade your own exercises.")

        existing_grade = self.grade_repo.get_grade_by_student_and_exercise(
            student_id,
            exercise_id,
            organization_id,
        )

        if existing_grade is not None:
            raise ValueError(
                "This student already has a grade for this exercise."
            )

        grade = Grade(
            None,
            score,
            student,
            exercise,
            organization_id or student.organization_id,
        )

        self.grade_repo.add_grade(grade)

        return "Grade created successfully."

    # =====================================================
    # GET GRADE
    # =====================================================

    def get_grade(self, grade_id, organization_id=None):

        if not isinstance(grade_id, int):
            raise ValueError("Grade ID must be an int.")

        grade = self.grade_repo.get_grade(grade_id, organization_id)

        if grade is None:
            raise ValueError("Grade not found.")

        return grade

    # =====================================================
    # GET ALL GRADES
    # =====================================================

    def get_all_grades(self, organization_id=None):

        return self.grade_repo.get_all_grades(organization_id)

    # =====================================================
    # UPDATE GRADE
    # =====================================================

    def update_grade(self, grade_id, organization_id=None, **kwargs):

        grade = self.grade_repo.get_grade(grade_id, organization_id)

        if grade is None:
            raise ValueError("Grade not found.")

        if "score" in kwargs:
            validate_score(kwargs["score"], grade.exercise.max_score)

        self.grade_repo.update_grade(
            grade_id,
            organization_id,
            **kwargs
        )

        return "Grade updated successfully."

    # =====================================================
    # DELETE GRADE
    # =====================================================

    def delete_grade(self, grade_id, organization_id=None):

        grade = self.grade_repo.get_grade(grade_id, organization_id)

        if grade is None:
            raise ValueError("Grade not found.")

        self.grade_repo.delete_grade(grade_id, organization_id)

        return "Grade deleted successfully."

    def delete_grade_by_teacher(self, grade_id, teacher_id, organization_id=None):
        grade = self.grade_repo.get_grade(grade_id, organization_id)
        if grade is None:
            raise ValueError("Grade not found.")
        if grade.exercise.course.teacher.teacher_id != teacher_id:
            raise ValueError("You can only manage grades for your own exercises.")
        self.grade_repo.delete_grade(grade_id, organization_id)
        return "Grade deleted successfully."

    # =====================================================
    # SEARCH BY STUDENT
    # =====================================================

    def search_grade_by_student(self, student_id, organization_id=None):

        if not isinstance(student_id, int):
            raise ValueError("Student ID must be int.")

        grades = self.grade_repo.search_grade_by_student(
            student_id,
            organization_id,
        )

        if not grades:
            raise ValueError("No grade found.")

        return grades

    # =====================================================
    # SEARCH BY EXERCISE
    # =====================================================

    def search_grade_by_exercise(self, exercise_id, organization_id=None):

        if not isinstance(exercise_id, int):
            raise ValueError("Exercise ID must be int.")

        grades = self.grade_repo.search_grade_by_exercises(
            exercise_id,
            organization_id,
        )

        if not grades:
            raise ValueError("No grade found.")

        return grades

    # =====================================================
    # COUNT
    # =====================================================

    def count_grades(self, organization_id=None):

        return self.grade_repo.count_grades(organization_id)

    # =====================================================
    # GET GRADES BY STUDENT
    # =====================================================

    def get_grades_by_student(self, student_id, organization_id=None):

        if not isinstance(student_id, int):
            raise ValueError("Student ID must be int.")

        student = self.student_repo.get_student(student_id, organization_id=organization_id)

        if student is None:
            raise ValueError("Student not found.")

        return self.grade_repo.search_grade_by_student(
            student_id,
            organization_id,
        )

    # =====================================================
    # GET GRADES BY TEACHER
    # =====================================================

    def get_grades_by_teacher(self, teacher_id, organization_id=None):

        if not isinstance(teacher_id, int):
            raise ValueError("Teacher ID must be int.")

        return [
            grade
            for grade in self.grade_repo.get_all_grades(organization_id)
            if grade.exercise.course.teacher.teacher_id == teacher_id
        ]

    # =====================================================
    # UPDATE GRADE BY TEACHER
    # =====================================================

    def update_grade_by_teacher(
        self,
        grade_id,
        teacher_id,
        score,
        organization_id=None
    ):

        if not isinstance(grade_id, int):
            raise ValueError(
                "Grade ID must be an integer."
            )

        if not isinstance(teacher_id, int):
            raise ValueError(
                "Teacher ID must be an integer."
            )

        # Get grade
        grade = self.grade_repo.get_grade(grade_id, organization_id)

        if grade is None:
            raise ValueError("Grade not found.")

        # Get exercise
        exercise = self.exercise_repo.get_exercise(
            grade.exercise.exercise_id,
            organization_id
        )

        if exercise is None:
            raise ValueError("Exercise not found.")

        validate_score(score, exercise.max_score)

        # Get course
        course = self.course_repo.get_course(
            exercise.course.course_id,
            organization_id
        )

        if course is None:
            raise ValueError("Course not found.")

        # Check teacher ownership
        if course.teacher.teacher_id != teacher_id:
            raise ValueError(
                "You cannot update this grade."
            )

        # Update score
        self.grade_repo.update_grade(
            grade_id,
            organization_id,
            score=score
        )

        return "Grade updated successfully."
