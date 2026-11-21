from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class UserRole(str, Enum):
    OWNER_ADMIN = "owner_admin"
    SALES_EXEC = "sales_exec"
    SURVEY_TECH = "survey_tech"
    ENGINEERING_LEAD = "engineering_lead"
    WAREHOUSE_MGR = "warehouse_mgr"
    INSTALL_TECH = "install_tech"
    SUPPORT_EXEC = "support_exec"
    ACCOUNTANT = "accountant"

class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    SURVEY_SCHEDULED = "survey_scheduled"
    SURVEY_COMPLETED = "survey_completed"
    QUOTATION_SENT = "quotation_sent"
    NEGOTIATION = "negotiation"
    CONVERTED = "converted"
    LOST = "lost"

class SurveyStatus(str, Enum):
    UNASSIGNED = "unassigned"
    SCHEDULED = "scheduled"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    CORRECTIONS_REQUIRED = "corrections_required"
    APPROVED = "approved"
    REJECTED = "rejected"
    RESCHEDULED = "rescheduled"
    CANCELLED = "cancelled"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    READY_FOR_DISPATCH = "ready_for_dispatch"
    DISPATCHED = "dispatched"
    INSTALLATION_SCHEDULED = "installation_scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class CustomerBase(BaseModel):
    full_name: str
    phone: str
    email: Optional[EmailStr] = None
    address: str
    city: str
    state: str
    monthly_electricity_bill: float = 0.0
    interested_capacity_kw: float = 3.0
    preferred_system_type: str = "on_grid"
    roof_space_sqft: Optional[float] = None
    enquiry_source: str = "website"
    assigned_sales_rep_id: Optional[str] = None
    lead_status: LeadStatus = LeadStatus.NEW

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: str
    customer_code: str
    created_at: datetime

    class Config:
        from_attributes = True

class SiteSurveyBase(BaseModel):
    customer_id: str
    scheduled_date: datetime
    roof_length_m: Optional[float] = None
    roof_width_m: Optional[float] = None
    shadow_free_area_sqm: Optional[float] = None
    roof_direction: Optional[str] = "South"
    roof_tilt_degrees: Optional[float] = 15.0
    cable_distance_meters: Optional[float] = 20.0
    technician_observations: Optional[str] = None
    status: SurveyStatus = SurveyStatus.SCHEDULED
    assigned_technician_id: Optional[str] = None

class SiteSurveyResponse(SiteSurveyBase):
    id: str
    survey_number: str
    created_at: datetime

class QuotationItem(BaseModel):
    product_name: str
    quantity: float
    unit_price: float
    total_price: float

class QuotationCreate(BaseModel):
    customer_id: str
    survey_id: Optional[str] = None
    system_capacity_kw: float
    package_type: str = "on_grid"
    hardware_subtotal: float
    installation_charges: float = 15000.0
    discount_amount: float = 0.0
    tax_percent: float = 13.80
    payment_terms: str

class InventoryItemResponse(BaseModel):
    id: str
    sku: str
    name: str
    category: str
    quantity_on_hand: int
    quantity_reserved: int
    unit_cost: float
    selling_price: float
    supplier_name: str
    status: str

class SerialNumberRecord(BaseModel):
    serial_number: str
    product_name: str
    current_status: str
    customer_name: Optional[str] = None
    order_id: Optional[str] = None
    delivery_date: Optional[date] = None
    warranty_start_date: Optional[date] = None
    warranty_end_date: Optional[date] = None

class ProjectProfitability(BaseModel):
    project_code: str
    customer_name: str
    capacity_kw: float
    revenue: float
    equipment_cost: float
    labour_cost: float
    other_expenses: float
    profit: float
    profit_margin_pct: float
    payment_status: str
