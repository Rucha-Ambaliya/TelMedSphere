#!/usr/bin/env python3

import json
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()

# Load environment variables
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("PORT", 587))  # Default to 587 if not set
EMAIL_USER = os.getenv("HOST_EMAIL", "")
EMAIL_PASS = os.getenv("PASSWORD", "")
print("smtp port", SMTP_PORT)

if not EMAIL_USER or not EMAIL_PASS:
    raise ValueError("❌ Missing SMTP credentials. Check GitHub Secrets!")

# Fix JSON file path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(BASE_DIR, "scheduled_emails.json")

# Ensure JSON file exists
if not os.path.exists(JSON_FILE):
    print("⚠️ No scheduled_emails.json found, creating a new one.")
    with open(JSON_FILE, "w") as file:
        json.dump([], file)

# Load scheduled emails
try:
    with open(JSON_FILE, "r") as file:
        scheduled_emails = json.load(file)
except (FileNotFoundError, json.JSONDecodeError):
    scheduled_emails = []

print(f"📨 Scheduled emails: {scheduled_emails}")

# Define IST (Indian Standard Time) offset
IST_OFFSET = timedelta(hours=5, minutes=30)

# Get current time in UTC
current_time_dt = datetime.utcnow().replace(second=0, microsecond=0)

emails_to_send = []
remaining_emails = []

for email in scheduled_emails:
    # Convert email time from IST to UTC
    email_send_time = datetime.strptime(email["send_time"], "%Y-%m-%d %H:%M")  # Convert to datetime
    email_send_time = email_send_time - IST_OFFSET  # Convert IST to UTC

    print(f"📅 Email Time (UTC): {email_send_time} | 🕒 Current Time (UTC): {current_time_dt}")

    if email_send_time <= current_time_dt:
        print("✅ Email is due for sending:", email)
        emails_to_send.append(email)
    else:
        remaining_emails.append(email)

def send_email(subject, body, recipient):
    """Send an email to a single recipient."""
    print(f"📧 Attempting to send email to: {recipient}")
    print(f"📜 Subject: {subject}")
    print(f"💬 Body: {body}")

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)

        msg = MIMEMultipart()
        msg["From"] = EMAIL_USER
        msg["To"] = recipient
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))

        server.sendmail(EMAIL_USER, recipient, msg.as_string())
        server.quit()

        print(f"✅ Email sent successfully to {recipient}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email to {recipient}: {e}")
        return False

# Send all due emails
for email in emails_to_send:
    print(f"📨 Sending email to: {email['recipient']} at {email['send_time']}...")
    send_email(email["subject"], email["body"], email["recipient"])

# Save remaining emails
with open(JSON_FILE, "w") as file:
    json.dump(remaining_emails, file, indent=4)

print("✅ Scheduled emails processed successfully.")
