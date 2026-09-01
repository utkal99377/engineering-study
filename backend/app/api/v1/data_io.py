import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.core.config import settings
from app.core.security import require_role
from app.services.seeder_service import SeederService
from app.models.course import Subject, Course, Module, Lecture, Resource
from app.models.assessment import TheoryQuestion
from app.models.coding import CodingProblem, TestCase
from app.models.subscription import SubscriptionPlan, Coupon

router = APIRouter(
    prefix="/admin/datasets",
    tags=["Dataset Importer & Exporter"],
    dependencies=[Depends(require_role(["admin"]))]
)

@router.get("/status")
def get_datasets_status(db: Session = Depends(get_db)):
    """Check dataset files in datasets/ directory and database record counts."""
    files_info = {}
    for filename in [
        "subjects.json", "courses.json", "modules_lectures.json", 
        "theory_questions.json", "coding_problems.json", "subscription_plans.json"
    ]:
        fpath = settings.DATASETS_PATH / filename
        files_info[filename] = {
            "exists": fpath.exists(),
            "size_bytes": fpath.stat().st_size if fpath.exists() else 0
        }

    db_counts = {
        "subjects": db.query(Subject).count(),
        "courses": db.query(Course).count(),
        "modules": db.query(Module).count(),
        "lectures": db.query(Lecture).count(),
        "questions": db.query(TheoryQuestion).count(),
        "coding_problems": db.query(CodingProblem).count(),
        "subscription_plans": db.query(SubscriptionPlan).count(),
        "coupons": db.query(Coupon).count()
    }

    return {
        "datasets_directory": str(settings.DATASETS_PATH),
        "files": files_info,
        "database_records": db_counts
    }

@router.post("/import-from-disk")
def import_from_disk(db: Session = Depends(get_db)):
    """Import and synchronize curriculum data directly from the datasets/ folder."""
    stats = SeederService.seed_all(db, settings.DATASETS_PATH)
    return {
        "success": True,
        "message": "Datasets imported and synchronized successfully.",
        "imported_stats": stats
    }

@router.get("/export")
def export_all_datasets(db: Session = Depends(get_db)):
    """Export complete current database curriculum as a bundled JSON."""
    subjects = db.query(Subject).all()
    courses = db.query(Course).all()
    modules = db.query(Module).all()
    questions = db.query(TheoryQuestion).all()
    problems = db.query(CodingProblem).all()
    plans = db.query(SubscriptionPlan).all()

    return {
        "exported_at": str(Path(__file__)),
        "subjects": [
            {"id": s.id, "name": s.name, "slug": s.slug, "icon": s.icon, "description": s.description, "order_no": s.order_no}
            for s in subjects
        ],
        "courses": [
            {"id": c.id, "subject_id": c.subject_id, "title": c.title, "slug": c.slug, "access_type": c.access_type, "level": c.level, "duration_hours": c.duration_hours}
            for c in courses
        ],
        "modules_count": len(modules),
        "questions_count": len(questions),
        "problems_count": len(problems),
        "plans_count": len(plans)
    }

@router.post("/sync-to-supabase")
def sync_to_supabase(db: Session = Depends(get_db)):
    """Synchronize all current local SQLite database curriculum, users, and settings to Supabase PostgreSQL."""
    from app.services.supabase_sync_service import SupabaseSyncService
    res = SupabaseSyncService.sync_local_to_supabase(db)
    return res
