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
}

export const employeeController = new EmployeeController();
