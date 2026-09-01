from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class SendOTPRequest(BaseModel):
    email: EmailStr
    purpose: Optional[str] = "registration"

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str
    purpose: Optional[str] = "registration"

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    otp: Optional[str] = None
    college_branch: Optional[str] = "B.Tech CSE/IT"
    semester: Optional[str] = "3rd Semester"

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    admin_passcode: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    college_branch: Optional[str]
    semester: Optional[str]
    avatar: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    college_branch: Optional[str] = None
    semester: Optional[str] = None
    avatar: Optional[str] = None
