from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TheoryQuestionBase(BaseModel):
    course_id: str
    module_id: Optional[str] = None
    type: Optional[str] = "mcq"  # mcq, short_answer, long_answer, important_question
    title: str
    text: str
    options: Optional[List[str]] = []
    correct_answer: str
    explanation: Optional[str] = None
    marks: Optional[int] = 2
    difficulty: Optional[str] = "Easy"
    is_important: Optional[bool] = False

class TheoryQuestionOut(BaseModel):
    id: str
    course_id: str
    module_id: Optional[str]
    type: str
    title: str
    text: str
    options: List[str] = []
    # For students, correct_answer & explanation may be hidden until attempt or revealed in practice mode
    explanation: Optional[str] = None
    marks: int
    difficulty: str
    is_important: bool
    user_attempt: Optional[dict] = None

    class Config:
        from_attributes = True

class QuestionAttemptCreate(BaseModel):
    submitted_answer: str

class QuestionAttemptResult(BaseModel):
    question_id: str
    submitted_answer: str
    correct_answer: str
    is_correct: bool
    score_obtained: int
    marks: int
    explanation: Optional[str]
