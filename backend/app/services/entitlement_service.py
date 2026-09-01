from datetime import datetime
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.course import Course, Resource

class EntitlementService:
    @staticmethod
    def get_user_subscription(db: Session, user_id: str) -> Optional[Subscription]:
        """Fetch the current active subscription for a user."""
        now = datetime.utcnow()
        return db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.status == "active",
            Subscription.end_at > now
        ).order_by(Subscription.end_at.desc()).first()

    @staticmethod
    def has_course_access(db: Session, user: Optional[User], course: Course) -> Tuple[bool, str]:
        """
        Verify if a user is entitled to access a given course.
        Returns (has_access: bool, reason_or_state: str)
        """
        # If course is free, anyone logged in (or guest) can view public lectures
        if course.access_type.lower() == "free":
            return True, "free_access"
        
        # If not logged in and course is premium
        if not user:
            return False, "authentication_required"

        # Admins and content managers have unrestricted access
        if user.role in ["admin", "content_manager"]:
            return True, "admin_override"

        # Check active subscription
        active_sub = EntitlementService.get_user_subscription(db, user.id)
        if active_sub:
            return True, "active_subscription"

        return False, "premium_subscription_required"

    @staticmethod
    def get_user_entitlement_summary(db: Session, user: Optional[User]) -> dict:
        """Return full entitlement metadata for user dashboard & badges."""
        if not user:
            return {
                "is_premium": False,
                "plan_name": "Guest Learner",
                "plan_id": None,
                "expires_at": None,
                "days_remaining": 0,
                "features_unlocked": ["Free Public Courses"]
            }

        if user.role in ["admin", "content_manager"]:
            return {
                "is_premium": True,
                "plan_name": f"Staff ({user.role.title()})",
                "plan_id": "staff_unlimited",
                "expires_at": datetime(2099, 12, 31),
                "days_remaining": 9999,
                "features_unlocked": ["All Courses", "Admin CMS", "Sandbox Submissions", "Certificates"]
            }

        active_sub = EntitlementService.get_user_subscription(db, user.id)
        if active_sub:
            plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == active_sub.plan_id).first()
            now = datetime.utcnow()
            days_left = max(0, (active_sub.end_at - now).days)
            return {
                "is_premium": True,
                "plan_name": plan.name if plan else "B.Tech Pro Plan",
                "plan_id": active_sub.plan_id,
                "expires_at": active_sub.end_at,
                "days_remaining": days_left,
                "features_unlocked": plan.features if plan else ["All Courses", "Pro DSA", "Sandbox"]
            }

        return {
            "is_premium": False,
            "plan_name": "B.Tech Free Starter",
            "plan_id": "plan_free",
            "expires_at": None,
            "days_remaining": 0,
            "features_unlocked": ["Free Courses", "Theory MCQs", "Basic Code Sandbox"]
        }
