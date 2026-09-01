import json
from pathlib import Path
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.course import Subject, Course, Module, Lecture, Resource
from app.models.assessment import TheoryQuestion
from app.models.coding import CodingProblem, TestCase
from app.models.subscription import SubscriptionPlan, Coupon, Subscription
from app.models.audit import Notification

class SeederService:
    @staticmethod
    def seed_all(db: Session, datasets_dir: Path = settings.DATASETS_PATH) -> dict:
        """Seed default admin, student, subjects, courses, modules, MCQs, problems, and plans."""
        stats = {
            "users": 0,
            "subjects": 0,
            "courses": 0,
            "modules": 0,
            "lectures": 0,
            "questions": 0,
            "problems": 0,
            "plans": 0,
            "coupons": 0
        }

        # 1. Create Default Admin & Student Users
        admin = db.query(User).filter(User.email == "admin@btechlearn.edu").first()
        if not admin:
            admin = User(
                id="user_admin_01",
                name="Prof. Sharma (Admin)",
                email="admin@btechlearn.edu",
                hashed_password=get_password_hash("Admin@2026"),
                role="admin",
                college_branch="Department of Computer Science & Engineering",
                semester="Faculty / Admin",
                status="active"
            )
            db.add(admin)
            stats["users"] += 1

        student = db.query(User).filter(User.email == "student@btechlearn.edu").first()
        if not student:
            student = User(
                id="user_student_01",
                name="Rahul Verma",
                email="student@btechlearn.edu",
                hashed_password=get_password_hash("Student@2026"),
                role="student",
                college_branch="B.Tech Computer Science & Engineering",
                semester="3rd Semester",
                status="active"
            )
            db.add(student)
            stats["users"] += 1

        # 2. Seed Subjects
        subj_file = datasets_dir / "subjects.json"
        if subj_file.exists():
            with open(subj_file, "r", encoding="utf-8") as f:
                subjects_data = json.load(f)
                for s in subjects_data:
                    existing = db.query(Subject).filter(Subject.id == s["id"]).first()
                    if not existing:
                        db.add(Subject(
                            id=s["id"],
                            name=s["name"],
                            slug=s["slug"],
                            icon=s.get("icon", "code"),
                            description=s.get("description"),
                            order_no=s.get("order_no", 1),
                            status=s.get("status", "active")
                        ))
                        stats["subjects"] += 1

        # 3. Seed Courses
        courses_file = datasets_dir / "courses.json"
        if courses_file.exists():
            with open(courses_file, "r", encoding="utf-8") as f:
                courses_data = json.load(f)
                for c in courses_data:
                    existing = db.query(Course).filter(Course.id == c["id"]).first()
                    if not existing:
                        db.add(Course(
                            id=c["id"],
                            subject_id=c["subject_id"],
                            title=c["title"],
                            slug=c["slug"],
                            short_description=c.get("short_description"),
                            description=c.get("description"),
                            thumbnail=c.get("thumbnail"),
                            access_type=c.get("access_type", "free"),
                            level=c.get("level", "Beginner"),
                            duration_hours=c.get("duration_hours", 10),
                            tags=c.get("tags", []),
                            status=c.get("status", "published")
                        ))
                        stats["courses"] += 1

        # Commit courses before modules
        db.commit()

        # 4. Seed Modules, Lectures & Resources
        mod_file = datasets_dir / "modules_lectures.json"
        if mod_file.exists():
            with open(mod_file, "r", encoding="utf-8") as f:
                modules_data = json.load(f)
                for m in modules_data:
                    mod_obj = db.query(Module).filter(Module.id == m["id"]).first()
                    if not mod_obj:
                        mod_obj = Module(
                            id=m["id"],
                            course_id=m["course_id"],
                            title=m["title"],
                            description=m.get("description"),
                            order_no=m.get("order_no", 1)
                        )
                        db.add(mod_obj)
                        db.flush()
                        stats["modules"] += 1

                    for lec in m.get("lectures", []):
                        lec_obj = db.query(Lecture).filter(Lecture.id == lec["id"]).first()
                        if not lec_obj:
                            lec_obj = Lecture(
                                id=lec["id"],
                                module_id=mod_obj.id,
                                title=lec["title"],
                                order_no=lec.get("order_no", 1),
                                prerequisite_id=lec.get("prerequisite_id"),
                                duration_min=lec.get("duration_min", 20),
                                video_url=lec.get("video_url"),
                                notes_markdown=lec.get("notes_markdown"),
                                status=lec.get("status", "active")
                            )
                            db.add(lec_obj)
                            db.flush()
                            stats["lectures"] += 1

                            for res in lec.get("resources", []):
                                if not db.query(Resource).filter(Resource.id == res["id"]).first():
                                    db.add(Resource(
                                        id=res["id"],
                                        lecture_id=lec_obj.id,
                                        title=res["title"],
                                        type=res.get("type", "notes"),
                                        url=res["url"],
                                        access_level=res.get("access_level", "free")
                                    ))

        # 5. Seed Theory Questions
        q_file = datasets_dir / "theory_questions.json"
        if q_file.exists():
            with open(q_file, "r", encoding="utf-8") as f:
                questions_data = json.load(f)
                for q in questions_data:
                    existing = db.query(TheoryQuestion).filter(TheoryQuestion.id == q["id"]).first()
                    if not existing:
                        db.add(TheoryQuestion(
                            id=q["id"],
                            course_id=q["course_id"],
                            module_id=q.get("module_id"),
                            type=q.get("type", "mcq"),
                            title=q["title"],
                            text=q["text"],
                            options=q.get("options", []),
                            correct_answer=q["correct_answer"],
                            explanation=q.get("explanation"),
                            marks=q.get("marks", 2),
                            difficulty=q.get("difficulty", "Easy"),
                            is_important=q.get("is_important", False)
                        ))
                        stats["questions"] += 1

        # 6. Seed Coding Problems & Test Cases
        p_file = datasets_dir / "coding_problems.json"
        if p_file.exists():
            with open(p_file, "r", encoding="utf-8") as f:
                problems_data = json.load(f)
                for p in problems_data:
                    prob_obj = db.query(CodingProblem).filter(CodingProblem.id == p["id"]).first()
                    if not prob_obj:
                        prob_obj = CodingProblem(
                            id=p["id"],
                            course_id=p.get("course_id"),
                            title=p["title"],
                            slug=p["slug"],
                            difficulty=p.get("difficulty", "Easy"),
                            tags=p.get("tags", []),
                            statement=p["statement"],
                            input_format=p.get("input_format"),
                            output_format=p.get("output_format"),
                            constraints=p.get("constraints"),
                            time_limit_sec=p.get("time_limit_sec", 2.0),
                            memory_limit_mb=p.get("memory_limit_mb", 128),
                            starter_code=p.get("starter_code", {}),
                            status=p.get("status", "published")
                        )
                        db.add(prob_obj)
                        db.flush()
                        stats["problems"] += 1

                        for tc in p.get("test_cases", []):
                            if not db.query(TestCase).filter(TestCase.id == tc["id"]).first():
                                db.add(TestCase(
                                    id=tc["id"],
                                    problem_id=prob_obj.id,
                                    input_data=tc["input_data"],
                                    expected_output=tc["expected_output"],
                                    is_hidden=tc.get("is_hidden", False),
                                    explanation=tc.get("explanation")
                                ))

        # 7. Seed Subscription Plans & Coupons
        plan_file = datasets_dir / "subscription_plans.json"
        if plan_file.exists():
            with open(plan_file, "r", encoding="utf-8") as f:
                sub_data = json.load(f)
                for plan in sub_data.get("plans", []):
                    existing = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan["id"]).first()
                    if not existing:
                        db.add(SubscriptionPlan(
                            id=plan["id"],
                            name=plan["name"],
                            slug=plan["slug"],
                            price=plan.get("price", 0.0),
                            currency=plan.get("currency", "INR"),
                            duration_days=plan.get("duration_days", 30),
                            description=plan.get("description"),
                            features=plan.get("features", []),
                            is_active=plan.get("is_active", True),
                            is_popular=plan.get("is_popular", False)
                        ))
                        stats["plans"] += 1

                for coup in sub_data.get("coupons", []):
                    existing = db.query(Coupon).filter(Coupon.id == coup["id"]).first()
                    if not existing:
                        db.add(Coupon(
                            id=coup["id"],
                            code=coup["code"].upper(),
                            discount_type=coup.get("discount_type", "percentage"),
                            value=coup.get("value", 10.0),
                            max_discount=coup.get("max_discount", 1000.0),
                            usage_limit=coup.get("usage_limit", 100),
                            used_count=coup.get("used_count", 0),
                            is_active=coup.get("is_active", True),
                            description=coup.get("description")
                        ))
                        stats["coupons"] += 1

        # 8. Seed Welcome Notification
        notif = db.query(Notification).first()
        if not notif:
            db.add(Notification(
                id="notif_welcome",
                title="Welcome to B.Tech Learning Platform v2.0",
                message="Explore our new dynamic curriculum in Python, C, C++, Java, and DSA. Practice MCQs and solve coding challenges in the sandbox!",
                type="announcement",
                target_rule="all"
            ))

        db.commit()
        return stats
