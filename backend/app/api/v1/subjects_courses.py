from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user_optional, get_current_user
from app.models.user import User
from app.models.course import Subject, Course, Module, Lecture
from app.models.progress import CourseProgress
from app.services.progression_service import ProgressionService
from app.services.entitlement_service import EntitlementService
from app.schemas.course import (
    SubjectOut,
    CourseOut,
    CourseDetailOut
)

router = APIRouter(tags=["Subjects & Courses"])

@router.get("/subjects", response_model=List[SubjectOut])
def list_subjects(db: Session = Depends(get_db)):
    """List all active B.Tech subjects and programming languages."""
    subjects = db.query(Subject).filter(Subject.status == "active").order_by(Subject.order_no).all()
    res = []
    for s in subjects:
        c_count = db.query(Course).filter(Course.subject_id == s.id, Course.status == "published").count()
        res.append({
            "id": s.id,
            "name": s.name,
            "slug": s.slug,
            "icon": s.icon,
            "description": s.description,
            "order_no": s.order_no,
            "status": s.status,
            "created_at": s.created_at,
            "courses_count": c_count
        })
    return res

@router.get("/courses", response_model=List[CourseOut])
def list_courses(
    subject_id: Optional[str] = Query(None),
    access_type: Optional[str] = Query(None),  # free, premium
    level: Optional[str] = Query(None),        # Beginner, Intermediate, Advanced
    search: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """List courses with dynamic filtering and search."""
    query = db.query(Course).filter(Course.status == "published")

    if subject_id:
        query = query.filter(Course.subject_id == subject_id)
    if access_type:
        query = query.filter(Course.access_type == access_type.lower())
    if level:
        query = query.filter(Course.level == level)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            (Course.title.ilike(term)) | 
            (Course.description.ilike(term)) |
            (Course.short_description.ilike(term))
        )

    query = query.order_by(Course.created_at.desc())
    if limit and limit > 0:
        query = query.limit(limit)

    courses = query.all()
    results = []

    for c in courses:
        mod_count = len(c.modules)
        lec_count = sum(len(m.lectures) for m in c.modules)
        
        user_pct = 0
        if current_user:
            prog = db.query(CourseProgress).filter(
                CourseProgress.user_id == current_user.id,
                CourseProgress.course_id == c.id
            ).first()
            if prog:
                user_pct = prog.percentage

        results.append({
            "id": c.id,
            "subject_id": c.subject_id,
            "title": c.title,
            "slug": c.slug,
            "short_description": c.short_description,
            "description": c.description,
            "thumbnail": c.thumbnail,
            "access_type": c.access_type,
            "level": c.level,
            "duration_hours": c.duration_hours,
            "tags": c.tags or [],
            "status": c.status,
            "created_at": c.created_at,
            "modules_count": mod_count,
            "lectures_count": lec_count,
            "subject_name": c.subject.name if c.subject else None,
            "user_progress_percentage": user_pct
        })

    return results

@router.get("/courses/{course_id_or_slug}", response_model=CourseDetailOut)
def get_course_detail(
    course_id_or_slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get full course detail with hierarchical modules, lectures, and sequential unlock states."""
    course = db.query(Course).filter(
        (Course.id == course_id_or_slug) | (Course.slug == course_id_or_slug)
    ).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found."
        )

    # Calculate sequential progression tree
    tree_data = ProgressionService.get_course_progression_tree(db, current_user, course)
    has_premium_access, _ = EntitlementService.has_course_access(db, current_user, course)

    return {
        "id": course.id,
        "subject_id": course.subject_id,
        "title": course.title,
        "slug": course.slug,
        "short_description": course.short_description,
        "description": course.description,
        "thumbnail": course.thumbnail,
        "access_type": course.access_type,
        "level": course.level,
        "duration_hours": course.duration_hours,
        "tags": course.tags or [],
        "status": course.status,
        "created_at": course.created_at,
        "modules_count": len(course.modules),
        "lectures_count": tree_data["total_lectures"],
        "subject_name": course.subject.name if course.subject else None,
        "user_progress_percentage": tree_data["progress_percentage"],
        "modules": tree_data["modules"],
        "has_premium_access": has_premium_access
    }

@router.get("/progress/my-courses")
def get_enrolled_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all courses currently in progress or completed by the student."""
    progress_records = db.query(CourseProgress).filter(
        CourseProgress.user_id == current_user.id
    ).all()

    items = []
    for p in progress_records:
        c = db.query(Course).filter(Course.id == p.course_id).first()
        if c:
            items.append({
                "course_id": c.id,
                "title": c.title,
                "slug": c.slug,
                "thumbnail": c.thumbnail,
                "subject_name": c.subject.name if c.subject else "",
                "completed_lectures": p.completed_lectures_count,
                "total_lectures": p.total_lectures_count,
                "percentage": p.percentage,
                "is_completed": p.is_completed == "true",
                "last_accessed_lecture_id": p.last_accessed_lecture_id
            })

    return items
