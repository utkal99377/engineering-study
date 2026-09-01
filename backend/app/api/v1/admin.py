from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User
from app.models.course import Subject, Course, Module, Lecture, Resource
from app.models.assessment import TheoryQuestion, QuestionAttempt
from app.models.coding import CodingProblem, TestCase, Submission
from app.models.subscription import SubscriptionPlan, Subscription, PaymentRecord, Coupon
from app.models.audit import AuditLog, Notification
from app.models.system_setting import SystemSetting
from app.api.v1.settings import DEFAULT_SETTINGS

router = APIRouter(
    prefix="/admin",
    tags=["Dynamic Admin CMS"],
    dependencies=[Depends(require_role(["admin", "content_manager"]))]
)

# ==================== ANALYTICS & DASHBOARD ====================

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Summary metrics for Admin CMS Dashboard."""
    total_users = db.query(User).filter(User.role == "student").count()
    active_subscriptions = db.query(Subscription).filter(
        Subscription.status == "active",
        Subscription.end_at > datetime.utcnow()
    ).count()
    total_courses = db.query(Course).count()
    total_lectures = db.query(Lecture).count()
    total_questions = db.query(TheoryQuestion).count()
    total_problems = db.query(CodingProblem).count()
    total_submissions = db.query(Submission).count()
    
    # Calculate revenue
    payments = db.query(PaymentRecord).filter(PaymentRecord.status == "success").all()
    total_revenue = sum(p.amount for p in payments)

    recent_submissions = db.query(Submission).order_by(Submission.created_at.desc()).limit(8).all()
    sub_feed = []
    for s in recent_submissions:
        p = db.query(CodingProblem).filter(CodingProblem.id == s.problem_id).first()
        u = db.query(User).filter(User.id == s.user_id).first()
        sub_feed.append({
            "id": s.id,
            "user_name": u.name if u else "Student",
            "problem_title": p.title if p else "Problem",
            "language": s.language,
            "status": s.status,
            "score": s.score,
            "runtime_ms": s.runtime_ms,
            "time": s.created_at
        })

    return {
        "total_users": total_users,
        "active_subscriptions": active_subscriptions,
        "total_courses": total_courses,
        "total_lectures": total_lectures,
        "total_questions": total_questions,
        "total_problems": total_problems,
        "total_submissions": total_submissions,
        "total_revenue": round(total_revenue, 2),
        "recent_submissions": sub_feed
    }

# ==================== SUBJECT CRUD ====================

@router.post("/subjects")
def create_subject(data: Dict[str, Any], db: Session = Depends(get_db)):
    sub = Subject(
        id=f"sub_{uuid.uuid4().hex[:8]}",
        name=data["name"],
        slug=data.get("slug", data["name"].lower().replace(" ", "-")),
        icon=data.get("icon", "code"),
        description=data.get("description"),
        order_no=data.get("order_no", 1),
        status=data.get("status", "active")
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.put("/subjects/{subject_id}")
def update_subject(subject_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    sub = db.query(Subject).filter(Subject.id == subject_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    for key, val in data.items():
        if hasattr(sub, key) and key != "id":
            setattr(sub, key, val)
    db.commit()
    return sub

@router.delete("/subjects/{subject_id}")
def delete_subject(subject_id: str, db: Session = Depends(get_db)):
    sub = db.query(Subject).filter(Subject.id == subject_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(sub)
    db.commit()
    return {"success": True, "message": "Subject deleted successfully"}

# ==================== COURSE CRUD ====================

@router.post("/courses")
def create_course(data: Dict[str, Any], db: Session = Depends(get_db)):
    course = Course(
        id=f"course_{uuid.uuid4().hex[:8]}",
        subject_id=data["subject_id"],
        title=data["title"],
        slug=data.get("slug", data["title"].lower().replace(" ", "-")),
        short_description=data.get("short_description"),
        description=data.get("description"),
        thumbnail=data.get("thumbnail", "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80"),
        access_type=data.get("access_type", "free"),
        level=data.get("level", "Beginner"),
        duration_hours=data.get("duration_hours", 10),
        tags=data.get("tags", []),
        status=data.get("status", "published")
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.put("/courses/{course_id}")
def update_course(course_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for key, val in data.items():
        if hasattr(course, key) and key != "id":
            setattr(course, key, val)
    db.commit()
    return course

@router.delete("/courses/{course_id}")
def delete_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"success": True, "message": "Course deleted successfully"}

# ==================== MODULE & LECTURE CRUD ====================

@router.post("/modules")
def create_module(data: Dict[str, Any], db: Session = Depends(get_db)):
    mod = Module(
        id=f"mod_{uuid.uuid4().hex[:8]}",
        course_id=data["course_id"],
        title=data["title"],
        description=data.get("description"),
        order_no=data.get("order_no", 1)
    )
    db.add(mod)
    db.commit()
    db.refresh(mod)
    return mod

@router.put("/modules/{module_id}")
def update_module(module_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    for key, val in data.items():
        if hasattr(mod, key) and key != "id":
            setattr(mod, key, val)
    db.commit()
    db.refresh(mod)
    return mod

@router.delete("/modules/{module_id}")
def delete_module(module_id: str, db: Session = Depends(get_db)):
    mod = db.query(Module).filter(Module.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    db.delete(mod)
    db.commit()
    return {"success": True, "message": "Module deleted successfully"}

@router.post("/lectures")
def create_lecture(data: Dict[str, Any], db: Session = Depends(get_db)):
    lec = Lecture(
        id=f"lec_{uuid.uuid4().hex[:8]}",
        module_id=data["module_id"],
        title=data["title"],
        order_no=data.get("order_no", 1),
        prerequisite_id=data.get("prerequisite_id"),
        duration_min=data.get("duration_min", 20),
        video_url=data.get("video_url"),
        notes_markdown=data.get("notes_markdown", ""),
        status=data.get("status", "active")
    )
    db.add(lec)
    db.commit()
    db.refresh(lec)

    # Add any resources attached
    for r in data.get("resources", []):
        db.add(Resource(
            id=f"res_{uuid.uuid4().hex[:8]}",
            lecture_id=lec.id,
            title=r["title"],
            type=r.get("type", "notes"),
            url=r["url"],
            access_level=r.get("access_level", "free")
        ))
    db.commit()
    return lec

@router.put("/lectures/{lecture_id}")
def update_lecture(lecture_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    lec = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lec:
        raise HTTPException(status_code=404, detail="Lecture not found")
    for key, val in data.items():
        if hasattr(lec, key) and key not in ["id", "resources"]:
            setattr(lec, key, val)
    db.commit()
    return lec

@router.delete("/lectures/{lecture_id}")
def delete_lecture(lecture_id: str, db: Session = Depends(get_db)):
    lec = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lec:
        raise HTTPException(status_code=404, detail="Lecture not found")
    db.delete(lec)
    db.commit()
    return {"success": True, "message": "Lecture deleted successfully"}

# ==================== THEORY QUESTION CRUD ====================

@router.post("/questions")
def create_question(data: Dict[str, Any], db: Session = Depends(get_db)):
    q = TheoryQuestion(
        id=f"q_{uuid.uuid4().hex[:8]}",
        course_id=data["course_id"],
        module_id=data.get("module_id"),
        type=data.get("type", "mcq"),
        title=data["title"],
        text=data["text"],
        options=data.get("options", []),
        correct_answer=data["correct_answer"],
        explanation=data.get("explanation"),
        marks=data.get("marks", 2),
        difficulty=data.get("difficulty", "Easy"),
        is_important=data.get("is_important", False)
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return q

@router.put("/questions/{question_id}")
def update_question(question_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    q = db.query(TheoryQuestion).filter(TheoryQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    for key, val in data.items():
        if hasattr(q, key) and key != "id":
            setattr(q, key, val)
    db.commit()
    db.refresh(q)
    return q

@router.delete("/questions/{question_id}")
def delete_question(question_id: str, db: Session = Depends(get_db)):
    q = db.query(TheoryQuestion).filter(TheoryQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()
    return {"success": True, "message": "Question deleted"}

# ==================== CODING PROBLEM CRUD ====================

@router.post("/problems")
def create_coding_problem(data: Dict[str, Any], db: Session = Depends(get_db)):
    prob = CodingProblem(
        id=f"prob_{uuid.uuid4().hex[:8]}",
        course_id=data.get("course_id"),
        title=data["title"],
        slug=data.get("slug", data["title"].lower().replace(" ", "-")),
        difficulty=data.get("difficulty", "Easy"),
        tags=data.get("tags", []),
        statement=data["statement"],
        input_format=data.get("input_format"),
        output_format=data.get("output_format"),
        constraints=data.get("constraints"),
        time_limit_sec=data.get("time_limit_sec", 2.0),
        memory_limit_mb=data.get("memory_limit_mb", 128),
        starter_code=data.get("starter_code", {}),
        status=data.get("status", "published")
    )
    db.add(prob)
    db.flush()

    for tc in data.get("test_cases", []):
        db.add(TestCase(
            id=f"tc_{uuid.uuid4().hex[:8]}",
            problem_id=prob.id,
            input_data=tc["input_data"],
            expected_output=tc["expected_output"],
            is_hidden=tc.get("is_hidden", False),
            explanation=tc.get("explanation")
        ))

    db.commit()
    db.refresh(prob)
    return prob

@router.put("/problems/{problem_id}")
def update_coding_problem(problem_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    p = db.query(CodingProblem).filter(CodingProblem.id == problem_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    for key, val in data.items():
        if hasattr(p, key) and key not in ["id", "test_cases"]:
            setattr(p, key, val)
            
    if "test_cases" in data and isinstance(data["test_cases"], list):
        # Update or recreate test cases if provided
        db.query(TestCase).filter(TestCase.problem_id == problem_id).delete()
        for tc in data["test_cases"]:
            db.add(TestCase(
                id=f"tc_{uuid.uuid4().hex[:8]}",
                problem_id=p.id,
                input_data=tc["input_data"],
                expected_output=tc["expected_output"],
                is_hidden=tc.get("is_hidden", False),
                explanation=tc.get("explanation")
            ))
            
    db.commit()
    db.refresh(p)
    return p

@router.delete("/problems/{problem_id}")
def delete_coding_problem(problem_id: str, db: Session = Depends(get_db)):
    p = db.query(CodingProblem).filter(CodingProblem.id == problem_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    db.delete(p)
    db.commit()
    return {"success": True, "message": "Problem deleted"}

# ==================== USERS & ROLES ====================

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    """List all registered users."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "college_branch": u.college_branch,
            "semester": u.semester,
            "status": u.status,
            "created_at": u.created_at
        } for u in users
    ]

@router.put("/users/{user_id}/role")
def update_user_role(user_id: str, data: Dict[str, str], db: Session = Depends(get_db)):
    """Promote or change user role."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_role = data.get("role")
    if new_role not in ["student", "admin", "content_manager"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")
    user.role = new_role
    db.commit()
    return {"success": True, "user_id": user.id, "role": user.role}

# ==================== PLANS & COUPONS ====================

@router.post("/plans")
def create_subscription_plan(data: Dict[str, Any], db: Session = Depends(get_db)):
    plan = SubscriptionPlan(
        id=f"plan_{uuid.uuid4().hex[:8]}",
        name=data["name"],
        slug=data.get("slug", data["name"].lower().replace(" ", "-")),
        price=data.get("price", 0.0),
        currency=data.get("currency", "INR"),
        duration_days=data.get("duration_days", 30),
        description=data.get("description"),
        features=data.get("features", []),
        is_active=data.get("is_active", True),
        is_popular=data.get("is_popular", False)
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.put("/plans/{plan_id}")
def update_subscription_plan(plan_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    for key, val in data.items():
        if hasattr(plan, key) and key != "id":
            setattr(plan, key, val)
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/plans/{plan_id}")
def delete_subscription_plan(plan_id: str, db: Session = Depends(get_db)):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(plan)
    db.commit()
    return {"success": True, "message": "Plan deleted successfully"}

@router.post("/coupons")
def create_coupon(data: Dict[str, Any], db: Session = Depends(get_db)):
    coupon = Coupon(
        id=f"coup_{uuid.uuid4().hex[:8]}",
        code=data["code"].upper().strip(),
        discount_type=data.get("discount_type", "percentage"),
        value=data.get("value", 10.0),
        max_discount=data.get("max_discount", 1000.0),
        usage_limit=data.get("usage_limit", 100),
        is_active=data.get("is_active", True),
        description=data.get("description")
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon

# ==================== DYNAMIC APP SETTINGS & CMS ====================

@router.get("/settings")
def get_admin_settings(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Retrieve all dynamic system settings for admin CMS."""
    db_settings = db.query(SystemSetting).all()
    result = dict(DEFAULT_SETTINGS)
    for s in db_settings:
        result[s.key] = s.get_parsed_value()
    return result

@router.post("/settings")
def save_admin_settings(data: Dict[str, Any], db: Session = Depends(get_db)):
    """Save or update platform dynamic settings (hero text, announcement banner, features)."""
    for key, val in data.items():
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if not setting:
            setting = SystemSetting(key=key, category="general")
            setting.set_value(val)
            db.add(setting)
        else:
            setting.set_value(val)
    db.commit()
    return {"success": True, "message": "Dynamic settings saved successfully", "settings": data}

