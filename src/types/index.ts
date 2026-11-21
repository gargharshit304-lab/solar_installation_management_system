export type UserRole =
  | 'owner_admin'
  | 'sales_exec'
  | 'survey_tech'
  | 'engineering_lead'
  | 'warehouse_mgr'
  | 'install_tech'
  | 'support_exec'
  | 'accountant';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  department: string;
  isChiefSurveySpecialist?: boolean;
  canAssignSurveys?: boolean;
  canViewTeam?: boolean;
  canApproveSurveys?: boolean;
  permissions?: string[];
}

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'survey_scheduled'
  | 'survey_completed'
  | 'quotation_sent'
  | 'negotiation'
  | 'converted'
  | 'lost';

export type SystemType = 'on_grid' | 'off_grid' | 'hybrid';

export interface CustomerSite {
  id: string;
  customerId: string;
  siteLabel: string; // e.g. "Primary Residence", "Branch Warehouse", "Plot 48 MIDC Plant"
  address: string;
  city: string;
  state: string;
  pincode: string;
  propertyType: string; // e.g. "RCC Flat Terrace", "Sloped Metal Tin Shed", "Sloping Tiled Roof", "Commercial RCC Slab"
  sanctionedLoadKw?: number;
  phaseType?: 'single_phase' | 'three_phase';
}

export interface Customer {
  id: string;
  customerCode: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  monthlyElectricityBill: number;
  interestedCapacityKw: number;
  preferredSystemType: SystemType;
  roofSpaceSqft: number;
  roofType: string;
  enquirySource: 'website' | 'phone_call' | 'whatsapp' | 'manual' | 'referral';
  assignedSalesperson: string;
  leadStatus: LeadStatus;
  registrationDate: string;
  notes?: string;
  sites?: CustomerSite[];
}

export type SurveyStatus =
  | 'unassigned'
  | 'scheduled'
  | 'assigned'
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'rescheduled'
  | 'cancelled';

export type TechnicianAvailabilityStatus = 'available' | 'assigned' | 'on_site' | 'unavailable' | 'on_leave';

export interface SurveyAssignmentAudit {
  id: string;
  surveyId: string;
  surveyNumber: string;
  technicianId: string;
  technicianName: string;
  assignedAt: string;
  assignedBy: string;
  action: 'assigned' | 'reassigned' | 'rescheduled';
  reason?: string;
  previousTechnicianName?: string;
  scheduledDate: string;
  timeSlot?: string;
}

export interface TechnicianLeave {
  id: string;
  technicianId: string;
  technicianName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  leaveType: 'sick' | 'casual' | 'vacation';
  status: 'approved' | 'pending';
  reason: string;
}

export interface SurveyPhotoAttachment {
  id: string;
  category: 'Rooftop Overview' | 'Roof Measurements' | 'Shadow Analysis' | 'Electrical Panel' | 'Proposed Inverter Location' | 'Cable Route' | 'Other';
  url: string;
  caption?: string;
  uploadedAt: string;
}

export interface SiteSurvey {
  id: string;
  surveyNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  siteId?: string;
  siteLabel?: string;
  propertyType?: string;
  pincode?: string;
  scheduledDate: string;
  timeSlot?: string; // e.g. "10:00 AM - 12:00 PM"
  estimatedDurationMinutes?: number;
  instructions?: string;
  technicianId?: string;
  technicianName?: string;
  status: SurveyStatus;
  distanceKm?: number;

  // Section A: Rooftop Measurements
  roofType?: string; // 'RCC Flat Concrete', 'Sloped Metal Tin Shed', 'Sloping Tiled Roof', 'Terrace with Shed'
  roofLengthM?: number;
  roofWidthM?: number;
  roofDimensions?: {
    lengthM: number;
    widthM: number;
  };
  totalRoofAreaSqm?: number;
  shadowFreeAreaSqm?: number;
  roofDirection?: string; // 'South', 'South-East', 'South-West', 'East', 'West', 'North'
  roofTiltDegrees?: number;
  roofCondition?: 'good' | 'fair' | 'needs_reinforcement';
  availableInstallationSpace?: string;

  // Section B: Shadow Analysis
  nearbyObstructions?: string;
  shadowObservations?: string;
  estimatedShadingImpactPct?: number;

  // Section C: Electrical Information
  gridConnectionAvailable?: boolean;
  existingConnectionPhase?: 'single_phase' | 'three_phase';
  mainPanelCondition?: 'good' | 'acceptable' | 'upgrade_required';
  proposedInverterLocation?: string;
  cableDistanceMeters?: number;
  sanctionedLoadKw?: number;
  meterNumber?: string;
  phaseType?: 'single_phase' | 'three_phase';
  transformerDistanceM?: number;
  earthingRequirement?: string;
  additionalElectricalObservations?: string;

  // Section D: Site Conditions
  roofAccessibility?: string;
  structuralConcerns?: string;
  installationObstacles?: string;
  safetyConsiderations?: string;
  waterLeakageConcerns?: string;
  additionalSiteObservations?: string;

  // Section E: Technician Notes & Attachments
  technicianObservations?: string;
  technicianNotes?: string;
  photos?: string[];
  documents?: string[];
  surveyPhotos?: SurveyPhotoAttachment[];

  // Workflow timestamps & review state
  surveyStartedAt?: string;
  submittedAt?: string;
  reviewStatus?: 'draft' | 'unassigned' | 'assigned' | 'submitted' | 'under_review' | 'in_review' | 'corrections_required' | 'revisions_required' | 'resubmitted' | 'awaiting_approval' | 'recommend_approval' | 'recommend_rejection' | 'approved' | 'rejected';
  approvalStatus?: 'unassigned' | 'pending_assignment' | 'under_review' | 'revisions_required' | 'pending_approval' | 'awaiting_approval' | 'approved' | 'rejected';

  // Reviewer attribution
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  reviewedById?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reviewRecommendation?: 'recommend_approval' | 'revisions_required' | 'recommend_rejection' | 'approve' | 'reject';
  correctionsRequestedNotes?: string;

  // Final Approver attribution
  assignedApproverId?: string;
  assignedApproverName?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  approvalNotes?: string;
  engineeringApproverName?: string;
  engineeringReviewNotes?: string;
  rejectionReason?: string;

  isDraft?: boolean;
  version?: number;
  assignmentHistory?: SurveyAssignmentAudit[];
  previousVersions?: SurveyVersionHistoryItem[];
  workflowAuditTrail?: SurveyWorkflowAuditEvent[];
}

export type SurveyWorkflowEventType =
  | 'report_submitted'
  | 'reviewer_assigned'
  | 'reviewer_reassigned'
  | 'review_started'
  | 'review_notes_saved'
  | 'corrections_requested'
  | 'technician_resubmitted'
  | 'recommendation_submitted'
  | 'approval_assigned'
  | 'report_approved'
  | 'report_rejected';

export interface SurveyWorkflowAuditEvent {
  id: string;
  surveyId: string;
  surveyNumber?: string;
  eventType: SurveyWorkflowEventType;
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  previousStatus?: string;
  newStatus?: string;
  summary?: string;
  comments?: string;
  notes?: string;
  version?: number;
  metadata?: Record<string, any>;
}

export interface SurveyVersionHistoryItem {
  version: number;
  submittedAt: string;
  technicianName?: string;
  submittedBy?: string;
  notes?: string;
  snapshot?: any;
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

export interface SolarPackage {
  id: string;
  code: string;
  name: string;
  type: 'on_grid' | 'off_grid' | 'panel_set';
  capacityKw: number;
  description: string;
  basePrice: number;
  components: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
  }[];
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  surveyId?: string;
  packageId: string;
  packageName: string;
  packageType: 'on_grid' | 'off_grid' | 'panel_set';
  capacityKw: number;
  hardwareSubtotal: number;
  installationCharges: number;
  applicableTaxes: number;
  taxPercent: number;
  discount: number;
  subsidyAmount: number;
  totalAmount: number;
  paymentTerms: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  createdDate: string;
  validUntil: string;
  preparedBy: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'installation_scheduled'
  | 'completed'
  | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  quotationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  capacityKw: number;
  totalOrderValue: number;
  advanceAmountPaid: number;
  outstandingBalance: number;
  orderStatus: OrderStatus;
  paymentStatus: 'unpaid' | 'partially_paid' | 'fully_paid';
  orderDate: string;
  dispatchId?: string;
  installationId?: string;
}

export interface PaymentRecord {
  id: string;
  paymentNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'upi' | 'cheque' | 'cash';
  transactionRef: string;
  paymentStage: 'advance' | 'dispatch_milestone' | 'final_commissioning';
  paymentDate: string;
  recordedBy: string;
  status?: 'pending' | 'completed' | 'verified' | 'failed';
  verifiedBy?: string;
  verifiedAt?: string;
}

export type ProductCategory =
  | 'Solar Panels'
  | 'Inverters'
  | 'Batteries'
  | 'Controllers'
  | 'Charge Controllers'
  | 'Connectors'
  | 'Wires and Cables'
  | 'Wires'
  | 'Wiring Boxes'
  | 'Mounting Stands and Structures'
  | 'Metal Stands'
  | 'Safety Equipment';

export type ProductTrackingType = 'quantity_tracked' | 'serialized';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  managerId: string;
  managerName: string;
  contactPhone: string;
  status: 'active' | 'maintenance' | 'inactive';
  totalCapacitySqft: number;
  activeZones: string[];
}

export interface StorageLocation {
  id: string;
  warehouseId: string;
  warehouseName: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  fullCode: string; // e.g. "MAIN-WH-ZONE-A-RACK-01-SH-02-BIN-05"
  barcode: string;
  status: 'available' | 'full' | 'maintenance';
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  gstNumber?: string;
  leadTimeDays: number;
  paymentTerms: string;
  status: 'active' | 'preferred' | 'inactive';
  productCategories: ProductCategory[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  brand?: string;
  model?: string;
  description?: string;
  imageUrl?: string;
  unitOfMeasure?: string;
  availableQuantity: number;
  reservedQuantity: number;
  inTransitQuantity?: number;
  damagedQuantity?: number;
  minimumThreshold: number;
  reorderLevel?: number;
  unitCost: number;
  sellingPrice: number;
  supplier: string;
  supplierId?: string;
  hasSerialTracking: boolean;
  trackingType?: ProductTrackingType;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  preferredWarehouseId?: string;
  preferredWarehouseName?: string;
  locationBin: string;
  specifications?: {
    capacityKw?: number;
    voltage?: string;
    powerRating?: string;
    phaseType?: 'single_phase' | 'three_phase';
    dimensions?: string;
    weightKg?: number;
  };
}

export type SerialNumberStatus =
  | 'received'
  | 'in_stock'
  | 'reserved'
  | 'allocated'
  | 'picked'
  | 'packed'
  | 'dispatched'
  | 'delivered'
  | 'installed'
  | 'under_service'
  | 'returned'
  | 'damaged'
  | 'written_off'
  // Legacy aliases
  | 'in_warehouse'
  | 'defective';

export interface SerialNumberRecord {
  id: string;
  serialNumber: string;
  productId: string;
  productName: string;
  brand?: string;
  model?: string;
  category: string;
  warehouseId?: string;
  warehouseName?: string;
  locationBin?: string;
  purchaseDate: string;
  supplier: string;
  supplierId?: string;
  receivingReference?: string;
  currentStatus: SerialNumberStatus;
  assignedCustomer?: string;
  customerId?: string;
  relatedOrderId?: string;
  orderNumber?: string;
  dispatchId?: string;
  dispatchNumber?: string;
  deliveryDate?: string;
  warrantyRecordId?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  notes?: string;
}

export interface GoodsReceiptItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  category: ProductCategory;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  unitCost: number;
  serialNumbers: string[];
  batchNumber?: string;
  rejectionReason?: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  supplierId: string;
  supplierName: string;
  poReference?: string;
  deliveryChallanNo: string;
  receivingDate: string;
  warehouseId: string;
  warehouseName: string;
  receivedById: string;
  receivedByName: string;
  status: 'draft' | 'under_inspection' | 'confirmed' | 'rejected';
  items: GoodsReceiptItem[];
  totalReceivedQty: number;
  totalAcceptedQty: number;
  totalRejectedQty: number;
  totalValue: number;
  remarks?: string;
  documents?: string[];
  confirmedAt?: string;
}

export type StockMovementType =
  | 'opening_stock'
  | 'goods_receipt'
  | 'stock_adjustment'
  | 'transfer_out'
  | 'transfer_in'
  | 'order_reservation'
  | 'reservation_release'
  | 'picking'
  | 'packing'
  | 'dispatch'
  | 'delivery'
  | 'return'
  | 'damage'
  | 'write_off'
  | 'installation_consumption'
  | 'correction';

export interface StockMovementRecord {
  id: string;
  movementNumber: string;
  timestamp: string;
  productId: string;
  sku: string;
  productName: string;
  category: ProductCategory;
  movementType: StockMovementType;
  sourceWarehouse?: string;
  destinationWarehouse?: string;
  sourceLocation?: string;
  destinationLocation?: string;
  quantity: number;
  unitCost?: number;
  totalValue?: number;
  referenceType: string; // 'GRN' | 'ORDER' | 'DISPATCH' | 'TRANSFER' | 'AUDIT'
  referenceNumber: string;
  orderId?: string;
  customerName?: string;
  serialNumbers?: string[];
  executedById: string;
  executedByName: string;
  approvedById?: string;
  approvedByName?: string;
  remarks?: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentCode: string;
  productId: string;
  sku: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  locationBin: string;
  previousQuantity: number;
  newQuantity: number;
  quantityDelta: number;
  adjustmentReason: 'damaged_goods' | 'counting_discrepancy' | 'supplier_shortage' | 'write_off' | 'audit_reconciliation' | 'other';
  supportingNotes: string;
  requestedById: string;
  requestedByName: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  approvedById?: string;
  approvedByName?: string;
  createdAt: string;
}

export interface StockReservation {
  id: string;
  reservationCode: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  productId: string;
  sku: string;
  productName: string;
  quantityReserved: number;
  allocatedSerials: string[];
  warehouseId: string;
  warehouseName: string;
  status: 'pending_allocation' | 'partially_allocated' | 'fully_allocated' | 'shortage' | 'released' | 'cancelled';
  createdAt: string;
}

export interface WarehouseTransferItem {
  productId: string;
  sku: string;
  productName: string;
  category: ProductCategory;
  requestedQty: number;
  transferredQty: number;
  receivedQty: number;
  serialNumbers?: string[];
}

export interface WarehouseTransfer {
  id: string;
  transferNumber: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  sourceLocation: string;
  destinationLocation: string;
  items: WarehouseTransferItem[];
  status: 'draft' | 'requested' | 'approved' | 'picking' | 'in_transit' | 'received' | 'completed' | 'rejected' | 'discrepancy';
  requestedById: string;
  requestedByName: string;
  approvedById?: string;
  approvedByName?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  expectedDate: string;
  notes?: string;
  discrepancyNotes?: string;
  createdAt: string;
  receivedAt?: string;
}

export interface StockCountItem {
  productId: string;
  sku: string;
  productName: string;
  category: ProductCategory;
  locationBin: string;
  expectedQty: number;
  countedQty?: number;
  difference?: number;
  serialNumbersCounted?: string[];
  notes?: string;
}

export interface StockCountSession {
  id: string;
  sessionCode: string;
  title: string;
  warehouseId: string;
  warehouseName: string;
  zone?: string;
  countType: 'cycle_count' | 'full_warehouse' | 'category_spot_check';
  status: 'scheduled' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  assignedStaffId: string;
  assignedStaffName: string;
  scheduledDate: string;
  completedDate?: string;
  items: StockCountItem[];
  reviewerNotes?: string;
  reviewedById?: string;
  reviewedByName?: string;
}

export interface WarehouseTask {
  id: string;
  taskCode: string;
  taskType: 'goods_receipt' | 'order_picking' | 'order_packing' | 'transfer_out' | 'transfer_in' | 'stock_count' | 'serial_scan';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  title: string;
  warehouseId: string;
  warehouseName: string;
  assignedStaffId: string;
  assignedStaffName: string;
  relatedReferenceId?: string;
  relatedReferenceNumber?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'discrepancy' | 'cancelled';
  instructions: string;
  dueDate: string;
  completedAt?: string;
  discrepancyReport?: string;
}

export interface WarrantyRuleConfig {
  category: ProductCategory;
  defaultDurationYears: number;
  description: string;
}

export interface DispatchOrder {
  id: string;
  dispatchNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  warehouseId?: string;
  warehouseName?: string;
  allocatedSerials: string[];
  dispatchDate: string;
  deliveryPersonnel: string;
  vehicleNumber: string;
  deliveryStatus: 'pending' | 'ready_for_dispatch' | 'in_transit' | 'delivered';
  pickedAt?: string;
  packedAt?: string;
  deliveredAt?: string;
  proofOfDeliveryUrl?: string;
  receivedByName?: string;
  deliveryRemarks?: string;
}

export type InstallationStatus =
  | 'scheduled'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'delayed'
  | 'cancelled';

export interface Installation {
  id: string;
  installationCode: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  capacityKw: number;
  systemType: 'on_grid' | 'off_grid';
  scheduledDate: string;
  scheduledEndDate: string;
  actualStartTime?: string;
  actualFinishTime?: string;
  assignedTechnicianIds: string[];
  technicianNames: string[];
  status: InstallationStatus;
  checklist: {
    structureMounting: boolean;
    panelsMounted: boolean;
    earthingPitConnected: boolean;
    lightningArresterInstalled: boolean;
    inverterWired: boolean;
    dcWiringTested: boolean;
    acDbBoxConnected: boolean;
    biDirectionalMeterSync: boolean;
  };
  photos: string[];
  customerSignature?: string;
  customerSignName?: string;
  technicianRemarks?: string;
  // RBAC Attribution & Administrative Oversight metadata
  executedByTechnicianId?: string;
  executedByTechnicianName?: string;
  reassignedBy?: string;
  rescheduledBy?: string;
  adminNotes?: string;
  isDelayed?: boolean;
}

export interface WarrantyRecord {
  id: string;
  serialNumber: string;
  productName: string;
  category: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderId: string;
  orderNumber: string;
  deliveryDate: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  durationYears: number;
  status: 'active' | 'expiring_soon' | 'expired';
}

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'waiting_for_parts' | 'resolved' | 'closed';

export interface ServiceComplaint {
  id: string;
  complaintId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  equipmentSerialNumber: string;
  productName: string;
  faultDescription: string;
  faultCode: string;
  priority: ComplaintPriority;
  assignedTechnicianName?: string;
  complaintDate: string;
  isUnderWarranty: boolean;
  estimatedRepairCost?: number;
  estimatedLabourCost?: number;
  status: TicketStatus;
  resolutionNotes?: string;
}

export interface ProjectProfitability {
  id: string;
  projectCode: string;
  orderId?: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerCity?: string;
  capacityKw: number;
  systemType: string;
  contractedValue?: number;
  invoicedValue?: number;
  verifiedCash?: number;
  revenue: number; // Recognized revenue
  equipmentCosts: number; // Actual dispatched equipment cost
  labourCosts: number; // Approved technician labour cost
  otherExpenses: number; // Direct project expenses
  profit: number; // Net project profit
  profitMarginPercent: number;
  receivables?: number;
  paymentStatus: 'fully_paid' | 'partially_paid' | 'unpaid';
  completionDate: string;
  workflowStage?: 'survey' | 'quotation' | 'advance_paid' | 'dispatched' | 'installed' | 'commissioned' | 'completed';
}

export type FinancialTransactionType =
  | 'revenue'
  | 'invoice'
  | 'payment'
  | 'equipment_cost'
  | 'labour_cost'
  | 'direct_expense'
  | 'vendor_payment'
  | 'refund_adjustment';

export type FinancialTransactionStatus = 'pending' | 'verified' | 'approved' | 'paid' | 'cancelled';

export interface FinancialTransaction {
  id: string;
  transactionNumber: string;
  projectId?: string;
  projectCode?: string;
  orderId?: string;
  orderNumber?: string;
  customerId?: string;
  customerName: string;
  type: FinancialTransactionType;
  category: string;
  amount: number;
  date: string;
  sourceModule: 'orders' | 'inventory_dispatch' | 'installations' | 'direct_expense' | 'payments' | 'finance';
  sourceRecordId: string;
  referenceNumber?: string;
  paymentMethod?: string;
  status: FinancialTransactionStatus;
  createdBy: string;
  recordedBy?: string;
  description?: string;
  notes?: string;
  documentUrl?: string;
  createdAt: string;
}

export type DirectExpenseCategory =
  | 'Technician Labour Expense'
  | 'Freight & Site Transport'
  | 'Crane & Scaffolding Rental'
  | 'DISCOM Inspection Fees'
  | 'Tools & Consumables'
  | 'Civil Works & Mounting Structure'
  | 'Electrical Conduit & Wiring'
  | 'Administrative Overhead';

export interface DirectExpense {
  id: string;
  expenseNumber: string;
  projectId?: string;
  projectCode?: string;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  isCompanyLevel: boolean;
  category: DirectExpenseCategory | string;
  amount: number;
  vendor: string;
  expenseDate: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'reimbursed';
  approvalStatus: 'draft' | 'submitted' | 'approved' | 'rejected';
  invoiceReference?: string;
  description: string;
  receiptUrl?: string;
  receiptFileName?: string;
  recordedBy: string;
  recordedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ProjectFinancialDetail {
  project: {
    id: string;
    projectCode: string;
    orderId: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerCity: string;
    capacityKw: number;
    systemType: string;
    orderDate: string;
    orderStatus: string;
  };
  revenue: {
    contractedValue: number;
    invoicedValue: number;
    recognizedRevenue: number;
    verifiedCashCollected: number;
    outstandingReceivables: number;
    invoices: Array<{
      invoiceNumber: string;
      stage: string;
      amount: number;
      date: string;
      status: string;
    }>;
    payments: Array<{
      paymentNumber: string;
      stage: string;
      amount: number;
      date: string;
      method: string;
      refNumber: string;
      status: string;
    }>;
  };
  equipment: {
    totalActualCost: number;
    estimatedBomCost: number;
    dispatches: Array<{
      dispatchNumber: string;
      dispatchDate: string;
      status: string;
      items: Array<{
        productName: string;
        category: string;
        quantity: number;
        serials: string[];
        unitCost: number;
        totalCost: number;
      }>;
    }>;
  };
  labour: {
    totalActualCost: number;
    estimatedCost: number;
    workOrders: Array<{
      installationCode: string;
      scheduledDate: string;
      status: string;
      technicians: Array<{
        technicianName: string;
        role: string;
        hours: number;
        hourlyRate: number;
        cost: number;
      }>;
    }>;
  };
  otherExpenses: {
    totalDirectExpenses: number;
    expenses: DirectExpense[];
  };
  profitability: {
    revenue: number;
    equipmentCosts: number;
    labourCosts: number;
    otherExpenses: number;
    netProfit: number;
    profitMarginPercent: number;
  };
  operationalCompletion: {
    surveyApproved: boolean;
    quotationApproved: boolean;
    advancePaymentReceived: boolean;
    materialsDispatched: boolean;
    installationCompleted: boolean;
    customerSignoff: boolean;
    warrantyActivated: boolean;
    currentStage: string;
  };
}

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: UserRole;
  hourlyRate: number;
  skills: string[];
  isAvailable: boolean;
  activeJobs: number;
  rating: number;
  status?: 'active' | 'on_leave' | 'inactive';
  reportingManagerId?: string;
  reportingManagerName?: string;
  joiningDate?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  employmentType?: 'full_time' | 'contract' | 'part_time';
  accountStatus?: 'active' | 'suspended' | 'invited';
  customPermissions?: string[];
  teamId?: string;
  teamName?: string;
  leaveBalanceDays?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  link?: string;
  targetRoles?: UserRole[];
}

export interface AiMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  executedTools?: string[];
  suggestedActions?: { label: string; action: string }[];
}

export type FollowUpStatus = 'pending' | 'completed' | 'overdue' | 'rescheduled';
export type FollowUpPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface FollowUpItem {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  lastInteractionDate: string;
  lastInteractionNotes?: string;
  scheduledDate: string; // ISO string or YYYY-MM-DD HH:mm
  followUpReason: string;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  assignedSalesperson: string;
  completedAt?: string;
  completionNotes?: string;
}

export interface CustomerEnquiry {
  id: string;
  enquiryNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  interestedCapacityKw: number;
  preferredSystemType: SystemType;
  source: 'website' | 'phone_call' | 'whatsapp' | 'manual' | 'referral';
  receivedDate: string;
  leadStatus: LeadStatus;
  nextFollowUpDate?: string;
  assignedSalesperson: string;
  notes?: string;
  slaDeadline?: string;
  slaBreached?: boolean;
  lostReason?: string;
  lostNotes?: string;
  territory?: string;
}

export type SubsidyStatus =
  | 'draft'
  | 'documents_pending'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'disbursed';

export interface SubsidyApplication {
  id: string;
  applicationNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderId?: string;
  orderNumber?: string;
  capacityKw: number;
  schemeName: string;
  applicationAmount: number;
  approvedAmount?: number;
  disbursedAmount?: number;
  submittedDate?: string;
  status: SubsidyStatus;
  discomName: string;
  consumerNumber: string;
  nationalPortalRef?: string;
  sanctionLoadKw: number;
  documents: {
    name: string;
    type: 'electricity_bill' | 'aadhaar' | 'bank_passbook' | 'roof_undertaking' | 'commissioning_report';
    uploaded: boolean;
    verified: boolean;
  }[];
  disbursementDate?: string;
  remarks?: string;
}

export interface CommunicationHistoryItem {
  id: string;
  customerId: string;
  authorName: string;
  type: 'call' | 'whatsapp' | 'meeting' | 'note' | 'email' | 'survey_requested' | 'quotation_sent';
  summary: string;
  details?: string;
  timestamp: string;
}

export type SalesActivityType =
  | 'enquiry_received'
  | 'customer_contacted'
  | 'followup_completed'
  | 'survey_scheduled'
  | 'survey_approved'
  | 'quotation_generated'
  | 'quotation_sent'
  | 'quotation_accepted'
  | 'order_converted';

export interface SalesActivityItem {
  id: string;
  type: SalesActivityType;
  customerName: string;
  customerId: string;
  description: string;
  timestamp: string;
  salesperson: string;
  relatedLink?: string;
}

// ==========================================
// Owner Command Center & Enterprise Types
// ==========================================

export interface Department {
  id: string;
  name: string;
  code: string;
  headEmployeeId: string;
  headEmployeeName: string;
  headDesignation: string;
  description: string;
  teamCount: number;
  employeeCount: number;
  budgetAllocated: number;
  monthlyExpense: number;
  kpiSummary: string;
  iconName?: string;
}

export interface Team {
  id: string;
  departmentId: string;
  departmentName: string;
  name: string;
  teamLeadId: string;
  teamLeadName: string;
  memberCount: number;
  description: string;
  currentObjective?: string;
}

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'assign' | 'approve' | 'export' | 'manage' | 'view_company_wide';

export type CapabilityPermission =
  // Administrative Capabilities (Governance, oversight, delegation)
  | 'company.view_all'
  | 'company.manage_settings'
  | 'employees.view_all'
  | 'employees.create'
  | 'employees.update'
  | 'employees.deactivate'
  | 'employees.assign_roles'
  | 'departments.manage'
  | 'roles_permissions.manage'
  | 'roles_permissions.view'
  | 'roles_permissions.create'
  | 'roles_permissions.edit'
  | 'roles_permissions.delete'
  | 'roles.manage'
  | 'roles.view'
  | 'roles.create'
  | 'roles.edit'
  | 'roles.delete'
  | 'permissions.manage'
  | 'employee_roles.assign'
  | 'approvals.view_all'
  | 'approvals.decide'
  | 'audit.view_all'
  | 'audit.view'
  | 'audit.view_company_wide'
  | 'audit.export'
  | 'activity_center.view'
  | 'exceptions.authorize'
  | 'delegations.manage'

  // Installations Capabilities (Separation: Monitor/Assign vs Execute/Sign)
  | 'installations.view_all'
  | 'installations.view_assigned'
  | 'installations.monitor'
  | 'installations.assign'
  | 'installations.reassign'
  | 'installations.reschedule'
  | 'installations.flag_issue'
  | 'installations.execute'
  | 'installations.start'
  | 'installations.update_checklist'
  | 'installations.capture_signature'
  | 'installations.submit_report'

  // Site Surveys Capabilities (Separation: Schedule/Assign vs Claim/Conduct vs Approve)
  | 'surveys.view_all'
  | 'surveys.view_assigned'
  | 'surveys.view_available'
  | 'surveys.monitor'
  | 'surveys.schedule'
  | 'surveys.assign'
  | 'surveys.reassign'
  | 'surveys.claim'
  | 'surveys.start'
  | 'surveys.enter_measurements'
  | 'surveys.upload_photos'
  | 'surveys.submit_report'
  | 'surveys.review'
  | 'surveys.request_corrections'
  | 'surveys.approve'
  | 'surveys.reject'

  // Warehouse & Logistics Capabilities (Separation: Monitor vs Receive/Scan/Release)
  | 'inventory.view_all'
  | 'inventory.receive'
  | 'inventory.adjust'
  | 'inventory.scan_serial'
  | 'inventory.allocate_serial'
  | 'dispatch.view_all'
  | 'dispatch.prepare'
  | 'dispatch.release'
  | 'dispatch.authorize_override'
  | 'delivery.confirm'

  // Sales Capabilities (Separation: Conversion Pipeline vs Direct Sales Work)
  | 'enquiries.view_all'
  | 'enquiries.create'
  | 'enquiries.update'
  | 'enquiries.mark_lost'
  | 'quotations.create'
  | 'quotations.update'
  | 'quotations.send'
  | 'orders.create'
  | 'orders.view_all'

  // Finance Capabilities (Separation: Executive P&L vs Bookkeeping & Receipts)
  | 'finance.view_all'
  | 'invoices.create'
  | 'payments.record'
  | 'payments.verify'
  | 'expenses.review'
  | 'profitability.view_all'
  | 'subsidies.view'
  | 'subsidies.manage'

  // Support & Warranty Capabilities
  | 'support.tickets.create'
  | 'support.tickets.update'
  | 'support.tickets.resolve'
  | 'warranty.view_all'
  | 'warranty.claims.create'
  | 'warranty.claims.adjudicate';

export interface OperationalDelegation {
  id: string;
  delegationCode: string;
  employeeId: string;
  employeeName: string;
  employeeRole: UserRole;
  grantedPermission: CapabilityPermission;
  departmentScope: string;
  resourceId?: string; // e.g. specific installationId or surveyId
  authorizedByEmployeeId: string;
  authorizedByName: string;
  justification: string;
  startDate: string;
  expiresDate?: string;
  active: boolean;
  createdAt: string;
}

export interface RoleDefinition {
  id: string;
  roleKey: string;
  name: string;
  isCustom: boolean;
  description: string;
  userCount: number;
  permissions: Record<string, PermissionAction[]>;
}

export type ApprovalCategory =
  | 'purchase_order'
  | 'expense'
  | 'supplier_payment'
  | 'discount'
  | 'budget_overrun'
  | 'leave';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'info_requested';

export interface ApprovalRequest {
  id: string;
  requestNumber: string;
  title: string;
  category: ApprovalCategory;
  department: string;
  requestedByEmployeeId: string;
  requestedByName: string;
  requestedByRole: string;
  amount?: number;
  justification: string;
  status: ApprovalStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  remarks?: string;
  lineItems?: { description: string; quantity: number; unitPrice: number; total: number }[];
  attachments?: string[];
}

export type ActivityDepartment = 'Sales' | 'Field Operations' | 'Engineering' | 'Installation' | 'Warehouse' | 'Accounts' | 'Executive Management' | 'System' | string;

export interface EmployeeActivityLog {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode?: string;
  department: ActivityDepartment;
  role: string;
  actionType: string;
  action?: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'DISPATCH' | 'COMPLETE' | 'LOGIN' | 'PERMISSION_CHANGE' | string;
  module?: string;
  actionDetails: string;
  targetEntity?: string;
  targetId?: string;
  recordId?: string;
  previousValue?: any;
  newValue?: any;
  result?: 'SUCCESS' | 'FAILURE' | 'DENIED' | string;
  timestamp: string;
  ipAddress?: string;
  sessionMetadata?: string;
  severity?: 'normal' | 'important' | 'critical';
}

export interface RetellCallLog {
  id: string;
  callerPhone: string;
  customerName?: string;
  duration: string;
  timestamp: string;
  outcome: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  recordingUrl?: string;
  transcriptSnippet: string;
  fullTranscript?: { speaker: 'AI Agent' | 'Customer'; text: string; time: string }[];
}

export interface RetellAiAgent {
  id: string;
  name: string;
  role: string;
  voiceModel: string;
  status: 'active' | 'paused' | 'standby';
  inboundNumber: string;
  totalCallsHandled: number;
  successConversionRate: number;
  averageDurationSeconds: number;
  systemPrompt: string;
  escalationRule: string;
  lastActive: string;
  callLogs: RetellCallLog[];
}

export interface SmartAlert {
  id: string;
  title: string;
  category: 'delayed_project' | 'low_stock' | 'overdue_payment' | 'unassigned_survey' | 'engineering_delay';
  severity: 'critical' | 'warning' | 'info';
  status: 'new' | 'acknowledged' | 'resolved';
  description: string;
  entityId?: string;
  entityLink?: string;
  timestamp: string;
  acknowledgedBy?: string;
}
