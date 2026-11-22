import { employeeRoutes } from './server/src/modules/employees/employee.routes.js';
import { Router } from 'express';

console.log('employeeRoutes:', employeeRoutes);
console.log('Is Router:', employeeRoutes instanceof Router);
console.log('Stack:', employeeRoutes.stack?.length || 0);

employeeRoutes.stack?.forEach((layer, i) => {
  console.log(`Layer ${i}:`, layer.route?.path, layer.route?.methods);
});