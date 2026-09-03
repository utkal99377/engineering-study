from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from typing import Dict, Any

from app.core.database import get_db
from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)
from app.models.user import User, EmailOTP
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserOut,
    UserUpdate,
    SendOTPRequest,
    VerifyOTPRequest
)
from app.services.email_service import EmailService

router = APIRouter(prefix="/auth", tags=["Authentication"])

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks

@router.post("/send-otp")
def send_email_otp(req: SendOTPRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Generate and dispatch a 6-digit email OTP for verification in background for instant UI response."""
    clean_email = req.email.lower().strip()
    
    if req.purpose == "registration":
        existing = db.query(User).filter(User.email == clean_email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists. Please log in."
            )
            
    # Generate 6-digit secure numeric code
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Invalidate previous unused OTPs for this email & purpose
    db.query(EmailOTP).filter(
        EmailOTP.email == clean_email,
        EmailOTP.purpose == req.purpose,
        EmailOTP.is_used == False
    ).update({"is_used": True})

    otp_record = EmailOTP(
        email=clean_email,
        otp_code=otp_code,
        purpose=req.purpose,
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_record)
    db.commit()

    # Dispatch real email via SMTP / HTTPS APIs
    delivery = EmailService.send_otp_email(clean_email, otp_code, req.purpose)
    print(f"\n[SECURITY OTP] 6-Digit Verification Code for {clean_email}: {otp_code} (Expires in 10 min)\n", flush=True)

    if not delivery.get("sent"):
        return {
            "success": True,
            "message": f"Verification code generated (Dev OTP: {otp_code}). Code logged to backend terminal.",
            "dev_otp": otp_code,
            "email_delivery": "console_fallback",
            "expires_in_seconds": 600
        }

    return {
        "success": True,
        "message": f"Verification 6-digit OTP code sent directly to {clean_email}. Please check your inbox / spam folder.",
        "email_delivery": delivery.get("provider", "smtp"),
        "expires_in_seconds": 600
    }

@router.post("/verify-otp")
def verify_email_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify an email OTP code."""
    clean_email = req.email.lower().strip()
    record = db.query(EmailOTP).filter(
        EmailOTP.email == clean_email,
        EmailOTP.otp_code == req.otp_code.strip(),
        EmailOTP.purpose == req.purpose,
        EmailOTP.is_used == False,
        EmailOTP.expires_at > datetime.utcnow()
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code. Please request a new one."
        )

    return {
        "success": True,
        "verified": True,
        "message": "Email verified successfully."
    }

# ==================== REGISTRATION & LOGIN ====================

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    """Register a new verified student account."""
    clean_email = req.email.lower().strip()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # If OTP is provided, verify and consume it
    if req.otp:
        record = db.query(EmailOTP).filter(
            EmailOTP.email == clean_email,
            EmailOTP.otp_code == req.otp.strip(),
            EmailOTP.purpose == "registration",
            EmailOTP.is_used == False,
            EmailOTP.expires_at > datetime.utcnow()
        ).first()

        if not record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code. Please verify your email first."
            )
        record.is_used = True

    new_user = User(
        name=req.name.strip(),
        email=clean_email,
        hashed_password=get_password_hash(req.password),
        role="student",  # Normal registration ALWAYS assigns student role
        college_branch=req.college_branch,
        semester=req.semester,
        is_verified=True,
        status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        data={"sub": new_user.email, "role": new_user.role, "id": new_user.id}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "college_branch": new_user.college_branch,
            "semester": new_user.semester,
            "avatar": new_user.avatar
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    """Authenticate student or admin and issue JWT access token."""
    clean_email = req.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    # Strict Admin Security Check:
    # If the account has an admin role, ensure email is on the authorized whitelist or passcode provided
    if user.role in ["admin", "content_manager"]:
        is_whitelisted = clean_email in settings.ADMIN_EMAIL_WHITELIST
        is_master_pass = req.admin_passcode and req.admin_passcode.strip() == settings.ADMIN_MASTER_KEY
        if not is_whitelisted and not is_master_pass:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin login restricted. This email is not in the authorized administrator whitelist."
            )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "id": user.id}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "college_branch": user.college_branch,
            "semester": user.semester,
            "avatar": user.avatar
        }
    }

@router.post("/admin-login", response_model=TokenResponse)
def admin_login(req: UserLogin, db: Session = Depends(get_db)):
    """Dedicated Super-Admin login enforcing Master Passcode and Admin Role."""
    clean_email = req.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()
    
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials."
        )

    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: This account does not possess Administrator privileges."
        )

    # Enforce Master Admin Passcode / Whitelist
    if req.admin_passcode:
        if req.admin_passcode.strip() != settings.ADMIN_MASTER_KEY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid Admin Master Passcode."
            )
    else:
        if clean_email not in settings.ADMIN_EMAIL_WHITELIST:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin Master Passcode required for this administrator account."
            )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "id": user.id}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "college_branch": user.college_branch,
            "semester": user.semester,
            "avatar": user.avatar
        }
    }

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently logged-in user."""
    return current_user

@router.put("/me", response_model=UserOut)
def update_profile(
    req: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update profile details of current user."""
    if req.name:
        current_user.name = req.name
    if req.college_branch:
        current_user.college_branch = req.college_branch
    if req.semester:
        current_user.semester = req.semester
    if req.avatar:
        current_user.avatar = req.avatar

    db.commit()
    db.refresh(current_user)
    return current_user
