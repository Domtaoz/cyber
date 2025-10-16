# Types.py
import strawberry
from typing import Optional, List
from datetime import datetime

# ✅ New: เพิ่ม field ใหม่ๆ
@strawberry.type
class UserType:
    id: int
    username: str
    email: str
    role: str  # ส่งเป็น string
    tier: str  # ส่งเป็น string

@strawberry.type
class LoginResponse:
    success: bool
    message: str
    user: Optional[UserType]

@strawberry.type
class StatusResponse:
    success: bool
    message: str
    
@strawberry.type
class OrderType:
    id: int
    orderedAt: datetime
    items: List[str]