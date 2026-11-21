import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction } from '../../middleware/rbac.middleware';
import { surveyService } from './survey.service';
import { AppError } from '../../utils/response';

const router = Router();

// 1. Get Surveys List with queue & status filters
router.get('/', requireAuth, requireAction('surveys', 'view'), async (req, res, next) => {
  try {
    const { queue, status, reviewerId, technicianId, search } = req.query as Record<string, string>;
    const surveys = await surveyService.getSurveys({ queue, status, reviewerId, technicianId, search });
    res.json({
      success: true,
      data: surveys,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-list', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 2. Get Eligible Technical Reviewers (excludes technician who conducted survey & owner)
router.get('/eligible-reviewers', requireAuth, requireAction('surveys', 'view'), async (req, res, next) => {
  try {
    const { excludeTechnicianId } = req.query as { excludeTechnicianId?: string };
    const reviewers = await surveyService.getEligibleReviewers(excludeTechnicianId);
    res.json({
      success: true,
      data: reviewers,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-reviewers', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 3. Get Eligible Technical Approvers
router.get('/eligible-approvers', requireAuth, requireAction('surveys', 'view'), async (req, res, next) => {
  try {
    const { excludeTechnicianId } = req.query as { excludeTechnicianId?: string };
    const approvers = await surveyService.getEligibleApprovers(excludeTechnicianId);
    res.json({
      success: true,
      data: approvers,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-approvers', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 4. Get Survey By ID
router.get('/:id', requireAuth, requireAction('surveys', 'view'), async (req, res, next) => {
  try {
    const survey = await surveyService.getSurveyById(req.params.id);
    res.json({
      success: true,
      data: survey,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-detail', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 5. Assign Reviewer
router.post('/:id/assign-reviewer', requireAuth, requireAction('surveys', 'assign'), async (req, res, next) => {
  try {
    const { reviewerId } = req.body;
    if (!reviewerId) throw new AppError(422, 'VALIDATION_FAILED', 'reviewerId is required');

    const actor = { id: req.user!.id, name: req.user!.name, role: req.user!.role };
    const updated = await surveyService.assignReviewer(req.params.id, reviewerId, actor);
    res.json({
      success: true,
      data: updated,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-asg-rev', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 6. Assign Approver
router.post('/:id/assign-approver', requireAuth, requireAction('surveys', 'assign'), async (req, res, next) => {
  try {
    const { approverId } = req.body;
    if (!approverId) throw new AppError(422, 'VALIDATION_FAILED', 'approverId is required');

    const actor = { id: req.user!.id, name: req.user!.name, role: req.user!.role };
    const updated = await surveyService.assignApprover(req.params.id, approverId, actor);
    res.json({
      success: true,
      data: updated,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-asg-app', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 7. Start Review
router.post('/:id/start-review', requireAuth, requireAction('surveys', 'edit'), async (req, res, next) => {
  try {
    const actor = { id: req.user!.id, name: req.user!.name, role: req.user!.role };
    const updated = await surveyService.startReview(req.params.id, actor);
    res.json({
      success: true,
      data: updated,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-start-rev', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 8. Save Review Notes
router.post('/:id/review-notes', requireAuth, requireAction('surveys', 'edit'), async (req, res, next) => {
  try {
    const { notes } = req.body;
    const actor = { id: req.user!.id, name: req.user!.name, role: req.user!.role };
    const updated = await surveyService.saveReviewNotes(req.params.id, notes || '', actor);
    res.json({
      success: true,
      data: updated,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-notes', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 9. Request Corrections
router.post('/:id/request-corrections', requireAuth, requireAction('surveys', 'edit'), async (req, res, next) => {
  try {
    const { comments } = req.body;
    if (!comments?.trim()) throw new AppError(422, 'VALIDATION_FAILED', 'Correction comments are mandatory');

    const actor = { id: req.user!.id, name: req.user!.name, role: req.user!.role };
    const updated = await surveyService.requestCorrections(req.params.id, comments, actor);
    res.json({
      success: true,
      data: updated,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-req-corr', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 10. Resubmit Survey (Technician)
router.post('/:id/resubmit', requireAuth, requireAction('surveys', 'edit'), async (req, res, next) => {
  try {
    const actor = { id: req.user!.id, name: req.user!.name, role: req.user!.role };
    const updated = await surveyService.resubmitSurvey(req.params.id, req.body, actor);
    res.json({
      success: true,
      data: updated,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-resubmit', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 11. Submit Review Recommendation
router.post('/:id/recommend', requireAuth, requireAction('surveys', 'edit'), async (req, res, next) => {
  try {
    const { recommendation, notes } = req.body;
    if (!recommendation) throw new AppError(422, 'VALIDATION_FAILED', 'recommendation is required');

    const actor = { id: req.user!.id, name: req.user!.name, role: req.user!.role };
    const updated = await surveyService.submitRecommendation(req.params.id, recommendation, notes || '', actor);
    res.json({
      success: true,
      data: updated,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-recommend', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 12. Final Technical Approval (Explicit surveys.approve authority required + Self-approval prohibited)
router.post('/:id/approve', requireAuth, requireAction('surveys', 'approve'), async (req, res, next) => {
  try {
    const { notes } = req.body;
    const actor = { id: req.user!.id, name: req.user!.name, role: req.user!.role };
    const updated = await surveyService.approveSurvey(req.params.id, notes || '', actor);
    res.json({
      success: true,
      data: updated,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-approve', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 13. Reject Survey Report
router.post('/:id/reject', requireAuth, requireAction('surveys', 'approve'), async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) throw new AppError(422, 'VALIDATION_FAILED', 'Rejection reason is required');

    const actor = { id: req.user!.id, name: req.user!.name, role: req.user!.role };
    const updated = await surveyService.rejectSurvey(req.params.id, reason, actor);
    res.json({
      success: true,
      data: updated,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-reject', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 14. Get Survey Workflow Audit Trail
router.get('/:id/audit-trail', requireAuth, requireAction('surveys', 'view'), async (req, res, next) => {
  try {
    const auditTrail = await surveyService.getAuditTrail(req.params.id);
    res.json({
      success: true,
      data: auditTrail,
      meta: { requestId: req.headers['x-request-id'] || 'req-srv-audit', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

export { router as surveyRoutes };
export default router;
