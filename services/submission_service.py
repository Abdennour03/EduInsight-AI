from models.student import Student
from models.exercise import Exercise
from utils.submission_validation import SubmissionValidator
from models.submission import Submission
from datetime import datetime

class SubmissionService:
    def __init__(self, submission_repo, student_repo, exercise_repo):
        self.submission_repo = submission_repo
        self.student_repo = student_repo
        self.exercise_repo = exercise_repo

    def create_submission(self, student_id, exercise_id, file_path, organization_id=None):

        if not isinstance(student_id, int):
            raise ValueError("Invalid student")

        if not isinstance(exercise_id, int):
            raise ValueError("Invalid exercise")

        student = self.student_repo.get_student(student_id, organization_id=organization_id)

        if student is None:
            raise ValueError("Student not found.")

        exercise = self.exercise_repo.get_exercise(exercise_id, organization_id)

        if exercise is None:
            raise ValueError("Exercise not found.")

        submission_date = datetime.now()

        status = "submitted"

        submission = Submission(
            None,
            student_id,
            exercise,
            submission_date,
            file_path,
            status,
            organization_id or student.organization_id,
        )

        self.submission_repo.add_submission(submission)

        return submission
        
    def get_submission(self, submission_id, organization_id=None):
        if not isinstance(submission_id, int):
            raise ValueError("Submission ID mustbe int.")
        submission = self.submission_repo.get_submission(submission_id, organization_id)
        if submission is None:
            raise ValueError("Submition not found")
        return submission
        
    def get_all_submissions(self, organization_id=None):
        return self.submission_repo.get_all_submissions(organization_id)

    def update_submission(self, submission_id, organization_id=None, **kwargs):
        submission = self.submission_repo.get_submission(submission_id, organization_id)
        if submission is None:
            raise ValueError("Submission not found.")
        if "status" in kwargs:
            SubmissionValidator.validation_status(kwargs["status"])

        self.submission_repo.update_submission(submission_id, organization_id, **kwargs)
        return "Submission updated successfully"
    
    def delete_submission(self, submission_id, organization_id=None):
        if not isinstance(submission_id, int):
            raise ValueError("Submission ID must be int")
        submission = self.submission_repo.get_submission(submission_id, organization_id)
        if submission is None:
            raise ValueError("Submission not found.")
        self.submission_repo.delete_submission(submission_id, organization_id)
        return "Submission deleted succssefully."

    def search_submission_by_student(self, student_id, organization_id=None):
        if not isinstance(student_id, int):
            raise ValueError("Student ID must be int.")
        student = self.student_repo.get_student(student_id, organization_id=organization_id)
        if student is None:
            raise ValueError("Student not found.")
        submissions = self.submission_repo.search_submission_by_student(student_id, organization_id)
        if submissions is None:
            raise ValueError("Submission not found.")
        return submissions


    def search_submission_by_exercise(self, exercise_id, organization_id=None):
        if not isinstance(exercise_id, int):
            raise ValueError("exercise ID must be int.")
        exercise = self.exercise_repo.get_exercise(exercise_id, organization_id)
        if exercise is None:
            raise ValueError("exercise not found.")
        submissions = self.submission_repo.search_submission_by_exercise(exercise_id, organization_id)
        if not submissions :
            raise ValueError("Submission not found.")
        return submissions

    
    def count_submissions(self, organization_id=None):
        return self.submission_repo.count_submissions(organization_id)

    def get_submissions_by_student(self, student_id, organization_id=None):

        if not isinstance(student_id, int):
            raise ValueError("Student ID must be int.")

        student = self.student_repo.get_student(student_id, organization_id=organization_id)

        if student is None:
            raise ValueError("Student not found.")

        return self.submission_repo.get_submissions_by_student(student_id, organization_id)


    def get_submissions_by_teacher(self, teacher_id, organization_id=None):

        if not isinstance(teacher_id, int):
            raise ValueError("Teacher ID must be an integer.")

        submissions = self.submission_repo.get_submissions_by_teacher(
            teacher_id,
            organization_id,
        )

        if not submissions:
            raise ValueError("No submissions found.")

        return submissions
