class Grade:
    def __init__(self, grade_id, score, student, exercise, organization_id=None):
        self.grade_id = grade_id
        self.score = score
        self.student = student
        self.exercise = exercise
        self.organization_id = organization_id