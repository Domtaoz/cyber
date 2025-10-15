import strawberry
from datetime import date, time
from typing import List, Optional

@strawberry.type
class UserType:
    id: int
    display_name: str
    username: str
    profile_picture_url: str
    request_sent: bool = False
    request_received: bool = False
    is_friend: bool = False
    
@strawberry.type
class LoginResponse:
    success: bool
    message: str
    user: Optional[UserType]

