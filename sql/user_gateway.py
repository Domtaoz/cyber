# user_gateway.py
import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from datetime import datetime, timedelta
import secrets # สำหรับสร้าง token
import re # สำหรับ Password Complexity

from database import SessionLocal
from model import User, LoginLog, UserTier, Order, UserRole
from sqlalchemy import or_
from email_utils import send_reset_email

# ค่าคงที่สำหรับ Security
MAX_LOGIN_ATTEMPTS = 5
PASSWORD_EXPIRY_DAYS = 90

class UserGateway:
    # --- Helper Methods ---
    @staticmethod
    def _log_login_attempt(db: Session, username: str, is_success: bool, user_id: int = None):
        log_entry = LoginLog(
            username_attempt=username,
            is_success=is_success,
            user_id=user_id
        )
        db.add(log_entry)
        db.commit()

    @staticmethod
    def _check_password_complexity(password: str) -> bool:
        # ตัวอย่าง: ต้องมีอย่างน้อย 8 ตัว, มีตัวพิมพ์เล็ก, พิมพ์ใหญ่, และตัวเลข
        if len(password) < 8: return False
        if not re.search(r"[a-z]", password): return False
        if not re.search(r"[A-Z]", password): return False
        if not re.search(r"[0-9]", password): return False
        return True

    # --- User Management ---
    @classmethod
    def register_customer(cls, display_name: str, username: str, email: str, password: str) -> User:
        if not cls._check_password_complexity(password):
            raise ValueError("Password does not meet complexity requirements.")
        
        hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode('utf-8')
        with SessionLocal() as db:
            if db.query(User).filter(or_(User.username == username, User.email == email)).first():
                raise ValueError("Username or email already in use.")
            
            # ✅ บังคับให้ role เป็น USER เสมอ
            new_user = User(
                display_name=display_name, 
                username=username,
                email=email,
                password=hashed_pw,
                role=UserRole.USER # <-- บังคับ Role ที่นี่
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return new_user
        
        
    @classmethod    
    def create_admin(cls, display_name: str, username: str, email: str, password: str) -> User:
        """
        Creates a new user with ADMIN role.
        Should only be accessible by superusers or initial setup scripts.
        """
        if not cls._check_password_complexity(password):
            raise ValueError("Password does not meet complexity requirements.")

        hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode('utf-8')
        with SessionLocal() as db:
            if db.query(User).filter(or_(User.username == username, User.email == email)).first():
                raise ValueError("Username or email already in use.")

            # ✅ บังคับให้ role เป็น ADMIN
            new_admin = User(
                display_name=display_name,
                username=username,
                email=email,
                password=hashed_pw,
                role=UserRole.ADMIN # <-- บังคับ Role ที่นี่
            )
            db.add(new_admin)
            db.commit()
            db.refresh(new_admin)
            return new_admin

    @classmethod
    def login_user(cls, login_identifier: str, password: str) -> User:
        with SessionLocal() as db:
            user = db.query(User).filter(User.username == login_identifier, User.email == login_identifier).first()

            # Generic Error: ไม่ว่าจะกรณีไหน ให้แสดงข้อความเดียวกัน
            generic_error_msg = "Invalid username or password"

            if not user:
                cls._log_login_attempt(db, login_identifier, is_success=False)
                raise ValueError(generic_error_msg)

            if user.is_locked:
                cls._log_login_attempt(db, login_identifier, is_success=False, user_id=user.id)
                raise ValueError(generic_error_msg)

            if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                # ผิดพลาด: เพิ่ม attempt และล็อกถ้าจำเป็น
                user.failed_login_attempts += 1
                if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
                    user.is_locked = True
                db.commit()
                cls._log_login_attempt(db, login_identifier, is_success=False, user_id=user.id)
                raise ValueError(generic_error_msg)
            
            # ตรวจสอบรหัสผ่านหมดอายุ
            if datetime.utcnow() > user.password_updated_at + timedelta(days=PASSWORD_EXPIRY_DAYS):
                 # ในระบบจริงอาจจะ return status พิเศษเพื่อให้ frontend รู้ว่าต้องไปหน้าเปลี่ยนรหัส
                 # ที่นี่เราจะโยน error ไปก่อน
                 raise ValueError("Password has expired. Please reset your password.")

            # สำเร็จ: รีเซ็ต attempt และล็อก
            user.failed_login_attempts = 0
            user.is_locked = False
            db.commit()
            cls._log_login_attempt(db, login_identifier, is_success=True, user_id=user.id)
            
            return user
            
    @classmethod
    def get_user_by_id(cls, user_id: int) -> User:
        with SessionLocal() as db:
            return db.query(User).filter(User.id == user_id).first()

    # --- Password Reset ---
    @classmethod
    def generate_and_send_magic_link(cls, email: str):
        with SessionLocal() as db:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                # ไม่แจ้งว่าไม่เจอ เพื่อความปลอดภัย
                print(f"Password reset requested for non-existent email: {email}")
                return
            
            token = secrets.token_urlsafe(32)
            user.reset_token = token
            user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
            db.commit()
            
            # สร้าง Magic Link (ต้องเปลี่ยน domain ตามหน้างานจริง)
            magic_link = f"http://localhost:8000/reset-password?token={token}" # ตัวอย่าง
            
            # ✅ เรียกใช้ฟังก์ชันส่งอีเมล
            send_reset_email(recipient_email=user.email, magic_link=magic_link)
            
    @classmethod
    def reset_password_with_token(cls, token: str, new_password: str) -> bool:
        if not cls._check_password_complexity(new_password):
            raise ValueError("New password does not meet complexity requirements.")

        with SessionLocal() as db:
            user = db.query(User).filter(User.reset_token == token).first()
            
            if not user or user.reset_token_expiry < datetime.utcnow():
                return False

            user.password = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode('utf-8')
            user.password_updated_at = datetime.utcnow()
            user.reset_token = None
            user.reset_token_expiry = None
            db.commit()
            return True

    # --- Admin Functions ---
    @classmethod
    def assign_user_tier(cls, user_id: int, tier: UserTier) -> User:
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return None
            user.tier = tier
            db.commit()
            db.refresh(user)
            return user

    # --- Order Functions ---
    @classmethod
    def create_order(cls, user_id: int, item_names: list[str]) -> Order:
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")

            new_order = Order(
                user_id=user.id,
                user_display_name=user.display_name,
                items=item_names
            )
            db.add(new_order)
            db.commit()
            db.refresh(new_order)
            return new_order