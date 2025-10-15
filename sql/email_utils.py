# email_utils.py
import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

# โหลดค่าจากไฟล์ .env
load_dotenv()

GMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
GMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def send_reset_email(recipient_email: str, magic_link: str):
    if not GMAIL_ADDRESS or not GMAIL_PASSWORD:
        print("ERROR: Email credentials not set in .env file.")
        return

    msg = EmailMessage()
    msg['Subject'] = 'Reset Your Mookrata App Password'
    msg['From'] = GMAIL_ADDRESS
    msg['To'] = recipient_email
    
    # เนื้อหาอีเมล
    msg.set_content(f"""
    Hello,

    We received a request to reset your password. Please click the link below to set a new password:
    {magic_link}

    If you did not request a password reset, please ignore this email.

    Thanks,
    The Mookrata App Team
    """)

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(GMAIL_ADDRESS, GMAIL_PASSWORD)
            smtp.send_message(msg)
        print(f"Password reset email sent to {recipient_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")