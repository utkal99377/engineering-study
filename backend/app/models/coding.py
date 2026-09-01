from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class CodingProblem(Base):
    __tablename__ = "coding_problems"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    course_id = Column(String(64), ForeignKey("courses.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(256), nullable=False)
    slug = Column(String(256), unique=True, index=True, nullable=False)
    difficulty = Column(String(32), default="Easy")  # Easy, Medium, Hard
    tags = Column(JSON, default=list)
    statement = Column(Text, nullable=False)
    input_format = Column(Text, nullable=True)
    output_format = Column(Text, nullable=True)
    constraints = Column(Text, nullable=True)
    time_limit_sec = Column(Float, default=2.0)
    memory_limit_mb = Column(Integer, default=128)
    starter_code = Column(JSON, default=dict)  # {"python": "...", "c": "...", "cpp": "...", "javascript": "..."}
    status = Column(String(32), default="published")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    course = relationship("Course", back_populates="coding_problems")
    test_cases = relationship("TestCase", back_populates="problem", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="problem", cascade="all, delete-orphan")

class TestCase(Base):
    __tablename__ = "test_cases"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    problem_id = Column(String(64), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False, index=True)
    input_data = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
    is_hidden = Column(Boolean, default=False)
    explanation = Column(Text, nullable=True)
    order_no = Column(Integer, default=1)
    
    problem = relationship("CodingProblem", back_populates="test_cases")

class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(String(64), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False, index=True)
    language = Column(String(32), nullable=False)  # python, c, cpp, java, javascript
    code = Column(Text, nullable=False)
    status = Column(String(64), default="Pending")  # Accepted, Wrong Answer, Time Limit Exceeded, Compilation Error, Runtime Error
    passed_test_cases = Column(Integer, default=0)
    total_test_cases = Column(Integer, default=0)
    runtime_ms = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    problem = relationship("CodingProblem", back_populates="submissions")
