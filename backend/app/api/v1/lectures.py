from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional, generate_watermark_signature
from app.models.user import User
from app.models.course import Lecture, Module, Course
from app.models.progress import LectureProgress
from app.services.progression_service import ProgressionService
from app.services.entitlement_service import EntitlementService
from app.schemas.course import LectureOut

router = APIRouter(prefix="/lectures", tags=["Lectures & Player"])

@router.get("/{lecture_id}", response_model=LectureOut)
def get_lecture_details(
    lecture_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get lecture details with server-enforced unlock and dynamic security watermark.
    """
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lecture not found."
        )

    module = db.query(Module).filter(Module.id == lecture.module_id).first()
    course = db.query(Course).filter(Course.id == module.course_id).first()

    completed_ids = set()
    if current_user:
        records = db.query(LectureProgress).filter(
            LectureProgress.user_id == current_user.id,
            LectureProgress.status == "completed"
        ).all()
        completed_ids = {r.lecture_id for r in records}

    access_state = ProgressionService.evaluate_lecture_state(
        db, current_user, lecture, course, completed_ids
    )

    if access_state == "premium_locked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This lecture belongs to a Premium Course. Please upgrade to B.Tech Pro to access."
        )

    if access_state == "locked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This lecture is locked. You must complete the previous prerequisite lecture first."
        )

    # If user has access and is logged in, mark as in_progress if not already started
    if current_user and access_state == "available":
        existing = db.query(LectureProgress).filter(
            LectureProgress.user_id == current_user.id,
            LectureProgress.lecture_id == lecture.id
        ).first()
        if not existing:
            db.add(LectureProgress(
                user_id=current_user.id,
                lecture_id=lecture.id,
                status="in_progress"
            ))
            db.commit()

    # Generate dynamic security watermark
    watermark_data = None
    if current_user:
        watermark_data = generate_watermark_signature(
            user_id=current_user.id,
            email=current_user.email,
            resource_id=lecture.id
        )

    return {
        "id": lecture.id,
        "module_id": lecture.module_id,
        "title": lecture.title,
        "order_no": lecture.order_no,
        "prerequisite_id": lecture.prerequisite_id,
        "duration_min": lecture.duration_min,
        "video_url": lecture.video_url,
        "notes_markdown": lecture.notes_markdown,
        "status": lecture.status,
        "access_state": access_state,
        "is_unlocked": True,
        "watermark": watermark_data,
        "resources": [
            {
                "id": r.id,
                "lecture_id": r.lecture_id,
                "title": r.title,
                "type": r.type,
                "url": r.url,
                "access_level": r.access_level
            } for r in lecture.resources
        ]
    }

@router.post("/{lecture_id}/complete")
def complete_lecture(
    lecture_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a lecture as completed and unlock the next sequential lecture."""
    res = ProgressionService.mark_lecture_completed(db, current_user, lecture_id)
    if not res["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["message"]
        )
    return res
