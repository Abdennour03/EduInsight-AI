class ExerciseController:
    def __init__(self, exercise_service):
        self.exercise_service = exercise_service

    def create_exercise(self, exercise_name, course_id, teacher_id, max_score=20):
        return self.exercise_service.create_exercise(
            exercise_name, course_id, teacher_id, max_score
        )

    def get_exercise(self, exercise_id, organization_id=None):
        return self.exercise_service.get_exercise(exercise_id, organization_id)

    def get_all_exercises(self, organization_id=None):
        return self.exercise_service.get_all_exercises(organization_id)

    def update_exercise(self, exercise_id, teacher_id=None, **kwargs):
        return self.exercise_service.update_exercise(exercise_id, teacher_id, **kwargs)

    def delete_exercise(self, exercise_id, teacher_id=None):
        return self.exercise_service.delete_exercise(exercise_id, teacher_id)

    def search_exercise(self, query, organization_id=None):
        return self.exercise_service.search_exercise(query, organization_id)

    def count_exercise(self, organization_id=None):
        return self.exercise_service.count_exercise(organization_id)

    def get_exercises_by_level(self, level):
        return self.exercise_service.get_exercises_by_level(level)

    def get_exercises_by_teacher(self, teacher_id, organization_id=None):
        return self.exercise_service.get_exercises_by_teacher(teacher_id, organization_id)