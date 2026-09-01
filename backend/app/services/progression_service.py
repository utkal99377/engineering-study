from datetime import datetime
from typing import Optional, List, Dict
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.course import Course, Module, Lecture
from app.models.progress import LectureProgress, CourseProgress
from app.services.entitlement_service import EntitlementService

class ProgressionService:
    @staticmethod
    def evaluate_lecture_state(
        db: Session,
        user: Optional[User],
        lecture: Lecture,
        course: Course,
        completed_lecture_ids: set
    ) -> str:
        """
        Evaluate the sequential progression state for a lecture:
        States: 'locked', 'available', 'in_progress', 'completed', 'premium_locked'
        """
        # 1. Check Course Entitlement
        has_access, reason = EntitlementService.has_course_access(db, user, course)
        if not has_access:
            return "premium_locked"

        if not user:
            # Guests can only preview the first available lecture if free
            return "available" if not lecture.prerequisite_id else "locked"

        # 2. Check if current lecture is already completed
        if lecture.id in completed_lecture_ids:
            return "completed"

        # 3. Check current in-progress record
        progress_record = db.query(LectureProgress).filter(
            LectureProgress.user_id == user.id,
            LectureProgress.lecture_id == lecture.id
        ).first()

        if progress_record and progress_record.status == "completed":
            return "completed"

        # 4. Check sequential prerequisite
        if lecture.prerequisite_id:
            if lecture.prerequisite_id not in completed_lecture_ids:
                return "locked"

        # 5. If prerequisite is met or no prerequisite
        if progress_record and progress_record.status == "in_progress":
            return "in_progress"

        return "available"

    @staticmethod
    def get_course_progression_tree(db: Session, user: Optional[User], course: Course) -> dict:
        """Calculate the full sequential state for all modules and lectures in a course."""
        completed_ids = set()
        if user:
            records = db.query(LectureProgress).filter(
                LectureProgress.user_id == user.id,
                LectureProgress.status == "completed"
            ).all()
            completed_ids = {r.lecture_id for r in records}

        # Build list of all lectures in sequential order to ensure chaining
        total_lectures = 0
        completed_lectures = 0
        modules_data = []

        for mod in course.modules:
            lectures_data = []
            for lec in mod.lectures:
                total_lectures += 1
                state = ProgressionService.evaluate_lecture_state(db, user, lec, course, completed_ids)
                if state == "completed":
                    completed_lectures += 1
                
                is_unlocked = state in ["available", "in_progress", "completed"]

                lectures_data.append({
                    "id": lec.id,
                    "module_id": lec.module_id,
                    "title": lec.title,
                    "order_no": lec.order_no,
                    "prerequisite_id": lec.prerequisite_id,
                    "duration_min": lec.duration_min,
                    "video_url": lec.video_url if is_unlocked else None,
                    "notes_markdown": lec.notes_markdown if is_unlocked else "### Locked Content\nPlease complete the previous lecture or unlock the course to view notes.",
                    "status": lec.status,
                    "access_state": state,
                    "is_unlocked": is_unlocked,
                    "resources": [
                        {
                            "id": r.id,
                            "lecture_id": r.lecture_id,
                            "title": r.title,
                            "type": r.type,
                            "url": r.url if is_unlocked else "#locked",
                            "access_level": r.access_level
                        } for r in lec.resources
                    ]
                })

            modules_data.append({
                "id": mod.id,
                "course_id": mod.course_id,
                "title": mod.title,
                "description": mod.description,
                "order_no": mod.order_no,
                "lectures": lectures_data
            })

        percent = int((completed_lectures / total_lectures * 100)) if total_lectures > 0 else 0

        return {
            "modules": modules_data,
            "total_lectures": total_lectures,
            "completed_lectures": completed_lectures,
            "progress_percentage": percent
        }

    @staticmethod
    def mark_lecture_completed(db: Session, user: User, lecture_id: str) -> dict:
        """Mark a lecture as completed and update overall course progress percentage."""
        lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
        if not lecture:
            return {"success": False, "message": "Lecture not found."}

        # Check existing record
        record = db.query(LectureProgress).filter(
            LectureProgress.user_id == user.id,
            LectureProgress.lecture_id == lecture_id
        ).first()

        if not record:
            record = LectureProgress(
                user_id=user.id,
                lecture_id=lecture_id,
                status="completed",
                completed_at=datetime.utcnow()
            )
            db.add(record)
        else:
            record.status = "completed"
            record.completed_at = datetime.utcnow()

        db.commit()

        # Update CourseProgress
        module = db.query(Module).filter(Module.id == lecture.module_id).first()
        if module:
            course = db.query(Course).filter(Course.id == module.course_id).first()
            if course:
                all_lecture_ids = [
                    l.id for m in course.modules for l in m.lectures
                ]
                total = len(all_lecture_ids)
                completed_count = db.query(LectureProgress).filter(
                    LectureProgress.user_id == user.id,
                    LectureProgress.lecture_id.in_(all_lecture_ids),
                    LectureProgress.status == "completed"
                ).count()

                pct = int((completed_count / total * 100)) if total > 0 else 0
                course_prog = db.query(CourseProgress).filter(
                    CourseProgress.user_id == user.id,
                    CourseProgress.course_id == course.id
                ).first()

                if not course_prog:
                    course_prog = CourseProgress(
                        user_id=user.id,
                        course_id=course.id,
                        completed_lectures_count=completed_count,
                        total_lectures_count=total,
                        percentage=pct,
                        is_completed="true" if pct == 100 else "false",
                        last_accessed_lecture_id=lecture_id
                    )
                    db.add(course_prog)
                else:
                    course_prog.completed_lectures_count = completed_count
                    course_prog.total_lectures_count = total
                    course_prog.percentage = pct
                    course_prog.is_completed = "true" if pct == 100 else "false"
                    course_prog.last_accessed_lecture_id = lecture_id

                db.commit()

        return {
            "success": True,
            "message": "Lecture marked as completed. Next lecture unlocked.",
            "lecture_id": lecture_id
        }
