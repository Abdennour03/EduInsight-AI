import sqlite3

from models.grade import Grade


class GradeRepo:
    def __init__(self, db, student_repo, exercise_repo):
        self.db = db
        self.student_repo = student_repo
        self.exercise_repo = exercise_repo

    def _from_row(self, row):
        organization_id = row[4] if len(row) > 4 else None
        student = self.student_repo.get_student(row[2], organization_id=organization_id)
        exercise = self.exercise_repo.get_exercise(row[3], organization_id)
        if student is None or exercise is None:
            return None
        return Grade(row[0], row[1], student, exercise, organization_id)

    def add_grade(self, grade):
        organization_id = getattr(grade, "organization_id", None)
        if organization_id is None:
            organization_id = getattr(grade.student, "organization_id", None)
        try:
            self.db.cursor.execute(
                "INSERT INTO grades (score, student_id, exercise_id, organization_id) VALUES (?, ?, ?, ?)",
                (grade.score, grade.student.student_id, grade.exercise.exercise_id, organization_id),
            )
            self.db.connection.commit()
        except sqlite3.IntegrityError as error:
            self.db.connection.rollback()
            if "UNIQUE constraint failed" in str(error):
                raise ValueError("This student already has a grade for this exercise.") from error
            raise
        grade.grade_id = self.db.cursor.lastrowid

    def get_grade_by_student_and_exercise(self, student_id, exercise_id, organization_id=None):
        self.db.cursor.execute(
            "SELECT grade_id, score, student_id, exercise_id, organization_id FROM grades WHERE student_id = ? AND exercise_id = ?" + (" AND organization_id = ?" if organization_id is not None else ""),
            (student_id, exercise_id, organization_id) if organization_id is not None else (student_id, exercise_id),
        )
        row = self.db.cursor.fetchone()
        return self._from_row(row) if row else None

    def get_grade(self, grade_id, organization_id=None):
        self.db.cursor.execute(
            "SELECT grade_id, score, student_id, exercise_id, organization_id FROM grades WHERE grade_id = ?" + (" AND organization_id = ?" if organization_id is not None else ""),
            (grade_id, organization_id) if organization_id is not None else (grade_id,),
        )
        row = self.db.cursor.fetchone()
        return self._from_row(row) if row else None

    def get_all_grades(self, organization_id=None):
        self.db.cursor.execute(
            "SELECT grade_id, score, student_id, exercise_id, organization_id FROM grades" + (" WHERE organization_id = ?" if organization_id is not None else ""),
            (organization_id,) if organization_id is not None else (),
        )
        return [grade for row in self.db.cursor.fetchall() if (grade := self._from_row(row))]

    def update_grade(self, grade_id, organization_id=None, **kwargs):
        where = " WHERE grade_id = ?" + (" AND organization_id = ?" if organization_id is not None else "")
        suffix = (organization_id,) if organization_id is not None else ()
        if "score" in kwargs:
            self.db.cursor.execute("UPDATE grades SET score = ?" + where, (kwargs["score"], grade_id) + suffix)
        if "student" in kwargs:
            self.db.cursor.execute("UPDATE grades SET student_id = ?" + where, (kwargs["student"].student_id, grade_id) + suffix)
        if "exercise" in kwargs:
            self.db.cursor.execute("UPDATE grades SET exercise_id = ?" + where, (kwargs["exercise"].exercise_id, grade_id) + suffix)
        try:
            self.db.connection.commit()
        except sqlite3.IntegrityError as error:
            self.db.connection.rollback()
            raise ValueError("This student already has a grade for this exercise.") from error
        return True

    def delete_grade(self, grade_id, organization_id=None):
        self.db.cursor.execute("DELETE FROM grades WHERE grade_id = ?" + (" AND organization_id = ?" if organization_id is not None else ""), (grade_id, organization_id) if organization_id is not None else (grade_id,))
        self.db.connection.commit()
        return self.db.cursor.rowcount > 0

    def search_grade_by_student(self, student_id, organization_id=None):
        self.db.cursor.execute("SELECT grade_id, score, student_id, exercise_id, organization_id FROM grades WHERE student_id = ?" + (" AND organization_id = ?" if organization_id is not None else ""), (student_id, organization_id) if organization_id is not None else (student_id,))
        return [grade for row in self.db.cursor.fetchall() if (grade := self._from_row(row))]

    def search_grade_by_exercises(self, exercise_id, organization_id=None):
        self.db.cursor.execute("SELECT grade_id, score, student_id, exercise_id, organization_id FROM grades WHERE exercise_id = ?" + (" AND organization_id = ?" if organization_id is not None else ""), (exercise_id, organization_id) if organization_id is not None else (exercise_id,))
        return [grade for row in self.db.cursor.fetchall() if (grade := self._from_row(row))]

    def search_grade_by_exercise(self, exercise_id, organization_id=None):
        return self.search_grade_by_exercises(exercise_id, organization_id)

    def count_grades(self, organization_id=None):
        self.db.cursor.execute("SELECT COUNT(*) FROM grades" + (" WHERE organization_id = ?" if organization_id is not None else ""), (organization_id,) if organization_id is not None else ())
        return self.db.cursor.fetchone()[0]
