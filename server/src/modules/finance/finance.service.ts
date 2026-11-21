/**
 * SolarOS Finance & Profitability Backend Service
 * Authoritative financial accounting, revenue recognition, cost attribution, and ledger management.
 */

import { auditService } from '../audit/audit.service';
import { AppError } from '../../utils/response';

export interface DirectExpenseRecord {
  id: string;
  expenseNumber: string;
  projectId?: string;
  projectCode?: string;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  isCompanyLevel: boolean;
  category: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface FinancialLedgerRecord {
  id: string;
  transactionNumber: string;
  projectId?: string;
  projectCode?: string;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  type: 'REVENUE' | 'EQUIPMENT_COST' | 'LABOUR_COST' | 'DIRECT_EXPENSE' | 'ADJUSTMENT';
  category: string;
  amount: number;
  sourceModule: 'CRM' | 'INVENTORY' | 'DISPATCH' | 'INSTALLATION' | 'FINANCE' | 'EXPENSE';
  referenceNumber: string;
  date: string;
  status: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'POSTED' | 'CANCELLED';
  description: string;
  recordedBy: string;
  verifiedBy?: string;
  verifiedAt?: string;
  metadata?: Record<string, any>;
}

// In-memory persistent stores for production simulation
let expensesStore: DirectExpenseRecord[] = [
  {
    id: 'exp-1',
    expenseNumber: 'EXP-2026-001',
    projectId: 'prj-2',
    projectCode: 'PRJ-ON-5KW-035',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-035',
    customerName: 'Mahalaxmi Agro Plastics (Factory)',
    isCompanyLevel: false,
    category: 'DISCOM Inspection Fees',
    amount: 4200,
    vendor: 'MSEDCL Pune Circle Testing Division',
    expenseDate: '2026-10-25',
    paymentMethod: 'Bank Transfer (NEFT)',
    paymentStatus: 'paid',
    approvalStatus: 'approved',
    invoiceReference: 'MSEDCL-NET-8821',
    description: 'Bi-directional net meter testing and CEIG safety clearance fee',
    recordedBy: 'Sneha Rao (Accounts)',
    createdAt: '2026-10-25T11:30:00Z',
    updatedAt: '2026-10-25T14:00:00Z'
  },
  {
    id: 'exp-2',
    expenseNumber: 'EXP-2026-002',
    projectId: 'prj-2',
    projectCode: 'PRJ-ON-5KW-035',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-035',
    customerName: 'Mahalaxmi Agro Plastics (Factory)',
    isCompanyLevel: false,
    category: 'Crane & Scaffolding Rental',
    amount: 5000,
    vendor: 'Shree Industrial Lifting & Scaffolding Works',
    expenseDate: '2026-10-22',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    approvalStatus: 'approved',
    invoiceReference: 'SILS-2026-441',
    description: 'Scaffolding setup for 2-day roof mounting on industrial shed',
    recordedBy: 'Sneha Rao (Accounts)',
    createdAt: '2026-10-22T09:15:00Z',
    updatedAt: '2026-10-22T10:00:00Z'
  },
  {
    id: 'exp-3',
    expenseNumber: 'EXP-2026-003',
    projectId: 'prj-1',
    projectCode: 'PRJ-ON-5KW-034',
    orderId: 'ord-1',
    orderNumber: 'ORD-2026-034',
    customerName: 'Rajesh Sharma',
    isCompanyLevel: false,
    category: 'Freight & Site Transport',
    amount: 3400,
    vendor: 'City Express Tempo Services',
    expenseDate: '2026-11-18',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    approvalStatus: 'approved',
    invoiceReference: 'CETS-PUN-0912',
    description: 'Special handling and dispatch of 10 Waaree panels and mounting rails to Baner site',
    recordedBy: 'Sneha Rao (Accounts)',
    createdAt: '2026-11-18T10:00:00Z',
    updatedAt: '2026-11-18T11:00:00Z'
  },
  {
    id: 'exp-4',
    expenseNumber: 'EXP-2026-004',
    projectId: 'prj-1',
    projectCode: 'PRJ-ON-5KW-034',
    orderId: 'ord-1',
    orderNumber: 'ORD-2026-034',
    customerName: 'Rajesh Sharma',
    isCompanyLevel: false,
    category: 'Civil Works & Mounting Structure',
    amount: 5000,
    vendor: 'Reliable Metal Fabricators',
    expenseDate: '2026-11-19',
    paymentMethod: 'Bank Transfer (IMPS)',
    paymentStatus: 'paid',
    approvalStatus: 'approved',
    invoiceReference: 'RMF-2026-1049',
    description: 'Galvanized iron roof anchor pads and customized elevator shed brackets',
    recordedBy: 'Sneha Rao (Accounts)',
    createdAt: '2026-11-19T14:30:00Z',
    updatedAt: '2026-11-19T16:00:00Z'
  },
  {
    id: 'exp-5',
    expenseNumber: 'EXP-2026-005',
    projectId: 'prj-3',
    projectCode: 'PRJ-OFF-3KW-028',
    orderId: 'ord-3',
    orderNumber: 'ORD-2026-028',
    customerName: 'Giridhar Farms & Resort',
    isCompanyLevel: false,
    category: 'Tools & Consumables',
    amount: 7000,
    vendor: 'Shree Electrical Hardware Mart',
    expenseDate: '2026-10-10',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    approvalStatus: 'approved',
    invoiceReference: 'SEHM-8921',
    description: 'Heavy duty earthing chemical powder, copper bonded rods and copper lugs',
    recordedBy: 'Sneha Rao (Accounts)',
    createdAt: '2026-10-10T08:45:00Z',
    updatedAt: '2026-10-10T09:30:00Z'
  },
  {
    id: 'exp-6',
    expenseNumber: 'EXP-2026-006',
    projectId: 'prj-3',
    projectCode: 'PRJ-OFF-3KW-028',
    orderId: 'ord-3',
    orderNumber: 'ORD-2026-028',
    customerName: 'Giridhar Farms & Resort',
    isCompanyLevel: false,
    category: 'Freight & Site Transport',
    amount: 4500,
    vendor: 'Deccan Cargo Movers',
    expenseDate: '2026-10-11',
    paymentMethod: 'Bank Transfer (NEFT)',
    paymentStatus: 'paid',
    approvalStatus: 'approved',
    invoiceReference: 'DCM-1198',
    description: 'Long-distance transport of 48V LiFePO4 battery pack to rural resort site',
    recordedBy: 'Sneha Rao (Accounts)',
    createdAt: '2026-10-11T12:00:00Z',
    updatedAt: '2026-10-11T13:00:00Z'
  }
];

let paymentsStore: any[] = [
  {
    id: 'pay-1',
    paymentNumber: 'PAY-2026-001',
    orderId: 'ord-1',
    orderNumber: 'ORD-2026-034',
    customerName: 'Rajesh Sharma',
    amount: 95000,
    milestoneName: 'Booking & Procurement Advance (30%)',
    paymentMode: 'Bank Transfer (NEFT)',
    transactionReference: 'NEFT-AXIS-992108',
    status: 'verified',
    paymentDate: '2026-11-15',
    verifiedAt: '2026-11-15T15:30:00Z',
    verifiedBy: 'Sneha Rao (Accounts)'
  },
  {
    id: 'pay-2',
    paymentNumber: 'PAY-2026-002',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-035',
    customerName: 'Mahalaxmi Agro Plastics (Factory)',
    amount: 90285,
    milestoneName: 'Booking & Procurement Advance (30%)',
    paymentMode: 'Bank Transfer (RTGS)',
    transactionReference: 'RTGS-HDFC-332011',
    status: 'verified',
    paymentDate: '2026-10-18',
    verifiedAt: '2026-10-18T11:00:00Z',
    verifiedBy: 'Sneha Rao (Accounts)'
  },
  {
    id: 'pay-3',
    paymentNumber: 'PAY-2026-003',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-035',
    customerName: 'Mahalaxmi Agro Plastics (Factory)',
    amount: 210665,
    milestoneName: 'Delivery & Final Handover (70%)',
    paymentMode: 'Bank Transfer (RTGS)',
    transactionReference: 'RTGS-HDFC-449102',
    status: 'verified',
    paymentDate: '2026-10-31',
    verifiedAt: '2026-10-31T16:45:00Z',
    verifiedBy: 'Sneha Rao (Accounts)'
  },
  {
    id: 'pay-4',
    paymentNumber: 'PAY-2026-004',
    orderId: 'ord-3',
    orderNumber: 'ORD-2026-028',
    customerName: 'Giridhar Farms & Resort',
    amount: 285000,
    milestoneName: 'Full Project Settlement',
    paymentMode: 'Bank Transfer (RTGS)',
    transactionReference: 'RTGS-ICICI-110294',
    status: 'verified',
    paymentDate: '2026-10-15',
    verifiedAt: '2026-10-15T14:20:00Z',
    verifiedBy: 'Sneha Rao (Accounts)'
  }
];

class FinanceService {
  /**
   * Generates comprehensive company financial KPIs
   */
  async getFinancialSummary() {
    // 3 Orders in scope
    const projects = await this.getProjectsProfitability();

    let contractedValue = 0;
    let invoicedValue = 0;
    let verifiedCashCollected = 0;
    let recognizedRevenue = 0;
    let outstandingReceivables = 0;
    let totalEquipmentCost = 0;
    let totalLabourCost = 0;
    let totalDirectExpenses = 0;
    let netProjectProfit = 0;
    let activeProjectCount = 0;
    let completedProjectCount = 0;

    for (const p of projects) {
      contractedValue += p.contractedValue;
      invoicedValue += p.invoicedValue;
      verifiedCashCollected += p.verifiedCashCollected;
      recognizedRevenue += p.recognizedRevenue;
      outstandingReceivables += p.outstandingReceivables;
      totalEquipmentCost += p.equipmentCosts;
      totalLabourCost += p.labourCosts;
      totalDirectExpenses += p.otherExpenses;
      netProjectProfit += p.profit;

      if (p.paymentStatus === 'fully_paid' && p.completionDate.includes('2026-10')) {
        completedProjectCount++;
      } else {
        activeProjectCount++;
      }
    }

    // Company level expenses
    const companyExpenses = expensesStore.filter(e => e.isCompanyLevel);
    const companyExpenseSum = companyExpenses.reduce((sum, e) => sum + e.amount, 0);
    totalDirectExpenses += companyExpenseSum;
    netProjectProfit -= companyExpenseSum;

    const overallMarginPercent = recognizedRevenue > 0
      ? Number(((netProjectProfit / recognizedRevenue) * 100).toFixed(2))
      : 0;

    return {
      contractedValue,
      invoicedValue,
      verifiedCashCollected,
      unverifiedPayments: 0,
      recognizedRevenue,
      outstandingReceivables,
      totalEquipmentCost,
      totalLabourCost,
      totalDirectExpenses,
      netProjectProfit,
      overallMarginPercent,
      activeProjectCount,
      completedProjectCount,
      projectsCount: projects.length
    };
  }

  /**
   * Returns list of all project profitability records
   */
  async getProjectsProfitability() {
    return [
      {
        id: 'prf-1',
        projectId: 'prj-2',
        projectCode: 'PRJ-ON-5KW-035',
        orderId: 'ord-2',
        orderNumber: 'ORD-2026-035',
        customerName: 'Mahalaxmi Agro Plastics (Factory)',
        capacityKw: 5.0,
        systemType: 'On-Grid 5kW Commercial',
        contractedValue: 300950,
        invoicedValue: 300950,
        verifiedCashCollected: 300950,
        recognizedRevenue: 300950,
        outstandingReceivables: 0,
        revenue: 300950,
        equipmentCosts: 178500,
        labourCosts: 24000,
        otherExpenses: 9200,
        profit: 89250,
        profitMarginPercent: 29.66,
        paymentStatus: 'fully_paid',
        operationalStage: 'Commissioned & Handover',
        completionDate: '2026-10-30',
        hardwareBreakdown: [
          { item: 'Deye 5kW Three-Phase High-Efficiency Inverter', qty: 1, cost: 62000 },
          { item: 'Waaree 540W Mono PERC Half-Cut Module Set (10 Panels)', qty: 1, cost: 116500 }
        ],
        labourBreakdown: [
          { technician: 'Amit Jadhav', role: 'Crew Lead', hours: 40, rate: 350, cost: 14000 },
          { technician: 'Raju Shinde', role: 'Wireman', hours: 40, rate: 250, cost: 10000 }
        ]
      },
      {
        id: 'prf-2',
        projectId: 'prj-1',
        projectCode: 'PRJ-ON-5KW-034',
        orderId: 'ord-1',
        orderNumber: 'ORD-2026-034',
        customerName: 'Rajesh Sharma',
        capacityKw: 5.0,
        systemType: 'On-Grid 5kW Residential',
        contractedValue: 308640,
        invoicedValue: 308640,
        verifiedCashCollected: 95000,
        recognizedRevenue: 246912, // 80% recognition: dispatched & in transit
        outstandingReceivables: 213640,
        revenue: 246912,
        equipmentCosts: 182000,
        labourCosts: 22000,
        otherExpenses: 8400,
        profit: 34512,
        profitMarginPercent: 13.98,
        paymentStatus: 'partially_paid',
        operationalStage: 'Dispatched & In Transit',
        completionDate: '2026-11-25 (Est)',
        hardwareBreakdown: [
          { item: 'Deye 5kW Three-Phase Inverter', qty: 1, cost: 62000 },
          { item: 'Waaree 540W Mono PERC Half-Cut Module Set (10 Panels)', qty: 1, cost: 120000 }
        ],
        labourBreakdown: [
          { technician: 'Amit Jadhav', role: 'Crew Lead', hours: 35, rate: 350, cost: 12250 },
          { technician: 'Raju Shinde', role: 'Wireman', hours: 39, rate: 250, cost: 9750 }
        ]
      },
      {
        id: 'prf-3',
        projectId: 'prj-3',
        projectCode: 'PRJ-OFF-3KW-028',
        orderId: 'ord-3',
        orderNumber: 'ORD-2026-028',
        customerName: 'Giridhar Farms & Resort',
        capacityKw: 3.0,
        systemType: 'Off-Grid 3kW LiFePO4',
        contractedValue: 285000,
        invoicedValue: 285000,
        verifiedCashCollected: 285000,
        recognizedRevenue: 285000,
        outstandingReceivables: 0,
        revenue: 285000,
        equipmentCosts: 194000,
        labourCosts: 21000,
        otherExpenses: 11500,
        profit: 58500,
        profitMarginPercent: 20.53,
        paymentStatus: 'fully_paid',
        operationalStage: 'Commissioned & Handover',
        completionDate: '2026-10-15',
        hardwareBreakdown: [
          { item: 'Growatt 3.3kW Off-Grid Inverter', qty: 1, cost: 48000 },
          { item: 'Loom Solar 3kW Panel Pack', qty: 1, cost: 72000 },
          { item: '48V 100Ah LiFePO4 Battery Pack', qty: 1, cost: 74000 }
        ],
        labourBreakdown: [
          { technician: 'Amit Jadhav', role: 'Crew Lead', hours: 30, rate: 350, cost: 10500 },
          { technician: 'Raju Shinde', role: 'Wireman', hours: 42, rate: 250, cost: 10500 }
        ]
      }
    ];
  }

  /**
   * Generates the 7-section Project Financial Detail Drilldown
   */
  async getProjectDetail(projectIdOrOrder: string) {
    const projects = await this.getProjectsProfitability();
    const project = projects.find(
      p => p.projectId === projectIdOrOrder || p.orderId === projectIdOrOrder || p.projectCode === projectIdOrOrder || p.id === projectIdOrOrder
    );

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', `Project ${projectIdOrOrder} not found`);
    }

    const expenses = expensesStore.filter(
      e => e.projectId === project.projectId || e.orderId === project.orderId
    );

    const payments = paymentsStore.filter(
      p => p.orderId === project.orderId
    );

    return {
      summary: {
        projectId: project.projectId,
        projectCode: project.projectCode,
        orderId: project.orderId,
        orderNumber: project.orderNumber,
        customerName: project.customerName,
        capacityKw: project.capacityKw,
        systemType: project.systemType,
        operationalStatus: project.operationalStage,
        completionDate: project.completionDate
      },
      revenue: {
        contractedValue: project.contractedValue,
        invoicedValue: project.invoicedValue,
        verifiedCashCollected: project.verifiedCashCollected,
        unverifiedAmount: 0,
        recognizedRevenue: project.recognizedRevenue,
        outstandingReceivables: project.outstandingReceivables,
        revenueRecognitionMilestone: project.operationalStage,
        payments: payments.map(p => ({
          paymentId: p.id,
          receiptNumber: p.paymentNumber,
          milestoneName: p.milestoneName,
          amount: p.amount,
          date: p.paymentDate,
          method: p.paymentMode,
          status: p.status,
          transactionReference: p.transactionReference
        }))
      },
      equipmentCost: {
        totalEquipmentCost: project.equipmentCosts,
        dispatches: [
          {
            dispatchNumber: project.orderId === 'ord-2' ? 'DSP-2026-031' : 'DSP-2026-030',
            dispatchDate: project.orderId === 'ord-2' ? '2026-10-20' : '2026-11-17',
            deliveryStatus: project.orderId === 'ord-2' ? 'Delivered' : 'In Transit',
            items: project.hardwareBreakdown.map(h => ({
              productName: h.item,
              quantity: h.qty,
              unitCost: h.cost,
              totalCost: h.cost * h.qty
            }))
          }
        ]
      },
      labourCost: {
        totalLabourCost: project.labourCosts,
        workOrders: [
          {
            workOrderNumber: project.orderId === 'ord-2' ? 'WO-2026-035' : 'WO-2026-034',
            installDate: project.orderId === 'ord-2' ? '2026-10-22 to 2026-10-28' : '2026-11-20 to 2026-11-24',
            status: project.orderId === 'ord-2' ? 'Completed & Handover Signed' : 'In Progress',
            crew: project.labourBreakdown.map(l => ({
              technicianName: l.technician,
              role: l.role,
              hoursLogged: l.hours,
              hourlyRate: l.rate,
              labourCost: l.cost
            }))
          }
        ]
      },
      directExpenses: {
        totalDirectExpenses: project.otherExpenses,
        expenses
      },
      profitability: {
        revenue: project.recognizedRevenue,
        equipmentCosts: project.equipmentCosts,
        labourCosts: project.labourCosts,
        otherExpenses: project.otherExpenses,
        netProfit: project.profit,
        profitMarginPercent: project.profitMarginPercent
      },
      operationalMilestones: [
        { milestone: 'Contract Signed & Advance Paid', status: 'COMPLETED', date: project.orderId === 'ord-2' ? '2026-10-18' : '2026-11-15' },
        { milestone: 'Site Survey & Engineering Design', status: 'COMPLETED', date: project.orderId === 'ord-2' ? '2026-10-19' : '2026-11-16' },
        { milestone: 'Warehouse Dispatch & Hardware Arrival', status: 'COMPLETED', date: project.orderId === 'ord-2' ? '2026-10-21' : '2026-11-18' },
        { 
          milestone: 'Physical Installation & Array Wiring', 
          status: project.orderId === 'ord-2' ? 'COMPLETED' : 'IN_PROGRESS', 
          date: project.orderId === 'ord-2' ? '2026-10-28' : '2026-11-22' 
        },
        { 
          milestone: 'DISCOM Net Meter Testing & Commissioning', 
          status: project.orderId === 'ord-2' ? 'COMPLETED' : 'PENDING', 
          date: project.orderId === 'ord-2' ? '2026-10-30' : '2026-11-25 (Est)' 
        }
      ]
    };
  }

  /**
   * Generates chronological, idempotent financial transaction ledger
   */
  async getTransactions(filters: {
    projectId?: string;
    type?: string;
    category?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const transactions: FinancialLedgerRecord[] = [];

    // 1. Revenue Transactions from Payments
    for (const p of paymentsStore) {
      transactions.push({
        id: `tx-rev-${p.id}`,
        transactionNumber: `TX-${p.paymentNumber}`,
        projectId: p.orderId === 'ord-2' ? 'prj-2' : p.orderId === 'ord-1' ? 'prj-1' : 'prj-3',
        projectCode: p.orderId === 'ord-2' ? 'PRJ-ON-5KW-035' : p.orderId === 'ord-1' ? 'PRJ-ON-5KW-034' : 'PRJ-OFF-3KW-028',
        orderId: p.orderId,
        orderNumber: p.orderNumber,
        customerName: p.customerName,
        type: 'REVENUE',
        category: 'Client Milestone Inward',
        amount: p.amount,
        sourceModule: 'FINANCE',
        referenceNumber: p.transactionReference || p.paymentNumber,
        date: p.paymentDate,
        status: p.status === 'verified' ? 'POSTED' : 'PENDING',
        description: `${p.milestoneName} - ${p.customerName}`,
        recordedBy: 'Sneha Rao (Accounts)',
        verifiedBy: p.verifiedBy,
        verifiedAt: p.verifiedAt
      });
    }

    // 2. Direct Expense Transactions
    for (const e of expensesStore) {
      transactions.push({
        id: `tx-exp-${e.id}`,
        transactionNumber: `TX-${e.expenseNumber}`,
        projectId: e.projectId,
        projectCode: e.projectCode,
        orderId: e.orderId,
        orderNumber: e.orderNumber,
        customerName: e.customerName,
        type: 'DIRECT_EXPENSE',
        category: e.category,
        amount: e.amount,
        sourceModule: 'EXPENSE',
        referenceNumber: e.invoiceReference || e.expenseNumber,
        date: e.expenseDate,
        status: e.approvalStatus === 'approved' ? 'POSTED' : 'PENDING',
        description: `${e.category} - ${e.description} (${e.vendor})`,
        recordedBy: e.recordedBy
      });
    }

    // 3. Equipment Dispatches
    transactions.push({
      id: 'tx-eq-dsp-1',
      transactionNumber: 'TX-DSP-2026-030',
      projectId: 'prj-1',
      projectCode: 'PRJ-ON-5KW-034',
      orderId: 'ord-1',
      orderNumber: 'ORD-2026-034',
      customerName: 'Rajesh Sharma',
      type: 'EQUIPMENT_COST',
      category: 'Hardware BOM Dispatch',
      amount: 182000,
      sourceModule: 'DISPATCH',
      referenceNumber: 'DSP-2026-030',
      date: '2026-11-17',
      status: 'POSTED',
      description: 'Warehouse dispatch: Deye Inverter & 10 Waaree Solar Modules',
      recordedBy: 'Ganesh Shinde (Logistics)'
    });

    transactions.push({
      id: 'tx-eq-dsp-2',
      transactionNumber: 'TX-DSP-2026-031',
      projectId: 'prj-2',
      projectCode: 'PRJ-ON-5KW-035',
      orderId: 'ord-2',
      orderNumber: 'ORD-2026-035',
      customerName: 'Mahalaxmi Agro Plastics (Factory)',
      type: 'EQUIPMENT_COST',
      category: 'Hardware BOM Dispatch',
      amount: 178500,
      sourceModule: 'DISPATCH',
      referenceNumber: 'DSP-2026-031',
      date: '2026-10-20',
      status: 'POSTED',
      description: 'Warehouse dispatch: Deye Inverter & 10 Waaree Solar Modules',
      recordedBy: 'Ganesh Shinde (Logistics)'
    });

    // 4. Labour Costs
    transactions.push({
      id: 'tx-lb-wo-1',
      transactionNumber: 'TX-WO-2026-034',
      projectId: 'prj-1',
      projectCode: 'PRJ-ON-5KW-034',
      orderId: 'ord-1',
      orderNumber: 'ORD-2026-034',
      customerName: 'Rajesh Sharma',
      type: 'LABOUR_COST',
      category: 'Technician Crew Labour',
      amount: 22000,
      sourceModule: 'INSTALLATION',
      referenceNumber: 'WO-2026-034',
      date: '2026-11-20',
      status: 'POSTED',
      description: 'Field Crew Installation Labour (Amit Jadhav + Raju Shinde)',
      recordedBy: 'Amit Jadhav (Crew Lead)'
    });

    transactions.push({
      id: 'tx-lb-wo-2',
      transactionNumber: 'TX-WO-2026-035',
      projectId: 'prj-2',
      projectCode: 'PRJ-ON-5KW-035',
      orderId: 'ord-2',
      orderNumber: 'ORD-2026-035',
      customerName: 'Mahalaxmi Agro Plastics (Factory)',
      type: 'LABOUR_COST',
      category: 'Technician Crew Labour',
      amount: 24000,
      sourceModule: 'INSTALLATION',
      referenceNumber: 'WO-2026-035',
      date: '2026-10-28',
      status: 'POSTED',
      description: 'Field Crew Installation Labour (Amit Jadhav + Raju Shinde)',
      recordedBy: 'Amit Jadhav (Crew Lead)'
    });

    // Sort descending by date
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply filters
    return transactions.filter(t => {
      if (filters.projectId && t.projectId !== filters.projectId && t.orderId !== filters.projectId) {
        return false;
      }
      if (filters.type && filters.type !== 'ALL' && t.type !== filters.type) {
        return false;
      }
      if (filters.category && filters.category !== 'ALL' && t.category !== filters.category) {
        return false;
      }
      if (filters.status && filters.status !== 'ALL' && t.status !== filters.status) {
        return false;
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matches = 
          t.transactionNumber.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          (t.customerName && t.customerName.toLowerCase().includes(query)) ||
          (t.orderNumber && t.orderNumber.toLowerCase().includes(query)) ||
          (t.projectCode && t.projectCode.toLowerCase().includes(query));
        if (!matches) return false;
      }
      return true;
    });
  }

  /**
   * Records a new direct project or company expense
   */
  async recordExpense(data: {
    projectId?: string;
    projectCode?: string;
    orderId?: string;
    orderNumber?: string;
    customerName?: string;
    isCompanyLevel?: boolean;
    category: string;
    amount: number;
    vendor: string;
    expenseDate: string;
    paymentMethod: string;
    paymentStatus?: 'paid' | 'pending' | 'reimbursed';
    invoiceReference?: string;
    description: string;
    receiptUrl?: string;
    receiptFileName?: string;
  }, user: { id: string; name: string; role: string }) {
    if (!data.category) throw new AppError(422, 'VALIDATION_FAILED', 'Expense category is mandatory');
    if (!data.amount || data.amount <= 0) throw new AppError(422, 'VALIDATION_FAILED', 'Expense amount must be greater than zero');
    if (!data.vendor?.trim()) throw new AppError(422, 'VALIDATION_FAILED', 'Vendor name is mandatory');
    if (!data.description?.trim()) throw new AppError(422, 'VALIDATION_FAILED', 'Expense description is mandatory');

    if (!data.isCompanyLevel && !data.orderId && !data.projectId) {
      throw new AppError(422, 'VALIDATION_FAILED', 'Project/Order attribution is required for project expenses');
    }

    const nextIdNum = expensesStore.length + 1;
    const newExpense: DirectExpenseRecord = {
      id: `exp-${Date.now()}`,
      expenseNumber: `EXP-2026-${String(nextIdNum).padStart(3, '0')}`,
      projectId: data.projectId,
      projectCode: data.projectCode,
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      isCompanyLevel: !!data.isCompanyLevel,
      category: data.category,
      amount: Number(data.amount),
      vendor: data.vendor.trim(),
      expenseDate: data.expenseDate || new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod || 'Bank Transfer (NEFT)',
      paymentStatus: data.paymentStatus || 'paid',
      approvalStatus: 'approved',
      invoiceReference: data.invoiceReference,
      description: data.description.trim(),
      receiptUrl: data.receiptUrl,
      receiptFileName: data.receiptFileName,
      recordedBy: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expensesStore.unshift(newExpense);

    await auditService.record({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      permissionUsed: 'finance.create',
      action: 'EXPENSE_RECORD',
      entity: 'DirectExpense',
      entityId: newExpense.id,
      newState: newExpense,
      reason: `Direct expense recorded: ₹${newExpense.amount} for ${newExpense.category}`
    });

    return newExpense;
  }

  /**
   * Approves an existing direct expense (Executive / Accounting Lead)
   */
  async approveExpense(expenseId: string, user: { id: string; name: string; role: string }) {
    const expense = expensesStore.find(e => e.id === expenseId);
    if (!expense) throw new AppError(404, 'NOT_FOUND', 'Expense record not found');

    expense.approvalStatus = 'approved';
    expense.updatedAt = new Date().toISOString();

    await auditService.record({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      permissionUsed: 'finance.approve',
      action: 'EXPENSE_APPROVE',
      entity: 'DirectExpense',
      entityId: expense.id,
      newState: expense,
      reason: 'Direct expense audit and verification approved'
    });

    return expense;
  }

  /**
   * Records a payment receipt against an order
   */
  async recordPayment(data: {
    orderId: string;
    orderNumber?: string;
    customerName: string;
    amount: number;
    milestoneName?: string;
    paymentMode?: string;
    transactionReference?: string;
  }, user: { id: string; name: string; role: string }) {
    if (!data.amount || data.amount <= 0) throw new AppError(422, 'VALIDATION_FAILED', 'Payment amount must be greater than zero');
    if (!data.orderId) throw new AppError(422, 'VALIDATION_FAILED', 'Order ID is mandatory');

    const nextIdNum = paymentsStore.length + 1;
    const newPayment = {
      id: `pay-${Date.now()}`,
      paymentNumber: `PAY-2026-${String(nextIdNum).padStart(3, '0')}`,
      orderId: data.orderId,
      orderNumber: data.orderNumber || data.orderId,
      customerName: data.customerName,
      amount: Number(data.amount),
      milestoneName: data.milestoneName || 'Milestone Payment',
      paymentMode: data.paymentMode || 'Bank Transfer (NEFT)',
      transactionReference: data.transactionReference || `TXN-${Date.now()}`,
      status: 'pending',
      paymentDate: new Date().toISOString().split('T')[0],
      recordedAt: new Date().toISOString(),
      recordedBy: user.name
    };

    paymentsStore.unshift(newPayment);

    await auditService.record({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      permissionUsed: 'finance.create',
      action: 'PAYMENT_RECORD',
      entity: 'Payment',
      entityId: newPayment.id,
      newState: newPayment,
      reason: `Payment receipt recorded: ₹${newPayment.amount} from ${newPayment.customerName}`
    });

    return newPayment;
  }

  /**
   * Verifies bank clearance of payment
   */
  async verifyPayment(paymentId: string, user: { id: string; name: string; role: string }) {
    const payment = paymentsStore.find(p => p.id === paymentId);
    if (!payment) throw new AppError(404, 'NOT_FOUND', 'Payment record not found');

    payment.status = 'verified';
    payment.verifiedAt = new Date().toISOString();
    payment.verifiedBy = user.name;

    await auditService.record({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      permissionUsed: 'finance.approve',
      action: 'PAYMENT_VERIFY',
      entity: 'Payment',
      entityId: payment.id,
      newState: payment,
      reason: 'Bank clearance reconciliation confirmed'
    });

    return payment;
  }

  /**
   * Returns list of expenses
   */
  async getExpenses(filters: { projectId?: string; orderId?: string } = {}) {
    return expensesStore.filter(e => {
      if (filters.projectId && e.projectId !== filters.projectId) return false;
      if (filters.orderId && e.orderId !== filters.orderId) return false;
      return true;
    });
  }

  /**
   * Returns list of payments
   */
  async getPayments(filters: { orderId?: string } = {}) {
    return paymentsStore.filter(p => {
      if (filters.orderId && p.orderId !== filters.orderId) return false;
      return true;
    });
  }
}

export const financeService = new FinanceService();
