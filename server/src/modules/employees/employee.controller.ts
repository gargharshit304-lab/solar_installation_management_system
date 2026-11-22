import { Request, Response, NextFunction } from 'express';
import { employeeService } from './employee.service';
import { sendSuccess } from '../../utils/response';

export class EmployeeController {
  async getDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = await employeeService.getAuthorizedDepartments(req.user);
      sendSuccess(res, departments);
    } catch (err) {
      next(err);
    }
  }

  async searchEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { department, search, status, page, limit } = req.query;
      const result = await employeeService.searchEmployees(req.user, {
        department: typeof department === 'string' ? department : undefined,
        search: typeof search === 'string' ? search : undefined,
        status: typeof status === 'string' ? status : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10
      });
      sendSuccess(res, result.employees, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async createEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await employeeService.createEmployee(req.user, req.body);
      sendSuccess(res, employee, 201, undefined);
    } catch (err) {
      next(err);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const employee = await employeeService.updateEmployee(id, req.body);
      if (!employee) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
        return;
      }
      sendSuccess(res, employee, 200, undefined);
    } catch (err) {
      next(err);
    }
  }

  async deleteEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await employeeService.deleteEmployee(id);
      if (!deleted) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
        return;
      }
      sendSuccess(res, { id }, 200, undefined);
    } catch (err) {
      next(err);
    }
  }
}

export const employeeController = new EmployeeController();