import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile, UserRole, Customer, SiteSurvey, SolarPackage,
  Quotation, Order, PaymentRecord, InventoryItem,
  SerialNumberRecord, DispatchOrder, Installation,
  WarrantyRecord, ServiceComplaint, ProjectProfitability,
  Employee, NotificationItem, AiMessage, FollowUpItem,
  CustomerEnquiry, CommunicationHistoryItem, SalesActivityItem
} from '../types';
import {
  SYSTEM_USERS, INITIAL_CUSTOMERS, INITIAL_SURVEYS,
  SOLAR_PACKAGES, INITIAL_QUOTATIONS, INITIAL_ORDERS,
  INITIAL_PAYMENTS, INITIAL_INVENTORY, INITIAL_SERIAL_NUMBERS,
  INITIAL_DISPATCHES, INITIAL_INSTALLATIONS, INITIAL_WARRANTIES,
  INITIAL_COMPLAINTS, INITIAL_PROFITABILITY, INITIAL_EMPLOYEES,
  INITIAL_NOTIFICATIONS, INITIAL_FOLLOW_UPS, INITIAL_ENQUIRIES,
  INITIAL_COMMUNICATION_HISTORY, INITIAL_SALES_ACTIVITIES
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
  addCustomer: (customer: Omit<Customer, 'id' | 'customerCode' | 'registrationDate'>) => Customer;
  updateCustomerLeadStatus: (customerId: string, status: Customer['leadStatus']) => void;
  
  surveys: SiteSurvey[];
  assignSurveyTechnician: (surveyId: string, technicianId: string, technicianName: string) => void;
  submitSurveyForm: (surveyId: string, details: Partial<SiteSurvey>) => void;
  updateSurveyStatus: (surveyId: string, status: SiteSurvey['status'], rejectionReason?: string) => void;
  
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
  const [surveys, setSurveys] = useState<SiteSurvey[]>(INITIAL_SURVEYS);
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
  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);
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

  // Site Surveys
  const assignSurveyTechnician = (surveyId: string, technicianId: string, technicianName: string) => {
    setSurveys(prev => prev.map(s => s.id === surveyId ? {
      ...s,
      technicianId,
      technicianName,
      status: 'assigned'
    } : s));
    showToast(`Technician ${technicianName} assigned to survey`, 'success');
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
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
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
      addCustomer,
      updateCustomerLeadStatus,
      surveys,
      assignSurveyTechnician,
      submitSurveyForm,
      updateSurveyStatus,
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
      notifications,
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
