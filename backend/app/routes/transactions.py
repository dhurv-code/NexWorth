from fastapi import APIRouter, Depends
from app.database import db
from bson.objectid import ObjectId
from app.utils.auth import get_current_user

router=APIRouter()

@router.post("/add")
def add_transaction(data: dict, user=Depends(get_current_user)):
    data["user_id"] = user["user_id"]
    db.transactions.insert_one(data)
    return {"message": "Transaction added"}

@router.get("/all")
def get_all(user=Depends(get_current_user)):
    data = []
    for item in db.transactions.find({"user_id": user["user_id"]}):
        item["_id"] = str(item["_id"])
        data.append(item)
    return data


@router.delete("/delete/{id}")
def delete_transaction(id: str, user=Depends(get_current_user)):
    db.transactions.delete_one({
        "_id": ObjectId(id),
        "user_id": user["user_id"]
    })
    return {"message": "Transaction deleted"}


@router.put("/update/{id}")
def update_transaction(id: str, data: dict, user=Depends(get_current_user)):
    db.transactions.update_one(
        {
            "_id": ObjectId(id),
            "user_id": user["user_id"]
        },
        {"$set": data}
    )
    return {"message": "Updated successfully"}


@router.get("/analytics")
def analytics(user=Depends(get_current_user)):
    data = list(db.transactions.find({"user_id": user["user_id"]}))

    category_totals = {}
    monthly_totals = {}

    for item in data:
        if item["type"] == "expense":
            cat = item["category"]
            category_totals[cat] = category_totals.get(cat, 0) + item["amount"]

        month = item["date"][:7]   # YYYY-MM
        monthly_totals[month] = monthly_totals.get(month, 0) + item["amount"]

    return {
        "category_expense": category_totals,
        "monthly_flow": monthly_totals
    }
    
    
@router.get("/networth")
def networth(user=Depends(get_current_user)):
    transactions = list(db.transactions.find({"user_id": user["user_id"]}))
    liabilities = list(db.liabilities.find({"user_id": user["user_id"]}))
    assets = list(db.assets.find({"user_id": user["user_id"]}))

    income = sum(i["amount"] for i in transactions if i["type"] == "income")
    expense = sum(i["amount"] for i in transactions if i["type"] == "expense")

    cash_balance = income - expense
    total_assets = sum(i.get("amount", 0) for i in assets)
    total_liabilities = sum(i.get("remaining_amount", 0) for i in liabilities)

    net_worth = cash_balance + total_assets - total_liabilities

    return {
        "cash_balance": cash_balance,
        "tracked_assets": total_assets,
        "total_liabilities": total_liabilities,
        "net_worth": net_worth
    }  
# @router.get("/networth")
# def networth(user=Depends(get_current_user)):
#     transactions = list(db.transactions.find({"user_id": user["user_id"]}))
#     liabilities = list(db.liabilities.find({"user_id": user["user_id"]}))

#     income = sum(i["amount"] for i in transactions if i["type"] == "income")
#     expense = sum(i["amount"] for i in transactions if i["type"] == "expense")

#     cash = income - expense
#     debt = sum(i["amount"] for i in liabilities)

#     return {
#         "cash_balance": cash,
#         "total_liabilities": debt,
#         "net_worth": cash - debt
#     }


@router.get("/summary")
def summary(user=Depends(get_current_user)):
    data = list(db.transactions.find({"user_id": user["user_id"]}))

    income = sum(i["amount"] for i in data if i["type"] == "income")
    expense = sum(i["amount"] for i in data if i["type"] == "expense")

    return {
        "income": income,
        "expense": expense,
        "balance": income - expense
    }