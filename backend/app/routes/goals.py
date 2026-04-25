from fastapi import FastAPI, Depends, APIRouter
from app.database import db
from app.utils.auth import get_current_user
from bson.objectid import ObjectId

router= APIRouter()

@router.post("/add")
def add_goal(data: dict, user=Depends(get_current_user)):
    data["user_id"] = user["user_id"]
    db.goals.insert_one(data)
    return {"message":"goal added"}

@router.get("/all")
def all_goals(user=Depends(get_current_user)):
    data = []
    for item in db.goals.find({"user_id": user["user_id"]}):
        item["_id"] = str(item["_id"])
        data.append(item)
    return data

@router.put("/update/{id}")
def update_goal(id: str, data: dict, user=Depends(get_current_user)):
    db.goals.update_one(
        {"_id": ObjectId(id), "user_id": user["user_id"]},
        {"$set": data}
    )
    return {"message": "Goal updated"}

@router.delete("/delete/{id}")
def delete_goal(id: str, user=Depends(get_current_user)):
    db.goals.delete_one(
        {"_id": ObjectId(id), "user_id": user["user_id"]}
    )
    return {"message": "Goal deleted"}









