from models.exercise import Exercise
from utils.validation_exercise import ExerciseValidator
from utils.validators import validate_max_score

class ExerciseService:
    def __init__(self, exercise_repo, course_repo):
        self.exercise_repo = exercise_repo
        self.course_repo = course_repo

    def create_exercise(self, exercise_name, course_id, teacher_id, max_score=20):

        ExerciseValidator.validation_exercise_name(
            exercise_name
        )
        validate_max_score(max_score)

        course = self.course_repo.get_course(course_id)

        if course is None:
            raise ValueError("Course not found.")

        if course.teacher.teacher_id != teacher_id:
            raise ValueError(
                "You can only create exercises for your own courses."
            )

        exercise = Exercise(
            None,
            exercise_name,
            course,
            max_score
        )

        self.exercise_repo.add_exercise(exercise)

        return "Exercise created successfully."

    def get_exercise(self, exercise_id, organization_id=None):

        if not isinstance(exercise_id, int):
            raise ValueError("exercise ID must be an int")
        exercise = self.exercise_repo.get_exercise(exercise_id, organization_id)
        if exercise is None:
            raise ValueError("exercise not found.")
        return exercise

    def get_all_exercises(self, organization_id=None):
        return self.exercise_repo.get_all_exercises(organization_id)

    def update_exercise(self, exercise_id, teacher_id=None, **kwargs):
        exercise = self.exercise_repo.get_exercise(exercise_id)
        if exercise is None :
            raise ValueError("exercise not found")
        if teacher_id is not None and exercise.course.teacher.teacher_id != teacher_id:
            raise ValueError("You can only manage your own exercises.")
        if "exercise_name" in kwargs:
            ExerciseValidator.validation_exercise_name(kwargs["exercise_name"])
        if "max_score" in kwargs:
            validate_max_score(kwargs["max_score"])
        if "course_id" in kwargs:
            course = self.course_repo.get_course(
                kwargs["course_id"]
            )
            if course is None:
                raise ValueError("Course not found.")
            kwargs["course"] = course
            del kwargs["course_id"]

        self.exercise_repo.update_exercise(exercise_id, **kwargs)
        return "exercise updated successfully."

    def delete_exercise(self, exercise_id, teacher_id=None):
        exercise = self.exercise_repo.get_exercise(exercise_id)
        if exercise is None:
            raise ValueError('exercise ID not found.')
        if teacher_id is not None and exercise.course.teacher.teacher_id != teacher_id:
            raise ValueError("You can only manage your own exercises.")
        self.exercise_repo.delete_exercise(exercise_id)
        return "exercise deleted successfully"

    def search_exercise(self, query, organization_id=None):
        query = query.strip()
        if not query:
            raise ValueError("Search query cannot be empty.")

        exercises = self.exercise_repo.search_exercise(query, organization_id)
        if not exercises:
            raise ValueError("No exercise found.")
        return exercises

    def count_exercise(self, organization_id=None):
        return self.exercise_repo.count_exercises(organization_id)

    def get_exercises_by_level(self, level):

        ExerciseValidator.validation_level(level)

        return self.exercise_repo.get_exercises_by_level(level)

    def get_exercises_by_teacher(self, teacher_id, organization_id=None):

        if not isinstance(teacher_id, int):
            raise ValueError("Teacher ID must be an int.")

        return self.exercise_repo.get_exercises_by_teacher(
            teacher_id,
            organization_id,
        )
