class AuthController:
    def __init__(self, auth_service):
        self.auth_service = auth_service

    def login(self, identifier, password):
        return self.auth_service.login(identifier, password)
