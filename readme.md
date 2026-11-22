# SolarOS — Enterprise Solar Installation Management System

> **Commercial-Grade Operations Platform for SunPower Solutions**  
> Operating 40+ monthly commercial & residential rooftop solar installation projects with 60+ certified technicians and engineers across Maharashtra, India.

---

## ☀️ System Overview

**SolarOS** is an enterprise-grade, responsive SaaS web application engineered to digitize the complete operational lifecycle of a modern solar installation enterprise: from customer lead acquisition to engineering site surveys, lead approval quality gates, dynamic BOM quotation generation, warehouse inventory with individual serial number tracking, material dispatches, 8-point electrical safety installations with digital client signatures, warranty enforcement, and project-wise profitability accounting.

The platform is integrated with **Supabase PostgreSQL** via a high-performance **Node.js Express 5 & TypeScript** backend, backed by **Prisma ORM**, cryptographic security, and action-level **Role-Based Access Control (RBAC)**.

---

## 🎨 Design System & Visual Palette

SolarOS strictly implements an enterprise architectural design system:

| Element | Color Token | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Main App Background** | Sand | `#E9E0D2` / `#F4EFE6` | Calming, warm architectural base |
| **Top Navigation Bar** | Charcoal | `#30343B` | High-contrast enterprise shell with crisp white typography |
| **Primary Buttons & Active Tabs** | Navy Blue | `#183153` | Primary interactive elements, active states, focus rings |
| **Card & Container Surfaces** | Pure White | `#FFFFFF` | Layered cards with realistic elevation (`shadow-card`, `shadow-dropdown`) |
| **Headings & Primary Text** | Charcoal | `#30343B` | Maximum legibility and corporate styling |
| **Secondary & Metadata Text** | Muted Grey | `#777777` | Captions, secondary timestamps, helper copy |
| **Borders & Dividers** | Warm Grey | `#D8D0C4` | Subtle separation without visual noise |
| **Success Indicators** | Muted Sage / Emerald | `#6F8F7A` / `#2D7D46` | Approved surveys, active warranties, paid milestones |
| **Warnings & Pending** | Warm Amber | `#C48A42` | Pending reviews, unassigned jobs, low stock hardware |
| **Errors & Overdue** | Muted Terracotta / Crimson | `#B85C52` / `#D32F2F` | Critical alarms, overdue milestones, validation alerts |
| **Border Radii** | Rounded-XL / 2XL | `12px` to `16px` | Modern, clean ergonomic corners |

---

## 👥 8-Role Interactive RBAC (Role-Based Access Control)

SolarOS features fine-grained, action-level RBAC (`canCreate`, `canRead`, `canEdit`, `canDelete`, `canManage`, `canApprove`, `canExecute`) with an instant **Role Switcher** in the navigation header. Click the user avatar in the top right to switch between canonical roles to inspect permission boundaries, data scopes, and workflow rules:

1. **Owner / Managing Director (`owner_admin` — Vikramaditya Rao):**  
   Company-wide visibility across all 15 modules, financial P&L, workforce management, custom role creation, enterprise audit trails, system settings, and AI operations. *(Separation of duty: Cannot execute field technician checklists directly).*
2. **Sales Executive (`sales_exec` — Pooja Kulkarni):**  
   Lead acquisition, customer CRM, quotation builder, and customer milestone orders.
3. **Survey Technician (`survey_tech` — Suresh More):**  
   On-site measurements, shadow-free area calculations, rooftop tilt/azimuth angles, single-line diagrams, and submission to engineering. *(Quality gate: Cannot approve own survey).*
4. **Engineering Lead (`engineering_lead` — Sandeep Patil):**  
   Technical verification of shadow analysis and electrical calculations. Holds exclusive sign-off authority to **Approve**, **Return for Corrections**, or **Reject** survey reports before quotations can be contracted.
5. **Warehouse Manager (`warehouse_mgr` — Ganesh Shinde):**  
   Multi-category inventory catalog, individual hardware serial numbers, barcode/QR scanning, stock counts, and material dispatch allocations.
6. **Installation Technician (`install_tech` — Amit Jadhav):**  
   Field work orders, live time trackers, 8-point electrical safety checklist, photo verification, and digital client touch signature pad.
7. **Customer Support Executive (`support_exec` — Sneha Deshpande):**  
   Customer registry, automated equipment warranty validation, service complaints, and RMA ticket workflows.
8. **Accountant (`accountant` — Ramesh Patil):**  
   Tax invoices, milestone payments, direct project expense booking, and transparent project profitability ledgers.

---

## 🚀 Key Modules & Functional Workflows

### 1. Executive Dashboard & Real-Time Analytics
- **Primary KPI Cards:** Total Customers, New Inquiries, Active Installation Projects, Pending Quotations, Gross Revenue, and Outstanding Receivables.
- **Cashflow Analytics:** Visualized via **Recharts** (Monthly turnover vs. hardware BOM costs and net profit).
- **Project Progress Matrix:** Status tracking of scheduled, in-progress, commissioned, and delayed jobs.
- **Stock & Lead Feed:** Low-stock threshold warnings and incoming customer consultation requests.

### 2. Scalable Workforce Directory & Employee Filtering
- **Independent Department Filter:** Dynamically lists all company departments with real-time employee counts directly populated from Supabase PostgreSQL.
- **Compact Search Selector:** Search employees by name, employee code (e.g., `EMP-042`), or corporate email without massive dropdowns.
- **Duty Status Filters:** Filter instantly by Active, On Leave, or Inactive personnel.
- **360° Personnel Drawer:** View certifications, skills, assigned jobs, hourly billing rates, attendance, and emergency contacts.

### 3. Employee Registration & Owner Credential Handover
- **Onboarding Modal:** Validates full legal name, sequential employee code, corporate email, phone, department, role, and skills.
- **Collision-Free Code Generator:** Automatically computes next sequential employee code (`EMP-062`, `EMP-063`, etc.) avoiding duplicate conflicts with database records.
- **Guaranteed Cryptographic Password Auto-Generation:** Generates high-entropy passwords hashed with `bcryptjs` and stored in Supabase PostgreSQL (`profiles.password_hash`).
- **Owner Credential Handover Popup:**
  - Status indicator: **"Status: Employee Created"** with an active emerald indicator.
  - Personnel summary (Name, Code, Department, Role).
  - Login email with one-click copy button.
  - Temporary password with reveal/hide toggle (`Eye` / `EyeOff`) and one-click copy button.
  - **"Copy Full Credentials Handover Message"** button for sharing via WhatsApp, Slack, or email.
  - Security note explaining that passwords are cryptographically hashed and displayed only once.

### 4. Site Survey & Engineering Approval Quality Gate
- **Field Measurements:** Terrace dimensions, azimuth, tilt angle, shadow-free area, and cable run distance.
- **Quality Gate:** Quotations can only be finalized once an Engineering Lead has officially **Approved** the survey report.
- **Workflow States:** `Draft` ➔ `Submitted (Pending Review)` ➔ `Approved` / `Corrections Required` / `Rejected`.

### 5. Quotation Engine & Component BOM
- **Standard Solar Packages:** On-Grid (1 kW – 5 kW) and Off-Grid (1 kW – 5 kW with LiFePO4 batteries).
- **Dynamic Pricing Engine:** Calculates hardware subtotal, structure mounting, installation charges, commercial discounts, and blended GST (13.8%).
- **PDF Export Preview:** Printable tax quotation ready for customer presentation.

### 6. Warehouse & Serial Number Inventory
- **9 Product Categories:** Solar PV Modules, Inverters, Batteries, Charge Controllers, Connectors, Wires & Cables, ACDB/DCDB Boxes, Mounting Structures, Safety Equipment.
- **Individual Serial Registry:** Inverters and batteries tracked by unique hardware serial numbers (`INV-SN-xxx`, `BAT-SN-xxx`).
- **Simulated Barcode/QR Scanner:** Instant hardware lookup via camera/simulated scanner.
- **Enterprise Product Management & Price Editing (Part F):**
  - Full modification of product name, description, SKU, category, brand, model, unit of measurement, bin locations, and engineering specifications.
  - Three-tier price management: Purchase Price (`unitCost`), Selling Price (`sellingPrice`), and Standard Cost (`standardCost`).
  - Real-time gross margin % and markup calculations.
  - Mandatory business justification for price revisions.
  - Append-only `product_price_history` audit trail capturing previous and new prices, reasons, and user timestamps.
  - **Historical Snapshot Preservation:** Changes to master product prices never alter previously closed or pending quotations, orders, or tax invoices.

### 7. Scalable Workforce Directory & Career Progression (Part F)
- **Independent Department Filter:** Dynamically lists all company departments with real-time employee counts directly populated from Supabase PostgreSQL.
- **Compact Search Selector:** Search employees by name, employee code (e.g., `EMP-042`), or corporate email without massive dropdowns.
- **Duty Status Filters:** Filter instantly by Active, On Leave, or Inactive personnel.
- **360° Personnel Drawer:** View certifications, skills, assigned jobs, hourly billing rates, attendance, and emergency contacts.
- **Employee Career Management:**
  - **Full Edit Modal:** Update personal info, phone, email, address, work location, and emergency contacts.
  - **Promotion Workflow:** Modal featuring side-by-side Current vs Proposed comparison, designation, security role, hourly rate increment, manager assignment, and effective date. Automatically synchronizes role and RBAC permissions in PostgreSQL.
  - **Department Transfer Workflow:** Change department and dynamically assign validated sub-teams (`DEPARTMENT_TEAMS` mapping). Preserves all historical survey, installation, dispatch, and inspection records.
  - **Career History Timeline:** Chronological progression milestones (Initial Onboarding, Promotions, Transfers) displayed in employee 360° drawer.

### 7. Material Dispatch & Automated Warranty Commencing
- Dispatch order generation with fleet vehicle and driver assignment.
- **Automated Warranty Commencing Rule:** As soon as site delivery is confirmed, equipment warranties (Inverter: 2 years, Battery: 2 years, Solar Panels: 20 years) are automatically calculated and activated in the database.

### 8. Installation Operations & Digital Handover
- Assigned field engineers and real-time job duration timers.
- **8-Point Electrical Safety & Quality Checklist:**
  1. Structure Fastened & Wind-Load Verified
  2. Solar Panels Clamped with Mid/End Clamps
  3. Chemical Earthing Pit Resistance < 5 Ohms Tested
  4. Early Streamer Lightning Arrester Grounded
  5. Inverter Mounted with Proper Ventilation
  6. DC Polarity & Open-Circuit Voltage ($V_{oc}$) Verified
  7. ACDB / DCDB Enclosures with SPD Connected
  8. Bi-directional Net Meter Grid Synchronized with DISCOM
- **HTML5 Canvas Digital Signature Pad:** Digital customer sign-off on job completion.

### 9. Finance & Project Profitability Transparency
- Transparent profitability formula:
  $$\text{Net Profit} = \text{Contracted Revenue} - \text{Hardware Equipment BOM} - \text{Technician Labour} - \text{Direct Site Expenses}$$
- Drill-down transparency: Detailed ledger tracking milestone receipts, material costs, technician hours based on hourly rates, and approved direct expenses.

### 10. AI Business Intelligence Assistant
- Natural language query engine with quick action prompts:
  - *"Which products are running low?"*
  - *"Show delayed installations this week"*
  - *"Show November revenue and project margins"*
  - *"Summarize all open complaints"*
- Interactive microphone placeholder with audio simulation and internal agent tool execution badges.

---

## 🗄️ Database Architecture & Supabase Seeding

The application connects to **Supabase PostgreSQL** via transaction pooler on port `6543`. The relational schema covers 30+ tables:

- `profiles` & `roles` (Authentication, bcrypt password hashes, and RBAC titles)
- `employees` (Codes, departments, hourly rates, skills text array, availability)
- `customers` & `customer_sites` (190+ seeded Maharashtra residential & commercial clients)
- `site_surveys`, `survey_assignments`, `survey_photos`
- `solar_packages` & `package_components`
- `products`, `suppliers`, `inventory_stock`, `product_serial_numbers`
- `quotations`, `quotation_items`, `orders`, `order_items`, `payments`
- `dispatches`, `installations`, `installation_reports`
- `warranty_records`, `service_tickets`, `invoices`, `direct_expenses`
- `audit_logs` & `notifications`

### Demo Seeding Status
The database is populated with **250+ realistic relational records**:
- **61 Employees** across all 8 departments and roles.
- **190 Customers** with realistic solar sizing, electrical bills, and site locations.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6.
- **Backend Server:** Node.js, Express 5, TypeScript (`tsx`), Prisma ORM, PostgreSQL connection pool (`pg`), JWT (`jsonwebtoken`), `bcryptjs`, cookie-parser, CORS.
- **Database:** Supabase PostgreSQL (hosted on AWS `ap-northeast-1`).
- **Legacy Reference:** Python FastAPI backend prototype located in `backend/` for OpenAPI and Pydantic schemas.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ and **npm** v9+
- Active internet connection to connect to Supabase PostgreSQL pooler.

### 2. Environment Configuration
Verify that `.env` in the root directory contains your Supabase connection parameters and server configuration:
```env
DATABASE_URL=postgresql://postgres.xxx:xxx@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
PORT=5000
JWT_ACCESS_SECRET=solaros_access_secret_sunpower_solutions_2026
JWT_REFRESH_SECRET=solaros_refresh_secret_sunpower_solutions_2026
```

### 3. Installation
```bash
# Install frontend & server dependencies
npm install
```

### 4. Running the Platform

In two separate terminal sessions:

```bash
# Terminal 1: Start Express 5 Backend Server (Port 5000)
npm run server

# Terminal 2: Start Vite Frontend Client (Port 3000)
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

### 5. Production Build
```bash
# Typecheck and build frontend bundle
npm run build

# Preview production build
npm run preview
```

### 6. Running Integration Verification Tests
```bash
# Run Part F Product Editing & Career Progression Suite (32 tests)
npx tsx server/tests/verify_part_f_product_and_career.ts

# Run Simplified 4-Permission RBAC & Global Pagination Suite (28 tests)
npx tsx server/tests/verify_four_perms_and_pagination.ts

# Run Enterprise Multi-Session RBAC & Database Consistency Suite (12 tests)
npx tsx server/tests/verify_rbac_sync.ts

# Run Employee Registration & Supabase Relational Audit Suite (17 tests)
npx tsx server/tests/verify_employee_registration.ts

# Run Demo Seeding & Count Verification Suite
npx tsx server/tests/verify_demo_seeding.ts
```

---

## 🔐 Default Demo Accounts

All demo accounts share the standard password: **`solaros2026`**

| Role | Name | Email | Default Dashboard |
| :--- | :--- | :--- | :--- |
| **Owner / Managing Director** | Vikramaditya Rao | `vikram.rao@sunpowersolutions.in` | `/` (Executive Dashboard) |
| **Sales Executive** | Pooja Kulkarni | `pooja.k@sunpowersolutions.in` | `/sales-overview` |
| **Survey Technician** | Suresh More | `suresh.m@sunpowersolutions.in` | `/field` |
| **Engineering Lead** | Sandeep Patil | `sandeep.p@sunpowersolutions.in` | `/engineering` |
| **Warehouse Manager** | Ganesh Shinde | `ganesh.s@sunpowersolutions.in` | `/inventory` |
| **Installation Technician** | Amit Jadhav | `amit.j@sunpowersolutions.in` | `/installations` |
| **Customer Support** | Sneha Deshpande | `sneha.d@sunpowersolutions.in` | `/service` |
| **Accountant** | Ramesh Patil | `ramesh.p@sunpowersolutions.in` | `/finance` |

---

## 🛡️ License & Commercial Rights

Engineered for **SunPower Solutions**. All rights reserved. Commercial SaaS deployment authorized for solar EPC operations in Maharashtra, India.
