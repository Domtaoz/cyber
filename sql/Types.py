import strawberry
from typing import Optional, List
from datetime import datetime

@strawberry.type
class UserType:
    id: int
    username: str
    email: str
    role: str  
    tier: str  

@strawberry.type
class LoginResponse:
    success: bool
    message: str
    user: Optional[UserType]
    passwordExpired: Optional[bool] = False

@strawberry.type
class StatusResponse:
    success: bool
    message: str
    
@strawberry.type
class OrderType:
    id: int
    orderedAt: datetime
    items: List[str]