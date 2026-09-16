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

    def _select(self, where="", params=(), organization_id=None):
        tenant_clause = ""
        tenant_params = ()
        if organization_id is not None:
            tenant_clause = (
                " AND exercises.organization_id = ?"
                " AND courses.organization_id = ?"
                " AND teachers.organization_id = ?"
                if where
                else " WHERE exercises.organization_id = ?"
                " AND courses.organization_id = ?"
                " AND teachers.organization_id = ?"
            )
            tenant_params = (organization_id, organization_id, organization_id)
        query = """
            SELECT exercises.exercise_id, exercises.exercise_name,
                   courses.course_id, courses.course_name, exercises.max_score,
                   courses.semester, courses.level,
                   teachers.teacher_id, teachers.full_name, teachers.email,
                   teachers.password, teachers.phone_number
            FROM exercises
            JOIN courses ON exercises.course_id = courses.course_id
            JOIN teachers ON courses.teacher_id = teachers.teacher_id
        """ + where + tenant_clause
        self.db.cursor.execute(query, params + tenant_params)
        return [self._from_row(row) for row in self.db.cursor.fetchall()]

    def add_exercise(self, exercise):
        organization_id = getattr(exercise.course, "organization_id", None)
        self.db.cursor.execute(
            "INSERT INTO exercises (exercise_name, course_id, max_score, organization_id) VALUES (?, ?, ?, ?)",
            (exercise.exercise_name, exercise.course.course_id, exercise.max_score, organization_id),
        )
        self.db.connection.commit()
        exercise.exercise_id = self.db.cursor.lastrowid

    def get_exercise(self, exercise_id, organization_id=None):
        exercises = self._select(" WHERE exercises.exercise_id = ?", (exercise_id,), organization_id)
        return exercises[0] if exercises else None

    def get_all_exercises(self, organization_id=None):
        return self._select(organization_id=organization_id)

    def update_exercise(self, exercise_id, organization_id=None, **kwargs):
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
            if organization_id is not None:
                values.append(organization_id)
            self.db.cursor.execute(
                f"UPDATE exercises SET {', '.join(updates)} WHERE exercise_id = ?" +
                (" AND organization_id = ?" if organization_id is not None else ""),
                values,
            )
            self.db.connection.commit()
        return True

    def delete_exercise(self, exercise_id, organization_id=None):
        if self.get_exercise(exercise_id, organization_id) is None:
            return False
        self.db.cursor.execute(
            "DELETE FROM exercises WHERE exercise_id = ?" +
            (" AND organization_id = ?" if organization_id is not None else ""),
            (exercise_id, organization_id) if organization_id is not None else (exercise_id,),
        )
        self.db.connection.commit()
        return True

    def search_exercise(self, query, organization_id=None):
        return self._select(" WHERE exercises.exercise_name LIKE ?", (f"%{query}%",), organization_id)

    def count_exercises(self, organization_id=None):
        self.db.cursor.execute(
            "SELECT COUNT(*) FROM exercises" + (" WHERE organization_id = ?" if organization_id is not None else ""),
            (organization_id,) if organization_id is not None else (),
        )
        return self.db.cursor.fetchone()[0]

    def get_exercises_by_level(self, level, organization_id=None):
        return self._select(" WHERE UPPER(TRIM(courses.level)) = ?", (level.strip().upper(),), organization_id)

    def get_exercises_by_level_for_student(self, level, student_id, organization_id=None):
        """Fetch all exercises whose course level matches the student's level.

        This is the fallback path used when a student has no class assignment yet;
        we still want to show the exercises for their selected level and attach the
        current grade/submission state when present.
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
            LEFT JOIN grades
                ON grades.exercise_id = exercises.exercise_id
               AND grades.student_id = ?
            LEFT JOIN submissions
                ON submissions.exercise_id = exercises.exercise_id
               AND submissions.student_id = ?
                        WHERE UPPER(TRIM(courses.level)) = ?
                            AND (? IS NULL OR exercises.organization_id = ?)
                            AND (? IS NULL OR courses.organization_id = ?)
                            AND (? IS NULL OR teachers.organization_id = ?)
        """
        self.db.cursor.execute(
            query, (student_id, student_id, level.strip().upper(), organization_id, organization_id, organization_id, organization_id, organization_id, organization_id)
        )
        exercises = []
        for row in self.db.cursor.fetchall():
            exercise = self._from_row(row[:12])
            exercise.score = row[12]
            exercise.submission_id = row[13]
            exercise.submission_status = row[14] if row[14] else "pending"
            exercises.append(exercise)
        return exercises

    def get_exercises_by_class_id_for_student(self, class_id, student_id, organization_id=None):
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
                            AND (? IS NULL OR exercises.organization_id = classes.organization_id)
                            AND (? IS NULL OR courses.organization_id = classes.organization_id)
                            AND (? IS NULL OR classes.organization_id = ?)
        """
        self.db.cursor.execute(query, (student_id, student_id, class_id, organization_id, organization_id, organization_id, organization_id))
        exercises = []
        for row in self.db.cursor.fetchall():
            exercise = self._from_row(row[:12])
            exercise.score = row[12]
            exercise.submission_id = row[13]
            exercise.submission_status = row[14] if row[14] else "pending"
            exercises.append(exercise)
        return exercises

    def get_exercises_by_teacher(self, teacher_id, organization_id=None):
        return self._select(" WHERE courses.teacher_id = ?", (teacher_id,), organization_id)
