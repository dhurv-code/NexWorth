
from fastapi import APIRouter, Depends
from app.database import db
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/plan")
def ai_plan(user=Depends(get_current_user)):
    uid = user["user_id"]

    profile = db.profiles.find_one({"user_id": uid}) or {}
    tx = list(db.transactions.find({"user_id": uid}))
    liabilities = list(db.liabilities.find({"user_id": uid}))
    assets = list(db.assets.find({"user_id": uid}))

    # totals
    income = sum(i["amount"] for i in tx if i["type"] == "income")
    expense = sum(i["amount"] for i in tx if i["type"] == "expense")

    total_liability = sum(i.get("amount", 0) for i in liabilities)
    total_assets = sum(i.get("amount", 0) for i in assets)

    # liquid assets
    liquid_assets = sum(
        i.get("amount", 0)
        for i in assets
        if i.get("type", "").lower() in ["cash", "bank", "fd"]
    )

    monthly_surplus = max(0, income - expense)

    # emergency fund = 6 months expense
    emergency_target = expense * 6
    emergency_ready = liquid_assets >= emergency_target

    risk = profile.get("risk_level", "medium").lower()
    goal_years = profile.get("goal_years", 10)

    recommendations = []

    # if no surplus
    if monthly_surplus == 0:
        return {
            "status": "No monthly investable surplus",
            "actions": [
                "Reduce expenses",
                "Increase income",
                "Repay liabilities",
                "Rebuild monthly surplus"
            ]
        }

    # emergency first
    if not emergency_ready:
        reserve = min(monthly_surplus * 0.4, emergency_target - liquid_assets)

        recommendations.append({
            "type": "Emergency Fund",
            "amount": round(reserve, 2),
            "where": "Savings Account / Liquid Fund",
            "reason": "Build 6-month safety reserve first"
        })

        monthly_surplus -= reserve

    # debt pressure
    if total_liability > income * 12:
        paydown = monthly_surplus * 0.4

        recommendations.append({
            "type": "Debt Reduction",
            "amount": round(paydown, 2),
            "where": "Loan Prepayment",
            "reason": "High liabilities reducing future wealth"
        })

        monthly_surplus -= paydown

    # investment allocation
    if monthly_surplus > 0:

        if risk == "low":
            recommendations.extend([
                {
                    "type": "Fixed Deposit",
                    "amount": round(monthly_surplus * 0.45, 2),
                    "where": "FD / RD",
                    "reason": "Capital safety"
                },
                {
                    "type": "Debt Fund",
                    "amount": round(monthly_surplus * 0.25, 2),
                    "where": "Short Duration Debt Fund",
                    "reason": "Stable returns"
                },
                {
                    "type": "Gold",
                    "amount": round(monthly_surplus * 0.15, 2),
                    "where": "Gold ETF / SGB",
                    "reason": "Diversification"
                },
                {
                    "type": "SIP",
                    "amount": round(monthly_surplus * 0.15, 2),
                    "where": "Index Mutual Fund",
                    "reason": "Long-term gradual growth"
                }
            ])

        elif risk == "high":
            recommendations.extend([
                {
                    "type": "Equity SIP",
                    "amount": round(monthly_surplus * 0.45, 2),
                    "where": "Index / Flexicap Mutual Fund",
                    "reason": "Long-term growth"
                },
                {
                    "type": "Stocks",
                    "amount": round(monthly_surplus * 0.20, 2),
                    "where": "Large Cap Quality Stocks",
                    "reason": "Higher growth potential"
                },
                {
                    "type": "Gold",
                    "amount": round(monthly_surplus * 0.10, 2),
                    "where": "Gold ETF",
                    "reason": "Risk hedge"
                },
                {
                    "type": "Debt",
                    "amount": round(monthly_surplus * 0.15, 2),
                    "where": "Debt Fund",
                    "reason": "Portfolio balance"
                },
                {
                    "type": "Property Fund",
                    "amount": round(monthly_surplus * 0.10, 2),
                    "where": "REIT / Down-payment fund",
                    "reason": "Real estate exposure"
                }
            ])

        else:
            recommendations.extend([
                {
                    "type": "SIP",
                    "amount": round(monthly_surplus * 0.40, 2),
                    "where": "Index Mutual Fund",
                    "reason": "Balanced growth"
                },
                {
                    "type": "FD",
                    "amount": round(monthly_surplus * 0.20, 2),
                    "where": "FD / RD",
                    "reason": "Safety"
                },
                {
                    "type": "Debt Fund",
                    "amount": round(monthly_surplus * 0.15, 2),
                    "where": "Debt Mutual Fund",
                    "reason": "Stable allocation"
                },
                {
                    "type": "Gold",
                    "amount": round(monthly_surplus * 0.10, 2),
                    "where": "Gold ETF",
                    "reason": "Diversification"
                },
                {
                    "type": "Property Goal",
                    "amount": round(monthly_surplus * 0.15, 2),
                    "where": "REIT / House down-payment fund",
                    "reason": "Future asset creation"
                }
            ])

    return {
        "monthly_income": income,
        "monthly_expense": expense,
        "monthly_surplus": income - expense,
        "total_assets": total_assets,
        "total_liabilities": total_liability,
        "emergency_fund_ready": emergency_ready,
        "risk_level": risk,
        "goal_years": goal_years,
        "recommendations": recommendations
    }

# from fastapi import APIRouter, Depends
# from app.database import db
# from app.utils.auth import get_current_user
# from app.ml.predict import predict_allocation

# router = APIRouter()

# @router.get("/plan")
# def ai_plan(user=Depends(get_current_user)):
#     uid = user["user_id"]

#     profile = db.profiles.find_one({"user_id": uid}) or {}
#     tx = list(db.transactions.find({"user_id": uid}))
#     liabilities = list(db.liabilities.find({"user_id": uid}))

#     income = sum(i["amount"] for i in tx if i["type"] == "income")
#     expense = sum(i["amount"] for i in tx if i["type"] == "expense")
#     debt = sum(i.get("amount", 0) for i in liabilities)

#     surplus = max(0, income - expense)

#     risk_map = {"low": 0, "medium": 1, "high": 2}

#     features = [
#         profile.get("age", 25),
#         income,
#         expense,
#         debt,
#         risk_map.get(profile.get("risk_level", "medium"), 1),
#         profile.get("goal_years", 10),
#         surplus
#     ]

#     allocation = predict_allocation(features)

#     return {
#         "investable_amount": surplus,
#         "allocation_percent": allocation,
#         "allocation_amount": {
#             k: round(v * surplus / 100, 2)
#             for k, v in allocation.items()
#         }
#     }