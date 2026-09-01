from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON, Boolean
from datetime import datetime
import uuid

from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(128), nullable=False)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    price = Column(Float, default=0.0)
    currency = Column(String(16), default="INR")
    duration_days = Column(Integer, default=30)
    description = Column(Text, nullable=True)
    features = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    is_popular = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(String(64), ForeignKey("subscription_plans.id"), nullable=False)
    status = Column(String(32), default="active")  # active, expired, cancelled, pending
    start_at = Column(DateTime, default=datetime.utcnow)
    end_at = Column(DateTime, nullable=False)
    provider = Column(String(64), default="simulated_gateway")
    provider_ref = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PaymentRecord(Base):
    __tablename__ = "payment_records"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(String(64), ForeignKey("subscription_plans.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(16), default="INR")
    status = Column(String(32), default="success")  # success, pending, failed, refunded
    provider = Column(String(64), default="Razorpay/Stripe")
    reference = Column(String(128), nullable=False, unique=True)
    coupon_used = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Coupon(Base):
    __tablename__ = "coupons"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    code = Column(String(64), unique=True, index=True, nullable=False)
    discount_type = Column(String(32), default="percentage")  # percentage, flat
    value = Column(Float, nullable=False)
    max_discount = Column(Float, default=1000.0)
    usage_limit = Column(Integer, default=100)
    used_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    description = Column(String(256), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
