from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SubscriptionPlanOut(BaseModel):
    id: str
    name: str
    slug: str
    price: float
    currency: str
    duration_days: int
    description: Optional[str]
    features: List[str] = []
    is_active: bool
    is_popular: bool

    class Config:
        from_attributes = True

class CouponValidateRequest(BaseModel):
    code: str
    plan_id: str

class CouponValidateResponse(BaseModel):
    is_valid: bool
    message: str
    discount_amount: float
    original_price: float
    final_price: float
    coupon_code: Optional[str] = None

class CheckoutRequest(BaseModel):
    plan_id: str
    coupon_code: Optional[str] = None
    payment_method: Optional[str] = "upi_card_simulated"

class CheckoutResponse(BaseModel):
    success: bool
    message: str
    subscription_id: str
    plan_name: str
    amount_paid: float
    currency: str
    expires_at: datetime
    active: bool

class UserEntitlementOut(BaseModel):
    is_premium: bool
    plan_name: str
    plan_id: Optional[str] = None
    expires_at: Optional[datetime] = None
    days_remaining: int
    features_unlocked: List[str] = []
