# Developed by DHURUV KUMAR GUPTA
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from app.database import db
from passlib.hash import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

router = APIRouter()

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

if not SECRET_KEY:
    raise ValueError("SECRET_KEY missing in .env")


class RegisterUser(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=20)


class LoginUser(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=20)


@router.post("/register")
def register(data: RegisterUser):
    email = data.email.lower().strip()

    existing = db.users.find_one({"email": email})

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = bcrypt.hash(data.password)

    db.users.insert_one({
        "email": email,
        "password": hashed_password,
        "created_at": datetime.utcnow()
    })

    return {
        "message": "User Registered Successfully"
    }


@router.post("/login")
def login(data: LoginUser):
    email = data.email.lower().strip()

    user = db.users.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not bcrypt.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt.encode(
        {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "exp": datetime.utcnow() + timedelta(days=1)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "message": "Login Success",
        "token": token
    }