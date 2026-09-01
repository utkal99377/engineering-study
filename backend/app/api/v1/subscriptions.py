from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.subscription import SubscriptionPlan, Subscription, PaymentRecord, Coupon
from app.services.entitlement_service import EntitlementService
from app.schemas.subscription import (
    SubscriptionPlanOut,
    CouponValidateRequest,
    CouponValidateResponse,
    CheckoutRequest,
    CheckoutResponse,
    UserEntitlementOut
)

router = APIRouter(prefix="/subscription", tags=["Subscriptions & Billing"])

@router.get("/plans", response_model=List[SubscriptionPlanOut])
def list_subscription_plans(db: Session = Depends(get_db)):
    """List all available subscription plans."""
    plans = db.query(SubscriptionPlan).filter(SubscriptionPlan.is_active == True).order_by(SubscriptionPlan.price.asc()).all()
    return plans

@router.post("/validate-coupon", response_model=CouponValidateResponse)
def validate_coupon(req: CouponValidateRequest, db: Session = Depends(get_db)):
    """Validate a promotional coupon code and calculate discounted pricing."""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == req.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    coupon = db.query(Coupon).filter(
        Coupon.code == req.code.upper().strip(),
        Coupon.is_active == True
    ).first()

    if not coupon:
        return {
            "is_valid": False,
            "message": "Invalid or expired coupon code.",
            "discount_amount": 0.0,
            "original_price": plan.price,
            "final_price": plan.price,
            "coupon_code": None
        }

    if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
        return {
            "is_valid": False,
            "message": "Coupon usage limit reached.",
            "discount_amount": 0.0,
            "original_price": plan.price,
            "final_price": plan.price,
            "coupon_code": None
        }

    # Calculate discount
    discount = 0.0
    if coupon.discount_type == "percentage":
        discount = (coupon.value / 100.0) * plan.price
        if coupon.max_discount:
            discount = min(discount, coupon.max_discount)
    else:
        discount = coupon.value

    discount = min(discount, plan.price)
    final_price = max(0.0, plan.price - discount)

    return {
        "is_valid": True,
        "message": f"Coupon applied! You save ₹{round(discount, 2)}",
        "discount_amount": round(discount, 2),
        "original_price": plan.price,
        "final_price": round(final_price, 2),
        "coupon_code": coupon.code
    }

@router.post("/checkout", response_model=CheckoutResponse)
def checkout_subscription(
    req: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process subscription checkout, record payment transaction, and activate user entitlement.
    """
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == req.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found.")

    # Apply coupon if provided
    final_amount = plan.price
    coupon_applied = None
    if req.coupon_code:
        coupon = db.query(Coupon).filter(
            Coupon.code == req.coupon_code.upper().strip(),
            Coupon.is_active == True
        ).first()
        if coupon:
            coupon_applied = coupon.code
            if coupon.discount_type == "percentage":
                disc = (coupon.value / 100.0) * plan.price
                if coupon.max_discount:
                    disc = min(disc, coupon.max_discount)
            else:
                disc = coupon.value
            final_amount = max(0.0, plan.price - disc)
            coupon.used_count += 1

    # Record Payment
    payment_ref = f"PAY_BTECH_{uuid.uuid4().hex[:12].upper()}"
    payment = PaymentRecord(
        user_id=current_user.id,
        plan_id=plan.id,
        amount=final_amount,
        currency=plan.currency,
        status="success",
        provider="simulated_gateway",
        reference=payment_ref,
        coupon_used=coupon_applied
    )
    db.add(payment)

    # Calculate expiration date (extend if existing active subscription exists)
    now = datetime.utcnow()
    existing_sub = EntitlementService.get_user_subscription(db, current_user.id)
    start_time = now
    if existing_sub and existing_sub.end_at > now:
        end_time = existing_sub.end_at + timedelta(days=plan.duration_days)
    else:
        end_time = now + timedelta(days=plan.duration_days)

    subscription = Subscription(
        user_id=current_user.id,
        plan_id=plan.id,
        status="active",
        start_at=start_time,
        end_at=end_time,
        provider="simulated_gateway",
        provider_ref=payment_ref
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    return {
        "success": True,
        "message": f"Successfully subscribed to {plan.name}! All premium courses and sandbox features are now unlocked.",
        "subscription_id": subscription.id,
        "plan_name": plan.name,
        "amount_paid": final_amount,
        "currency": plan.currency,
        "expires_at": subscription.end_at,
        "active": True
    }

@router.get("/me", response_model=UserEntitlementOut)
def get_my_entitlement(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get active user subscription entitlement details."""
    return EntitlementService.get_user_entitlement_summary(db, current_user)

@router.get("/history")
def get_payment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve billing history and payment records for current student."""
    records = db.query(PaymentRecord).filter(
        PaymentRecord.user_id == current_user.id
    ).order_by(PaymentRecord.created_at.desc()).all()

    items = []
    for r in records:
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == r.plan_id).first()
        items.append({
            "id": r.id,
            "reference": r.reference,
            "plan_name": plan.name if plan else "Subscription Plan",
            "amount": r.amount,
            "currency": r.currency,
            "status": r.status,
            "coupon_used": r.coupon_used,
            "date": r.created_at
        })
    return items
