import joblib
import os

model_path = os.path.join(os.path.dirname(__file__), "investment_model.pkl")
model = joblib.load(model_path)

def predict_allocation(features):
    result = model.predict([features])[0]

    return {
        "equity": round(result[0], 2),
        "debt": round(result[1], 2),
        "gold": round(result[2], 2),
        "cash": round(result[3], 2)
    }