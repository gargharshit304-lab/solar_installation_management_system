import { Router } from 'express';
import { healthController } from './health.controller';

const router = Router();

router.get('/', (req, res) => {
  healthController.getHealth(req, res);
});

router.get('/db', (req, res) => {
  healthController.getDatabaseHealth(req, res);
});

export const healthRoutes = router;
