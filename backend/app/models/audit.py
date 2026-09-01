from sqlalchemy import Column, String, DateTime, Text, JSON, Boolean
from datetime import datetime
import uuid

from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    admin_id = Column(String(64), nullable=False)
    action = Column(String(128), nullable=False)  # CREATE_COURSE, DELETE_LECTURE, UPDATE_PLAN, etc.
    entity_type = Column(String(64), nullable=False)  # Course, Lecture, Subscription, User
    entity_id = Column(String(64), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    title = Column(String(256), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(32), default="info")  # info, warning, success, announcement
    target_rule = Column(String(64), default="all")  # all, premium, free
    is_active = Column(Boolean, default=True)
    published_at = Column(DateTime, default=datetime.utcnow)
