from models.course import Course


class CourseRepo:

    def __init__(self, db):
        self.db = db


    def add_course(self, course):
        teacher_org = self.db.cursor.execute(
            "SELECT organization_id FROM teachers WHERE teacher_id = ?",
            (course.teacher.teacher_id,),
        ).fetchone()
        organization_id = getattr(course, "organization_id", None)
        if organization_id is None and teacher_org:
            organization_id = teacher_org[0]
        course.organization_id = organization_id

        self.db.cursor.execute("""
            INSERT INTO courses
            (course_name, teacher_id, semester, level, organization_id)
            VALUES (?, ?, ?, ?, ?)
        """, (
            course.course_name,
            course.teacher.teacher_id,
            course.semester,
            course.level,
            organization_id,
        ))

        self.db.connection.commit()

        course.course_id = self.db.cursor.lastrowid


    def get_course(self, course_id, organization_id=None):

        self.db.cursor.execute("""
            SELECT course_id, course_name,
                     teacher_id, semester, level, organization_id
            FROM courses
                 WHERE course_id = ?""" + (" AND organization_id = ?" if organization_id is not None else ""),
                 (course_id, organization_id) if organization_id is not None else (course_id,))

        row = self.db.cursor.fetchone()

        if row is None:
            return None

        teacher_id = row[2]

        self.db.cursor.execute("""
            SELECT teacher_id, full_name, email,
                     password, phone_number, organization_id
            FROM teachers
                 WHERE teacher_id = ?""" + (" AND organization_id = ?" if organization_id is not None else ""),
                 (teacher_id, organization_id) if organization_id is not None else (teacher_id,))

        teacher_row = self.db.cursor.fetchone()

        if teacher_row is None:
            return None

        from models.teacher import Teacher

        teacher = Teacher(
            teacher_row[0],
            teacher_row[1],
            teacher_row[2],
            teacher_row[4],
            teacher_row[3],
            teacher_row[5]
        )

        return Course(
            row[0],
            row[1],
            teacher,
            row[4],
            row[3],
            row[5]
        )


    def get_all_courses(self, organization_id=None):

        self.db.cursor.execute("""
            SELECT
                courses.course_id,
                courses.course_name,
                courses.semester,
                courses.level,
                teachers.teacher_id,
                teachers.full_name,
                teachers.email,
                teachers.password,
                teachers.phone_number,
                courses.organization_id
            FROM courses
            JOIN teachers
            ON courses.teacher_id = teachers.teacher_id
        """ + (" WHERE courses.organization_id = ? AND teachers.organization_id = ?" if organization_id is not None else ""),
            (organization_id, organization_id) if organization_id is not None else ())

        rows = self.db.cursor.fetchall()

        courses = []

        from models.teacher import Teacher

        for row in rows:

            teacher = Teacher(
                row[4],  # teacher_id
                row[5],  # full_name
                row[6],  # email
                row[7],  # password
                row[8],  # phone_number
                organization_id if organization_id is not None else row[9],
            )

            course = Course(
                row[0],  # course_id
                row[1],  # course_name
                teacher,
                row[3],  # level
                row[2],  # semester
                row[9],  # organization_id
            )

            courses.append(course)

        return courses


    def update_course(self, course_id, organization_id=None, **kwargs):

        if "course_name" in kwargs:
            query = """
                UPDATE courses
                SET course_name = ?
                WHERE course_id = ?""" + (" AND organization_id = ?" if organization_id is not None else "")
            values = (
                kwargs["course_name"],
                course_id
            ) + ((organization_id,) if organization_id is not None else ())
            self.db.cursor.execute(query, values)


        if "teacher" in kwargs:
            query = """
                UPDATE courses
                SET teacher_id = ?
                WHERE course_id = ?""" + (" AND organization_id = ?" if organization_id is not None else "")
            values = (
                kwargs["teacher"].teacher_id,
                course_id
            ) + ((organization_id,) if organization_id is not None else ())
            self.db.cursor.execute(query, values)


        if "semester" in kwargs:
            query = """
                UPDATE courses
                SET semester = ?
                WHERE course_id = ?""" + (" AND organization_id = ?" if organization_id is not None else "")
            values = (
                kwargs["semester"],
                course_id
            ) + ((organization_id,) if organization_id is not None else ())
            self.db.cursor.execute(query, values)


        if "level" in kwargs:
            query = """
                UPDATE courses
                SET level = ?
                WHERE course_id = ?""" + (" AND organization_id = ?" if organization_id is not None else "")
            values = (
                kwargs["level"],
                course_id
            ) + ((organization_id,) if organization_id is not None else ())
            self.db.cursor.execute(query, values)


        self.db.connection.commit()

        return True


    def delete_course(self, course_id, organization_id=None):

        course = self.get_course(course_id, organization_id)

        if course is None:
            return False

        self.db.cursor.execute("""
            DELETE FROM courses
            WHERE course_id = ?""" + (" AND organization_id = ?" if organization_id is not None else ""),
            (course_id, organization_id) if organization_id is not None else (course_id,))

        self.db.connection.commit()

        return True


    def search_course(self, query, organization_id=None):
        search_text = f"%{query}%"
        sql = """
            SELECT course_id, course_name,
                   teacher_id, semester, level
            FROM courses
            WHERE course_name LIKE ?""" + (" AND organization_id = ?" if organization_id is not None else "")
        values = (search_text, organization_id) if organization_id is not None else (search_text,)
        self.db.cursor.execute(sql, values)

        rows = self.db.cursor.fetchall()

        courses = []

        from models.teacher import Teacher

        for row in rows:

            self.db.cursor.execute("""
                SELECT teacher_id, full_name, email,
                       password, phone_number
                FROM teachers
                WHERE teacher_id = ?
            """, (row[2],))

            teacher_row = self.db.cursor.fetchone()

            if teacher_row is None:
                continue

            teacher = Teacher(
                teacher_row[0],
                teacher_row[1],
                teacher_row[2],
                teacher_row[3],
                teacher_row[4]
            )

            courses.append(
                Course(
                    row[0],
                    row[1],
                    teacher,
                    row[4],
                    row[3]
                )
            )

        return courses


    def count_courses(self, organization_id=None):
        self.db.cursor.execute(
            "SELECT COUNT(*) FROM courses" + (" WHERE organization_id = ?" if organization_id is not None else ""),
            (organization_id,) if organization_id is not None else (),
        )

        result = self.db.cursor.fetchone()

        return result[0]


    def get_courses_by_level(self, level):

        level = level.strip().upper()

        self.db.cursor.execute("""
            SELECT course_id, course_name, teacher_id, semester, level
            FROM courses
            WHERE UPPER(TRIM(level)) = ?
        """, (level,))

        matched_rows = self.db.cursor.fetchall()

        from models.teacher import Teacher

        courses = []

        for row in matched_rows:
            teacher_id = row[2]

            self.db.cursor.execute("""
                SELECT teacher_id, full_name, email, password, phone_number
                FROM teachers
                WHERE teacher_id = ?
            """, (teacher_id,))

            teacher_row = self.db.cursor.fetchone()

            if teacher_row is None:
                continue

            teacher = Teacher(
                teacher_row[0],
                teacher_row[1],
                teacher_row[2],
                teacher_row[3],
                teacher_row[4]
            )

            courses.append(
                Course(
                    row[0],        # course_id
                    row[1],        # course_name
                    teacher,
                    row[4],        # level
                    row[3]         # semester
                )
            )

        return courses

    def get_courses_by_class_id(self, class_id, organization_id=None):
        organization_filter = (
            " AND courses.organization_id = classes.organization_id"
            " AND courses.organization_id = ?"
            if organization_id is not None
            else ""
        )
        self.db.cursor.execute(
            """SELECT courses.course_id
               FROM courses
               JOIN classes
                 ON UPPER(TRIM(courses.level)) = UPPER(TRIM(classes.name))
               WHERE classes.id = ?""" + organization_filter,
            (class_id, organization_id) if organization_id is not None else (class_id,),
        )
        return [
            course
            for (course_id,) in self.db.cursor.fetchall()
            if (course := self.get_course(course_id, organization_id)) is not None
        ]

    def get_courses_by_teacher(self, teacher_id, organization_id=None):

        self.db.cursor.execute("""
            SELECT
                courses.course_id,
                courses.course_name,
                courses.teacher_id,
                courses.semester,
                courses.level,
                teachers.teacher_id,
                teachers.full_name,
                teachers.email,
                teachers.password,
                teachers.phone_number,
                courses.organization_id
            FROM courses
            JOIN teachers
                ON courses.teacher_id = teachers.teacher_id
            WHERE courses.teacher_id = ?""" + (" AND courses.organization_id = ? AND teachers.organization_id = ?" if organization_id is not None else ""),
            (teacher_id, organization_id, organization_id) if organization_id is not None else (teacher_id,))

        rows = self.db.cursor.fetchall()

        courses = []

        from models.teacher import Teacher

        for row in rows:

            teacher = Teacher(
                row[5],
                row[6],
                row[7],
                row[8],
                row[9],
                row[10]
            )

            course = Course(
                row[0],
                row[1],
                teacher,
                row[4],
                row[3],
                row[10]
            )

            courses.append(course)

        return courses