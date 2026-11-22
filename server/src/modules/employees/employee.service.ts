import { prisma } from '../../db/prisma';
import { INITIAL_SYSTEM_USERS } from '../../db/seed';

export interface EmployeeRecord {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: string;
  hourlyRate: number;
  skills: string[];
  isAvailable: boolean;
  activeJobs: number;
  rating: number;
  status: 'active' | 'on_leave' | 'inactive';
  reportingManagerId?: string;
  reportingManagerName?: string;
  joiningDate?: string;
  address?: string;
  avatarUrl?: string;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
  employeeCount: number;
}

// Canonical departments for SolarOS
export const DEPARTMENTS_DATA: DepartmentRecord[] = [
  { id: 'dept-1', name: 'Sales & Business Development', code: 'SLS', employeeCount: 2 },
  { id: 'dept-2', name: 'Field Operations', code: 'FLD', employeeCount: 5 },
  { id: 'dept-3', name: 'Engineering & Approvals', code: 'ENG', employeeCount: 1 },
  { id: 'dept-4', name: 'Installation & Commissioning', code: 'OPS', employeeCount: 7 },
  { id: 'dept-5', name: 'Warehouse & Supply Chain', code: 'LOG', employeeCount: 2 },
  { id: 'dept-6', name: 'Accounts & Finance', code: 'FIN', employeeCount: 1 },
  { id: 'dept-7', name: 'Client Care & Warranty', code: 'SUP', employeeCount: 1 }
];

// Baseline company employees
export const BASELINE_EMPLOYEES: EmployeeRecord[] = [
  { 
    id: 'emp-1', 
    employeeCode: 'EMP-001', 
    fullName: 'Amit Jadhav', 
    email: 'amit.j@sunpowersolutions.in', 
    phone: '+91 98221 00912', 
    department: 'Installation & Commissioning', 
    designation: 'Senior Installation Engineer & Crew Lead', 
    role: 'install_tech', 
    hourlyRate: 350, 
    skills: ['Grid Synchronization', 'Three-Phase Inverters', 'HT/LT Wiring', 'Earthing Pit Testing'], 
    isAvailable: false, 
    activeJobs: 2, 
    rating: 4.9,
    status: 'active',
    reportingManagerId: 'usr-1',
    reportingManagerName: 'Vikramaditya Rao',
    joiningDate: '2024-03-15',
    address: 'Kothrud, Pune, Maharashtra'
  },
  { 
    id: 'emp-2', 
    employeeCode: 'EMP-002', 
    fullName: 'Vikas Shirole', 
    email: 'vikas.s@sunpowersolutions.in', 
    phone: '+91 98221 00913', 
    department: 'Installation & Commissioning', 
    designation: 'Installation Technician', 
    role: 'install_tech', 
    hourlyRate: 250, 
    skills: ['Structure Mounting', 'DC Cabling', 'Safety Harnessing'], 
    isAvailable: true, 
    activeJobs: 1, 
    rating: 4.7,
    status: 'active',
    reportingManagerId: 'emp-1',
    reportingManagerName: 'Amit Jadhav',
    joiningDate: '2024-06-10',
    address: 'Sinhagad Road, Pune'
  },
  { 
    id: 'emp-3', 
    employeeCode: 'EMP-003', 
    fullName: 'Suresh More', 
    email: 'suresh.m@sunpowersolutions.in', 
    phone: '+91 98221 00914', 
    department: 'Field Operations', 
    designation: 'Chief Survey Specialist', 
    role: 'survey_tech', 
    hourlyRate: 300, 
    skills: ['Shadow Analysis', 'RCC Slab Load Testing', 'AutoCAD Layouts', 'Drone Surveys'], 
    isAvailable: true, 
    activeJobs: 1, 
    rating: 4.8,
    status: 'active',
    reportingManagerId: 'usr-1',
    reportingManagerName: 'Vikramaditya Rao',
    joiningDate: '2024-01-20',
    address: 'Baner, Pune'
  },
  { 
    id: 'emp-4', 
    employeeCode: 'EMP-004', 
    fullName: 'Kiran Desai', 
    email: 'kiran.d@sunpowersolutions.in', 
    phone: '+91 98221 00915', 
    department: 'Installation & Commissioning', 
    designation: 'Electrical Assistant', 
    role: 'install_tech', 
    hourlyRate: 200, 
    skills: ['Conduit Laying', 'AC Distribution Box', 'Earthing Resistance'], 
    isAvailable: true, 
    activeJobs: 0, 
    rating: 4.6,
    status: 'active',
    reportingManagerId: 'emp-1',
    reportingManagerName: 'Amit Jadhav',
    joiningDate: '2024-07-01',
    address: 'Hadapsar, Pune'
  },
  { 
    id: 'emp-5', 
    employeeCode: 'EMP-005', 
    fullName: 'Pooja Kulkarni', 
    email: 'pooja.k@sunpowersolutions.in', 
    phone: '+91 98220 54321', 
    department: 'Sales & Business Development', 
    designation: 'Senior Solar Sales Consultant', 
    role: 'sales_exec', 
    hourlyRate: 400, 
    skills: ['Solar Sizing', 'Government Subsidies', 'Client Negotiations'], 
    isAvailable: true, 
    activeJobs: 3, 
    rating: 5.0,
    status: 'active',
    reportingManagerId: 'usr-1',
    reportingManagerName: 'Vikramaditya Rao',
    joiningDate: '2023-11-01',
    address: 'Shivaji Nagar, Pune'
  },
  { 
    id: 'emp-6', 
    employeeCode: 'EMP-006', 
    fullName: 'Ganesh Shinde', 
    email: 'ganesh.s@sunpowersolutions.in', 
    phone: '+91 98220 98765', 
    department: 'Warehouse & Supply Chain', 
    designation: 'Central Warehouse & Logistics Manager', 
    role: 'warehouse_mgr', 
    hourlyRate: 350, 
    skills: ['Inventory Audit', 'FIFO Valuation', 'Tier-1 Panel Barcoding'], 
    isAvailable: true, 
    activeJobs: 0, 
    rating: 4.9,
    status: 'active',
    reportingManagerId: 'usr-1',
    reportingManagerName: 'Vikramaditya Rao',
    joiningDate: '2023-10-15',
    address: 'Bhosari MIDC, Pune'
  },
  { 
    id: 'emp-7', 
    employeeCode: 'EMP-007', 
    fullName: 'Sneha Deshpande', 
    email: 'sneha.d@sunpowersolutions.in', 
    phone: '+91 98220 33445', 
    department: 'Client Care & Warranty', 
    designation: 'Client Care & Warranty Specialist', 
    role: 'support_exec', 
    hourlyRate: 280, 
    skills: ['Warranty RMA', 'DISCOM Solar Net-Meter Sync', 'Service Ticketing'], 
    isAvailable: true, 
    activeJobs: 2, 
    rating: 4.9,
    status: 'active',
    reportingManagerId: 'usr-1',
    reportingManagerName: 'Vikramaditya Rao',
    joiningDate: '2024-02-15',
    address: 'Aundh, Pune'
  },
  { 
    id: 'emp-8', 
    employeeCode: 'EMP-008', 
    fullName: 'Ramesh Patil', 
    email: 'ramesh.p@sunpowersolutions.in', 
    phone: '+91 98220 66778', 
    department: 'Accounts & Finance', 
    designation: 'Chief Financial Accountant', 
    role: 'accountant', 
    hourlyRate: 450, 
    skills: ['GST Returns', 'Project P&L', 'Payment Gateways', 'Subsidy Disbursement'], 
    isAvailable: true, 
    activeJobs: 0, 
    rating: 4.9,
    status: 'active',
    reportingManagerId: 'usr-1',
    reportingManagerName: 'Vikramaditya Rao',
    joiningDate: '2023-09-01',
    address: 'Model Colony, Pune'
  },
  { 
    id: 'emp-9', 
    employeeCode: 'EMP-009', 
    fullName: 'Nilesh Chavan', 
    email: 'nilesh.c@sunpowersolutions.in', 
    phone: '+91 98221 00916', 
    department: 'Installation & Commissioning', 
    designation: 'Safety & Quality Inspector', 
    role: 'install_tech', 
    hourlyRate: 320, 
    skills: ['OSHA Standards', 'Thermal Imaging', 'Micro-Inverter Testing'], 
    isAvailable: true, 
    activeJobs: 1, 
    rating: 4.8,
    status: 'active',
    reportingManagerId: 'emp-1',
    reportingManagerName: 'Amit Jadhav',
    joiningDate: '2024-04-10',
    address: 'Wakad, Pune'
  },
  { 
    id: 'emp-10', 
    employeeCode: 'EMP-010', 
    fullName: 'Mahesh Thorat', 
    email: 'mahesh.t@sunpowersolutions.in', 
    phone: '+91 98221 00917', 
    department: 'Warehouse & Supply Chain', 
    designation: 'Inventory Dispatch Executive', 
    role: 'warehouse_mgr', 
    hourlyRate: 240, 
    skills: ['ERP Stock Updates', 'Inverter Serialization', 'BOM Picking'], 
    isAvailable: true, 
    activeJobs: 0, 
    rating: 4.7,
    status: 'active',
    reportingManagerId: 'emp-6',
    reportingManagerName: 'Ganesh Shinde',
    joiningDate: '2024-05-01',
    address: 'Chakan, Pune'
  },
  { 
    id: 'emp-11', 
    employeeCode: 'EMP-011', 
    fullName: 'Sachin Gaikwad', 
    email: 'sachin.g@sunpowersolutions.in', 
    phone: '+91 98221 00918', 
    department: 'Field Operations', 
    designation: 'Junior Site Surveyor', 
    role: 'survey_tech', 
    hourlyRate: 220, 
    skills: ['Terrace Measurement', 'Shadow Profiling', 'Site Photos'], 
    isAvailable: true, 
    activeJobs: 1, 
    rating: 4.6,
    status: 'active',
    reportingManagerId: 'emp-3',
    reportingManagerName: 'Suresh More',
    joiningDate: '2024-08-01',
    address: 'Pimpri, Pune'
  },
  { 
    id: 'emp-12', 
    employeeCode: 'EMP-012', 
    fullName: 'Tanvi Joshi', 
    email: 'tanvi.j@sunpowersolutions.in', 
    phone: '+91 98220 77889', 
    department: 'Sales & Business Development', 
    designation: 'Solar Sales Associate', 
    role: 'sales_exec', 
    hourlyRate: 280, 
    skills: ['Lead Qualification', 'CRM Management', 'Follow-up Cadence'], 
    isAvailable: true, 
    activeJobs: 2, 
    rating: 4.7,
    status: 'active',
    reportingManagerId: 'emp-5',
    reportingManagerName: 'Pooja Kulkarni',
    joiningDate: '2024-06-15',
    address: 'Kalyani Nagar, Pune'
  },
  { 
    id: 'emp-13', 
    employeeCode: 'EMP-013', 
    fullName: 'Prashant Mohite', 
    email: 'prashant.m@sunpowersolutions.in', 
    phone: '+91 98221 00919', 
    department: 'Installation & Commissioning', 
    designation: 'Mounting Specialist', 
    role: 'install_tech', 
    hourlyRate: 230, 
    skills: ['Elevated Superstructure', 'GI Channel Bolting', 'Waterproofing'], 
    isAvailable: true, 
    activeJobs: 1, 
    rating: 4.6,
    status: 'on_leave',
    reportingManagerId: 'emp-1',
    reportingManagerName: 'Amit Jadhav',
    joiningDate: '2024-07-20',
    address: 'Dhayari, Pune'
  },
  { 
    id: 'emp-14', 
    employeeCode: 'EMP-014', 
    fullName: 'Deepak Salunkhe', 
    email: 'deepak.s@sunpowersolutions.in', 
    phone: '+91 98221 00920', 
    department: 'Installation & Commissioning', 
    designation: 'Inverter Wiring Specialist', 
    role: 'install_tech', 
    hourlyRate: 290, 
    skills: ['ACDB/DCDB Dressing', 'Surge Protection Devices', 'Grid Handover'], 
    isAvailable: true, 
    activeJobs: 0, 
    rating: 4.8,
    status: 'active',
    reportingManagerId: 'emp-1',
    reportingManagerName: 'Amit Jadhav',
    joiningDate: '2024-05-15',
    address: 'Katraj, Pune'
  },
  { 
    id: 'emp-15', 
    employeeCode: 'EMP-015', 
    fullName: 'Aditi Gokhale', 
    email: 'aditi.g@sunpowersolutions.in', 
    phone: '+91 98220 88990', 
    department: 'Field Operations', 
    designation: 'Solar Sizing & 3D Drone Modeler', 
    role: 'survey_tech', 
    hourlyRate: 310, 
    skills: ['PVSyst Modeling', 'Drone Photogrammetry', 'Feeder Calculations'], 
    isAvailable: true, 
    activeJobs: 1, 
    rating: 4.9,
    status: 'active',
    reportingManagerId: 'emp-3',
    reportingManagerName: 'Suresh More',
    joiningDate: '2024-03-01',
    address: 'Kothrud, Pune'
  },
  { 
    id: 'emp-16', 
    employeeCode: 'EMP-016', 
    fullName: 'Rohit Mane', 
    email: 'rohit.m@sunpowersolutions.in', 
    phone: '+91 98221 00921', 
    department: 'Field Operations', 
    designation: 'Field Survey Specialist', 
    role: 'survey_tech', 
    hourlyRate: 270, 
    skills: ['Azimuth Verification', 'Roof Load Testing', 'Shadow Analysis'], 
    isAvailable: true, 
    activeJobs: 2, 
    rating: 4.7,
    status: 'active',
    reportingManagerId: 'emp-3',
    reportingManagerName: 'Suresh More',
    joiningDate: '2024-04-01',
    address: 'Bibwewadi, Pune'
  },
  { 
    id: 'emp-17', 
    employeeCode: 'EMP-017', 
    fullName: 'Chetan Bhagat', 
    email: 'chetan.b@sunpowersolutions.in', 
    phone: '+91 98221 00922', 
    department: 'Field Operations', 
    designation: 'Site Measurement Associate', 
    role: 'survey_tech', 
    hourlyRate: 240, 
    skills: ['Terrace Dimensioning', 'Obstacle Mapping', 'Customer Site Orientation'], 
    isAvailable: true, 
    activeJobs: 0, 
    rating: 4.5,
    status: 'on_leave',
    reportingManagerId: 'emp-3',
    reportingManagerName: 'Suresh More',
    joiningDate: '2024-07-15',
    address: 'Warje, Pune'
  },
  { 
    id: 'emp-18', 
    employeeCode: 'EMP-018', 
    fullName: 'Aniket Jagtap', 
    email: 'aniket.j@sunpowersolutions.in', 
    phone: '+91 98221 00923', 
    department: 'Installation & Commissioning', 
    designation: 'Apprentice Installer', 
    role: 'install_tech', 
    hourlyRate: 180, 
    skills: ['Module Unboxing', 'Rail Alignment', 'Tool Calibration'], 
    isAvailable: false, 
    activeJobs: 0, 
    rating: 4.2,
    status: 'inactive',
    reportingManagerId: 'emp-1',
    reportingManagerName: 'Amit Jadhav',
    joiningDate: '2024-08-10',
    address: 'Narhe, Pune'
  },
  { 
    id: 'emp-19', 
    employeeCode: 'EMP-019', 
    fullName: 'Sandeep Patil', 
    email: 'sandeep.p@sunpowersolutions.in', 
    phone: '+91 98220 99001', 
    department: 'Engineering & Approvals', 
    designation: 'Lead Solar Design & Approvals Engineer', 
    role: 'engineering_lead', 
    hourlyRate: 480, 
    skills: ['Single Line Diagrams', 'DISCOM Approvals', 'Feeder Net-Metering Validation'], 
    isAvailable: true, 
    activeJobs: 2, 
    rating: 4.9,
    status: 'active',
    reportingManagerId: 'usr-1',
    reportingManagerName: 'Vikramaditya Rao',
    joiningDate: '2023-12-01',
    address: 'Prabhat Road, Pune'
  }
];

export class EmployeeService {
  /**
   * Helper to normalize department names for matching
   */
  matchesDept(employeeDept: string, targetDept: string): boolean {
    if (!targetDept || targetDept.toLowerCase() === 'all') return true;
    const cleanEmp = employeeDept.toLowerCase().trim();
    const cleanTarget = targetDept.toLowerCase().trim();

    if (cleanEmp === cleanTarget) return true;
    if (cleanEmp.includes(cleanTarget) || cleanTarget.includes(cleanEmp)) return true;

    // Check abbreviation / code aliases
    if ((cleanTarget.includes('sales') || cleanTarget === 'sls') && cleanEmp.includes('sales')) return true;
    if ((cleanTarget.includes('field') || cleanTarget === 'fld') && cleanEmp.includes('field')) return true;
    if ((cleanTarget.includes('eng') || cleanTarget === 'eng') && cleanEmp.includes('eng')) return true;
    if ((cleanTarget.includes('install') || cleanTarget.includes('ops') || cleanTarget === 'ops') && (cleanEmp.includes('install') || cleanEmp.includes('ops'))) return true;
    if ((cleanTarget.includes('warehouse') || cleanTarget.includes('supply') || cleanTarget.includes('log') || cleanTarget === 'log') && (cleanEmp.includes('warehouse') || cleanEmp.includes('supply') || cleanEmp.includes('inventory'))) return true;
    if ((cleanTarget.includes('account') || cleanTarget.includes('fin') || cleanTarget === 'fin') && (cleanEmp.includes('account') || cleanEmp.includes('fin'))) return true;
    if ((cleanTarget.includes('support') || cleanTarget.includes('warrant') || cleanTarget === 'sup') && (cleanEmp.includes('care') || cleanEmp.includes('warrant') || cleanEmp.includes('support') || cleanEmp.includes('service'))) return true;

    return false;
  }

  /**
   * Returns list of authorized departments for the user
   */
  async getAuthorizedDepartments(user: any): Promise<DepartmentRecord[]> {
    if (!user) return [];

    // Owner / Administrator or users with company-wide / workforce authority can view all departments
    const isCompanyWide = 
      user.role === 'owner_admin' || 
      user.role === 'admin' ||
      user.roleTitle?.toLowerCase().includes('managing director') ||
      user.roleTitle?.toLowerCase().includes('owner');

    if (isCompanyWide) {
      return DEPARTMENTS_DATA;
    }

    // Otherwise, restrict to the user's authorized department scope
    const userDept = user.department || '';
    const scopedDepts = DEPARTMENTS_DATA.filter(d => 
      this.matchesDept(d.name, userDept) || this.matchesDept(userDept, d.name)
    );

    // If user's specific department is matched, return it; otherwise fallback to their department as custom record
    if (scopedDepts.length > 0) {
      return scopedDepts;
    }

    return [{
      id: `dept-user`,
      name: userDept || 'Assigned Department',
      code: user.role?.substring(0, 3).toUpperCase() || 'USR',
      employeeCount: 1
    }];
  }

  /**
   * Search employees with server-side filtering, authorization scoping, and pagination
   */
  async searchEmployees(
    user: any,
    params: {
      department?: string;
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    employees: EmployeeRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const search = (params.search || '').trim().toLowerCase();
    const department = (params.department || '').trim();
    const status = (params.status || 'all').toLowerCase();

    // 1. Determine department authorization scope
    const authorizedDepartments = await this.getAuthorizedDepartments(user);
    const authorizedDeptNames = authorizedDepartments.map(d => d.name);

    // Check if user is restricted to a subset of departments
    const isCompanyWide = 
      user.role === 'owner_admin' || 
      user.role === 'admin' ||
      user.roleTitle?.toLowerCase().includes('managing director') ||
      user.roleTitle?.toLowerCase().includes('owner');

    let pool: EmployeeRecord[] = [...BASELINE_EMPLOYEES];

    // Try reading from Prisma PostgreSQL database first if available
    try {
      const dbEmployees = await prisma.employee.findMany({
        include: { profile: true }
      });
      if (dbEmployees.length > 0) {
        pool = dbEmployees.map(e => ({
          id: e.id,
          employeeCode: e.employeeCode,
          fullName: `${e.firstName} ${e.lastName}`.trim(),
          email: e.email,
          phone: e.phone,
          department: e.department,
          designation: e.designation,
          role: e.roleId,
          hourlyRate: Number(e.hourlyRate) || 0,
          skills: e.skills || [],
          isAvailable: e.isAvailable,
          activeJobs: e.currentAssignedJobs,
          rating: 4.8,
          status: 'active' as const,
          avatarUrl: e.profile?.avatarUrl || undefined
        }));
      }
    } catch {
      // Prisma offline: smoothly fall back to BASELINE_EMPLOYEES
    }

    // Filter by User Authorization Scope (Never return employees user is unauthorized to view)
    if (!isCompanyWide) {
      pool = pool.filter(emp => 
        authorizedDeptNames.some(deptName => this.matchesDept(emp.department, deptName))
      );
    }

    // Filter by Selected Department (if provided and not 'all')
    if (department && department.toLowerCase() !== 'all') {
      pool = pool.filter(emp => this.matchesDept(emp.department, department));
    }

    // Filter by Search Query (name, employeeCode, email, designation)
    if (search.length >= 2) {
      pool = pool.filter(emp => {
        const matchesName = emp.fullName.toLowerCase().includes(search);
        const matchesCode = emp.employeeCode.toLowerCase().includes(search);
        const matchesEmail = emp.email.toLowerCase().includes(search);
        const matchesDesig = emp.designation.toLowerCase().includes(search);
        return matchesName || matchesCode || matchesEmail || matchesDesig;
      });
    }

    // Filter by Employment Status
    if (status && status !== 'all') {
      pool = pool.filter(emp => (emp.status || 'active').toLowerCase() === status);
    }

    // Calculate Pagination
    const total = pool.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedEmployees = pool.slice(offset, offset + limit);

    return {
      employees: paginatedEmployees,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async createEmployee(user: any, data: Partial<EmployeeRecord>): Promise<EmployeeRecord> {
    const employeeCode = data.employeeCode || `EMP-${String(BASELINE_EMPLOYEES.length + 1).padStart(3, '0')}`;
    
    try {
      const created = await prisma.employee.create({
        data: {
          employeeCode,
          firstName: data.fullName?.split(' ')[0] || '',
          lastName: data.fullName?.split(' ').slice(1).join(' ') || '',
          email: data.email,
          phone: data.phone,
          department: data.department,
          designation: data.designation,
          roleId: data.role,
          hourlyRate: data.hourlyRate || 0,
          skills: data.skills || [],
          isAvailable: data.isAvailable ?? true,
          currentAssignedJobs: data.activeJobs || 0,
          hireDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
          profile: data.avatarUrl ? {
            create: {
              fullName: data.fullName || '',
              email: data.email,
              roleId: data.role,
              department: data.department,
              avatarUrl: data.avatarUrl,
              isActive: true
            }
          } : undefined
        },
        include: { profile: true }
      });

      return {
        id: created.id,
        employeeCode: created.employeeCode,
        fullName: `${created.firstName} ${created.lastName}`.trim(),
        email: created.email,
        phone: created.phone,
        department: created.department,
        designation: created.designation,
        role: created.roleId,
        hourlyRate: Number(created.hourlyRate) || 0,
        skills: created.skills || [],
        isAvailable: created.isAvailable,
        activeJobs: created.currentAssignedJobs,
        rating: 4.8,
        status: 'active' as const,
        avatarUrl: created.profile?.avatarUrl
      };
    } catch (err) {
      console.error('Failed to create employee in DB:', err);
      // Fallback to in-memory
      const newEmp: EmployeeRecord = {
        id: `emp-${Date.now()}`,
        employeeCode,
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        department: data.department || 'Installation & Commissioning',
        designation: data.designation || '',
        role: data.role || 'install_tech',
        hourlyRate: data.hourlyRate || 250,
        skills: data.skills || [],
        isAvailable: data.isAvailable ?? true,
        activeJobs: data.activeJobs || 0,
        rating: 4.8,
        status: 'active',
        joiningDate: new Date().toISOString().split('T')[0],
        reportingManagerId: 'usr-1',
        reportingManagerName: 'Vikramaditya Rao'
      };
      BASELINE_EMPLOYEES.push(newEmp);
      return newEmp;
    }
  }

  async updateEmployee(id: string, data: Partial<EmployeeRecord>): Promise<EmployeeRecord | null> {
    try {
      const updated = await prisma.employee.update({
        where: { id },
        data: {
          employeeCode: data.employeeCode,
          firstName: data.fullName?.split(' ')[0],
          lastName: data.fullName?.split(' ').slice(1).join(' '),
          email: data.email,
          phone: data.phone,
          department: data.department,
          designation: data.designation,
          roleId: data.role,
          hourlyRate: data.hourlyRate,
          skills: data.skills,
          isAvailable: data.isAvailable,
          currentAssignedJobs: data.activeJobs,
        },
        include: { profile: true }
      });

      return {
        id: updated.id,
        employeeCode: updated.employeeCode,
        fullName: `${updated.firstName} ${updated.lastName}`.trim(),
        email: updated.email,
        phone: updated.phone,
        department: updated.department,
        designation: updated.designation,
        role: updated.roleId,
        hourlyRate: Number(updated.hourlyRate) || 0,
        skills: updated.skills || [],
        isAvailable: updated.isAvailable,
        activeJobs: updated.currentAssignedJobs,
        rating: 4.8,
        status: 'active' as const,
        avatarUrl: updated.profile?.avatarUrl
      };
    } catch (err) {
      console.error('Failed to update employee in DB:', err);
      // Fallback to in-memory
      const idx = BASELINE_EMPLOYEES.findIndex(e => e.id === id);
      if (idx >= 0) {
        BASELINE_EMPLOYEES[idx] = { ...BASELINE_EMPLOYEES[idx], ...data };
        return BASELINE_EMPLOYEES[idx];
      }
      return null;
    }
  }

  async deleteEmployee(id: string): Promise<boolean> {
    try {
      await prisma.employee.delete({ where: { id } });
      return true;
    } catch (err) {
      console.error('Failed to delete employee from DB:', err);
      // Fallback to in-memory
      const idx = BASELINE_EMPLOYEES.findIndex(e => e.id === id);
      if (idx >= 0) {
        BASELINE_EMPLOYEES.splice(idx, 1);
        return true;
      }
      return false;
    }
  }
}

export const employeeService = new EmployeeService();