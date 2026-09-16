from models.class_group import ClassGroup


class ClassService:
    def __init__(self, class_repo):
        self.class_repo = class_repo

    def create_class(self, name, academic_year, admin_id=None):
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Class name is required.")
        if not isinstance(academic_year, str) or not academic_year.strip():
            raise ValueError("Academic year is required.")
        class_group = ClassGroup(None, name.strip(), academic_year.strip())
        self.class_repo.add_class(class_group, admin_id)
        return class_group

    def get_class(self, class_id, admin_id=None, organization_id=None):
        class_group = self.class_repo.get_class(class_id, admin_id, organization_id)
        if class_group is None:
            raise ValueError("Class not found.")
        return class_group

    def get_all_classes(self, admin_id=None):
        return self.class_repo.get_all_classes(admin_id)

    def search_classes(self, query):
        if not isinstance(query, str) or not query.strip():
            raise ValueError("Search query cannot be empty.")
        return self.class_repo.search_classes(query.strip())

    def update_class(self, class_id, admin_id=None, **updates):
        self.get_class(class_id, admin_id)
        if "name" in updates and not updates["name"].strip():
            raise ValueError("Class name is required.")
        if "academic_year" in updates and not updates["academic_year"].strip():
            raise ValueError("Academic year is required.")
        self.class_repo.update_class(class_id, admin_id, **updates)
        return "Class updated successfully."

    def delete_class(self, class_id, admin_id=None):
        self.get_class(class_id, admin_id)
        self.class_repo.delete_class(class_id, admin_id)
        return "Class deleted successfully."