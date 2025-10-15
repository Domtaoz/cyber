from sqlalchemy import JSON, Column, DECIMAL, Integer, String, DateTime, Date, Time, Boolean, ForeignKey, Enum, UniqueConstraint, CheckConstraint, Text
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    display_name = Column(String(255), nullable=True)
    username = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    password_updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())
    reset_token = Column(String(100), nullable=True, default=None)
    created_at = Column(DateTime, nullable=False, default=func.now())

    profile_picture_url = Column(
        String(500), 
        nullable=False, 
        default="https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.webp"
    )

    def __repr__(self):
        return f"<User(id={self.id}, display_name={self.display_name}, username={self.username})>"

class SeatStatus(enum.Enum):
    available = "available"
    booked = "booked"

class BookingStatus(enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"

class Concert(Base):
    __tablename__ = "concerts"
    concert_id = Column(Integer, primary_key=True, index=True)
    concert_name = Column(String(255), nullable=False)
    band_name = Column(String(255), nullable=False)
    concert_type = Column(String(50), nullable=False)

class Band(Base):
    __tablename__ = "bands"
    band_id = Column(Integer, primary_key=True, index=True)
    band_name = Column(String, nullable=False)
    band_members = Column(JSON, nullable=False)

class Zone(Base):
    __tablename__ = "zones"
    zone_id = Column(Integer, primary_key=True, index=True)
    concert_id = Column(Integer, ForeignKey("concerts.concert_id"), nullable=False)
    zone_name = Column(String(50), nullable=False)
    price = Column(DECIMAL, nullable=False)

class Seat(Base):
    __tablename__ = "seats"
    seat_id = Column(Integer, primary_key=True, index=True)
    concert_id = Column(Integer, ForeignKey("concerts.concert_id"), nullable=False)
    zone_id = Column(Integer, ForeignKey("zones.zone_id"), nullable=False)
    seat_number = Column(String(10), nullable=False)
    seat_status = Column(Enum(SeatStatus), default=SeatStatus.available)

class Booking(Base):
    __tablename__ = "bookings"
    
    booking_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concert_id = Column(Integer, ForeignKey("concerts.concert_id"), nullable=False)
    zone_id = Column(Integer, ForeignKey("zones.zone_id"), nullable=False)
    booking_status = Column(Enum(BookingStatus), default=BookingStatus.pending) 

class BookingSeat(Base):
    __tablename__ = "booking_seats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id"), nullable=False)
    seat_id = Column(Integer, ForeignKey("seats.seat_id"), nullable=False)

class Ticket(Base):
    __tablename__ = "tickets"

    ticket_id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seat_id = Column(Integer, ForeignKey("seats.seat_id"), nullable=False) 
    ticket_code = Column(String, unique=True, nullable=False)
    concert_name = Column(String, nullable=False)  #
    zone_name = Column(String, nullable=False)  
    seat_number = Column(String, nullable=False)  
