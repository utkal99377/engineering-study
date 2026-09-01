from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Engine configuration (supporting SQLite and Supabase PostgreSQL)
connect_args = {}
engine_kwargs = {"echo": False}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine_kwargs["connect_args"] = connect_args
else:
    # Supabase PostgreSQL / Cloud Postgres optimizations
    engine_kwargs["pool_pre_ping"] = True  # Automatically reconnect dropped/idle pool connections
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20
    engine_kwargs["pool_recycle"] = 300   # Recycle connections every 5 minutes

engine = create_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that provides a database session and handles closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
