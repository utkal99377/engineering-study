from sqlalchemy import Column, String, DateTime, Boolean, Text
from datetime import datetime
import uuid

from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(32), default="student", nullable=False)  # student, admin, content_manager
    college_branch = Column(String(128), default="B.Tech Computer Science & Engineering")
    semester = Column(String(32), default="3rd Semester")
    avatar = Column(String(512), default="https://api.dicebear.com/7.x/bottts/svg?seed=engineer")
    status = Column(String(32), default="active")  # active, suspended, deactivated
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EmailOTP(Base):
    __tablename__ = "email_otps"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    email = Column(String(128), index=True, nullable=False)
    otp_code = Column(String(16), nullable=False)
    purpose = Column(String(32), default="registration")  # registration, login, reset_password
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
