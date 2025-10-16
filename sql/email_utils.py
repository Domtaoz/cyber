import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

GMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
GMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def send_reset_email(recipient_email: str, token: str):
    if not GMAIL_ADDRESS or not GMAIL_PASSWORD:
        print("ERROR: Email credentials not set in .env file.")
        raise ConnectionError("Email service is not configured.")

    msg = EmailMessage()
    msg['Subject'] = 'Your Mookrata App Password Reset Code'
    msg['From'] = GMAIL_ADDRESS
    msg['To'] = recipient_email
    
    msg.set_content(f"""
    Hello,

    Your password reset code is: {token}

    This code will expire in 15 minutes.

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
        raise e