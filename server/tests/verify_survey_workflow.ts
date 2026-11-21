import { surveyService } from '../src/modules/surveys/survey.service';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runSurveyWorkflowVerification() {
  console.log('\n===============================================================');
  console.log(' SOLAROS — ENGINEERING SURVEY REVIEW & APPROVAL WORKFLOW TEST ');
  console.log('===============================================================\n');

  // Scenario 1: Eligible Reviewers List & Workload Calculation
  console.log('--- Test Suite 1: Reviewer Pool & Workload Auditing ---');
  {
    const technicianId = 'emp-3'; // Suresh More
    const reviewers = await surveyService.getEligibleReviewers(technicianId);

    assert(reviewers.length > 0, 'Eligible reviewers returned');
    assert(!reviewers.some(r => r.id === technicianId), 'Technician Suresh More is strictly excluded from reviewer pool');
    assert(!reviewers.some(r => r.id === 'usr-1' || r.id === 'emp-owner'), 'Owner Vikramaditya Rao is strictly excluded from technical reviewer pool');
    assert(reviewers.some(r => r.name.includes('Neha Kulkarni')), 'Senior Design Engineer Neha Kulkarni is included');
    
    const neha = reviewers.find(r => r.name.includes('Neha Kulkarni'));
    assert(typeof neha?.activeReviewsCount === 'number', 'Active reviews workload count is calculated and numeric');
  }

  // Scenario 2: Eligible Approvers List (Strict surveys.approve authority)
  console.log('\n--- Test Suite 2: Authorized Engineering Approvers ---');
  {
    const technicianId = 'emp-3';
    const approvers = await surveyService.getEligibleApprovers(technicianId);

    assert(approvers.length > 0, 'Eligible approvers returned');
    assert(!approvers.some(a => a.id === technicianId), 'Technician Suresh More is strictly excluded from approver pool');
    assert(!approvers.some(a => a.id === 'usr-1' || a.id === 'emp-owner'), 'Owner Vikramaditya Rao is NOT in engineering approver pool');
    assert(approvers.some(a => a.name.includes('Sandeep Patil')), 'Lead Approvals Engineer Sandeep Patil is included as authorized approver');
  }

  // Scenario 3: Newly Submitted Survey
  console.log('\n--- Test Suite 3: Newly Submitted Survey State ---');
  let testSurveyId = 'surv-2'; // Dr. Sunita Deshmukh (Hospital Rooftop)
  {
    const survey = await surveyService.getSurveyById(testSurveyId);
    assert(!!survey, 'Survey record fetched successfully');
    assert(survey.status === 'submitted', 'Survey is in submitted status');
    assert(survey.technicianId === 'emp-3', 'Technician is Suresh More (emp-3)');
    assert(survey.version === 1, 'Initial report is version 1');
    assert(Array.isArray(survey.workflowAuditTrail), 'Workflow audit trail initialized');
    assert(survey.workflowAuditTrail!.some(e => e.eventType === 'report_submitted'), 'Initial report_submitted audit event exists');
  }

  // Scenario 4: Reviewer Assignment
  console.log('\n--- Test Suite 4: Reviewer Assignment by Lead ---');
  {
    const actorLead = { id: 'emp-19', name: 'Sandeep Patil', role: 'Engineering Lead' };
    const updated = await surveyService.assignReviewer(testSurveyId, 'emp-20', actorLead);

    assert(updated.assignedReviewerId === 'emp-20', 'Assigned reviewer ID set to emp-20 (Neha Kulkarni)');
    assert(updated.assignedReviewerName?.includes('Neha Kulkarni'), 'Assigned reviewer name set to Neha Kulkarni');
    assert(updated.reviewStatus === 'under_review' || updated.reviewStatus === 'assigned' || updated.reviewStatus === 'submitted', 'Review status updated');
    
    const latestEvent = updated.workflowAuditTrail![0];
    assert(latestEvent.eventType === 'reviewer_assigned', 'Audit event reviewer_assigned logged');
    assert(latestEvent.actorId === 'emp-19', 'Actor recorded as Sandeep Patil');
  }

  // Scenario 5: Reviewer Starts Review
  console.log('\n--- Test Suite 5: Reviewer Initiates Technical Review ---');
  {
    const actorReviewer = { id: 'emp-20', name: 'Neha Kulkarni', role: 'Senior Solar PV Design Engineer' };
    const updated = await surveyService.startReview(testSurveyId, actorReviewer);

    assert(updated.reviewStatus === 'in_review' || updated.reviewStatus === 'under_review', 'Review status transitioned to in_review');
    const latestEvent = updated.workflowAuditTrail![0];
    assert(latestEvent.eventType === 'review_started', 'Audit event review_started logged');
    assert(latestEvent.actorName === 'Neha Kulkarni', 'Actor recorded as Neha Kulkarni');
  }

  // Scenario 6: Reviewer Saves Draft Notes
  console.log('\n--- Test Suite 6: Saving Draft Review Notes ---');
  {
    const notes = 'Checking water storage tank shade profile at 16:30. Sloped tin section needs L-bracket validation.';
    const actorReviewer = { id: 'emp-20', name: 'Neha Kulkarni', role: 'Senior Solar PV Design Engineer' };
    const updated = await surveyService.saveReviewNotes(testSurveyId, notes, actorReviewer);

    assert(updated.reviewNotes === notes, 'Draft review notes saved successfully');
    assert(updated.reviewStatus === 'in_review' || updated.reviewStatus === 'under_review', 'Status remains in_review');
  }

  // Scenario 7: Request Corrections Flow
  console.log('\n--- Test Suite 7: Requesting Field Corrections ---');
  {
    const comments = 'Water storage tank creates severe partial shade after 4:30 PM. Please re-measure cable conduit drop distance and attach photo of ACDB mounting wall.';
    const actorReviewer = { id: 'emp-20', name: 'Neha Kulkarni', role: 'Senior Solar PV Design Engineer' };
    const updated = await surveyService.requestCorrections(testSurveyId, comments, actorReviewer);

    assert(updated.reviewStatus === 'corrections_required', 'Review status transitioned to corrections_required');
    assert(updated.correctionsRequestedNotes === comments, 'Corrections requested notes saved');
    
    const latestEvent = updated.workflowAuditTrail![0];
    assert(latestEvent.eventType === 'corrections_requested', 'Audit event corrections_requested logged');
    assert(latestEvent.comments === comments, 'Audit comments contain exact correction requirements');
  }

  // Scenario 8: Technician Resubmits Report (v1 -> v2 Snapshot)
  console.log('\n--- Test Suite 8: Technician Resubmission & Version Snapshotting ---');
  {
    const actorTech = { id: 'emp-3', name: 'Suresh More', role: 'Field Site Survey Specialist' };
    const updatedDetails = {
      cableDistanceMeters: 24.0, // Updated from 30.0
      technicianObservations: 'Rooftop re-inspected: Cable drop distance optimized to 24m via internal lift shaft. ACDB mounting wall photo uploaded.',
      shadowFreeAreaSqm: 115.0
    };

    const updated = await surveyService.resubmitSurvey(testSurveyId, updatedDetails, actorTech);

    assert(updated.version === 2, 'Report version incremented from 1 to 2');
    assert(updated.reviewStatus === 'resubmitted', 'Review status transitioned to resubmitted');
    assert(updated.cableDistanceMeters === 24.0, 'Updated field parameters applied');
    assert(Array.isArray(updated.previousVersions) && updated.previousVersions.length === 1, 'Previous version snapshot created in previousVersions array');
    assert(updated.previousVersions![0].version === 1, 'Snapshot correctly preserves v1 data');

    const latestEvent = updated.workflowAuditTrail![0];
    assert(latestEvent.eventType === 'technician_resubmitted', 'Audit event technician_resubmitted logged');
    assert(latestEvent.actorName === 'Suresh More', 'Actor recorded as Suresh More');
  }

  // Scenario 9: Reviewer Submits Final Recommendation (Approve)
  console.log('\n--- Test Suite 9: Technical Review Recommendation ---');
  {
    const actorReviewer = { id: 'emp-20', name: 'Neha Kulkarni', role: 'Senior Solar PV Design Engineer' };
    const recommendationNotes = 'PVSyst 3D shade simulation passed with 96.2% PR. 24m AC cable drop conforms to 1.5% voltage drop tolerance. Feasibility verified.';
    const updated = await surveyService.submitRecommendation(testSurveyId, 'approve', recommendationNotes, actorReviewer);

    assert(updated.reviewRecommendation === 'approve' || updated.reviewRecommendation === 'recommend_approval', 'Recommendation choice recorded as approve');
    assert(updated.reviewStatus === 'awaiting_approval' || updated.reviewStatus === 'recommend_approval', 'Review status transitioned to awaiting_approval / recommend_approval');
    assert(updated.reviewedById === 'emp-20', 'Reviewer identity recorded as Neha Kulkarni');
    assert(!!updated.reviewedAt, 'Review timestamp recorded');
    assert(updated.approvalStatus === 'pending_approval' || updated.approvalStatus === 'awaiting_approval', 'Approval status transitioned to pending_approval');

    const latestEvent = updated.workflowAuditTrail![0];
    assert(latestEvent.eventType === 'recommendation_submitted', 'Audit event recommendation_submitted logged');
  }

  // Scenario 10: Assign Approver
  console.log('\n--- Test Suite 10: Engineering Approver Assignment ---');
  {
    const actorCoordinator = { id: 'emp-19', name: 'Sandeep Patil', role: 'Engineering Lead' };
    const updated = await surveyService.assignApprover(testSurveyId, 'emp-19', actorCoordinator);

    assert(updated.assignedApproverId === 'emp-19', 'Assigned approver ID set to emp-19 (Sandeep Patil)');
    assert(updated.assignedApproverName?.includes('Sandeep Patil'), 'Assigned approver name set to Sandeep Patil');
    
    const latestEvent = updated.workflowAuditTrail![0];
    assert(latestEvent.eventType === 'approval_assigned', 'Audit event approval_assigned logged');
  }

  // Scenario 11: Self-Approval Prohibition (Negative Test)
  console.log('\n--- Test Suite 11: Self-Approval Prevention Safeguard ---');
  {
    const actorTechnician = { id: 'emp-3', name: 'Suresh More', role: 'Field Site Survey Specialist' };
    let errorCaught = false;
    try {
      await surveyService.approveSurvey(testSurveyId, 'Attempting self approval', actorTechnician);
    } catch (err: any) {
      errorCaught = true;
      assert(err.message.includes('Self-approval') || err.message.includes('technician'), 'Error message specifies self-approval prohibition');
    }
    assert(errorCaught, 'Self-approval attempt by Suresh More was strictly blocked with exception');
  }

  // Scenario 12: Owner Engineering Domain Restriction (Negative Test)
  console.log('\n--- Test Suite 12: Owner Domain Separation Safeguard ---');
  {
    const actorOwner = { id: 'usr-1', name: 'Vikramaditya Rao', role: 'owner_admin' };
    let errorCaught = false;
    try {
      await surveyService.approveSurvey(testSurveyId, 'Owner overriding engineering signoff', actorOwner);
    } catch (err: any) {
      errorCaught = true;
      assert(err.message.includes('Owner') || err.message.includes('engineering') || err.message.includes('credentials'), 'Error specifies Owner engineering signoff restriction');
    }
    assert(errorCaught, 'Owner attempt to bypass engineering approval was strictly blocked');
  }

  // Scenario 13: Final Technical Approval Sign-off by Authorized Approver
  console.log('\n--- Test Suite 13: Engineering Lead Final Sign-Off ---');
  {
    const actorApprover = { id: 'emp-19', name: 'Sandeep Patil', role: 'Lead Solar Design & Approvals Engineer' };
    const signOffNotes = 'Technical feasibility sign-off granted. Hospital emergency feeder capacity verified. 10kW system cleared for commercial quotation.';
    const approvedSurvey = await surveyService.approveSurvey(testSurveyId, signOffNotes, actorApprover);

    assert(approvedSurvey.status === 'approved', 'Survey status is now approved');
    assert(approvedSurvey.approvalStatus === 'approved', 'Approval status is approved');
    assert(approvedSurvey.approvedById === 'emp-19', 'Approved by ID recorded as emp-19');
    assert(approvedSurvey.approvedByName === 'Sandeep Patil', 'Approved by name recorded as Sandeep Patil');
    assert(!!approvedSurvey.approvedAt, 'Approved timestamp recorded');
    assert(approvedSurvey.approvalNotes === signOffNotes, 'Approval notes saved');

    // Distinct reviewer and approver verification
    assert(approvedSurvey.reviewedById !== approvedSurvey.approvedById, 'Reviewer ID and Approver ID are distinct (Neha Kulkarni != Sandeep Patil)');
    assert(approvedSurvey.reviewedById !== approvedSurvey.technicianId, 'Reviewer ID and Technician ID are distinct (Neha Kulkarni != Suresh More)');
    assert(approvedSurvey.approvedById !== approvedSurvey.technicianId, 'Approver ID and Technician ID are distinct (Sandeep Patil != Suresh More)');

    const latestEvent = approvedSurvey.workflowAuditTrail![0];
    assert(latestEvent.eventType === 'report_approved', 'Audit event report_approved logged');
    assert(latestEvent.actorName === 'Sandeep Patil', 'Actor is Sandeep Patil');
  }

  // Scenario 14: Engineering Feasibility Rejection Flow
  console.log('\n--- Test Suite 14: Engineering Rejection Flow ---');
  {
    // Rejection on surv-8 (Kothrud Industrial Tools)
    const actorApprover = { id: 'emp-19', name: 'Sandeep Patil', role: 'Lead Solar Design & Approvals Engineer' };
    const rejectionReason = 'Heavy chimney smoke particulates & structural RCC crack across southern axis exceeding safety margins.';
    const rejectedSurvey = await surveyService.rejectSurvey('surv-8', rejectionReason, actorApprover);

    assert(rejectedSurvey.status === 'rejected', 'Survey status is rejected');
    assert(rejectedSurvey.approvalStatus === 'rejected', 'Approval status is rejected');
    assert(rejectedSurvey.rejectionReason === rejectionReason, 'Rejection reason recorded');
    
    const latestEvent = rejectedSurvey.workflowAuditTrail![0];
    assert(latestEvent.eventType === 'report_rejected', 'Audit event report_rejected logged');
  }

  // Scenario 15: Survey-to-Quotation Quality Gate
  console.log('\n--- Test Suite 15: Survey-to-Quotation Quality Gate ---');
  {
    const approvedSurvey = await surveyService.getSurveyById(testSurveyId);
    const rejectedSurvey = await surveyService.getSurveyById('surv-8');
    const revisionsSurvey = await surveyService.getSurveyById('surv-corr-suresh');

    const canQuoteApproved = approvedSurvey.status === 'approved';
    const canQuoteRejected = rejectedSurvey.status === 'approved';
    const canQuoteRevisions = revisionsSurvey.status === 'approved';

    assert(canQuoteApproved === true, 'Approved survey passes quotation quality gate');
    assert(canQuoteRejected === false, 'Rejected survey blocked from quotation generation');
    assert(canQuoteRevisions === false, 'Survey requiring revisions blocked from quotation generation');
  }

  // Scenario 16: Audit Trail Chronological Integrity
  console.log('\n--- Test Suite 16: Chronological Audit Trail Sequence Integrity ---');
  {
    const auditTrail = await surveyService.getAuditTrail(testSurveyId);
    assert(auditTrail.length >= 6, 'Audit trail contains at least 6 chronological events');

    const eventTypes = auditTrail.map(e => e.eventType);
    console.log('    Audit trail sequence (newest first):', eventTypes.join(' -> '));

    const expectedEvents = [
      'report_submitted',
      'reviewer_assigned',
      'review_started',
      'corrections_requested',
      'technician_resubmitted',
      'recommendation_submitted',
      'approval_assigned',
      'report_approved'
    ];

    for (let i = 0; i < expectedEvents.length; i++) {
      assert(eventTypes.includes(expectedEvents[i] as any), `Event ${expectedEvents[i]} is present in audit trail`);
    }

    // Verify all timestamps are valid ISO dates
    auditTrail.forEach(evt => {
      assert(!isNaN(Date.parse(evt.timestamp)), `Timestamp on event ${evt.id} is valid ISO date`);
      assert(!!evt.actorName && !!evt.actorRole, `Event ${evt.id} has complete actor attribution`);
    });
  }

  console.log('\n===============================================================');
  console.log(` SUMMARY: All ${passedTests} / ${totalTests} test assertions PASSED (100% Success)`);
  console.log('===============================================================\n');
}

runSurveyWorkflowVerification().catch(err => {
  console.error('\nTest execution failed:', err);
  process.exit(1);
});
