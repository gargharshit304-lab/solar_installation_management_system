import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile, UserRole, Customer, SiteSurvey, SolarPackage,
  Quotation, Order, PaymentRecord, InventoryItem,
  SerialNumberRecord, DispatchOrder, Installation,
  WarrantyRecord, ServiceComplaint, ProjectProfitability,
  Employee, NotificationItem, AiMessage, FollowUpItem,
  CustomerEnquiry, CommunicationHistoryItem, SalesActivityItem,
  TechnicianLeave, SurveyAssignmentAudit, CustomerSite,
  TechnicianAvailabilityStatus
} from '../types';
import {
  SYSTEM_USERS, INITIAL_CUSTOMERS, INITIAL_SURVEYS,
  SOLAR_PACKAGES, INITIAL_QUOTATIONS, INITIAL_ORDERS,
  INITIAL_PAYMENTS, INITIAL_INVENTORY, INITIAL_SERIAL_NUMBERS,
  INITIAL_DISPATCHES, INITIAL_INSTALLATIONS, INITIAL_WARRANTIES,
  INITIAL_COMPLAINTS, INITIAL_PROFITABILITY, INITIAL_EMPLOYEES,
  INITIAL_NOTIFICATIONS, INITIAL_FOLLOW_UPS, INITIAL_ENQUIRIES,
  INITIAL_COMMUNICATION_HISTORY, INITIAL_SALES_ACTIVITIES,
  INITIAL_TECHNICIAN_LEAVES, INITIAL_SURVEY_ASSIGNMENTS,
  INITIAL_CUSTOMER_SITES
} from '../data/mockData';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  // Auth & Role
  currentUser: UserProfile;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  usersList: UserProfile[];
  
  // UI State
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Data Collections
  customers: Customer[];
  customerSites: CustomerSite[];
  addCustomer: (customer: Omit<Customer, 'id' | 'customerCode' | 'registrationDate'>) => Customer;
  addCustomerSite: (site: Omit<CustomerSite, 'id'>) => CustomerSite;
  updateCustomerLeadStatus: (customerId: string, status: Customer['leadStatus']) => void;
  
  surveys: SiteSurvey[];
  surveyAssignments: SurveyAssignmentAudit[];
  technicianLeaves: TechnicianLeave[];
  getNextSurveyNumber: () => string;
  assignSurveyTechnician: (
    surveyIdOrParams: string | {
      surveyId?: string;
      customerId: string;
      technicianId: string;
      scheduledDate: string;
      timeSlot: string;
      siteAddress?: string;
      siteLabel?: string;
      propertyType?: string;
      pincode?: string;
      instructions?: string;
      estimatedDurationMinutes?: number;
    },
    technicianId?: string,
    scheduledDate?: string,
    timeSlot?: string,
    instructions?: string
  ) => SiteSurvey | void;
  reassignSurveyTechnician: (surveyId: string, newTechnicianId: string, reason: string, scheduledDate?: string, timeSlot?: string) => void;
  rescheduleSurvey: (surveyId: string, newDate: string, newTimeSlot: string, instructions?: string) => void;
  createSurveyRequest: (data: { customerId: string; scheduledDate: string; timeSlot?: string; technicianId?: string; instructions?: string }) => SiteSurvey;
  cancelSurvey: (surveyId: string, reason?: string) => void;
  submitSurveyForm: (surveyId: string, details: Partial<SiteSurvey>) => void;
  updateSurveyStatus: (surveyId: string, status: SiteSurvey['status'], rejectionReason?: string) => void;
  
  // Field Survey Specialist & Engineering Lead Workflows
  claimSurvey: (surveyId: string) => { success: boolean; message: string };
  startSurvey: (surveyId: string) => boolean;
  saveSurveyDraft: (surveyId: string, details: Partial<SiteSurvey>) => void;
  submitSurveyReport: (surveyId: string, details: Partial<SiteSurvey>) => { success: boolean; message: string };
  approveSurveyReport: (surveyId: string, notes: string) => void;
  requestSurveyCorrections: (surveyId: string, comments: string) => void;
  rejectSurveyReport: (surveyId: string, reason: string) => void;
  updateTechnicianAvailability: (technicianId: string, status: TechnicianAvailabilityStatus) => void;
  addTechnicianLeave: (leave: Omit<TechnicianLeave, 'id'>) => void;
  
  packages: SolarPackage[];
  quotations: Quotation[];
  createQuotation: (quoteData: Omit<Quotation, 'id' | 'quotationNumber' | 'createdDate'>) => Quotation;
  updateQuotationStatus: (quoteId: string, status: Quotation['status']) => void;
  
  orders: Order[];
  payments: PaymentRecord[];
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'paymentNumber' | 'paymentDate' | 'recordedBy'>) => void;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'sku'>) => void;
  adjustStockQuantity: (productId: string, adjustment: number, notes?: string) => void;
  
  serialNumbers: SerialNumberRecord[];
  dispatches: DispatchOrder[];
  createDispatchOrder: (dispatch: Omit<DispatchOrder, 'id' | 'dispatchNumber' | 'dispatchDate'>) => void;
  confirmDelivery: (dispatchId: string) => void;
  
  installations: Installation[];
  startInstallation: (installationId: string) => void;
  updateInstallationChecklist: (installationId: string, key: keyof Installation['checklist'], value: boolean) => void;
  completeInstallationJob: (installationId: string, signatureName: string, signatureDataUrl?: string, remarks?: string) => void;
  
  warranties: WarrantyRecord[];
  complaints: ServiceComplaint[];
  createServiceTicket: (complaint: Omit<ServiceComplaint, 'id' | 'complaintId' | 'complaintDate' | 'status'>) => void;
  updateTicketStatus: (ticketId: string, status: ServiceComplaint['status'], resolutionNotes?: string) => void;
  
  profitability: ProjectProfitability[];
  employees: Employee[];
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Sales Workspace Entities
  followUps: FollowUpItem[];
  scheduleFollowUp: (item: Omit<FollowUpItem, 'id' | 'status'>) => void;
  completeFollowUp: (id: string, notes?: string) => void;
  rescheduleFollowUp: (id: string, newDate: string, reason?: string) => void;
  
  enquiries: CustomerEnquiry[];
  createEnquiry: (enquiry: Omit<CustomerEnquiry, 'id' | 'enquiryNumber' | 'receivedDate'>) => CustomerEnquiry;
  
  communicationHistory: CommunicationHistoryItem[];
  addCommunicationRecord: (record: Omit<CommunicationHistoryItem, 'id' | 'timestamp'>) => void;
  
  salesActivities: SalesActivityItem[];
  addSalesActivity: (activity: Omit<SalesActivityItem, 'id' | 'timestamp'>) => void;

  requestSiteSurvey: (customerId: string, scheduledDate: string, notes?: string) => SiteSurvey;
  
  // AI Assistant
  aiMessages: AiMessage[];
  isAiGenerating: boolean;
  sendAiQuery: (queryText: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Active User Profile (Defaults to Owner Vikramaditya Rao)
  const [currentUser, setCurrentUser] = useState<UserProfile>(SYSTEM_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // UI states
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Core Business Entities
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [customerSites, setCustomerSites] = useState<CustomerSite[]>(INITIAL_CUSTOMER_SITES);
  const [surveys, setSurveys] = useState<SiteSurvey[]>(INITIAL_SURVEYS);
  const [surveyAssignments, setSurveyAssignments] = useState<SurveyAssignmentAudit[]>(INITIAL_SURVEY_ASSIGNMENTS);
  const [technicianLeaves, setTechnicianLeaves] = useState<TechnicianLeave[]>(INITIAL_TECHNICIAN_LEAVES);
  const [packages] = useState<SolarPackage[]>(SOLAR_PACKAGES);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [serialNumbers, setSerialNumbers] = useState<SerialNumberRecord[]>(INITIAL_SERIAL_NUMBERS);
  const [dispatches, setDispatches] = useState<DispatchOrder[]>(INITIAL_DISPATCHES);
  const [installations, setInstallations] = useState<Installation[]>(INITIAL_INSTALLATIONS);
  const [warranties, setWarranties] = useState<WarrantyRecord[]>(INITIAL_WARRANTIES);
  const [complaints, setComplaints] = useState<ServiceComplaint[]>(INITIAL_COMPLAINTS);
  const [profitability, setProfitability] = useState<ProjectProfitability[]>(INITIAL_PROFITABILITY);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Sales Workspace State
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(INITIAL_FOLLOW_UPS);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>(INITIAL_ENQUIRIES);
  const [communicationHistory, setCommunicationHistory] = useState<CommunicationHistoryItem[]>(INITIAL_COMMUNICATION_HISTORY);
  const [salesActivities, setSalesActivities] = useState<SalesActivityItem[]>(INITIAL_SALES_ACTIVITIES);
  
  // AI Command Center state
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
    {
      id: 'ai-welcome',
      sender: 'assistant',
      text: `Hello ${currentUser.name}! I am **SolarOS Intelligent Operations Agent**. I have real-time visibility across SunPower Solutions' 40 monthly installations, technicians, inventory, and financials. How can I assist you right now?`,
      timestamp: 'Just now',
      suggestedActions: [
        { label: 'Show delayed installations', action: 'Show all installations delayed this week' },
        { label: 'Which products are low on stock?', action: 'Which products are running low?' },
        { label: 'Review monthly revenue', action: "Show this month's revenue" }
      ]
    }
  ]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const switchRole = (role: UserRole) => {
    const matched = SYSTEM_USERS.find(u => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      showToast(`Switched active view to ${matched.roleTitle} (${matched.name})`, 'info');
    }
  };

  const login = async (email: string, password: string): Promise<UserProfile | null> => {
    const DEMO_PASSWORD = 'solaros2026';
    if (password !== DEMO_PASSWORD) {
      return null;
    }
    const user = SYSTEM_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(SYSTEM_USERS[0]);
    setIsAuthenticated(false);
    showToast('Logged out successfully', 'info');
  };

  // Customers
  const addCustomer = (customerData: Omit<Customer, 'id' | 'customerCode' | 'registrationDate'>): Customer => {
    const newId = `cust-${Date.now()}`;
    const codeNum = String(customers.length + 1).padStart(3, '0');
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      customerCode: `CUST-2026-${codeNum}`,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCustomer, ...prev]);
    showToast(`Customer ${newCustomer.fullName} registered successfully!`, 'success');
    return newCustomer;
  };

  const updateCustomerLeadStatus = (customerId: string, status: Customer['leadStatus']) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, leadStatus: status } : c));
    showToast(`Lead status updated to ${status.replace('_', ' ').toUpperCase()}`, 'info');
  };

  const addCustomerSite = (siteData: Omit<CustomerSite, 'id'>): CustomerSite => {
    const newSite: CustomerSite = {
      ...siteData,
      id: `site-${Date.now()}`
    };
    setCustomerSites(prev => [newSite, ...prev]);
    setCustomers(prev => prev.map(c => {
      if (c.id === siteData.customerId) {
        return {
          ...c,
          sites: [newSite, ...(c.sites || [])]
        };
      }
      return c;
    }));
    showToast(`New site "${newSite.siteLabel}" added for customer!`, 'success');
    return newSite;
  };

  const getNextSurveyNumber = (): string => {
    let maxNum = 40;
    surveys.forEach(s => {
      const match = s.surveyNumber.match(/SRV-2026-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `SRV-2026-${String(maxNum + 1).padStart(3, '0')}`;
  };

  // Site Surveys
  const assignSurveyTechnician = (
    surveyIdOrParams: string | {
      surveyId?: string;
      customerId: string;
      technicianId: string;
      scheduledDate: string;
      timeSlot: string;
      siteAddress?: string;
      siteLabel?: string;
      propertyType?: string;
      pincode?: string;
      instructions?: string;
      estimatedDurationMinutes?: number;
    },
    legacyTechId?: string,
    legacyDate?: string,
    legacySlot?: string,
    legacyInstructions?: string
  ): SiteSurvey | void => {
    if (typeof surveyIdOrParams === 'object') {
      const params = surveyIdOrParams;
      const tech = employees.find(e => e.id === params.technicianId);
      const techName = tech ? tech.fullName : params.technicianId;
      const customer = customers.find(c => c.id === params.customerId);

      if (params.surveyId) {
        // Updating an existing survey
        let targetSurveyNum = '';
        setSurveys(prev => prev.map(s => {
          if (s.id === params.surveyId) {
            targetSurveyNum = s.surveyNumber;
            return {
              ...s,
              technicianId: params.technicianId,
              technicianName: techName,
              scheduledDate: params.scheduledDate,
              timeSlot: params.timeSlot,
              customerAddress: params.siteAddress || s.customerAddress,
              siteLabel: params.siteLabel || s.siteLabel,
              propertyType: params.propertyType || s.propertyType,
              pincode: params.pincode || s.pincode,
              instructions: params.instructions !== undefined ? params.instructions : s.instructions,
              estimatedDurationMinutes: params.estimatedDurationMinutes || s.estimatedDurationMinutes || 90,
              status: 'assigned'
            };
          }
          return s;
        }));

        // Audit Record
        const auditRecord: SurveyAssignmentAudit = {
          id: `asg-${Date.now()}`,
          surveyId: params.surveyId,
          surveyNumber: targetSurveyNum || params.surveyId,
          technicianId: params.technicianId,
          technicianName: techName,
          assignedAt: new Date().toISOString(),
          assignedBy: currentUser.name,
          action: 'assigned',
          scheduledDate: params.scheduledDate,
          timeSlot: params.timeSlot
        };
        setSurveyAssignments(prev => [auditRecord, ...prev]);

        // Notifications & logs
        setNotifications(prev => [{
          id: `notif-${Date.now()}`,
          title: `Technician Assigned: ${techName}`,
          message: `Survey ${targetSurveyNum} for ${customer?.fullName || 'Customer'} assigned to ${techName}.`,
          timeAgo: 'Just now',
          type: 'info',
          read: false,
          link: '/surveys'
        }, ...prev]);

        addSalesActivity({
          type: 'survey_scheduled',
          customerName: customer?.fullName || 'Customer',
          customerId: params.customerId,
          description: `Assigned specialist ${techName} to survey ${targetSurveyNum}`,
          salesperson: currentUser.name,
          relatedLink: '/surveys'
        });

        addCommunicationRecord({
          customerId: params.customerId,
          authorName: currentUser.name,
          type: 'survey_requested',
          summary: `Technician ${techName} Assigned`,
          details: `Survey ${targetSurveyNum} assigned. Slot: ${params.timeSlot}.`
        });

        showToast(`Technician ${techName} assigned to survey ${targetSurveyNum}`, 'success');
      } else {
        // Creating a new survey request in technician-first workflow
        const newSurveyNum = getNextSurveyNumber();
        const newSurveyId = `surv-${Date.now()}`;

        const createdSurvey: SiteSurvey = {
          id: newSurveyId,
          surveyNumber: newSurveyNum,
          customerId: params.customerId,
          customerName: customer ? customer.fullName : 'Customer',
          customerPhone: customer ? customer.phone : '',
          customerAddress: params.siteAddress || (customer ? customer.address : ''),
          siteLabel: params.siteLabel,
          propertyType: params.propertyType,
          pincode: params.pincode,
          scheduledDate: params.scheduledDate,
          timeSlot: params.timeSlot,
          instructions: params.instructions,
          technicianId: params.technicianId,
          technicianName: techName,
          estimatedDurationMinutes: params.estimatedDurationMinutes || 90,
          status: 'assigned',
          technicianObservations: params.instructions
        };

        setSurveys(prev => [createdSurvey, ...prev]);
        updateCustomerLeadStatus(params.customerId, 'survey_scheduled');

        // Audit Record
        const auditRecord: SurveyAssignmentAudit = {
          id: `asg-${Date.now()}`,
          surveyId: newSurveyId,
          surveyNumber: newSurveyNum,
          technicianId: params.technicianId,
          technicianName: techName,
          assignedAt: new Date().toISOString(),
          assignedBy: currentUser.name,
          action: 'assigned',
          scheduledDate: params.scheduledDate,
          timeSlot: params.timeSlot
        };
        setSurveyAssignments(prev => [auditRecord, ...prev]);

        // Notifications & logs
        setNotifications(prev => [{
          id: `notif-${Date.now()}`,
          title: `New Survey Booked: ${newSurveyNum}`,
          message: `${customer?.fullName} assigned to ${techName} on ${new Date(params.scheduledDate).toLocaleDateString()} (${params.timeSlot}).`,
          timeAgo: 'Just now',
          type: 'success',
          read: false,
          link: '/surveys'
        }, ...prev]);

        addSalesActivity({
          type: 'survey_scheduled',
          customerName: customer ? customer.fullName : 'Customer',
          customerId: params.customerId,
          description: `Created & assigned survey ${newSurveyNum} to specialist ${techName}`,
          salesperson: currentUser.name,
          relatedLink: '/surveys'
        });

        addCommunicationRecord({
          customerId: params.customerId,
          authorName: currentUser.name,
          type: 'survey_requested',
          summary: `Site Survey ${newSurveyNum} Scheduled & Assigned`,
          details: `Specialist: ${techName}. Slot: ${params.timeSlot}. Address: ${params.siteAddress || customer?.address}`
        });

        showToast(`Survey ${newSurveyNum} created and assigned to ${techName}`, 'success');
        return createdSurvey;
      }
    } else {
      // Legacy positional call: (surveyId, technicianId, scheduledDate, timeSlot, instructions)
      const surveyId = surveyIdOrParams;
      const technicianId = legacyTechId || '';
      const tech = employees.find(e => e.id === technicianId);
      const techName = tech ? tech.fullName : technicianId;

      let targetSurveyNumber = '';
      let targetCustomerName = '';
      let targetCustomerId = '';

      setSurveys(prev => prev.map(s => {
        if (s.id === surveyId) {
          targetSurveyNumber = s.surveyNumber;
          targetCustomerName = s.customerName;
          targetCustomerId = s.customerId;
          return {
            ...s,
            technicianId,
            technicianName: techName,
            scheduledDate: legacyDate || s.scheduledDate,
            timeSlot: legacySlot || s.timeSlot || '10:00 AM - 12:00 PM',
            instructions: legacyInstructions !== undefined ? legacyInstructions : s.instructions,
            status: 'assigned'
          };
        }
        return s;
      }));

      const auditRecord: SurveyAssignmentAudit = {
        id: `asg-${Date.now()}`,
        surveyId,
        surveyNumber: targetSurveyNumber || surveyId,
        technicianId,
        technicianName: techName,
        assignedAt: new Date().toISOString(),
        assignedBy: currentUser.name,
        action: 'assigned',
        scheduledDate: legacyDate || new Date().toISOString(),
        timeSlot: legacySlot || '10:00 AM - 12:00 PM'
      };
      setSurveyAssignments(prev => [auditRecord, ...prev]);

      setNotifications(prev => [{
        id: `notif-${Date.now()}`,
        title: `Technician Assigned: ${techName}`,
        message: `Survey ${targetSurveyNumber} for ${targetCustomerName} assigned to ${techName}.`,
        timeAgo: 'Just now',
        type: 'info',
        read: false,
        link: '/surveys'
      }, ...prev]);

      if (targetCustomerId) {
        addSalesActivity({
          type: 'survey_scheduled',
          customerName: targetCustomerName,
          customerId: targetCustomerId,
          description: `Assigned technician ${techName} to survey ${targetSurveyNumber}`,
          salesperson: currentUser.name,
          relatedLink: '/surveys'
        });
        addCommunicationRecord({
          customerId: targetCustomerId,
          authorName: currentUser.name,
          type: 'survey_requested',
          summary: `Technician ${techName} Assigned`,
          details: `Survey ${targetSurveyNumber} assigned. Scheduled slot: ${legacySlot || '10:00 AM - 12:00 PM'}.`
        });
      }

      showToast(`Technician ${techName} assigned to survey ${targetSurveyNumber}`, 'success');
    }
  };

  const reassignSurveyTechnician = (
    surveyId: string, 
    newTechnicianId: string, 
    reason: string, 
    scheduledDate?: string, 
    timeSlot?: string
  ) => {
    const tech = employees.find(e => e.id === newTechnicianId);
    const techName = tech ? tech.fullName : newTechnicianId;

    let targetSurveyNumber = '';
    let targetCustomerName = '';
    let targetCustomerId = '';
    let prevTechName = '';

    setSurveys(prev => prev.map(s => {
      if (s.id === surveyId) {
        targetSurveyNumber = s.surveyNumber;
        targetCustomerName = s.customerName;
        targetCustomerId = s.customerId;
        prevTechName = s.technicianName || 'Unallocated';
        return {
          ...s,
          technicianId: newTechnicianId,
          technicianName: techName,
          scheduledDate: scheduledDate || s.scheduledDate,
          timeSlot: timeSlot || s.timeSlot || '10:00 AM - 12:00 PM',
          status: 'assigned'
        };
      }
      return s;
    }));

    const auditRecord: SurveyAssignmentAudit = {
      id: `asg-${Date.now()}`,
      surveyId,
      surveyNumber: targetSurveyNumber || surveyId,
      technicianId: newTechnicianId,
      technicianName: techName,
      previousTechnicianName: prevTechName,
      assignedAt: new Date().toISOString(),
      assignedBy: currentUser.name,
      action: 'reassigned',
      reason,
      scheduledDate: scheduledDate || new Date().toISOString(),
      timeSlot: timeSlot || '10:00 AM - 12:00 PM'
    };
    setSurveyAssignments(prev => [auditRecord, ...prev]);

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: `Technician Reassigned: ${targetSurveyNumber}`,
      message: `Reassigned from ${prevTechName} to ${techName}. Reason: ${reason}`,
      timeAgo: 'Just now',
      type: 'warning',
      read: false,
      link: '/surveys'
    }, ...prev]);

    if (targetCustomerId) {
      addCommunicationRecord({
        customerId: targetCustomerId,
        authorName: currentUser.name,
        type: 'note',
        summary: `Survey Reassigned to ${techName}`,
        details: `Reason: ${reason}. Previous technician: ${prevTechName}.`
      });
    }

    showToast(`Survey ${targetSurveyNumber} successfully reassigned to ${techName}`, 'success');
  };

  const rescheduleSurvey = (
    surveyId: string, 
    newDate: string, 
    newTimeSlot: string, 
    instructions?: string
  ) => {
    let targetSurveyNumber = '';
    let targetCustomerName = '';
    let targetCustomerId = '';
    let currentTechId = '';
    let currentTechName = '';

    setSurveys(prev => prev.map(s => {
      if (s.id === surveyId) {
        targetSurveyNumber = s.surveyNumber;
        targetCustomerName = s.customerName;
        targetCustomerId = s.customerId;
        currentTechId = s.technicianId || '';
        currentTechName = s.technicianName || 'Technician';
        return {
          ...s,
          scheduledDate: newDate,
          timeSlot: newTimeSlot,
          instructions: instructions !== undefined ? instructions : s.instructions,
          status: s.status === 'unassigned' ? 'unassigned' : 'rescheduled'
        };
      }
      return s;
    }));

    const auditRecord: SurveyAssignmentAudit = {
      id: `asg-${Date.now()}`,
      surveyId,
      surveyNumber: targetSurveyNumber || surveyId,
      technicianId: currentTechId,
      technicianName: currentTechName,
      assignedAt: new Date().toISOString(),
      assignedBy: currentUser.name,
      action: 'rescheduled',
      reason: instructions || 'Rescheduled site appointment',
      scheduledDate: newDate,
      timeSlot: newTimeSlot
    };
    setSurveyAssignments(prev => [auditRecord, ...prev]);

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: `Survey Rescheduled: ${targetSurveyNumber}`,
      message: `Rescheduled to ${new Date(newDate).toLocaleDateString()} (${newTimeSlot}).`,
      timeAgo: 'Just now',
      type: 'info',
      read: false,
      link: '/surveys'
    }, ...prev]);

    if (targetCustomerId) {
      addCommunicationRecord({
        customerId: targetCustomerId,
        authorName: currentUser.name,
        type: 'note',
        summary: `Survey Rescheduled to ${new Date(newDate).toLocaleDateString()}`,
        details: `New slot: ${newTimeSlot}. Instructions: ${instructions || 'None'}`
      });
    }

    showToast(`Survey ${targetSurveyNumber} rescheduled to ${new Date(newDate).toLocaleDateString()} (${newTimeSlot})`, 'info');
  };

  const createSurveyRequest = (data: { 
    customerId: string; 
    scheduledDate: string; 
    timeSlot?: string; 
    technicianId?: string; 
    instructions?: string;
  }): SiteSurvey => {
    const customer = customers.find(c => c.id === data.customerId);
    const tech = employees.find(e => e.id === data.technicianId);
    const newSurveyId = `surv-${Date.now()}`;
    const surveyNum = `SRV-2026-${String(surveys.length + 49).padStart(3, '0')}`;
    const slot = data.timeSlot || '10:00 AM - 12:00 PM';

    const newSurvey: SiteSurvey = {
      id: newSurveyId,
      surveyNumber: surveyNum,
      customerId: data.customerId,
      customerName: customer ? customer.fullName : 'Customer',
      customerPhone: customer ? customer.phone : '',
      customerAddress: customer ? `${customer.address}, ${customer.city}` : '',
      scheduledDate: data.scheduledDate,
      timeSlot: slot,
      instructions: data.instructions,
      technicianId: tech?.id,
      technicianName: tech?.fullName,
      status: tech ? 'assigned' : 'unassigned',
      technicianObservations: data.instructions
    };

    setSurveys(prev => [newSurvey, ...prev]);
    updateCustomerLeadStatus(data.customerId, 'survey_scheduled');

    if (tech) {
      const auditRecord: SurveyAssignmentAudit = {
        id: `asg-${Date.now()}`,
        surveyId: newSurveyId,
        surveyNumber: surveyNum,
        technicianId: tech.id,
        technicianName: tech.fullName,
        assignedAt: new Date().toISOString(),
        assignedBy: currentUser.name,
        action: 'assigned',
        scheduledDate: data.scheduledDate,
        timeSlot: slot
      };
      setSurveyAssignments(prev => [auditRecord, ...prev]);
    }

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: `New Survey Booked: ${surveyNum}`,
      message: `${customer?.fullName} — ${new Date(data.scheduledDate).toLocaleDateString()} (${slot})`,
      timeAgo: 'Just now',
      type: 'success',
      read: false,
      link: '/surveys'
    }, ...prev]);

    if (customer) {
      addSalesActivity({
        type: 'survey_scheduled',
        customerName: customer.fullName,
        customerId: customer.id,
        description: `Site survey ${surveyNum} scheduled for ${new Date(data.scheduledDate).toLocaleDateString()} (${slot})`,
        salesperson: currentUser.name,
        relatedLink: '/surveys'
      });
      addCommunicationRecord({
        customerId: customer.id,
        authorName: currentUser.name,
        type: 'survey_requested',
        summary: `Site Survey ${surveyNum} Scheduled`,
        details: `Slot: ${slot}. Assigned: ${tech?.fullName || 'Pending assignment'}.`
      });
    }

    showToast(`Survey ${surveyNum} created successfully for ${customer?.fullName || 'Customer'}`, 'success');
    return newSurvey;
  };

  const cancelSurvey = (surveyId: string, reason?: string) => {
    setSurveys(prev => prev.map(s => s.id === surveyId ? {
      ...s,
      status: 'cancelled',
      rejectionReason: reason || 'Cancelled by customer / sales'
    } : s));
    showToast(`Survey appointment cancelled`, 'warning');
  };

  const submitSurveyForm = (surveyId: string, details: Partial<SiteSurvey>) => {
    setSurveys(prev => prev.map(s => s.id === surveyId ? {
      ...s,
      ...details,
      status: 'submitted'
    } : s));
    showToast('Survey report submitted for engineering approval!', 'success');
  };

  const updateSurveyStatus = (surveyId: string, status: SiteSurvey['status'], rejectionReason?: string) => {
    setSurveys(prev => prev.map(s => s.id === surveyId ? {
      ...s,
      status,
      rejectionReason,
      approvedAt: status === 'approved' ? new Date().toISOString().split('T')[0] : undefined
    } : s));
    showToast(`Survey status updated to ${status.toUpperCase()}`, status === 'approved' ? 'success' : 'warning');
  };

  const claimSurvey = (surveyId: string): { success: boolean; message: string } => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) {
      return { success: false, message: 'Survey not found.' };
    }
    if (survey.status !== 'unassigned') {
      return { success: false, message: 'This survey has already been claimed or assigned.' };
    }

    // Check technician leave on survey date
    const surveyDateStr = survey.scheduledDate.split('T')[0];
    const isOnLeave = technicianLeaves.some(l => 
      (l.technicianName.toLowerCase().includes(currentUser.name.split(' ')[0].toLowerCase()) || l.technicianId === currentUser.id) &&
      l.status === 'approved' &&
      surveyDateStr >= l.startDate && surveyDateStr <= l.endDate
    );
    if (isOnLeave) {
      return { success: false, message: `Schedule conflict: You have approved leave on ${surveyDateStr}.` };
    }

    // Check appointment overlap (same date + same time slot)
    const hasOverlap = surveys.some(s => 
      s.id !== surveyId &&
      (s.technicianName?.toLowerCase().includes(currentUser.name.split(' ')[0].toLowerCase()) || s.technicianId === currentUser.id) &&
      (s.status === 'assigned' || s.status === 'scheduled' || s.status === 'in_progress') &&
      s.scheduledDate.startsWith(surveyDateStr) &&
      s.timeSlot === survey.timeSlot
    );
    if (hasOverlap) {
      return { success: false, message: `Schedule conflict: You already have an assigned visit on ${surveyDateStr} during ${survey.timeSlot}.` };
    }

    // Atomic assignment
    setSurveys(prev => prev.map(s => {
      if (s.id === surveyId) {
        return {
          ...s,
          technicianId: currentUser.id,
          technicianName: currentUser.name,
          status: 'assigned'
        };
      }
      return s;
    }));

    // Audit record
    const auditRecord: SurveyAssignmentAudit = {
      id: `asg-${Date.now()}`,
      surveyId,
      surveyNumber: survey.surveyNumber,
      technicianId: currentUser.id,
      technicianName: currentUser.name,
      assignedAt: new Date().toISOString(),
      assignedBy: `${currentUser.name} (Self-claimed)`,
      action: 'assigned',
      scheduledDate: survey.scheduledDate,
      timeSlot: survey.timeSlot || '10:00 AM - 12:00 PM'
    };
    setSurveyAssignments(prev => [auditRecord, ...prev]);

    // Notification to Sales Executive & System
    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: `Survey Claimed: ${survey.surveyNumber}`,
      message: `${currentUser.name} self-claimed survey for ${survey.customerName} on ${new Date(survey.scheduledDate).toLocaleDateString()} (${survey.timeSlot}).`,
      timeAgo: 'Just now',
      type: 'info',
      read: false,
      link: '/surveys'
    }, ...prev]);

    addSalesActivity({
      type: 'survey_scheduled',
      customerName: survey.customerName,
      customerId: survey.customerId,
      description: `Specialist ${currentUser.name} claimed survey ${survey.surveyNumber}`,
      salesperson: currentUser.name,
      relatedLink: '/surveys'
    });

    showToast(`Survey ${survey.surveyNumber} successfully claimed! Added to My Assignments.`, 'success');
    return { success: true, message: 'Survey successfully claimed!' };
  };

  const startSurvey = (surveyId: string): boolean => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return false;
    if (survey.status === 'approved' || survey.status === 'cancelled') {
      showToast('Cannot start a completed or cancelled survey.', 'error');
      return false;
    }

    setSurveys(prev => prev.map(s => {
      if (s.id === surveyId) {
        return {
          ...s,
          status: 'in_progress',
          surveyStartedAt: s.surveyStartedAt || new Date().toISOString()
        };
      }
      return s;
    }));

    showToast(`Site survey ${survey.surveyNumber} started! Form enabled.`, 'success');
    return true;
  };

  const saveSurveyDraft = (surveyId: string, details: Partial<SiteSurvey>) => {
    setSurveys(prev => prev.map(s => {
      if (s.id === surveyId) {
        return {
          ...s,
          ...details,
          status: 'in_progress',
          isDraft: true
        };
      }
      return s;
    }));
    showToast('Survey progress saved as draft.', 'info');
  };

  const submitSurveyReport = (surveyId: string, details: Partial<SiteSurvey>): { success: boolean; message: string } => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return { success: false, message: 'Survey not found' };

    const targetNum = survey.surveyNumber;
    const nowIso = new Date().toISOString();

    setSurveys(prev => prev.map(s => {
      if (s.id === surveyId) {
        return {
          ...s,
          ...details,
          status: 'submitted',
          reviewStatus: 'submitted',
          submittedAt: nowIso,
          isDraft: false,
          version: (s.version || 1) + 1
        };
      }
      return s;
    }));

    // Notification to Engineering Lead & Sales Executive
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}-eng`,
        title: `Survey Report Ready for Review: ${targetNum}`,
        message: `${currentUser.name} submitted technical inspection report for ${survey.customerName}. Feasibility review required.`,
        timeAgo: 'Just now',
        type: 'info',
        read: false,
        link: '/engineering/review'
      },
      {
        id: `notif-${Date.now()}-sales`,
        title: `Site Survey Completed: ${targetNum}`,
        message: `Field specialist ${currentUser.name} completed site inspection for ${survey.customerName}. Sent to Engineering Lead for approval.`,
        timeAgo: 'Just now',
        type: 'success',
        read: false,
        link: '/surveys'
      },
      ...prev
    ]);

    addSalesActivity({
      type: 'survey_scheduled',
      customerName: survey.customerName,
      customerId: survey.customerId,
      description: `Field Survey Report ${targetNum} submitted by ${currentUser.name}`,
      salesperson: currentUser.name,
      relatedLink: '/surveys'
    });

    showToast(`Survey report ${targetNum} submitted for Engineering Approval!`, 'success');
    return { success: true, message: 'Report submitted successfully' };
  };

  const approveSurveyReport = (surveyId: string, notes: string) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;

    const todayDate = new Date().toISOString().split('T')[0];

    setSurveys(prev => prev.map(s => {
      if (s.id === surveyId) {
        return {
          ...s,
          status: 'approved',
          reviewStatus: 'approved',
          approvedAt: todayDate,
          engineeringApproverName: currentUser.name,
          engineeringReviewNotes: notes
        };
      }
      return s;
    }));

    // Notify Sales Executive that quotation can now be generated
    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: `Survey Approved by Engineering: ${survey.surveyNumber}`,
      message: `${currentUser.name} (Engineering Lead) approved ${survey.customerName}'s survey. Quotation can now be finalized!`,
      timeAgo: 'Just now',
      type: 'success',
      read: false,
      link: '/quotations'
    }, ...prev]);

    addSalesActivity({
      type: 'survey_approved',
      customerName: survey.customerName,
      customerId: survey.customerId,
      description: `Engineering Lead approved survey ${survey.surveyNumber}. Shadow-free area: ${survey.shadowFreeAreaSqm || 'N/A'} sq.m.`,
      salesperson: currentUser.name,
      relatedLink: '/quotations'
    });

    showToast(`Survey ${survey.surveyNumber} approved by Engineering! Ready for quotation.`, 'success');
  };

  const requestSurveyCorrections = (surveyId: string, comments: string) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;

    setSurveys(prev => prev.map(s => {
      if (s.id === surveyId) {
        return {
          ...s,
          status: 'submitted',
          reviewStatus: 'corrections_required',
          correctionsRequestedNotes: comments
        };
      }
      return s;
    }));

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: `Corrections Requested: ${survey.surveyNumber}`,
      message: `Engineering Lead ${currentUser.name} requested report revisions: "${comments}"`,
      timeAgo: 'Just now',
      type: 'warning',
      read: false,
      link: '/field/reports'
    }, ...prev]);

    showToast(`Corrections requested for ${survey.surveyNumber}. Technician notified.`, 'warning');
  };

  const rejectSurveyReport = (surveyId: string, reason: string) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;

    setSurveys(prev => prev.map(s => {
      if (s.id === surveyId) {
        return {
          ...s,
          status: 'rejected',
          reviewStatus: 'rejected',
          rejectionReason: reason
        };
      }
      return s;
    }));

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: `Survey Report Rejected: ${survey.surveyNumber}`,
      message: `Site survey rejected by Engineering Lead. Reason: ${reason}`,
      timeAgo: 'Just now',
      type: 'alert',
      read: false,
      link: '/surveys'
    }, ...prev]);

    showToast(`Survey ${survey.surveyNumber} marked as rejected.`, 'error');
  };

  const updateTechnicianAvailability = (technicianId: string, status: TechnicianAvailabilityStatus) => {
    setEmployees(prev => prev.map(e => e.id === technicianId ? {
      ...e,
      isAvailable: status === 'available'
    } : e));
    showToast(`Availability status updated to ${status.toUpperCase()}`, 'info');
  };

  const addTechnicianLeave = (leave: Omit<TechnicianLeave, 'id'>) => {
    const newLeave: TechnicianLeave = {
      ...leave,
      id: `lev-${Date.now()}`
    };
    setTechnicianLeaves(prev => [newLeave, ...prev]);
    showToast(`Leave request submitted for ${leave.technicianName} (${leave.startDate} to ${leave.endDate})`, 'success');
  };

  // Quotations
  const createQuotation = (quoteData: Omit<Quotation, 'id' | 'quotationNumber' | 'createdDate'>): Quotation => {
    const newId = `quot-${Date.now()}`;
    const quoteNum = `QTN-2026-${String(quotations.length + 91).padStart(3, '0')}`;
    const newQuotation: Quotation = {
      ...quoteData,
      id: newId,
      quotationNumber: quoteNum,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setQuotations(prev => [newQuotation, ...prev]);
    // update customer lead status to quotation_sent
    updateCustomerLeadStatus(quoteData.customerId, 'quotation_sent');
    showToast(`Quotation ${quoteNum} created successfully!`, 'success');
    return newQuotation;
  };

  const updateQuotationStatus = (quoteId: string, status: Quotation['status']) => {
    setQuotations(prev => prev.map(q => q.id === quoteId ? { ...q, status } : q));
    if (status === 'approved') {
      const q = quotations.find(item => item.id === quoteId);
      if (q) {
        // Auto convert to order
        const newOrderId = `ord-${Date.now()}`;
        const newOrderNum = `ORD-2026-${String(orders.length + 37).padStart(3, '0')}`;
        const newOrder: Order = {
          id: newOrderId,
          orderNumber: newOrderNum,
          quotationId: q.id,
          customerId: q.customerId,
          customerName: q.customerName,
          customerPhone: q.customerPhone,
          customerCity: 'Pune',
          capacityKw: q.capacityKw,
          totalOrderValue: q.totalAmount,
          advanceAmountPaid: 0,
          outstandingBalance: q.totalAmount,
          orderStatus: 'confirmed',
          paymentStatus: 'unpaid',
          orderDate: new Date().toISOString().split('T')[0]
        };
        setOrders(prev => [newOrder, ...prev]);
        updateCustomerLeadStatus(q.customerId, 'converted');
        showToast(`Quotation approved! Order ${newOrderNum} automatically generated.`, 'success');
      }
    } else {
      showToast(`Quotation marked as ${status}`, 'info');
    }
  };

  // Orders & Payments
  const recordPayment = (paymentData: Omit<PaymentRecord, 'id' | 'paymentNumber' | 'paymentDate' | 'recordedBy'>) => {
    const newId = `pay-${Date.now()}`;
    const payNum = `REC-2026-${String(payments.length + 65).padStart(3, '0')}`;
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: newId,
      paymentNumber: payNum,
      paymentDate: new Date().toISOString().split('T')[0],
      recordedBy: currentUser.name
    };
    setPayments(prev => [newPayment, ...prev]);

    // Update order outstanding balance
    setOrders(prev => prev.map(o => {
      if (o.id === paymentData.orderId) {
        const newPaid = o.advanceAmountPaid + paymentData.amount;
        const newBalance = Math.max(0, o.totalOrderValue - newPaid);
        const paymentStatus = newBalance === 0 ? 'fully_paid' : 'partially_paid';
        return {
          ...o,
          advanceAmountPaid: newPaid,
          outstandingBalance: newBalance,
          paymentStatus,
          orderStatus: o.orderStatus === 'confirmed' ? 'processing' : o.orderStatus
        };
      }
      return o;
    }));

    showToast(`Payment of ₹${paymentData.amount.toLocaleString('en-IN')} recorded on ${payNum}`, 'success');
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: status } : o));
    showToast(`Order status updated to ${status.replace(/_/g, ' ').toUpperCase()}`, 'info');
  };

  // Inventory
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'sku'>) => {
    const newId = `prd-${Date.now()}`;
    const sku = `SKU-${itemData.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const newItem: InventoryItem = {
      ...itemData,
      id: newId,
      sku
    };
    setInventory(prev => [newItem, ...prev]);
    showToast(`Product ${itemData.name} added to warehouse inventory`, 'success');
  };

  const adjustStockQuantity = (productId: string, adjustment: number, notes?: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.availableQuantity + adjustment);
        const stockStatus = newQty === 0 ? 'out_of_stock' : (newQty <= item.minimumThreshold ? 'low_stock' : 'in_stock');
        return {
          ...item,
          availableQuantity: newQty,
          stockStatus
        };
      }
      return item;
    }));
    showToast(`Stock updated by ${adjustment > 0 ? '+' : ''}${adjustment} units${notes ? ` (${notes})` : ''}`, 'info');
  };

  // Dispatch & Warranty calculation on delivery
  const createDispatchOrder = (dispatchData: Omit<DispatchOrder, 'id' | 'dispatchNumber' | 'dispatchDate'>) => {
    const newId = `dsp-${Date.now()}`;
    const dspNum = `DSP-2026-${String(dispatches.length + 30).padStart(3, '0')}`;
    const newDispatch: DispatchOrder = {
      ...dispatchData,
      id: newId,
      dispatchNumber: dspNum,
      dispatchDate: new Date().toISOString().split('T')[0]
    };
    setDispatches(prev => [newDispatch, ...prev]);
    
    // Update order status to dispatched
    setOrders(prev => prev.map(o => o.id === dispatchData.orderId ? {
      ...o,
      orderStatus: 'dispatched',
      dispatchId: newId
    } : o));

    showToast(`Dispatch ${dspNum} created and assigned to ${dispatchData.deliveryPersonnel}`, 'success');
  };

  const confirmDelivery = (dispatchId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dispatch = dispatches.find(d => d.id === dispatchId);
    
    if (!dispatch) return;

    setDispatches(prev => prev.map(d => d.id === dispatchId ? {
      ...d,
      deliveryStatus: 'delivered',
      deliveredAt: new Date().toISOString()
    } : d));

    // Prompt requirement: "After successful delivery, trigger the warranty start-date calculation for the applicable equipment."
    // Inverter 2y, Battery 2y, Solar panels 20y from delivery date!
    const order = orders.find(o => o.id === dispatch.orderId);
    if (order) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, orderStatus: 'installation_scheduled' } : o));

      // Calculate end dates:
      const twoYearsLater = new Date();
      twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);
      const twoYearsStr = twoYearsLater.toISOString().split('T')[0];

      const twentyYearsLater = new Date();
      twentyYearsLater.setFullYear(twentyYearsLater.getFullYear() + 20);
      const twentyYearsStr = twentyYearsLater.toISOString().split('T')[0];

      // Update serial numbers
      setSerialNumbers(prev => prev.map(s => {
        if (dispatch.allocatedSerials.includes(s.serialNumber)) {
          return {
            ...s,
            currentStatus: 'dispatched',
            deliveryDate: todayStr,
            warrantyStartDate: todayStr,
            warrantyEndDate: twoYearsStr
          };
        }
        return s;
      }));

      // Generate active warranty record
      const newWarRecord: WarrantyRecord = {
        id: `war-${Date.now()}`,
        serialNumber: dispatch.allocatedSerials[0] || `SN-${order.orderNumber}`,
        productName: `${order.capacityKw}kW Solar Installation Inverter`,
        category: 'Inverters',
        customerId: order.customerId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orderId: order.id,
        orderNumber: order.orderNumber,
        deliveryDate: todayStr,
        warrantyStartDate: todayStr,
        warrantyEndDate: twoYearsStr,
        durationYears: 2,
        status: 'active'
      };

      setWarranties(prev => [newWarRecord, ...prev]);

      // Also create installation record if not present
      const newInstId = `inst-${Date.now()}`;
      const newInstCode = `INS-2026-${String(installations.length + 33).padStart(3, '0')}`;
      const newInstallation: Installation = {
        id: newInstId,
        installationCode: newInstCode,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: dispatch.deliveryAddress,
        capacityKw: order.capacityKw,
        systemType: 'on_grid',
        scheduledDate: todayStr,
        scheduledEndDate: todayStr,
        assignedTechnicianIds: ['emp-1'],
        technicianNames: ['Amit Jadhav (Lead)'],
        status: 'scheduled',
        checklist: {
          structureMounting: false,
          panelsMounted: false,
          earthingPitConnected: false,
          lightningArresterInstalled: false,
          inverterWired: false,
          dcWiringTested: false,
          acDbBoxConnected: false,
          biDirectionalMeterSync: false
        },
        photos: []
      };
      setInstallations(prev => [newInstallation, ...prev]);
    }

    showToast(`Delivery confirmed! Equipment warranties calculated and activated from ${todayStr}.`, 'success');
  };

  // Installations
  const startInstallation = (installationId: string) => {
    setInstallations(prev => prev.map(inst => inst.id === installationId ? {
      ...inst,
      status: 'in_progress',
      actualStartTime: new Date().toISOString()
    } : inst));
    showToast('Installation job started. Work timers active.', 'info');
  };

  const updateInstallationChecklist = (installationId: string, key: keyof Installation['checklist'], value: boolean) => {
    setInstallations(prev => prev.map(inst => {
      if (inst.id === installationId) {
        return {
          ...inst,
          checklist: {
            ...inst.checklist,
            [key]: value
          }
        };
      }
      return inst;
    }));
  };

  const completeInstallationJob = (installationId: string, signatureName: string, signatureDataUrl?: string, remarks?: string) => {
    const nowStr = new Date().toISOString();
    setInstallations(prev => prev.map(inst => {
      if (inst.id === installationId) {
        return {
          ...inst,
          status: 'completed',
          actualFinishTime: nowStr,
          customerSignName: signatureName,
          customerSignature: signatureDataUrl,
          technicianRemarks: remarks
        };
      }
      return inst;
    }));

    // Update corresponding order
    const inst = installations.find(i => i.id === installationId);
    if (inst) {
      setOrders(prev => prev.map(o => o.id === inst.orderId ? { ...o, orderStatus: 'completed' } : o));
    }

    showToast('Installation completed successfully with customer digital signoff!', 'success');
  };

  // Service Complaints
  const createServiceTicket = (complaintData: Omit<ServiceComplaint, 'id' | 'complaintId' | 'complaintDate' | 'status'>) => {
    const newId = `cmp-${Date.now()}`;
    const code = `TKT-2026-${String(complaints.length + 20).padStart(3, '0')}`;
    const newTicket: ServiceComplaint = {
      ...complaintData,
      id: newId,
      complaintId: code,
      complaintDate: new Date().toISOString().split('T')[0],
      status: 'open'
    };
    setComplaints(prev => [newTicket, ...prev]);
    showToast(`Service ticket ${code} created for ${complaintData.customerName}`, 'warning');
  };

  const updateTicketStatus = (ticketId: string, status: ServiceComplaint['status'], resolutionNotes?: string) => {
    setComplaints(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      status,
      resolutionNotes: resolutionNotes || t.resolutionNotes
    } : t));
    showToast(`Ticket status updated to ${status.replace('_', ' ').toUpperCase()}`, 'info');
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => {
      const isForCurrentRole = !n.targetRoles || n.targetRoles.includes(currentUser.role);
      return isForCurrentRole ? { ...n, read: true } : n;
    }));
    showToast('Notifications marked as read', 'info');
  };

  // Sales Workspace Operations
  const scheduleFollowUp = (item: Omit<FollowUpItem, 'id' | 'status'>) => {
    const newId = `flw-${Date.now()}`;
    const newFollowUp: FollowUpItem = {
      ...item,
      id: newId,
      status: 'pending'
    };
    setFollowUps(prev => [newFollowUp, ...prev]);
    addCommunicationRecord({
      customerId: item.customerId,
      authorName: currentUser.name,
      type: 'note',
      summary: `Follow-up Scheduled: ${item.followUpReason}`,
      details: `Scheduled for ${new Date(item.scheduledDate).toLocaleString()} with priority ${item.priority.toUpperCase()}`
    });
    showToast(`Follow-up scheduled with ${item.customerName}`, 'success');
  };

  const completeFollowUp = (id: string, notes?: string) => {
    const nowStr = new Date().toISOString();
    setFollowUps(prev => prev.map(f => {
      if (f.id === id) {
        addCommunicationRecord({
          customerId: f.customerId,
          authorName: currentUser.name,
          type: 'call',
          summary: `Completed Follow-up: ${f.followUpReason}`,
          details: notes || 'Follow-up interaction completed successfully.'
        });
        addSalesActivity({
          type: 'followup_completed',
          customerName: f.customerName,
          customerId: f.customerId,
          description: `Completed follow-up for ${f.customerName}: ${notes || f.followUpReason}`,
          salesperson: currentUser.name,
          relatedLink: `/customers`
        });
        return {
          ...f,
          status: 'completed',
          completedAt: nowStr,
          completionNotes: notes
        };
      }
      return f;
    }));
    showToast('Follow-up marked as completed and logged to communication history', 'success');
  };

  const rescheduleFollowUp = (id: string, newDate: string, reason?: string) => {
    setFollowUps(prev => prev.map(f => {
      if (f.id === id) {
        addCommunicationRecord({
          customerId: f.customerId,
          authorName: currentUser.name,
          type: 'note',
          summary: `Follow-up Rescheduled to ${new Date(newDate).toLocaleString()}`,
          details: reason || 'Customer requested postponement.'
        });
        return {
          ...f,
          scheduledDate: newDate,
          status: 'rescheduled',
          followUpReason: reason ? `${f.followUpReason} (${reason})` : f.followUpReason
        };
      }
      return f;
    }));
    showToast(`Follow-up rescheduled to ${new Date(newDate).toLocaleDateString()}`, 'info');
  };

  const createEnquiry = (enquiryData: Omit<CustomerEnquiry, 'id' | 'enquiryNumber' | 'receivedDate'>): CustomerEnquiry => {
    const newId = `enq-${Date.now()}`;
    const enqNum = `ENQ-2026-${String(enquiries.length + 87).padStart(3, '0')}`;
    const newEnquiry: CustomerEnquiry = {
      ...enquiryData,
      id: newId,
      enquiryNumber: enqNum,
      receivedDate: new Date().toISOString().split('T')[0]
    };
    setEnquiries(prev => [newEnquiry, ...prev]);
    
    addSalesActivity({
      type: 'enquiry_received',
      customerName: enquiryData.customerName,
      customerId: enquiryData.customerId,
      description: `New ${enquiryData.interestedCapacityKw} kW enquiry registered from ${enquiryData.source.replace('_', ' ')}`,
      salesperson: currentUser.name,
      relatedLink: `/enquiries`
    });

    showToast(`Enquiry ${enqNum} recorded for ${enquiryData.customerName}`, 'success');
    return newEnquiry;
  };

  const addCommunicationRecord = (record: Omit<CommunicationHistoryItem, 'id' | 'timestamp'>) => {
    const newId = `comm-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newRecord: CommunicationHistoryItem = {
      ...record,
      id: newId,
      timestamp: nowStr
    };
    setCommunicationHistory(prev => [newRecord, ...prev]);
  };

  const addSalesActivity = (activity: Omit<SalesActivityItem, 'id' | 'timestamp'>) => {
    const newId = `act-${Date.now()}`;
    const newAct: SalesActivityItem = {
      ...activity,
      id: newId,
      timestamp: 'Just now'
    };
    setSalesActivities(prev => [newAct, ...prev]);
  };

  const requestSiteSurvey = (customerId: string, scheduledDate: string, notes?: string): SiteSurvey => {
    const customer = customers.find(c => c.id === customerId);
    const newSurveyId = `surv-${Date.now()}`;
    const surveyNum = `SRV-2026-${String(surveys.length + 44).padStart(3, '0')}`;
    const newSurvey: SiteSurvey = {
      id: newSurveyId,
      surveyNumber: surveyNum,
      customerId: customerId,
      customerName: customer ? customer.fullName : 'Customer',
      customerPhone: customer ? customer.phone : '',
      customerAddress: customer ? `${customer.address}, ${customer.city}` : '',
      scheduledDate,
      status: 'scheduled',
      technicianObservations: notes
    };
    setSurveys(prev => [newSurvey, ...prev]);
    updateCustomerLeadStatus(customerId, 'survey_scheduled');
    
    addCommunicationRecord({
      customerId,
      authorName: currentUser.name,
      type: 'survey_requested',
      summary: `Site Survey ${surveyNum} Requested`,
      details: notes || 'Technician allocation requested for terrace shadow & azimuth assessment.'
    });

    addSalesActivity({
      type: 'survey_scheduled',
      customerName: customer ? customer.fullName : 'Customer',
      customerId,
      description: `Site survey ${surveyNum} requested for ${new Date(scheduledDate).toLocaleDateString()}`,
      salesperson: currentUser.name,
      relatedLink: '/surveys'
    });

    showToast(`Site survey ${surveyNum} scheduled for ${customer?.fullName}`, 'success');
    return newSurvey;
  };

  // AI Assistant Engine
  const sendAiQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: AiMessage = {
      id: `ai-msg-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: 'Just now'
    };

    setAiMessages(prev => [...prev, userMsg]);
    setIsAiGenerating(true);

    // Business Intelligence analysis generator
    setTimeout(() => {
      let reply = '';
      let tools: string[] = [];

      const lower = queryText.toLowerCase();
      if (lower.includes('delayed') || lower.includes('installation')) {
        tools = ['inspect_installations_database', 'filter_delayed_projects'];
        reply = `**Delayed Installations Report**\n\n- Currently, **0 installations** are critically overdue. However, **1 job (INS-2026-032 for Rajesh Sharma)** is queued to start on **Nov 23, 2026**.\n- Installation **INS-2026-031** for **Mahalaxmi Agro Plastics (5.0 kW)** was successfully completed on time with DISCOM bidirectional meter sync.\n\nTechnicians **Amit Jadhav** and **Vikas Shirole** are currently primed for upcoming dispatches.`;
      } else if (lower.includes('low') || lower.includes('stock') || lower.includes('product')) {
        tools = ['query_warehouse_inventory', 'evaluate_threshold_levels'];
        reply = `**Inventory Stock Alert Summary**\n\nIdentified **3 products** currently below their safe reorder threshold:\n1. **Growatt 3.3kW Dual-MPPT Inverter**: 6 available (Minimum: 8). *4 units reserved for approved jobs.*\n2. **SunPower 48V 100Ah LiFePO4 Battery**: 5 available (Minimum: 6).\n3. **Industrial ACDB & DCDB IP66 Enclosures**: 2 available (Minimum: 8).\n\nRecommended Action: Generate purchase requisition to Waaree Energies and Schneider Electric.`;
      } else if (lower.includes('revenue') || lower.includes('profit') || lower.includes('financial')) {
        tools = ['calculate_monthly_cashflow', 'aggregate_project_profitability'];
        reply = `**Financial Performance Overview (November 2026)**\n\n- **Total Revenue Recorded**: ₹1,48,50,000\n- **Outstanding Receivables**: ₹23,40,000 across 3 client milestones\n- **Average Project Gross Margin**: **27.12%**\n- Top Performer: **PRJ-ON-5KW-034 (Rajesh Sharma)** projected at **31.18% margin (₹96,240 net profit)**.`;
      } else if (lower.includes('complaint') || lower.includes('ticket') || lower.includes('service')) {
        tools = ['fetch_crm_tickets', 'verify_warranty_records'];
        reply = `**Active Service Complaints Summary**\n\n- **TKT-2026-018 (Prakash Rao)**: Inverter fault code \`ERR-INV-04\` (Grid Over-voltage). In progress with Senior Tech **Amit Jadhav**. Covered under 2-year manufacturer warranty.\n- **TKT-2026-019 (Mahalaxmi Agro Plastics)**: WiFi datalogger reconnection assigned to **Vikas Shirole**.\n\nBoth cases are verified **Under Active Warranty**.`;
      } else {
        tools = ['general_enterprise_search', 'rag_knowledge_base'];
        reply = `I have analyzed your query: *"${queryText}"*.\n\nSolarOS has synthesized data across CRM, Inventory, and Field Operations. All systems are operating normally with 42 active monthly projects on track for SunPower Solutions.`;
      }

      const assistantMsg: AiMessage = {
        id: `ai-reply-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: 'Just now',
        executedTools: tools,
        suggestedActions: [
          { label: 'View Inventory Alerts', action: 'Which products are running low?' },
          { label: 'Inspect Project Profitability', action: 'Show this month\'s revenue' }
        ]
      };

      setAiMessages(prev => [...prev, assistantMsg]);
      setIsAiGenerating(false);
    }, 900);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      isAuthenticated,
      login,
      logout,
      switchRole,
      usersList: SYSTEM_USERS,
      isGlobalSearchOpen,
      setIsGlobalSearchOpen,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      toasts,
      showToast,
      removeToast,
      customers,
      customerSites,
      addCustomer,
      addCustomerSite,
      updateCustomerLeadStatus,
      surveys,
      surveyAssignments,
      technicianLeaves,
      getNextSurveyNumber,
      assignSurveyTechnician,
      reassignSurveyTechnician,
      rescheduleSurvey,
      createSurveyRequest,
      cancelSurvey,
      submitSurveyForm,
      updateSurveyStatus,
      // Field & Engineering Lead Workflows
      claimSurvey,
      startSurvey,
      saveSurveyDraft,
      submitSurveyReport,
      approveSurveyReport,
      requestSurveyCorrections,
      rejectSurveyReport,
      updateTechnicianAvailability,
      addTechnicianLeave,
      packages,
      quotations,
      createQuotation,
      updateQuotationStatus,
      orders,
      payments,
      recordPayment,
      updateOrderStatus,
      inventory,
      addInventoryItem,
      adjustStockQuantity,
      serialNumbers,
      dispatches,
      createDispatchOrder,
      confirmDelivery,
      installations,
      startInstallation,
      updateInstallationChecklist,
      completeInstallationJob,
      warranties,
      complaints,
      createServiceTicket,
      updateTicketStatus,
      profitability,
      employees,
      notifications: notifications.filter(
        notification => !notification.targetRoles || notification.targetRoles.includes(currentUser.role)
      ),
      markNotificationAsRead,
      markAllNotificationsAsRead,
      // Sales Workspace
      followUps,
      scheduleFollowUp,
      completeFollowUp,
      rescheduleFollowUp,
      enquiries,
      createEnquiry,
      communicationHistory,
      addCommunicationRecord,
      salesActivities,
      addSalesActivity,
      requestSiteSurvey,
      aiMessages,
      isAiGenerating,
      sendAiQuery
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
