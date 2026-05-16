from fastapi import APIRouter
from app.database import db
from itsdangerous import URLSafeTimedSerializer
from passlib.hash import bcrypt
import resend
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")

serializer = URLSafeTimedSerializer(SECRET_KEY)

resend.api_key = os.getenv(
    "RESEND_API_KEY"
)


@router.post("/forgot-password")
def forgot_password(data: dict):

    email = data.get("email")

    user = db.users.find_one({"email": email})

    if not user:
        return {
            "message":
            "If account exists, reset link sent"
        }

    token = serializer.dumps(email)

    reset_link = (
    f"{os.getenv('FRONTEND_URL')}"
    f"/reset-password?token={token}"
)

    resend.Emails.send({
    "from": "onboarding@resend.dev",
    "to": email,
    "subject":"Reset NexWorth Password",
    "html": f"""
    <h2>Password Reset</h2>

    <p>Click below:</p>

    <a href="{reset_link}">
    Reset Password
    </a>
    """
})

    # temporary
    print(reset_link)

    return {
        "message":
        "Reset link generated",
        "link": reset_link
    }


@router.post("/reset-password")
def reset_password(data: dict):

    token = data.get("token")

    new_password = data.get("new_password")

    try:

        email = serializer.loads(
            token,
            max_age=900
        )

    except:
        return {
            "error":
            "Token expired or invalid"
        }

    hashed_password = bcrypt.hash(
    new_password
)

    db.users.update_one(
    {"email": email},
    {
        "$set":{
            "password": hashed_password
        }
    }
)

    return {
        "message":
        "Password updated"
    }
