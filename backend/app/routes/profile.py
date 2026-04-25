from fastapi import APIRouter, Depends
from app.database import db
from app.utils.auth import get_current_user

router = APIRouter()

@router.post("/save")
def save_profile(data: dict, user=Depends(get_current_user)):
    db.profiles.update_one(
        {"user_id": user["user_id"]},
        {"$set": {**data, "user_id": user["user_id"]}},
        upsert=True
    )
    return {"message": "Profile saved"}

@router.get("/me")
def get_profile(user=Depends(get_current_user)):
    profile = db.profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    return profile or {}