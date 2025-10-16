import strawberry
from typing import List, Optional
from user_gateway import UserGateway
from Types import UserType

@strawberry.type
class Query:
    @strawberry.field
    def get_user_by_id(self, id: int) -> Optional[UserType]:
        user = UserGateway.get_user_by_id(id)
        if user:
            return UserType(
                id=user.id, 
                username=user.username, 
                email=user.email,
                role=user.role.value,
                tier=user.tier.value
            )
        return None
    
    @strawberry.field
    def check_my_status(self, user_id: int) -> Optional[UserType]:
        user = UserGateway.get_user_by_id(user_id)
        if user:
            return UserType(
                id=user.id,
                username=user.username,
                email=user.email,
                role=user.role.value, # แปลง enum เป็น string
                tier=user.tier.value, # แปลง enum เป็น string
            )
        return None
    

    
