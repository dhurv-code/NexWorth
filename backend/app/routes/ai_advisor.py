from fastapi import APIRouter, Depends
from app.database import db
from app.utils.auth import get_current_user
from app.ml.predict import predict_allocation

router = APIRouter()

@router.get("/plan")
def ai_plan(user=Depends(get_current_user)):
    uid = user["user_id"]

    profile = db.profiles.find_one({"user_id": uid}) or {}
    tx = list(db.transactions.find({"user_id": uid}))
    liabilities = list(db.liabilities.find({"user_id": uid}))

    income = sum(i["amount"] for i in tx if i["type"] == "income")
    expense = sum(i["amount"] for i in tx if i["type"] == "expense")
    debt = sum(i.get("amount", 0) for i in liabilities)

    surplus = max(0, income - expense)

    risk_map = {"low": 0, "medium": 1, "high": 2}

    features = [
        profile.get("age", 25),
        income,
        expense,
        debt,
        risk_map.get(profile.get("risk_level", "medium"), 1),
        profile.get("goal_years", 10),
        surplus
    ]

    allocation = predict_allocation(features)

    return {
        "investable_amount": surplus,
        "allocation_percent": allocation,
        "allocation_amount": {
            k: round(v * surplus / 100, 2)
            for k, v in allocation.items()
        }
    }