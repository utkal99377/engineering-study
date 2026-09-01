from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class TheoryQuestion(Base):
    __tablename__ = "theory_questions"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    course_id = Column(String(64), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(String(64), nullable=True)
    type = Column(String(32), default="mcq")  # mcq, short_answer, long_answer, important_question
    title = Column(String(256), nullable=False)
    text = Column(Text, nullable=False)
    options = Column(JSON, default=list)  # list of 4 strings for MCQs
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    marks = Column(Integer, default=2)
    difficulty = Column(String(32), default="Easy")  # Easy, Medium, Hard
    is_important = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    course = relationship("Course", back_populates="questions")
    attempts = relationship("QuestionAttempt", back_populates="question", cascade="all, delete-orphan")

class QuestionAttempt(Base):
    __tablename__ = "question_attempts"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(64), ForeignKey("theory_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    submitted_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    score_obtained = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    question = relationship("TheoryQuestion", back_populates="attempts")
