import crypto from 'crypto';
import { prisma, pool as dbPool } from '../../db/prisma';
import { hashPassword } from '../../utils/password';
import { AppError } from '../../utils/response';
import { auditService } from '../audit/audit.service';
import { ROLE_DEFINITIONS, UserRole } from '../../config/constants';

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
  temporaryPassword?: string;
  team?: string;
  teamName?: string;
  workLocation?: string;
  employmentType?: string;
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  employee_code?: string;
  full_name?: string;
  firstName?: string;
  lastName?: string;
  role_id?: string;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
  employeeCount: number;
}

export const DEPARTMENT_CODES: Record<string, string> = {
  'Executive Management': 'EXE',
  'Sales & Business Development': 'SLS',
  'Field Engineering & Surveys': 'FLD',
  'Engineering & Approvals': 'ENG',
  'Operations & Installations': 'OPS',
  'Supply Chain & Inventory': 'SCM',
  'Finance & Compliance': 'FIN',
  'After-Sales & Customer Service': 'SUP'
};

export const DEPARTMENT_TEAMS: Record<string, string[]> = {
  'Executive Management': ['Executive Board', 'Corporate Strategy', 'Internal Audit'],
  'Sales & Business Development': ['Residential Solar Sales', 'Commercial & Industrial Sales', 'Inside Sales & Pre-Sales', 'Government Tenders'],
  'Field Engineering & Surveys': ['Technical Site Survey Crew 1', 'Technical Site Survey Crew 2', 'Shadow & Feasibility Analysis', 'Rapid Assessment Team'],
  'Engineering & Approvals': ['Solar System Design & Simulation', 'CEIG & Electrical Approvals', 'DISCOM Net-Metering Liaison', 'Structural & Mounting Analysis'],
  'Operations & Installations': ['Installation Crew Alpha (Rooftop)', 'Installation Crew Beta (Commercial)', 'Commissioning & Testing', 'Quality & Safety Inspection'],
  'Supply Chain & Inventory': ['Central Warehouse Operations', 'Procurement & Vendor Relations', 'Fleet & Dispatch Logistics', 'Inventory Quality Control'],
  'Finance & Compliance': ['Accounts Receivable & Billing', 'Accounts Payable & Expenses', 'Tax & GST Compliance', 'Financial Audit & Reporting'],
  'After-Sales & Customer Service': ['Rooftop Maintenance & AMC', 'Warranty & RMA Support', 'Customer Care & Ticketing', 'Field Repair Dispatch']
};

const VALID_ROLES = [
  'owner_admin',
  'sales_exec',
  'survey_tech',
  'engineering_lead',
  'warehouse_mgr',
  'install_tech',
  'support_exec',
  'accountant'
];

export class EmployeeService {
  matchesDept(employeeDept: string, targetDept: string): boolean {
    if (!targetDept || targetDept.toLowerCase() === 'all') return true;
    if (!employeeDept) return false;
    const cleanEmp = employeeDept.toLowerCase().trim();
    const cleanTarget = targetDept.toLowerCase().trim();

    if (cleanEmp === cleanTarget) return true;
    if (cleanEmp.includes(cleanTarget) || cleanTarget.includes(cleanEmp)) return true;

    if ((cleanTarget.includes('sales') || cleanTarget === 'sls') && cleanEmp.includes('sales')) return true;
    if ((cleanTarget.includes('field') || cleanTarget === 'fld') && cleanEmp.includes('field')) return true;
    if ((cleanTarget.includes('eng') || cleanTarget === 'eng') && cleanEmp.includes('eng')) return true;
    if ((cleanTarget.includes('install') || cleanTarget.includes('ops') || cleanTarget === 'ops') && (cleanEmp.includes('install') || cleanEmp.includes('ops'))) return true;
    if ((cleanTarget.includes('warehouse') || cleanTarget.includes('supply') || cleanTarget.includes('log') || cleanTarget === 'log') && (cleanEmp.includes('warehouse') || cleanEmp.includes('supply') || cleanEmp.includes('inventory'))) return true;
    if ((cleanTarget.includes('account') || cleanTarget.includes('fin') || cleanTarget === 'fin') && (cleanEmp.includes('account') || cleanEmp.includes('fin'))) return true;
    if ((cleanTarget.includes('support') || cleanTarget.includes('warrant') || cleanTarget === 'sup') && (cleanEmp.includes('care') || cleanEmp.includes('warrant') || cleanEmp.includes('support') || cleanEmp.includes('service'))) return true;

    return false;
  }

  private isCompanyWide(user: any): boolean {
    return Boolean(
      user &&
      (user.role === 'owner_admin' ||
        user.role === 'admin' ||
        user.roleTitle?.toLowerCase().includes('managing director') ||
        user.roleTitle?.toLowerCase().includes('owner'))
    );
  }

  private departmentCode(name: string): string {
    if (DEPARTMENT_CODES[name]) return DEPARTMENT_CODES[name];
    const initials = name
      .replace(/[^a-zA-Z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
    return initials || 'DEP';
  }

  private mapEmployee(employee: any): EmployeeRecord {
    const isActive = employee.profile ? employee.profile.isActive !== false : true;
    let status: EmployeeRecord['status'] = 'active';
    if (!isActive) status = 'inactive';
    else if (!employee.isAvailable) status = 'on_leave';

    const emergencyContact = (employee.emergency_contact_name || employee.emergencyContactName) ? {
      name: employee.emergency_contact_name || employee.emergencyContactName,
      relation: employee.emergency_contact_relation || employee.emergencyContactRelation,
      phone: employee.emergency_contact_phone || employee.emergencyContactPhone
    } : undefined;

    return {
      id: employee.id,
      employeeCode: employee.employeeCode || employee.employee_code,
      employee_code: employee.employeeCode || employee.employee_code,
      fullName: `${employee.firstName || employee.first_name || ''} ${employee.lastName || employee.last_name || ''}`.trim(),
      full_name: `${employee.firstName || employee.first_name || ''} ${employee.lastName || employee.last_name || ''}`.trim(),
      firstName: employee.firstName || employee.first_name,
      lastName: employee.lastName || employee.last_name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      role: employee.roleId || employee.role_id,
      role_id: employee.roleId || employee.role_id,
      hourlyRate: Number(employee.hourlyRate ?? employee.hourly_rate ?? 0),
      skills: Array.isArray(employee.skills) ? employee.skills : [],
      isAvailable: employee.isAvailable ?? employee.is_available ?? true,
      activeJobs: employee.currentAssignedJobs ?? employee.current_assigned_jobs ?? 0,
      rating: 4.8,
      status,
      team: employee.team,
      teamName: employee.team,
      reportingManagerId: employee.reporting_manager_id || employee.reportingManagerId,
      reportingManagerName: employee.reporting_manager_name || employee.reportingManagerName,
      address: employee.address,
      workLocation: employee.work_location || employee.workLocation || 'Pune Central HQ',
      employmentType: employee.employment_type || employee.employmentType || 'full_time',
      emergencyContact,
      avatarUrl: employee.profile?.avatarUrl || undefined,
      joiningDate: employee.hireDate ? (employee.hireDate instanceof Date ? employee.hireDate.toISOString().split('T')[0] : String(employee.hireDate).split('T')[0]) : (employee.hire_date ? String(employee.hire_date).split('T')[0] : undefined)
    };
  }

  async getAuthorizedDepartments(user: any): Promise<DepartmentRecord[]> {
    if (!user) return [];

    let allDepartments: DepartmentRecord[];
    try {
      const result = await dbPool.query(
        `SELECT department, COUNT(*)::int AS employee_count
         FROM employees
         GROUP BY department
         ORDER BY department ASC`
      );
      allDepartments = result.rows.map((row: any, index: number) => ({
        id: `dept-${index + 1}`,
        name: row.department,
        code: this.departmentCode(row.department),
        employeeCount: Number(row.employee_count) || 0
      }));
    } catch (err) {
      console.error('Failed to load departments from database:', err);
      throw new AppError(503, 'DATABASE_UNAVAILABLE', 'Department data is temporarily unavailable.');
    }

    if (this.isCompanyWide(user)) return allDepartments;

    const userDept = user.department || '';
    const scoped = allDepartments.filter(
      dept => this.matchesDept(dept.name, userDept) || this.matchesDept(userDept, dept.name)
    );
    if (scoped.length > 0) return scoped;

    return userDept
      ? [{ id: 'dept-scoped', name: userDept, code: 'USR', employeeCount: 0 }]
      : [];
  }

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
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(500, Number(params.limit) || 20));
    const search = (params.search || '').trim();
    const department = (params.department || '').trim();
    const status = (params.status || 'all').toLowerCase();

    const conditions: any[] = [];

    if (!this.isCompanyWide(user)) {
      const authorized = await this.getAuthorizedDepartments(user);
      if (authorized.length === 0) {
        return { employees: [], pagination: { page, limit, total: 0, totalPages: 1 } };
      }
      conditions.push({ department: { in: authorized.map(dept => dept.name) } });
    }

    if (department && department.toLowerCase() !== 'all') {
      conditions.push({ department: { equals: department, mode: 'insensitive' } });
    }

    if (search.length >= 2) {
      conditions.push({
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { employeeCode: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { designation: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    const activeProfileCondition = {
      OR: [{ profile: { is: { isActive: true } } }, { profileId: null }]
    };

    if (status === 'inactive') {
      conditions.push({ profile: { is: { isActive: false } } });
    } else if (status === 'on_leave') {
      conditions.push({ isAvailable: false, ...activeProfileCondition });
    } else if (status === 'active') {
      conditions.push({ isAvailable: true, ...activeProfileCondition });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    try {
      const [total, employees] = await Promise.all([
        prisma.employee.count({ where }),
        prisma.employee.findMany({
          where,
          include: { profile: true },
          orderBy: { employeeCode: 'asc' },
          skip: (page - 1) * limit,
          take: limit
        })
      ]);

      return {
        employees: employees.map(employee => this.mapEmployee(employee)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1
        }
      };
    } catch (err) {
      console.error('Failed to query employees from database:', err);
      throw new AppError(503, 'DATABASE_UNAVAILABLE', 'Employee directory is temporarily unavailable.');
    }
  }

  async getEmployeeById(id: string): Promise<EmployeeRecord | null> {
    try {
      const res = await dbPool.query(`
        SELECT e.*, p.is_active, p.avatar_url, p.role_title
        FROM employees e
        LEFT JOIN profiles p ON p.id = e.profile_id
        WHERE e.id::text = $1 OR LOWER(e.employee_code) = LOWER($1)
        LIMIT 1
      `, [id]);
      if (res.rows.length === 0) return null;
      return this.mapEmployee(res.rows[0]);
    } catch (err) {
      console.warn('Failed to get employee by id from PostgreSQL:', err);
      return null;
    }
  }

  async createEmployee(user: any, data: Partial<EmployeeRecord> & { temporaryPassword?: string; emergencyContact?: any; team?: string; workLocation?: string; employmentType?: string; address?: string }): Promise<any> {
    const fullName = (data.fullName || '').trim();
    if (!fullName || fullName.length < 2) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Full Legal Name is required (minimum 2 characters).');
    }

    const employeeCode = (data.employeeCode || '').trim();
    if (!employeeCode || employeeCode.length < 3) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Employee Code is required (e.g. EMP-062).');
    }

    const email = (data.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new AppError(422, 'VALIDATION_ERROR', 'A valid corporate or personal email address is required.');
    }

    const phone = (data.phone || '').trim();
    if (!phone || phone.replace(/\D/g, '').length < 8) {
      throw new AppError(422, 'VALIDATION_ERROR', 'A valid contact phone number is required (at least 8 digits).');
    }

    const department = (data.department || '').trim();
    if (!department) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Department selection is mandatory.');
    }

    const designation = (data.designation || '').trim();
    if (!designation) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Designation / job title is required.');
    }

    const roleId = (data.role || '').trim();
    if (!roleId || !VALID_ROLES.includes(roleId)) {
      throw new AppError(422, 'VALIDATION_ERROR', `Invalid role '${roleId}'. Must be one of canonical roles: ${VALID_ROLES.join(', ')}`);
    }

    const hourlyRate = Number(data.hourlyRate) || 0;
    if (hourlyRate < 0) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Hourly billing rate cannot be negative.');
    }

    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts.shift() || fullName;
    const lastName = nameParts.join(' ') || firstName;

    const rawSkills: any = (data as any).skills;
    const skills: string[] = Array.isArray(rawSkills)
      ? rawSkills.map((skill: any) => String(skill).trim()).filter(Boolean)
      : typeof rawSkills === 'string'
        ? rawSkills.split(',').map((skill: string) => skill.trim()).filter(Boolean)
        : [];

    const hireDate = data.joiningDate ? new Date(data.joiningDate) : new Date();
    if (Number.isNaN(hireDate.getTime())) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Joining date is invalid.');
    }

    const temporaryPassword = data.temporaryPassword || crypto.randomBytes(6).toString('base64url') + 'A1!';
    const passwordHash = await hashPassword(temporaryPassword);

    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');

      const codeCheck = await client.query(
        'SELECT id FROM employees WHERE LOWER(employee_code) = LOWER($1)',
        [employeeCode]
      );
      if (codeCheck.rowCount && codeCheck.rowCount > 0) {
        throw new AppError(409, 'DUPLICATE_EMPLOYEE_CODE', `Employee code '${employeeCode}' is already registered to another employee.`);
      }

      const emailCheck = await client.query(
        'SELECT id FROM employees WHERE LOWER(email) = $1 UNION SELECT id FROM profiles WHERE LOWER(email) = $1',
        [email]
      );
      if (emailCheck.rowCount && emailCheck.rowCount > 0) {
        throw new AppError(409, 'DUPLICATE_EMAIL', `Email address '${email}' is already registered to an existing account.`);
      }

      const profileResult = await client.query(
        `INSERT INTO profiles (
          auth_user_id, full_name, email, phone, role_id, role_title, department,
          password_hash, is_active, email_verified, created_at, updated_at
        ) VALUES (
          NULL, $1, $2, $3, $4, $5, $6, $7, true, false, NOW(), NOW()
        ) RETURNING id`,
        [fullName, email, phone, roleId, designation, department, passwordHash]
      );
      const profileId = profileResult.rows[0].id;

      const employeeResult = await client.query(
        `INSERT INTO employees (
          profile_id, employee_code, first_name, last_name, email, phone,
          department, designation, role_id, hourly_rate, skills, is_available,
          current_assigned_jobs, hire_date, team, work_location, employment_type,
          address, emergency_contact_name, emergency_contact_relation, emergency_contact_phone,
          created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, 0, $12, $13, $14, $15, $16, $17, $18, $19, NOW()
        ) RETURNING id, employee_code, first_name, last_name, email, phone,
          department, designation, role_id, hourly_rate, skills, is_available,
          current_assigned_jobs, hire_date, created_at`,
        [
          profileId, employeeCode, firstName, lastName, email, phone,
          department, designation, roleId, hourlyRate, skills, hireDate,
          data.team || null,
          data.workLocation || 'Pune Central HQ',
          data.employmentType || 'full_time',
          data.address || null,
          data.emergencyContact?.name || null,
          data.emergencyContact?.relation || null,
          data.emergencyContact?.phone || null
        ]
      );

      const created = employeeResult.rows[0];

      // Add baseline onboarding career record
      await client.query(`
        INSERT INTO employee_career_history (
          employee_id, event_type, new_designation, new_department, new_team,
          new_role_id, new_hourly_rate, effective_date, authorized_by_id, authorized_by_name,
          reason, notes, created_at
        ) VALUES ($1, 'hire', $2, $3, $4, $5, $6, $7, $8, $9, 'Initial Onboarding', 'Employee registration baseline', NOW())
      `, [
        created.id,
        designation,
        department,
        data.team || null,
        roleId,
        hourlyRate,
        hireDate,
        user?.id || 'usr-1',
        user?.name || 'Managing Director'
      ]);

      await client.query('COMMIT');

      try {
        await auditService.record({
          actorId: user?.id || 'usr-1',
          actorName: user?.name || 'Managing Director',
          actorRole: user?.role || 'owner_admin',
          action: 'EMPLOYEE_CREATED',
          entity: 'Employee',
          entityId: created.id,
          reason: `Registered new employee ${fullName} (${employeeCode}) into ${department}`
        });
      } catch (auditError) {
        console.warn('Employee created but audit log failed:', auditError);
      }

      return {
        id: created.id,
        employeeCode: created.employee_code,
        employee_code: created.employee_code,
        fullName,
        full_name: fullName,
        firstName,
        lastName,
        email,
        phone,
        department,
        team: data.team,
        designation,
        role: roleId,
        role_id: roleId,
        hourlyRate,
        skills: created.skills || skills,
        status: 'active' as const,
        isAvailable: true,
        activeJobs: 0,
        rating: 5.0,
        temporaryPassword
      };
    } catch (err: any) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback errors
      }
      if (err instanceof AppError) throw err;
      if (err?.code === '23505') {
        throw new AppError(409, 'DUPLICATE_RECORD', 'An employee with this code or email already exists.');
      }
      console.error('Error inserting employee in PostgreSQL:', err);
      throw new AppError(500, 'DATABASE_ERROR', 'Employee registration could not be completed.');
    } finally {
      client.release();
    }
  }

  async updateEmployee(id: string, data: Partial<EmployeeRecord> & { password?: string; emergencyContact?: any; team?: string; workLocation?: string; employmentType?: string; address?: string }, actor?: any): Promise<EmployeeRecord | null> {
    const existing = await prisma.employee.findUnique({
      where: { id },
      include: { profile: true }
    });
    if (!existing) return null;

    const incomingStatus = (data as any).status as EmployeeRecord['status'] | undefined;
    const isActive = incomingStatus
      ? incomingStatus !== 'inactive'
      : existing.profile?.isActive ?? true;

    let isAvailable = existing.isAvailable;
    if (data.isAvailable !== undefined) isAvailable = data.isAvailable;
    else if (incomingStatus === 'active') isAvailable = true;
    else if (incomingStatus === 'on_leave' || incomingStatus === 'inactive') isAvailable = false;

    const employeeData: any = { isAvailable };
    if (data.employeeCode !== undefined) employeeData.employeeCode = data.employeeCode.trim();
    if (data.fullName !== undefined) {
      const parts = data.fullName.trim().split(/\s+/);
      employeeData.firstName = parts.shift() || existing.firstName;
      employeeData.lastName = parts.join(' ') || existing.lastName;
    }
    if (data.email !== undefined) employeeData.email = data.email.trim().toLowerCase();
    if (data.phone !== undefined) employeeData.phone = data.phone;
    if (data.department !== undefined) employeeData.department = data.department;
    if (data.designation !== undefined) employeeData.designation = data.designation;
    if (data.role !== undefined) employeeData.roleId = data.role;
    if (data.hourlyRate !== undefined) employeeData.hourlyRate = Number(data.hourlyRate);
    if (data.skills !== undefined) {
      employeeData.skills = Array.isArray(data.skills)
        ? data.skills.map(skill => String(skill).trim()).filter(Boolean)
        : [];
    }
    if (data.activeJobs !== undefined) employeeData.currentAssignedJobs = data.activeJobs;

    try {
      const updated = await prisma.$transaction(async tx => {
        const employee = await tx.employee.update({
          where: { id },
          data: employeeData,
          include: { profile: true }
        });

        if (existing.profileId) {
          const profileData: any = { isActive };
          if (data.fullName !== undefined) {
            profileData.fullName = data.fullName.trim();
          }
          if (data.email !== undefined) profileData.email = employeeData.email;
          if (data.phone !== undefined) profileData.phone = data.phone;
          if (data.role !== undefined) {
            profileData.roleId = data.role;
            if (ROLE_DEFINITIONS[data.role as UserRole]) {
              profileData.roleTitle = ROLE_DEFINITIONS[data.role as UserRole].title;
            }
          }
          if (data.department !== undefined) profileData.department = data.department;
          if (data.designation !== undefined) profileData.roleTitle = data.designation;
          if (data.password) {
            profileData.passwordHash = await hashPassword(data.password);
          }

          await tx.profile.update({
            where: { id: existing.profileId },
            data: profileData
          });

          if (isActive === false) {
            await tx.session.updateMany({
              where: { profileId: existing.profileId },
              data: { isRevoked: true }
            });
          }
        }

        return employee;
      });

      // Update enhanced fields in SQL directly
      await dbPool.query(`
        UPDATE employees SET
          team = COALESCE($1, team),
          work_location = COALESCE($2, work_location),
          employment_type = COALESCE($3, employment_type),
          address = COALESCE($4, address),
          emergency_contact_name = COALESCE($5, emergency_contact_name),
          emergency_contact_relation = COALESCE($6, emergency_contact_relation),
          emergency_contact_phone = COALESCE($7, emergency_contact_phone),
          updated_at = NOW()
        WHERE id = $8
      `, [
        data.team,
        data.workLocation,
        data.employmentType,
        data.address,
        data.emergencyContact?.name,
        data.emergencyContact?.relation,
        data.emergencyContact?.phone,
        id
      ]);

      if (actor) {
        await auditService.record({
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          permissionUsed: 'employees.update',
          action: 'EMPLOYEE_UPDATED',
          entity: 'Employee',
          entityId: id,
          reason: `Updated details for employee ${existing.firstName} ${existing.lastName}`
        });
      }

      return await this.getEmployeeById(id);
    } catch (err: any) {
      if (err?.code === 'P2025') return null;
      if (err?.code === 'P2002') {
        throw new AppError(409, 'DUPLICATE_RECORD', 'An employee with this code or email already exists.');
      }
      if (err?.code === 'P2003') {
        throw new AppError(422, 'VALIDATION_ERROR', 'The selected role or department is invalid.');
      }
      console.error('Failed to update employee in database:', err);
      throw new AppError(500, 'DATABASE_ERROR', 'Employee could not be updated.');
    }
  }

  // 4. Promote Employee Workflow
  async promoteEmployee(id: string, data: {
    newDesignation: string;
    newDepartment?: string;
    newTeam?: string;
    newRoleId: string;
    newHourlyRate: number;
    reportingManagerId?: string;
    reportingManagerName?: string;
    effectiveDate: string;
    reason: string;
    notes?: string;
  }, actor: any): Promise<any> {
    const existing = await this.getEmployeeById(id);
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', `Employee '${id}' not found.`);
    }

    if (!VALID_ROLES.includes(data.newRoleId)) {
      throw new AppError(422, 'VALIDATION_ERROR', `Invalid target role '${data.newRoleId}'.`);
    }

    const newDept = data.newDepartment || existing.department;
    const newTeam = data.newTeam || existing.team;

    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');

      // Update employees table
      await client.query(`
        UPDATE employees SET
          designation = $1,
          role_id = $2,
          hourly_rate = $3,
          department = $4,
          team = $5,
          reporting_manager_id = $6,
          reporting_manager_name = $7,
          updated_at = NOW()
        WHERE id = $8
      `, [
        data.newDesignation.trim(),
        data.newRoleId,
        data.newHourlyRate,
        newDept,
        newTeam || null,
        data.reportingManagerId || null,
        data.reportingManagerName || null,
        id
      ]);

      // Update profiles table
      const roleDef = ROLE_DEFINITIONS[data.newRoleId as UserRole];
      await client.query(`
        UPDATE profiles SET
          role_id = $1,
          role_title = $2,
          department = $3,
          updated_at = NOW()
        WHERE id = (SELECT profile_id FROM employees WHERE id = $4)
      `, [
        data.newRoleId,
        roleDef?.title || data.newDesignation.trim(),
        newDept,
        id
      ]);

      // Insert into employee_career_history
      const historyRes = await client.query(`
        INSERT INTO employee_career_history (
          employee_id, event_type,
          previous_designation, new_designation,
          previous_department, new_department,
          previous_team, new_team,
          previous_role_id, new_role_id,
          previous_hourly_rate, new_hourly_rate,
          reporting_manager_id, reporting_manager_name,
          effective_date, authorized_by_id, authorized_by_name,
          reason, notes, created_at
        ) VALUES (
          $1, 'promotion',
          $2, $3,
          $4, $5,
          $6, $7,
          $8, $9,
          $10, $11,
          $12, $13,
          $14, $15, $16,
          $17, $18, NOW()
        ) RETURNING *
      `, [
        id,
        existing.designation,
        data.newDesignation.trim(),
        existing.department,
        newDept,
        existing.team || null,
        newTeam || null,
        existing.role,
        data.newRoleId,
        existing.hourlyRate,
        data.newHourlyRate,
        data.reportingManagerId || null,
        data.reportingManagerName || null,
        data.effectiveDate,
        actor?.id || 'usr-1',
        actor?.name || 'Administrator',
        data.reason,
        data.notes || null
      ]);

      await client.query('COMMIT');

      await auditService.record({
        actorId: actor?.id || 'usr-1',
        actorName: actor?.name || 'Administrator',
        actorRole: actor?.role || 'owner_admin',
        permissionUsed: 'employees.update',
        action: 'EMPLOYEE_PROMOTION',
        entity: 'Employee',
        entityId: id,
        previousState: {
          designation: existing.designation,
          roleId: existing.role,
          hourlyRate: existing.hourlyRate,
          department: existing.department
        },
        newState: {
          designation: data.newDesignation,
          roleId: data.newRoleId,
          hourlyRate: data.newHourlyRate,
          department: newDept
        },
        reason: data.reason
      });

      const updated = await this.getEmployeeById(id);
      return {
        employee: updated,
        careerEvent: historyRes.rows[0]
      };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Promotion error:', err);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to execute promotion workflow.');
    } finally {
      client.release();
    }
  }

  // 5. Transfer Employee Department Workflow
  async transferEmployee(id: string, data: {
    newDepartment: string;
    newTeam: string;
    reportingManagerId?: string;
    reportingManagerName?: string;
    effectiveDate: string;
    reason: string;
    notes?: string;
  }, actor: any): Promise<any> {
    const existing = await this.getEmployeeById(id);
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', `Employee '${id}' not found.`);
    }

    // Validate that newTeam belongs to newDepartment
    const allowedTeams = DEPARTMENT_TEAMS[data.newDepartment] || [];
    const isTeamValid = allowedTeams.length === 0 || allowedTeams.some(t => t.toLowerCase() === data.newTeam.toLowerCase() || data.newTeam.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(data.newTeam.toLowerCase()));
    if (!isTeamValid) {
      throw new AppError(422, 'VALIDATION_ERROR', `Team '${data.newTeam}' is not part of department '${data.newDepartment}'. Allowed teams: ${allowedTeams.join(', ')}`);
    }

    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');

      // Update employees table
      await client.query(`
        UPDATE employees SET
          department = $1,
          team = $2,
          reporting_manager_id = $3,
          reporting_manager_name = $4,
          updated_at = NOW()
        WHERE id = $5
      `, [
        data.newDepartment.trim(),
        data.newTeam.trim(),
        data.reportingManagerId || null,
        data.reportingManagerName || null,
        id
      ]);

      // Update profiles table department
      await client.query(`
        UPDATE profiles SET
          department = $1,
          updated_at = NOW()
        WHERE id = (SELECT profile_id FROM employees WHERE id = $2)
      `, [
        data.newDepartment.trim(),
        id
      ]);

      // Record in career history
      const historyRes = await client.query(`
        INSERT INTO employee_career_history (
          employee_id, event_type,
          previous_department, new_department,
          previous_team, new_team,
          previous_designation, new_designation,
          previous_role_id, new_role_id,
          previous_hourly_rate, new_hourly_rate,
          reporting_manager_id, reporting_manager_name,
          effective_date, authorized_by_id, authorized_by_name,
          reason, notes, created_at
        ) VALUES (
          $1, 'department_transfer',
          $2, $3,
          $4, $5,
          $6, $6,
          $7, $7,
          $8, $8,
          $9, $10,
          $11, $12, $13,
          $14, $15, NOW()
        ) RETURNING *
      `, [
        id,
        existing.department,
        data.newDepartment.trim(),
        existing.team || null,
        data.newTeam.trim(),
        existing.designation,
        existing.role,
        existing.hourlyRate,
        data.reportingManagerId || null,
        data.reportingManagerName || null,
        data.effectiveDate,
        actor?.id || 'usr-1',
        actor?.name || 'Administrator',
        data.reason,
        data.notes || null
      ]);

      await client.query('COMMIT');

      await auditService.record({
        actorId: actor?.id || 'usr-1',
        actorName: actor?.name || 'Administrator',
        actorRole: actor?.role || 'owner_admin',
        permissionUsed: 'employees.update',
        action: 'EMPLOYEE_DEPARTMENT_TRANSFER',
        entity: 'Employee',
        entityId: id,
        previousState: {
          department: existing.department,
          team: existing.team
        },
        newState: {
          department: data.newDepartment,
          team: data.newTeam
        },
        reason: data.reason
      });

      const updated = await this.getEmployeeById(id);
      return {
        employee: updated,
        careerEvent: historyRes.rows[0]
      };
    } catch (err: any) {
      await client.query('ROLLBACK');
      if (err instanceof AppError) throw err;
      console.error('Department transfer error:', err);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to execute department transfer.');
    } finally {
      client.release();
    }
  }

  // 6. Get Career History Timeline
  async getCareerHistory(id: string): Promise<any[]> {
    try {
      const res = await dbPool.query(`
        SELECT *
        FROM employee_career_history
        WHERE employee_id::text = $1
        ORDER BY effective_date DESC, created_at DESC
      `, [id]);

      return res.rows.map(row => ({
        id: row.id,
        employeeId: row.employee_id,
        eventType: row.event_type,
        previousDesignation: row.previous_designation,
        newDesignation: row.new_designation,
        previousDepartment: row.previous_department,
        newDepartment: row.new_department,
        previousTeam: row.previous_team,
        newTeam: row.new_team,
        previousRoleId: row.previous_role_id,
        newRoleId: row.new_role_id,
        previousHourlyRate: Number(row.previous_hourly_rate || 0),
        newHourlyRate: Number(row.new_hourly_rate || 0),
        reportingManagerId: row.reporting_manager_id,
        reportingManagerName: row.reporting_manager_name,
        effectiveDate: row.effective_date,
        authorizedById: row.authorized_by_id,
        authorizedByName: row.authorized_by_name,
        reason: row.reason,
        notes: row.notes,
        createdAt: row.created_at
      }));
    } catch (err) {
      console.warn('Failed to fetch employee career history:', err);
      return [];
    }
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const existing = await prisma.employee.findUnique({
      where: { id },
      select: { id: true, profileId: true }
    });
    if (!existing) return false;

    try {
      await prisma.employee.update({
        where: { id },
        data: { isAvailable: false }
      });

      if (existing.profileId) {
        await prisma.profile.update({
          where: { id: existing.profileId },
          data: { isActive: false }
        });
        await prisma.session.updateMany({
          where: { profileId: existing.profileId },
          data: { isRevoked: true }
        });
      }
      return true;
    } catch (err: any) {
      if (err?.code === 'P2025') return false;
      console.error('Failed to delete/deactivate employee from database:', err);
      throw new AppError(500, 'DATABASE_ERROR', 'Employee could not be deactivated.');
    }
  }
}

export const employeeService = new EmployeeService();
