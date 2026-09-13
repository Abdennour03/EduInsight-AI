class AttendanceRepo:
    def __init__(self, db):
        self.db = db

    def get_students_by_class(self, class_id):
        self.db.cursor.execute(
            """SELECT student_id, full_name, email, phone_number, level
               FROM students WHERE class_id = ? ORDER BY full_name""",
            (class_id,),
        )
        return [
            {
                "student_id": row[0],
                "full_name": row[1],
                "email": row[2],
                "phone_number": row[3],
                "level": row[4],
                "class_id": class_id,
            }
            for row in self.db.cursor.fetchall()
        ]

    def save_attendance(self, class_id, attendance_date, records):
        self.db.cursor.executemany(
            """INSERT INTO attendance (student_id, class_id, date, status)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(student_id, class_id, date)
               DO UPDATE SET status = excluded.status""",
            [
                (record["student_id"], class_id, attendance_date, record["status"])
                for record in records
            ],
        )
        self.db.connection.commit()

    def get_teacher_history(self, teacher_id, class_id=None, month=None):
        query = """SELECT a.student_id, s.full_name, a.class_id, a.date, a.status
                   FROM attendance a
                   JOIN students s ON s.student_id = a.student_id
                   JOIN teacher_classes tc ON tc.class_id = a.class_id
                   WHERE tc.teacher_id = ?"""
        params = [teacher_id]
        if class_id is not None:
            query += " AND a.class_id = ?"
            params.append(class_id)
        if month is not None:
            query += " AND a.date LIKE ?"
            params.append(f"{month}%")
        query += " ORDER BY a.date DESC, s.full_name"
        self.db.cursor.execute(query, params)
        return self._attendance_rows()

    def get_monthly_report(self, class_id, month):
        self.db.cursor.execute(
            """SELECT a.student_id, s.full_name, a.class_id, a.date, a.status
               FROM attendance a
               JOIN students s ON s.student_id = a.student_id
               WHERE a.class_id = ? AND a.date LIKE ?
               ORDER BY a.date, s.full_name""",
            (class_id, f"{month}%"),
        )
        return self._attendance_rows()

    def _attendance_rows(self):
        return [
            {
                "student_id": row[0],
                "student_name": row[1],
                "class_id": row[2],
                "date": row[3],
                "status": row[4],
            }
            for row in self.db.cursor.fetchall()
        ]
