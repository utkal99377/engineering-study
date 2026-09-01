import sys
from pathlib import Path
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from typing import Dict, Any

from app.core.config import settings
from app.core.database import Base, engine
import app.models

MIGRATION_MODELS = [
    app.models.User,
    app.models.Subject,
    app.models.Course,
    app.models.Module,
    app.models.Lecture,
    app.models.Resource,
    app.models.LectureProgress,
    app.models.CourseProgress,
    app.models.TheoryQuestion,
    app.models.QuestionAttempt,
    app.models.CodingProblem,
    app.models.TestCase,
    app.models.Submission,
    app.models.SubscriptionPlan,
    app.models.Subscription,
    app.models.PaymentRecord,
    app.models.Coupon,
    app.models.AuditLog,
    app.models.Notification,
    app.models.SystemSetting,
]

class SupabaseSyncService:
    @staticmethod
    def get_supabase_engine():
        url = settings.SUPABASE_DATABASE_URL
        if not url:
            return None
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return create_engine(url, pool_pre_ping=True)

    @classmethod
    def sync_local_to_supabase(cls, local_db_session) -> Dict[str, Any]:
        """
        Synchronize all local tables, admin edits, and curriculum records
        directly to Supabase PostgreSQL database.
        """
        supa_engine = cls.get_supabase_engine()
        if not supa_engine:
            return {
                "success": False,
                "message": "SUPABASE_DATABASE_URL or DATABASE_URL is not set in backend/.env",
                "synced_counts": {}
            }

        try:
            # 1. Ensure Schema exists in Supabase
            Base.metadata.create_all(bind=supa_engine)

            # If primary database is already Supabase PostgreSQL, count active records
            if settings.is_postgres:
                counts = {}
                for model in MIGRATION_MODELS:
                    c = local_db_session.query(model).count()
                    counts[model.__tablename__] = c
                return {
                    "success": True,
                    "message": f"Live Supabase PostgreSQL Connected! {sum(counts.values())} total records verified across {len(counts)} tables.",
                    "synced_counts": counts
                }

            # If migrating from SQLite to Supabase
            SupaSession = sessionmaker(bind=supa_engine)
            synced_counts = {}

            with SupaSession() as supa_db:
                for model in MIGRATION_MODELS:
                    table_name = model.__tablename__
                    local_records = local_db_session.query(model).all()
                    
                    if not local_records:
                        continue

                    # Upsert / Merge records into Supabase
                    for item in local_records:
                        cols = {c.name: getattr(item, c.name) for c in model.__table__.columns}
                        supa_item = supa_db.query(model).filter(model.id == item.id).first()
                        if not supa_item:
                            supa_db.add(model(**cols))
                        else:
                            for k, v in cols.items():
                                setattr(supa_item, k, v)

                    supa_db.commit()
                    synced_counts[table_name] = len(local_records)

            return {
                "success": True,
                "message": f"Successfully synchronized {sum(synced_counts.values())} records across {len(synced_counts)} tables to Supabase.",
                "synced_counts": synced_counts
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"Supabase sync status: {e}",
                "synced_counts": {}
            }
