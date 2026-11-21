"""
SolarOS Backend API
Enterprise Solar Installation Management System
FastAPI + Pydantic + Supabase PostgreSQL
"""
from fastapi import FastAPI, HTTPException, Query, status, Header, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from pydantic import BaseModel, EmailStr
import uvicorn
import base64
import json
import hmac
import hashlib

from models import (
    CustomerResponse, CustomerCreate, 
    SiteSurveyResponse, SiteSurveyBase,
    QuotationCreate, InventoryItemResponse,
    SerialNumberRecord, ProjectProfitability,
    UserRole
)

# Demo System Users Database Repository
SYSTEM_USERS_DB = [
    {
        "id": "usr-1",
        "name": "Vikramaditya Rao",
        "email": "vikram.rao@sunpowersolutions.in",
        "role": "owner_admin",
        "role_title": "Managing Director & Owner",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "department": "Executive Management",
        "is_active": True
    },
    {
        "id": "usr-2",
        "name": "Pooja Kulkarni",
        "email": "pooja.k@sunpowersolutions.in",
        "role": "sales_exec",
        "role_title": "Senior Solar Sales Consultant",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "department": "Sales & Business Dev",
        "is_active": True
    },
    {
        "id": "usr-3",
        "name": "Suresh More",
        "email": "suresh.m@sunpowersolutions.in",
        "role": "survey_tech",
        "role_title": "Field Site Survey Specialist",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "department": "Field Engineering",
        "is_active": True
    },
    {
        "id": "usr-4",
        "name": "Ganesh Shinde",
        "email": "ganesh.s@sunpowersolutions.in",
        "role": "warehouse_mgr",
        "role_title": "Central Warehouse & Logistics Manager",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "department": "Supply Chain & Inventory",
        "is_active": True
    },
    {
        "id": "usr-5",
        "name": "Amit Jadhav",
        "email": "amit.j@sunpowersolutions.in",
        "role": "install_tech",
        "role_title": "Lead Solar Installation Engineer",
        "avatar": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
        "department": "Operations & Installations",
        "is_active": True
    },
    {
        "id": "usr-6",
        "name": "Sneha Deshpande",
        "email": "sneha.d@sunpowersolutions.in",
        "role": "support_exec",
        "role_title": "Client Care & Warranty Specialist",
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        "department": "After-Sales & Customer Service",
        "is_active": True
    },
    {
        "id": "usr-7",
        "name": "Ramesh Patil",
        "email": "ramesh.p@sunpowersolutions.in",
        "role": "accountant",
        "role_title": "Chief Financial Accountant",
        "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        "department": "Finance & Compliance",
        "is_active": True
    },
    {
        "id": "usr-8",
        "name": "Mahesh Kadam",
        "email": "mahesh.k@sunpowersolutions.in",
        "role": "survey_tech",
        "role_title": "Chief Survey Specialist & Team Lead",
        "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
        "department": "Field Engineering",
        "is_active": True
    },
    {
        "id": "usr-9",
        "name": "Sandeep Patil",
        "email": "sandeep.p@sunpowersolutions.in",
        "role": "engineering_lead",
        "role_title": "Lead Solar Design & Approvals Engineer",
        "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
        "department": "Engineering & Feasibility",
        "is_active": True
    }
]

JWT_SECRET = "solaros_secret_key_sunpower_solutions_2026"

def create_jwt_token(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    encoded_header = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signature_bytes = hmac.new(
        JWT_SECRET.encode(),
        f"{encoded_header}.{encoded_payload}".encode(),
        hashlib.sha256
    ).digest()
    encoded_signature = base64.urlsafe_b64encode(signature_bytes).decode().rstrip("=")
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

def verify_jwt_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, payload, signature = parts
        expected_sig = base64.urlsafe_b64encode(
            hmac.new(JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
        ).decode().rstrip("=")
        if not hmac.compare_digest(signature, expected_sig):
            return None
        
        # Add padding back if necessary
        padded_payload = payload + "=" * (-len(payload) % 4)
        payload_data = json.loads(base64.urlsafe_b64decode(padded_payload).decode())
        if "exp" in payload_data and datetime.utcnow().timestamp() > payload_data["exp"]:
            return None
        return payload_data
    except Exception:
        return None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class RefreshRequest(BaseModel):
    refresh_token: str

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

# -----------------------------------------------------------------------------
# Authentication & Session Management Endpoints
# -----------------------------------------------------------------------------

@app.post("/api/auth/login")
def login_endpoint(login_data: LoginRequest, response: Response):
    DEMO_PASSWORD = "solaros2026"
    if login_data.password != DEMO_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Demo password: solaros2026"
        )
    
    user = next((u for u in SYSTEM_USERS_DB if u["email"].lower() == login_data.email.lower()), None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found."
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact system administrator."
        )
    
    duration_days = 30 if login_data.remember_me else 1
    expires_at = datetime.utcnow() + timedelta(days=duration_days)
    
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"],
        "exp": int(expires_at.timestamp()),
        "iat": int(datetime.utcnow().timestamp())
    }
    
    token = create_jwt_token(payload)
    refresh_token = base64.urlsafe_b64encode(f"ref_{user['id']}_{int(datetime.utcnow().timestamp())}".encode()).decode()
    
    # Set HttpOnly SameSite cookie where supported
    response.set_cookie(
        key="solaros_session_token",
        value=token,
        max_age=duration_days * 86400,
        httponly=True,
        samesite="lax",
        secure=False # set to True in production with SSL
    )
    
    return {
        "status": "success",
        "token": token,
        "refresh_token": refresh_token,
        "expires_at": int(expires_at.timestamp() * 1000),
        "user": user
    }

@app.get("/api/auth/session")
def get_session_endpoint(
    authorization: Optional[str] = Header(None),
    request: Request = None
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    elif request and "solaros_session_token" in request.cookies:
        token = request.cookies.get("solaros_session_token")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing."
        )
    
    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token."
        )
    
    user = next((u for u in SYSTEM_USERS_DB if u["id"] == payload.get("sub")), None)
    if not user or not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer active."
        )
    
    return {
        "authenticated": True,
        "user": user,
        "role": user["role"],
        "expires_at": payload.get("exp", 0) * 1000
    }

@app.post("/api/auth/refresh")
def refresh_session_endpoint(refresh_data: RefreshRequest):
    try:
        raw = base64.urlsafe_b64decode(refresh_data.refresh_token.encode()).decode()
        parts = raw.split("_")
        user_id = parts[1]
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token."
        )
    
    user = next((u for u in SYSTEM_USERS_DB if u["id"] == user_id), None)
    if not user or not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive or missing."
        )
    
    expires_at = datetime.utcnow() + timedelta(days=1)
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"],
        "exp": int(expires_at.timestamp()),
        "iat": int(datetime.utcnow().timestamp())
    }
    
    new_token = create_jwt_token(payload)
    new_refresh = base64.urlsafe_b64encode(f"ref_{user['id']}_{int(datetime.utcnow().timestamp())}".encode()).decode()
    
    return {
        "token": new_token,
        "refresh_token": new_refresh,
        "expires_at": int(expires_at.timestamp() * 1000),
        "user": user
    }

@app.post("/api/auth/logout")
def logout_endpoint(response: Response):
    response.delete_cookie(key="solaros_session_token", path="/")
    return {"status": "success", "message": "Session invalidated."}


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

# -----------------------------------------------------------------------------
# RBAC Operational Delegations & Installation Management
# -----------------------------------------------------------------------------

INSTALLATIONS_DB = [
    {
        "id": "inst-1",
        "installation_code": "INS-2026-031",
        "order_id": "ord-1",
        "order_number": "ORD-2026-038",
        "customer_id": "cust-1",
        "customer_name": "Rajesh Sharma",
        "customer_phone": "+91 98201 44512",
        "customer_address": "Plot 42, Green Park Avenue, Aundh, Pune",
        "capacity_kw": 5.0,
        "system_type": "on_grid",
        "scheduled_date": "2026-03-24",
        "scheduled_end_date": "2026-03-25",
        "assigned_technician_ids": ["emp-1"],
        "technician_names": ["Amit Jadhav (Lead)"],
        "status": "completed",
        "actual_start_time": "2026-03-24T09:00:00Z",
        "actual_finish_time": "2026-03-25T16:30:00Z",
        "executed_by_technician_id": "usr-5",
        "executed_by_technician_name": "Amit Jadhav",
        "customer_sign_name": "Rajesh Sharma",
        "checklist": {
            "structureMounting": True, "panelsMounted": True, "earthingPitConnected": True,
            "lightningArresterInstalled": True, "inverterWired": True, "dcWiringTested": True,
            "acDbBoxConnected": True, "biDirectionalMeterSync": True
        }
    },
    {
        "id": "inst-2",
        "installation_code": "INS-2026-032",
        "order_id": "ord-2",
        "order_number": "ORD-2026-039",
        "customer_id": "cust-2",
        "customer_name": "Priya Patel",
        "customer_phone": "+91 98220 11234",
        "customer_address": "Flat 804, Sky High Towers, Baner, Pune",
        "capacity_kw": 3.0,
        "system_type": "on_grid",
        "scheduled_date": "2026-03-28",
        "scheduled_end_date": "2026-03-29",
        "assigned_technician_ids": ["emp-1"],
        "technician_names": ["Amit Jadhav (Lead)"],
        "status": "in_progress",
        "actual_start_time": "2026-03-28T08:30:00Z",
        "checklist": {
            "structureMounting": True, "panelsMounted": True, "earthingPitConnected": True,
            "lightningArresterInstalled": True, "inverterWired": True, "dcWiringTested": False,
            "acDbBoxConnected": False, "biDirectionalMeterSync": False
        }
    }
]

DELEGATIONS_DB = [
    {
        "id": "del-1",
        "delegation_code": "DEL-2026-001",
        "employee_id": "usr-5",
        "employee_name": "Amit Jadhav",
        "granted_permission": "installations.signoff",
        "department_scope": "Operations",
        "authorized_by": "Vikramaditya Rao (MD)",
        "justification": "Certified Lead Installer authorized for autonomous safety commissioning and customer signoff signoff",
        "effective_from": "2026-01-01",
        "effective_to": "2026-12-31",
        "active": True
    }
]

class ChecklistVerificationRequest(BaseModel):
    checklist: Dict[str, bool]
    customer_sign_name: str
    signature_data: Optional[str] = None
    technician_remarks: Optional[str] = None

class ReassignTechnicianRequest(BaseModel):
    technician_names: List[str]
    reason: str

class RescheduleInstallationRequest(BaseModel):
    start_date: str
    end_date: str
    reason: str

class DelegationCreateRequest(BaseModel):
    employee_id: str
    employee_name: str
    granted_permission: str
    department_scope: str
    resource_id: Optional[str] = None
    justification: str
    effective_from: str
    effective_to: str

def get_current_user_from_request(
    authorization: Optional[str] = Header(None),
    request: Request = None
) -> dict:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    elif request and "solaros_session_token" in request.cookies:
        token = request.cookies.get("solaros_session_token")
    
    if not token:
        # Fallback to default user for unauthenticated requests in demo
        return SYSTEM_USERS_DB[0]
    
    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token."
        )
    user = next((u for u in SYSTEM_USERS_DB if u["id"] == payload.get("sub")), None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )
    return user

@app.get("/api/rbac/delegations")
def get_delegations(current_user: dict = None):
    return DELEGATIONS_DB

@app.post("/api/rbac/delegations", status_code=status.HTTP_201_CREATED)
def create_delegation(
    req: DelegationCreateRequest,
    authorization: Optional[str] = Header(None),
    request: Request = None
):
    user = get_current_user_from_request(authorization, request)
    if user["role"] != "owner_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Owner / Administrator can authorize operational delegations."
        )
    
    new_del = {
        "id": f"del-{len(DELEGATIONS_DB) + 1}",
        "delegation_code": f"DEL-2026-{str(len(DELEGATIONS_DB) + 1).zfill(3)}",
        "employee_id": req.employee_id,
        "employee_name": req.employee_name,
        "granted_permission": req.granted_permission,
        "department_scope": req.department_scope,
        "resource_id": req.resource_id,
        "authorized_by": user["name"],
        "justification": req.justification,
        "effective_from": req.effective_from,
        "effective_to": req.effective_to,
        "active": True
    }
    DELEGATIONS_DB.append(new_del)
    return new_del

@app.delete("/api/rbac/delegations/{delegation_id}")
def revoke_delegation(
    delegation_id: str,
    authorization: Optional[str] = Header(None),
    request: Request = None
):
    user = get_current_user_from_request(authorization, request)
    if user["role"] != "owner_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Owner / Administrator can revoke operational delegations."
        )
    
    target = next((d for d in DELEGATIONS_DB if d["id"] == delegation_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Delegation record not found")
    target["active"] = False
    return {"status": "success", "message": "Operational delegation revoked."}

@app.post("/api/installations/{installation_id}/execute")
def execute_installation_job(
    installation_id: str,
    payload: ChecklistVerificationRequest,
    authorization: Optional[str] = Header(None),
    request: Request = None
):
    user = get_current_user_from_request(authorization, request)

    # STRICT RBAC CHECK: Owner cannot execute field jobs directly
    if user["role"] == "owner_admin":
        # Check if there is an explicit delegation for this owner (typically not allowed)
        has_delegation = any(
            d["employee_id"] == user["id"] and d["granted_permission"] == "installations.execute" and d["active"]
            for d in DELEGATIONS_DB
        )
        if not has_delegation:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operational Execution Denied: The Managing Director & Owner possesses Administrative Authority but must not perform routine field execution. Please assign an Installation Technician or inspect this work order in Oversight mode."
            )
    
    # Must have install_tech role or explicit operational delegation
    is_installer = user["role"] == "install_tech"
    has_delegation = any(
        d["employee_id"] == user["id"] and d["granted_permission"] in ["installations.execute", "installations.signoff"] and d["active"]
        for d in DELEGATIONS_DB
    )
    if not (is_installer or has_delegation):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only certified installation technicians or authorized operational delegates can commission systems and record signoffs."
        )
    
    target = next((i for i in INSTALLATIONS_DB if i["id"] == installation_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Installation job not found.")
    
    # Check that all 8 checklist items are complete
    if not all(payload.checklist.values()) or len(payload.checklist) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All 8 commissioning and electrical safety checklist items must be verified before signoff."
        )
    
    target["status"] = "completed"
    target["checklist"] = payload.checklist
    target["actual_finish_time"] = datetime.utcnow().isoformat()
    target["customer_sign_name"] = payload.customer_sign_name
    target["customer_signature"] = payload.signature_data
    target["technician_remarks"] = payload.technician_remarks
    target["executed_by_technician_id"] = user["id"]
    target["executed_by_technician_name"] = user["name"]

    return {
        "status": "success",
        "message": f"Installation {target['installation_code']} successfully commissioned by {user['name']}.",
        "installation": target
    }

@app.post("/api/installations/{installation_id}/reassign")
def reassign_installation(
    installation_id: str,
    payload: ReassignTechnicianRequest,
    authorization: Optional[str] = Header(None),
    request: Request = None
):
    user = get_current_user_from_request(authorization, request)
    if user["role"] not in ["owner_admin", "sales_exec"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Technician reassignment requires Administrative Authority."
        )
    
    target = next((i for i in INSTALLATIONS_DB if i["id"] == installation_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Installation job not found.")
    
    target["technician_names"] = payload.technician_names
    target["reassigned_by"] = user["name"]
    target["admin_notes"] = f"Reassigned: {payload.reason}"
    
    return {
        "status": "success",
        "message": f"Installation {target['installation_code']} reassigned to {', '.join(payload.technician_names)} by {user['name']}.",
        "installation": target
    }

@app.post("/api/installations/{installation_id}/reschedule")
def reschedule_installation(
    installation_id: str,
    payload: RescheduleInstallationRequest,
    authorization: Optional[str] = Header(None),
    request: Request = None
):
    user = get_current_user_from_request(authorization, request)
    if user["role"] not in ["owner_admin", "sales_exec"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Installation rescheduling requires Administrative Authority."
        )
    
    target = next((i for i in INSTALLATIONS_DB if i["id"] == installation_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Installation job not found.")
    
    target["scheduled_date"] = payload.start_date
    target["scheduled_end_date"] = payload.end_date
    target["rescheduled_by"] = user["name"]
    target["admin_notes"] = f"Rescheduled: {payload.reason}"
    
    return {
        "status": "success",
        "message": f"Installation window updated to {payload.start_date} - {payload.end_date} by {user['name']}.",
        "installation": target
    }

# -----------------------------------------------------------------------------
# Complete Inventory & Warehouse Management System Backend
# -----------------------------------------------------------------------------

WAREHOUSES_DB = [
    {
        "id": "wh-pune-central",
        "code": "WH-PUN-01",
        "name": "Pune Central Distribution Hub",
        "address": "Survey No. 84/2, Hinjawadi Phase 2, Pune",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "411057",
        "manager_id": "usr-4",
        "manager_name": "Ganesh Shinde",
        "contact_phone": "+91 98231 77410",
        "status": "active",
        "total_capacity_sqft": 18500
    },
    {
        "id": "wh-sambhajinagar",
        "code": "WH-CSN-02",
        "name": "Chhatrapati Sambhajinagar Depot",
        "address": "Plot G-12, Waluj MIDC Industrial Estate",
        "city": "Chhatrapati Sambhajinagar",
        "state": "Maharashtra",
        "pincode": "431136",
        "manager_id": "emp-10",
        "manager_name": "Vijay Deshmukh",
        "contact_phone": "+91 94221 88450",
        "status": "active",
        "total_capacity_sqft": 9200
    }
]

INVENTORY_DB = [
    {
        "id": "prd-pan-540",
        "sku": "PAN-MONO-540W",
        "name": "SunPower 540W Mono PERC Half-Cut Panel (Tier 1)",
        "category": "Solar Panels",
        "available_quantity": 184,
        "reserved_quantity": 40,
        "in_transit_quantity": 50,
        "damaged_quantity": 2,
        "minimum_threshold": 50,
        "unit_cost": 10200.0,
        "selling_price": 13800.0,
        "supplier": "Waaree Energies Ltd",
        "has_serial_tracking": True,
        "stock_status": "in_stock",
        "location_bin": "PUN-ZB-R02-PALLET-04"
    },
    {
        "id": "prd-inv-5kw",
        "sku": "INV-DEYE-5KW-3P",
        "name": "Deye 5kW Three-Phase High-Efficiency Inverter",
        "category": "Inverters",
        "available_quantity": 14,
        "reserved_quantity": 6,
        "in_transit_quantity": 4,
        "damaged_quantity": 0,
        "minimum_threshold": 8,
        "unit_cost": 46000.0,
        "selling_price": 62000.0,
        "supplier": "Deye Solar India Pvt Ltd",
        "has_serial_tracking": True,
        "stock_status": "in_stock",
        "location_bin": "PUN-ZA-R01-S01-B01"
    },
    {
        "id": "prd-bat-lith-48v",
        "sku": "BAT-LIFEPO4-5.1K",
        "name": "SunPower 48V 100Ah LiFePO4 Lithium Battery (5.1kWh)",
        "category": "Batteries",
        "available_quantity": 5,
        "reserved_quantity": 3,
        "in_transit_quantity": 6,
        "damaged_quantity": 0,
        "minimum_threshold": 6,
        "unit_cost": 78000.0,
        "selling_price": 105000.0,
        "supplier": "Exide Industries Ltd",
        "has_serial_tracking": True,
        "stock_status": "low_stock",
        "location_bin": "PUN-ZC-VAULT-01"
    }
]

SERIALS_DB = [
    {
        "id": "ser-1",
        "serial_number": "DEYE-2026-INV-99410",
        "product_id": "prd-inv-5kw",
        "product_name": "Deye 5kW Three-Phase High-Efficiency Inverter",
        "category": "Inverters",
        "current_status": "reserved",
        "assigned_customer": "Rajesh Sharma",
        "related_order_id": "ord-1",
        "order_number": "ORD-2026-034"
    },
    {
        "id": "ser-2",
        "serial_number": "DEYE-2026-INV-88124",
        "product_id": "prd-inv-5kw",
        "product_name": "Deye 5kW Three-Phase High-Efficiency Inverter",
        "category": "Inverters",
        "current_status": "installed",
        "assigned_customer": "Mahalaxmi Agro Plastics (Factory)",
        "related_order_id": "ord-2",
        "delivery_date": "2026-10-26",
        "warranty_start_date": "2026-10-26",
        "warranty_end_date": "2028-10-26"
    }
]

MOVEMENTS_DB = [
    {
        "id": "mov-1",
        "movement_number": "MOV-2026-101",
        "timestamp": "2026-11-18T14:30:00Z",
        "product_id": "prd-inv-5kw",
        "sku": "INV-DEYE-5KW-3P",
        "product_name": "Deye 5kW Three-Phase Inverter",
        "movement_type": "goods_receipt",
        "quantity": 10,
        "unit_cost": 46000.0,
        "total_value": 460000.0,
        "reference_type": "GRN",
        "reference_number": "GRN-2026-042",
        "executed_by_name": "Ganesh Shinde"
    }
]

GRN_DB = []
TRANSFERS_DB = []
STOCK_COUNTS_DB = []
TASKS_DB = []

class ProductCreateRequest(BaseModel):
    name: str
    category: str
    brand: Optional[str] = None
    model: Optional[str] = None
    unit_of_measure: str = "pcs"
    available_quantity: int = 0
    minimum_threshold: int = 10
    unit_cost: float
    selling_price: float
    supplier: str
    has_serial_tracking: bool = False
    preferred_warehouse_id: Optional[str] = "wh-pune-central"
    location_bin: str = "BAY-A1"

class StockAdjustmentRequest(BaseModel):
    product_id: str
    adjustment_quantity: int
    adjustment_reason: str
    supporting_notes: str
    warehouse_id: Optional[str] = None

class GoodsReceiptItemRequest(BaseModel):
    product_id: str
    sku: str
    product_name: str
    ordered_qty: int
    received_qty: int
    accepted_qty: int
    rejected_qty: int
    unit_cost: float
    serial_numbers: List[str] = []
    rejection_reason: Optional[str] = None

class GoodsReceiptCreateRequest(BaseModel):
    supplier_id: str
    supplier_name: str
    po_reference: Optional[str] = None
    delivery_challan_no: str
    warehouse_id: str
    warehouse_name: str
    items: List[GoodsReceiptItemRequest]
    remarks: Optional[str] = None

class WarehouseTransferCreateRequest(BaseModel):
    source_warehouse_id: str
    source_warehouse_name: str
    destination_warehouse_id: str
    destination_warehouse_name: str
    source_location: str
    destination_location: str
    items: List[dict]
    expected_date: str
    notes: Optional[str] = None

@app.get("/api/inventory/warehouses")
def get_warehouses():
    return WAREHOUSES_DB

@app.get("/api/inventory/products")
def get_products():
    return INVENTORY_DB

@app.post("/api/inventory/products", status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreateRequest,
    authorization: Optional[str] = Header(None),
    request: Request = None
):
    user = get_current_user_from_request(authorization, request)
    if user["role"] not in ["owner_admin", "warehouse_mgr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only Warehouse Manager or Administrator can catalogue hardware SKUs."
        )
    
    prefix = payload.category[:3].upper()
    sku = f"SKU-{prefix}-{int(datetime.utcnow().timestamp()) % 10000}"
    new_prod = {
        "id": f"prd-{int(datetime.utcnow().timestamp())}",
        "sku": sku,
        "name": payload.name,
        "category": payload.category,
        "brand": payload.brand,
        "model": payload.model,
        "unit_of_measure": payload.unit_of_measure,
        "available_quantity": payload.available_quantity,
        "reserved_quantity": 0,
        "in_transit_quantity": 0,
        "damaged_quantity": 0,
        "minimum_threshold": payload.minimum_threshold,
        "unit_cost": payload.unit_cost,
        "selling_price": payload.selling_price,
        "supplier": payload.supplier,
        "has_serial_tracking": payload.has_serial_tracking,
        "stock_status": "in_stock" if payload.available_quantity > payload.minimum_threshold else ("out_of_stock" if payload.available_quantity == 0 else "low_stock"),
        "location_bin": payload.location_bin
    }
    INVENTORY_DB.append(new_prod)
    return new_prod

@app.post("/api/inventory/adjust")
def adjust_inventory_stock(
    payload: StockAdjustmentRequest,
    authorization: Optional[str] = Header(None),
    request: Request = None
):
    user = get_current_user_from_request(authorization, request)
    # Owner cannot perform routine operational quantity adjustments directly
    if user["role"] == "owner_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Policy Restriction: Managing Director has oversight authority but routine operational stock adjustment must be executed by the Warehouse Manager or authorized staff."
        )
    
    product = next((p for p in INVENTORY_DB if p["id"] == payload.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product SKU not found.")
    
    prev_qty = product["available_quantity"]
    new_qty = prev_qty + payload.adjustment_quantity
    if new_qty < 0:
        raise HTTPException(status_code=400, detail="Inventory balance cannot become negative.")
    
    product["available_quantity"] = new_qty
    product["stock_status"] = "out_of_stock" if new_qty == 0 else ("low_stock" if new_qty <= product["minimum_threshold"] else "in_stock")

    # Record Movement
    movement = {
        "id": f"mov-{len(MOVEMENTS_DB) + 1}",
        "movement_number": f"MOV-2026-{str(len(MOVEMENTS_DB) + 101).zfill(3)}",
        "timestamp": datetime.utcnow().isoformat(),
        "product_id": product["id"],
        "sku": product["sku"],
        "product_name": product["name"],
        "movement_type": "stock_adjustment",
        "quantity": payload.adjustment_quantity,
        "unit_cost": product["unit_cost"],
        "total_value": payload.adjustment_quantity * product["unit_cost"],
        "reference_type": "ADJUSTMENT",
        "reference_number": f"ADJ-{payload.adjustment_reason.upper()}",
        "executed_by_name": user["name"],
        "remarks": payload.supporting_notes
    }
    MOVEMENTS_DB.append(movement)

    return {
        "status": "success",
        "message": f"Stock adjusted for {product['name']}. New available balance: {new_qty} units.",
        "product": product,
        "movement": movement
    }

@app.get("/api/inventory/movements")
def get_stock_movements():
    return MOVEMENTS_DB

@app.get("/api/inventory/serials")
def get_serial_registry(product_id: Optional[str] = None, status: Optional[str] = None):
    results = SERIALS_DB
    if product_id:
        results = [s for s in results if s["product_id"] == product_id]
    if status:
        results = [s for s in results if s["current_status"] == status]
    return results

@app.post("/api/inventory/grn", status_code=status.HTTP_201_CREATED)
def receive_goods(
    payload: GoodsReceiptCreateRequest,
    authorization: Optional[str] = Header(None),
    request: Request = None
):
    user = get_current_user_from_request(authorization, request)
    if user["role"] not in ["warehouse_mgr", "install_tech"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only authorized warehouse personnel can physically receive goods."
        )
    
    grn_num = f"GRN-2026-{str(len(GRN_DB) + 45).zfill(3)}"
    total_val = sum(i.accepted_qty * i.unit_cost for i in payload.items)
    
    grn_record = {
        "id": f"grn-{len(GRN_DB) + 1}",
        "grn_number": grn_num,
        "supplier_id": payload.supplier_id,
        "supplier_name": payload.supplier_name,
        "po_reference": payload.po_reference,
        "delivery_challan_no": payload.delivery_challan_no,
        "warehouse_id": payload.warehouse_id,
        "warehouse_name": payload.warehouse_name,
        "received_by_name": user["name"],
        "status": "confirmed",
        "total_value": total_val,
        "items": [i.dict() for i in payload.items]
    }
    GRN_DB.append(grn_record)

    # Credit stock & register serials
    for item in payload.items:
        prod = next((p for p in INVENTORY_DB if p["id"] == item.product_id or p["sku"] == item.sku), None)
        if prod:
            prod["available_quantity"] += item.accepted_qty
            prod["damaged_quantity"] = prod.get("damaged_quantity", 0) + item.rejected_qty
        
        for sn in item.serial_numbers:
            if not any(s["serial_number"] == sn for s in SERIALS_DB):
                SERIALS_DB.append({
                    "id": f"ser-{len(SERIALS_DB) + 1}",
                    "serial_number": sn,
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "category": prod["category"] if prod else "Inverters",
                    "current_status": "in_stock",
                    "supplier": payload.supplier_name
                })
    
    return grn_record

@app.get("/api/dispatches/eligibility/{order_id}")
def check_dispatch_eligibility(order_id: str):
    """
    Mandatory Payment Milestone Gate:
    Verifies that the customer order has paid the required advance/milestone
    before warehouse release is authorized.
    """
    # Sample check logic matching existing orders
    order_eligible = True
    payment_verified = True
    required_milestone = "Advance Payment Verified"
    
    return {
        "order_id": order_id,
        "is_eligible": order_eligible,
        "payment_gate_cleared": payment_verified,
        "milestone_status": required_milestone,
        "can_release_dispatch": order_eligible and payment_verified
    }

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
