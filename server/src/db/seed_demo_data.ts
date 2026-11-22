/**
 * SolarOS Enterprise Demo Data Seeder for Supabase PostgreSQL
 * Populates 60 realistic employees, 190 customers, and connected operational data.
 * All records tagged with seed_batch_id = 'SOLAROS_DEMO_2026_01' and is_demo = true.
 */

import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const SEED_BATCH_ID = 'SOLAROS_DEMO_2026_01';

// Deterministic UUID generator (v5-like from namespace + key)
export function deterministicUuid(namespace: string, key: string): string {
  const hash = crypto.createHash('sha256').update(`${namespace}:${key}`).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16), // version 4 compliant
    'a' + hash.substring(17, 20), // variant compliant
    hash.substring(20, 32)
  ].join('-');
}

async function runSeed() {
  console.log('======================================================');
  console.log('SOLAROS ENTERPRISE SUPABASE DEMO DATA SEEDING');
  console.log(`Batch Identifier: ${SEED_BATCH_ID}`);
  console.log('======================================================\n');

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 15000,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('• Database transaction started.');

    // 1. ROLES AUDIT
    const rolesRes = await client.query('SELECT id, name FROM roles');
    console.log(`• Found ${rolesRes.rowCount} canonical roles in DB:`, rolesRes.rows.map(r => r.id).join(', '));

    // 2. PASSWORD HASH FOR DEMO ACCOUNTS
    const demoPasswordHash = await bcrypt.hash('solaros2026', 10);

    // ========================================================================
    // PHASE 2 & 3: 60 REALISTIC EMPLOYEES & PROFILES
    // ========================================================================
    console.log('\n--- Seeding 60 Employees & Profiles ---');

    interface RawEmployeeDef {
      code: string;
      firstName: string;
      lastName: string;
      roleId: string;
      department: string;
      designation: string;
      email: string;
      phone: string;
      hourlyRate: number;
      skills: string[];
      location: string;
      isManager?: boolean;
    }

    const employeeDefs: RawEmployeeDef[] = [
      // 1. Executive Management (1)
      { code: 'EMP-001', firstName: 'Vikramaditya', lastName: 'Rao', roleId: 'owner_admin', department: 'Executive Management', designation: 'Managing Director & Owner', email: 'vikram.rao@sunpowersolutions.in', phone: '+91 98220 10001', hourlyRate: 2500, skills: ['Executive Leadership', 'Solar PPA', 'Financial Strategy'], location: 'Pune (HQ)' },
      
      // 2. Sales & Business Development (10)
      { code: 'EMP-002', firstName: 'Pooja', lastName: 'Kulkarni', roleId: 'sales_exec', department: 'Sales & Business Development', designation: 'Senior Solar Sales Consultant', email: 'pooja.k@sunpowersolutions.in', phone: '+91 98220 10002', hourlyRate: 650, skills: ['Rooftop Feasibility', 'Commercial Sales', 'Client Negotiation'], location: 'Pune' },
      { code: 'EMP-011', firstName: 'Aditya', lastName: 'Joshi', roleId: 'sales_exec', department: 'Sales & Business Development', designation: 'Commercial Solar Sales Executive', email: 'aditya.j@sunpowersolutions.in', phone: '+91 98220 10011', hourlyRate: 500, skills: ['B2B Sales', 'Industrial Projects', 'Financial Proposals'], location: 'Mumbai' },
      { code: 'EMP-012', firstName: 'Rohan', lastName: 'Shinde', roleId: 'sales_exec', department: 'Sales & Business Development', designation: 'Residential Solar Advisor', email: 'rohan.s@sunpowersolutions.in', phone: '+91 98220 10012', hourlyRate: 450, skills: ['Residential Rooftop', 'Subsidy Schemes', 'Lead Conversion'], location: 'Pune' },
      { code: 'EMP-013', firstName: 'Tanvi', lastName: 'Deshmukh', roleId: 'sales_exec', department: 'Sales & Business Development', designation: 'Institutional Sales Specialist', email: 'tanvi.d@sunpowersolutions.in', phone: '+91 98220 10013', hourlyRate: 550, skills: ['Government Tenders', 'Hospitals & Schools', 'Energy Audits'], location: 'Nashik' },
      { code: 'EMP-014', firstName: 'Manish', lastName: 'Kadam', roleId: 'sales_exec', department: 'Sales & Business Development', designation: 'Agricultural Solar Lead', email: 'manish.k@sunpowersolutions.in', phone: '+91 98220 10014', hourlyRate: 480, skills: ['KUSUM Yojana', 'Solar Water Pumps', 'Rural Electrification'], location: 'Kolhapur' },
      { code: 'EMP-015', firstName: 'Priya', lastName: 'Nair', roleId: 'sales_exec', department: 'Sales & Business Development', designation: 'Key Account Manager', email: 'priya.n@sunpowersolutions.in', phone: '+91 98220 10015', hourlyRate: 600, skills: ['Corporate PPAs', 'Developer Accounts', 'High-value Closing'], location: 'Mumbai' },
      { code: 'EMP-016', firstName: 'Sameer', lastName: 'Sawant', roleId: 'sales_exec', department: 'Sales & Business Development', designation: 'Regional Sales Executive', email: 'sameer.s@sunpowersolutions.in', phone: '+91 98220 10016', hourlyRate: 450, skills: ['Direct Sales', 'Site Visits', 'Customer Demonstrations'], location: 'Aurangabad' },
      { code: 'EMP-017', firstName: 'Ananya', lastName: 'Gokhale', roleId: 'sales_exec', department: 'Sales & Business Development', designation: 'Inside Sales & Lead Specialist', email: 'ananya.g@sunpowersolutions.in', phone: '+91 98220 10017', hourlyRate: 420, skills: ['CRM Pipeline', 'Digital Leads', 'Quotation Drafting'], location: 'Pune' },
      { code: 'EMP-018', firstName: 'Rahul', lastName: 'Bhise', roleId: 'sales_exec', department: 'Sales & Business Development', designation: 'Solar Sales Representative', email: 'rahul.b@sunpowersolutions.in', phone: '+91 98220 10018', hourlyRate: 400, skills: ['Field Prospecting', 'Channel Sales', 'Customer Consultation'], location: 'Nagpur' },
      { code: 'EMP-019', firstName: 'Neha', lastName: 'Jagtap', roleId: 'sales_exec', department: 'Sales & Business Development', designation: 'Commercial Solar Consultant', email: 'neha.j@sunpowersolutions.in', phone: '+91 98220 10019', hourlyRate: 520, skills: ['Commercial Feasibility', 'ROI Modelling', 'Proposal Defence'], location: 'Thane' },

      // 3. Field Engineering & Surveys (8)
      { code: 'EMP-003', firstName: 'Suresh', lastName: 'More', roleId: 'survey_tech', department: 'Field Engineering & Surveys', designation: 'Lead Field Survey Specialist', email: 'suresh.m@sunpowersolutions.in', phone: '+91 98220 10003', hourlyRate: 550, skills: ['Drone 3D Mapping', 'Shadow Analysis', 'Electrical Assessment'], location: 'Pune' },
      { code: 'EMP-008', firstName: 'Mahesh', lastName: 'Kadam', roleId: 'survey_tech', department: 'Field Engineering & Surveys', designation: 'Senior Technical Surveyor', email: 'mahesh.k@sunpowersolutions.in', phone: '+91 98220 10008', hourlyRate: 500, skills: ['Roof Structural Analysis', 'Pyranometer Reading', 'Single Line Diagrams'], location: 'Pune' },
      { code: 'EMP-020', firstName: 'Sachin', lastName: 'Thorat', roleId: 'survey_tech', department: 'Field Engineering & Surveys', designation: 'Site Survey Specialist', email: 'sachin.t@sunpowersolutions.in', phone: '+91 98220 10020', hourlyRate: 420, skills: ['Tilt Angle Optimization', 'Obstacle Mapping', 'Solar Pathfinder'], location: 'Nashik' },
      { code: 'EMP-021', firstName: 'Deepak', lastName: 'Pawar', roleId: 'survey_tech', department: 'Field Engineering & Surveys', designation: 'Field Survey Engineer', email: 'deepak.p@sunpowersolutions.in', phone: '+91 98220 10021', hourlyRate: 400, skills: ['LT/HT Cable Routing', 'Distribution Board Survey', 'GPS Surveying'], location: 'Mumbai' },
      { code: 'EMP-022', firstName: 'Nilesh', lastName: 'Mane', roleId: 'survey_tech', department: 'Field Engineering & Surveys', designation: 'Site Assessment Technician', email: 'nilesh.m@sunpowersolutions.in', phone: '+91 98220 10022', hourlyRate: 380, skills: ['Roof Strength Testing', 'Metal Shed Profiling', 'Site Photography'], location: 'Kolhapur' },
      { code: 'EMP-023', firstName: 'Vaibhav', lastName: 'Chavan', roleId: 'survey_tech', department: 'Field Engineering & Surveys', designation: 'Solar Site Inspector', email: 'vaibhav.c@sunpowersolutions.in', phone: '+91 98220 10023', hourlyRate: 380, skills: ['Shadow-Free Area Calc', 'Earthing Pit Survey', 'Grid Point-of-Common-Coupling'], location: 'Aurangabad' },
      { code: 'EMP-024', firstName: 'Omkar', lastName: 'Shirodkar', roleId: 'survey_tech', department: 'Field Engineering & Surveys', designation: 'Technical Site Surveyor', email: 'omkar.s@sunpowersolutions.in', phone: '+91 98220 10024', hourlyRate: 390, skills: ['Drone Photogrammetry', 'Compass & Inclinometer', 'Safety Hazard Audit'], location: 'Nagpur' },
      { code: 'EMP-025', firstName: 'Prathamesh', lastName: 'Salunkhe', roleId: 'survey_tech', department: 'Field Engineering & Surveys', designation: 'Junior Survey Technician', email: 'prathamesh.s@sunpowersolutions.in', phone: '+91 98220 10025', hourlyRate: 350, skills: ['Rooftop Measurements', 'Consumer Meter Audit', 'Field Note Entry'], location: 'Satara' },

      // 4. Engineering & Approvals (5)
      { code: 'EMP-009', firstName: 'Sandeep', lastName: 'Patil', roleId: 'engineering_lead', department: 'Engineering & Approvals', designation: 'Chief Solar Design & Approvals Lead', email: 'sandeep.p@sunpowersolutions.in', phone: '+91 98220 10009', hourlyRate: 900, skills: ['PVsyst Modelling', 'MSEDCL Net Metering Approvals', 'CEA Compliance'], location: 'Pune' },
      { code: 'EMP-026', firstName: 'Dr. Arvind', lastName: 'Kelkar', roleId: 'engineering_lead', department: 'Engineering & Approvals', designation: 'Senior Electrical Design Engineer', email: 'arvind.k@sunpowersolutions.in', phone: '+91 98220 10026', hourlyRate: 850, skills: ['High Voltage Substation Design', 'Protection Schemes', 'Short-Circuit Analysis'], location: 'Pune' },
      { code: 'EMP-027', firstName: 'Shreya', lastName: 'Date', roleId: 'engineering_lead', department: 'Engineering & Approvals', designation: 'Solar PV Systems Engineer', email: 'shreya.d@sunpowersolutions.in', phone: '+91 98220 10027', hourlyRate: 680, skills: ['AutoCAD Layouts', 'String Inverter Sizing', 'Yield Simulations'], location: 'Mumbai' },
      { code: 'EMP-028', firstName: 'Kedar', lastName: 'Deshpande', roleId: 'engineering_lead', department: 'Engineering & Approvals', designation: 'Structural & Mounting Engineer', email: 'kedar.d@sunpowersolutions.in', phone: '+91 98220 10028', hourlyRate: 650, skills: ['STAAD Pro Wind Load Analysis', 'Ballast Structure Design', 'Corrosion Protection'], location: 'Nashik' },
      { code: 'EMP-029', firstName: 'Meera', lastName: 'Bhave', roleId: 'engineering_lead', department: 'Engineering & Approvals', designation: 'Discom Liaison & CEIG Approvals Engineer', email: 'meera.b@sunpowersolutions.in', phone: '+91 98220 10029', hourlyRate: 620, skills: ['CEIG Inspection Prep', 'Discom Sanction Letters', 'Net-Meter Testing'], location: 'Pune' },

      // 5. Operations & Installations (15)
      { code: 'EMP-005', firstName: 'Amit', lastName: 'Jadhav', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Operations Manager & Master Crew Lead', email: 'amit.j@sunpowersolutions.in', phone: '+91 98220 10005', hourlyRate: 650, skills: ['Crew Supervision', 'HT/LT Commissioning', 'OSHA Safety Audits'], location: 'Pune' },
      { code: 'EMP-030', firstName: 'Santosh', lastName: 'Gaikwad', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Senior Installation Crew Lead', email: 'santosh.g@sunpowersolutions.in', phone: '+91 98220 10030', hourlyRate: 500, skills: ['Rooftop Structure Mounting', 'Module Interconnection', 'Torque Verification'], location: 'Pune' },
      { code: 'EMP-031', firstName: 'Pravin', lastName: 'Kamble', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Electrical Commissioning Technician', email: 'pravin.k@sunpowersolutions.in', phone: '+91 98220 10031', hourlyRate: 480, skills: ['Inverter Sync', 'ACDB/DCDB Termination', 'Earth Resistance Testing'], location: 'Mumbai' },
      { code: 'EMP-032', firstName: 'Vijay', lastName: 'Khare', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Solar Installation Technician', email: 'vijay.k@sunpowersolutions.in', phone: '+91 98220 10032', hourlyRate: 420, skills: ['Module Clamping', 'Walkway Installation', 'Cable Trays'], location: 'Pune' },
      { code: 'EMP-033', firstName: 'Ganesh', lastName: 'Bhandari', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Field Electrician & Wireman', email: 'ganesh.b@sunpowersolutions.in', phone: '+91 98220 10033', hourlyRate: 400, skills: ['Solar DC Cabling', 'MC4 Crimping', 'Conduit Routing'], location: 'Nashik' },
      { code: 'EMP-034', firstName: 'Suraj', lastName: 'Bhosale', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Mechanical Mounting Specialist', email: 'suraj.b@sunpowersolutions.in', phone: '+91 98220 10034', hourlyRate: 400, skills: ['Purlin Anchoring', 'Chemical Fastening', 'Roof Flashing'], location: 'Kolhapur' },
      { code: 'EMP-035', firstName: 'Kiran', lastName: 'Mohite', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Installation Technician', email: 'kiran.m@sunpowersolutions.in', phone: '+91 98220 10035', hourlyRate: 380, skills: ['Panel Lifting & Rigging', 'Structure Assembly', 'Site Cleanliness'], location: 'Nagpur' },
      { code: 'EMP-036', firstName: 'Datta', lastName: 'Jadhav', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Solar Electrician', email: 'datta.j@sunpowersolutions.in', phone: '+91 98220 10036', hourlyRate: 390, skills: ['Earthing System Installation', 'Lightning Arrester Setup', 'Continuity Checks'], location: 'Aurangabad' },
      { code: 'EMP-037', firstName: 'Atul', lastName: 'Shinde', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Solar Panel Erector', email: 'atul.s@sunpowersolutions.in', phone: '+91 98220 10037', hourlyRate: 360, skills: ['Module Alignment', 'Hardware Fastening', 'Fall Protection PPE'], location: 'Pune' },
      { code: 'EMP-038', firstName: 'Nitin', lastName: 'Tambe', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Assistant Installation Technician', email: 'nitin.t@sunpowersolutions.in', phone: '+91 98220 10038', hourlyRate: 350, skills: ['Material Staging', 'Cable Pulling', 'Tool Handling'], location: 'Mumbai' },
      { code: 'EMP-039', firstName: 'Sagar', lastName: 'Shirke', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Installation Technician', email: 'sagar.s@sunpowersolutions.in', phone: '+91 98220 10039', hourlyRate: 380, skills: ['Ground Mount Foundations', 'Rooftop Clamps', 'String Wiring'], location: 'Solapur' },
      { code: 'EMP-040', firstName: 'Tushar', lastName: 'Sonawane', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Field Solar Technician', email: 'tushar.s@sunpowersolutions.in', phone: '+91 98220 10040', hourlyRate: 370, skills: ['Inverter Wall Mounting', 'Battery Bank Interconnect', 'Commissioning Run'], location: 'Nashik' },
      { code: 'EMP-041', firstName: 'Mangesh', lastName: 'Ghate', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Solar Wireman', email: 'mangesh.g@sunpowersolutions.in', phone: '+91 98220 10041', hourlyRate: 360, skills: ['DB Dressing', 'Ferruling & Labeling', 'Insulation Resistance Testing'], location: 'Pune' },
      { code: 'EMP-042', firstName: 'Balaji', lastName: 'Rathod', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Installation Technician', email: 'balaji.r@sunpowersolutions.in', phone: '+91 98220 10042', hourlyRate: 350, skills: ['Roof Sealing', 'Module Handling', 'Cable Ties & Cleats'], location: 'Nanded' },
      { code: 'EMP-043', firstName: 'Dnyaneshwar', lastName: 'Garad', roleId: 'install_tech', department: 'Operations & Installations', designation: 'Junior Field Technician', email: 'dnyaneshwar.g@sunpowersolutions.in', phone: '+91 98220 10043', hourlyRate: 340, skills: ['Material Unloading', 'Site Preparation', 'Safety Barricading'], location: 'Pune' },

      // 6. Supply Chain & Inventory (7)
      { code: 'EMP-004', firstName: 'Ganesh', lastName: 'Shinde', roleId: 'warehouse_mgr', department: 'Supply Chain & Inventory', designation: 'Central Warehouse & Logistics Manager', email: 'ganesh.s@sunpowersolutions.in', phone: '+91 98220 10004', hourlyRate: 620, skills: ['Warehouse Management System', 'Batch Tracking', 'Carrier Negotiations'], location: 'Chakan, Pune' },
      { code: 'EMP-044', firstName: 'Prakash', lastName: 'Wagh', roleId: 'warehouse_mgr', department: 'Supply Chain & Inventory', designation: 'Regional Depot Manager - Nashik', email: 'prakash.w@sunpowersolutions.in', phone: '+91 98220 10044', hourlyRate: 500, skills: ['Depot Operations', 'Stock Reorder Points', 'Fleet Allocation'], location: 'Nashik' },
      { code: 'EMP-045', firstName: 'Sanjay', lastName: 'More', roleId: 'warehouse_mgr', department: 'Supply Chain & Inventory', designation: 'Regional Depot Manager - Nagpur', email: 'sanjay.m@sunpowersolutions.in', phone: '+91 98220 10045', hourlyRate: 500, skills: ['Vidarbha Logistics', 'GRN Auditing', 'Safe Material Handling'], location: 'Nagpur' },
      { code: 'EMP-046', firstName: 'Ravindra', lastName: 'Kale', roleId: 'warehouse_mgr', department: 'Supply Chain & Inventory', designation: 'Inventory & Dispatch Controller', email: 'ravindra.k@sunpowersolutions.in', phone: '+91 98220 10046', hourlyRate: 420, skills: ['Barcode Scanning', 'Pick-and-Pack', 'Dispatch Manifests'], location: 'Chakan, Pune' },
      { code: 'EMP-047', firstName: 'Ashok', lastName: 'Shelke', roleId: 'warehouse_mgr', department: 'Supply Chain & Inventory', designation: 'Procurement Specialist', email: 'ashok.s@sunpowersolutions.in', phone: '+91 98220 10047', hourlyRate: 450, skills: ['Supplier Purchase Orders', 'Vendor Lead-Times', 'Bill-of-Materials Matching'], location: 'Pune' },
      { code: 'EMP-048', firstName: 'Vikas', lastName: 'Pandhare', roleId: 'warehouse_mgr', department: 'Supply Chain & Inventory', designation: 'Warehouse Quality & Receiving Officer', email: 'vikas.p@sunpowersolutions.in', phone: '+91 98220 10048', hourlyRate: 390, skills: ['Goods Receiving Notes (GRN)', 'EL Flash Test Audit', 'Packaging Inspection'], location: 'Chakan, Pune' },
      { code: 'EMP-049', firstName: 'Chetan', lastName: 'Dhumal', roleId: 'warehouse_mgr', department: 'Supply Chain & Inventory', designation: 'Logistics & Dispatch Assistant', email: 'chetan.d@sunpowersolutions.in', phone: '+91 98220 10049', hourlyRate: 350, skills: ['Forklift Operation', 'Loading & Lashing', 'Delivery Challans'], location: 'Chakan, Pune' },

      // 7. Finance & Compliance (4)
      { code: 'EMP-007', firstName: 'Ramesh', lastName: 'Patil', roleId: 'accountant', department: 'Finance & Compliance', designation: 'Chief Financial Accountant', email: 'ramesh.p@sunpowersolutions.in', phone: '+91 98220 10007', hourlyRate: 750, skills: ['GST Invoicing', 'Project Profitability', 'Statutory Audit'], location: 'Pune' },
      { code: 'EMP-050', firstName: 'Sneha', lastName: 'Rao', roleId: 'accountant', department: 'Finance & Compliance', designation: 'Senior Project Accountant', email: 'sneha.r@sunpowersolutions.in', phone: '+91 98220 10050', hourlyRate: 580, skills: ['Cost Attribution', 'Vendor Bill Verification', 'Labour Payroll Costing'], location: 'Pune' },
      { code: 'EMP-051', firstName: 'Rajeshwari', lastName: 'Chitale', roleId: 'accountant', department: 'Finance & Compliance', designation: 'Accounts Receivable & Billing Specialist', email: 'rajeshwari.c@sunpowersolutions.in', phone: '+91 98220 10051', hourlyRate: 480, skills: ['Customer Milestone Billing', 'Payment Reconciliation', 'Bank Reconciliations'], location: 'Pune' },
      { code: 'EMP-052', firstName: 'Vinod', lastName: 'Mahajan', roleId: 'accountant', department: 'Finance & Compliance', designation: 'Direct Expenses & Compliance Auditor', email: 'vinod.m@sunpowersolutions.in', phone: '+91 98220 10052', hourlyRate: 500, skills: ['Direct Expense Auditing', 'TDS Deductions', 'Vendor Payment Approvals'], location: 'Pune' },

      // 8. After-Sales & Customer Service (6)
      { code: 'EMP-006', firstName: 'Sneha', lastName: 'Deshpande', roleId: 'support_exec', department: 'After-Sales & Customer Service', designation: 'Client Care & Warranty Specialist', email: 'sneha.d@sunpowersolutions.in', phone: '+91 98220 10006', hourlyRate: 520, skills: ['Warranty Claim Processing', 'Service Escalation', 'Solar Generation Monitoring'], location: 'Pune' },
      { code: 'EMP-053', firstName: 'Radhika', lastName: 'Apte', roleId: 'support_exec', department: 'After-Sales & Customer Service', designation: 'Customer Support Lead', email: 'radhika.a@sunpowersolutions.in', phone: '+91 98220 10053', hourlyRate: 460, skills: ['Helpdesk Operations', 'First Contact Resolution', 'Service Level Agreements'], location: 'Pune' },
      { code: 'EMP-054', firstName: 'Pooja', lastName: 'Hegde', roleId: 'support_exec', department: 'After-Sales & Customer Service', designation: 'O&M Service Coordinator', email: 'pooja.h@sunpowersolutions.in', phone: '+91 98220 10054', hourlyRate: 420, skills: ['Annual Maintenance Contracts', 'Preventive Maintenance Scheduling', 'Remote Telemetry'], location: 'Mumbai' },
      { code: 'EMP-055', firstName: 'Gaurav', lastName: 'Phalke', roleId: 'support_exec', department: 'After-Sales & Customer Service', designation: 'Field Service Dispatcher', email: 'gaurav.p@sunpowersolutions.in', phone: '+91 98220 10055', hourlyRate: 400, skills: ['Breakdown Ticket Routing', 'Spares Coordination', 'Customer Updates'], location: 'Pune' },
      { code: 'EMP-056', firstName: 'Swati', lastName: 'Kulkarni', roleId: 'support_exec', department: 'After-Sales & Customer Service', designation: 'Warranty Officer', email: 'swati.k@sunpowersolutions.in', phone: '+91 98220 10056', hourlyRate: 410, skills: ['OEM Warranty Portals', 'RMA Number Generation', 'Manufacturer Replacements'], location: 'Nashik' },
      { code: 'EMP-057', firstName: 'Nikhil', lastName: 'Dixit', roleId: 'support_exec', department: 'After-Sales & Customer Service', designation: 'Technical Support Representative', email: 'nikhil.d@sunpowersolutions.in', phone: '+91 98220 10057', hourlyRate: 390, skills: ['Inverter App Setup', 'Wi-Fi Datalogger Troubleshooting', 'Generation Variance Analysis'], location: 'Pune' },

      // 9. Other Operations & Specialized Roles (4)
      { code: 'EMP-058', firstName: 'Sunita', lastName: 'Bapat', roleId: 'install_tech', department: 'Operations & Installations', designation: 'EHS Quality & Safety Officer', email: 'sunita.b@sunpowersolutions.in', phone: '+91 98220 10058', hourlyRate: 520, skills: ['Fall Protection Audits', 'Job Safety Analysis (JSA)', 'Quality Checklists'], location: 'Pune' },
      { code: 'EMP-059', firstName: 'Harishchandra', lastName: 'Kudale', roleId: 'warehouse_mgr', department: 'Supply Chain & Inventory', designation: 'Fleet & Dispatch Coordinator', email: 'harish.k@sunpowersolutions.in', phone: '+91 98220 10059', hourlyRate: 440, skills: ['Vehicle Tracking (GPS)', 'Fastag Toll Auditing', 'Driver Route Planning'], location: 'Chakan, Pune' },
      { code: 'EMP-060', firstName: 'Kalyani', lastName: 'Ranade', roleId: 'engineering_lead', department: 'Engineering & Approvals', designation: 'Regulatory Liaison & Net Metering Officer', email: 'kalyani.r@sunpowersolutions.in', phone: '+91 98220 10060', hourlyRate: 600, skills: ['MSEDCL Portal Submission', 'Discom Sanction Letters', 'Subsidy Disbursement Follow-up'], location: 'Pune' },
      { code: 'EMP-010', firstName: 'Anand', lastName: 'Godbole', roleId: 'engineering_lead', department: 'Operations & Installations', designation: 'Grid Interconnection Specialist', email: 'anand.g@sunpowersolutions.in', phone: '+91 98220 10010', hourlyRate: 700, skills: ['Bi-directional Meter Testing', 'Synchronization Compliance', 'Solar Tree & Microgrid Design'], location: 'Pune' }
    ];

    console.log(`• Prepared definition for ${employeeDefs.length} employees.`);

    // Upsert Profiles and Employees
    const createdEmployees: { id: string; code: string; roleId: string; name: string; dept: string }[] = [];
    const salesEmployees: string[] = [];
    const surveyTechEmployees: string[] = [];
    const designReviewers: { id: string; name: string }[] = [];
    const designApprovers: { id: string; name: string }[] = [];
    const installTechEmployees: string[] = [];
    const accountantEmployees: string[] = [];
    const warehouseEmployees: string[] = [];
    const supportEmployees: string[] = [];

    for (const emp of employeeDefs) {
      const profileId = deterministicUuid('profile', emp.code);
      const employeeId = deterministicUuid('employee', emp.code);
      const fullName = `${emp.firstName} ${emp.lastName}`.trim();

      // Check if profile exists by email (to avoid duplicate key error if pre-existing)
      const existingProfile = await client.query('SELECT id FROM profiles WHERE email = $1', [emp.email]);
      let targetProfileId = profileId;

      if (existingProfile.rowCount && existingProfile.rowCount > 0) {
        targetProfileId = existingProfile.rows[0].id;
        await client.query(`
          UPDATE profiles 
          SET full_name = $1, role_id = $2, role_title = $3, department = $4, phone = $5, is_demo = true, seed_batch_id = $6
          WHERE id = $7
        `, [fullName, emp.roleId, emp.designation, emp.department, emp.phone, SEED_BATCH_ID, targetProfileId]);
      } else {
        await client.query(`
          INSERT INTO profiles (id, full_name, email, phone, role_id, role_title, department, password_hash, is_active, email_verified, is_demo, seed_batch_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true, true, $9)
          ON CONFLICT (id) DO UPDATE 
          SET full_name = EXCLUDED.full_name, role_id = EXCLUDED.role_id, role_title = EXCLUDED.role_title, department = EXCLUDED.department, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [targetProfileId, fullName, emp.email, emp.phone, emp.roleId, emp.designation, emp.department, demoPasswordHash, SEED_BATCH_ID]);
      }

      // Check if employee exists by employee_code
      const existingEmp = await client.query('SELECT id FROM employees WHERE employee_code = $1', [emp.code]);
      let targetEmpId = employeeId;

      if (existingEmp.rowCount && existingEmp.rowCount > 0) {
        targetEmpId = existingEmp.rows[0].id;
        await client.query(`
          UPDATE employees
          SET first_name = $1, last_name = $2, email = $3, phone = $4, department = $5, designation = $6, role_id = $7, hourly_rate = $8, skills = $9, profile_id = $10, is_demo = true, seed_batch_id = $11
          WHERE id = $12
        `, [emp.firstName, emp.lastName, emp.email, emp.phone, emp.department, emp.designation, emp.roleId, emp.hourlyRate, emp.skills, targetProfileId, SEED_BATCH_ID, targetEmpId]);
      } else {
        await client.query(`
          INSERT INTO employees (id, profile_id, employee_code, first_name, last_name, email, phone, department, designation, role_id, hourly_rate, skills, is_available, is_demo, seed_batch_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, true, $13)
          ON CONFLICT (id) DO UPDATE
          SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, email = EXCLUDED.email, phone = EXCLUDED.phone, department = EXCLUDED.department, designation = EXCLUDED.designation, role_id = EXCLUDED.role_id, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [targetEmpId, targetProfileId, emp.code, emp.firstName, emp.lastName, emp.email, emp.phone, emp.department, emp.designation, emp.roleId, emp.hourlyRate, emp.skills, SEED_BATCH_ID]);
      }

      createdEmployees.push({ id: targetEmpId, code: emp.code, roleId: emp.roleId, name: fullName, dept: emp.department });

      // Group by functional role for business relational connections
      if (emp.roleId === 'sales_exec') salesEmployees.push(targetEmpId);
      if (emp.roleId === 'survey_tech') surveyTechEmployees.push(targetEmpId);
      if (emp.roleId === 'engineering_lead') {
        if (emp.code === 'EMP-009' || emp.code === 'EMP-026') {
          designApprovers.push({ id: targetEmpId, name: fullName });
        } else {
          designReviewers.push({ id: targetEmpId, name: fullName });
        }
      }
      if (emp.roleId === 'install_tech') installTechEmployees.push(targetEmpId);
      if (emp.roleId === 'accountant') accountantEmployees.push(targetEmpId);
      if (emp.roleId === 'warehouse_mgr') warehouseEmployees.push(targetEmpId);
      if (emp.roleId === 'support_exec') supportEmployees.push(targetEmpId);
    }

    console.log(`✅ Upserted ${createdEmployees.length} employees across all departments.`);
    console.log(`   - Sales Executives: ${salesEmployees.length}`);
    console.log(`   - Survey Specialists: ${surveyTechEmployees.length}`);
    console.log(`   - Design Reviewers: ${designReviewers.length}, Approvers: ${designApprovers.length}`);
    console.log(`   - Installation Technicians: ${installTechEmployees.length}`);
    console.log(`   - Warehouse Staff: ${warehouseEmployees.length}`);
    console.log(`   - Accountants: ${accountantEmployees.length}`);
    console.log(`   - Customer Support: ${supportEmployees.length}`);

    // ========================================================================
    // PHASE 4: 190 REALISTIC SOLAR CUSTOMERS & SITES
    // ========================================================================
    console.log('\n--- Seeding 190 Customers & Sites across Maharashtra ---');

    const maharashtraCities = [
      { city: 'Pune', state: 'Maharashtra', pinRange: [411001, 411057] },
      { city: 'Pimpri-Chinchwad', state: 'Maharashtra', pinRange: [411017, 411033] },
      { city: 'Mumbai', state: 'Maharashtra', pinRange: [400001, 400099] },
      { city: 'Thane', state: 'Maharashtra', pinRange: [400601, 400615] },
      { city: 'Navi Mumbai', state: 'Maharashtra', pinRange: [400701, 400710] },
      { city: 'Nashik', state: 'Maharashtra', pinRange: [422001, 422013] },
      { city: 'Nagpur', state: 'Maharashtra', pinRange: [440001, 440035] },
      { city: 'Aurangabad', state: 'Maharashtra', pinRange: [431001, 431010] },
      { city: 'Kolhapur', state: 'Maharashtra', pinRange: [416001, 416013] },
      { city: 'Satara', state: 'Maharashtra', pinRange: [415001, 415015] },
      { city: 'Solapur', state: 'Maharashtra', pinRange: [413001, 413008] },
      { city: 'Ahmednagar', state: 'Maharashtra', pinRange: [414001, 414006] }
    ];

    const residentialFirstNames = [
      'Rajesh', 'Sunita', 'Amit', 'Pooja', 'Suresh', 'Sneha', 'Ramesh', 'Kavita',
      'Sachin', 'Anjali', 'Vijay', 'Priya', 'Nitin', 'Deepa', 'Sanjay', 'Manisha',
      'Manoj', 'Asha', 'Ganesh', 'Varsha', 'Prakash', 'Shalini', 'Ashok', 'Neelam',
      'Vikas', 'Smita', 'Santosh', 'Archana', 'Milind', 'Swati', 'Prashant', 'Meena',
      'Chetan', 'Jyoti', 'Tushar', 'Rupali', 'Ajay', 'Shweta', 'Sunil', 'Bhavana',
      'Vinod', 'Pallavi', 'Mahesh', 'Madhuri', 'Anand', 'Sangita', 'Pravin', 'Rashmi',
      'Kiran', 'Suvarna', 'Dhananjay', 'Aparna', 'Hemant', 'Rohini', 'Nilesh', 'Rekha'
    ];

    const surnames = [
      'Sharma', 'Patil', 'Deshmukh', 'Kulkarni', 'Joshi', 'Shinde', 'Jadhav', 'Pawar',
      'More', 'Chavan', 'Thorat', 'Gaikwad', 'Kadam', 'Bhosale', 'Sawant', 'Mane',
      'Tambe', 'Mohite', 'Garad', 'Sonawane', 'Bhandari', 'Kelkar', 'Bapat', 'Ranade',
      'Chitale', 'Date', 'Ghate', 'Godbole', 'Apte', 'Hegde', 'Dixit', 'Phalke'
    ];

    const commercialEntities = [
      'Mahalaxmi Agro Plastics Pvt Ltd', 'Precision Gears & Toolings', 'Sahyadri Agro Processing Hub',
      'Shree Ganesh Cold Storage', 'Aditya Auto Components Ltd', 'Kalyani Packaging Solutions',
      'Varun Beverages Bottling Plant', 'Balaji Cotton Ginning Mill', 'Siddheshwar Steel Rolling Mill',
      'Ajanta Pharma Research Lab', 'Navkar Logistics Park', 'Omega Engineering Works',
      'Panchsheel Business Towers', 'Kuber Commercial Complex', 'Chitale Dairy Processing Unit',
      'Maratha Chamber of Commerce Center', 'Godavari Sugar Mills Farm Office', 'Deccan Rubber Products',
      'Vidarbha Rice Processing Mill', 'Apex Textiles & Weaving Mill', 'Poona Club Annex',
      'Sterling Horizon IT Park', 'Sai Baba Diagnostic Center', 'Silver Oak Banquet & Hotel',
      'Green Earth Organic Cold Chain', 'Shivaji Super Market & Departmental', 'Sunrise Poultry Automation',
      'Pioneer Polymers & Pipes', 'Kothari Auto Spares Depot', 'Indus Valley Warehousing'
    ];

    const institutionalEntities = [
      'Sanjivani Multispecialty Hospital', 'Sahyadri Specialty Clinic', 'Ruby General Hospital Wing B',
      'Lifeline Emergency Trauma Centre', 'Symbiosis Vidya Mandir Higher Secondary', 'Dr. D.Y. Patil English Medium School',
      'Sinhgad Technical Institute Campus', 'Modern College of Arts & Commerce', 'Kalyani Memorial Charitable Hospital',
      'Orchid Palace Resort & Spa', 'Hotel Grand Central & Conventions', 'Sayaji Express Hotel & Suites',
      'Pride Heritage Green Resort', 'Fort Jadhavgadh Heritage Resort'
    ];

    interface CustomerSeedDef {
      code: string;
      fullName: string;
      category: 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'institutional';
      phone: string;
      email: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      monthlyBill: number;
      capacityKw: number;
      systemType: 'on_grid' | 'off_grid' | 'hybrid';
      roofSpaceSqft: number;
      roofType: string;
      enquirySource: string;
      leadStatus: 'new' | 'contacted' | 'survey_scheduled' | 'quotation_sent' | 'order_confirmed' | 'installation_in_progress' | 'completed' | 'lost';
      assignedSalesRepId: string;
    }

    const customerDefs: CustomerSeedDef[] = [];
    const leadStatuses = ['new', 'contacted', 'survey_scheduled', 'quotation_sent', 'order_confirmed', 'installation_in_progress', 'completed', 'completed'] as const;
    const roofTypes = ['concrete_flat', 'metal_shed', 'terracotta_tiles', 'asbestos_sheet'];
    const enquirySources = ['website', 'referral', 'solar_expo', 'channel_partner', 'newspaper_ad', 'cold_outreach'];

    // Generate 190 Customers
    for (let i = 1; i <= 190; i++) {
      const custCode = `CUST-2026-${String(i).padStart(3, '0')}`;
      const cityObj = maharashtraCities[(i * 7) % maharashtraCities.length];
      const postalCode = String(cityObj.pinRange[0] + (i * 3) % (cityObj.pinRange[1] - cityObj.pinRange[0] + 1));
      const assignedSalesRepId = salesEmployees[i % salesEmployees.length];
      const leadStatus = leadStatuses[i % leadStatuses.length];
      const source = enquirySources[i % enquirySources.length];

      let category: 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'institutional' = 'residential';
      let fullName = '';
      let capacityKw = 3;
      let monthlyBill = 3500;
      let roofSpace = 400;
      let roofType = 'concrete_flat';
      let address = '';

      if (i <= 105) {
        // Residential (105)
        category = 'residential';
        const fn = residentialFirstNames[i % residentialFirstNames.length];
        const sn = surnames[(i + 3) % surnames.length];
        fullName = `${fn} ${sn}`;
        capacityKw = [2, 3, 5, 7, 10][i % 5];
        monthlyBill = capacityKw * 1200 + 400;
        roofSpace = capacityKw * 100 + 80;
        roofType = roofTypes[i % 2]; // flat or tiles
        address = `Flat ${101 + (i % 8) * 100}, Wing ${String.fromCharCode(65 + (i % 4))}, Gulmohar Residency, ${cityObj.city}`;
      } else if (i <= 145) {
        // Commercial & Institutional (40)
        category = i <= 135 ? 'commercial' : 'institutional';
        const nameIdx = (i - 106) % commercialEntities.length;
        fullName = commercialEntities[nameIdx];
        capacityKw = [15, 25, 40, 50, 75][i % 5];
        monthlyBill = capacityKw * 2200;
        roofSpace = capacityKw * 100 + 500;
        roofType = 'metal_shed';
        address = `Plot ${12 + (i % 30)}, MIDC Industrial Area, Phase II, ${cityObj.city}`;
      } else if (i <= 165) {
        // Industrial Factories (20)
        category = 'industrial';
        const nameIdx = (i - 146) % commercialEntities.length;
        fullName = `${commercialEntities[nameIdx]} (Plant ${1 + (i % 3)})`;
        capacityKw = [100, 150, 200, 250, 300][i % 5];
        monthlyBill = capacityKw * 2800;
        roofSpace = capacityKw * 95 + 1000;
        roofType = 'metal_shed';
        address = `Gat No. ${400 + i}, Chakan-Talegaon Industrial Corridor, ${cityObj.city}`;
      } else if (i <= 180) {
        // Agricultural Farms & Pumps (15)
        category = 'agricultural';
        const fn = residentialFirstNames[(i + 5) % residentialFirstNames.length];
        const sn = surnames[(i + 7) % surnames.length];
        fullName = `${fn} ${sn} (Agro Farms & Solar Pump)`;
        capacityKw = [5, 7.5, 10, 12.5][i % 4];
        monthlyBill = capacityKw * 800;
        roofSpace = capacityKw * 120;
        roofType = 'ground_mount';
        address = `Survey No. ${80 + i}, Village Shivapur, Taluka Haveli, District ${cityObj.city}`;
      } else {
        // Hospitals, Schools, Resorts (10)
        category = 'institutional';
        const instIdx = (i - 181) % institutionalEntities.length;
        fullName = institutionalEntities[instIdx];
        capacityKw = [30, 45, 60, 80][i % 4];
        monthlyBill = capacityKw * 2400;
        roofSpace = capacityKw * 110 + 300;
        roofType = 'concrete_flat';
        address = `Campus Plot ${5 + (i % 10)}, Bypass Highway Road, ${cityObj.city}`;
      }

      const email = `contact.${custCode.toLowerCase()}@sunpowerdemo.in`;
      const phone = `+91 94220 ${String(10000 + i).substring(1)}`;

      customerDefs.push({
        code: custCode,
        fullName,
        category,
        phone,
        email,
        address,
        city: cityObj.city,
        state: cityObj.state,
        postalCode,
        monthlyBill,
        capacityKw,
        systemType: i % 4 === 0 ? 'hybrid' : (i % 6 === 0 ? 'off_grid' : 'on_grid'),
        roofSpaceSqft: roofSpace,
        roofType,
        enquirySource: source,
        leadStatus,
        assignedSalesRepId
      });
    }

    console.log(`• Prepared ${customerDefs.length} customer records.`);

    // Upsert Customers and Sites into PostgreSQL
    const createdCustomers: { id: string; code: string; name: string; capacityKw: number; salesRepId: string; status: string }[] = [];

    for (const cust of customerDefs) {
      const custId = deterministicUuid('customer', cust.code);
      const siteId = deterministicUuid('site', cust.code);

      // Check if customer exists by customer_code
      const existingCust = await client.query('SELECT id FROM customers WHERE customer_code = $1', [cust.code]);
      let targetCustId = custId;

      if (existingCust.rowCount && existingCust.rowCount > 0) {
        targetCustId = existingCust.rows[0].id;
        await client.query(`
          UPDATE customers
          SET full_name = $1, phone = $2, email = $3, address = $4, city = $5, state = $6, postal_code = $7,
              monthly_electricity_bill = $8, interested_capacity_kw = $9, preferred_system_type = $10,
              roof_space_sqft = $11, roof_type = $12, enquiry_source = $13, assigned_sales_rep_id = $14,
              lead_status = $15, is_demo = true, seed_batch_id = $16, updated_at = NOW()
          WHERE id = $17
        `, [
          cust.fullName, cust.phone, cust.email, cust.address, cust.city, cust.state, cust.postalCode,
          cust.monthlyBill, cust.capacityKw, cust.systemType, cust.roofSpaceSqft, cust.roofType,
          cust.enquirySource, cust.assignedSalesRepId, cust.leadStatus, SEED_BATCH_ID, targetCustId
        ]);
      } else {
        await client.query(`
          INSERT INTO customers (
            id, customer_code, full_name, phone, email, address, city, state, postal_code,
            monthly_electricity_bill, interested_capacity_kw, preferred_system_type,
            roof_space_sqft, roof_type, enquiry_source, assigned_sales_rep_id, lead_status,
            is_demo, seed_batch_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, true, $18
          )
          ON CONFLICT (id) DO UPDATE
          SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, email = EXCLUDED.email,
              assigned_sales_rep_id = EXCLUDED.assigned_sales_rep_id, lead_status = EXCLUDED.lead_status,
              is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [
          targetCustId, cust.code, cust.fullName, cust.phone, cust.email, cust.address, cust.city, cust.state, cust.postalCode,
          cust.monthlyBill, cust.capacityKw, cust.systemType, cust.roofSpaceSqft, cust.roofType,
          cust.enquirySource, cust.assignedSalesRepId, cust.leadStatus, SEED_BATCH_ID
        ]);
      }

      // Customer Site
      await client.query(`
        INSERT INTO customer_sites (
          id, customer_id, site_label, address, city, state, pincode, property_type, sanctioned_load_kw, phase_type, is_demo, seed_batch_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11
        )
        ON CONFLICT (id) DO UPDATE
        SET site_label = EXCLUDED.site_label, sanctioned_load_kw = EXCLUDED.sanctioned_load_kw, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
      `, [
        siteId, targetCustId, `${cust.category.toUpperCase()} Site: ${cust.fullName}`, cust.address, cust.city, cust.state, cust.postalCode,
        cust.roofType, cust.capacityKw * 1.25, cust.capacityKw > 5 ? 'three_phase' : 'single_phase', SEED_BATCH_ID
      ]);

      createdCustomers.push({
        id: targetCustId,
        code: cust.code,
        name: cust.fullName,
        capacityKw: cust.capacityKw,
        salesRepId: cust.assignedSalesRepId,
        status: cust.leadStatus
      });
    }

    console.log(`✅ Upserted ${createdCustomers.length} customers and sites into Supabase PostgreSQL.`);

    // ========================================================================
    // PHASE 6: CONNECTED BUSINESS DATA
    // ========================================================================
    console.log('\n--- Seeding Warehouses, Storage Locations, and Suppliers ---');

    // 1. Warehouses
    const warehouseDefs = [
      { id: 'wh-chakan', code: 'WH-PUN-01', name: 'Central Logistics & Distribution Hub', address: 'Plot B-44, Chakan Industrial Phase II', city: 'Pune', state: 'Maharashtra', pincode: '410501', managerId: warehouseEmployees[0] || null },
      { id: 'wh-nashik', code: 'WH-NSK-01', name: 'Northern Maharashtra Depot', address: 'Ambad Industrial Area, MIDC', city: 'Nashik', state: 'Maharashtra', pincode: '422010', managerId: warehouseEmployees[1] || null },
      { id: 'wh-nagpur', code: 'WH-NGP-01', name: 'Vidarbha Regional Logistics Center', address: 'Hingna Industrial Estate', city: 'Nagpur', state: 'Maharashtra', pincode: '440016', managerId: warehouseEmployees[2] || null }
    ];

    for (const wh of warehouseDefs) {
      await client.query(`
        INSERT INTO warehouses (id, code, name, address, city, state, pincode, manager_id, status, is_demo, seed_batch_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', true, $9)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name, manager_id = EXCLUDED.manager_id, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
      `, [wh.id, wh.code, wh.name, wh.address, wh.city, wh.state, wh.pincode, wh.managerId, SEED_BATCH_ID]);
    }
    console.log(`✅ Seeded ${warehouseDefs.length} warehouses.`);

    // 2. Storage Locations
    const storageLocations = [
      { id: 'loc-pun-a1', whId: 'wh-chakan', zone: 'A', rack: '01', shelf: '1', bin: '01', fullCode: 'PUN-A-01-1-01' },
      { id: 'loc-pun-a2', whId: 'wh-chakan', zone: 'A', rack: '01', shelf: '2', bin: '02', fullCode: 'PUN-A-01-2-02' },
      { id: 'loc-pun-b1', whId: 'wh-chakan', zone: 'B', rack: '02', shelf: '1', bin: '01', fullCode: 'PUN-B-02-1-01' },
      { id: 'loc-pun-b2', whId: 'wh-chakan', zone: 'B', rack: '02', shelf: '2', bin: '02', fullCode: 'PUN-B-02-2-02' },
      { id: 'loc-pun-c1', whId: 'wh-chakan', zone: 'C', rack: '03', shelf: '1', bin: '01', fullCode: 'PUN-C-03-1-01' },
      { id: 'loc-nsk-a1', whId: 'wh-nashik', zone: 'A', rack: '01', shelf: '1', bin: '01', fullCode: 'NSK-A-01-1-01' },
      { id: 'loc-nsk-b1', whId: 'wh-nashik', zone: 'B', rack: '01', shelf: '1', bin: '01', fullCode: 'NSK-B-01-1-01' },
      { id: 'loc-ngp-a1', whId: 'wh-nagpur', zone: 'A', rack: '01', shelf: '1', bin: '01', fullCode: 'NGP-A-01-1-01' }
    ];

    for (const loc of storageLocations) {
      await client.query(`
        INSERT INTO storage_locations (id, warehouse_id, zone, rack, shelf, bin, full_code, status, is_demo, seed_batch_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'available', true, $8)
        ON CONFLICT (id) DO UPDATE
        SET status = 'available', is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
      `, [loc.id, loc.whId, loc.zone, loc.rack, loc.shelf, loc.bin, loc.fullCode, SEED_BATCH_ID]);
    }
    console.log(`✅ Seeded ${storageLocations.length} storage locations.`);

    // 3. Suppliers
    const supplierDefs = [
      { name: 'Waaree Energies Ltd', contact: 'Rajendra Joshi', phone: '+91 22 6644 4400', email: 'oem.sales@waaree.com', address: '602 Western Edge I, Borivali East, Mumbai' },
      { name: 'Tata Power Solar Systems Ltd', contact: 'Kavita Sundaram', phone: '+91 80 6699 9000', email: 'distributor@tatapower.com', address: '78 Electronics City, Bengaluru' },
      { name: 'Luminous Power Technologies Pvt Ltd', contact: 'Manish Verma', phone: '+91 124 477 6700', email: 'solar.sales@luminousindia.com', address: 'Plot 150 Sector 44, Gurugram' },
      { name: 'Polycab India Ltd', contact: 'Naveen Agarwal', phone: '+91 22 2410 7000', email: 'renewables@polycab.com', address: 'Polycab House, Mogul Lane, Mahim, Mumbai' }
    ];

    const supplierIds: string[] = [];
    for (let i = 0; i < supplierDefs.length; i++) {
      const sup = supplierDefs[i];
      const supId = deterministicUuid('supplier', String(i + 1));
      await client.query(`
        INSERT INTO suppliers (id, name, contact_person, phone, email, address, lead_time_days, is_demo, seed_batch_id)
        VALUES ($1, $2, $3, $4, $5, $6, 7, true, $7)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name, contact_person = EXCLUDED.contact_person, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
      `, [supId, sup.name, sup.contact, sup.phone, sup.email, sup.address, SEED_BATCH_ID]);
      supplierIds.push(supId);
    }
    console.log(`✅ Seeded ${supplierIds.length} tier-1 suppliers.`);

    // 4. Products & Stock
    const productsRes = await client.query('SELECT id, sku, name, selling_price, unit_cost FROM products');
    const existingProducts = productsRes.rows;
    console.log(`• Found ${existingProducts.length} hardware products in catalog.`);

    // 5. Product Serial Numbers (80 records)
    console.log('• Generating 80 hardware serial numbers with inventory tracking...');
    const serialNumberIds: string[] = [];
    const panelProduct = existingProducts.find(p => p.sku.includes('WAA') || p.sku.includes('TATA')) || existingProducts[0];
    const inverterProduct = existingProducts.find(p => p.sku.includes('INV') || p.sku.includes('LUM')) || existingProducts[1];

    for (let i = 1; i <= 80; i++) {
      const isPanel = i <= 50;
      const prod = isPanel ? panelProduct : inverterProduct;
      const serialNum = isPanel ? `SN-WAA-2026-${String(1000 + i)}` : `SN-LUM-INV-2026-${String(2000 + i)}`;
      const snId = deterministicUuid('serial', serialNum);
      const supplierId = supplierIds[i % supplierIds.length];
      const status = i <= 45 ? 'allocated_to_order' : (i <= 65 ? 'in_warehouse' : 'installed');

      await client.query(`
        INSERT INTO product_serial_numbers (
          id, serial_number, product_id, supplier_id, purchase_date, current_status, is_demo, seed_batch_id
        ) VALUES (
          $1, $2, $3, $4, '2026-01-15', $5, true, $6
        )
        ON CONFLICT (id) DO UPDATE
        SET current_status = EXCLUDED.current_status, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
      `, [snId, serialNum, prod.id, supplierId, status, SEED_BATCH_ID]);

      serialNumberIds.push(snId);
    }
    console.log(`✅ Seeded ${serialNumberIds.length} serial numbers.`);

    // 6. 120 Customer Enquiries
    console.log('\n--- Seeding 120 Customer Enquiries ---');
    const enquiryStatuses = ['new', 'contacted', 'qualified', 'survey_scheduled', 'converted', 'lost'];
    const enquiryIds: string[] = [];

    for (let i = 1; i <= 120; i++) {
      const enqNumber = `ENQ-2026-${String(i).padStart(4, '0')}`;
      const enqId = deterministicUuid('enquiry', enqNumber);
      const cust = createdCustomers[(i - 1) % createdCustomers.length];
      const status = enquiryStatuses[i % enquiryStatuses.length];
      const priority = i % 3 === 0 ? 'high' : (i % 2 === 0 ? 'medium' : 'low');

      await client.query(`
        INSERT INTO enquiries (
          id, enquiry_number, customer_id, source, initial_notes, energy_consumption_units, priority, status, is_demo, seed_batch_id
        ) VALUES (
          $1, $2, $3, 'SolarOS CRM Web Portal', $4, $5, $6, $7, true, $8
        )
        ON CONFLICT (id) DO UPDATE
        SET status = EXCLUDED.status, initial_notes = EXCLUDED.initial_notes, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
      `, [
        enqId, enqNumber, cust.id,
        `Customer interested in ${cust.capacityKw} kW solar installation. Monthly electricity consumption around ${cust.capacityKw * 130} units.`,
        cust.capacityKw * 130, priority, status, SEED_BATCH_ID
      ]);

      enquiryIds.push(enqId);
    }
    console.log(`✅ Seeded ${enquiryIds.length} customer enquiries.`);

    // 7. 45 Site Surveys & Technical Reviews
    console.log('\n--- Seeding 45 Site Surveys & Technical Engineering Reviews ---');
    const surveyIds: string[] = [];
    const surveyStatuses = ['completed', 'approved', 'under_review', 'revisions_required', 'scheduled'];

    for (let i = 1; i <= 45; i++) {
      const srvNumber = `SRV-2026-${String(i).padStart(3, '0')}`;
      const srvId = deterministicUuid('survey', srvNumber);
      const cust = createdCustomers[i - 1];
      const techId = surveyTechEmployees[i % surveyTechEmployees.length];
      const approver = designApprovers[i % designApprovers.length];
      const status = surveyStatuses[i % surveyStatuses.length];

      // 7. 45 Site Surveys & Technical Engineering Reviews
      const existingSrv = await client.query('SELECT id FROM site_surveys WHERE survey_number = $1', [srvNumber]);
      let targetSrvId = srvId;
      if (existingSrv.rowCount && existingSrv.rowCount > 0) {
        targetSrvId = existingSrv.rows[0].id;
        await client.query(`
          UPDATE site_surveys
          SET customer_id = $1, status = $2, recommended_capacity_kw = $3, assigned_technician_id = $4,
              approved_by_id = $5, is_demo = true, seed_batch_id = $6
          WHERE id = $7
        `, [cust.id, status, cust.capacityKw, techId, (status === 'approved' ? approver.id : null), SEED_BATCH_ID, targetSrvId]);
      } else {
        await client.query(`
          INSERT INTO site_surveys (
            id, survey_number, customer_id, scheduled_date, completed_date, status,
            roof_length_m, roof_width_m, total_roof_area_sqm, shadow_free_area_sqm,
            roof_direction, roof_tilt_degrees, cable_distance_meters, electricity_sanctioned_load_kw,
            meter_number, phase_type, transformer_distance_m, technician_observations,
            recommended_capacity_kw, structural_suitability, assigned_technician_id, approved_by_id,
            is_demo, seed_batch_id
          ) VALUES (
            $1, $2, $3, '2026-02-10 10:00:00+05:30', '2026-02-11 16:30:00+05:30', $4,
            18.5, 12.0, 222.0, 195.0,
            'South', 18.0, 25.0, $5,
            $6, 'three_phase', 85.0, $7,
            $8, 'suitable', $9, $10,
            true, $11
          )
          ON CONFLICT (id) DO UPDATE
          SET status = EXCLUDED.status, technician_observations = EXCLUDED.technician_observations, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [
          targetSrvId, srvNumber, cust.id, status,
          cust.capacityKw * 1.25,
          `MTR-PUN-${90000 + i}`,
          `Site survey completed by field specialist. Good shadow-free southern exposure. Reinforced concrete beams suitable for elevated mounting structure without puncturing roof membrane.`,
          cust.capacityKw, techId, (status === 'approved' ? approver.id : null),
          SEED_BATCH_ID
        ]);
      }

      // Survey Assignment record
      const assignId = deterministicUuid('survey_assignment', srvNumber);
      await client.query(`
        INSERT INTO survey_assignments (id, survey_id, technician_id, notes, is_demo, seed_batch_id)
        VALUES ($1, $2, $3, 'Field assessment assigned to certified solar surveyor', true, $4)
        ON CONFLICT (id) DO UPDATE SET notes = EXCLUDED.notes, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
      `, [assignId, targetSrvId, techId, SEED_BATCH_ID]);

      surveyIds.push(targetSrvId);
    }
    console.log(`✅ Seeded ${surveyIds.length} site surveys and assignment audits.`);

    // 8. 70 Quotations & Items
    console.log('\n--- Seeding 70 Quotations & Items ---');
    const quotationStatuses = ['accepted', 'accepted', 'sent', 'sent', 'draft', 'expired'];
    const quotationIds: string[] = [];
    const quotationRecords: { id: string; number: string; custId: string; totalAmount: number; status: string }[] = [];

    for (let i = 1; i <= 70; i++) {
      const qNumber = `QT-2026-${String(i).padStart(3, '0')}`;
      const qId = deterministicUuid('quotation', qNumber);
      const cust = createdCustomers[i - 1];
      const surveyId = i <= 45 ? surveyIds[i - 1] : null;
      const salesRepId = cust.salesRepId;
      const status = quotationStatuses[i % quotationStatuses.length];

      const capKw = cust.capacityKw;
      const hardwareSubtotal = capKw * 38000;
      const installCharges = Math.round(capKw * 5000);
      const subsidy = capKw <= 3 ? capKw * 18000 : (capKw <= 10 ? 54000 : 0);
      const taxable = hardwareSubtotal + installCharges - subsidy;
      const taxAmount = Math.round(taxable * 0.138); // 13.8% composite GST
      const totalAmount = taxable + taxAmount;

      const existingQ = await client.query('SELECT id FROM quotations WHERE quotation_number = $1', [qNumber]);
      let targetQId = qId;

      if (existingQ.rowCount && existingQ.rowCount > 0) {
        targetQId = existingQ.rows[0].id;
        await client.query(`
          UPDATE quotations
          SET customer_id = $1, survey_id = $2, system_capacity_kw = $3, hardware_subtotal = $4,
              installation_charges = $5, subsidy_amount = $6, tax_amount = $7, total_amount = $8,
              status = $9, prepared_by_id = $10, is_demo = true, seed_batch_id = $11
          WHERE id = $12
        `, [cust.id, surveyId, capKw, hardwareSubtotal, installCharges, subsidy, taxAmount, totalAmount, status, salesRepId, SEED_BATCH_ID, targetQId]);
      } else {
        await client.query(`
          INSERT INTO quotations (
            id, quotation_number, customer_id, survey_id, system_capacity_kw, package_type,
            hardware_subtotal, installation_charges, subsidy_amount, discount_amount, tax_percent, tax_amount, total_amount,
            status, valid_until, prepared_by_id, is_demo, seed_batch_id
          ) VALUES (
            $1, $2, $3, $4, $5, 'on_grid',
            $6, $7, $8, 0.00, 13.80, $9, $10,
            $11, '2026-04-30', $12, true, $13
          )
          ON CONFLICT (id) DO UPDATE
          SET status = EXCLUDED.status, total_amount = EXCLUDED.total_amount, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [
          targetQId, qNumber, cust.id, surveyId, capKw,
          hardwareSubtotal, installCharges, subsidy, taxAmount, totalAmount,
          status, salesRepId, SEED_BATCH_ID
        ]);
      }

      // Quotation Items
      const qItemId = deterministicUuid('quotation_item', qNumber);
      await client.query(`
        INSERT INTO quotation_items (
          id, quotation_id, product_id, quantity, unit_price, total_price, notes, is_demo, seed_batch_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 'Tier-1 Mono PERC Bifacial Solar PV Modules', true, $7
        )
        ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
      `, [qItemId, targetQId, panelProduct.id, Math.round(capKw * 2), 19000, hardwareSubtotal, SEED_BATCH_ID]);

      quotationIds.push(targetQId);
      quotationRecords.push({ id: targetQId, number: qNumber, custId: cust.id, totalAmount, status });
    }
    console.log(`✅ Seeded ${quotationIds.length} quotations and component items.`);

    // 9. 45 Customer Orders & Items
    console.log('\n--- Seeding 45 Customer Orders & Items ---');
    const orderStatuses = ['confirmed', 'in_progress', 'ready_for_dispatch', 'dispatched', 'installation_scheduled', 'completed', 'completed'];
    const orderRecords: { id: string; number: string; custId: string; totalValue: number; status: string }[] = [];

    for (let i = 1; i <= 45; i++) {
      const orderNumber = `ORD-2026-${String(i).padStart(3, '0')}`;
      const orderId = deterministicUuid('order', orderNumber);
      const q = quotationRecords[i - 1];
      const status = orderStatuses[i % orderStatuses.length];
      const totalVal = q.totalAmount;
      const advancePaid = status === 'confirmed' ? Math.round(totalVal * 0.3) : Math.round(totalVal * 0.9);
      const balance = totalVal - advancePaid;
      const paymentStatus = balance === 0 ? 'paid' : (advancePaid > 0 ? 'partially_paid' : 'unpaid');

      const existingOrder = await client.query('SELECT id FROM orders WHERE order_number = $1', [orderNumber]);
      let targetOrderId = orderId;

      if (existingOrder.rowCount && existingOrder.rowCount > 0) {
        targetOrderId = existingOrder.rows[0].id;
        await client.query(`
          UPDATE orders
          SET quotation_id = $1, customer_id = $2, total_order_value = $3, advance_amount_paid = $4,
              outstanding_balance = $5, order_status = $6, payment_status = $7, is_demo = true, seed_batch_id = $8
          WHERE id = $9
        `, [q.id, q.custId, totalVal, advancePaid, balance, status, paymentStatus, SEED_BATCH_ID, targetOrderId]);
      } else {
        await client.query(`
          INSERT INTO orders (
            id, order_number, quotation_id, customer_id, total_order_value, advance_amount_paid, outstanding_balance,
            order_status, payment_status, order_date, confirmed_date, notes, is_demo, seed_batch_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, '2026-02-15 11:00:00+05:30', '2026-02-16 14:00:00+05:30',
            'Enterprise solar order confirmed. Engineering review complete and components allocated.',
            true, $10
          )
          ON CONFLICT (id) DO UPDATE
          SET order_status = EXCLUDED.order_status, outstanding_balance = EXCLUDED.outstanding_balance, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [targetOrderId, orderNumber, q.id, q.custId, totalVal, advancePaid, balance, status, paymentStatus, SEED_BATCH_ID]);
      }

      // Order Item
      const orderItemId = deterministicUuid('order_item', orderNumber);
      await client.query(`
        INSERT INTO order_items (
          id, order_id, product_id, quantity, unit_price, total_price, is_demo, seed_batch_id
        ) VALUES (
          $1, $2, $3, 10, $4, $5, true, $6
        )
        ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
      `, [orderItemId, targetOrderId, panelProduct.id, Math.round(totalVal / 10), totalVal, SEED_BATCH_ID]);

      orderRecords.push({ id: targetOrderId, number: orderNumber, custId: q.custId, totalValue: totalVal, status });
    }
    console.log(`✅ Seeded ${orderRecords.length} customer orders.`);

    // 10. 35 Project Installations & Crews
    console.log('\n--- Seeding 35 Installations & Crew Assignments ---');
    const installStatuses = ['scheduled', 'in_progress', 'checklist_pending', 'completed', 'completed'];
    const installIds: string[] = [];

    for (let i = 1; i <= 35; i++) {
      const instCode = `INS-2026-${String(i).padStart(3, '0')}`;
      const instId = deterministicUuid('installation', instCode);
      const ord = orderRecords[i - 1];
      const leadTechId = installTechEmployees[i % installTechEmployees.length];
      const status = installStatuses[i % installStatuses.length];
      const capKw = createdCustomers[i - 1].capacityKw;

      const existingInst = await client.query('SELECT id FROM installations WHERE installation_code = $1', [instCode]);
      let targetInstId = instId;

      if (existingInst.rowCount && existingInst.rowCount > 0) {
        targetInstId = existingInst.rows[0].id;
        await client.query(`
          UPDATE installations
          SET order_id = $1, customer_id = $2, system_capacity_kw = $3, status = $4, lead_technician_id = $5, is_demo = true, seed_batch_id = $6
          WHERE id = $7
        `, [ord.id, ord.custId, capKw, status, leadTechId, SEED_BATCH_ID, targetInstId]);
      } else {
        const signedAt = status === 'completed' ? '2026-03-05 16:00:00+05:30' : null;
        await client.query(`
          INSERT INTO installations (
            id, installation_code, order_id, customer_id, system_capacity_kw,
            scheduled_start_date, scheduled_end_date, status, lead_technician_id,
            customer_sign_name, signed_at, notes, is_demo, seed_batch_id
          ) VALUES (
            $1, $2, $3, $4, $5,
            '2026-03-01', '2026-03-05', $6, $7,
            $8, $9,
            'Solar structure erected, modules torqued, inverter synchronized to local grid.',
            true, $10
          )
          ON CONFLICT (id) DO UPDATE
          SET status = EXCLUDED.status, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [
          targetInstId, instCode, ord.id, ord.custId, capKw,
          status, leadTechId,
          status === 'completed' ? 'Customer Verified Signature' : null,
          signedAt,
          SEED_BATCH_ID
        ]);
      }

      // Assign 2 crew members
      const helperTech1 = installTechEmployees[(i + 1) % installTechEmployees.length];
      const helperTech2 = installTechEmployees[(i + 2) % installTechEmployees.length];

      const crewId1 = deterministicUuid('crew', `${instCode}-1`);
      const crewId2 = deterministicUuid('crew', `${instCode}-2`);

      await client.query(`
        INSERT INTO installation_technicians (id, installation_id, employee_id, is_lead, is_demo, seed_batch_id)
        VALUES ($1, $2, $3, false, true, $4)
        ON CONFLICT (id) DO NOTHING;
      `, [crewId1, targetInstId, helperTech1, SEED_BATCH_ID]);

      await client.query(`
        INSERT INTO installation_technicians (id, installation_id, employee_id, is_lead, is_demo, seed_batch_id)
        VALUES ($1, $2, $3, false, true, $4)
        ON CONFLICT (id) DO NOTHING;
      `, [crewId2, targetInstId, helperTech2, SEED_BATCH_ID]);

      installIds.push(targetInstId);
    }
    console.log(`✅ Seeded ${installIds.length} installations and crew allocations.`);

    // 11. 35 Dispatches & Items
    console.log('\n--- Seeding 35 Warehouse Dispatches ---');
    const dispatchIds: string[] = [];

    for (let i = 1; i <= 35; i++) {
      const dispNumber = `DSP-2026-${String(i).padStart(3, '0')}`;
      const dispId = deterministicUuid('dispatch', dispNumber);
      const ord = orderRecords[i - 1];
      const deliveryStatus = i % 4 === 0 ? 'in_transit' : 'delivered';

      const existingDisp = await client.query('SELECT id FROM dispatches WHERE dispatch_number = $1', [dispNumber]);
      let targetDispId = dispId;

      if (existingDisp.rowCount && existingDisp.rowCount > 0) {
        targetDispId = existingDisp.rows[0].id;
        await client.query(`
          UPDATE dispatches SET order_id = $1, customer_id = $2, delivery_status = $3, is_demo = true, seed_batch_id = $4 WHERE id = $5
        `, [ord.id, ord.custId, deliveryStatus, SEED_BATCH_ID, targetDispId]);
      } else {
        await client.query(`
          INSERT INTO dispatches (
            id, dispatch_number, order_id, customer_id, dispatched_date, delivery_personnel_name,
            vehicle_number, delivery_status, is_demo, seed_batch_id
          ) VALUES (
            $1, $2, $3, $4, '2026-02-22 09:30:00+05:30', 'Harishchandra Kudale',
            'MH-12-RN-7844', $5, true, $6
          )
          ON CONFLICT (id) DO UPDATE
          SET delivery_status = EXCLUDED.delivery_status, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [targetDispId, dispNumber, ord.id, ord.custId, deliveryStatus, SEED_BATCH_ID]);
      }

      const dispItemId = deterministicUuid('dispatch_item', dispNumber);
      await client.query(`
        INSERT INTO dispatch_items (
          id, dispatch_id, product_id, quantity, is_demo, seed_batch_id
        ) VALUES (
          $1, $2, $3, 10, true, $4
        )
        ON CONFLICT (id) DO NOTHING;
      `, [dispItemId, targetDispId, panelProduct.id, SEED_BATCH_ID]);

      dispatchIds.push(targetDispId);
    }
    console.log(`✅ Seeded ${dispatchIds.length} dispatches and dispatch line items.`);

    // 12. 30 Invoices & 50 Payments
    console.log('\n--- Seeding 30 Invoices & 50 Payments ---');
    const invoiceIds: string[] = [];

    for (let i = 1; i <= 30; i++) {
      const invNumber = `INV-2026-${String(i).padStart(3, '0')}`;
      const invId = deterministicUuid('invoice', invNumber);
      const ord = orderRecords[i - 1];
      const subtotal = Math.round(ord.totalValue / 1.138);
      const taxAmount = ord.totalValue - subtotal;
      const amountPaid = ord.totalValue;

      const existingInv = await client.query('SELECT id FROM invoices WHERE invoice_number = $1', [invNumber]);
      let targetInvId = invId;

      if (existingInv.rowCount && existingInv.rowCount > 0) {
        targetInvId = existingInv.rows[0].id;
        await client.query(`
          UPDATE invoices SET order_id = $1, customer_id = $2, subtotal = $3, tax_amount = $4, total_amount = $5, amount_paid = $6, is_demo = true, seed_batch_id = $7 WHERE id = $8
        `, [ord.id, ord.custId, subtotal, taxAmount, ord.totalValue, amountPaid, SEED_BATCH_ID, targetInvId]);
      } else {
        await client.query(`
          INSERT INTO invoices (
            id, invoice_number, order_id, customer_id, subtotal, tax_amount, total_amount,
            amount_paid, balance_due, status, issue_date, due_date, is_demo, seed_batch_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, 0.00, 'paid', '2026-02-18', '2026-03-05', true, $9
          )
          ON CONFLICT (id) DO UPDATE
          SET status = EXCLUDED.status, amount_paid = EXCLUDED.amount_paid, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [targetInvId, invNumber, ord.id, ord.custId, subtotal, taxAmount, ord.totalValue, amountPaid, SEED_BATCH_ID]);
      }

      invoiceIds.push(targetInvId);
    }
    console.log(`✅ Seeded ${invoiceIds.length} invoices.`);

    // 50 Payments (Verified by Accountants)
    const paymentMethods = ['Bank Transfer (NEFT)', 'RTGS', 'UPI', 'Cheque'];
    const paymentStages = ['Advance (30%)', 'Material Dispatch (60%)', 'Commissioning (10%)'];
    const paymentIds: string[] = [];

    for (let i = 1; i <= 50; i++) {
      const payNumber = `PAY-2026-${String(i).padStart(3, '0')}`;
      const payId = deterministicUuid('payment', payNumber);
      const ord = orderRecords[(i - 1) % orderRecords.length];
      const accountant = accountantEmployees[i % accountantEmployees.length];
      const stage = paymentStages[i % paymentStages.length];
      const multiplier = i % 3 === 0 ? 0.3 : (i % 3 === 1 ? 0.6 : 0.1);
      const amount = Math.round(ord.totalValue * multiplier);

      const existingPay = await client.query('SELECT id FROM payments WHERE payment_number = $1', [payNumber]);
      let targetPayId = payId;

      if (existingPay.rowCount && existingPay.rowCount > 0) {
        targetPayId = existingPay.rows[0].id;
        await client.query(`
          UPDATE payments
          SET order_id = $1, customer_id = $2, amount = $3, payment_method = $4,
              transaction_reference = $5, payment_stage = $6, verified_by_id = $7, is_demo = true, seed_batch_id = $8
          WHERE id = $9
        `, [ord.id, ord.custId, amount, paymentMethods[i % paymentMethods.length], `UTR-${Date.now()}-${i}`, stage, accountant, SEED_BATCH_ID, targetPayId]);
      } else {
        await client.query(`
          INSERT INTO payments (
            id, payment_number, order_id, customer_id, amount, payment_method,
            transaction_reference, payment_stage, verified_by_id, received_at, is_demo, seed_batch_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, '2026-02-20 15:45:00+05:30', true, $10
          )
          ON CONFLICT (id) DO UPDATE
          SET amount = EXCLUDED.amount, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [
          targetPayId, payNumber, ord.id, ord.custId, amount, paymentMethods[i % paymentMethods.length],
          `UTR-${Date.now()}-${i}`, stage, accountant, SEED_BATCH_ID
        ]);
      }

      paymentIds.push(targetPayId);
    }
    console.log(`✅ Seeded ${paymentIds.length} payments.`);

    // 13. 35 Direct Project Expenses
    console.log('\n--- Seeding 35 Direct Project Expenses ---');
    const expenseCategories = ['Crane & Scaffolding Rental', 'Civil Fabrication & Foundation', 'Freight & Site Transport', 'Electrical Conduit & Cabling', 'Discom Inspection & CEIG Fee'];
    const expenseVendors = ['Shree Industrial Lifting Works', 'Reliable Metal Fabricators', 'City Express Tempo Services', 'Polycab Electrical Wholesalers', 'Electrical Inspectorate Office'];
    const expenseIds: string[] = [];

    for (let i = 1; i <= 35; i++) {
      const expNumber = `EXP-2026-${String(i).padStart(3, '0')}`;
      const expId = deterministicUuid('expense', expNumber);
      const ord = orderRecords[i - 1];
      const accountant = accountantEmployees[i % accountantEmployees.length];
      const catIdx = i % expenseCategories.length;
      const amount = [4500, 7800, 3200, 5600, 12000][i % 5];

      const existingExp = await client.query('SELECT id FROM expenses WHERE expense_number = $1', [expNumber]);
      let targetExpId = expId;

      if (existingExp.rowCount && existingExp.rowCount > 0) {
        targetExpId = existingExp.rows[0].id;
        await client.query(`
          UPDATE expenses SET related_order_id = $1, category = $2, amount = $3, is_demo = true, seed_batch_id = $4 WHERE id = $5
        `, [ord.id, expenseCategories[catIdx], amount, SEED_BATCH_ID, targetExpId]);
      } else {
        await client.query(`
          INSERT INTO expenses (
            id, expense_number, related_order_id, category, amount, vendor_name,
            description, expense_date, recorded_by_id, is_demo, seed_batch_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, '2026-02-25', $8, true, $9
          )
          ON CONFLICT (id) DO UPDATE
          SET amount = EXCLUDED.amount, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [
          targetExpId, expNumber, ord.id, expenseCategories[catIdx], amount, expenseVendors[catIdx],
          `Project operational expense incurred for order ${ord.number}`, accountant, SEED_BATCH_ID
        ]);
      }

      expenseIds.push(targetExpId);
    }
    console.log(`✅ Seeded ${expenseIds.length} direct project expenses.`);

    // 14. 20 Warranty Records & 15 Service Tickets
    console.log('\n--- Seeding 20 Warranty Records & 15 Service Tickets ---');
    for (let i = 1; i <= 20; i++) {
      const ord = orderRecords[i - 1];
      const wId = deterministicUuid('warranty', `WAR-${i}`);
      const sn = `SN-WAA-2026-${String(1000 + i)}`;

      const existingWar = await client.query('SELECT id FROM warranty_records WHERE serial_number = $1', [sn]);
      let targetWId = wId;
      if (existingWar.rowCount && existingWar.rowCount > 0) {
        targetWId = existingWar.rows[0].id;
        await client.query(`
          UPDATE warranty_records
          SET customer_id = $1, order_id = $2, product_id = $3, status = 'active', is_demo = true, seed_batch_id = $4
          WHERE id = $5
        `, [ord.custId, ord.id, panelProduct.id, SEED_BATCH_ID, targetWId]);
      } else {
        await client.query(`
          INSERT INTO warranty_records (
            id, customer_id, order_id, product_id, serial_number, start_date, end_date,
            warranty_duration_years, status, is_demo, seed_batch_id
          ) VALUES (
            $1, $2, $3, $4, $5, '2026-03-01', '2051-03-01', 25, 'active', true, $6
          )
          ON CONFLICT (id) DO UPDATE
          SET status = 'active', is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [targetWId, ord.custId, ord.id, panelProduct.id, sn, SEED_BATCH_ID]);
      }
    }
    console.log('✅ Seeded 20 warranty records.');

    for (let i = 1; i <= 15; i++) {
      const tNumber = `TCK-2026-${String(i).padStart(3, '0')}`;
      const tId = deterministicUuid('service_ticket', tNumber);
      const cust = createdCustomers[i - 1];
      const tech = installTechEmployees[i % installTechEmployees.length];

      const existingTck = await client.query('SELECT id FROM service_tickets WHERE ticket_number = $1', [tNumber]);
      let targetTId = tId;
      if (existingTck.rowCount && existingTck.rowCount > 0) {
        targetTId = existingTck.rows[0].id;
        await client.query(`
          UPDATE service_tickets
          SET customer_id = $1, assigned_technician_id = $2, status = 'open', is_demo = true, seed_batch_id = $3
          WHERE id = $4
        `, [cust.id, tech, SEED_BATCH_ID, targetTId]);
      } else {
        await client.query(`
          INSERT INTO service_tickets (
            id, ticket_number, customer_id, fault_description, priority, assigned_technician_id,
            status, is_under_warranty, reported_at, is_demo, seed_batch_id
          ) VALUES (
            $1, $2, $3, 'Solar inverter Wi-Fi datalogger offline. Routine telemetry inspection required.',
            'medium', $4, 'open', true, NOW(), true, $5
          )
          ON CONFLICT (id) DO UPDATE
          SET status = EXCLUDED.status, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
        `, [targetTId, tNumber, cust.id, tech, SEED_BATCH_ID]);
      }
    }
    console.log('✅ Seeded 15 service complaints.');

    // 15. Operational Delegations (Individual overrides demonstration)
    const del1 = deterministicUuid('delegation', 'DEL-001');
    await client.query(`
      INSERT INTO operational_delegations (
        id, delegation_code, employee_id, employee_name, granted_permission, department_scope,
        authorized_by, justification, effective_from, effective_to, active, is_demo, seed_batch_id
      ) VALUES (
        $1, 'DEL-2026-001', $2, 'Ganesh Shinde', 'inventory.export', 'Supply Chain & Inventory',
        'Vikramaditya Rao (Owner)', 'Auditing and inventory stock report export authorization',
        '2026-01-01', '2026-12-31', true, true, $3
      )
      ON CONFLICT (id) DO UPDATE SET active = true, is_demo = true, seed_batch_id = EXCLUDED.seed_batch_id;
    `, [del1, createdEmployees.find(e => e.code === 'EMP-004')?.id, SEED_BATCH_ID]);
    console.log('✅ Seeded operational delegations.');

    await client.query('COMMIT');
    console.log('\n======================================================');
    console.log('✅ DATABASE TRANSACTION COMMITTED SUCCESSFULLY!');
    console.log(`All records seeded under batch ID: ${SEED_BATCH_ID}`);
    console.log('======================================================');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ SEEDING FAILED - TRANSACTION ROLLED BACK:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
