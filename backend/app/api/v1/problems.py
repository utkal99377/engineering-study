from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user_optional, get_current_user
from app.models.user import User
from app.models.coding import CodingProblem, TestCase, Submission
from app.schemas.coding import (
    CodingProblemOut,
    TestCaseOut,
    SubmissionOut
)

router = APIRouter(prefix="/problems", tags=["Coding Problems"])

@router.get("", response_model=List[CodingProblemOut])
def list_problems(
    difficulty: Optional[str] = Query(None),
    course_id: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """List coding problems with difficulty, tags, and solved indicators."""
    query = db.query(CodingProblem).filter(CodingProblem.status == "published")
    if difficulty:
        query = query.filter(CodingProblem.difficulty == difficulty)
    if course_id:
        query = query.filter(CodingProblem.course_id == course_id)
    if search:
        query = query.filter(CodingProblem.title.ilike(f"%{search.strip()}%"))

    problems = query.order_by(CodingProblem.created_at.desc()).all()
    results = []

    # Map user submissions if logged in
    solved_map = {}
    if current_user:
        user_subs = db.query(Submission).filter(Submission.user_id == current_user.id).all()
        for s in user_subs:
            if s.status == "Accepted":
                solved_map[s.problem_id] = "solved"
            elif s.problem_id not in solved_map:
                solved_map[s.problem_id] = "attempted"

    for p in problems:
        # Get sample test cases (non-hidden only)
        sample_tcs = db.query(TestCase).filter(
            TestCase.problem_id == p.id,
            TestCase.is_hidden == False
        ).order_by(TestCase.order_no).all()

        sub_count = db.query(Submission).filter(Submission.problem_id == p.id).count()

        results.append({
            "id": p.id,
            "course_id": p.course_id,
            "title": p.title,
            "slug": p.slug,
            "difficulty": p.difficulty,
            "tags": p.tags or [],
            "statement": p.statement,
            "input_format": p.input_format,
            "output_format": p.output_format,
            "constraints": p.constraints,
            "time_limit_sec": p.time_limit_sec,
            "memory_limit_mb": p.memory_limit_mb,
            "starter_code": p.starter_code or {},
            "status": p.status,
            "created_at": p.created_at,
            "sample_test_cases": sample_tcs,
            "submissions_count": sub_count,
            "solved_status": solved_map.get(p.id, "unsolved")
        })

    return results

@router.get("/{problem_id_or_slug}", response_model=CodingProblemOut)
def get_problem_detail(
    problem_id_or_slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get single coding problem with sample test cases (hidden test cases protected)."""
    p = db.query(CodingProblem).filter(
        (CodingProblem.id == problem_id_or_slug) | (CodingProblem.slug == problem_id_or_slug)
    ).first()

    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coding problem not found."
        )

    sample_tcs = db.query(TestCase).filter(
        TestCase.problem_id == p.id,
        TestCase.is_hidden == False
    ).order_by(TestCase.order_no).all()

    solved_status = "unsolved"
    if current_user:
        has_accepted = db.query(Submission).filter(
            Submission.user_id == current_user.id,
            Submission.problem_id == p.id,
            Submission.status == "Accepted"
        ).first()
        if has_accepted:
            solved_status = "solved"
        else:
            has_attempt = db.query(Submission).filter(
                Submission.user_id == current_user.id,
                Submission.problem_id == p.id
            ).first()
            if has_attempt:
                solved_status = "attempted"

    sub_count = db.query(Submission).filter(Submission.problem_id == p.id).count()

    return {
        "id": p.id,
        "course_id": p.course_id,
        "title": p.title,
        "slug": p.slug,
        "difficulty": p.difficulty,
        "tags": p.tags or [],
        "statement": p.statement,
        "input_format": p.input_format,
        "output_format": p.output_format,
        "constraints": p.constraints,
        "time_limit_sec": p.time_limit_sec,
        "memory_limit_mb": p.memory_limit_mb,
        "starter_code": p.starter_code or {},
        "status": p.status,
        "created_at": p.created_at,
        "sample_test_cases": sample_tcs,
        "submissions_count": sub_count,
        "solved_status": solved_status
    }

@router.get("/{problem_id}/submissions", response_model=List[SubmissionOut])
def get_problem_submissions(
    problem_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get student's submission history for a specific problem."""
    submissions = db.query(Submission).filter(
        Submission.user_id == current_user.id,
        Submission.problem_id == problem_id
    ).order_by(Submission.created_at.desc()).all()

    return submissions
