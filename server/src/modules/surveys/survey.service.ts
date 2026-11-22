/**
 * SolarOS Engineering Survey Review & Approval Backend Service
 * Enforces strict separation of responsibilities between Survey Technicians,
 * Technical Reviewers (Lead Solar Design Engineers), and Authorized Approvers (Engineering Lead).
 */

import { auditService } from '../audit/audit.service';
import { AppError } from '../../utils/response';

export interface WorkflowAuditEvent {
  id: string;
  surveyId: string;
  surveyNumber: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  previousStatus?: string;
  newStatus: string;
  comments?: string;
  version: number;
}

export interface VersionSnapshot {
  version: number;
  submittedAt: string;
  technicianName: string;
  roofType?: string;
  totalRoofAreaSqm?: number;
  shadowFreeAreaSqm?: number;
  roofDirection?: string;
  roofTiltDegrees?: number;
  sanctionedLoadKw?: number;
  phaseType?: string;
  cableDistanceMeters?: number;
  notesSnapshot?: string;
  correctionsRequestedNotes?: string;
}

export interface SurveyRecord {
  id: string;
  surveyNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  scheduledDate: string;
  status: 'scheduled' | 'assigned' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  reviewStatus: 'draft' | 'submitted' | 'under_review' | 'corrections_required' | 'resubmitted' | 'awaiting_approval' | 'approved' | 'rejected';
  approvalStatus: 'pending_assignment' | 'under_review' | 'revisions_required' | 'awaiting_approval' | 'approved' | 'rejected';
  
  // Field Technician details
  technicianId?: string;
  technicianName?: string;
  submittedAt?: string;
  version: number;

  // Measurements & Specifications
  roofType?: string;
  roofLengthM?: number;
  roofWidthM?: number;
  totalRoofAreaSqm?: number;
  shadowFreeAreaSqm?: number;
  roofDirection?: string;
  roofTiltDegrees?: number;
  roofCondition?: string;
  availableInstallationSpace?: string;

  // Shadow Analysis
  nearbyObstructions?: string;
  shadowObservations?: string;
  estimatedShadingImpactPct?: number;

  // Electrical details
  gridConnectionAvailable?: boolean;
  phaseType?: string;
  sanctionedLoadKw?: number;
  meterNumber?: string;
  mainPanelCondition?: string;
  proposedInverterLocation?: string;
  cableDistanceMeters?: number;
  earthingRequirement?: string;
  additionalElectricalObservations?: string;

  // Site Conditions
  roofAccessibility?: string;
  structuralConcerns?: string;
  installationObstacles?: string;
  safetyConsiderations?: string;
  waterLeakageConcerns?: string;
  additionalSiteObservations?: string;
  technicianNotes?: string;
  photos?: string[];

  // Reviewer Attribution (Technical Design Reviewer)
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  reviewedById?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reviewRecommendation?: 'recommend_approval' | 'revisions_required' | 'recommend_rejection';
  correctionsRequestedNotes?: string;

  // Final Approver Attribution (Authorized Engineering Lead)
  assignedApproverId?: string;
  assignedApproverName?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  approvalNotes?: string;
  rejectionReason?: string;

  previousVersions?: VersionSnapshot[];
  workflowAuditTrail?: WorkflowAuditEvent[];
  updatedAt: string;
}

// In-memory persistent survey store with real database-aligned records across all workflow stages
let surveysStore: SurveyRecord[] = [
  {
    id: 'surv-1',
    surveyNumber: 'SRV-2026-041',
    customerId: 'cust-1',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98220 12345',
    customerAddress: 'Bunglow 14, Baner Hill View Society, Baner, Pune',
    scheduledDate: '2026-11-08T10:00:00',
    status: 'approved',
    reviewStatus: 'approved',
    approvalStatus: 'approved',
    technicianId: 'emp-3',
    technicianName: 'Suresh More',
    submittedAt: '2026-11-08T16:30:00',
    version: 1,
    roofType: 'RCC Flat Concrete',
    roofLengthM: 15.5,
    roofWidthM: 8.2,
    totalRoofAreaSqm: 127.1,
    shadowFreeAreaSqm: 94.5,
    roofDirection: 'South',
    roofTiltDegrees: 18.0,
    roofCondition: 'good',
    availableInstallationSpace: 'Full open terrace slab with parapet wall',
    nearbyObstructions: 'Overhead water tank on NE corner; no southern obstructions',
    shadowObservations: '100% shadow-free between 09:00 AM and 05:00 PM',
    estimatedShadingImpactPct: 2.0,
    gridConnectionAvailable: true,
    phaseType: 'three_phase',
    sanctionedLoadKw: 7.0,
    meterNumber: 'MSEDCL-PUN-884210',
    mainPanelCondition: 'good',
    proposedInverterLocation: 'Staircase landing head-room (weather protected)',
    cableDistanceMeters: 22.0,
    earthingRequirement: 'Dual chemical earthing pits required (AC + DC/Lighting)',
    additionalElectricalObservations: 'DISCOM distribution transformer at 85m. Stable voltage.',
    roofAccessibility: 'Internal concrete staircase with standard terrace door',
    structuralConcerns: 'RCC slab in excellent structural condition; no seepage',
    installationObstacles: 'None',
    safetyConsiderations: 'Parapet wall 3.5 ft height; lifeline available',
    waterLeakageConcerns: 'No ponding or cracks observed',
    technicianNotes: 'Terrace is completely unobstructed. RCC slab in excellent condition. Direct South facing with optimal solar yield. Recommend 540W Mono PERC panels.',
    photos: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=500&auto=format&fit=crop&q=80'
    ],
    assignedReviewerId: 'emp-19',
    assignedReviewerName: 'Sandeep Patil',
    reviewedById: 'emp-19',
    reviewedByName: 'Sandeep Patil',
    reviewedAt: '2026-11-09T10:15:00',
    reviewNotes: 'Technical measurements and shadow-free area verified against standard design tolerances. Roof structural loading verified.',
    reviewRecommendation: 'recommend_approval',
    assignedApproverId: 'emp-19',
    assignedApproverName: 'Sandeep Patil',
    approvedById: 'emp-19',
    approvedByName: 'Sandeep Patil',
    approvedAt: '2026-11-09T11:00:00',
    approvalNotes: 'Technical feasibility approved. Ready for quotation release.',
    updatedAt: '2026-11-09T11:00:00',
    workflowAuditTrail: [
      {
        id: 'aud-1',
        surveyId: 'surv-1',
        surveyNumber: 'SRV-2026-041',
        eventType: 'report_submitted',
        actorId: 'emp-3',
        actorName: 'Suresh More',
        actorRole: 'survey_tech',
        timestamp: '2026-11-08T16:30:00',
        newStatus: 'submitted',
        comments: 'Initial survey submitted with rooftop laser measurements',
        version: 1
      },
      {
        id: 'aud-2',
        surveyId: 'surv-1',
        surveyNumber: 'SRV-2026-041',
        eventType: 'reviewer_assigned',
        actorId: 'usr-1',
        actorName: 'Vikramaditya Rao',
        actorRole: 'owner_admin',
        timestamp: '2026-11-08T17:00:00',
        newStatus: 'under_review',
        comments: 'Assigned to Lead Design Engineer Sandeep Patil',
        version: 1
      },
      {
        id: 'aud-3',
        surveyId: 'surv-1',
        surveyNumber: 'SRV-2026-041',
        eventType: 'report_approved',
        actorId: 'emp-19',
        actorName: 'Sandeep Patil',
        actorRole: 'engineering_lead',
        timestamp: '2026-11-09T11:00:00',
        newStatus: 'approved',
        comments: 'Technical feasibility signoff completed',
        version: 1
      }
    ]
  },
  {
    id: 'surv-2',
    surveyNumber: 'SRV-2026-042',
    customerId: 'cust-2',
    customerName: 'Dr. Sunita Deshmukh',
    customerPhone: '+91 98220 19340',
    customerAddress: 'Deshmukh Healthcare Centre, MG Road, Nashik',
    scheduledDate: '2026-11-10T14:00:00',
    status: 'submitted',
    reviewStatus: 'submitted',
    approvalStatus: 'pending_assignment',
    technicianId: 'emp-3',
    technicianName: 'Suresh More',
    submittedAt: '2026-11-20T17:45:00',
    version: 1,
    roofType: 'RCC Flat Concrete',
    roofLengthM: 18.0,
    roofWidthM: 9.0,
    totalRoofAreaSqm: 162.0,
    shadowFreeAreaSqm: 110.0,
    roofDirection: 'South-West',
    roofTiltDegrees: 15.0,
    roofCondition: 'good',
    nearbyObstructions: 'Water storage tank creates partial shadow after 4:30 PM on NE corner',
    shadowObservations: 'Elevated structure recommended to bypass parapet shadow',
    estimatedShadingImpactPct: 6.5,
    gridConnectionAvailable: true,
    phaseType: 'three_phase',
    sanctionedLoadKw: 10.0,
    meterNumber: 'MSEDCL-NSK-112093',
    cableDistanceMeters: 30.0,
    technicianNotes: 'Water storage tank creates partial shadow. Proposed layout avoids this zone entirely. Elevated structure recommended.',
    photos: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=80'
    ],
    updatedAt: '2026-11-20T17:45:00',
    workflowAuditTrail: [
      {
        id: 'aud-4',
        surveyId: 'surv-2',
        surveyNumber: 'SRV-2026-042',
        eventType: 'report_submitted',
        actorId: 'emp-3',
        actorName: 'Suresh More',
        actorRole: 'survey_tech',
        timestamp: '2026-11-20T17:45:00',
        newStatus: 'submitted',
        comments: 'Hospital commercial survey submitted. Ready for engineering review.',
        version: 1
      }
    ]
  },
  {
    id: 'surv-corr-suresh',
    surveyNumber: 'SRV-2026-053',
    customerId: 'cust-1',
    customerName: 'Vikrant Sawant',
    customerPhone: '+91 97665 44332',
    customerAddress: 'Villa 12, Nyati Chesterfield, Undri, Pune',
    scheduledDate: '2026-11-19T11:00:00',
    status: 'submitted',
    reviewStatus: 'corrections_required',
    approvalStatus: 'revisions_required',
    technicianId: 'emp-3',
    technicianName: 'Suresh More',
    submittedAt: '2026-11-19T15:30:00',
    version: 1,
    roofType: 'Sloping Mangalore Tile',
    roofLengthM: 12.0,
    roofWidthM: 6.5,
    totalRoofAreaSqm: 78.0,
    shadowFreeAreaSqm: 62.0,
    roofDirection: 'South',
    roofTiltDegrees: 28.0,
    roofCondition: 'fair',
    nearbyObstructions: 'Chimney on West roof face',
    shadowObservations: 'Clear morning and afternoon sun',
    sanctionedLoadKw: 5.0,
    phaseType: 'single_phase',
    cableDistanceMeters: 25.0,
    technicianNotes: 'Tiled roof survey. Steep incline.',
    assignedReviewerId: 'emp-19',
    assignedReviewerName: 'Sandeep Patil',
    reviewedById: 'emp-19',
    reviewedByName: 'Sandeep Patil',
    reviewedAt: '2026-11-20T11:30:00',
    correctionsRequestedNotes: 'Roof tilt of 28° is too steep for standard L-brackets. Please upload clear photographs of ridge line, tile rafters, and re-confirm cable drop distance.',
    updatedAt: '2026-11-20T11:30:00',
    workflowAuditTrail: [
      {
        id: 'aud-5',
        surveyId: 'surv-corr-suresh',
        surveyNumber: 'SRV-2026-053',
        eventType: 'report_submitted',
        actorId: 'emp-3',
        actorName: 'Suresh More',
        actorRole: 'survey_tech',
        timestamp: '2026-11-19T15:30:00',
        newStatus: 'submitted',
        comments: 'Initial tile roof measurements submitted',
        version: 1
      },
      {
        id: 'aud-6',
        surveyId: 'surv-corr-suresh',
        surveyNumber: 'SRV-2026-053',
        eventType: 'corrections_requested',
        actorId: 'emp-19',
        actorName: 'Sandeep Patil',
        actorRole: 'engineering_lead',
        timestamp: '2026-11-20T11:30:00',
        newStatus: 'corrections_required',
        comments: 'Roof tilt of 28° is too steep for standard L-brackets. Please upload clear photographs of ridge line, tile rafters, and re-confirm cable drop distance.',
        version: 1
      }
    ]
  },
  {
    id: 'surv-resub-1',
    surveyNumber: 'SRV-2026-054',
    customerId: 'cust-4',
    customerName: 'Anand Joshi',
    customerPhone: '+91 98901 77231',
    customerAddress: 'Row House 9, Kothrud Woods, Pune',
    scheduledDate: '2026-11-18T10:00:00',
    status: 'submitted',
    reviewStatus: 'resubmitted',
    approvalStatus: 'under_review',
    technicianId: 'emp-3',
    technicianName: 'Suresh More',
    submittedAt: '2026-11-21T14:00:00',
    version: 2,
    roofType: 'RCC Flat Concrete',
    roofLengthM: 11.5,
    roofWidthM: 7.0,
    totalRoofAreaSqm: 80.5,
    shadowFreeAreaSqm: 68.0,
    roofDirection: 'South',
    roofTiltDegrees: 15.0,
    roofCondition: 'good',
    sanctionedLoadKw: 4.0,
    phaseType: 'single_phase',
    cableDistanceMeters: 16.0,
    technicianNotes: 'Resubmitted Version 2: Added laser distance calibration along staircase shaft and confirmed 16m cable drop.',
    assignedReviewerId: 'emp-19',
    assignedReviewerName: 'Sandeep Patil',
    previousVersions: [
      {
        version: 1,
        submittedAt: '2026-11-18T16:00:00',
        technicianName: 'Suresh More',
        roofType: 'RCC Flat Concrete',
        totalRoofAreaSqm: 80.5,
        shadowFreeAreaSqm: 68.0,
        cableDistanceMeters: 28.0,
        notesSnapshot: 'Initial cable drop estimate was 28m.',
        correctionsRequestedNotes: 'Please re-measure cable distance along staircase shaft.'
      }
    ],
    updatedAt: '2026-11-21T14:00:00',
    workflowAuditTrail: [
      {
        id: 'aud-7',
        surveyId: 'surv-resub-1',
        surveyNumber: 'SRV-2026-054',
        eventType: 'report_submitted',
        actorId: 'emp-3',
        actorName: 'Suresh More',
        actorRole: 'survey_tech',
        timestamp: '2026-11-18T16:00:00',
        newStatus: 'submitted',
        comments: 'Version 1 submitted',
        version: 1
      },
      {
        id: 'aud-8',
        surveyId: 'surv-resub-1',
        surveyNumber: 'SRV-2026-054',
        eventType: 'corrections_requested',
        actorId: 'emp-19',
        actorName: 'Sandeep Patil',
        actorRole: 'engineering_lead',
        timestamp: '2026-11-19T09:30:00',
        newStatus: 'corrections_required',
        comments: 'Please re-measure cable distance along staircase shaft.',
        version: 1
      },
      {
        id: 'aud-9',
        surveyId: 'surv-resub-1',
        surveyNumber: 'SRV-2026-054',
        eventType: 'technician_resubmitted',
        actorId: 'emp-3',
        actorName: 'Suresh More',
        actorRole: 'survey_tech',
        timestamp: '2026-11-21T14:00:00',
        newStatus: 'resubmitted',
        comments: 'Version 2 submitted with corrected 16m cable drop measurement',
        version: 2
      }
    ]
  },
  {
    id: 'surv-await-appr',
    surveyNumber: 'SRV-2026-055',
    customerId: 'cust-6',
    customerName: 'Mahendra Patil (Precision Gears)',
    customerPhone: '+91 94220 88712',
    customerAddress: 'Plot 48, MIDC Bhosari Industrial Area, Pune',
    scheduledDate: '2026-11-17T10:00:00',
    status: 'submitted',
    reviewStatus: 'awaiting_approval',
    approvalStatus: 'awaiting_approval',
    technicianId: 'emp-3',
    technicianName: 'Suresh More',
    submittedAt: '2026-11-17T16:00:00',
    version: 1,
    roofType: 'Industrial Corrugated Metal Sheet',
    roofLengthM: 25.0,
    roofWidthM: 14.0,
    totalRoofAreaSqm: 350.0,
    shadowFreeAreaSqm: 310.0,
    roofDirection: 'South-South-West',
    roofTiltDegrees: 12.0,
    roofCondition: 'good',
    sanctionedLoadKw: 25.0,
    phaseType: 'three_phase',
    cableDistanceMeters: 45.0,
    assignedReviewerId: 'emp-19',
    assignedReviewerName: 'Sandeep Patil',
    reviewedById: 'emp-19',
    reviewedByName: 'Sandeep Patil',
    reviewedAt: '2026-11-21T16:30:00',
    reviewNotes: 'Industrial tin shed roof purlins inspected. Structure can safely sustain 20kW module array using mid/end clamps. Recommended for final sign-off.',
    reviewRecommendation: 'recommend_approval',
    assignedApproverId: 'emp-19',
    assignedApproverName: 'Sandeep Patil',
    updatedAt: '2026-11-21T16:30:00',
    workflowAuditTrail: [
      {
        id: 'aud-10',
        surveyId: 'surv-await-appr',
        surveyNumber: 'SRV-2026-055',
        eventType: 'report_submitted',
        actorId: 'emp-3',
        actorName: 'Suresh More',
        actorRole: 'survey_tech',
        timestamp: '2026-11-17T16:00:00',
        newStatus: 'submitted',
        comments: 'MIDC industrial roof measurements submitted',
        version: 1
      },
      {
        id: 'aud-11',
        surveyId: 'surv-await-appr',
        surveyNumber: 'SRV-2026-055',
        eventType: 'recommendation_submitted',
        actorId: 'emp-19',
        actorName: 'Sandeep Patil',
        actorRole: 'engineering_lead',
        timestamp: '2026-11-21T16:30:00',
        newStatus: 'awaiting_approval',
        comments: 'Technical review complete. Recommendation submitted: Approved for quotation.',
        version: 1
      }
    ]
  },
  {
    id: 'surv-8',
    surveyNumber: 'SRV-2026-048',
    customerId: 'cust-9',
    customerName: 'Kothrud Industrial Tools',
    customerPhone: '+91 98225 66710',
    customerAddress: 'Sector C, Kothrud Industrial Estate, Pune',
    scheduledDate: '2026-11-15T11:00:00',
    status: 'submitted',
    reviewStatus: 'recommend_rejection',
    approvalStatus: 'pending_assignment',
    technicianId: 'emp-18',
    technicianName: 'Vikram Patel',
    submittedAt: '2026-11-15T15:00:00',
    version: 1,
    roofType: 'Industrial Metal Tin Shed',
    roofLengthM: 20.0,
    roofWidthM: 10.0,
    totalRoofAreaSqm: 200.0,
    shadowFreeAreaSqm: 72.0,
    roofDirection: 'South',
    roofTiltDegrees: 12.0,
    roofCondition: 'needs_reinforcement',
    technicianNotes: 'Chimney stack casts persistent shadow across center of roof. East wall has structural water seepage.',
    workflowAuditTrail: [
      {
        id: 'aud-rej-0',
        surveyId: 'surv-8',
        surveyNumber: 'SRV-2026-048',
        eventType: 'report_submitted',
        actorId: 'emp-18',
        actorName: 'Vikram Patel',
        actorRole: 'survey_tech',
        timestamp: '2026-11-15T15:00:00',
        newStatus: 'submitted',
        comments: 'Industrial shed survey submitted',
        version: 1
      }
    ]
  }
];

class SurveyService {
  /**
   * Retrieves list of surveys with flexible status and queue filters
   */
  async getSurveys(filters: {
    queue?: string;
    status?: string;
    reviewerId?: string;
    technicianId?: string;
    search?: string;
  } = {}) {
    return surveysStore.filter(s => {
      if (filters.queue) {
        switch (filters.queue) {
          case 'newly_submitted':
            if (s.status !== 'submitted' || s.assignedReviewerId || s.reviewStatus === 'corrections_required') return false;
            break;
          case 'assigned_to_me':
            if (!filters.reviewerId || s.assignedReviewerId !== filters.reviewerId) return false;
            break;
          case 'under_review':
            if (s.reviewStatus !== 'under_review') return false;
            break;
          case 'corrections_required':
            if (s.reviewStatus !== 'corrections_required') return false;
            break;
          case 'resubmitted':
            if (s.reviewStatus !== 'resubmitted') return false;
            break;
          case 'awaiting_approval':
            if (s.reviewStatus !== 'awaiting_approval') return false;
            break;
          case 'approved':
            if (s.status !== 'approved') return false;
            break;
          case 'rejected':
            if (s.status !== 'rejected') return false;
            break;
        }
      }

      if (filters.status && s.status !== filters.status) return false;
      if (filters.reviewerId && s.assignedReviewerId !== filters.reviewerId) return false;
      if (filters.technicianId && s.technicianId !== filters.technicianId) return false;

      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches = 
          s.surveyNumber.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          s.customerAddress.toLowerCase().includes(q) ||
          (s.technicianName && s.technicianName.toLowerCase().includes(q)) ||
          (s.assignedReviewerName && s.assignedReviewerName.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }

  /**
   * Retrieves a single survey by ID or Survey Number
   */
  async getSurveyById(idOrNumber: string) {
    const survey = surveysStore.find(s => s.id === idOrNumber || s.surveyNumber === idOrNumber);
    if (!survey) {
      throw new AppError(404, 'NOT_FOUND', `Survey ${idOrNumber} not found`);
    }
    return survey;
  }

  /**
   * Returns active, eligible engineering reviewers with their current workload
   * EXCLUDES: The technician who conducted the survey, and the Owner (separation of governance from engineering)
   */
  async getEligibleReviewers(excludeTechnicianId?: string) {
    // Canonical engineering reviewer list (active, certified engineering employees)
    const eligibleReviewers = [
      {
        id: 'emp-19',
        userId: 'usr-9',
        name: 'Sandeep Patil',
        role: 'engineering_lead',
        roleTitle: 'Lead Solar Design & Approvals Engineer',
        department: 'Engineering & Approvals',
        skills: ['Technical Feasibility', 'Shadow Angle Review', 'SLD Verification', 'PVSyst Simulation'],
        status: 'active',
        isAvailable: true,
        canReview: true,
        canApprove: true
      },
      {
        id: 'emp-20',
        userId: 'usr-10',
        name: 'Neha Kulkarni',
        role: 'engineering_lead',
        roleTitle: 'Senior Solar PV Design & Simulation Engineer',
        department: 'Engineering & Approvals',
        skills: ['PVSyst Simulation', '3D Shadow Modeling', 'Cable Loss Calculation'],
        status: 'active',
        isAvailable: true,
        canReview: true,
        canApprove: false // Distinct reviewer capability without final approval authority!
      }
    ];

    return eligibleReviewers
      .filter(r => r.status === 'active' && r.id !== excludeTechnicianId && r.userId !== excludeTechnicianId)
      .map(reviewer => {
        const activeReviewsCount = surveysStore.filter(
          s => s.assignedReviewerId === reviewer.id && s.status === 'submitted' && s.reviewStatus !== 'approved'
        ).length;

        return {
          ...reviewer,
          activeReviewsCount,
          workloadStatus: activeReviewsCount > 5 ? 'heavy' : (activeReviewsCount > 2 ? 'moderate' : 'light')
        };
      });
  }

  /**
   * Returns eligible final approvers (strictly requires explicit surveys.approve capability)
   */
  async getEligibleApprovers(excludeTechnicianId?: string) {
    const reviewers = await this.getEligibleReviewers(excludeTechnicianId);
    return reviewers.filter(r => r.canApprove);
  }

  /**
   * Assigns an eligible reviewer to a submitted survey
   */
  async assignReviewer(surveyId: string, reviewerId: string, actor: { id: string; name: string; role: string }) {
    const survey = await this.getSurveyById(surveyId);


    const eligibleReviewers = await this.getEligibleReviewers(survey.technicianId);
    const reviewer = eligibleReviewers.find(r => r.id === reviewerId || r.userId === reviewerId);

    if (!reviewer) {
      throw new AppError(422, 'INVALID_REVIEWER', 'Selected employee is not an eligible active engineering reviewer');
    }

    if (survey.technicianId && (survey.technicianId === reviewer.id || survey.technicianName?.includes(reviewer.name))) {
      throw new AppError(403, 'SELF_REVIEW_PROHIBITED', 'Technician who performed field inspection cannot review their own report');
    }

    const prevReviewer = survey.assignedReviewerName;
    survey.assignedReviewerId = reviewer.id;
    survey.assignedReviewerName = reviewer.name;
    if (survey.reviewStatus === 'draft' || survey.reviewStatus === 'submitted') {
      survey.reviewStatus = 'under_review';
    }
    survey.approvalStatus = 'under_review';
    survey.updatedAt = new Date().toISOString();

    const eventType = prevReviewer ? 'reviewer_reassigned' : 'reviewer_assigned';
    const comments = prevReviewer 
      ? `Reassigned from ${prevReviewer} to ${reviewer.name}` 
      : `Assigned for technical review to ${reviewer.name}`;

    const auditEvent: WorkflowAuditEvent = {
      id: `aud-${Date.now()}`,
      surveyId: survey.id,
      surveyNumber: survey.surveyNumber,
      eventType,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
      previousStatus: survey.reviewStatus,
      newStatus: survey.reviewStatus,
      comments,
      version: survey.version
    };

    if (!survey.workflowAuditTrail) survey.workflowAuditTrail = [];
    survey.workflowAuditTrail.unshift(auditEvent);

    await auditService.record({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      permissionUsed: 'surveys.assign',
      action: 'SURVEY_ASSIGN_REVIEWER',
      entity: 'SiteSurvey',
      entityId: survey.id,
      newState: { assignedReviewerId: reviewer.id, assignedReviewerName: reviewer.name },
      reason: comments
    });

    return survey;
  }

  /**
   * Assigns an authorized final approver
   */
  async assignApprover(surveyId: string, approverId: string, actor: { id: string; name: string; role: string }) {
    const survey = await this.getSurveyById(surveyId);


    const eligibleApprovers = await this.getEligibleApprovers(survey.technicianId);
    const approver = eligibleApprovers.find(a => a.id === approverId || a.userId === approverId);

    if (!approver) {
      throw new AppError(422, 'INVALID_APPROVER', 'Selected employee does not hold explicit engineering approval authority');
    }

    survey.assignedApproverId = approver.id;
    survey.assignedApproverName = approver.name;
    survey.updatedAt = new Date().toISOString();

    const auditEvent: WorkflowAuditEvent = {
      id: `aud-${Date.now()}`,
      surveyId: survey.id,
      surveyNumber: survey.surveyNumber,
      eventType: 'approval_assigned',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
      newStatus: survey.reviewStatus,
      comments: `Assigned to ${approver.name} for final technical authorization`,
      version: survey.version
    };

    if (!survey.workflowAuditTrail) survey.workflowAuditTrail = [];
    survey.workflowAuditTrail.unshift(auditEvent);

    return survey;
  }

  /**
   * Starts review by reviewer
   */
  async startReview(surveyId: string, actor: { id: string; name: string; role: string }) {
    const survey = await this.getSurveyById(surveyId);



    survey.reviewStatus = 'under_review';
    survey.approvalStatus = 'under_review';
    survey.reviewedById = actor.id;
    survey.reviewedByName = actor.name;
    survey.reviewedAt = new Date().toISOString();
    survey.updatedAt = new Date().toISOString();

    const auditEvent: WorkflowAuditEvent = {
      id: `aud-${Date.now()}`,
      surveyId: survey.id,
      surveyNumber: survey.surveyNumber,
      eventType: 'review_started',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
      newStatus: 'under_review',
      comments: `Technical review opened and in progress by ${actor.name}`,
      version: survey.version
    };

    if (!survey.workflowAuditTrail) survey.workflowAuditTrail = [];
    survey.workflowAuditTrail.unshift(auditEvent);

    return survey;
  }

  /**
   * Saves working review notes
   */
  async saveReviewNotes(surveyId: string, notes: string, actor: { id: string; name: string; role: string }) {
    const survey = await this.getSurveyById(surveyId);



    survey.reviewNotes = notes;
    survey.updatedAt = new Date().toISOString();

    const auditEvent: WorkflowAuditEvent = {
      id: `aud-${Date.now()}`,
      surveyId: survey.id,
      surveyNumber: survey.surveyNumber,
      eventType: 'review_notes_saved',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
      newStatus: survey.reviewStatus,
      comments: 'Review comments draft saved',
      version: survey.version
    };

    if (!survey.workflowAuditTrail) survey.workflowAuditTrail = [];
    survey.workflowAuditTrail.unshift(auditEvent);

    return survey;
  }

  /**
   * Requests specific corrections from field survey technician
   */
  async requestCorrections(surveyId: string, comments: string, actor: { id: string; name: string; role: string }) {
    if (!comments?.trim()) {
      throw new AppError(422, 'VALIDATION_FAILED', 'Specific technical correction comments are mandatory');
    }

    const survey = await this.getSurveyById(surveyId);



    if (survey.status === 'approved') {
      throw new AppError(400, 'ALREADY_APPROVED', 'Approved surveys cannot be returned for revisions without reopening protocol');
    }

    survey.reviewStatus = 'corrections_required';
    survey.approvalStatus = 'revisions_required';
    survey.correctionsRequestedNotes = comments.trim();
    survey.reviewedById = actor.id;
    survey.reviewedByName = actor.name;
    survey.reviewedAt = new Date().toISOString();
    survey.updatedAt = new Date().toISOString();

    const auditEvent: WorkflowAuditEvent = {
      id: `aud-${Date.now()}`,
      surveyId: survey.id,
      surveyNumber: survey.surveyNumber,
      eventType: 'corrections_requested',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
      previousStatus: 'under_review',
      newStatus: 'corrections_required',
      comments: comments.trim(),
      version: survey.version
    };

    if (!survey.workflowAuditTrail) survey.workflowAuditTrail = [];
    survey.workflowAuditTrail.unshift(auditEvent);

    await auditService.record({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      permissionUsed: 'surveys.review',
      action: 'SURVEY_REQUEST_CORRECTIONS',
      entity: 'SiteSurvey',
      entityId: survey.id,
      newState: { reviewStatus: 'corrections_required', comments },
      reason: 'Technical corrections requested by engineering reviewer'
    });

    return survey;
  }

  /**
   * Field technician resubmits corrected survey report (creates new version, preserves history)
   */
  async resubmitSurvey(surveyId: string, updatedDetails: Partial<SurveyRecord>, actor: { id: string; name: string; role: string }) {
    const survey = await this.getSurveyById(surveyId);



    if (survey.status === 'approved') {
      throw new AppError(400, 'ALREADY_APPROVED', 'Approved survey cannot be silently modified or resubmitted');
    }

    // Field technicians may only resubmit their own assigned survey.
    if (actor.role === 'survey_tech') {
      const ownsById = survey.technicianId && survey.technicianId === actor.id;
      const ownsByName = survey.technicianName && survey.technicianName.toLowerCase() === actor.name.toLowerCase();
      if ((survey.technicianId || survey.technicianName) && !ownsById && !ownsByName) {
        throw new AppError(403, 'NOT_ASSIGNED', 'Only the technician assigned to this survey may resubmit it.');
      }
    }

    // Preserve previous version snapshot
    const versionSnapshot: VersionSnapshot = {
      version: survey.version,
      submittedAt: survey.submittedAt || new Date().toISOString(),
      technicianName: survey.technicianName || actor.name,
      roofType: survey.roofType,
      totalRoofAreaSqm: survey.totalRoofAreaSqm,
      shadowFreeAreaSqm: survey.shadowFreeAreaSqm,
      roofDirection: survey.roofDirection,
      roofTiltDegrees: survey.roofTiltDegrees,
      sanctionedLoadKw: survey.sanctionedLoadKw,
      phaseType: survey.phaseType,
      cableDistanceMeters: survey.cableDistanceMeters,
      notesSnapshot: survey.technicianNotes,
      correctionsRequestedNotes: survey.correctionsRequestedNotes
    };

    if (!survey.previousVersions) survey.previousVersions = [];
    survey.previousVersions.unshift(versionSnapshot);

    // Apply only technician-editable field data. Status, approval and review
    // fields are owned by the workflow state machine and must never be
    // mass-assigned from the request body.
    const editableFields: Array<keyof SurveyRecord> = [
      'roofType', 'roofLengthM', 'roofWidthM', 'totalRoofAreaSqm',
      'shadowFreeAreaSqm', 'roofDirection', 'roofTiltDegrees', 'roofCondition',
      'availableInstallationSpace', 'nearbyObstructions', 'shadowObservations',
      'estimatedShadingImpactPct', 'gridConnectionAvailable', 'phaseType',
      'sanctionedLoadKw', 'meterNumber', 'mainPanelCondition',
      'proposedInverterLocation', 'cableDistanceMeters', 'earthingRequirement',
      'additionalElectricalObservations', 'roofAccessibility', 'structuralConcerns',
      'installationObstacles', 'safetyConsiderations', 'waterLeakageConcerns',
      'additionalSiteObservations', 'technicianNotes', 'photos'
    ];
    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(updatedDetails, field)) {
        (survey as any)[field] = (updatedDetails as any)[field];
      }
    }
    survey.version = survey.version + 1;
    survey.status = 'submitted';
    survey.reviewStatus = 'resubmitted';
    survey.approvalStatus = 'under_review';
    survey.submittedAt = new Date().toISOString();
    survey.updatedAt = new Date().toISOString();

    const auditEvent: WorkflowAuditEvent = {
      id: `aud-${Date.now()}`,
      surveyId: survey.id,
      surveyNumber: survey.surveyNumber,
      eventType: 'technician_resubmitted',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
      previousStatus: 'corrections_required',
      newStatus: 'resubmitted',
      comments: `Version ${survey.version} resubmitted by field technician with requested corrections`,
      version: survey.version
    };

    if (!survey.workflowAuditTrail) survey.workflowAuditTrail = [];
    survey.workflowAuditTrail.unshift(auditEvent);

    return survey;
  }

  /**
   * Technical reviewer submits review recommendation to the final approver
   */
  async submitRecommendation(surveyId: string, recommendation: 'recommend_approval' | 'revisions_required' | 'recommend_rejection', notes: string, actor: { id: string; name: string; role: string }) {
    const survey = await this.getSurveyById(surveyId);



    survey.reviewRecommendation = recommendation;
    survey.reviewNotes = notes;
    survey.reviewedById = actor.id;
    survey.reviewedByName = actor.name;
    survey.reviewedAt = new Date().toISOString();
    survey.reviewStatus = 'awaiting_approval';
    survey.approvalStatus = 'awaiting_approval';
    survey.updatedAt = new Date().toISOString();

    // Default assign to Lead Solar Approver Sandeep Patil if not set
    if (!survey.assignedApproverId) {
      survey.assignedApproverId = 'emp-19';
      survey.assignedApproverName = 'Sandeep Patil';
    }

    const auditEvent: WorkflowAuditEvent = {
      id: `aud-${Date.now()}`,
      surveyId: survey.id,
      surveyNumber: survey.surveyNumber,
      eventType: 'recommendation_submitted',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
      previousStatus: 'under_review',
      newStatus: 'awaiting_approval',
      comments: `Review recommendation submitted: ${recommendation.replace('_', ' ').toUpperCase()}. Notes: ${notes || 'Verified'}`,
      version: survey.version
    };

    if (!survey.workflowAuditTrail) survey.workflowAuditTrail = [];
    survey.workflowAuditTrail.unshift(auditEvent);

    return survey;
  }

  /**
   * Final technical authorization (Quality Gate required before quotation)
   * Strictly prohibits self-approval: Field technician who conducted survey cannot approve it.
   */
  async approveSurvey(surveyId: string, notes: string, actor: { id: string; name: string; role: string }) {
    const survey = await this.getSurveyById(surveyId);



    // CRITICAL AUTHORIZATION CHECK: Separation of Responsibilities
    if (survey.technicianId && (survey.technicianId === actor.id || survey.technicianName?.toLowerCase().includes(actor.name.toLowerCase()))) {
      throw new AppError(403, 'SELF_APPROVAL_PROHIBITED', 'Engineering survey report cannot be approved by the field technician who conducted it');
    }

    // Role check: Only authorized engineering approver (not field technician, not administrative Owner)
    if (actor.role === 'survey_tech') {
      throw new AppError(403, 'FORBIDDEN', 'Survey technicians lack engineering approval authority');
    }

    if (actor.role === 'owner_admin' || actor.name.toLowerCase().includes('vikramaditya')) {
      throw new AppError(403, 'OWNER_ENGINEERING_APPROVAL_RESTRICTED', 'Owner / Managing Director cannot grant engineering technical sign-off without professional design engineering credentials. Sandeep Patil (Lead Approvals Engineer) holds primary technical approval authority.');
    }

    survey.status = 'approved';
    survey.reviewStatus = 'approved';
    survey.approvalStatus = 'approved';
    survey.approvedById = actor.id;
    survey.approvedByName = actor.name;
    survey.approvedAt = new Date().toISOString();
    survey.approvalNotes = notes?.trim() || 'Technical measurements, shadow analysis, and electrical grid parameters verified and approved.';
    survey.updatedAt = new Date().toISOString();

    const auditEvent: WorkflowAuditEvent = {
      id: `aud-${Date.now()}`,
      surveyId: survey.id,
      surveyNumber: survey.surveyNumber,
      eventType: 'report_approved',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
      previousStatus: survey.reviewStatus,
      newStatus: 'approved',
      comments: survey.approvalNotes,
      version: survey.version
    };

    if (!survey.workflowAuditTrail) survey.workflowAuditTrail = [];
    survey.workflowAuditTrail.unshift(auditEvent);

    await auditService.record({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      permissionUsed: 'surveys.approve',
      action: 'SURVEY_APPROVE',
      entity: 'SiteSurvey',
      entityId: survey.id,
      newState: { status: 'approved', approvedByName: actor.name, approvedAt: survey.approvedAt },
      reason: 'Final engineering quality gate sign-off completed'
    });

    return survey;
  }

  /**
   * Rejects an unfeasible survey report
   */
  async rejectSurvey(surveyId: string, reason: string, actor: { id: string; name: string; role: string }) {
    if (!reason?.trim()) {
      throw new AppError(422, 'VALIDATION_FAILED', 'Specific engineering justification for rejection is mandatory');
    }

    const survey = await this.getSurveyById(surveyId);

    if (survey.technicianId && (survey.technicianId === actor.id || survey.technicianName?.toLowerCase().includes(actor.name.toLowerCase()))) {
      throw new AppError(403, 'SELF_REJECTION_PROHIBITED', 'Survey technician cannot reject their own report as an engineering authority');
    }

    if (actor.role === 'survey_tech') {
      throw new AppError(403, 'FORBIDDEN', 'Survey technicians lack engineering rejection authority');
    }



    survey.status = 'rejected';
    survey.reviewStatus = 'rejected';
    survey.approvalStatus = 'rejected';
    survey.approvedById = actor.id;
    survey.approvedByName = actor.name;
    survey.rejectionReason = reason.trim();
    survey.updatedAt = new Date().toISOString();

    const auditEvent: WorkflowAuditEvent = {
      id: `aud-${Date.now()}`,
      surveyId: survey.id,
      surveyNumber: survey.surveyNumber,
      eventType: 'report_rejected',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
      previousStatus: survey.reviewStatus,
      newStatus: 'rejected',
      comments: `Survey rejected: ${reason.trim()}`,
      version: survey.version
    };

    if (!survey.workflowAuditTrail) survey.workflowAuditTrail = [];
    survey.workflowAuditTrail.unshift(auditEvent);

    await auditService.record({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      permissionUsed: 'surveys.reject',
      action: 'SURVEY_REJECT',
      entity: 'SiteSurvey',
      entityId: survey.id,
      newState: { status: 'rejected', rejectionReason: reason.trim() },
      reason: 'Engineering survey marked unfeasible'
    });

    return survey;
  }

  /**
   * Returns chronological audit history of workflow events
   */
  async getAuditTrail(surveyId: string) {
    const survey = await this.getSurveyById(surveyId);


    return survey.workflowAuditTrail || [];
  }
}

export const surveyService = new SurveyService();
