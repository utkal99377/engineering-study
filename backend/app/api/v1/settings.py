from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.models.system_setting import SystemSetting

router = APIRouter(
    prefix="/settings",
    tags=["Dynamic Platform Settings"]
)

DEFAULT_SETTINGS = {
    "site_title": "B.Tech Learning Platform",
    "hero_badge": "Curriculum for B.Tech CSE & Engineering Students",
    "hero_title": "Master Programming & Ace Your Engineering Exams",
    "hero_subtitle": "Data-driven courses, sequential unlocking, theory MCQs with automated scoring, and a multi-language sandbox code runner for B.Tech CSE/IT.",
    "announcement_active": True,
    "announcement_text": "🔥 Mid-Sem Exam Prep is Live! Practice 100+ MCQs & Code Problems now.",
    "announcement_type": "info",  # info, promo, warning, alert
    "feature_coding_arena": True,
    "feature_mcq_practice": True,
    "feature_pro_subscription": True,
    "maintenance_mode": False
}

@router.get("/public")
def get_public_settings(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Retrieve public platform dynamic settings for Web & Mobile UI."""
    db_settings = db.query(SystemSetting).all()
    result = dict(DEFAULT_SETTINGS)
    for s in db_settings:
        result[s.key] = s.get_parsed_value()
    return result
