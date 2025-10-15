# Types.py
import strawberry
from typing import Optional

# ✅ New: เพิ่ม field ใหม่ๆ
@strawberry.type
class UserType:
    id: int
    display_name: str
    username: str
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