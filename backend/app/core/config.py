import os
from pathlib import Path
from dotenv import load_dotenv

# Resolve base directories
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
WORKSPACE_DIR = BACKEND_DIR.parent
DATASETS_DIR = WORKSPACE_DIR / "datasets"
STORAGE_DIR = WORKSPACE_DIR / "storage"

# Explicitly load .env from backend directory and workspace directory
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(WORKSPACE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "B.Tech Learning, Assessment & Programming Practice Platform"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "btech-super-secure-secret-key-2026-production-token-998877")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ADMIN_MASTER_KEY: str = os.getenv("ADMIN_MASTER_KEY", "BTECH_SUPER_ADMIN_2026")
    ADMIN_EMAIL_WHITELIST: list = [e.strip().lower() for e in os.getenv("ADMIN_EMAIL_WHITELIST", "admin@btechlearn.edu").split(",") if e.strip()]
    REQUIRE_EMAIL_OTP: bool = os.getenv("REQUIRE_EMAIL_OTP", "true").lower() == "true"
    
    # Database (Supabase PostgreSQL / SQLite)
    _db_url_raw: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BACKEND_DIR / 'btech_platform.db'}"
    )
    
    @property
    def DATABASE_URL(self) -> str:
        url = (self._db_url_raw or "").strip().strip("'").strip('"')
        # Supabase/Heroku sometimes provide postgres:// which SQLAlchemy 2.0 requires as postgresql://
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    # SMTP & HTTPS Email Dispatch Settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "helloguys6167@gmail.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "yzlwhxnlpoofpxao")
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() == "true"
    SMTP_SSL: bool = os.getenv("SMTP_SSL", "false").lower() == "true"
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "B.Tech Learning Platform")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "helloguys6167@gmail.com")
    
    # HTTPS Email APIs (Unblocked on Render / Cloud Port 443)
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")
    EMAIL_WEBHOOK_URL: str = os.getenv("EMAIL_WEBHOOK_URL", "")

    # Supabase Client & Storage Settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_STORAGE_BUCKET: str = os.getenv("SUPABASE_STORAGE_BUCKET", "btech-assets")
    _supa_db_url_raw: str = os.getenv("SUPABASE_DATABASE_URL", "")
    
    @property
    def SUPABASE_DATABASE_URL(self) -> str:
        url = (self._supa_db_url_raw or "").strip().strip("'").strip('"')
        if not url and self.DATABASE_URL.startswith("postgresql"):
            url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url
    
    @property
    def is_postgres(self) -> bool:
        return self.DATABASE_URL.startswith("postgresql")

    @property
    def is_supabase_configured(self) -> bool:
        return bool(self.SUPABASE_URL and (self.SUPABASE_KEY or self.SUPABASE_SERVICE_ROLE_KEY))

    @property
    def is_smtp_configured(self) -> bool:
        return bool(self.SMTP_HOST and self.SMTP_USER and self.SMTP_PASSWORD)

    # Sandboxed Code Execution
    SANDBOX_TIMEOUT_SECONDS: float = 3.5
    SANDBOX_MAX_MEMORY_MB: int = 128
    
    # Paths
    BASE_DIR: Path = BACKEND_DIR
    DATASETS_PATH: Path = DATASETS_DIR
    STORAGE_PATH: Path = STORAGE_DIR
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

settings = Settings()

# Ensure storage directory exists
os.makedirs(settings.STORAGE_PATH, exist_ok=True)
os.makedirs(settings.STORAGE_PATH / "notes", exist_ok=True)
os.makedirs(settings.STORAGE_PATH / "videos", exist_ok=True)
os.makedirs(settings.STORAGE_PATH / "code_temp", exist_ok=True)
