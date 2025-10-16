from database import engine
from model import Base, User, LoginLog, Order

def main():
    """
    ฟังก์ชันสำหรับสร้างตารางทั้งหมดในฐานข้อมูล
    """
    print("Connecting to the database engine...")
    
    Base.metadata.create_all(bind=engine)
    
    print("Tables created successfully!")
    print("You can now run your main application.")

if __name__ == "__main__":
    main()