# Developed by DHURUV KUMAR GUPTA
from fastapi import FastAPI
from app.routes.transactions import router
from app.routes.auth import router as auth_router
from app.routes.goals import router as goals_router
from app.routes.liabilities import router as liability_router
from app.routes.profile import router as profile_router
from app.routes.ai_advisor import router as ai_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.assets import router as assets_router
from dotenv import load_dotenv
from app.routes.loan_payments import router as loan_payments_router
from app.routes import password_reset
import os


load_dotenv()

app=FastAPI()

origins = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [i.strip() for i in origins.split(",") if i.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,prefix="/auth",tags=["Auth"])
app.include_router(router,prefix="/transaction",tags=["Transactions"])
app.include_router(goals_router,prefix="/goals",tags=["Goals"])
app.include_router(liability_router,prefix="/liabilities",tags=["liabilities"])
app.include_router(profile_router, prefix="/profile", tags=["Profile"])
app.include_router(ai_router, prefix="/ai",tags=["AI advisor"])
app.include_router(assets_router,prefix="/assets",tags=["Assets"])
app.include_router(loan_payments_router,prefix="/loan-payments",tags=["loan payments"])
app.include_router(password_reset.router,prefix="/auth",tags=["Password Reset"])


@app.get("/")
def home():
    return {
        "message":"backend is running"
    }