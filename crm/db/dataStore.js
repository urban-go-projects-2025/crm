// Shared Database Store for OMW CRM
// Synced with primary OMW Database (omwhub.com)

export const initialData = {
  stats: {
    totalCustomers: 1248,
    totalWorkers: 186,
    activeBookings: 74,
    completedBookings: 892,
    cancelledBookings: 56,
    pendingPayments: 24500,
    openSupportTickets: 18,
    dailyRevenue: 38750,
    totalRevenue: 248750,
    vipCustomersCount: 142,
    activeAccountsCount: 1086,
    avgCustomerRating: 4.8,
    kycVerifiedWorkers: 172,
    onDutyWorkers: 48,
    avgWorkerRating: 4.86,
    otpVerifiedBookings: 836,
    photosUploadedBookings: 810,

    // Support stats
    escalatedTicketsCount: 3,
    assignedExecutivesCount: 12,
    avgResolutionTime: "2.4 Hours",

    // Payment stats
    grossCustomerRevenue: 248750,
    platformCommission: 39800,
    dispatchedWorkerPayouts: 200450,
    processedRefunds: 8500,

    // Notification stats
    totalNotificationsSent: 1420,
    whatsAppDelivered: 580,
    smsOtpTriggers: 890,
    emailCampaigns: 420,

    // Analytics stats
    complaintResolutionRate: "98.1%",
    platformCommissionAnalytics: 39924,

    lastSynced: new Date().toISOString(),
    omwDbStatus: "CONNECTED_SHAREABLE_REPLICA"
  },

  revenueData: [
    { day: "Mon", revenue: 28400, bookings: 42 },
    { day: "Tue", revenue: 31200, bookings: 48 },
    { day: "Wed", revenue: 26800, bookings: 39 },
    { day: "Thu", revenue: 35100, bookings: 54 },
    { day: "Fri", revenue: 42300, bookings: 68 },
    { day: "Sat", revenue: 46200, bookings: 75 },
    { day: "Sun", revenue: 38750, bookings: 62 }
  ],

  weeklyRevenueTrend: [
    { week: "Week 1", revenue: 48500 },
    { week: "Week 2", revenue: 62400 },
    { week: "Week 3", revenue: 78600 },
    { week: "Week 4", revenue: 59250 }
  ],

  servicePerformance: [
    { category: "AC Servicing & Electrical", revenue: 94520, commission: 14178, jobs: 312, percentage: 85 },
    { category: "Plumbing & Water Leak Repair", revenue: 67160, commission: 10074, jobs: 245, percentage: 65 },
    { category: "Home Deep Cleaning & Hygiene", revenue: 52240, commission: 10448, jobs: 189, percentage: 50 },
    { category: "Appliance Fix & Personal Care", revenue: 34830, commission: 5224, jobs: 146, percentage: 35 }
  ],

  customers: [
    {
      id: "CUST-1001",
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+91 98765 43210",
      address: "H-14, Green Park, Main Market, New Delhi",
      bookingsCount: 14,
      rating: 4.9,
      totalSpent: 28500,
      status: "Active",
      joinedDate: "12 Jan 2025",
      avatar: "RS"
    },
    {
      id: "CUST-1002",
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+91 98123 45678",
      address: "Flat 402, Sunshine Heights, Powai, Mumbai",
      bookingsCount: 22,
      rating: 5.0,
      totalSpent: 45200,
      status: "VIP",
      joinedDate: "05 Nov 2024",
      avatar: "PP"
    },
    {
      id: "CUST-1003",
      name: "Ankit Kumar",
      email: "ankit.k@example.com",
      phone: "+91 97654 32109",
      address: "B-802, Prestige Towers, Indiranagar, Bengaluru",
      bookingsCount: 5,
      rating: 4.7,
      totalSpent: 9800,
      status: "Active",
      joinedDate: "18 Mar 2025",
      avatar: "AK"
    },
    {
      id: "CUST-1004",
      name: "Sunita Rao",
      email: "sunita.rao@example.com",
      phone: "+91 99687 76655",
      address: "Plot 55, Jubilee Hills, Hyderabad",
      bookingsCount: 0,
      rating: 3.5,
      totalSpent: 0,
      status: "Inactive",
      joinedDate: "01 Feb 2026",
      avatar: "SR"
    }
  ],

  workers: [
    {
      id: "WRK-2001",
      name: "Priya Singh",
      phone: "+91 98111 22334",
      category: "AC Repair & Electrical",
      kycStatus: "Verified",
      availability: "On Duty",
      activeJobsCount: 14,
      totalJobsCount: 142,
      rating: 4.9,
      totalEarnings: 85200,
      commissionRate: 15,
      netEarnings: 72420,
      avatar: "PS"
    },
    {
      id: "WRK-2002",
      name: "Amit Sharma",
      phone: "+91 98222 33445",
      category: "Plumbing & Pipe Fitting",
      kycStatus: "Verified",
      availability: "In Session",
      activeJobsCount: 8,
      totalJobsCount: 98,
      rating: 4.8,
      totalEarnings: 58800,
      commissionRate: 15,
      netEarnings: 49980,
      avatar: "AS"
    },
    {
      id: "WRK-2003",
      name: "Neha Verma",
      phone: "+91 98333 44556",
      category: "Home Deep Cleaning",
      kycStatus: "Verified",
      availability: "On Duty",
      activeJobsCount: 22,
      totalJobsCount: 210,
      rating: 5.0,
      totalEarnings: 126000,
      commissionRate: 20,
      netEarnings: 100800,
      avatar: "NV"
    },
    {
      id: "WRK-2004",
      name: "Rajesh Roy",
      phone: "+91 98444 55667",
      category: "Appliance Fix & Wiring",
      kycStatus: "Pending KYC",
      availability: "Offline",
      activeJobsCount: 0,
      totalJobsCount: 76,
      rating: 4.7,
      totalEarnings: 45600,
      commissionRate: 15,
      netEarnings: 38760,
      avatar: "RR"
    },
    {
      id: "WRK-2005",
      name: "Simran Kaur",
      phone: "+91 98555 66778",
      category: "Personal Care & Wellness",
      kycStatus: "Verified",
      availability: "On Duty",
      activeJobsCount: 6,
      totalJobsCount: 115,
      rating: 4.9,
      totalEarnings: 69000,
      commissionRate: 16,
      netEarnings: 57960,
      avatar: "SK"
    }
  ],

  bookings: [
    {
      id: "BKG-7001",
      customerName: "Rahul Sharma",
      customerPhone: "+91 98765 43210",
      workerName: "Priya Singh",
      workerPhone: "+91 98111 22334",
      service: "AC Servicing & Repair",
      date: "12 Aug 2026",
      amount: 2500,
      otpVerified: true,
      photoUploaded: true,
      paymentStatus: "Paid Online",
      status: "Active",
    },
    {
      id: "BKG-7002",
      customerName: "Ankit Kumar",
      customerPhone: "+91 97654 32109",
      workerName: "Neha Verma",
      workerPhone: "+91 98333 44556",
      service: "Home Deep Cleaning",
      date: "12 Aug 2026",
      amount: 3200,
      otpVerified: false,
      photoUploaded: false,
      paymentStatus: "Pending (COD)",
      status: "Pending",
    },
    {
      id: "BKG-7003",
      customerName: "Riya Gupta",
      customerPhone: "+91 98991 12233",
      workerName: "Amit Sharma",
      workerPhone: "+91 98222 33445",
      service: "Plumbing Leak Fix",
      date: "11 Aug 2026",
      amount: 1800,
      otpVerified: true,
      photoUploaded: true,
      paymentStatus: "Paid Online",
      status: "Completed",
    },
    {
      id: "BKG-7004",
      customerName: "Mohit Jain",
      customerPhone: "+91 98777 65432",
      workerName: "Simran Kaur",
      workerPhone: "+91 98555 66778",
      service: "Electrical Installation",
      date: "11 Aug 2026",
      amount: 2100,
      otpVerified: true,
      photoUploaded: false,
      paymentStatus: "Cancelled Refunded",
      status: "Cancelled",
    }
  ],

  supportTickets: [
    {
      id: "TCK-8001",
      customer: "Rahul Sharma",
      title: "Payment deducted twice during checkout",
      assignedExecutive: "Vikram M. (Lead)",
      escalationLevel: "Escalated",
      resolutionNotes: "Bank gateway confirmation pending from Razorpay support.",
      status: "In Progress",
      date: "13 Aug 2026"
    },
    {
      id: "TCK-8002",
      customer: "Riya Gupta",
      title: "Worker assignment delay for morning slot",
      assignedExecutive: "Neha S. (Support Exec)",
      escalationLevel: "Normal",
      resolutionNotes: "Contacting replacement worker in Powai zone.",
      status: "Open",
      date: "12 Aug 2026"
    },
    {
      id: "TCK-8003",
      customer: "Ankit Kumar",
      title: "Booking cancellation & instant refund request",
      assignedExecutive: "Deepak J. (Refund Spec)",
      escalationLevel: "Escalated",
      resolutionNotes: "Refund processed to source UPI account.",
      status: "In Progress",
      date: "12 Aug 2026"
    },
    {
      id: "TCK-8004",
      customer: "Priya Patel",
      title: "Inquiry regarding corporate cleaning package",
      assignedExecutive: "Sunil K. (Account Exec)",
      escalationLevel: "Normal",
      resolutionNotes: "Shared custom quotation PDF via email.",
      status: "Resolved",
      date: "10 Aug 2026"
    }
  ],

  payments: [
    {
      id: "TXN-9001",
      customer: "Rahul Sharma",
      customerMethod: "UPI (GPay)",
      worker: "Priya Singh",
      service: "AC Servicing & Repair",
      grossFee: 2500,
      commissionSplit: "15% (₹375)",
      netWorkerPayout: 2125,
      refundStatus: "No Refund",
      status: "Completed"
    },
    {
      id: "TXN-9002",
      customer: "Ankit Kumar",
      customerMethod: "Credit Card",
      worker: "Neha Verma",
      service: "Home Deep Cleaning",
      grossFee: 3200,
      commissionSplit: "20% (₹640)",
      netWorkerPayout: 2560,
      refundStatus: "No Refund",
      status: "Pending"
    },
    {
      id: "TXN-9003",
      customer: "Priya Patel",
      customerMethod: "Net Banking",
      worker: "Amit Sharma",
      service: "Plumbing Leak Fix",
      grossFee: 1800,
      commissionSplit: "15% (₹270)",
      netWorkerPayout: 1530,
      refundStatus: "No Refund",
      status: "Completed"
    },
    {
      id: "TXN-9004",
      customer: "Mohit Jain",
      customerMethod: "UPI (PhonePe)",
      worker: "Simran Kaur",
      service: "Personal Care Service",
      grossFee: 8500,
      commissionSplit: "15% (₹0)",
      netWorkerPayout: 0,
      refundStatus: "Refund Processed ↪️",
      status: "Refunded"
    }
  ],

  notifications: [
    {
      id: "NTF-3001",
      targetAudience: "All Customers",
      title: "Home Deep Cleaning Festival Discount Offer",
      category: "Promotional",
      channels: "App 🔔, Email ✉️, SMS 📱, WhatsApp 💬",
      status: "Delivered",
      dateTime: "13 Aug 2026, 10:00 AM"
    },
    {
      id: "NTF-3002",
      targetAudience: "Active Workers",
      title: "System Maintenance Alert: App Update at 02:00 AM",
      category: "System Alert",
      channels: "App 🔔, SMS 📱",
      status: "Delivered",
      dateTime: "12 Aug 2026, 08:30 PM"
    },
    {
      id: "NTF-3003",
      targetAudience: "Rahul Sharma (Customer)",
      title: "Booking OTP: 4920 for AC Servicing with Priya Singh",
      category: "OTP & Booking",
      channels: "SMS 📱, WhatsApp 💬",
      status: "Delivered",
      dateTime: "12 Aug 2026, 02:15 PM"
    },
    {
      id: "NTF-3004",
      targetAudience: "All Service Workers",
      title: "Weekly Commission & Payout Disbursement Completed",
      category: "System Alert",
      channels: "App 🔔, Email ✉️",
      status: "Delivered",
      dateTime: "10 Aug 2026, 05:00 PM"
    },
    {
      id: "NTF-3005",
      targetAudience: "VIP Customers",
      title: "Exclusive Appliance Repair Package Invitation",
      category: "Promotional",
      channels: "Email ✉️, WhatsApp 💬",
      status: "Pending",
      dateTime: "09 Aug 2026, 11:00 AM"
    }
  ],

  crmUsers: [
    {
      id: "USR-101",
      name: "Admin User",
      email: "admin@omwhub.com",
      password: "admin123",
      role: "Super Administrator",
      status: "Active",
      isAdmin: true,
      avatar: "AD",
      createdAt: "01 Jan 2026",
      permissions: [
        "dashboard",
        "customers",
        "workers",
        "bookings",
        "support",
        "payments",
        "notifications",
        "reports",
        "attendance",
        "create-lead",
        "users"
      ]
    },
    {
      id: "USR-102",
      name: "Sunil Kumar",
      email: "sunil.k@omwhub.com",
      password: "sunil123",
      role: "Support Executive",
      status: "Active",
      isAdmin: false,
      avatar: "SK",
      createdAt: "10 Feb 2026",
      permissions: [
        "dashboard",
        "customers",
        "support",
        "notifications"
      ]
    },
    {
      id: "USR-103",
      name: "Pooja Verma",
      email: "pooja.v@omwhub.com",
      password: "pooja123",
      role: "Operations Lead",
      status: "Active",
      isAdmin: false,
      avatar: "PV",
      createdAt: "15 Mar 2026",
      permissions: [
        "dashboard",
        "workers",
        "bookings",
        "attendance",
        "create-lead"
      ]
    },
    {
      id: "USR-104",
      name: "Rajesh Malhotra",
      email: "rajesh.m@omwhub.com",
      password: "rajesh123",
      role: "Finance Manager",
      status: "Active",
      isAdmin: false,
      avatar: "RM",
      createdAt: "02 Apr 2026",
      permissions: [
        "dashboard",
        "payments",
        "reports"
      ]
    }
  ]
};

// In-memory persistent database engine
let dataStore = JSON.parse(JSON.stringify(initialData));

export const getStore = () => dataStore;

export const updateStore = (updater) => {
  dataStore = updater(dataStore);
  return dataStore;
};
