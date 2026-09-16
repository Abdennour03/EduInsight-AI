class SubmissionController:
    def __init__(self, submission_service):
        self.submission_service = submission_service

    def create_submission(self, student_id, exercise_id, file_path, organization_id=None):
        return self.submission_service.create_submission(student_id, exercise_id, file_path, organization_id)

    def get_submission(self, submission_id, organization_id=None):
        return self.submission_service.get_submission(submission_id, organization_id)

    def get_all_submissions(self, organization_id=None):
        return self.submission_service.get_all_submissions(organization_id)

    def update_submission(self, submission_id, organization_id=None, **kwargs):
        return self.submission_service.update_submission(submission_id, organization_id, **kwargs)

    def delete_submission(self, submission_id, organization_id=None):
        return self.submission_service.delete_submission(submission_id, organization_id)

    def search_submission_by_student(self, student_id, organization_id=None):
        return self.submission_service.search_submission_by_student(student_id, organization_id)

    def search_submission_by_exercise(self, exercise_id, organization_id=None):
        return self.submission_service.search_submission_by_exercise(exercise_id, organization_id)

    def count_submissions(self, organization_id=None):
        return self.submission_service.count_submissions(organization_id)

    def get_submissions_by_student(self, student_id, organization_id=None):
        return self.submission_service.get_submissions_by_student(student_id, organization_id)

    def get_submissions_by_teacher(self, teacher_id, organization_id=None):
        return self.submission_service.get_submissions_by_teacher(teacher_id, organization_id)