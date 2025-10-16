from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import Config

db_config = Config.load_db_config()

DATABASE_URL = "mysql+mysqlconnector://root:123456@localhost:3306/cyber"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

print("Database Connected Successfully!")
