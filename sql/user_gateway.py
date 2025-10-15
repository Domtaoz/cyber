import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from sqlalchemy.sql import func
from typing import Optional, List

# ✅ เพิ่มสองบรรทัดนี้ เพื่อให้ SQLAlchemy ใช้ได้
from database import SessionLocal     # ← ใช้ SessionLocal จาก database.py
from model import User                # ← ใช้โมเดล User จาก model.py


class UserGateway:
    @classmethod
    def get_users(cls) -> List[User]:
        with SessionLocal() as db:
            return db.query(User).all()

    @classmethod
    def get_user_by_id(cls, id: int) -> Optional[User]:
        with SessionLocal() as db:
            return db.query(User).filter(User.id == id).first()

    @classmethod
    def add_user(cls, display_name: str, username: str, password: str, profile_picture_url: Optional[str] = None) -> Optional[User]:
        hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode('utf-8')
        with SessionLocal() as db:
            if db.query(User).filter(User.username == username).first():
                raise ValueError("username already in use")
            
            new_user = User(
                display_name=display_name, 
                username=username, 
                password=hashed_pw, 
                profile_picture_url=profile_picture_url
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return new_user

    @classmethod
    def update_user(cls, id: int, display_name: Optional[str] = None, username: Optional[str] = None,
                    password: Optional[str] = None, profile_picture_url: Optional[str] = None) -> Optional[User]:
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == id).first()
            if not user:
                return None

            if display_name:
                user.display_name = display_name
            if username:
                user.username = username
            if password:
                user.password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode('utf-8')
            if profile_picture_url:
                user.profile_picture_url = profile_picture_url

            db.commit()
            db.refresh(user)
            return user
  
    @classmethod
    def update_user_avatar(cls, user_id: int, profile_picture_url: str) -> Optional[User]:
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return None
            
            user.profile_picture_url = profile_picture_url
            db.commit()
            db.refresh(user)
            return user

    @classmethod
    def delete_user(cls, id: int) -> bool:
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == id).first()
            if not user:
                return False
            db.delete(user)
            db.commit()
            return True

    @classmethod
    def login_user(cls, username: str, password: str) -> Optional[User]:
        with SessionLocal() as db:
            user = db.query(User).filter(User.username == username).first()
            if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                raise ValueError("Invalid username or password")
            return user

    @staticmethod
    def get_user_by_email(username: str) -> Optional[User]:
        with SessionLocal() as db:
            try:
                return db.query(User).filter(User.username == username).one()
            except NoResultFound:
                return None

    @staticmethod
    def verify_password(user: User, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8'))
