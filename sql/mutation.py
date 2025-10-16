# mutation.py
import strawberry
from Types import UserType, LoginResponse, StatusResponse, OrderType
from user_gateway import UserGateway, PasswordExpiredError
from model import UserTier
from typing import Optional

@strawberry.type
class Mutation:
    @strawberry.mutation
    def register_customer(self, username: str, email: str, password: str) -> LoginResponse:
        try:
            user = UserGateway.register_customer(username, email, password)
            
            return LoginResponse(success=True, message="Customer account created successfully", user=user)
        except ValueError as e:
            return LoginResponse(success=False, message=str(e), user=None)

    @strawberry.mutation
    def create_admin(self, username: str, email: str, password: str) -> LoginResponse:
        try:
            admin_user = UserGateway.create_admin(username, email, password)
            
            return LoginResponse(success=True, message="Admin account created successfully", user=admin_user)
        except ValueError as e:
            return LoginResponse(success=False, message=str(e), user=None)
        
    @strawberry.mutation
    def login_user(self, login_identifier: str, password: str) -> LoginResponse:
        try:
            user_type = UserGateway.login_user(login_identifier, password)
            return LoginResponse(success=True, message="Login successful", user=user_type)
        except PasswordExpiredError as e: 
            user = e.user
            user_type = UserType(
                id=user.id,
                username=user.username,
                email=user.email,
                role=user.role.value,
                tier=user.tier.value
            )
            return LoginResponse(success=False, message=str(e), user=user_type, passwordExpired=True)
        except ValueError as e:
            return LoginResponse(success=False, message=str(e), user=None)
        except Exception as e:
            return LoginResponse(success=False, message=f"An unexpected error occurred: {e}", user=None)
        
    @strawberry.mutation
    def request_password_reset(self, email: str) -> StatusResponse:
        try:
            UserGateway.generate_and_send_reset_token(email)
            return StatusResponse(success=True, message="A reset code has been sent to your email.")
        except (ValueError, ConnectionError) as e:
            return StatusResponse(success=False, message=str(e))

    @strawberry.mutation
    def verify_reset_token(self, token: str) -> StatusResponse:
        try:
            UserGateway.verify_reset_token(token)
            return StatusResponse(success=True, message="Token is valid.")
        except ValueError as e:
            return StatusResponse(success=False, message=str(e))
    
    @strawberry.mutation
    def reset_password(self, token: str, new_password: str) -> StatusResponse:
        try:
            success = UserGateway.reset_password_with_token(token, new_password)
            if success:
                return StatusResponse(success=True, message="Password has been reset successfully.")
            else:
                return StatusResponse(success=False, message="Invalid or expired token.")
        except ValueError as e:
            return StatusResponse(success=False, message=str(e))
    
    @strawberry.mutation
    def assign_tier(self, user_id: int, tier_name: str) -> Optional[UserType]:
        try:
            tier_enum = UserTier[tier_name.upper()]
            return UserGateway.assign_user_tier(user_id, tier_enum)
            
        except KeyError:
            raise Exception("Invalid tier name provided.")
        
    @strawberry.mutation
    def createOrder(self, userId: int, itemNames: list[str]) -> Optional[OrderType]:
        try:
            order = UserGateway.create_order(user_id=userId, item_names=itemNames)
            if order:
                return OrderType(
                    id=order.id,
                    orderedAt=order.ordered_at,
                    items=order.items
                )
            return None
        except Exception as e:
            raise Exception(str(e))