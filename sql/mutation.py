# mutation.py
import strawberry
from Types import UserType, LoginResponse, StatusResponse
from user_gateway import UserGateway
from model import UserTier
from typing import Optional

@strawberry.type
class Mutation:
    # 🔄 Changed: อัปเดต add_user
    @strawberry.mutation
    def register_customer(self, display_name: str, username: str, email: str, password: str) -> LoginResponse:
        try:
            # ✅ เรียกใช้ฟังก์ชันใหม่สำหรับลูกค้าเท่านั้น
            user = UserGateway.register_customer(display_name, username, email, password)
            user_type = UserType(
                id=user.id, 
                display_name=user.display_name, 
                username=user.username, 
                role=user.role.value,
                tier=user.tier.value
            )
            return LoginResponse(success=True, message="Customer account created successfully", user=user_type)
        except ValueError as e:
            return LoginResponse(success=False, message=str(e), user=None)

    # ✅ ใหม่: Mutation สำหรับสร้าง Admin
    # ❗️ ในระบบจริง Mutation นี้ควรมีการป้องกัน ให้เรียกใช้ได้เฉพาะ Admin ที่ Login อยู่เท่านั้น
    @strawberry.mutation
    def create_admin(self, display_name: str, username: str, email: str, password: str) -> LoginResponse:
        try:
            admin_user = UserGateway.create_admin(display_name, username, email, password)
            user_type = UserType(
                id=admin_user.id,
                display_name=admin_user.display_name,
                username=admin_user.username,
                role=admin_user.role.value,
                tier=admin_user.tier.value
            )
            return LoginResponse(success=True, message="Admin account created successfully", user=user_type)
        except ValueError as e:
            return LoginResponse(success=False, message=str(e), user=None)
        
    # 🔄 Changed: อัปเดต login_user
    @strawberry.mutation
    def login_user(self, login_identifier: str, password: str) -> LoginResponse:
        try:
            user = UserGateway.login_user(login_identifier, password)
            user_type = UserType(
                id=user.id,
                display_name=user.display_name,
                username=user.username,
                role=user.role.value,
                tier=user.tier.value,
            )
            return LoginResponse(success=True, message="Login successful", user=user_type)
        except ValueError as e:
            return LoginResponse(success=False, message=str(e), user=None)

    # ✅ New: Mutations ใหม่
    @strawberry.mutation
    def request_password_reset(self, email: str) -> StatusResponse:
        token = UserGateway.generate_reset_token(email)
        # เราตอบกลับว่าสำเร็จเสมอ เพื่อไม่ให้คนร้ายรู้ว่า username มีในระบบหรือไม่
        return StatusResponse(success=True, message="If an account with that email exists, a reset token has been generated.")

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
    
    # ❗️หมายเหตุ: ในระบบจริง ควรมีการตรวจสอบก่อนว่าคนเรียกเป็น Admin หรือไม่
    @strawberry.mutation
    def assign_tier(self, user_id: int, tier_name: str) -> Optional[UserType]:
        try:
            # แปลง string จาก client เป็น Enum
            tier_enum = UserTier[tier_name.upper()]
            user = UserGateway.assign_user_tier(user_id, tier_enum)
            if user:
                return UserType(
                    id=user.id,
                    display_name=user.display_name,
                    username=user.username,
                    role=user.role.value,
                    tier=user.tier.value
                )
            return None
        except KeyError:
            # ถ้า client ส่งชื่อ tier ที่ไม่มีอยู่จริง
            raise Exception("Invalid tier name provided.")