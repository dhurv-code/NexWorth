from fastapi import APIRouter, Depends
from app.database import db
from app.utils.auth import get_current_user
from bson.objectid import ObjectId
from bson.errors import InvalidId
from datetime import datetime

router = APIRouter()


@router.post("/pay/{loan_id}")
def pay_loan(
    loan_id: str,
    data: dict,
    user=Depends(get_current_user)
):

    # -----------------------------
    # Validate Loan ID
    # -----------------------------
    try:
        loan_object_id = ObjectId(loan_id)
    except InvalidId:
        return {"error": "Invalid loan ID"}

    # -----------------------------
    # Validate Amount
    # -----------------------------
    if "amount" not in data:
        return {"error": "Amount is required"}

    amount = data["amount"]

    if not isinstance(amount, (int, float)):
        return {"error": "Amount must be a number"}

    if amount <= 0:
        return {"error": "Amount must be positive"}

    # -----------------------------
    # Find Loan
    # -----------------------------
    loan = db.liabilities.find_one({
        "_id": loan_object_id,
        "user_id": user["user_id"]
    })

    if not loan:
        return {"error": "Loan not found"}

    # -----------------------------
    # Prevent Payment On Closed Loan
    # -----------------------------
    if loan.get("status") == "closed":
        return {"error": "Loan already closed"}

    # -----------------------------
    # Calculate New Balances
    # -----------------------------
    current_paid = loan.get("paid_amount", 0)

    new_paid = current_paid + amount

    remaining = loan["principal_amount"] - new_paid

    if remaining < 0:
        return {
            "error": "Payment exceeds remaining balance"
        }

    # -----------------------------
    # Loan Status
    # -----------------------------
    status = "active"

    if remaining == 0:
        status = "closed"

    # -----------------------------
    # Update Liability
    # -----------------------------
    db.liabilities.update_one(
        {
            "_id": loan_object_id,
            "user_id": user["user_id"]
        },
        {
            "$set": {
                "paid_amount": new_paid,
                "remaining_amount": remaining,
                "status": status,
                "last_payment_date": datetime.utcnow().isoformat()
            }
        }
    )

    # -----------------------------
    # Insert Loan Payment History
    # -----------------------------
    db.loan_payments.insert_one({
        "loan_id": loan_id,
        "loan_name": loan.get("name", "Loan"),
        "amount": amount,
        "user_id": user["user_id"],
        "payment_date": datetime.utcnow().isoformat()
    })

    # -----------------------------
    # Insert Expense Transaction
    # -----------------------------
    db.transactions.insert_one({
        "user_id": user["user_id"],
        "type": "expense",
        "category": "loan_payment",
        "loan_id": loan_id,
        "loan_name": loan.get("name", "Loan"),
        "amount": amount,
        "date": datetime.utcnow().isoformat()
    })

    return {
        "message": "Loan payment recorded",
        "loan_status": status,
        "total_paid": new_paid,
        "remaining_balance": remaining
    }


@router.get("/history/{loan_id}")
def payment_history(
    loan_id: str,
    user=Depends(get_current_user)
):

    try:
        loan_object_id = ObjectId(loan_id)
    except InvalidId:
        return {"error": "Invalid loan ID"}

    loan = db.liabilities.find_one({
        "_id": loan_object_id,
        "user_id": user["user_id"]
    })

    if not loan:
        return {"error": "Loan not found"}

    payments = []

    for item in db.loan_payments.find({
        "loan_id": loan_id,
        "user_id": user["user_id"]
    }):

        item["_id"] = str(item["_id"])

        payments.append(item)

    return {
        "loan_name": loan.get("name", "Loan"),
        "payments": payments
    }


@router.get("/safe-balance")
def safe_balance(user=Depends(get_current_user)):

    transactions = list(
        db.transactions.find({
            "user_id": user["user_id"]
        })
    )

    liabilities = list(
        db.liabilities.find({
            "user_id": user["user_id"]
        })
    )

    income = sum(
        item.get("amount", 0)
        for item in transactions
        if item.get("type") == "income"
    )

    expense = sum(
        item.get("amount", 0)
        for item in transactions
        if item.get("type") == "expense"
    )

    upcoming_emi = sum(
        item.get("emi_amount", 0)
        for item in liabilities
        if item.get("status") == "active"
    )

    current_balance = income - expense

    safe_to_spend = current_balance - upcoming_emi

    return {
        "current_balance": current_balance,
        "upcoming_emi": upcoming_emi,
        "safe_to_spend": safe_to_spend
    }