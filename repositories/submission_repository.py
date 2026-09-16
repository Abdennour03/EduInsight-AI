from models.submission import Submission
from models.exercise import Exercise
from models.course import Course
from models.teacher import Teacher
from models.student import Student


class SubmissionRepo:

    def __init__(self, db, student_repo, exercise_repo):
        self.db = db
        self.student_repo = student_repo
        self.exercise_repo = exercise_repo


    def add_submission(self, submission):
        organization_id = getattr(submission, "organization_id", None)
        if organization_id is None:
            student = self.student_repo.get_student(submission.student_id)
            organization_id = getattr(student, "organization_id", None) if student else None
        submission.organization_id = organization_id

        self.db.cursor.execute("""
            INSERT INTO submissions
            (
                student_id,
                exercise_id,
                submission_date,
                file_path,
                status,
                organization_id
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            submission.student_id,
            submission.exercise.exercise_id,
            submission.submission_date,
            submission.file_path,
            submission.status,
            organization_id,
        ))

        self.db.connection.commit()

        submission.submission_id = self.db.cursor.lastrowid


    def get_submission(self, submission_id, organization_id=None):

        self.db.cursor.execute("""
            SELECT
                submission_id,
                student_id,
                exercise_id,
                submission_date,
                file_path,
                status,
                organization_id
            FROM submissions
            WHERE submission_id = ?""" + (" AND organization_id = ?" if organization_id is not None else ""),
            (submission_id, organization_id) if organization_id is not None else (submission_id,))

        row = self.db.cursor.fetchone()

        if row is None:
            return None

        student = self.student_repo.get_student(row[1], organization_id=organization_id)

        exercise = self.exercise_repo.get_exercise(row[2], organization_id)

        if student is None or exercise is None:
            return None

        return Submission(
            row[0],
            student.student_id,
            exercise,
            row[3],
            row[4],
            row[5],
            row[6]
        )

    def get_submission_by_student_and_exercise(self, student_id, exercise_id, organization_id=None):
        self.db.cursor.execute(
            """SELECT submission_id, student_id, exercise_id,
                     submission_date, file_path, status, organization_id
               FROM submissions
                 WHERE student_id = ? AND exercise_id = ?""" + (" AND organization_id = ?" if organization_id is not None else "") + """
               ORDER BY submission_id DESC
               LIMIT 1""",
            (student_id, exercise_id, organization_id) if organization_id is not None else (student_id, exercise_id),
        )
        row = self.db.cursor.fetchone()
        if row is None:
            return None

        exercise = self.exercise_repo.get_exercise(row[2], organization_id)
        if exercise is None:
            return None

        return Submission(
            row[0],
            row[1],
            exercise,
            row[3],
            row[4],
            row[5],
            row[6],
        )


    def get_all_submissions(self, organization_id=None):

        self.db.cursor.execute("""
            SELECT
                submission_id,
                student_id,
                exercise_id,
                submission_date,
                file_path,
                status,
                organization_id
            FROM submissions
        """ + (" WHERE organization_id = ?" if organization_id is not None else ""),
            (organization_id,) if organization_id is not None else ())

        rows = self.db.cursor.fetchall()

        submissions = []

        for row in rows:

            student = self.student_repo.get_student(row[1], organization_id=organization_id)

            exercise = self.exercise_repo.get_exercise(row[2], organization_id)

            if student is None or exercise is None:
                continue

            submission = Submission(
                row[0],
                student.student_id,
                exercise,
                row[3],
                row[4],
                row[5],
                row[6]
            )

            submissions.append(submission)

        return submissions


    def update_submission(self, submission_id, organization_id=None, **kwargs):
        fields = {
            "student_id": kwargs.get("student_id"),
            "exercise_id": kwargs.get("exercise").exercise_id if "exercise" in kwargs else None,
            "submission_date": kwargs.get("submission_date"),
            "file_path": kwargs.get("file_path"),
            "status": kwargs.get("status"),
        }
        for field, value in fields.items():
            if value is None:
                continue
            sql = f"UPDATE submissions SET {field} = ? WHERE submission_id = ?"
            values = [value, submission_id]
            if organization_id is not None:
                sql += " AND organization_id = ?"
                values.append(organization_id)
            self.db.cursor.execute(sql, values)


        self.db.connection.commit()

        return True


    def delete_submission(self, submission_id, organization_id=None):

        submission = self.get_submission(submission_id, organization_id)

        if submission is None:
            return False

        self.db.cursor.execute("""
            DELETE FROM submissions
            WHERE submission_id = ?""" + (" AND organization_id = ?" if organization_id is not None else ""),
            (submission_id, organization_id) if organization_id is not None else (submission_id,))

        self.db.connection.commit()

        return True


    def search_submission_by_student(self, student_id, organization_id=None):

        self.db.cursor.execute("""
            SELECT
                submission_id,
                student_id,
                exercise_id,
                submission_date,
                file_path,
                status, organization_id
            FROM submissions
            WHERE student_id = ?""" + (" AND organization_id = ?" if organization_id is not None else ""),
            (student_id, organization_id) if organization_id is not None else (student_id,))

        rows = self.db.cursor.fetchall()

        submissions = []

        for row in rows:

            exercise = self.exercise_repo.get_exercise(row[2], organization_id)

            if exercise is None:
                continue

            submission = Submission(
                row[0],
                row[1],
                exercise,
                row[3],
                row[4],
                row[5], row[6]
            )

            submissions.append(submission)

        return submissions


    def search_submission_by_exercise(self, exercise_id, organization_id=None):

        self.db.cursor.execute("""
            SELECT
                submission_id,
                student_id,
                exercise_id,
                submission_date,
                file_path,
                status, organization_id
            FROM submissions
            WHERE exercise_id = ?""" + (" AND organization_id = ?" if organization_id is not None else ""),
            (exercise_id, organization_id) if organization_id is not None else (exercise_id,))

        rows = self.db.cursor.fetchall()

        submissions = []

        for row in rows:

            submission = Submission(
                row[0],
                row[1],
                self.exercise_repo.get_exercise(row[2], organization_id),
                row[3],
                row[4],
                row[5], row[6]
            )

            submissions.append(submission)

        return submissions


    def count_submissions(self, organization_id=None):
        self.db.cursor.execute(
            "SELECT COUNT(*) FROM submissions" + (" WHERE organization_id = ?" if organization_id is not None else ""),
            (organization_id,) if organization_id is not None else (),
        )

        result = self.db.cursor.fetchone()

        return result[0]

    def get_submissions_by_student(self, student_id, organization_id=None):

        self.db.cursor.execute("""
            SELECT
                submission_id,
                student_id,
                exercise_id,
                submission_date,
                file_path,
                status, organization_id
            FROM submissions
            WHERE student_id = ?""" + (" AND organization_id = ?" if organization_id is not None else ""),
            (student_id, organization_id) if organization_id is not None else (student_id,))

        rows = self.db.cursor.fetchall()

        submissions = []

        for row in rows:

            exercise = self.exercise_repo.get_exercise(row[2], organization_id)

            if exercise is None:
                continue

            submission = Submission(
                row[0],
                row[1],
                exercise,
                row[3],
                row[4],
                row[5], row[6]
            )

            submissions.append(submission)

        return submissions

    def get_submissions_by_teacher(self, teacher_id, organization_id=None):

        self.db.cursor.execute("""
            SELECT
                submissions.submission_id,
                submissions.student_id,
                submissions.exercise_id,
                submissions.submission_date,
                submissions.file_path,
                submissions.status,
                submissions.organization_id
            FROM submissions
            JOIN exercises
                ON submissions.exercise_id = exercises.exercise_id
            JOIN courses
                ON exercises.course_id = courses.course_id
            WHERE courses.teacher_id = ?""" + (" AND submissions.organization_id = ? AND courses.organization_id = ?" if organization_id is not None else ""),
            (teacher_id, organization_id, organization_id) if organization_id is not None else (teacher_id,))

        rows = self.db.cursor.fetchall()

        submissions = []

        for row in rows:

            student = self.student_repo.get_student(row[1], organization_id=organization_id)
            exercise = self.exercise_repo.get_exercise(row[2], organization_id)

            if student is None or exercise is None:
                continue

            submission = Submission(
                row[0],
                student,
                exercise,
                row[3],
                row[4],
                row[5], row[6]
            )

            submissions.append(submission)

        return submissions