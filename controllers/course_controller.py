class CourseController:
    def __init__(self, course_service):
        self.course_service = course_service

    def create_course(self, course_name, teacher_id, level, semester):
        return self.course_service.create_course(course_name, teacher_id, level, semester)

    def get_course(self, course_id, organization_id=None):
        return self.course_service.get_course(course_id, organization_id)

    def get_all_courses(self, organization_id=None):
        return self.course_service.get_all_courses(organization_id)

    def update_course(self, course_id, teacher_id=None, **kwargs):
        return self.course_service.update_course(course_id, teacher_id, **kwargs)

    def delete_course(self, course_id, teacher_id=None):
        return self.course_service.delete_course(course_id, teacher_id)

    def search_course(self, query, organization_id=None):
        return self.course_service.search_course(query, organization_id)

    def count_courses(self, organization_id=None):
        if organization_id is None:
            return self.course_service.count_courses()
        return self.course_service.count_courses(organization_id)

    def get_courses_by_level(self, level):
        return self.course_service.get_courses_by_level(level)

    def get_courses_by_class_id(self, class_id, organization_id=None):
        return self.course_service.get_courses_by_class_id(class_id, organization_id)

    def get_courses_by_teacher(self, teacher_id, organization_id=None):
        return self.course_service.get_courses_by_teacher(teacher_id, organization_id)
