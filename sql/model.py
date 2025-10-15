# model.py

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, JSON, ForeignKey
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()

# ✅ New: สร้าง Enum สำหรับ Role และ Tier
class UserRole(enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class UserTier(enum.Enum):
    PENDING = "PENDING"
    SAVER = "SAVER"
    PREMIUM = "PREMIUM"

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    display_name = Column(String(255), nullable=True)
    username = Column(String(255), unique=True, nullable=False, index=True) # เพิ่ม index เพื่อความเร็ว
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    
    # ✅ New/Changed: เพิ่ม field ใหม่ๆ
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    tier = Column(Enum(UserTier), nullable=False, default=UserTier.PENDING)
    password_updated_at = Column(DateTime, nullable=False, default=func.now())
    
    failed_login_attempts = Column(Integer, nullable=False, default=0)
    is_locked = Column(Boolean, nullable=False, default=False)
    locked_until = Column(DateTime, nullable=True) # ตัวเลือกเสริม: ล็อกตามเวลา
    
    reset_token = Column(String(255), nullable=True, unique=True)
    reset_token_expiry = Column(DateTime, nullable=True)

    created_at = Column(DateTime, nullable=False, default=func.now())


    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, role={self.role}, tier={self.tier})>"

# ✅ New: ตารางสำหรับเก็บ Log การ Login
class LoginLog(Base):
    __tablename__ = 'login_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username_attempt = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True) # Nullable เพราะอาจ login ผิดโดยไม่มี user id
    timestamp = Column(DateTime, nullable=False, default=func.now())
    is_success = Column(Boolean, nullable=False)
    ip_address = Column(String(50), nullable=True) # เก็บ IP Address (ตัวเลือกเสริม)

# ✅ New: ตารางสำหรับเก็บประวัติการสั่งอาหาร
class Order(Base):
    __tablename__ = 'orders'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    user_display_name = Column(String(255), nullable=False)
    ordered_at = Column(DateTime, nullable=False, default=func.now())
    # เก็บรายการอาหารเป็น JSON array ของ string
    items = Column(JSON, nullable=False)