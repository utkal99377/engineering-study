"""
B.Tech Learning Platform — Supabase Migration & Synchronization CLI Tool

Usage:
  # Check connection to Supabase / active database:
  python migrate_to_supabase.py --check

  # Create tables and migrate all existing SQLite data + curriculum datasets to Supabase:
  python migrate_to_supabase.py --migrate

  # Specify a custom Supabase connection URL directly:
  python migrate_to_supabase.py --migrate --url "postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres"
"""

import sys
import os
import argparse
from pathlib import Path
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.core.config import settings
from app.core.database import Base
from app.services.seeder_service import SeederService
import app.models

# Model list in order of foreign key dependency
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

def get_target_engine(target_url: str = None):
    url = target_url or settings.DATABASE_URL
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    
    kwargs = {"echo": False}
    if not url.startswith("sqlite"):
        kwargs["pool_pre_ping"] = True
    return create_engine(url, **kwargs)

def check_connection(engine):
    print(f"\n[1/3] Testing database connection...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            db_type = "PostgreSQL (Supabase)" if "postgres" in str(engine.url) else "SQLite"
            print(f"  [SUCCESS] Connection established! Database Type: {db_type}")
            return True
    except Exception as e:
        print(f"  [ERROR] Failed to connect to database: {e}")
        return False

def create_schema(engine):
    print(f"\n[2/3] Ensuring tables exist in target database...")
    try:
        Base.metadata.create_all(bind=engine)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"  [SUCCESS] Tables verified ({len(tables)} tables present): {', '.join(tables)}")
        return True
    except Exception as e:
        print(f"  [ERROR] Schema creation failed: {e}")
        return False

def migrate_sqlite_data(target_engine, sqlite_db_path: Path):
    print(f"\n[3/3] Migrating data from SQLite ({sqlite_db_path.name}) to Supabase...", flush=True)
    if not sqlite_db_path.exists():
        print(f"  [INFO] SQLite file '{sqlite_db_path}' not found. Seeding default curriculum datasets directly...", flush=True)
        TargetSession = sessionmaker(bind=target_engine)
        with TargetSession() as db:
            stats = SeederService.seed_all(db, settings.DATASETS_PATH)
            print(f"  [SUCCESS] Default seeding complete: {stats}", flush=True)
        return

    sqlite_engine = create_engine(f"sqlite:///{sqlite_db_path}", connect_args={"check_same_thread": False})
    SqliteSession = sessionmaker(bind=sqlite_engine)
    TargetSession = sessionmaker(bind=target_engine)

    with SqliteSession() as src_db, TargetSession() as tgt_db:
        total_migrated = 0
        for model in MIGRATION_MODELS:
            table_name = model.__tablename__
            try:
                records = src_db.query(model).all()
                if not records:
                    continue
                
                count = 0
                cols = [c.key for c in inspect(model).mapper.column_attrs]
                
                # Check existing IDs in target to avoid duplicates
                existing_ids = set()
                primary_keys = [pk.name for pk in inspect(model).primary_key]
                if len(primary_keys) == 1:
                    pk_col = getattr(model, primary_keys[0])
                    existing_ids = set(row[0] for row in tgt_db.query(pk_col).all())

                for record in records:
                    pk_val = getattr(record, primary_keys[0]) if len(primary_keys) == 1 else None
                    if pk_val and pk_val in existing_ids:
                        continue
                    
                    row_data = {col: getattr(record, col) for col in cols}
                    new_obj = model(**row_data)
                    tgt_db.add(new_obj)
                    count += 1
                
                tgt_db.commit()
                total_migrated += count
                print(f"  -> Migrated {count:4d} rows into '{table_name}'", flush=True)
            except Exception as e:
                tgt_db.rollback()
                print(f"  [WARNING] Issue migrating table '{table_name}': {e}", flush=True)
        
        print(f"  [SUCCESS] SQLite migration complete! Total records transferred: {total_migrated}", flush=True)
        
        # Ensure default datasets & admin accounts exist
        print(f"  [INFO] Verifying curriculum seeders in Supabase...", flush=True)
        try:
            stats = SeederService.seed_all(tgt_db, settings.DATASETS_PATH)
            print(f"  [SUCCESS] Seeder verification: {stats}", flush=True)
        except Exception as e:
            print(f"  [WARNING] Seeder warning: {e}", flush=True)

def main():
    parser = argparse.ArgumentParser(description="B.Tech Platform Supabase Migration Utility")
    parser.add_argument("--check", action="store_true", help="Check database connection only")
    parser.add_argument("--migrate", action="store_true", help="Create tables and migrate SQLite data to Supabase")
    parser.add_argument("--url", type=str, default=None, help="Target PostgreSQL / Supabase connection URL")
    parser.add_argument("--sqlite-path", type=str, default=None, help="Custom path to SQLite .db file")

    args = parser.parse_args()

    target_engine = get_target_engine(args.url)
    
    print("=" * 70)
    print("  B.Tech Learning Platform — Supabase Migration Tool")
    print("=" * 70)
    print(f"Target URL: {str(target_engine.url).split('@')[-1] if '@' in str(target_engine.url) else target_engine.url}")

    if not check_connection(target_engine):
        sys.exit(1)

    if args.check and not args.migrate:
        print("\n[DONE] Connection check passed successfully!")
        return

    if not create_schema(target_engine):
        sys.exit(1)

    sqlite_path = Path(args.sqlite_path) if args.sqlite_path else (settings.BASE_DIR / "btech_platform.db")
    migrate_sqlite_data(target_engine, sqlite_path)

    print("\n" + "=" * 70)
    print("  Migration & Sync Completed Successfully! [DONE]")
    print("=" * 70)

if __name__ == "__main__":
    main()
