from pydantic import BaseModel
from typing import Optional

class LiabilityModel(BaseModel):
    name:str
    type:str
    principal_amount: float
    interest_rate: float
    tenure_months: int
    emi_amount: float
    paid_amount: float = 0
    remaining_amount: float
    next_due_date: str