<<<<<<< HEAD
import { prisma, pool as dbPool } from '../../db/prisma';
import { hashPassword } from '../../utils/password';
import { AppError } from '../../utils/response';
import { auditService } from '../audit/audit.service';
import crypto from 'crypto';
=======
import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { INITIAL_SYSTEM_USERS } from '../../db/seed';
import { hashPassword } from '../../utils/password';
import { AppError } from '../../utils/response';
import { env } from '../../config/env';
import { ROLE_DEFINITIONS, UserRole } from '../../config/constants';

const allowDevFallback = env.NODE_ENV !== 'production' && env.DEV_AUTH_FALLBACK;
>>>>>>> b2c2306c5ef5e15a46b91a0ea638cc1a9d802d69

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

const DEPARTMENT_CODES: Record<string, string> = {
  'Executive Management': 'EXE',
  'Sales & Business Development': 'SLS',
  'Field Engineering & Surveys': 'FLD',
  'Engineering & Approvals': 'ENG',
  'Operations & Installations': 'OPS',
  'Supply Chain & Inventory': 'SCM',
  'Finance & Compliance': 'FIN',
  'After-Sales & Customer Service': 'SUP'
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

    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      fullName: `${employee.firstName} ${employee.lastName}`.trim(),
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      role: employee.roleId,
      hourlyRate: Number(employee.hourlyRate) || 0,
      skills: Array.isArray(employee.skills) ? employee.skills : [],
      isAvailable: employee.isAvailable,
      activeJobs: employee.currentAssignedJobs,
      rating: 4.8,
      status,
      avatarUrl: employee.profile?.avatarUrl || undefined,
      joiningDate: employee.hireDate ? employee.hireDate.toISOString().split('T')[0] : undefined
    };
  }

  async getAuthorizedDepartments(user: any): Promise<DepartmentRecord[]> {
    if (!user) return [];

<<<<<<< HEAD
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
=======
    // Only explicit administrative roles may view all departments. Never infer
    // authorization from free-text role titles, which are user-influenced data.
    const isCompanyWide = user.role === 'owner_admin';

    if (isCompanyWide) {
      return DEPARTMENTS_DATA;
>>>>>>> b2c2306c5ef5e15a46b91a0ea638cc1a9d802d69
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

<<<<<<< HEAD
    if (!this.isCompanyWide(user)) {
      const authorized = await this.getAuthorizedDepartments(user);
      if (authorized.length === 0) {
        return { employees: [], pagination: { page, limit, total: 0, totalPages: 1 } };
=======
    // Check if user is restricted to a subset of departments
    const isCompanyWide = user.role === 'owner_admin';

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
>>>>>>> b2c2306c5ef5e15a46b91a0ea638cc1a9d802d69
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

<<<<<<< HEAD
  async createEmployee(user: any, data: Partial<EmployeeRecord> & { temporaryPassword?: string; emergencyContact?: any }): Promise<any> {
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

      const KNOWN_DEPARTMENTS = [
        'Operations & Installations',
        'Field Engineering & Surveys',
        'Engineering & Approvals',
        'Sales & Business Development',
        'Supply Chain & Inventory',
        'Finance & Compliance',
        'After-Sales & Customer Service',
        'Executive Management',
        'Installation'
      ];
      const isKnown = KNOWN_DEPARTMENTS.some(d => d.toLowerCase() === department.toLowerCase());
      if (!isKnown) {
        const departmentCheck = await client.query(
          'SELECT 1 FROM employees WHERE LOWER(TRIM(department)) = LOWER(TRIM($1)) LIMIT 1',
          [department]
        );
        if (!departmentCheck.rowCount) {
          throw new AppError(422, 'VALIDATION_ERROR', `Unknown department '${department}'.`);
        }
      }

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
          current_assigned_jobs, hire_date, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, 0, $12, NOW()
        ) RETURNING id, employee_code, first_name, last_name, email, phone,
          department, designation, role_id, hourly_rate, skills, is_available,
          current_assigned_jobs, hire_date, created_at`,
        [
          profileId, employeeCode, firstName, lastName, email, phone,
          department, designation, roleId, hourlyRate, skills, hireDate
        ]
      );

      await client.query('COMMIT');

      const created = employeeResult.rows[0];

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
=======
  async createEmployee(
    user: any,
    data: Partial<EmployeeRecord> & { password?: string }
  ): Promise<EmployeeRecord> {
    const role = data.role as UserRole;
    if (!ROLE_DEFINITIONS[role]) {
      throw new AppError(400, 'INVALID_ROLE', 'The selected role is not valid.');
    }

    const employeeCode = data.employeeCode || `EMP-${String(BASELINE_EMPLOYEES.length + 1).padStart(3, '0')}`;
    // A temporary password is required for the employee to sign in. If none is
    // supplied, generate a strong random one; the caller must communicate it.
    const passwordHash = await hashPassword(
      data.password || crypto.randomBytes(24).toString('base64')
    );
    const roleTitle = ROLE_DEFINITIONS[role].title;

    try {
      const created = await prisma.employee.create({
        data: {
          employeeCode,
          firstName: data.fullName?.split(' ')[0] || '',
          lastName: data.fullName?.split(' ').slice(1).join(' ') || '',
          email: data.email!,
          phone: data.phone || '',
          department: data.department!,
          designation: data.designation!,
          roleId: role,
          hourlyRate: data.hourlyRate || 0,
          skills: data.skills || [],
          isAvailable: data.isAvailable ?? true,
          currentAssignedJobs: data.activeJobs || 0,
          hireDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
          profile: {
            create: {
              fullName: data.fullName || '',
              email: data.email!,
              phone: data.phone,
              passwordHash,
              roleId: role,
              roleTitle,
              department: data.department,
              avatarUrl: data.avatarUrl,
              isActive: true
            }
          }
        },
        include: { profile: true }
      });
>>>>>>> b2c2306c5ef5e15a46b91a0ea638cc1a9d802d69

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
<<<<<<< HEAD
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

  async updateEmployee(id: string, data: Partial<EmployeeRecord>): Promise<EmployeeRecord | null> {
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
=======
      if (err?.code === 'P2002') {
        throw new AppError(409, 'DUPLICATE_EMPLOYEE', 'An employee with this email or employee code already exists.');
      }
      if (!allowDevFallback) throw err;
      // Development-only in-memory fallback
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

  async updateEmployee(
    id: string,
    data: Partial<EmployeeRecord> & { password?: string }
  ): Promise<EmployeeRecord | null> {
    if (data.role && !ROLE_DEFINITIONS[data.role as UserRole]) {
      throw new AppError(400, 'INVALID_ROLE', 'The selected role is not valid.');
    }
>>>>>>> b2c2306c5ef5e15a46b91a0ea638cc1a9d802d69

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
          if (data.role !== undefined) profileData.roleId = data.role;
          if (data.department !== undefined) profileData.department = data.department;
          if (data.designation !== undefined) profileData.roleTitle = data.designation;

          await tx.profile.update({
            where: { id: existing.profileId },
            data: profileData
          });
        }

        return employee;
      });

<<<<<<< HEAD
      return this.mapEmployee(updated);
    } catch (err: any) {
      if (err?.code === 'P2025') return null;
      if (err?.code === 'P2002') {
        throw new AppError(409, 'DUPLICATE_RECORD', 'An employee with this code or email already exists.');
=======
      // Keep the linked login profile in sync with workforce changes.
      if (updated.profileId) {
        const profileData: Record<string, any> = {};
        if (data.fullName) profileData.fullName = data.fullName;
        if (data.email) profileData.email = data.email;
        if (data.phone) profileData.phone = data.phone;
        if (data.department) profileData.department = data.department;
        if (data.avatarUrl) profileData.avatarUrl = data.avatarUrl;
        if (data.role) {
          profileData.roleId = data.role;
          profileData.roleTitle = ROLE_DEFINITIONS[data.role as UserRole].title;
        }
        if (data.password) profileData.passwordHash = await hashPassword(data.password);
        if (data.status) profileData.isActive = data.status === 'active';

        if (Object.keys(profileData).length > 0) {
          await prisma.profile.update({ where: { id: updated.profileId }, data: profileData });
        }

        if (profileData.isActive === false) {
          await prisma.session.updateMany({
            where: { profileId: updated.profileId },
            data: { isRevoked: true }
          });
        }
      }

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
        status: (data.status as EmployeeRecord['status']) || 'active',
        avatarUrl: updated.profile?.avatarUrl
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (err?.code === 'P2002') {
        throw new AppError(409, 'DUPLICATE_EMPLOYEE', 'An employee with this email or employee code already exists.');
      }
      if (!allowDevFallback) throw err;
      // Development-only in-memory fallback
      const idx = BASELINE_EMPLOYEES.findIndex(e => e.id === id);
      if (idx >= 0) {
        BASELINE_EMPLOYEES[idx] = { ...BASELINE_EMPLOYEES[idx], ...data };
        return BASELINE_EMPLOYEES[idx];
>>>>>>> b2c2306c5ef5e15a46b91a0ea638cc1a9d802d69
      }
      if (err?.code === 'P2003') {
        throw new AppError(422, 'VALIDATION_ERROR', 'The selected role or department is invalid.');
      }
      console.error('Failed to update employee in database:', err);
      throw new AppError(500, 'DATABASE_ERROR', 'Employee could not be updated.');
    }
  }

  /**
   * Soft-deactivates an employee and revokes their login sessions instead of
   * deleting the record, preserving audit history.
   */
  async deleteEmployee(id: string): Promise<boolean> {
    const existing = await prisma.employee.findUnique({
      where: { id },
      select: { id: true, profileId: true }
    });
    if (!existing) return false;

    try {
<<<<<<< HEAD
      await prisma.$transaction(async tx => {
        await tx.employee.delete({ where: { id } });
        if (existing.profileId) {
          await tx.profile.delete({ where: { id: existing.profileId } });
        }
      });
      return true;
    } catch (err: any) {
      if (err?.code === 'P2025') return false;
      console.error('Failed to delete employee from database:', err);
      throw new AppError(500, 'DATABASE_ERROR', 'Employee could not be deleted.');
=======
      const employee = await prisma.employee.findUnique({ where: { id } });
      if (!employee) return false;

      await prisma.employee.update({
        where: { id },
        data: { isAvailable: false }
      });

      if (employee.profileId) {
        await prisma.profile.update({
          where: { id: employee.profileId },
          data: { isActive: false }
        });
        await prisma.session.updateMany({
          where: { profileId: employee.profileId },
          data: { isRevoked: true }
        });
      }
      return true;
    } catch (err) {
      if (!allowDevFallback) throw err;
      // Development-only in-memory fallback
      const idx = BASELINE_EMPLOYEES.findIndex(e => e.id === id);
      if (idx >= 0) {
        BASELINE_EMPLOYEES[idx] = { ...BASELINE_EMPLOYEES[idx], status: 'inactive', isAvailable: false };
        return true;
      }
      return false;
>>>>>>> b2c2306c5ef5e15a46b91a0ea638cc1a9d802d69
    }
  }
}

export const employeeService = new EmployeeService();
