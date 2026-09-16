from models.student import Student

class StudentRepo:
    def __init__(self, db):
        self.db = db
        
    def add_student(self, student, admin_id=None):
        self.db.cursor.execute("""
    INSERT INTO students
    (full_name, email, password, phone_number, level, class_id, admin_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (student.full_name,
         student.email,
         student.password,
         student.phone_number,
         student.level,
         student.class_id,
         admin_id
         ))
        self.db.connection.commit()
        student.student_id = self.db.cursor.lastrowid



    def get_student(self, student_id, admin_id=None):
        self.db.cursor.execute("""
        SELECT student_id, full_name, email,
               password, phone_number, level, class_id
        FROM students
        WHERE student_id = ?""" + (" AND admin_id = ?" if admin_id is not None else ""),
        (student_id, admin_id) if admin_id is not None else (student_id,))

        row = self.db.cursor.fetchone()
        if row is None:
            return None

        return Student(
            row[0],
            row[1],
            row[2],
            row[3],
            row[4],
            row[5],
            row[6]
        )
    def get_all_student(self, admin_id=None):
        self.db.cursor.execute("""
        SELECT student_id, full_name, email,
               password, phone_number, level, class_id
        FROM students
        WHERE (? IS NULL OR admin_id = ?)
    """, (admin_id, admin_id))

        rows = self.db.cursor.fetchall()

        students = []

        for row in rows:
            students.append(
                Student(
                    row[0],
                    row[1],
                    row[2],
                    row[3],
                    row[4],
                    row[5],
                    row[6]
                )
            )

        return students

    def get_all_students_for_admin(self, admin_id):
        self.db.cursor.execute(
            """SELECT student_id, full_name, email,
                      password, phone_number, level, class_id
               FROM students
               WHERE admin_id = ?""",
            (admin_id,),
        )
        return [
            Student(row[0], row[1], row[2], row[3], row[4], row[5], row[6])
            for row in self.db.cursor.fetchall()
        ]

    def get_students_by_level(self, level):
        self.db.cursor.execute("""
            SELECT student_id, full_name, email,
                   password, phone_number, level, class_id
            FROM students
            WHERE UPPER(TRIM(level)) = ?
        """, (level.strip().upper(),))

        rows = self.db.cursor.fetchall()
        students = []

        for row in rows:
            students.append(
                Student(
                    row[0],
                    row[1],
                    row[2],
                    row[3],
                    row[4],
                    row[5],
                    row[6]
                )
            )

        return students

    def get_students_by_class_ids(self, class_ids):
        if not class_ids:
            return []

        placeholders = ", ".join("?" for _ in class_ids)
        self.db.cursor.execute(
            f"""SELECT student_id, full_name, email,
                      password, phone_number, level, class_id
               FROM students
               WHERE class_id IN ({placeholders})""",
            class_ids,
        )

        return [
            Student(
                row[0],
                row[1],
                row[2],
                row[3],
                row[4],
                row[5],
                row[6],
            )
            for row in self.db.cursor.fetchall()
        ]

    def get_students_by_class_id(self, class_id):
        """Fetch all students enrolled in a single class."""
        self.db.cursor.execute(
            """SELECT student_id, full_name, email,
                      password, phone_number, level, class_id
               FROM students
                    WHERE class_id = ? OR student_id IN (
                         SELECT student_id FROM student_classes WHERE class_id = ?
                    )""",
                (class_id, class_id),
        )
        return [
            Student(row[0], row[1], row[2], row[3], row[4], row[5], row[6])
            for row in self.db.cursor.fetchall()
        ]

    def get_student_class_ids(self, student_id):
        self.db.cursor.execute(
            "SELECT class_id FROM student_classes WHERE student_id = ? ORDER BY class_id",
            (student_id,),
        )
        ids = [row[0] for row in self.db.cursor.fetchall()]
        if ids:
            return ids
        student = self.get_student(student_id)
        return [student.class_id] if student and student.class_id is not None else []

    def set_student_class_ids(self, student_id, class_ids):
        self.db.cursor.execute(
            "DELETE FROM student_classes WHERE student_id = ?", (student_id,)
        )
        self.db.cursor.executemany(
            "INSERT INTO student_classes (student_id, class_id) VALUES (?, ?)",
            [(student_id, class_id) for class_id in class_ids],
        )
        self.db.cursor.execute(
            "UPDATE students SET class_id = ? WHERE student_id = ?",
            (class_ids[0] if class_ids else None, student_id),
        )
        self.db.connection.commit()

    def belongs_to_admin(self, student_id, admin_id):
        return self.db.cursor.execute(
            "SELECT 1 FROM students WHERE student_id = ? AND admin_id = ?",
            (student_id, admin_id),
        ).fetchone() is not None
        

    def update_student(self, student_id, **kwargs):
        student = self.get_student(student_id)
        if not kwargs:
            return False
        if "full_name" in kwargs:
            self.db.cursor.execute("""
        UPDATE students
            SET full_name = ?
            WHERE student_id = ?
            """, (kwargs["full_name"], student_id))


        if "email" in kwargs:
            self.db.cursor.execute("""
        UPDATE students
            SET email = ?
            WHERE student_id = ?
            """, (kwargs["email"], student_id))


        if "password" in kwargs:
                self.db.cursor.execute("""
        UPDATE students
            SET password = ?
            WHERE student_id = ?
            """, (kwargs["password"], student_id))


        if "phone_number" in kwargs:
                self.db.cursor.execute("""
        UPDATE students
            SET phone_number = ?
            WHERE student_id = ?
            """, (kwargs["phone_number"], student_id))


        if "level" in kwargs:
                self.db.cursor.execute("""
        UPDATE students
            SET level = ?
            WHERE student_id = ?
            """, (kwargs["level"], student_id))

        if "class_id" in kwargs:
            self.db.cursor.execute("""
        UPDATE students SET class_id = ? WHERE student_id = ?
            """, (kwargs["class_id"], student_id))

        self.db.connection.commit() 
                

    def delete_student(self, student_id):
        student = self.get_student(student_id)
        if student is None:
             return False
        self.db.cursor.execute("""
DELETE FROM students
WHERE student_id = ?""", (student_id,))
        self.db.connection.commit()
        return True

    
    def search_student(self, name, admin_id=None):

        self.db.cursor.execute("""
            SELECT student_id, full_name, email,
                password, phone_number, level, class_id
            FROM students
            WHERE full_name LIKE ?
        """ + (" AND admin_id = ?" if admin_id is not None else ""),
        (f"%{name}%", admin_id) if admin_id is not None else (f"%{name}%",))

        rows = self.db.cursor.fetchall()
        students = []

        for row in rows:
            students.append(
                Student(
                    row[0],
                    row[1],
                    row[2],
                    row[3],
                    row[4],
                    row[5],
                    row[6]
                )
            )

        return students

    
    def count_students(self, admin_id=None):

        self.db.cursor.execute("""
            SELECT COUNT(*)
            FROM students
        """ + (" WHERE admin_id = ?" if admin_id is not None else ""),
        (admin_id,) if admin_id is not None else ())
        result = self.db.cursor.fetchone()

        return result[0]

    def get_student_by_email(self, email):

        self.db.cursor.execute("""
            SELECT
                student_id,
                full_name,
                email,
                password,
                phone_number,
                level,
                class_id
            FROM students
            WHERE email = ?
        """, (email,))

        row = self.db.cursor.fetchone()

        if row is None:
            return None

        return Student(
            row[0],
            row[1],
            row[2],
            row[3],
            row[4],
            row[5],
            row[6]
        )
    def get_students_by_level(self, level):
        self.db.cursor.execute("""
            SELECT student_id, full_name, email, password, phone_number, level, class_id
            FROM students
            WHERE UPPER(TRIM(level)) = ?
        """, (level.strip().upper(),))

        rows = self.db.cursor.fetchall()
        students = []

        for row in rows:
            students.append(
                Student(
                    row[0],
                    row[1],
                    row[2],
                    row[3],
                    row[4],
                    row[5],
                    row[6]
                )
            )

        return students

    def get_academic_report(self, student_id):
        self.db.cursor.execute("""
            SELECT s.student_id, s.full_name, s.email, s.phone_number, s.level,
                   s.class_id, c.name, c.academic_year,
                     e.exercise_id, e.exercise_name, g.score
            FROM students s
                 LEFT JOIN classes c ON c.id = s.class_id
            LEFT JOIN exercises e ON EXISTS (
                SELECT 1 FROM courses course_for_exercise
                WHERE course_for_exercise.course_id = e.course_id
                  AND (
                      UPPER(TRIM(course_for_exercise.level)) = UPPER(TRIM(c.name))
                      OR UPPER(TRIM(course_for_exercise.level)) = UPPER(TRIM(s.level))
                  )
            )
            LEFT JOIN grades g
              ON g.student_id = s.student_id AND g.exercise_id = e.exercise_id
            WHERE s.student_id = ?
            ORDER BY e.exercise_id
        """, (student_id,))
        rows = self.db.cursor.fetchall()
        if not rows:
            return None
        first = rows[0]
        return {
            "student_id": first[0],
            "name": first[1],
            "email": first[2],
            "class_info": (
                {"class_id": first[5], "name": first[6], "academic_year": first[7]}
                if first[5] is not None else None
            ),
            "exercises_and_exams": [
                {
                    "exercise_id": row[8],
                    "exercise_name": row[9],
                    "score": row[10],
                }
                for row in rows if row[8] is not None
            ],
        }