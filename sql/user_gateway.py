import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from datetime import datetime, timedelta
import secrets
import re 
import string 
import random 

from database import SessionLocal
from model import User, LoginLog, UserTier, Order, UserRole
from sqlalchemy import or_
from email_utils import send_reset_email
from typing import List, Optional
from Types import UserType

MAX_LOGIN_ATTEMPTS = 5
PASSWORD_EXPIRY_DAYS = 90

class PasswordExpiredError(Exception):
    def __init__(self, message, user):
        super().__init__(message)
        self.user = user

class UserGateway:
    
    @classmethod
    def get_user_by_id(cls, user_id: int) -> Optional[User]:
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == user_id).first()
            return user
    
    @classmethod
    def login_user(cls, login_identifier: str, password: str) -> User: 
        with SessionLocal() as db:
            user = db.query(User).filter(
                or_(User.username == login_identifier, User.email == login_identifier)
            ).first()

            generic_error_msg = "Invalid username or password"

            if not user:
                cls._log_login_attempt(db, login_identifier, is_success=False)
                raise ValueError(generic_error_msg)

            if user.is_locked:
                if user.locked_until and datetime.utcnow() > user.locked_until:
                    user.is_locked = False
                    user.failed_login_attempts = 0
                    user.locked_until = None
                    db.commit()
                else:
                    remaining_time = user.locked_until - datetime.utcnow()
                    minutes, _ = divmod(remaining_time.total_seconds(), 60)
                    raise ValueError(f"Account is locked. Please try again in {int(minutes) + 1} minutes.")

            if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                user.failed_login_attempts += 1
                if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
                    user.is_locked = True
                    user.locked_until = datetime.utcnow() + timedelta(minutes=15)
                db.commit()
                cls._log_login_attempt(db, login_identifier, is_success=False, user_id=user.id)
                if user.is_locked:
                    raise ValueError("Account has been locked for 15 minutes due to too many failed login attempts.")
                else:
                    raise ValueError(generic_error_msg)
        
            if datetime.utcnow() > user.password_updated_at + timedelta(days=PASSWORD_EXPIRY_DAYS):
                 raise PasswordExpiredError("Password has expired. You must reset it.", user)

            user.failed_login_attempts = 0
            user.is_locked = False
            user.locked_until = None
            db.commit()
            cls._log_login_attempt(db, login_identifier, is_success=True, user_id=user.id)
            
            return UserType(
                id=user.id,
                username=user.username,
                email=user.email,
                role=user.role.value,
                tier=user.tier.value
            )
    
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
    def _validate_password_complexity(password: str) -> List[str]:
        
        errors = []
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long.")
        if not re.search(r"[a-z]", password):
            errors.append("Password must contain a lowercase letter (a-z).")
        if not re.search(r"[A-Z]", password):
            errors.append("Password must contain an uppercase letter (A-Z).")
        if not re.search(r"[0-9]", password):
            errors.append("Password must contain a number (0-9).")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~]", password):
            errors.append("Password must contain a special character (e.g., !@#$%).")
        return errors

    # --- User Management ---
    @classmethod
    def register_customer(cls, username: str, email: str, password: str) -> UserType:
        password_errors = cls._validate_password_complexity(password)
        if password_errors:
            raise ValueError("\n".join(password_errors))
        
        hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode('utf-8')
        with SessionLocal() as db:
            if db.query(User).filter(or_(User.username == username, User.email == email)).first():
                raise ValueError("Username or email already in use.")
            
            new_user = User(
                username=username,
                email=email,
                password=hashed_pw,
                role=UserRole.USER
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            return UserType(
                id=new_user.id,
                username=new_user.username,
                email=new_user.email,
                role=new_user.role.value,
                tier=new_user.tier.value
            )
        
    @classmethod
    def create_admin(cls, username: str, email: str, password: str) -> UserType: # 👈 เปลี่ยน return type เป็น UserType
        password_errors = cls._validate_password_complexity(password)
        if password_errors:
            raise ValueError("\n".join(password_errors))

        hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode('utf-8')
        with SessionLocal() as db:
            if db.query(User).filter(or_(User.username == username, User.email == email)).first():
                raise ValueError("Username or email already in use.")

            new_admin = User(
                username=username,
                email=email,
                password=hashed_pw,
                role=UserRole.ADMIN
            )
            db.add(new_admin)
            db.commit()
            db.refresh(new_admin)
            
            return UserType(
                id=new_admin.id,
                username=new_admin.username,
                email=new_admin.email,
                role=new_admin.role.value,
                tier=new_admin.tier.value
            )
    
    @staticmethod
    def _generate_short_token(length: int = 6) -> str:
        """Generates a random token with uppercase letters and digits."""
        chars = string.ascii_uppercase + string.digits
        return ''.join(random.choices(chars, k=length))
    
    @classmethod
    def generate_and_send_reset_token(cls, email: str):
        with SessionLocal() as db:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                raise ValueError("Email address not found in our records.")
            
            token = cls._generate_short_token()
            user.reset_token = token
            user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=15)
            db.commit()
            
            try:
                send_reset_email(recipient_email=user.email, token=token)
            except Exception as e:
                raise ConnectionError("Failed to send email. Please try again later.")
            
    @classmethod
    def verify_reset_token(cls, token: str) -> bool:
        with SessionLocal() as db:
            user = db.query(User).filter(User.reset_token == token).first()
            
            if not user or user.reset_token_expiry < datetime.utcnow():
                raise ValueError("Invalid or expired token.")
            
            return True
    

    
    @classmethod
    def reset_password_with_token(cls, token: str, new_password: str) -> bool:
        password_errors = cls._validate_password_complexity(new_password)
        if password_errors:
            raise ValueError("\n".join(password_errors))

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
    def assign_user_tier(cls, user_id: int, tier: UserTier) -> UserType: 
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return None
            user.tier = tier
            db.commit()
            db.refresh(user)

            return UserType(
                id=user.id,
                username=user.username,
                email=user.email,
                role=user.role.value,
                tier=user.tier.value
            )

    # --- Order Functions ---
    @classmethod
    def create_order(cls, user_id: int, item_names: list[str]) -> Order:
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")

            new_order = Order(
                user_id=user.id,
                items=item_names
            )
            db.add(new_order)
            db.commit()
            db.refresh(new_order)
            return new_order