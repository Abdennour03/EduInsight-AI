from fastapi import APIRouter, HTTPException

from api.schemas.auth_schema import (
    LoginRequest,
    LoginResponse
)

from api.dependencies import auth_controller


router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest):

    identifier = data.identifier or data.email
    if not identifier:
        raise HTTPException(
            status_code=422,
            detail="Email or phone number is required"
        )

    result = auth_controller.login(
        identifier,
        data.password
    )

    if result is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid email/phone number or password"
        )

    return result