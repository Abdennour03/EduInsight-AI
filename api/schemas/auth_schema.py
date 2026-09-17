from pydantic import BaseModel


class LoginRequest(BaseModel):
    identifier: str | None = None
    email: str | None = None
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str