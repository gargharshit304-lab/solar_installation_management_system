-- ============================================================================
-- SolarOS: Enterprise Solar Installation Management System
-- Database Schema for Supabase PostgreSQL
-- Company: SunPower Solutions
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ROLES & PROFILES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (id, name, description, permissions) VALUES
('owner_admin', 'Owner / Administrator', 'Full system access across all departments, financials, and configurations', '["all"]'::jsonb),
('sales_exec', 'Sales Executive', 'Access to customers, enquiries, surveys, quotations, and orders', '["customers.read", "customers.write", "enquiries.all", "surveys.read", "quotations.all", "orders.read"]'::jsonb),
('survey_tech', 'Survey Technician', 'Access to assigned site surveys, roof measurement data, site photography', '["surveys.assigned", "surveys.submit"]'::jsonb),
('warehouse_mgr', 'Warehouse Manager', 'Access to inventory, products, serial numbers, dispatches, purchase orders', '["inventory.all", "dispatch.all", "products.all"]'::jsonb),
('install_tech', 'Installation Technician', 'Access to assigned installations, checklist verification, photos, signatures', '["installations.assigned", "installations.update"]'::jsonb),
('support_exec', 'Support Executive', 'Access to customer warranty lookups, service tickets, complaint management', '["warranty.read", "service.all"]'::jsonb),
('accountant', 'Accountant', 'Access to invoices, customer payments, expense entries, project profitability', '["finance.all", "invoices.all", "reports.finance"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON UPDATE CASCADE,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. EMPLOYEES & WORKFORCE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    employee_code VARCHAR(30) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    department VARCHAR(50) NOT NULL, -- 'Engineering', 'Operations', 'Sales', 'Support', 'Finance', 'Warehouse'
    designation VARCHAR(100) NOT NULL,
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id),
    hourly_rate NUMERIC(10, 2) DEFAULT 0.00,
    skills TEXT[] DEFAULT '{}',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    current_assigned_jobs INTEGER NOT NULL DEFAULT 0,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. CUSTOMERS & CRM
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    monthly_electricity_bill NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    interested_capacity_kw NUMERIC(6, 2) NOT NULL DEFAULT 3.00,
    preferred_system_type VARCHAR(30) NOT NULL DEFAULT 'on_grid', -- 'on_grid', 'off_grid', 'hybrid'
    roof_space_sqft NUMERIC(10, 2),
    roof_type VARCHAR(50), -- 'flat_concrete', 'slanted_tile', 'tin_shed', 'terrace'
    enquiry_source VARCHAR(50) NOT NULL DEFAULT 'website', -- 'website', 'whatsapp', 'phone_call', 'referral', 'manual'
    assigned_sales_rep_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    lead_status VARCHAR(50) NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'survey_scheduled', 'survey_completed', 'quotation_sent', 'negotiation', 'converted', 'lost'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    source VARCHAR(50) NOT NULL, -- 'website_form', 'whatsapp', 'phone', 'field_lead'
    initial_notes TEXT,
    energy_consumption_units NUMERIC(10, 2),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enquiry_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
    author_id UUID REFERENCES employees(id),
    activity_type VARCHAR(50) NOT NULL, -- 'call', 'whatsapp_message', 'email', 'meeting', 'site_visit', 'status_change'
    summary VARCHAR(255) NOT NULL,
    details TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. SITE SURVEYS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS site_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMPTZ NOT NULL,
    completed_date TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'assigned', 'in_progress', 'submitted', 'approved', 'rejected'
    
    -- Survey Measurements
    roof_length_m NUMERIC(8, 2),
    roof_width_m NUMERIC(8, 2),
    total_roof_area_sqm NUMERIC(10, 2),
    shadow_free_area_sqm NUMERIC(10, 2),
    roof_direction VARCHAR(30), -- 'South', 'South-East', 'South-West', 'North', 'East', 'West'
    roof_tilt_degrees NUMERIC(5, 2),
    cable_distance_meters NUMERIC(6, 2),
    
    -- Electrical Details
    electricity_sanctioned_load_kw NUMERIC(6, 2),
    meter_number VARCHAR(50),
    phase_type VARCHAR(20) DEFAULT 'single_phase', -- 'single_phase', 'three_phase'
    transformer_distance_m NUMERIC(6, 2),
    
    -- Technician Evaluation
    technician_observations TEXT,
    recommended_capacity_kw NUMERIC(6, 2),
    structural_suitability VARCHAR(50) DEFAULT 'suitable', -- 'suitable', 'needs_reinforcement', 'unsuitable'
    rejection_reason TEXT,
    
    assigned_technician_id UUID REFERENCES employees(id),
    approved_by_id UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES site_surveys(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS survey_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES site_surveys(id) ON DELETE CASCADE,
    photo_type VARCHAR(50) NOT NULL, -- 'roof_panoramic', 'shadow_obstruction', 'meter_box', 'db_box', 'earthing_pit'
    photo_url TEXT NOT NULL,
    caption TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. SOLAR PACKAGES & COMPONENTS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS solar_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    package_type VARCHAR(30) NOT NULL, -- 'on_grid', 'off_grid', 'panel_set'
    capacity_kw NUMERIC(6, 2) NOT NULL,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Solar Panels', 'Inverters', 'Batteries', 'Charge Controllers', 'Connectors', 'Wires', 'Wiring Boxes', 'Metal Stands', 'Safety Equipment'
    specifications JSONB DEFAULT '{}'::jsonb,
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'pcs',
    unit_cost NUMERIC(10, 2) NOT NULL,
    selling_price NUMERIC(10, 2) NOT NULL,
    minimum_stock_threshold INTEGER NOT NULL DEFAULT 10,
    has_serial_tracking BOOLEAN NOT NULL DEFAULT FALSE,
    warranty_months INTEGER NOT NULL DEFAULT 24,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS package_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES solar_packages(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity_required NUMERIC(8, 2) NOT NULL DEFAULT 1,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE
);

-- ----------------------------------------------------------------------------
-- 6. INVENTORY, SERIAL NUMBERS & DISPATCH
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(255),
    address TEXT,
    lead_time_days INTEGER DEFAULT 7,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    primary_supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    location_bin VARCHAR(50) DEFAULT 'MAIN-WH-A1',
    last_restocked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    movement_type VARCHAR(30) NOT NULL, -- 'purchase_receipt', 'dispatch_allocation', 'installation_usage', 'return', 'adjustment'
    quantity INTEGER NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50), -- 'order', 'dispatch', 'purchase_order', 'manual_audit'
    performed_by_id UUID REFERENCES employees(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_serial_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    supplier_id UUID REFERENCES suppliers(id),
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    current_status VARCHAR(30) NOT NULL DEFAULT 'in_warehouse', -- 'in_warehouse', 'reserved', 'dispatched', 'installed', 'defective', 'returned'
    assigned_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    related_order_id UUID,
    delivery_date DATE,
    warranty_start_date DATE,
    warranty_end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. QUOTATIONS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    survey_id UUID REFERENCES site_surveys(id) ON DELETE SET NULL,
    package_id UUID REFERENCES solar_packages(id),
    system_capacity_kw NUMERIC(6, 2) NOT NULL,
    package_type VARCHAR(30) NOT NULL DEFAULT 'on_grid',
    hardware_subtotal NUMERIC(12, 2) NOT NULL,
    installation_charges NUMERIC(10, 2) NOT NULL DEFAULT 15000.00,
    subsidy_amount NUMERIC(10, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 13.80, -- blended GST on solar
    tax_amount NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_terms TEXT NOT NULL DEFAULT '30% Advance on Confirmation, 60% upon Material Dispatch, 10% on Commissioning',
    status VARCHAR(30) NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'approved', 'rejected', 'expired'
    valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
    prepared_by_id UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity NUMERIC(8, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    notes TEXT
);

-- ----------------------------------------------------------------------------
-- 8. ORDERS & PAYMENTS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    quotation_id UUID REFERENCES quotations(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    total_order_value NUMERIC(12, 2) NOT NULL,
    advance_amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    outstanding_balance NUMERIC(12, 2) NOT NULL,
    order_status VARCHAR(40) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'processing', 'ready_for_dispatch', 'dispatched', 'installation_scheduled', 'completed', 'cancelled'
    payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'partially_paid', 'paid'
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity NUMERIC(8, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number VARCHAR(30) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'bank_transfer', 'cheque', 'upi', 'cash', 'card'
    transaction_reference VARCHAR(100),
    payment_stage VARCHAR(50) NOT NULL, -- 'advance', 'dispatch_milestone', 'commissioning_final'
    receipt_url TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_by_id UUID REFERENCES employees(id)
);

-- ----------------------------------------------------------------------------
-- 9. DISPATCHES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatch_number VARCHAR(30) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id),
    dispatched_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivery_personnel_name VARCHAR(150),
    vehicle_number VARCHAR(50),
    delivery_status VARCHAR(30) NOT NULL DEFAULT 'in_transit', -- 'pending', 'in_transit', 'delivered', 'failed'
    delivery_confirmed_at TIMESTAMPTZ,
    proof_of_delivery_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dispatch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatch_id UUID NOT NULL REFERENCES dispatches(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    serial_number_id UUID REFERENCES product_serial_numbers(id)
);

-- ----------------------------------------------------------------------------
-- 10. INSTALLATIONS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_code VARCHAR(30) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id),
    system_capacity_kw NUMERIC(6, 2) NOT NULL,
    scheduled_start_date DATE NOT NULL,
    scheduled_end_date DATE NOT NULL,
    actual_start_time TIMESTAMPTZ,
    actual_finish_time TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'assigned', 'in_progress', 'completed', 'delayed', 'cancelled'
    lead_technician_id UUID REFERENCES employees(id),
    customer_signature_url TEXT,
    customer_sign_name VARCHAR(150),
    signed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS installation_technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    is_lead BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS installation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
    structure_mounting_done BOOLEAN DEFAULT FALSE,
    panels_mounted_count INTEGER DEFAULT 0,
    earthing_resistance_tested NUMERIC(5, 2),
    lightning_arrester_installed BOOLEAN DEFAULT FALSE,
    inverter_mounted_and_wired BOOLEAN DEFAULT FALSE,
    dc_wiring_proper BOOLEAN DEFAULT FALSE,
    ac_db_box_connected BOOLEAN DEFAULT FALSE,
    bi_directional_meter_sync BOOLEAN DEFAULT FALSE,
    tested_generation_voltage NUMERIC(6, 2),
    tested_generation_current NUMERIC(6, 2),
    technician_remarks TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS installation_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
    photo_type VARCHAR(50) NOT NULL, -- 'array_layout', 'earthing_pit', 'inverter_wiring', 'commissioning_meter'
    photo_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. WARRANTIES & SERVICE TICKETS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS warranty_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    product_id UUID NOT NULL REFERENCES products(id),
    serial_number VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    warranty_duration_years INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'expired', 'claimed', 'void'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    equipment_serial_number VARCHAR(100),
    product_id UUID REFERENCES products(id),
    fault_description TEXT NOT NULL,
    fault_code VARCHAR(50), -- e.g., 'ERR-INV-04', 'FAULT-EARTH-01'
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    assigned_technician_id UUID REFERENCES employees(id),
    status VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open', 'assigned', 'in_progress', 'waiting_for_parts', 'resolved', 'closed'
    is_under_warranty BOOLEAN NOT NULL DEFAULT TRUE,
    estimated_repair_cost NUMERIC(10, 2) DEFAULT 0.00,
    estimated_labour_cost NUMERIC(10, 2) DEFAULT 0.00,
    resolution_notes TEXT,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS service_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
    author_id UUID REFERENCES employees(id),
    message TEXT NOT NULL,
    status_changed_to VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. FINANCE, INVOICES & EXPENSES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id),
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'partially_paid', 'paid', 'cancelled'
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_number VARCHAR(30) UNIQUE NOT NULL,
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL, -- 'equipment_purchase', 'technician_labour', 'freight_transport', 'permits_and_grid_approval', 'tools_and_safety', 'operational'
    amount NUMERIC(12, 2) NOT NULL,
    vendor_name VARCHAR(150),
    receipt_url TEXT,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recorded_by_id UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. NOTIFICATIONS & AUDIT LOGS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_target VARCHAR(50), -- send to whole role e.g. 'warehouse_mgr'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'success', 'critical'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR ENTERPRISE PERFORMANCE
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_lead_status ON customers(lead_status);
CREATE INDEX IF NOT EXISTS idx_customers_sales_rep ON customers(assigned_sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_surveys_customer ON site_surveys(customer_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON site_surveys(status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_serials_serial_num ON product_serial_numbers(serial_number);
CREATE INDEX IF NOT EXISTS idx_serials_status ON product_serial_numbers(current_status);
CREATE INDEX IF NOT EXISTS idx_installations_status ON installations(status);
CREATE INDEX IF NOT EXISTS idx_service_status ON service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_warranty_serial ON warranty_records(serial_number);
CREATE INDEX IF NOT EXISTS idx_expenses_order ON expenses(related_order_id);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_serial_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Admins and Owners can manage everything
CREATE POLICY "Admins have full access" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.auth_user_id = auth.uid() AND p.role_id = 'owner_admin')
);

CREATE POLICY "Authenticated users can read customers" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Sales and Admins can mutate customers" ON customers FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.auth_user_id = auth.uid() AND p.role_id IN ('owner_admin', 'sales_exec'))
);

CREATE POLICY "Technicians can view assigned installations" ON installations FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p JOIN employees e ON e.profile_id = p.id WHERE p.auth_user_id = auth.uid() AND (p.role_id = 'owner_admin' OR installations.lead_technician_id = e.id))
);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
