from fastapi import APIRouter, Depends
from bson.objectid import ObjectId
from app.database import db
from app.utils.auth import get_current_user

router = APIRouter()

@router.post("/add")
def add_asset(data: dict, user=Depends(get_current_user)):
    data["user_id"] = user["user_id"]
    db.assets.insert_one(data)
    return {"message": "Asset added"}

@router.get("/all")
def all_assets(user=Depends(get_current_user)):
    data = []
    for item in db.assets.find({"user_id": user["user_id"]}):
        item["_id"] = str(item["_id"])
        data.append(item)
    return data

@router.put("/update/{id}")
def update_asset(id: str, data: dict, user=Depends(get_current_user)):
    db.assets.update_one(
        {"_id": ObjectId(id), "user_id": user["user_id"]},
        {"$set": data}
    )
    return {"message": "Asset updated"}

@router.delete("/delete/{id}")
def delete_asset(id: str, user=Depends(get_current_user)):
    db.assets.delete_one(
        {"_id": ObjectId(id), "user_id": user["user_id"]}
    )
    return {"message": "Asset deleted"}