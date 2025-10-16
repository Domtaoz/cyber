# create_db.py

# Import สิ่งที่จำเป็นจากไฟล์โปรเจกต์ของเรา
from database import engine
from model import Base, User, LoginLog, Order

def main():
    """
    ฟังก์ชันสำหรับสร้างตารางทั้งหมดในฐานข้อมูล
    """
    print("Connecting to the database engine...")
    
    # คำสั่งมหัศจรรย์! 
    # SQLAlchemy จะดู Class ทั้งหมดที่สืบทอดมาจาก Base ใน model.py
    # แล้วสร้างเป็นตารางในฐานข้อมูลให้เรา
    Base.metadata.create_all(bind=engine)
    
    print("Tables created successfully!")
    print("You can now run your main application.")

if __name__ == "__main__":
    main()