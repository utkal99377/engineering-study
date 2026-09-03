import sys
import os
from pathlib import Path

# Ensure backend root directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seeder_service import SeederService
import app.models  # load all models for table creation

# Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.subjects_courses import router as courses_router
from app.api.v1.lectures import router as lectures_router
from app.api.v1.questions import router as questions_router
from app.api.v1.problems import router as problems_router
from app.api.v1.code_runner import router as code_runner_router
from app.api.v1.subscriptions import router as subscriptions_router
from app.api.v1.admin import router as admin_router
from app.api.v1.data_io import router as data_io_router
from app.api.v1.settings import router as settings_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatic database initialization & dataset seeding on startup
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            SeederService.seed_all(db, settings.DATASETS_PATH)
        finally:
            db.close()
    except Exception as e:
        print(f"Database initialization warning: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack REST API for dynamic B.Tech Learning, Assessment, Isolated Code Sandbox & Subscription Billing.",
    lifespan=lifespan
)

@app.get("/health", tags=["System"])
@app.get("/api/v1/health", tags=["System"])
def health_check():
    """Fast lightweight health check endpoint for UptimeRobot / cron-job keep-alive pings."""
    return {
        "status": "healthy",
        "service": "B.Tech Learning Platform Backend",
        "timestamp": datetime.utcnow().isoformat()
    }

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local storage folder for uploaded assets / PDFs / media
if os.path.exists(settings.STORAGE_PATH):
    app.mount("/storage", StaticFiles(directory=str(settings.STORAGE_PATH)), name="storage")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(courses_router, prefix=settings.API_V1_STR)
app.include_router(lectures_router, prefix=settings.API_V1_STR)
app.include_router(questions_router, prefix=settings.API_V1_STR)
app.include_router(problems_router, prefix=settings.API_V1_STR)
app.include_router(code_runner_router, prefix=settings.API_V1_STR)
app.include_router(subscriptions_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(data_io_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "code_runner_sandbox": "ready",
        "watermarking_engine": "active"
    }

if __name__ == "__main__":
    import uvicorn
    print("=" * 65)
    print(f"  Starting {settings.PROJECT_NAME}")
    print("  FastAPI Server URL: http://localhost:8001")
    print("  API Docs (Swagger UI): http://localhost:8001/docs")
    print("=" * 65)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=True)

