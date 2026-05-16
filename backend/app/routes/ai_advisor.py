from fastapi import APIRouter, Depends
from app.database import db
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/plan")
def ai_plan(user=Depends(get_current_user)):

    uid = user["user_id"]

    profile = db.profiles.find_one({"user_id": uid}) or {}

    tx = list(
        db.transactions.find({
            "user_id": uid
        })
    )

    liabilities = list(
        db.liabilities.find({"user_id": uid}))

    assets = list(db.assets.find({"user_id": uid}))

    income = sum(
        i["amount"]
        for i in tx
        if i["type"]=="income"
    )

    expense = sum(
        i["amount"]
        for i in tx
        if i["type"]=="expense"
    )

    total_liability = sum(
        i.get("remaining_amount",0)
        for i in liabilities
        if i.get("status")=="active"
    )

    total_assets = sum(
        i.get("amount",0)
        for i in assets
    )

    liquid_assets = sum(
        i.get("amount",0)
        for i in assets
        if i.get(
            "type",""
        ).lower()
        in ["cash","bank","fd"]
    )

    monthly_surplus=max(
        0,
        income-expense
    )

    emergency_target=expense*6

    emergency_ready=(
        liquid_assets
        >= emergency_target
    )

    risk=profile.get(
        "risk_level",
        "medium"
    ).lower()

    goal_years=profile.get(
        "goal_years",
        10
    )

    recommendations=[]

    if monthly_surplus<=0:

        recommendations.append({

            "type":"Cash Flow Warning",

            "amount":0,

            "where":"Budget Optimization",

            "reason":
            "Expenses exceed income"

        })

    total_emi=sum(
        i.get("emi_amount",0)
        for i in liabilities
        if i.get("status")=="active"
    )

    debt_ratio=0

    if income>0:

        debt_ratio=(
            total_emi/income
        )*100


    if not emergency_ready:

        reserve=min(
            monthly_surplus*0.4,
            emergency_target-liquid_assets
        )

        recommendations.append({

            "type":"Emergency Fund",

            "amount":round(
                reserve,
                2
            ),

            "where":
            "Savings/Liquid Fund",

            "reason":
            "Build safety reserve"

        })

        monthly_surplus-=reserve


    if debt_ratio>40:

        paydown=monthly_surplus*0.4

        recommendations.append({

            "type":
            "Debt Reduction",

            "amount":
            round(paydown,2),

            "where":
            "Loan Prepayment",

            "reason":
            "EMI burden high"

        })

        monthly_surplus-=paydown

    if total_liability > 300000:

        recommendations.append({

            "type":"Loan Priority",

            "amount": total_emi,

            "where":"Loan Repayment",

            "reason":"Clear debt before aggressive investing"

    })
    if monthly_surplus>1000:

        if risk=="low":

            recommendations.extend([

                {
                    "type":"FD",
                    "amount":
                    round(
                    monthly_surplus*0.5,
                    2
                    ),
                    "where":
                    "FD/RD",
                    "reason":
                    "Capital safety"
                },

                {
                    "type":"Debt Fund",
                    "amount":
                    round(
                    monthly_surplus*0.3,
                    2
                    ),
                    "where":
                    "Debt Fund",
                    "reason":
                    "Stable returns"
                }

            ])

        elif risk=="high":

            recommendations.extend([

                {
                    "type":"Equity SIP",
                    "amount":
                    round(
                    monthly_surplus*0.5,
                    2
                    ),
                    "where":
                    "Mutual Fund",

                    "reason":
                    "Long-term growth"
                },

                {
                    "type":"Stocks",
                    "amount":
                    round(
                    monthly_surplus*0.2,
                    2
                    ),
                    "where":
                    "Large Cap",

                    "reason":
                    "Growth potential"
                }

            ])

        else:

            recommendations.extend([

        {
            "type":"SIP",
            "amount": round(monthly_surplus * 0.35,2),
            "where":"Index Mutual Fund",
            "reason":"Balanced long-term growth"
        },

        {
            "type":"FD",
            "amount": round(monthly_surplus * 0.20,2),
            "where":"FD / RD",
            "reason":"Capital protection"
        },

        {
            "type":"Debt Fund",
            "amount": round(monthly_surplus * 0.15,2),
            "where":"Debt Mutual Fund",
            "reason":"Stable returns with lower risk"
        },

        {
            "type":"Gold",
            "amount": round(monthly_surplus * 0.10,2),
            "where":"Gold ETF / SGB",
            "reason":"Diversification and inflation hedge"
        },

        {
            "type":"Property Goal",
            "amount": round(monthly_surplus * 0.20,2),
            "where":"REIT / Future down-payment fund",
            "reason":"Long-term asset creation"
        }
    ])


    if len(recommendations)==0:

        recommendations.append({

            "type":
            "Starter Plan",

            "amount":
            round(
            monthly_surplus*0.4,
            2
            ),

            "where":
            "Index Mutual Fund",

            "reason":
            "Begin investing"

        })

    safe_to_spend=(
        income
        -expense
        -total_emi
    )

    return{

        "monthly_income":income,

        "monthly_expense":expense,

        "monthly_surplus":income-expense,

        "total_assets":total_assets,

        "total_liabilities":
        total_liability,

        "emergency_fund_ready":
        emergency_ready,

        "risk_level":risk,

        "goal_years":goal_years,

        "total_emi":total_emi,

        "safe_to_spend":
        safe_to_spend,

        "recommendations":
        recommendations
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