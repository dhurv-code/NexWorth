from fastapi import APIRouter, Depends
from app.database import db
from app.utils.auth import get_current_user
from bson.objectid import ObjectId

router = APIRouter()

@router.post("/add")
def add_liability(data: dict, user=Depends(get_current_user)):
    data["user_id"] = user["user_id"]
    db.liabilities.insert_one(data)
    return {"message": "Liability added"}

@router.get("/all")
def all_liabilities(user=Depends(get_current_user)):
    data = []
    for item in db.liabilities.find({"user_id": user["user_id"]}):
        item["_id"] = str(item["_id"])
        data.append(item)
    return data

@router.put("/update/{id}")
def update_liability(id: str, data: dict, user=Depends(get_current_user)):
    db.liabilities.update_one(
        {"_id": ObjectId(id), "user_id": user["user_id"]},
        {"$set": data}
    )
    return {"message": "Liability updated"}

@router.delete("/delete/{id}")
def delete_liability(id: str, user=Depends(get_current_user)):
    db.liabilities.delete_one(
        {"_id": ObjectId(id), "user_id": user["user_id"]}
    )
    return {"message": "Liability deleted"}