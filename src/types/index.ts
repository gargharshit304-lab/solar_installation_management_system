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
  reviewStatus?: 'draft' | 'submitted' | 'under_review' | 'corrections_required' | 'approved' | 'rejected';
  engineeringApproverName?: string;
  engineeringReviewNotes?: string;
  correctionsRequestedNotes?: string;
  rejectionReason?: string;
  approvedAt?: string;
  isDraft?: boolean;
  version?: number;
  assignmentHistory?: SurveyAssignmentAudit[];
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
}

export type ProductCategory = 
  | 'Solar Panels'
  | 'Inverters'
  | 'Batteries'
  | 'Charge Controllers'
  | 'Connectors'
  | 'Wires'
  | 'Wiring Boxes'
  | 'Metal Stands'
  | 'Safety Equipment';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  availableQuantity: number;
  reservedQuantity: number;
  minimumThreshold: number;
  unitCost: number;
  sellingPrice: number;
  supplier: string;
  hasSerialTracking: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  locationBin: string;
}

export interface SerialNumberRecord {
  id: string;
  serialNumber: string;
  productId: string;
  productName: string;
  category: string;
  purchaseDate: string;
  supplier: string;
  currentStatus: 'in_warehouse' | 'reserved' | 'dispatched' | 'installed' | 'defective';
  assignedCustomer?: string;
  relatedOrderId?: string;
  deliveryDate?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
}

export interface DispatchOrder {
  id: string;
  dispatchNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  deliveryAddress: string;
  allocatedSerials: string[];
  dispatchDate: string;
  deliveryPersonnel: string;
  vehicleNumber: string;
  deliveryStatus: 'pending' | 'in_transit' | 'delivered';
  deliveredAt?: string;
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
  orderNumber: string;
  customerName: string;
  capacityKw: number;
  systemType: string;
  revenue: number;
  equipmentCosts: number;
  labourCosts: number;
  otherExpenses: number;
  profit: number;
  profitMarginPercent: number;
  paymentStatus: 'fully_paid' | 'partially_paid' | 'unpaid';
  completionDate: string;
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
