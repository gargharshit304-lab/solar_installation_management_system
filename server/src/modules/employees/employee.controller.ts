import { Request, Response, NextFunction } from 'express';
import { employeeService } from './employee.service';
import { sendSuccess, sendError, AppError } from '../../utils/response';

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
        limit: limit ? Number(limit) : 20
      });
      sendSuccess(res, result, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async createEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await employeeService.createEmployee(req.user, req.body);
      sendSuccess(res, employee, 201, undefined, 'Employee registered successfully');
    } catch (err: any) {
      if (err instanceof AppError) {
        return sendError(res, err.statusCode, err.code, err.message, err.details);
      }
      next(err);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const employee = await employeeService.updateEmployee(id, req.body);
      if (!employee) {
        return sendError(res, 404, 'NOT_FOUND', 'Employee not found');
      }
      sendSuccess(res, employee, 200, undefined, 'Employee updated successfully');
    } catch (err: any) {
      if (err instanceof AppError) {
        return sendError(res, err.statusCode, err.code, err.message, err.details);
      }
      next(err);
    }
  }

  async deleteEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const deleted = await employeeService.deleteEmployee(id);
      if (!deleted) {
        return sendError(res, 404, 'NOT_FOUND', 'Employee not found');
      }
      sendSuccess(res, { id }, 200, undefined, 'Employee deleted successfully');
    } catch (err: any) {
      if (err instanceof AppError) {
        return sendError(res, err.statusCode, err.code, err.message, err.details);
      }
      next(err);
    }
  }
}

export const employeeController = new EmployeeController();