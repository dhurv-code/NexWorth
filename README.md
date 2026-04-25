# Neworth

AI-powered personal finance and investment guidance platform that helps users understand money flow, track expenses, liabilities, goals, and discover investable surplus with personalized allocation insights.

## Overview

Neworth is built as an MVP startup product, not just a demo project. It combines Full Stack development with AI/ML to help users make smarter financial decisions.

Users can:

* Register and securely log in
* Track income and expenses
* Manage liabilities / loans / EMI
* Create savings goals
* View summaries and analytics
* Get AI-based investment allocation suggestions
* Monitor personal net worth

---

## Core Features

### Authentication

* User registration
* Secure login with JWT
* Protected routes
* User-specific private data

### Transactions

* Add income
* Add expenses
* Edit transactions
* Delete transactions
* View all records

### Goals

* Add financial goals
* Update progress
* Delete goals

### Liabilities

* Track loans / EMI / debt
* Update liabilities
* Remove completed liabilities

### Dashboard & Analytics

* Income vs Expense summary
* Category spending insights
* Monthly flow tracking
* Net worth estimation

### AI Investment Advisor

Uses ML model to estimate investable surplus and suggest allocation such as:

* Equity
* Debt
* Gold
* Cash Reserve

---

## Tech Stack

### Frontend

* React JS
* Vite
* Tailwind CSS
* Axios
* Recharts

### Backend

* FastAPI
* Python
* JWT Authentication
* REST APIs

### Database

* MongoDB Atlas

### AI / ML

* Scikit-learn
* Pickle model deployment

---

## Project Structure

```text
neworth/
│── frontend/
│── backend/
│   └── app/
│       ├── routes/
│       ├── ml/
│       ├── utils/
│       ├── database.py
│       └── main.py
```

---

## Installation

### Backend

```bash
cd backend
python -m venv venv
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create `.env` in backend:

```env
MONGO_URI=your_mongodb_connection
DB_NAME=neworth
SECRET_KEY=your_secret_key
```

---

## AI Workflow

1. User enters profile and financial data
2. Backend calculates current surplus
3. ML model predicts allocation percentages
4. Frontend displays recommendation dashboard

---

## Vision

Neworth aims to become a personal wealth operating system for young professionals, students, and families who want clarity on how to grow money intelligently.

---

## Future Roadmap

* Bank SMS auto parsing
* UPI sync
* SIP calculator
* Tax planning
* Goal probability forecasting
* Credit score insights
* Mobile app release

---

## Status

MVP version completed and deployable.

---

## Author

Built by Dhurv Gupta
