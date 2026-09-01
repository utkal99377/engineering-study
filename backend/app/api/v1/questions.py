from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.assessment import TheoryQuestion, QuestionAttempt
from app.schemas.assessment import (
    TheoryQuestionOut,
    QuestionAttemptCreate,
    QuestionAttemptResult
)

router = APIRouter(prefix="/questions", tags=["Theory Practice & MCQs"])

@router.get("", response_model=List[TheoryQuestionOut])
def list_questions(
    course_id: Optional[str] = Query(None),
    type: Optional[str] = Query(None),  # mcq, short_answer, long_answer, important_question
    is_important: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """List theory questions and MCQs with optional filters."""
    query = db.query(TheoryQuestion)
    if course_id:
        query = query.filter(TheoryQuestion.course_id == course_id)
    if type:
        query = query.filter(TheoryQuestion.type == type)
    if is_important is not None:
        query = query.filter(TheoryQuestion.is_important == is_important)

    questions = query.all()
    res = []

    # Map previous attempts if logged in
    user_attempts_map = {}
    if current_user:
        attempts = db.query(QuestionAttempt).filter(
            QuestionAttempt.user_id == current_user.id
        ).all()
        for a in attempts:
            user_attempts_map[a.question_id] = {
                "submitted_answer": a.submitted_answer,
                "is_correct": a.is_correct,
                "score_obtained": a.score_obtained
            }

    for q in questions:
        res.append({
            "id": q.id,
            "course_id": q.course_id,
            "module_id": q.module_id,
            "type": q.type,
            "title": q.title,
            "text": q.text,
            "options": q.options or [],
            "explanation": q.explanation,
            "marks": q.marks,
            "difficulty": q.difficulty,
            "is_important": q.is_important,
            "user_attempt": user_attempts_map.get(q.id)
        })

    return res

@router.post("/{question_id}/attempt", response_model=QuestionAttemptResult)
def attempt_question(
    question_id: str,
    req: QuestionAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit an answer to a theory question or MCQ with instant automated grading."""
    question = db.query(TheoryQuestion).filter(TheoryQuestion.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found."
        )

    # Clean and compare submitted answer
    sub_ans = req.submitted_answer.strip()
    corr_ans = question.correct_answer.strip()
    is_correct = (sub_ans.lower() == corr_ans.lower())
    score = question.marks if is_correct else 0

    # Record or update attempt
    attempt = db.query(QuestionAttempt).filter(
        QuestionAttempt.user_id == current_user.id,
        QuestionAttempt.question_id == question.id
    ).first()

    if not attempt:
        attempt = QuestionAttempt(
            user_id=current_user.id,
            question_id=question.id,
            submitted_answer=sub_ans,
            is_correct=is_correct,
            score_obtained=score
        )
        db.add(attempt)
    else:
        attempt.submitted_answer = sub_ans
        attempt.is_correct = is_correct
        attempt.score_obtained = score

    db.commit()

    return {
        "question_id": question.id,
        "submitted_answer": sub_ans,
        "correct_answer": question.correct_answer,
        "is_correct": is_correct,
        "score_obtained": score,
        "marks": question.marks,
        "explanation": question.explanation
    }

@router.get("/stats/summary")
def get_practice_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get aggregated student assessment scores and accuracy."""
    total_attempts = db.query(QuestionAttempt).filter(QuestionAttempt.user_id == current_user.id).count()
    correct_attempts = db.query(QuestionAttempt).filter(
        QuestionAttempt.user_id == current_user.id,
        QuestionAttempt.is_correct == True
    ).count()

    accuracy = int((correct_attempts / total_attempts * 100)) if total_attempts > 0 else 0

    return {
        "total_attempted": total_attempts,
        "correct_count": correct_attempts,
        "accuracy_percentage": accuracy
    }
