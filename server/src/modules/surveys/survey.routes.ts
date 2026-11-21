import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction, requireCapability } from '../../middleware/rbac.middleware';
import { auditService } from '../audit/audit.service';
import { AppError } from '../../utils/response';

const router = Router();

let surveysStore: any[] = [
  { id: 'srv-1', surveyNumber: 'SRV-2026-001', customerName: 'Rajesh Sharma', status: 'assigned', technicianName: 'Rahul Sharma' },
  { id: 'srv-2', surveyNumber: 'SRV-2026-002', customerName: 'Sunita Patil', status: 'submitted', technicianName: 'Rahul Sharma' }
];

router.get('/', requireAuth, requireAction('surveys', 'view'), (req, res) => {
  res.json({
    success: true,
    data: surveysStore,
    meta: { requestId: req.headers['x-request-id'] || 'req-srv-list', timestamp: new Date().toISOString() }
  });
});

router.post('/', requireAuth, requireAction('surveys', 'create'), async (req, res, next) => {
  try {
    const { customerName, scheduledDate } = req.body;
    const newSurvey = {
      id: `srv-${Date.now()}`,
      surveyNumber: `SRV-2026-${String(surveysStore.length + 10).padStart(3, '0')}`,
      customerName: customerName || 'Lead Customer',
      scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
      status: 'scheduled'
    };
    surveysStore.unshift(newSurvey);
    res.status(201).json({
      success: true,
      data: newSurvey,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-create', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/assign', requireAuth, requireAction('surveys', 'assign'), async (req, res, next) => {
  try {
    const { technicianName, scheduledDate } = req.body;
    const srv = surveysStore.find(s => s.id === req.params.id);
    if (!srv) throw new AppError(404, 'NOT_FOUND', 'Survey not found');
    srv.technicianName = technicianName;
    srv.status = 'assigned';
    if (scheduledDate) srv.scheduledDate = scheduledDate;
    res.json({
      success: true,
      data: srv,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-asg', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/approve', requireAuth, requireAction('surveys', 'approve'), async (req, res, next) => {
  try {
    const srv = surveysStore.find(s => s.id === req.params.id);
    if (!srv) throw new AppError(404, 'NOT_FOUND', 'Survey not found');
    
    // BUSINESS WORKFLOW GATE: Specialist who conducted survey cannot self-approve
    if (req.user!.name && srv.technicianName && srv.technicianName.toLowerCase().includes(req.user!.name.toLowerCase())) {
      throw new AppError(403, 'SELF_APPROVAL_PROHIBITED', 'Engineering lead review cannot be self-approved by the field specialist');
    }

    srv.status = 'approved';
    srv.approvedBy = req.user!.name;
    srv.approvedAt = new Date().toISOString();

    await auditService.record({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      permissionUsed: 'surveys.approve',
      action: 'SURVEY_APPROVE',
      entity: 'SiteSurvey',
      entityId: srv.id,
      newState: srv,
      reason: 'Technical feasibility design approved'
    });

    res.json({
      success: true,
      data: srv,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-app', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

export const surveyRoutes = router;
