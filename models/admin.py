class Admin:
    def __init__(self, admin_id, full_name, email, password, created_at=None, organization_id=None):
        self.admin_id = admin_id
        self.id = admin_id
        self.full_name = full_name
        self.email = email
        self.password = password
        self.password_hash = password
        self.created_at = created_at
        self.organization_id = organization_id