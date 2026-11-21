# SolarOS — Enterprise Solar Installation Management System

> **Designed for SunPower Solutions**  
> Operating 40 monthly rooftop solar installation projects with 15 certified technicians across Maharashtra.

---

## ☀️ System Overview

**SolarOS** is a commercial-grade, responsive enterprise SaaS web application engineered to digitize the complete operational lifecycle of a modern solar installation enterprise: from customer inquiry to site surveys, engineering approvals, dynamic BOM quotations, warehouse inventory with individual serial tracking, material dispatch, 8-point electrical safety installations with digital customer signatures, warranty management, and project-wise profitability accounting.

---

## 🎨 Design System & Visual Palette

The application strictly implements the specified visual identity:

- **Main Application Background:** Sand — `#E9E0D2`
- **Top Navigation Bar:** Charcoal — `#30343B` (with white typography and icons)
- **Primary Buttons & Active States:** Navy Blue — `#183153`
- **Cards & Content Surfaces:** White — `#FFFFFF` with soft realistic shadows (`shadow-card`, `shadow-dropdown`)
- **Main Text:** Charcoal — `#30343B`
- **Secondary Text:** Muted Grey — `#777777`
- **Borders:** Warm Grey — `#D8D0C4`
- **Muted Sage:** `#6F8F7A` (Success indicators & completed statuses)
- **Warm Amber:** `#C48A42` (Pending items, active warnings)
- **Muted Terracotta:** `#B85C52` (Errors, overdue tasks, critical alerts)
- **Corner Radii:** `12px` to `16px` (`rounded-xl`, `rounded-2xl`)

---

## 👥 7-Role Interactive RBAC (Role-Based Access Control)

SolarOS includes a live **Role Switcher** in the top navigation bar. Click your user profile avatar in the top right to instantly switch between all 7 roles to test permissions, module visibility, and filtered operational workflows:

1. **Owner / Administrator (Vikramaditya Rao):** Full access across all 15 modules, financial P&L, workforce, configurations, and AI operations.
2. **Sales Executive (Pooja Kulkarni):** Customers, inquiries, site surveys, quotations, and order conversions.
3. **Survey Technician (Suresh More):** Allocated site surveys, terrace azimuth, shadow-free area measurements, and engineering submissions.
4. **Warehouse Manager (Ganesh Shinde):** 9-category inventory catalog, serial number tracking, stock adjustments, QR/barcode scanning, and dispatches.
5. **Installation Technician (Amit Jadhav):** Field installation schedules, time trackers, 8-point electrical safety checklist, photo verification, and customer digital signatures.
6. **Support Executive (Sneha Deshpande):** Customer lookup, equipment warranty validation, service complaints, and fault code management.
7. **Accountant (Ramesh Patil):** Invoices, customer payments, direct installation expenses, and project-wise profitability calculations.

---

## 🚀 Key Modules & Functional Workflows

### 1. Executive Dashboard & Overview
- **6 Primary KPI Cards:** Total Customers, New Enquiries, Active Projects, Pending Quotes, Total Revenue, and Outstanding Receivables with period-over-period trend comparisons.
- **Revenue & Cashflow Analytics:** Visualized with **Recharts** (Monthly turnover vs expenses and net profit).
- **Installation Operations:** Status breakdown of scheduled, in-progress, commissioned, and delayed jobs.
- **Recent Inquiries & Inventory Alerts:** Real-time visibility into incoming leads and low-stock hardware warnings.

### 2. Customers & CRM
- Inbound lead tracking across **Website Forms**, **WhatsApp Integration**, **Phone Calls**, and **Manual Consultations**.
- Multi-dimensional filters: Search by name, phone, lead status, location, and assigned sales consultant.
- **Customer 360° Profile Drawer:** Dedicated tabs for Overview, Site Surveys, Quotations, Orders, Equipment Warranties, and Payment Receipts.
- CSV customer export capability.

### 3. Site Survey Management
- Terrace dimensions (length, width, area), shadow-free area analysis, roof direction/azimuth, roof tilt angles, and inverter cable run.
- Electrical service details: Sanctioned load, single-phase vs three-phase, and consumer meter numbers.
- **Quality Gate:** Quotations can only be finalized and contracted after survey measurements are officially **Approved** by the engineering lead.

### 4. Solar Packages & Quotation Engine
- **Standard Package Catalogue:** On-Grid (1 kW – 5 kW) and Off-Grid (1 kW – 5 kW with LiFePO4 batteries).
- **Dynamic Quotation Builder:** Auto component BOM calculation, hardware subtotal, installation charges, commercial discounts, and blended GST (13.8%).
- **Formal PDF Quotation Preview:** Professional printable quotation ready for customer export.
- Auto-conversion of approved quotations into confirmed project orders.

### 5. Orders & Milestone Payments
- Project order tracking (Pending, Confirmed, Processing, Dispatched, Commissioned).
- Milestone payment records (Advance on Booking, Dispatch Milestone, Net-Meter Commissioning).
- Official Tax Invoice generation (`INV-ORD-xxx`) with GST schedules.

### 6. Warehouse & Inventory Management
- **9 Product Categories:** Solar Panels, Inverters, Batteries, Charge Controllers, Connectors, Wires, Wiring Boxes, Metal Stands, Safety Equipment.
- Stock adjustment tool with automatic low-stock and out-of-stock badge triggers.
- **Serial Number Registry:** Unique serial numbers for inverters, batteries, and charge controllers with purchase dates, suppliers, and customer links.
- **QR / Barcode Scanner Modal:** Simulated camera scanning with instant serial number lookup.

### 7. Material Dispatch & Automated Warranty Trigger
- Dispatch order generation and hardware serial allocation.
- Logistics driver and fleet vehicle assignment.
- **Automated Warranty Commencing Rule:** As soon as site delivery is confirmed, equipment warranties (Inverter 2y, Battery 2y, Solar Panels 20y) are automatically calculated and registered into active coverage.

### 8. Installation Operations & Digital Signatures
- Assigned field technicians and work schedules.
- **Technician Job Execution Modal:**
  - Real-time work timer (`Start Work Timer`).
  - **8-Point Electrical Safety & Quality Checklist:**
    1. Structure Fastened & Wind-Load Verified
    2. Solar Panels Clamped with Mid/End Clamps
    3. Chemical Earthing Pit Resistance < 5 Ohms Tested
    4. Early Streamer Lightning Arrester Grounded
    5. Inverter Mounted with Proper Ventilation
    6. DC Polarity & Voltage Open-Circuit (Voc) Tested
    7. ACDB / DCDB Enclosures with SPD Connected
    8. Bi-directional Net Meter Grid Synchronized with DISCOM
  - **HTML5 Canvas Digital Signature Pad:** Allows the client to digitally sign off on the handover.

### 9. Equipment Warranty Management
- Universal search by customer name, phone number, order ID, or serial number.
- Automatic warranty duration tracking: Inverter (2 Years), Battery (2 Years), Solar PV Panels (20 Years).

### 10. Service Complaints & RMA
- Complaint tracking with fault codes (e.g., `ERR-INV-04`, `COMM-WIFI-FAIL`, `ERR-EARTH-01`).
- **Warranty Coverage Adjudication:** If equipment is under active warranty, repairs and labour are flagged as **Warranty Covered (₹0)**; otherwise, estimated parts and labour charges are computed.

### 11. Finance & Project Profitability
- Formula implemented:  
  $$\text{Project Profit} = \text{Revenue} - \text{Equipment Costs} - \text{Labour Costs} - \text{Other Expenses}$$
- Detailed project-wise profitability ledger with margin percentages and payment status.
- Direct installation expense booking modal.

### 12. Workforce Management
- Directory of 15 certified solar technicians and engineers.
- Skill tagging, hourly labour rates, availability indicators, and active job counters.

### 13. AI Operations Command Center
- Conversational business assistant interface with suggested prompt pills:
  - *"Show all installations delayed this week"*
  - *"Which products are running low?"*
  - *"Show this month's revenue"*
  - *"Summarize all open complaints"*
- Interactive microphone placeholder with audio wave simulation.
- Real-time execution badges for internal agent tools (`query_warehouse_inventory`, `calculate_monthly_cashflow`, etc.).
- Architecture prepared for Retell AI and Dify integrations.

### 14. Enterprise Reports & System Settings
- Configurable date filters (Today, This Week, This Month, This Quarter, Custom) with CSV export.
- Configurable company parameters, warranty duration rules, and GST rates.

---

## 🗄️ Relational Database Architecture

The complete PostgreSQL relational schema is available in [database/schema.sql](database/schema.sql). It covers all 30+ core enterprise entities with UUID primary keys, foreign keys, timestamps, indexes, and Row Level Security (RLS) policies:

- `roles` & `profiles`
- `employees`
- `customers`
- `enquiries` & `enquiry_activities`
- `site_surveys`, `survey_assignments`, `survey_photos`
- `solar_packages` & `package_components`
- `products` & `suppliers`
- `inventory_stock` & `stock_movements`
- `product_serial_numbers`
- `quotations` & `quotation_items`
- `orders` & `order_items`
- `payments`
- `dispatches` & `dispatch_items`
- `installations`, `installation_technicians`, `installation_reports`, `installation_photos`
- `warranty_records`
- `service_tickets` & `service_updates`
- `invoices`
- `expenses`
- `notifications` & `audit_logs`

---

## 🛠️ FastAPI Python Backend Architecture

The backend REST API is located in [backend/](backend/):
- [backend/main.py](backend/main.py): FastAPI app with CORS middleware, health checks, customer endpoints, project profitability endpoints, and AI query processor.
- [backend/models.py](backend/models.py): Pydantic v2 schemas for all relational models.
- [backend/requirements.txt](backend/requirements.txt): Dependencies (FastAPI, Uvicorn, Pydantic, Supabase, Python-Multipart).

---

## 🚀 Running the Application

### 1. Frontend Web App
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Or build for production
npm run build
npm run preview
```
Visit `http://localhost:3000` to interact with SolarOS.

### 2. FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
API runs on `http://localhost:8000`. Swagger documentation available at `http://localhost:8000/docs`.

---

## 🛡️ License & Commercial Rights
Developed for **SunPower Solutions**. All rights reserved.
