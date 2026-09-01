from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(128), nullable=False)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    icon = Column(String(64), default="code")
    description = Column(Text, nullable=True)
    order_no = Column(Integer, default=1)
    status = Column(String(32), default="active")  # active, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    
    courses = relationship("Course", back_populates="subject", cascade="all, delete-orphan")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    subject_id = Column(String(64), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(256), nullable=False)
    slug = Column(String(256), unique=True, index=True, nullable=False)
    short_description = Column(String(512), nullable=True)
    description = Column(Text, nullable=True)
    thumbnail = Column(String(512), default="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80")
    access_type = Column(String(32), default="free")  # free, premium
    level = Column(String(32), default="Beginner")   # Beginner, Intermediate, Advanced
    duration_hours = Column(Integer, default=10)
    tags = Column(JSON, default=list)
    status = Column(String(32), default="published")  # published, draft, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    subject = relationship("Subject", back_populates="courses")
    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan", order_by="Module.order_no")
    questions = relationship("TheoryQuestion", back_populates="course", cascade="all, delete-orphan")
    coding_problems = relationship("CodingProblem", back_populates="course", cascade="all, delete-orphan")

class Module(Base):
    __tablename__ = "modules"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    course_id = Column(String(64), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    order_no = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    course = relationship("Course", back_populates="modules")
    lectures = relationship("Lecture", back_populates="module", cascade="all, delete-orphan", order_by="Lecture.order_no")

class Lecture(Base):
    __tablename__ = "lectures"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    module_id = Column(String(64), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(256), nullable=False)
    order_no = Column(Integer, default=1)
    prerequisite_id = Column(String(64), nullable=True)  # ID of previous lecture that must be completed
    duration_min = Column(Integer, default=20)
    video_url = Column(String(512), nullable=True)
    notes_markdown = Column(Text, nullable=True)
    status = Column(String(32), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    module = relationship("Module", back_populates="lectures")
    resources = relationship("Resource", back_populates="lecture", cascade="all, delete-orphan")
    progress_records = relationship("LectureProgress", back_populates="lecture", cascade="all, delete-orphan")

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    lecture_id = Column(String(64), ForeignKey("lectures.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(256), nullable=False)
    type = Column(String(32), default="notes")  # video, notes, document, image, code
    url = Column(String(512), nullable=False)
    access_level = Column(String(32), default="free")  # free, premium
    created_at = Column(DateTime, default=datetime.utcnow)
    
    lecture = relationship("Lecture", back_populates="resources")
