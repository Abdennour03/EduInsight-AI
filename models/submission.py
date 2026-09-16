class Submission:
    def __init__(self, submission_id, student_id, exercise, submission_date, file_path, status, organization_id=None):
        self.submission_id = submission_id  
        self.student_id = student_id
        self.exercise = exercise
        self.submission_date = submission_date
        self.file_path = file_path
        self.status = status
        self.organization_id = organization_id