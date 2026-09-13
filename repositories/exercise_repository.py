from models.course import Course
from models.exercise import Exercise
from models.teacher import Teacher


class ExerciseRepo:
    def __init__(self, db):
        self.db = db

    def _from_row(self, row):
        teacher = Teacher(row[7], row[8], row[9], row[10], row[11])
        course = Course(row[2], row[3], teacher, row[5], row[6])
        return Exercise(row[0], row[1], course, row[4])

    def _select(self, where="", params=()):
        query = """
            SELECT exercises.exercise_id, exercises.exercise_name,
                   courses.course_id, courses.course_name, exercises.max_score,
                   courses.semester, courses.level,
                   teachers.teacher_id, teachers.full_name, teachers.email,
                   teachers.password, teachers.phone_number
            FROM exercises
            JOIN courses ON exercises.course_id = courses.course_id
            JOIN teachers ON courses.teacher_id = teachers.teacher_id
        """ + where
        self.db.cursor.execute(query, params)
        return [self._from_row(row) for row in self.db.cursor.fetchall()]

    def add_exercise(self, exercise):
        self.db.cursor.execute(
            "INSERT INTO exercises (exercise_name, course_id, max_score) VALUES (?, ?, ?)",
            (exercise.exercise_name, exercise.course.course_id, exercise.max_score),
        )
        self.db.connection.commit()
        exercise.exercise_id = self.db.cursor.lastrowid

    def get_exercise(self, exercise_id):
        exercises = self._select(" WHERE exercises.exercise_id = ?", (exercise_id,))
        return exercises[0] if exercises else None

    def get_all_exercises(self):
        return self._select()

    def update_exercise(self, exercise_id, **kwargs):
        updates = []
        values = []
        if "exercise_name" in kwargs:
            updates.append("exercise_name = ?")
            values.append(kwargs["exercise_name"])
        if "course" in kwargs:
            updates.append("course_id = ?")
            values.append(kwargs["course"].course_id)
        if "max_score" in kwargs:
            updates.append("max_score = ?")
            values.append(kwargs["max_score"])
        if updates:
            values.append(exercise_id)
            self.db.cursor.execute(
                f"UPDATE exercises SET {', '.join(updates)} WHERE exercise_id = ?",
                values,
            )
            self.db.connection.commit()
        return True

    def delete_exercise(self, exercise_id):
        if self.get_exercise(exercise_id) is None:
            return False
        self.db.cursor.execute("DELETE FROM exercises WHERE exercise_id = ?", (exercise_id,))
        self.db.connection.commit()
        return True

    def search_exercise(self, query):
        return self._select(" WHERE exercises.exercise_name LIKE ?", (f"%{query}%",))

    def count_exercises(self):
        self.db.cursor.execute("SELECT COUNT(*) FROM exercises")
        return self.db.cursor.fetchone()[0]

    def get_exercises_by_level(self, level):
        return self._select(" WHERE UPPER(TRIM(courses.level)) = ?", (level.strip().upper(),))

    def get_exercises_by_level_for_student(self, level, student_id):
        """Fetch all exercises whose course level matches any class that
        has academic_year equal to the student's level.  This works even
        when the student has no class_id – we derive the correct
        course-level from the classes table.

        Also LEFT JOINs grades and submissions so each exercise carries
        the student's score and submission status.
        """
        query = """
            SELECT exercises.exercise_id, exercises.exercise_name,
                   courses.course_id, courses.course_name, exercises.max_score,
                   courses.semester, courses.level,
                   teachers.teacher_id, teachers.full_name, teachers.email,
                   teachers.password, teachers.phone_number,
                   grades.score,
                   submissions.submission_id,
                   submissions.status
            FROM exercises
            JOIN courses ON exercises.course_id = courses.course_id
            JOIN teachers ON courses.teacher_id = teachers.teacher_id
            JOIN classes
                ON UPPER(TRIM(courses.level)) = UPPER(TRIM(classes.name))
            LEFT JOIN grades
                ON grades.exercise_id = exercises.exercise_id
               AND grades.student_id = ?
            LEFT JOIN submissions
                ON submissions.exercise_id = exercises.exercise_id
               AND submissions.student_id = ?
            WHERE UPPER(TRIM(classes.academic_year)) = ?
        """
        self.db.cursor.execute(
            query, (student_id, student_id, level.strip().upper())
        )
        exercises = []
        for row in self.db.cursor.fetchall():
            exercise = self._from_row(row[:12])
            exercise.score = row[12]
            exercise.submission_id = row[13]
            exercise.submission_status = row[14] if row[14] else "pending"
            exercises.append(exercise)
        return exercises

    def get_exercises_by_class_id_for_student(self, class_id, student_id):
        query = """
            SELECT exercises.exercise_id, exercises.exercise_name,
                   courses.course_id, courses.course_name, exercises.max_score,
                   courses.semester, courses.level,
                   teachers.teacher_id, teachers.full_name, teachers.email,
                   teachers.password, teachers.phone_number,
                   grades.score,
                   submissions.submission_id,
                   submissions.status
            FROM exercises
            JOIN courses ON exercises.course_id = courses.course_id
            JOIN classes
                ON UPPER(TRIM(courses.level)) = UPPER(TRIM(classes.name))
            JOIN teachers ON courses.teacher_id = teachers.teacher_id
            LEFT JOIN grades
                ON grades.exercise_id = exercises.exercise_id
               AND grades.student_id = ?
            LEFT JOIN submissions
                ON submissions.exercise_id = exercises.exercise_id
               AND submissions.student_id = ?
            WHERE classes.id = ?
        """
        self.db.cursor.execute(query, (student_id, student_id, class_id))
        exercises = []
        for row in self.db.cursor.fetchall():
            exercise = self._from_row(row[:12])
            exercise.score = row[12]
            exercise.submission_id = row[13]
            exercise.submission_status = row[14] if row[14] else "pending"
            exercises.append(exercise)
        return exercises

    def get_exercises_by_teacher(self, teacher_id):
        return self._select(" WHERE courses.teacher_id = ?", (teacher_id,))
