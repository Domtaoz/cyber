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
    def register_customer(self, username: str, email: str, password: str) -> LoginResponse:
        try:
            # ✅ เรียกใช้ฟังก์ชันใหม่สำหรับลูกค้าเท่านั้น
            user = UserGateway.register_customer(username, email, password)
            user_type = UserType(
                id=user.id, 
                username=user.username, 
                email=user.email,
                role=user.role.value,
                tier=user.tier.value
            )
            return LoginResponse(success=True, message="Customer account created successfully", user=user_type)
        except ValueError as e:
            return LoginResponse(success=False, message=str(e), user=None)

    # ✅ ใหม่: Mutation สำหรับสร้าง Admin
    # ❗️ ในระบบจริง Mutation นี้ควรมีการป้องกัน ให้เรียกใช้ได้เฉพาะ Admin ที่ Login อยู่เท่านั้น
    @strawberry.mutation
    def create_admin(self, username: str, email: str, password: str) -> LoginResponse:
        try:
            admin_user = UserGateway.create_admin(username, email, password)
            user_type = UserType(
                id=admin_user.id,
                username=admin_user.username,
                email=admin_user.email,
                role=admin_user.role.value,
                tier=admin_user.tier.value
            )
            return LoginResponse(success=True, message="Admin account created successfully", user=user_type)
        except ValueError as e:
            return LoginResponse(success=False, message=str(e), user=None)
        
    # 🔄 Changed: อัปเดต login_user
    @strawberry.mutation
    def login_user(self, login_identifier: str, password: str) -> LoginResponse: # 🔄 อัปเดตฟังก์ชันนี้
        try:
            # ✅ ตอนนี้ 'user_type' ที่ได้กลับมาคือ UserType ที่พร้อมใช้งานแล้ว
            user_type = UserGateway.login_user(login_identifier, password)
            
            return LoginResponse(success=True, message="Login successful", user=user_type)
        except ValueError as e:
            return LoginResponse(success=False, message=str(e), user=None)

    @strawberry.mutation
    def request_password_reset(self, email: str) -> StatusResponse:
        try:
            # 🔄 เรียกใช้ฟังก์ชันที่เปลี่ยนชื่อแล้ว
            UserGateway.generate_and_send_reset_token(email)
            return StatusResponse(success=True, message="A reset code has been sent to your email.")
        except (ValueError, ConnectionError) as e:
            return StatusResponse(success=False, message=str(e))

    # ✅ ใหม่: Mutation สำหรับตรวจสอบ Token
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
                    username=user.username,
                    email=user.email,
                    role=user.role.value,
                    tier=user.tier.value
                )
            return None
        except KeyError:
            # ถ้า client ส่งชื่อ tier ที่ไม่มีอยู่จริง
            raise Exception("Invalid tier name provided.")