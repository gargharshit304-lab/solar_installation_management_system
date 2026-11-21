import {
  UserProfile, Customer, SiteSurvey, SolarPackage,
  Quotation, Order, PaymentRecord, InventoryItem,
  SerialNumberRecord, DispatchOrder, Installation,
  WarrantyRecord, ServiceComplaint, ProjectProfitability,
  Employee, NotificationItem, FollowUpItem,
  CustomerEnquiry, CommunicationHistoryItem, SalesActivityItem,
  TechnicianLeave, SurveyAssignmentAudit
} from '../types';

export const SYSTEM_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@sunpowersolutions.in',
    role: 'owner_admin',
    roleTitle: 'Managing Director & Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Executive Management'
  },
  {
    id: 'usr-2',
    name: 'Pooja Kulkarni',
    email: 'pooja.k@sunpowersolutions.in',
    role: 'sales_exec',
    roleTitle: 'Senior Solar Sales Consultant',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Sales & Business Dev'
  },
  {
    id: 'usr-3',
    name: 'Suresh More',
    email: 'suresh.m@sunpowersolutions.in',
    role: 'survey_tech',
    roleTitle: 'Field Site Survey Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Field Engineering'
  },
  {
    id: 'usr-4',
    name: 'Ganesh Shinde',
    email: 'ganesh.s@sunpowersolutions.in',
    role: 'warehouse_mgr',
    roleTitle: 'Central Warehouse & Logistics Manager',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Supply Chain & Inventory'
  },
  {
    id: 'usr-5',
    name: 'Amit Jadhav',
    email: 'amit.j@sunpowersolutions.in',
    role: 'install_tech',
    roleTitle: 'Lead Solar Installation Engineer',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    department: 'Operations & Installations'
  },
  {
    id: 'usr-6',
    name: 'Sneha Deshpande',
    email: 'sneha.d@sunpowersolutions.in',
    role: 'support_exec',
    roleTitle: 'Client Care & Warranty Specialist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'After-Sales & Customer Service'
  },
  {
    id: 'usr-7',
    name: 'Ramesh Patil',
    email: 'ramesh.p@sunpowersolutions.in',
    role: 'accountant',
    roleTitle: 'Chief Financial Accountant',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    department: 'Finance & Compliance'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    customerCode: 'CUST-2026-001',
    fullName: 'Rajesh Sharma',
    phone: '+91 98201 44512',
    email: 'rajesh.sharma@gmail.com',
    address: 'Bunglow 14, Baner Hill View Society',
    city: 'Pune',
    state: 'Maharashtra',
    monthlyElectricityBill: 8200,
    interestedCapacityKw: 5.0,
    preferredSystemType: 'on_grid',
    roofSpaceSqft: 620,
    roofType: 'Flat RCC Concrete',
    enquirySource: 'website',
    assignedSalesperson: 'Pooja Kulkarni',
    leadStatus: 'survey_completed',
    registrationDate: '2026-11-02',
    notes: 'High daytime consumption with 3 ACs. Wants Tier-1 bifacial panels.'
  },
  {
    id: 'cust-2',
    customerCode: 'CUST-2026-002',
    fullName: 'Dr. Sunita Deshmukh',
    phone: '+91 98220 19340',
    email: 'dr.sunita@deshmukhclinic.org',
    address: 'Deshmukh Healthcare Centre, MG Road',
    city: 'Nashik',
    state: 'Maharashtra',
    monthlyElectricityBill: 14500,
    interestedCapacityKw: 5.0,
    preferredSystemType: 'off_grid',
    roofSpaceSqft: 750,
    roofType: 'RCC Terrace',
    enquirySource: 'whatsapp',
    assignedSalesperson: 'Pooja Kulkarni',
    leadStatus: 'quotation_sent',
    registrationDate: '2026-11-04',
    notes: 'Needs battery backup for medical refrigeration during load shedding.'
  },
  {
    id: 'cust-3',
    customerCode: 'CUST-2026-003',
    fullName: 'Mahalaxmi Agro Plastics (Factory)',
    phone: '+91 94223 88120',
    email: 'purchase@mahalaxmiagro.com',
    address: 'Plot F-18, MIDC Industrial Area',
    city: 'Aurangabad',
    state: 'Maharashtra',
    monthlyElectricityBill: 38000,
    interestedCapacityKw: 5.0,
    preferredSystemType: 'on_grid',
    roofSpaceSqft: 1800,
    roofType: 'Industrial Tin Shed',
    enquirySource: 'referral',
    assignedSalesperson: 'Pooja Kulkarni',
    leadStatus: 'converted',
    registrationDate: '2026-10-18',
    notes: 'Small factory phase 1 test installation before 50kW expansion.'
  },
  {
    id: 'cust-4',
    customerCode: 'CUST-2026-004',
    fullName: 'Anand Joshi',
    phone: '+91 98901 77231',
    email: 'anand.joshi@techcorp.in',
    address: 'Row House 9, Kothrud Woods',
    city: 'Pune',
    state: 'Maharashtra',
    monthlyElectricityBill: 4800,
    interestedCapacityKw: 3.0,
    preferredSystemType: 'on_grid',
    roofSpaceSqft: 380,
    roofType: 'Slanted Tile + Concrete',
    enquirySource: 'phone_call',
    assignedSalesperson: 'Pooja Kulkarni',
    leadStatus: 'survey_scheduled',
    registrationDate: '2026-11-12',
    notes: 'Looking for net metering subsidy under PM Surya Ghar Muft Bijli Yojana.'
  },
  {
    id: 'cust-5',
    customerCode: 'CUST-2026-005',
    fullName: 'Venkatesh Iyer',
    phone: '+91 98190 22345',
    email: 'v.iyer@iyerconsultants.com',
    address: 'Villa 7, Green Meadows, Viman Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    monthlyElectricityBill: 11000,
    interestedCapacityKw: 4.0,
    preferredSystemType: 'hybrid',
    roofSpaceSqft: 500,
    roofType: 'Flat RCC',
    enquirySource: 'website',
    assignedSalesperson: 'Pooja Kulkarni',
    leadStatus: 'negotiation',
    registrationDate: '2026-10-25',
    notes: 'Requested customized hybrid system with 5kWh lithium battery storage.'
  },
  {
    id: 'cust-6',
    customerCode: 'CUST-2026-006',
    fullName: 'Kiran Thorat',
    phone: '+91 97654 32190',
    email: 'kiran.thorat@outlook.com',
    address: 'Survey 44, Hadapsar Bypass Road',
    city: 'Pune',
    state: 'Maharashtra',
    monthlyElectricityBill: 3200,
    interestedCapacityKw: 2.0,
    preferredSystemType: 'on_grid',
    roofSpaceSqft: 260,
    roofType: 'Flat Terrace',
    enquirySource: 'manual',
    assignedSalesperson: 'Pooja Kulkarni',
    leadStatus: 'new',
    registrationDate: '2026-11-20',
    notes: 'Walk-in customer at Hadapsar branch. Enquired about 2kW system.'
  }
];

export const INITIAL_SURVEYS: SiteSurvey[] = [
  {
    id: 'surv-1',
    surveyNumber: 'SRV-2026-041',
    customerId: 'cust-1',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98201 44512',
    customerAddress: 'Bunglow 14, Baner Hill View Society, Pune',
    scheduledDate: '2026-11-08T10:30:00',
    timeSlot: '10:00 AM - 12:00 PM',
    estimatedDurationMinutes: 90,
    instructions: 'Ring bell at main gate. RCC flat terrace access via internal staircase.',
    technicianId: 'emp-3',
    technicianName: 'Suresh More',
    status: 'approved',
    roofDimensions: { lengthM: 15.5, widthM: 8.2 },
    totalRoofAreaSqm: 127.1,
    shadowFreeAreaSqm: 94.5,
    roofDirection: 'South',
    roofTiltDegrees: 18.0,
    cableDistanceMeters: 22.0,
    sanctionedLoadKw: 7.0,
    meterNumber: 'MSEDCL-PUN-884210',
    phaseType: 'three_phase',
    transformerDistanceM: 85,
    technicianObservations: 'Terrace is completely unobstructed. RCC slab in excellent condition. Direct South facing with optimal solar yield. Recommend 540W Mono PERC panels.',
    photos: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=500&auto=format&fit=crop&q=80'
    ],
    engineeringApproverName: 'Vikramaditya Rao (Lead Engineer)',
    approvedAt: '2026-11-09'
  },
  {
    id: 'surv-2',
    surveyNumber: 'SRV-2026-042',
    customerId: 'cust-2',
    customerName: 'Dr. Sunita Deshmukh',
    customerPhone: '+91 98220 19340',
    customerAddress: 'Deshmukh Healthcare Centre, MG Road, Nashik',
    scheduledDate: '2026-11-10T14:00:00',
    timeSlot: '02:00 PM - 04:00 PM',
    estimatedDurationMinutes: 120,
    instructions: 'Commercial hospital rooftop. Contact hospital manager Mr. Kulkarni on arrival.',
    technicianId: 'emp-3',
    technicianName: 'Suresh More',
    status: 'submitted',
    roofDimensions: { lengthM: 18.0, widthM: 9.0 },
    totalRoofAreaSqm: 162.0,
    shadowFreeAreaSqm: 110.0,
    roofDirection: 'South-West',
    roofTiltDegrees: 15.0,
    cableDistanceMeters: 30.0,
    sanctionedLoadKw: 10.0,
    meterNumber: 'MSEDCL-NSK-112093',
    phaseType: 'three_phase',
    transformerDistanceM: 40,
    technicianObservations: 'Water storage tank creates partial shadow after 4:30 PM on the north-east corner. Proposed layout avoids this zone entirely. Elevated structure recommended.',
    photos: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'surv-3',
    surveyNumber: 'SRV-2026-043',
    customerId: 'cust-4',
    customerName: 'Anand Joshi',
    customerPhone: '+91 98901 77231',
    customerAddress: 'Row House 9, Kothrud Woods, Pune',
    scheduledDate: '2026-11-22T10:00:00',
    timeSlot: '10:00 AM - 12:00 PM',
    estimatedDurationMinutes: 90,
    instructions: 'Customer requested laser measuring of sloping tiled section plus flat terrace.',
    technicianId: 'emp-3',
    technicianName: 'Suresh More',
    status: 'assigned',
    technicianObservations: 'Survey scheduled for upcoming morning. Customer has confirmed site access.'
  },
  {
    id: 'surv-4',
    surveyNumber: 'SRV-2026-044',
    customerId: 'cust-5',
    customerName: 'Venkatesh Iyer',
    customerPhone: '+91 98190 22345',
    customerAddress: 'Flat 402, Ganga Carnation, Koregaon Park, Pune',
    scheduledDate: '2026-11-22T14:30:00',
    timeSlot: '02:30 PM - 04:30 PM',
    estimatedDurationMinutes: 90,
    instructions: 'Top floor penthouse terrace. Society NOC obtained. Awaiting technician assignment.',
    status: 'unassigned',
    technicianObservations: 'Inbound enquiry from Website. High interest in 3kW on-grid with net metering.'
  },
  {
    id: 'surv-5',
    surveyNumber: 'SRV-2026-045',
    customerId: 'cust-6',
    customerName: 'Mahendra Patil (Precision Gears)',
    customerPhone: '+91 94220 88712',
    customerAddress: 'Plot 48, MIDC Bhosari Industrial Area, Pune',
    scheduledDate: '2026-11-23T10:00:00',
    timeSlot: '10:00 AM - 12:00 PM',
    estimatedDurationMinutes: 120,
    instructions: 'Industrial metal shed roof. Safety harness mandatory. Measure tin corrugation pitch.',
    status: 'unassigned',
    technicianObservations: '15kW commercial solar project enquiry. Require senior technician with industrial roof experience.'
  },
  {
    id: 'surv-6',
    surveyNumber: 'SRV-2026-046',
    customerId: 'cust-7',
    customerName: 'Rahul Kulkarni',
    customerPhone: '+91 98810 55432',
    customerAddress: 'B-12, Kumar Springwoods, Hadapsar, Pune',
    scheduledDate: '2026-11-21T11:00:00',
    timeSlot: '10:00 AM - 12:00 PM',
    estimatedDurationMinutes: 90,
    instructions: 'Technician currently on site conducting drone shadow mapping and consumer board check.',
    technicianId: 'emp-17',
    technicianName: 'Rahul Singh',
    status: 'in_progress',
    technicianObservations: 'Surveyor on site. Laser distance measuring in progress.'
  },
  {
    id: 'surv-7',
    surveyNumber: 'SRV-2026-047',
    customerId: 'cust-8',
    customerName: 'Sanjay Deshpande',
    customerPhone: '+91 98224 11980',
    customerAddress: 'Plot 19, Mayur Colony, Kothrud, Pune',
    scheduledDate: '2026-11-21T14:30:00',
    timeSlot: '02:30 PM - 04:30 PM',
    estimatedDurationMinutes: 90,
    instructions: 'Verify height of neighboring 4-story building on western side for evening shading.',
    technicianId: 'emp-16',
    technicianName: 'Amit Verma',
    status: 'scheduled',
    technicianObservations: 'Scheduled for today afternoon. Customer confirmed presence.'
  },
  {
    id: 'surv-8',
    surveyNumber: 'SRV-2026-048',
    customerId: 'cust-9',
    customerName: 'Kothrud Industrial Tools',
    customerPhone: '+91 98225 66710',
    customerAddress: 'Sector C, Kothrud Industrial Estate, Pune',
    scheduledDate: '2026-11-15T11:00:00',
    timeSlot: '10:00 AM - 12:00 PM',
    estimatedDurationMinutes: 120,
    technicianId: 'emp-18',
    technicianName: 'Vikram Patel',
    status: 'rejected',
    roofDimensions: { lengthM: 20.0, widthM: 10.0 },
    totalRoofAreaSqm: 200.0,
    shadowFreeAreaSqm: 72.0,
    rejectionReason: 'Structural roof slab crack & chimney shadow obstruction > 45%. Require elevated GI purlin frame and structural re-test.',
    technicianObservations: 'Chimney stack casts persistent shadow across center of roof. East wall has structural water seepage.'
  }
];

export const SOLAR_PACKAGES: SolarPackage[] = [
  {
    id: 'pkg-on-1kw',
    code: 'PKG-ON-1KW',
    name: 'SunPower On-Grid 1 kW Standard',
    type: 'on_grid',
    capacityKw: 1.0,
    description: 'Compact rooftop grid-tie system for apartments or small homes generating ~4-5 units daily.',
    basePrice: 65000,
    components: [
      { productId: 'prd-pan-540', productName: 'SunPower 540W Mono PERC Half-Cut Panel', quantity: 2, unit: 'pcs' },
      { productId: 'prd-inv-1kw', productName: 'Growatt 1kW Single Phase Grid-Tie Inverter', quantity: 1, unit: 'unit' },
      { productId: 'prd-str-1kw', productName: 'GI Anodized Fast-Mount Structure Set 1kW', quantity: 1, unit: 'set' },
      { productId: 'prd-wir-dc', productName: '4 sq.mm Copper Solar DC Cable UV Resistant', quantity: 30, unit: 'mtrs' },
      { productId: 'prd-box-acdc', productName: 'Dual AC/DC Distribution Box with SPD', quantity: 1, unit: 'box' },
      { productId: 'prd-saf-earth', productName: 'Pure Copper Chemical Earthing Rod 2.5m', quantity: 2, unit: 'pcs' }
    ]
  },
  {
    id: 'pkg-on-2kw',
    code: 'PKG-ON-2KW',
    name: 'SunPower On-Grid 2 kW Residential',
    type: 'on_grid',
    capacityKw: 2.0,
    description: 'Most popular package for 2BHK households generating ~8-10 units daily with net metering.',
    basePrice: 125000,
    components: [
      { productId: 'prd-pan-540', productName: 'SunPower 540W Mono PERC Half-Cut Panel', quantity: 4, unit: 'pcs' },
      { productId: 'prd-inv-2kw', productName: 'Solis 2kW Grid-Tie Inverter with WiFi Dongle', quantity: 1, unit: 'unit' },
      { productId: 'prd-str-2kw', productName: 'GI Anodized Heavy Roof Structure 2kW', quantity: 1, unit: 'set' },
      { productId: 'prd-wir-dc', productName: '4 sq.mm Copper Solar DC Cable UV Resistant', quantity: 45, unit: 'mtrs' },
      { productId: 'prd-box-acdc', productName: 'Dual AC/DC Distribution Box with SPD', quantity: 1, unit: 'box' },
      { productId: 'prd-saf-earth', productName: 'Pure Copper Chemical Earthing Rod 2.5m', quantity: 2, unit: 'pcs' }
    ]
  },
  {
    id: 'pkg-on-3kw',
    code: 'PKG-ON-3KW',
    name: 'SunPower On-Grid 3 kW Family Plus',
    type: 'on_grid',
    capacityKw: 3.0,
    description: 'Ideal for 3BHK homes with 1-2 ACs generating ~12-14 units daily. Maximum state subsidy eligible.',
    basePrice: 185000,
    components: [
      { productId: 'prd-pan-540', productName: 'SunPower 540W Mono PERC Half-Cut Panel', quantity: 6, unit: 'pcs' },
      { productId: 'prd-inv-3kw', productName: 'Growatt 3.3kW Dual-MPPT Inverter with WiFi', quantity: 1, unit: 'unit' },
      { productId: 'prd-str-3kw', productName: 'Hot-Dip Galvanized Elevated Stand 3kW', quantity: 1, unit: 'set' },
      { productId: 'prd-wir-dc', productName: '6 sq.mm Copper Solar DC Cable UV Resistant', quantity: 60, unit: 'mtrs' },
      { productId: 'prd-box-acdc', productName: 'ACDB + DCDB IP65 Enclosure with Type II SPD', quantity: 1, unit: 'box' },
      { productId: 'prd-saf-earth', productName: 'Pure Copper Chemical Earthing Rod 2.5m', quantity: 3, unit: 'pcs' }
    ]
  },
  {
    id: 'pkg-on-4kw',
    code: 'PKG-ON-4KW',
    name: 'SunPower On-Grid 4 kW Premium',
    type: 'on_grid',
    capacityKw: 4.0,
    description: 'Designed for large homes and boutique offices running heavy equipment and multiple ACs.',
    basePrice: 240000,
    components: [
      { productId: 'prd-pan-540', productName: 'SunPower 540W Mono PERC Half-Cut Panel', quantity: 8, unit: 'pcs' },
      { productId: 'prd-inv-4kw', productName: 'Growatt 4kW Dual-MPPT Inverter with WiFi', quantity: 1, unit: 'unit' },
      { productId: 'prd-str-4kw', productName: 'Hot-Dip Galvanized Elevated Stand 4kW', quantity: 1, unit: 'set' },
      { productId: 'prd-wir-dc', productName: '6 sq.mm Copper Solar DC Cable UV Resistant', quantity: 75, unit: 'mtrs' },
      { productId: 'prd-box-acdc', productName: 'ACDB + DCDB IP65 Enclosure with Type II SPD', quantity: 1, unit: 'box' },
      { productId: 'prd-saf-earth', productName: 'Pure Copper Chemical Earthing Rod 2.5m', quantity: 3, unit: 'pcs' }
    ]
  },
  {
    id: 'pkg-on-5kw',
    code: 'PKG-ON-5KW',
    name: 'SunPower On-Grid 5 kW High-Yield',
    type: 'on_grid',
    capacityKw: 5.0,
    description: 'Top-tier on-grid system for luxury bungalows and small commercial facilities generating ~22-25 units daily.',
    basePrice: 295000,
    components: [
      { productId: 'prd-pan-540', productName: 'SunPower 540W Mono PERC Half-Cut Panel', quantity: 10, unit: 'pcs' },
      { productId: 'prd-inv-5kw', productName: 'Deye 5kW Three-Phase High-Efficiency Inverter', quantity: 1, unit: 'unit' },
      { productId: 'prd-str-5kw', productName: 'High-Tensile Galvanized Structure Set 5kW', quantity: 1, unit: 'set' },
      { productId: 'prd-wir-dc', productName: '6 sq.mm Copper Solar DC Cable UV Resistant', quantity: 90, unit: 'mtrs' },
      { productId: 'prd-box-acdc', productName: 'Industrial ACDB & DCDB IP66 Enclosures', quantity: 1, unit: 'box' },
      { productId: 'prd-saf-earth', productName: 'Heavy-Duty Chemical Earthing Compound & Rod', quantity: 3, unit: 'pcs' }
    ]
  },
  {
    id: 'pkg-off-3kw',
    code: 'PKG-OFF-3KW',
    name: 'SunPower Off-Grid 3 kW Independence',
    type: 'off_grid',
    capacityKw: 3.0,
    description: 'Complete battery-backed autonomy with MPPT charge controller and high-cycle Lithium battery bank.',
    basePrice: 285000,
    components: [
      { productId: 'prd-pan-540', productName: 'SunPower 540W Mono PERC Half-Cut Panel', quantity: 6, unit: 'pcs' },
      { productId: 'prd-inv-off-3kw', productName: 'Luminous 3kVA Pure Sine Wave Off-Grid Inverter', quantity: 1, unit: 'unit' },
      { productId: 'prd-bat-lith-48v', productName: 'SunPower 48V 100Ah Lithium Iron Phosphate Battery (5.1kWh)', quantity: 1, unit: 'unit' },
      { productId: 'prd-ctrl-mppt-60', productName: 'Smart MPPT Solar Charge Controller 60A', quantity: 1, unit: 'unit' },
      { productId: 'prd-str-3kw', productName: 'Hot-Dip Galvanized Elevated Stand 3kW', quantity: 1, unit: 'set' },
      { productId: 'prd-wir-dc', productName: '6 sq.mm Copper Solar DC Cable UV Resistant', quantity: 60, unit: 'mtrs' }
    ]
  },
  {
    id: 'pkg-off-5kw',
    code: 'PKG-OFF-5KW',
    name: 'SunPower Off-Grid 5 kW Industrial Autonomy',
    type: 'off_grid',
    capacityKw: 5.0,
    description: 'Commercial grade off-grid power plant with 10.2 kWh lithium energy storage for critical loads.',
    basePrice: 420000,
    components: [
      { productId: 'prd-pan-540', productName: 'SunPower 540W Mono PERC Half-Cut Panel', quantity: 10, unit: 'pcs' },
      { productId: 'prd-inv-off-5kw', productName: 'Deye 5kW Hybrid Off-Grid Inverter', quantity: 1, unit: 'unit' },
      { productId: 'prd-bat-lith-48v', productName: 'SunPower 48V 100Ah Lithium Iron Phosphate Battery (5.1kWh)', quantity: 2, unit: 'unit' },
      { productId: 'prd-ctrl-mppt-60', productName: 'Smart MPPT Solar Charge Controller 60A', quantity: 1, unit: 'unit' },
      { productId: 'prd-str-5kw', productName: 'High-Tensile Galvanized Structure Set 5kW', quantity: 1, unit: 'set' },
      { productId: 'prd-wir-dc', productName: '6 sq.mm Copper Solar DC Cable UV Resistant', quantity: 90, unit: 'mtrs' }
    ]
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'quot-1',
    quotationNumber: 'QTN-2026-088',
    customerId: 'cust-1',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98201 44512',
    customerAddress: 'Bunglow 14, Baner Hill View Society, Pune',
    surveyId: 'surv-1',
    packageId: 'pkg-on-5kw',
    packageName: 'SunPower On-Grid 5 kW High-Yield',
    packageType: 'on_grid',
    capacityKw: 5.0,
    hardwareSubtotal: 255000,
    installationCharges: 25000,
    taxPercent: 13.8,
    applicableTaxes: 38640,
    discount: 10000,
    subsidyAmount: 78000,
    totalAmount: 308640,
    paymentTerms: '30% Advance on Booking, 60% on Dispatch Allocation, 10% on Net-Meter Synchronization',
    status: 'approved',
    createdDate: '2026-11-09',
    validUntil: '2026-11-24',
    preparedBy: 'Pooja Kulkarni'
  },
  {
    id: 'quot-2',
    quotationNumber: 'QTN-2026-089',
    customerId: 'cust-2',
    customerName: 'Dr. Sunita Deshmukh',
    customerPhone: '+91 98220 19340',
    customerAddress: 'Deshmukh Healthcare Centre, MG Road, Nashik',
    surveyId: 'surv-2',
    packageId: 'pkg-off-5kw',
    packageName: 'SunPower Off-Grid 5 kW Industrial Autonomy',
    packageType: 'off_grid',
    capacityKw: 5.0,
    hardwareSubtotal: 375000,
    installationCharges: 30000,
    taxPercent: 13.8,
    applicableTaxes: 55890,
    discount: 15000,
    subsidyAmount: 0,
    totalAmount: 445890,
    paymentTerms: '40% Advance on Confirmation, 50% on Equipment Arrival, 10% after 72hr load testing',
    status: 'sent',
    createdDate: '2026-11-11',
    validUntil: '2026-11-26',
    preparedBy: 'Pooja Kulkarni'
  },
  {
    id: 'quot-3',
    quotationNumber: 'QTN-2026-090',
    customerId: 'cust-3',
    customerName: 'Mahalaxmi Agro Plastics (Factory)',
    customerPhone: '+91 94223 88120',
    customerAddress: 'Plot F-18, MIDC Industrial Area, Aurangabad',
    packageId: 'pkg-on-5kw',
    packageName: 'SunPower On-Grid 5 kW High-Yield',
    packageType: 'on_grid',
    capacityKw: 5.0,
    hardwareSubtotal: 250000,
    installationCharges: 25000,
    taxPercent: 13.8,
    applicableTaxes: 37950,
    discount: 12000,
    subsidyAmount: 0,
    totalAmount: 300950,
    paymentTerms: '50% with PO, 40% on dispatch, 10% on commissioning report',
    status: 'approved',
    createdDate: '2026-10-22',
    validUntil: '2026-11-06',
    preparedBy: 'Pooja Kulkarni'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-2026-034',
    quotationId: 'quot-1',
    customerId: 'cust-1',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98201 44512',
    customerCity: 'Pune',
    capacityKw: 5.0,
    totalOrderValue: 308640,
    advanceAmountPaid: 95000,
    outstandingBalance: 213640,
    orderStatus: 'ready_for_dispatch',
    paymentStatus: 'partially_paid',
    orderDate: '2026-11-10',
    dispatchId: 'dsp-1'
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2026-035',
    quotationId: 'quot-3',
    customerId: 'cust-3',
    customerName: 'Mahalaxmi Agro Plastics (Factory)',
    customerPhone: '+91 94223 88120',
    customerCity: 'Aurangabad',
    capacityKw: 5.0,
    totalOrderValue: 300950,
    advanceAmountPaid: 300950,
    outstandingBalance: 0,
    orderStatus: 'completed',
    paymentStatus: 'fully_paid',
    orderDate: '2026-10-24',
    dispatchId: 'dsp-2',
    installationId: 'inst-1'
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-2026-036',
    quotationId: 'quot-2',
    customerId: 'cust-2',
    customerName: 'Dr. Sunita Deshmukh',
    customerPhone: '+91 98220 19340',
    customerCity: 'Nashik',
    capacityKw: 5.0,
    totalOrderValue: 445890,
    advanceAmountPaid: 0,
    outstandingBalance: 445890,
    orderStatus: 'pending',
    paymentStatus: 'unpaid',
    orderDate: '2026-11-15'
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    paymentNumber: 'REC-2026-061',
    orderId: 'ord-1',
    orderNumber: 'ORD-2026-034',
    customerId: 'cust-1',
    customerName: 'Rajesh Sharma',
    amount: 95000,
    paymentMethod: 'bank_transfer',
    transactionRef: 'NEFT-HDFC-991204882',
    paymentStage: 'advance',
    paymentDate: '2026-11-10',
    recordedBy: 'Ramesh Patil'
  },
  {
    id: 'pay-2',
    paymentNumber: 'REC-2026-052',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-035',
    customerId: 'cust-3',
    customerName: 'Mahalaxmi Agro Plastics',
    amount: 150000,
    paymentMethod: 'bank_transfer',
    transactionRef: 'RTGS-ICICI-00388129',
    paymentStage: 'advance',
    paymentDate: '2026-10-24',
    recordedBy: 'Ramesh Patil'
  },
  {
    id: 'pay-3',
    paymentNumber: 'REC-2026-055',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-035',
    customerId: 'cust-3',
    customerName: 'Mahalaxmi Agro Plastics',
    amount: 150950,
    paymentMethod: 'bank_transfer',
    transactionRef: 'RTGS-ICICI-00412890',
    paymentStage: 'final_commissioning',
    paymentDate: '2026-11-05',
    recordedBy: 'Ramesh Patil'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'prd-pan-540',
    sku: 'PAN-MONO-540W',
    name: 'SunPower 540W Mono PERC Half-Cut Panel (Tier 1)',
    category: 'Solar Panels',
    availableQuantity: 184,
    reservedQuantity: 40,
    minimumThreshold: 50,
    unitCost: 10200,
    sellingPrice: 13800,
    supplier: 'Waaree Energies Ltd',
    hasSerialTracking: false,
    stockStatus: 'in_stock',
    locationBin: 'BAY-A1-PALLET-04'
  },
  {
    id: 'prd-inv-5kw',
    sku: 'INV-DEYE-5KW-3P',
    name: 'Deye 5kW Three-Phase High-Efficiency Inverter',
    category: 'Inverters',
    availableQuantity: 14,
    reservedQuantity: 6,
    minimumThreshold: 8,
    unitCost: 46000,
    sellingPrice: 62000,
    supplier: 'Deye Solar India Pvt Ltd',
    hasSerialTracking: true,
    stockStatus: 'in_stock',
    locationBin: 'BAY-B2-SHELF-01'
  },
  {
    id: 'prd-inv-3kw',
    sku: 'INV-GROW-3.3K',
    name: 'Growatt 3.3kW Dual-MPPT Inverter with WiFi',
    category: 'Inverters',
    availableQuantity: 6,
    reservedQuantity: 4,
    minimumThreshold: 8,
    unitCost: 31000,
    sellingPrice: 42000,
    supplier: 'Growatt Power India',
    hasSerialTracking: true,
    stockStatus: 'low_stock',
    locationBin: 'BAY-B2-SHELF-03'
  },
  {
    id: 'prd-bat-lith-48v',
    sku: 'BAT-LIFEPO4-5.1K',
    name: 'SunPower 48V 100Ah LiFePO4 Lithium Battery (5.1kWh)',
    category: 'Batteries',
    availableQuantity: 5,
    reservedQuantity: 3,
    minimumThreshold: 6,
    unitCost: 78000,
    sellingPrice: 105000,
    supplier: 'Exide Industries (Energy Storage)',
    hasSerialTracking: true,
    stockStatus: 'low_stock',
    locationBin: 'BAY-C1-VAULT'
  },
  {
    id: 'prd-ctrl-mppt-60',
    sku: 'CTRL-MPPT-60A',
    name: 'Smart MPPT Solar Charge Controller 60A / 150V',
    category: 'Charge Controllers',
    availableQuantity: 12,
    reservedQuantity: 2,
    minimumThreshold: 5,
    unitCost: 11500,
    sellingPrice: 16200,
    supplier: 'Luminous Power Tech',
    hasSerialTracking: true,
    stockStatus: 'in_stock',
    locationBin: 'BAY-C2-BIN-09'
  },
  {
    id: 'prd-str-5kw',
    sku: 'STR-GI-HD-5KW',
    name: 'High-Tensile Galvanized Structure Set 5kW',
    category: 'Metal Stands',
    availableQuantity: 22,
    reservedQuantity: 8,
    minimumThreshold: 10,
    unitCost: 16000,
    sellingPrice: 22000,
    supplier: 'Pennar Industries',
    hasSerialTracking: false,
    stockStatus: 'in_stock',
    locationBin: 'YARD-RACK-03'
  },
  {
    id: 'prd-wir-dc',
    sku: 'CAB-SOLAR-DC-6MM',
    name: '6 sq.mm Copper Solar DC Cable UV Resistant (100m Drum)',
    category: 'Wires',
    availableQuantity: 18,
    reservedQuantity: 5,
    minimumThreshold: 10,
    unitCost: 5400,
    sellingPrice: 7200,
    supplier: 'Polycab India Ltd',
    hasSerialTracking: false,
    stockStatus: 'in_stock',
    locationBin: 'BAY-D1-DRUMS'
  },
  {
    id: 'prd-box-acdc',
    sku: 'BOX-ACDB-DCDB-5K',
    name: 'Industrial ACDB & DCDB IP66 Enclosures with Type II SPD',
    category: 'Wiring Boxes',
    availableQuantity: 2,
    reservedQuantity: 4,
    minimumThreshold: 8,
    unitCost: 8200,
    sellingPrice: 11500,
    supplier: 'Schneider Electric India',
    hasSerialTracking: false,
    stockStatus: 'low_stock',
    locationBin: 'BAY-D2-SHELF-02'
  },
  {
    id: 'prd-saf-earth',
    sku: 'SAF-EARTH-ROD-COP',
    name: 'Heavy-Duty Chemical Earthing Compound & 2.5m Pure Copper Rod',
    category: 'Safety Equipment',
    availableQuantity: 42,
    reservedQuantity: 12,
    minimumThreshold: 20,
    unitCost: 2600,
    sellingPrice: 3800,
    supplier: 'TruePower Earthings',
    hasSerialTracking: false,
    stockStatus: 'in_stock',
    locationBin: 'BAY-E1-BIN-14'
  }
];

export const INITIAL_SERIAL_NUMBERS: SerialNumberRecord[] = [
  {
    id: 'ser-1',
    serialNumber: 'DEYE-2026-INV-99410',
    productId: 'prd-inv-5kw',
    productName: 'Deye 5kW Three-Phase Inverter',
    category: 'Inverters',
    purchaseDate: '2026-09-15',
    supplier: 'Deye Solar India Pvt Ltd',
    currentStatus: 'reserved',
    assignedCustomer: 'Rajesh Sharma',
    relatedOrderId: 'ord-1'
  },
  {
    id: 'ser-2',
    serialNumber: 'DEYE-2026-INV-88124',
    productId: 'prd-inv-5kw',
    productName: 'Deye 5kW Three-Phase Inverter',
    category: 'Inverters',
    purchaseDate: '2026-08-20',
    supplier: 'Deye Solar India Pvt Ltd',
    currentStatus: 'installed',
    assignedCustomer: 'Mahalaxmi Agro Plastics (Factory)',
    relatedOrderId: 'ord-2',
    deliveryDate: '2026-10-26',
    warrantyStartDate: '2026-10-26',
    warrantyEndDate: '2028-10-26'
  },
  {
    id: 'ser-3',
    serialNumber: 'BAT-LIFE-48V-00412',
    productId: 'prd-bat-lith-48v',
    productName: 'SunPower 48V 100Ah LiFePO4 Battery',
    category: 'Batteries',
    purchaseDate: '2026-09-02',
    supplier: 'Exide Industries',
    currentStatus: 'in_warehouse'
  },
  {
    id: 'ser-4',
    serialNumber: 'CTRL-MPPT-60-77192',
    productId: 'prd-ctrl-mppt-60',
    productName: 'Smart MPPT Solar Controller 60A',
    category: 'Charge Controllers',
    purchaseDate: '2026-10-01',
    supplier: 'Luminous Power Tech',
    currentStatus: 'in_warehouse'
  },
  {
    id: 'ser-5',
    serialNumber: 'GROW-2026-3K-55219',
    productId: 'prd-inv-3kw',
    productName: 'Growatt 3.3kW Dual-MPPT Inverter',
    category: 'Inverters',
    purchaseDate: '2026-07-11',
    supplier: 'Growatt Power India',
    currentStatus: 'installed',
    assignedCustomer: 'Prakash Rao (Legacy Client)',
    relatedOrderId: 'ord-legacy-01',
    deliveryDate: '2025-12-10',
    warrantyStartDate: '2025-12-10',
    warrantyEndDate: '2027-12-10'
  }
];

export const INITIAL_DISPATCHES: DispatchOrder[] = [
  {
    id: 'dsp-1',
    dispatchNumber: 'DSP-2026-029',
    orderId: 'ord-1',
    orderNumber: 'ORD-2026-034',
    customerId: 'cust-1',
    customerName: 'Rajesh Sharma',
    deliveryAddress: 'Bunglow 14, Baner Hill View Society, Baner, Pune - 411045',
    allocatedSerials: ['DEYE-2026-INV-99410'],
    dispatchDate: '2026-11-21',
    deliveryPersonnel: 'Tukaram Jadhav (Logistics Driver)',
    vehicleNumber: 'MH-12-RN-8840',
    deliveryStatus: 'in_transit'
  },
  {
    id: 'dsp-2',
    dispatchNumber: 'DSP-2026-026',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-035',
    customerId: 'cust-3',
    customerName: 'Mahalaxmi Agro Plastics',
    deliveryAddress: 'Plot F-18, MIDC Industrial Area, Chhatrapati Sambhajinagar',
    allocatedSerials: ['DEYE-2026-INV-88124'],
    dispatchDate: '2026-10-25',
    deliveryPersonnel: 'Tukaram Jadhav',
    vehicleNumber: 'MH-12-RN-8840',
    deliveryStatus: 'delivered',
    deliveredAt: '2026-10-26T16:45:00'
  }
];

export const INITIAL_INSTALLATIONS: Installation[] = [
  {
    id: 'inst-1',
    installationCode: 'INS-2026-031',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-035',
    customerId: 'cust-3',
    customerName: 'Mahalaxmi Agro Plastics (Factory)',
    customerPhone: '+91 94223 88120',
    customerAddress: 'Plot F-18, MIDC Industrial Area, Aurangabad',
    capacityKw: 5.0,
    systemType: 'on_grid',
    scheduledDate: '2026-10-28',
    scheduledEndDate: '2026-10-30',
    actualStartTime: '2026-10-28T09:00:00',
    actualFinishTime: '2026-10-30T17:30:00',
    assignedTechnicianIds: ['emp-1', 'emp-5'],
    technicianNames: ['Amit Jadhav (Lead)', 'Sachin Kale'],
    status: 'completed',
    checklist: {
      structureMounting: true,
      panelsMounted: true,
      earthingPitConnected: true,
      lightningArresterInstalled: true,
      inverterWired: true,
      dcWiringTested: true,
      acDbBoxConnected: true,
      biDirectionalMeterSync: true
    },
    photos: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=500&auto=format&fit=crop&q=80'
    ],
    customerSignName: 'Nitin Patil (Factory Manager)',
    technicianRemarks: 'Commissioned successfully. Peak generation tested at 4.88 kW on clear noon sun. Meter bidirectional sync completed with DISCOM engineer present.'
  },
  {
    id: 'inst-2',
    installationCode: 'INS-2026-032',
    orderId: 'ord-1',
    orderNumber: 'ORD-2026-034',
    customerId: 'cust-1',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98201 44512',
    customerAddress: 'Bunglow 14, Baner Hill View Society, Baner, Pune',
    capacityKw: 5.0,
    systemType: 'on_grid',
    scheduledDate: '2026-11-23',
    scheduledEndDate: '2026-11-25',
    assignedTechnicianIds: ['emp-1', 'emp-2'],
    technicianNames: ['Amit Jadhav (Lead)', 'Vikas Shirole'],
    status: 'assigned',
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
  }
];

export const INITIAL_WARRANTIES: WarrantyRecord[] = [
  {
    id: 'war-1',
    serialNumber: 'DEYE-2026-INV-88124',
    productName: 'Deye 5kW Three-Phase High-Efficiency Inverter',
    category: 'Inverters',
    customerId: 'cust-3',
    customerName: 'Mahalaxmi Agro Plastics (Factory)',
    customerPhone: '+91 94223 88120',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-035',
    deliveryDate: '2026-10-26',
    warrantyStartDate: '2026-10-26',
    warrantyEndDate: '2028-10-26',
    durationYears: 2,
    status: 'active'
  },
  {
    id: 'war-2',
    serialNumber: 'GROW-2026-3K-55219',
    productName: 'Growatt 3.3kW Dual-MPPT Inverter',
    category: 'Inverters',
    customerId: 'cust-leg-1',
    customerName: 'Prakash Rao',
    customerPhone: '+91 98223 44109',
    orderId: 'ord-legacy-01',
    orderNumber: 'ORD-2025-012',
    deliveryDate: '2025-12-10',
    warrantyStartDate: '2025-12-10',
    warrantyEndDate: '2027-12-10',
    durationYears: 2,
    status: 'active'
  },
  {
    id: 'war-3',
    serialNumber: 'PAN-BATCH-WAA-2026-08',
    productName: 'Waaree 540W Mono PERC Half-Cut Module Set (10 Panels)',
    category: 'Solar Panels',
    customerId: 'cust-3',
    customerName: 'Mahalaxmi Agro Plastics (Factory)',
    customerPhone: '+91 94223 88120',
    orderId: 'ord-2',
    orderNumber: 'ORD-2026-035',
    deliveryDate: '2026-10-26',
    warrantyStartDate: '2026-10-26',
    warrantyEndDate: '2046-10-26',
    durationYears: 20,
    status: 'active'
  }
];

export const INITIAL_COMPLAINTS: ServiceComplaint[] = [
  {
    id: 'cmp-1',
    complaintId: 'TKT-2026-018',
    customerId: 'cust-leg-1',
    customerName: 'Prakash Rao',
    customerPhone: '+91 98223 44109',
    equipmentSerialNumber: 'GROW-2026-3K-55219',
    productName: 'Growatt 3.3kW Dual-MPPT Inverter',
    faultDescription: 'Inverter tripping frequently with red alarm light flashing. Display showing error code ERR-INV-04 (Grid Over-Voltage).',
    faultCode: 'ERR-INV-04',
    priority: 'high',
    assignedTechnicianName: 'Amit Jadhav',
    complaintDate: '2026-11-19',
    isUnderWarranty: true,
    estimatedRepairCost: 0,
    estimatedLabourCost: 0,
    status: 'in_progress',
    resolutionNotes: 'Technician visited site; grid voltage fluctuating to 258V from local feeder. Calibrated inverter permissible ceiling to 260V with DISCOM approval.'
  },
  {
    id: 'cmp-2',
    complaintId: 'TKT-2026-019',
    customerId: 'cust-3',
    customerName: 'Mahalaxmi Agro Plastics',
    customerPhone: '+91 94223 88120',
    equipmentSerialNumber: 'DEYE-2026-INV-88124',
    productName: 'Deye 5kW Three-Phase Inverter',
    faultDescription: 'WiFi dongle disconnected after router password change. Need technician to rebind dongle to Solarman cloud.',
    faultCode: 'COMM-WIFI-FAIL',
    priority: 'low',
    assignedTechnicianName: 'Vikas Shirole',
    complaintDate: '2026-11-20',
    isUnderWarranty: true,
    status: 'assigned'
  }
];

export const INITIAL_PROFITABILITY: ProjectProfitability[] = [
  {
    id: 'prf-1',
    projectCode: 'PRJ-ON-5KW-035',
    orderNumber: 'ORD-2026-035',
    customerName: 'Mahalaxmi Agro Plastics (Factory)',
    capacityKw: 5.0,
    systemType: 'On-Grid 5kW Commercial',
    revenue: 300950,
    equipmentCosts: 178500,
    labourCosts: 24000,
    otherExpenses: 9200,
    profit: 89250,
    profitMarginPercent: 29.66,
    paymentStatus: 'fully_paid',
    completionDate: '2026-10-30'
  },
  {
    id: 'prf-2',
    projectCode: 'PRJ-ON-5KW-034',
    orderNumber: 'ORD-2026-034',
    customerName: 'Rajesh Sharma',
    capacityKw: 5.0,
    systemType: 'On-Grid 5kW Residential',
    revenue: 308640,
    equipmentCosts: 182000,
    labourCosts: 22000,
    otherExpenses: 8400,
    profit: 96240,
    profitMarginPercent: 31.18,
    paymentStatus: 'partially_paid',
    completionDate: '2026-11-25 (Est)'
  },
  {
    id: 'prf-3',
    projectCode: 'PRJ-OFF-3KW-028',
    orderNumber: 'ORD-2026-028',
    customerName: 'Giridhar Farms & Resort',
    capacityKw: 3.0,
    systemType: 'Off-Grid 3kW LiFePO4',
    revenue: 285000,
    equipmentCosts: 194000,
    labourCosts: 21000,
    otherExpenses: 11500,
    profit: 58500,
    profitMarginPercent: 20.53,
    paymentStatus: 'fully_paid',
    completionDate: '2026-10-15'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', employeeCode: 'EMP-001', fullName: 'Amit Jadhav', email: 'amit.j@sunpowersolutions.in', phone: '+91 98221 00912', department: 'Operations', designation: 'Senior Installation Engineer', role: 'install_tech', hourlyRate: 350, skills: ['Grid Synchronization', 'Three-Phase Inverters', 'HT/LT Wiring', 'Earthing Pit Testing'], isAvailable: false, activeJobs: 2, rating: 4.9 },
  { id: 'emp-2', employeeCode: 'EMP-002', fullName: 'Vikas Shirole', email: 'vikas.s@sunpowersolutions.in', phone: '+91 98221 00913', department: 'Operations', designation: 'Installation Technician', role: 'install_tech', hourlyRate: 250, skills: ['Structure Mounting', 'DC Cabling', 'Safety Harnessing'], isAvailable: true, activeJobs: 1, rating: 4.7 },
  { id: 'emp-3', employeeCode: 'EMP-003', fullName: 'Suresh More', email: 'suresh.m@sunpowersolutions.in', phone: '+91 98221 00914', department: 'Field Engineering', designation: 'Chief Survey Specialist', role: 'survey_tech', hourlyRate: 300, skills: ['Shadow Analysis', 'RCC Slab Load Testing', 'AutoCAD Layouts', 'Drone Surveys'], isAvailable: true, activeJobs: 1, rating: 4.8 },
  { id: 'emp-4', employeeCode: 'EMP-004', fullName: 'Sachin Kale', email: 'sachin.k@sunpowersolutions.in', phone: '+91 98221 00915', department: 'Operations', designation: 'Electrical Technician', role: 'install_tech', hourlyRate: 260, skills: ['Inverter Parameter Config', 'ACDB Distribution', 'Net Metering Test'], isAvailable: true, activeJobs: 0, rating: 4.6 },
  { id: 'emp-5', employeeCode: 'EMP-005', fullName: 'Pooja Kulkarni', email: 'pooja.k@sunpowersolutions.in', phone: '+91 98221 00916', department: 'Sales', designation: 'Lead Solar Consultant', role: 'sales_exec', hourlyRate: 400, skills: ['Solar Sizing', 'Financial Payback Projections', 'Government Subsidies'], isAvailable: true, activeJobs: 4, rating: 4.9 },
  { id: 'emp-6', employeeCode: 'EMP-006', fullName: 'Ganesh Shinde', email: 'ganesh.s@sunpowersolutions.in', phone: '+91 98221 00917', department: 'Warehouse', designation: 'Logistics Manager', role: 'warehouse_mgr', hourlyRate: 320, skills: ['Inventory Control', 'Barcoding & QR', 'Dispatch Coordination'], isAvailable: true, activeJobs: 0, rating: 4.8 },
  { id: 'emp-7', employeeCode: 'EMP-007', fullName: 'Sneha Deshpande', email: 'sneha.d@sunpowersolutions.in', phone: '+91 98221 00918', department: 'Customer Support', designation: 'Warranty Officer', role: 'support_exec', hourlyRate: 280, skills: ['Warranty Tracking', 'RMA Handling', 'Fault Diagnosis'], isAvailable: true, activeJobs: 2, rating: 4.9 },
  { id: 'emp-8', employeeCode: 'EMP-008', fullName: 'Ramesh Patil', email: 'ramesh.p@sunpowersolutions.in', phone: '+91 98221 00919', department: 'Finance', designation: 'Head of Accounts', role: 'accountant', hourlyRate: 450, skills: ['GST on Solar', 'Project P&L', 'Vendor Reconciliations'], isAvailable: true, activeJobs: 0, rating: 5.0 },
  { id: 'emp-9', employeeCode: 'EMP-009', fullName: 'Pradeep Gaikwad', email: 'pradeep.g@sunpowersolutions.in', phone: '+91 98221 00920', department: 'Operations', designation: 'Junior Technician', role: 'install_tech', hourlyRate: 200, skills: ['Module Clamping', 'Conduit Laying'], isAvailable: true, activeJobs: 0, rating: 4.5 },
  { id: 'emp-10', employeeCode: 'EMP-010', fullName: 'Santosh Birajdar', email: 'santosh.b@sunpowersolutions.in', phone: '+91 98221 00921', department: 'Operations', designation: 'Structural Welder & Fabricator', role: 'install_tech', hourlyRate: 270, skills: ['Custom Elevated Superstructures', 'Anti-Corrosion Priming'], isAvailable: false, activeJobs: 1, rating: 4.7 },
  { id: 'emp-11', employeeCode: 'EMP-011', fullName: 'Deepak Salunke', email: 'deepak.s@sunpowersolutions.in', phone: '+91 98221 00922', department: 'Operations', designation: 'Site Survey Assistant', role: 'survey_tech', hourlyRate: 220, skills: ['Laser Distance Metering', 'Terrace Azimuth Mapping'], isAvailable: true, activeJobs: 0, rating: 4.6 },
  { id: 'emp-12', employeeCode: 'EMP-012', fullName: 'Tukaram Jadhav', email: 'tukaram.j@sunpowersolutions.in', phone: '+91 98221 00923', department: 'Warehouse', designation: 'Dispatch & Fleet Driver', role: 'warehouse_mgr', hourlyRate: 210, skills: ['Material Handling', 'Heavy Transport Safety'], isAvailable: false, activeJobs: 1, rating: 4.8 },
  { id: 'emp-13', employeeCode: 'EMP-013', fullName: 'Nilesh Ghodke', email: 'nilesh.g@sunpowersolutions.in', phone: '+91 98221 00924', department: 'Operations', designation: 'Electrician', role: 'install_tech', hourlyRate: 250, skills: ['LT Panel Termination', 'Surge Arrestor Wiring'], isAvailable: true, activeJobs: 0, rating: 4.6 },
  { id: 'emp-14', employeeCode: 'EMP-014', fullName: 'Manoj Chavan', email: 'manoj.c@sunpowersolutions.in', phone: '+91 98221 00925', department: 'Operations', designation: 'Apprentice Technician', role: 'install_tech', hourlyRate: 180, skills: ['Solar Cleaning', 'Cable Tie & Dressing'], isAvailable: true, activeJobs: 0, rating: 4.4 },
  { id: 'emp-15', employeeCode: 'EMP-015', fullName: 'Kavita Shinde', email: 'kavita.s@sunpowersolutions.in', phone: '+91 98221 00926', department: 'Sales', designation: 'CRM & Lead Coordinator', role: 'sales_exec', hourlyRate: 260, skills: ['Inbound Lead Routing', 'WhatsApp Automation'], isAvailable: true, activeJobs: 0, rating: 4.7 },
  { id: 'emp-16', employeeCode: 'EMP-016', fullName: 'Amit Verma', email: 'amit.v@sunpowersolutions.in', phone: '+91 98221 00930', department: 'Field Engineering', designation: 'Senior Field Surveyor', role: 'survey_tech', hourlyRate: 310, skills: ['Shadow Analysis', '3D Azimuth Mapping', 'Single & Three Phase HT/LT'], isAvailable: true, activeJobs: 2, rating: 4.7 },
  { id: 'emp-17', employeeCode: 'EMP-017', fullName: 'Rahul Singh', email: 'rahul.s@sunpowersolutions.in', phone: '+91 98221 00931', department: 'Field Engineering', designation: 'Terrace Azimuth Engineer', role: 'survey_tech', hourlyRate: 330, skills: ['Drone Photogrammetry', 'RCC Load Calculations', 'DISCOM Feeder Inspection'], isAvailable: true, activeJobs: 1, rating: 4.9 },
  { id: 'emp-18', employeeCode: 'EMP-018', fullName: 'Vikram Patel', email: 'vikram.p@sunpowersolutions.in', phone: '+91 98221 00932', department: 'Field Engineering', designation: 'Drone & Roof CAD Specialist', role: 'survey_tech', hourlyRate: 290, skills: ['AutoCAD Layouts', 'Helioscope Projections', 'Obstacle Shading Curves'], isAvailable: true, activeJobs: 0, rating: 4.8 }
];

export const INITIAL_TECHNICIAN_LEAVES: TechnicianLeave[] = [
  {
    id: 'lev-1',
    technicianId: 'emp-11',
    technicianName: 'Deepak Salunke',
    startDate: '2026-11-21',
    endDate: '2026-11-22',
    leaveType: 'casual',
    status: 'approved',
    reason: 'Family event and personal leave approved by Operations Head.'
  }
];

export const INITIAL_SURVEY_ASSIGNMENTS: SurveyAssignmentAudit[] = [
  {
    id: 'asg-1',
    surveyId: 'surv-1',
    surveyNumber: 'SRV-2026-041',
    technicianId: 'emp-3',
    technicianName: 'Suresh More',
    assignedAt: '2026-11-06T11:00:00',
    assignedBy: 'Pooja Kulkarni',
    action: 'assigned',
    scheduledDate: '2026-11-08T10:30:00',
    timeSlot: '10:00 AM - 12:00 PM'
  },
  {
    id: 'asg-2',
    surveyId: 'surv-2',
    surveyNumber: 'SRV-2026-042',
    technicianId: 'emp-3',
    technicianName: 'Suresh More',
    assignedAt: '2026-11-08T15:30:00',
    assignedBy: 'Pooja Kulkarni',
    action: 'assigned',
    scheduledDate: '2026-11-10T14:00:00',
    timeSlot: '02:00 PM - 04:00 PM'
  },
  {
    id: 'asg-3',
    surveyId: 'surv-3',
    surveyNumber: 'SRV-2026-043',
    technicianId: 'emp-3',
    technicianName: 'Suresh More',
    assignedAt: '2026-11-20T16:00:00',
    assignedBy: 'Pooja Kulkarni',
    action: 'assigned',
    scheduledDate: '2026-11-22T10:00:00',
    timeSlot: '10:00 AM - 12:00 PM'
  },
  {
    id: 'asg-4',
    surveyId: 'surv-7',
    surveyNumber: 'SRV-2026-047',
    technicianId: 'emp-16',
    technicianName: 'Amit Verma',
    assignedAt: '2026-11-20T17:30:00',
    assignedBy: 'Pooja Kulkarni',
    action: 'assigned',
    scheduledDate: '2026-11-21T14:30:00',
    timeSlot: '02:30 PM - 04:30 PM'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Low Stock Alert: Growatt 3.3kW Inverters',
    message: 'Stock has fallen to 6 units (Threshold: 8). 4 units currently reserved for approved projects.',
    timeAgo: '12 mins ago',
    type: 'warning',
    read: false,
    link: '/inventory'
  },
  {
    id: 'notif-2',
    title: 'Quotation Approved: Rajesh Sharma',
    message: 'Quotation QTN-2026-088 (₹3,08,640) was approved by customer. Order ORD-2026-034 generated.',
    timeAgo: '1 hour ago',
    type: 'success',
    read: false,
    link: '/orders'
  },
  {
    id: 'notif-3',
    title: 'New Service Complaint Registered',
    message: 'Complaint TKT-2026-018 for inverter ERR-INV-04 reported by Prakash Rao. Warranty verified.',
    timeAgo: '3 hours ago',
    type: 'alert',
    read: true,
    link: '/service'
  },
  {
    id: 'notif-4',
    title: 'Site Survey Submitted: Dr. Sunita Deshmukh',
    message: 'Technician Suresh More submitted site survey measurements & photos for approval.',
    timeAgo: 'Yesterday',
    type: 'info',
    read: true,
    link: '/surveys'
  }
];

export const INITIAL_FOLLOW_UPS: FollowUpItem[] = [
  {
    id: 'flw-1',
    customerId: 'cust-4',
    customerName: 'Anand Joshi',
    customerPhone: '+91 98901 77231',
    customerCity: 'Pune',
    lastInteractionDate: '2026-11-18',
    lastInteractionNotes: 'Customer enquired about net-metering subsidy timelines.',
    scheduledDate: '2026-11-20T11:00:00', // Yesterday (Overdue)
    followUpReason: 'Confirm site access window for tomorrow survey and verify meter room access.',
    priority: 'high',
    status: 'overdue',
    assignedSalesperson: 'Pooja Kulkarni'
  },
  {
    id: 'flw-2',
    customerId: 'cust-2',
    customerName: 'Dr. Sunita Deshmukh',
    customerPhone: '+91 98220 19340',
    customerCity: 'Nashik',
    lastInteractionDate: '2026-11-17',
    lastInteractionNotes: 'Sent quotation QTN-2026-089 (Off-Grid 5kW with 10.2kWh storage).',
    scheduledDate: '2026-11-19T14:30:00', // Overdue
    followUpReason: 'Review commercial quotation terms & discuss hospital clinic backup hours.',
    priority: 'urgent',
    status: 'overdue',
    assignedSalesperson: 'Pooja Kulkarni'
  },
  {
    id: 'flw-3',
    customerId: 'cust-5',
    customerName: 'Venkatesh Iyer',
    customerPhone: '+91 98190 22345',
    customerCity: 'Pune',
    lastInteractionDate: '2026-11-19',
    lastInteractionNotes: 'Customer asked for revised quotation comparing 5.1kWh vs 10.2kWh battery.',
    scheduledDate: '2026-11-21T15:30:00', // Today
    followUpReason: 'Call to present comparison matrix and negotiate payment advance.',
    priority: 'high',
    status: 'pending',
    assignedSalesperson: 'Pooja Kulkarni'
  },
  {
    id: 'flw-4',
    customerId: 'cust-6',
    customerName: 'Kiran Thorat',
    customerPhone: '+91 97654 32190',
    customerCity: 'Pune',
    lastInteractionDate: '2026-11-20',
    lastInteractionNotes: 'Walk-in enquiry at branch office.',
    scheduledDate: '2026-11-21T17:00:00', // Today
    followUpReason: 'First qualification call: verify monthly electricity bill & terrace ownership.',
    priority: 'medium',
    status: 'pending',
    assignedSalesperson: 'Pooja Kulkarni'
  },
  {
    id: 'flw-5',
    customerId: 'cust-1',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98201 44512',
    customerCity: 'Pune',
    lastInteractionDate: '2026-11-10',
    lastInteractionNotes: 'Advance payment received; order moved to dispatch.',
    scheduledDate: '2026-11-24T10:00:00', // Upcoming
    followUpReason: 'Confirm client availability for installation crew arrival on Nov 23.',
    priority: 'medium',
    status: 'pending',
    assignedSalesperson: 'Pooja Kulkarni'
  },
  {
    id: 'flw-6',
    customerId: 'cust-3',
    customerName: 'Mahalaxmi Agro Plastics',
    customerPhone: '+91 94223 88120',
    customerCity: 'Aurangabad',
    lastInteractionDate: '2026-10-24',
    lastInteractionNotes: 'Contract signed; advance payment RTGS confirmed.',
    scheduledDate: '2026-10-24T16:00:00',
    followUpReason: 'PO confirmation & commercial invoice delivery.',
    priority: 'medium',
    status: 'completed',
    assignedSalesperson: 'Pooja Kulkarni',
    completedAt: '2026-10-24T16:15:00',
    completionNotes: 'Client provided signed purchase order & advance RTGS UTR number.'
  }
];

export const INITIAL_ENQUIRIES: CustomerEnquiry[] = [
  {
    id: 'enq-1',
    enquiryNumber: 'ENQ-2026-081',
    customerId: 'cust-1',
    customerName: 'Rajesh Sharma',
    customerPhone: '+91 98201 44512',
    customerCity: 'Pune',
    interestedCapacityKw: 5.0,
    preferredSystemType: 'on_grid',
    source: 'website',
    receivedDate: '2026-11-02',
    leadStatus: 'survey_completed',
    nextFollowUpDate: '2026-11-24',
    assignedSalesperson: 'Pooja Kulkarni',
    notes: 'High daytime consumption with 3 ACs. Wants Tier-1 bifacial panels.'
  },
  {
    id: 'enq-2',
    enquiryNumber: 'ENQ-2026-082',
    customerId: 'cust-2',
    customerName: 'Dr. Sunita Deshmukh',
    customerPhone: '+91 98220 19340',
    customerCity: 'Nashik',
    interestedCapacityKw: 5.0,
    preferredSystemType: 'off_grid',
    source: 'whatsapp',
    receivedDate: '2026-11-04',
    leadStatus: 'quotation_sent',
    nextFollowUpDate: '2026-11-19 (Overdue)',
    assignedSalesperson: 'Pooja Kulkarni',
    notes: 'Needs battery backup for medical refrigeration during load shedding.'
  },
  {
    id: 'enq-3',
    enquiryNumber: 'ENQ-2026-083',
    customerId: 'cust-3',
    customerName: 'Mahalaxmi Agro Plastics (Factory)',
    customerPhone: '+91 94223 88120',
    customerCity: 'Aurangabad',
    interestedCapacityKw: 5.0,
    preferredSystemType: 'on_grid',
    source: 'referral',
    receivedDate: '2026-10-18',
    leadStatus: 'converted',
    assignedSalesperson: 'Pooja Kulkarni',
    notes: 'Small factory phase 1 test installation before 50kW expansion.'
  },
  {
    id: 'enq-4',
    enquiryNumber: 'ENQ-2026-084',
    customerId: 'cust-4',
    customerName: 'Anand Joshi',
    customerPhone: '+91 98901 77231',
    customerCity: 'Pune',
    interestedCapacityKw: 3.0,
    preferredSystemType: 'on_grid',
    source: 'phone_call',
    receivedDate: '2026-11-12',
    leadStatus: 'survey_scheduled',
    nextFollowUpDate: '2026-11-20 (Overdue)',
    assignedSalesperson: 'Pooja Kulkarni',
    notes: 'Looking for net metering subsidy under PM Surya Ghar Muft Bijli Yojana.'
  },
  {
    id: 'enq-5',
    enquiryNumber: 'ENQ-2026-085',
    customerId: 'cust-5',
    customerName: 'Venkatesh Iyer',
    customerPhone: '+91 98190 22345',
    customerCity: 'Pune',
    interestedCapacityKw: 4.0,
    preferredSystemType: 'hybrid',
    source: 'website',
    receivedDate: '2026-10-25',
    leadStatus: 'negotiation',
    nextFollowUpDate: 'Today, 15:30',
    assignedSalesperson: 'Pooja Kulkarni',
    notes: 'Requested customized hybrid system with 5kWh lithium battery storage.'
  },
  {
    id: 'enq-6',
    enquiryNumber: 'ENQ-2026-086',
    customerId: 'cust-6',
    customerName: 'Kiran Thorat',
    customerPhone: '+91 97654 32190',
    customerCity: 'Pune',
    interestedCapacityKw: 2.0,
    preferredSystemType: 'on_grid',
    source: 'manual',
    receivedDate: '2026-11-20',
    leadStatus: 'new',
    nextFollowUpDate: 'Today, 17:00',
    assignedSalesperson: 'Pooja Kulkarni',
    notes: 'Walk-in customer at Hadapsar branch. Enquired about 2kW system.'
  }
];

export const INITIAL_COMMUNICATION_HISTORY: CommunicationHistoryItem[] = [
  {
    id: 'comm-1',
    customerId: 'cust-1',
    authorName: 'Pooja Kulkarni',
    type: 'call',
    summary: 'Initial Qualification Call',
    details: 'Customer verified monthly bill of ₹8,200 with 3 ACs. Explained On-Grid 5kW savings & estimated ROI within 3.2 years.',
    timestamp: '2026-11-03 11:30'
  },
  {
    id: 'comm-2',
    customerId: 'cust-1',
    authorName: 'Pooja Kulkarni',
    type: 'survey_requested',
    summary: 'Site Survey Requested',
    details: 'Allocated Field Specialist Suresh More for terrace shadow & azimuth survey.',
    timestamp: '2026-11-05 14:00'
  },
  {
    id: 'comm-3',
    customerId: 'cust-1',
    authorName: 'Pooja Kulkarni',
    type: 'quotation_sent',
    summary: 'Commercial Quotation QTN-2026-088 Sent',
    details: 'Generated formal PDF proposal of ₹3,08,640 and emailed to rajesh.sharma@gmail.com.',
    timestamp: '2026-11-09 16:45'
  },
  {
    id: 'comm-4',
    customerId: 'cust-2',
    authorName: 'Pooja Kulkarni',
    type: 'whatsapp',
    summary: 'WhatsApp Requirement Collection',
    details: 'Dr. Sunita shared single line diagram and electricity sanction letter for hospital clinic.',
    timestamp: '2026-11-06 10:15'
  },
  {
    id: 'comm-5',
    customerId: 'cust-5',
    authorName: 'Pooja Kulkarni',
    type: 'meeting',
    summary: 'In-Person Consultation at Viman Nagar',
    details: 'Presented hybrid inverter specifications and explained difference between Lead Acid vs LiFePO4 battery life.',
    timestamp: '2026-11-14 16:00'
  }
];

export const INITIAL_SALES_ACTIVITIES: SalesActivityItem[] = [
  {
    id: 'act-1',
    type: 'quotation_accepted',
    customerName: 'Rajesh Sharma',
    customerId: 'cust-1',
    description: 'Customer approved Quotation QTN-2026-088 (₹3,08,640). Order ORD-2026-034 created.',
    timestamp: '1 hour ago',
    salesperson: 'Pooja Kulkarni',
    relatedLink: '/orders'
  },
  {
    id: 'act-2',
    type: 'survey_approved',
    customerName: 'Rajesh Sharma',
    customerId: 'cust-1',
    description: 'Engineering Lead approved Site Survey SRV-2026-041 (94.5 sq.m shadow-free area).',
    timestamp: 'Yesterday',
    salesperson: 'Pooja Kulkarni',
    relatedLink: '/surveys'
  },
  {
    id: 'act-3',
    type: 'quotation_sent',
    customerName: 'Dr. Sunita Deshmukh',
    customerId: 'cust-2',
    description: 'Quotation QTN-2026-089 sent for 5kW Off-Grid Autonomy (₹4,45,890).',
    timestamp: '2 days ago',
    salesperson: 'Pooja Kulkarni',
    relatedLink: '/quotations'
  },
  {
    id: 'act-4',
    type: 'survey_scheduled',
    customerName: 'Anand Joshi',
    customerId: 'cust-4',
    description: 'Site survey scheduled for Nov 22, 11:00 AM. Technician Suresh More assigned.',
    timestamp: '3 days ago',
    salesperson: 'Pooja Kulkarni',
    relatedLink: '/surveys'
  },
  {
    id: 'act-5',
    type: 'enquiry_received',
    customerName: 'Kiran Thorat',
    customerId: 'cust-6',
    description: 'New walk-in enquiry registered for 2kW residential system in Hadapsar.',
    timestamp: '4 days ago',
    salesperson: 'Pooja Kulkarni',
    relatedLink: '/customers'
  },
  {
    id: 'act-6',
    type: 'order_converted',
    customerName: 'Mahalaxmi Agro Plastics (Factory)',
    customerId: 'cust-3',
    description: 'Successfully converted industrial client contract ORD-2026-035 (₹3,00,950).',
    timestamp: 'Oct 24',
    salesperson: 'Pooja Kulkarni',
    relatedLink: '/orders'
  }
];
