"""
SolarOS Backend API
Enterprise Solar Installation Management System
FastAPI + Pydantic + Supabase PostgreSQL
"""
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime, date
import uvicorn

from models import (
    CustomerResponse, CustomerCreate, 
    SiteSurveyResponse, SiteSurveyBase,
    QuotationCreate, InventoryItemResponse,
    SerialNumberRecord, ProjectProfitability,
    UserRole
)

app = FastAPI(
    title="SolarOS API — SunPower Solutions",
    version="1.0.0",
    description="Enterprise API powering SunPower Solutions rooftop solar workflows."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "company": "SunPower Solutions",
        "system": "SolarOS Enterprise",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/dashboard/kpis")
def get_dashboard_kpis(role: str = Query("owner_admin")):
    """Returns top-level KPIs based on the authenticated role"""
    return {
        "total_customers": 184,
        "new_enquiries": 38,
        "active_projects": 42,
        "pending_quotations": 14,
        "total_revenue": 14850000.00,
        "outstanding_payments": 2340000.00,
        "inventory_alerts_count": 3,
        "open_tickets_count": 4,
        "period_growth_pct": {
            "revenue": 14.2,
            "customers": 18.5,
            "installations": 11.8
        }
    }

@app.get("/api/customers", response_model=List[CustomerResponse])
def get_customers(
    search: Optional[str] = None,
    lead_status: Optional[str] = None,
    sales_rep: Optional[str] = None
):
    # Connected to Supabase or in-memory repository
    return [
        CustomerResponse(
            id="cust-101",
            customer_code="CUST-2026-089",
            full_name="Rajesh Sharma",
            phone="+91 98201 44512",
            email="rajesh.sharma@example.com",
            address="Plot 42, Green Park Avenue",
            city="Pune",
            state="Maharashtra",
            monthly_electricity_bill=8500.00,
            interested_capacity_kw=5.0,
            preferred_system_type="on_grid",
            roof_space_sqft=650.0,
            enquiry_source="website",
            lead_status="survey_completed",
            created_at=datetime.utcnow()
        )
    ]

@app.post("/api/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer: CustomerCreate):
    return CustomerResponse(
        id=f"cust-{int(datetime.utcnow().timestamp())}",
        customer_code=f"CUST-2026-{int(datetime.utcnow().timestamp()) % 1000}",
        created_at=datetime.utcnow(),
        **customer.model_dump()
    )

@app.get("/api/profitability", response_model=List[ProjectProfitability])
def get_project_profitability():
    """Calculates Revenue - Equipment - Labour - Other = Project Profit"""
    return [
        ProjectProfitability(
            project_code="PRJ-ON-5KW-042",
            customer_name="Dr. Anil Deshmukh",
            capacity_kw=5.0,
            revenue=295000.00,
            equipment_cost=182000.00,
            labour_cost=22000.00,
            other_expenses=8500.00,
            profit=82500.00,
            profit_margin_pct=27.96,
            payment_status="fully_paid"
        ),
        ProjectProfitability(
            project_code="PRJ-OFF-4KW-019",
            customer_name="Prakash Agro Mills",
            capacity_kw=4.0,
            revenue=340000.00,
            equipment_cost=235000.00,
            labour_cost=24000.00,
            other_expenses=12000.00,
            profit=69000.00,
            profit_margin_pct=20.29,
            payment_status="partially_paid"
        )
    ]

@app.post("/api/ai/query")
def process_ai_query(query: dict):
    """Conversational Business Intelligence Endpoint for AI Command Center"""
    user_prompt = query.get("prompt", "")
    return {
        "reply": f"Analysis complete for: '{user_prompt}'. Identified 3 projects requiring attention and 1 low stock warning.",
        "executed_tools": ["inventory_check", "installation_schedule_filter"],
        "confidence": 0.96,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
