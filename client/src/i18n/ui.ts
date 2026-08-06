import type { Lang } from "./extraLangs";

export type UiCopy = {
  header: { clientLogin: string; menu: string; language: string };
  home: {
    badge: string; hero1: string; hero2: string; heroSub: string; request: string; explore: string;
    aboutBadge: string; aboutTitle1: string; aboutTitle2: string; aboutDesc: string; aboutCta: string;
    servicesBadge: string; servicesTitle1: string; servicesTitle2: string; servicesAll: string; more: string;
    whyBadge: string; whyTitle: string; ctaTitle1: string; ctaTitle2: string; ctaDesc: string; contact: string;
    stats: string[]; reasons: { title: string; desc: string }[];
  };
  services: { title: string; badge: string; hero1: string; hero2: string; heroSub: string; view: string; more: string };
  category: { home: string; services: string; badge: string; available: string; service: string; grid: string; list: string; details: string; need: string; needDesc: string; request: string };
  detail: { home: string; services: string; badge: string; request: string; how: string; faq: string; window: string; suitable: string; requirements: string; related: string; details: string };
  auth: {
    clientTitle: string; clientSubtitle: string; login: string; email: string; password: string; forgot: string;
    noAccount: string; create: string; registerTitle: string; registerSubtitle: string; fullName: string;
    phone: string; confirmPassword: string; createAccount: string; haveAccount: string; invalid: string;
    forgotTitle: string; forgotSubtitle: string; checkEmail: string; checkEmailDesc: string; spam: string;
    backLogin: string; sendReset: string; sending: string; resetTitle: string; resetSubtitle: string;
    passwordChanged: string; redirecting: string; goLogin: string; newPassword: string; passwordStrength: string;
    continueGoogle: string; continueApple: string; or: string; strengthVeryWeak: string; strengthWeak: string; strengthAcceptable: string; strengthStrong: string;
    savePassword: string; saving: string; mismatch: string; minPassword: string; invalidReset: string;
  };
  request: {
    title: string; subtitle: string; steps: string[]; company: string; commercialReg: string; activity: string;
    contactEmail: string; contactPhone: string; service: string; package: string; country: string; notes: string;
    chooseService: string; chooseCountry: string; next: string; previous: string; review: string; submit: string; submitted: string;
    success: string; error: string; required: string;
  };
  packages: {
    title: string; badge: string; heroTitle: string; heroHighlight: string; heroSub: string;
    names: string[]; taglines: string[]; badges: string[]; features: string[];
    subscribe: string; compare: string; service: string; silver: string; gold: string; platinum: string;
    help: string; helpTitle: string; contact: string;
  };
  adminPages: {
    adminPortal: {
      profileTitle: string; profileSubtitle: string; roleSuperAdmin: string; roleAdmin: string; roleManager: string; roleEmployee: string; roleClient: string;
      personalInfo: string; nameEn: string; nameUr: string; phone: string; department: string; position: string; saving: string; saveChanges: string; refresh: string;
      changePassword: string; currentPassword: string; newPassword: string; confirmPassword: string; passwordMismatch: string; updatePassword: string;
      totpTitle: string; totpEnabled: string; totpHint: string; totpSetup: string; totpSettingUp: string; totpGoogleAuth: string; totpEnterManually: string;
      totpCodeLabel: string; totpCancel: string; totpVerify: string; totpVerifying: string; totpConfirmed: string; totpActive: string; totpProtected: string;
      totpDisable: string; totpDisableHint: string; totpAppCode: string; totpDisableConfirm: string; totpDisabling: string;
      passkeysTitle: string; passkeysSubtitle: string; addPasskey: string; passkeysLoading: string; passkeysEmpty: string; passkeyAdded: string; passkeyDeleted: string;
      cardTitle: string; cardSubtitle: string; viewCard: string;
      settingsTitle: string; settingsSubtitle: string; generalTab: string; emailTab: string; notificationsTab: string; securityTab: string;
      generalSettings: string; companyName: string; shortDescription: string; publicEmail: string; phoneNumber: string; address: string; website: string;
      emailSettings: string; senderName: string; emailSignature: string; serverNotice: string;
      notificationsTitle: string; notificationNewLead: string; notificationProjectUpdate: string; notificationInvoicePaid: string; notificationOverdueInvoice: string; notificationContactRequest: string;
      securityTitle: string; sessionExpiry: string; loginAttempts: string; requireTwoFactor: string;
      usersTitle: string; usersCount: string; addUser: string; searchUsers: string; userColumn: string; roleColumn: string; statusColumn: string; departmentColumn: string; twoFactorColumn: string; actionsColumn: string;
      userActive: string; userInactive: string; userEnabled: string; userDisabled: string; userSuspended: string; userDeleted: string; deleteUserConfirm: string; editUser: string; createUser: string; fullName: string; email: string; password: string; roleLabel: string; statusLabel: string;
      employeeDashboardGreetingMorning: string; employeeDashboardGreetingAfternoon: string; employeeDashboardGreetingEvening: string; employeeDashboardDate: string; activeProjects: string; completedProjects: string; overdueProjects: string; totalProjects: string; myProjects: string; viewAll: string; noActiveProjects: string; overdue: string; myCard: string; barcodePreview: string; myProfile: string; accountSettings: string; cardLabel: string;
      stageRequest: string; stageReview: string; stageQuotation: string; stageContract: string; stagePayment: string; stageExecution: string; stageClosed: string;
      employeeCardTitle: string; employeeCardSubtitle: string; companyBrand: string; employeeCode: string; loadingCard: string; loadError: string; retry: string; clickToBack: string; clickToBarcode: string; scanToVerify: string; generating: string; frontSide: string; showBarcode: string; downloadCard: string; regenerateBarcode: string; regenerateConfirm: string; barcodeRegenerated: string; walletSection: string; addToWallet: string; walletDownload: string; walletGenerated: string; walletError: string; platformNoteIos: string; platformNoteOther: string;
      supportTitle: string; conversationCount: string; noConversations: string; chooseConversation: string; chooseConversationHint: string; noMessages: string; replyPlaceholder: string; sendReplyError: string; administration: string;
      serviceRequestsTitle: string; loading: string; totalRequests: string; refresh: string; allStatuses: string; newStatus: string; reviewingStatus: string; approvedStatus: string; inProgressStatus: string; completedStatus: string; rejectedStatus: string; noRequests: string; noRequestsWithStatus: string; companyColumn: string; serviceColumn: string; statusColumn: string; dateColumn: string; view: string;
    };
    dashboard: {
      morning: string; afternoon: string; evening: string; subtitle: string; smartInsight: string;
      team: string; activeUsers: string; leads: string; newThisMonth: string; closeRate: string;
      activeCustomers: string; fromTotal: string; newCustomer: string; activeProjects: string;
      overdueTasks: string; completed: string; revenueThisMonth: string; paidInvoices: string;
      totalRevenue: string; allPaidInvoices: string; totalProjects: string; contactRequests: string;
      viewConsultations: string; revenueCurve: string; lastSixMonths: string; revenue: string;
      noRevenue: string; pipeline: string; noLeads: string; projectStages: string;
      recentLeads: string; recentProjects: string; viewAll: string; overdueAlert: string; viewTasks: string;
    };
    customers: {
      title: string; count: string; add: string; search: string; empty: string; edit: string;
      deleteConfirm: string; name: string; email: string; phone: string; company: string; industry: string;
      tier: string; status: string; country: string; currency: string; active: string; inactive: string;
      save: string; update: string; cancel: string; bronze: string; silver: string; gold: string; platinum: string;
    };
    leads: {
      title: string; count: string; add: string; search: string; allStages: string; empty: string;
      emptySub: string; name: string; company: string; stage: string; priority: string; budget: string;
      source: string; actions: string; convert: string; deleteConfirm: string; deleted: string; page: string; result: string;
      new: string; contacted: string; qualified: string; proposal: string; negotiation: string; won: string; lost: string;
      low: string; medium: string; high: string; urgent: string; formNew?: string; formEdit?: string; required?: string;
      namePlaceholder?: string; service?: string; servicePlaceholder?: string; notes?: string; notesPlaceholder?: string;
      followUp?: string; website?: string; referral?: string; socialMedia?: string; emailSource?: string; phoneSource?: string;
      event?: string; other?: string; currencySar?: string; currencyUsd?: string; currencyAed?: string; saving?: string; update?: string; cancel?: string; created?: string; updated?: string;
    };
    invoices: {
      title: string; count: string; new: string; collected: string; pending: string; overdue: string; search: string;
      allStatuses: string; empty: string; number: string; customer: string; total: string; dueDate: string;
      status: string; actions: string; send: string; markPaid: string; download: string; deleteConfirm: string;
      draft: string; sent: string; viewed: string; paid: string; overdueStatus: string; cancelled: string;
    };
    contracts: {
      title: string; count: string; new: string; total: string; drafts: string; signed: string; totalValue: string;
      search: string; allStatuses: string; empty: string; number: string; contractTitle: string; customer: string;
      value: string; endDate: string; status: string; actions: string; edit: string; send: string; certify: string;
      download: string; deleteConfirm: string; editTitle: string; titleLabel: string; chooseCustomer: string;
      currency: string; startDate: string; content: string; cancel: string; save: string; create: string;
      required: string; draft: string; sent: string; signedStatus: string; expired: string; cancelled: string;
    };
    projects: {
      title: string; count: string; table: string; kanban: string; newProject: string; search: string; allStages: string;
      project: string; stage: string; progress: string; dueDate: string; priority: string; actions: string;
      deleteConfirm: string; deleted: string; edit: string; stages: Record<string, string>; priorities: Record<string, string>;
      statuses: Record<string, string>; formNew: string; formEdit: string; name: string; namePlaceholder: string;
      startDate: string; budget: string; currency: string; progressLabel: string; status: string; description: string;
      descriptionPlaceholder: string; cancel: string; save: string; creating: string; saving: string; update: string;
      create: string; created: string; updated: string;
    };
    cms: {
      title: string; subtitle: string; blog: string; testimonials: string; pages: string; newArticle: string;
      emptyPosts: string; published: string; draft: string; deletePostConfirm: string; deleted: string;
      emptyTestimonials: string; deleteTestimonialConfirm: string; hidden: string; edit: string; noPages: string;
      formNew: string; formEdit: string; titleAr: string; titleArPlaceholder: string; titleEn: string;
      titleEnPlaceholder: string; excerpt: string; excerptPlaceholder: string; content: string; contentPlaceholder: string;
      coverImage: string; category: string; categoryPlaceholder: string; tags: string; tagsPlaceholder: string;
      publishNow: string; cancel: string; save: string; saving: string; publish: string; update: string; created: string; updated: string;
    };
  };
  client: {
    portal: string; dashboard: string; requests: string; support: string; logout: string; client: string;
    welcome: string; dashboardSub: string; total: string; active: string; completed: string; newRequests: string;
    newRequest: string; supportAction: string; latest: string; noRequests: string; noRequestsSub: string;
    submitNow: string; requestCount: string; loading: string; requestDetails: string; statusHistory: string;
    messages: string; addNote: string; notePlaceholder: string; noteAdded: string; noteError: string; statusUpdated: string; statusUpdateError: string; requestNotFound: string; changeStatus: string; statusNotePlaceholder: string; customerNotes: string; notesTitle: string; noNotes: string; internalNote: string; add: string; history: string;
    supportSub: string; noMessages: string; noMessagesSub: string; supportPlaceholder: string; sendError: string;
    you: string; invalidRequest: string; backRequests: string; status: Record<string, string>;
    services: Record<string, string>;
  };
  employee: {
    portal: string; login: string; email: string; password: string; emailRequired: string; passwordRequired: string;
    invalid: string; twoFactor: string; code: string; verify: string; verifying: string; back: string;
    barcode: string; logout: string; employee: string; dashboard: string; card: string; profile: string;
    employeePhoto: string; passkey: string; passkeyHint: string; adminLogin: string; or: string;
    barcodeTitle: string; cameraHint: string; barcodeSubmit: string;
  };
  adminLogin: {
    title: string; subtitle: string; email: string; password: string; forgot: string; login: string; loggingIn: string;
    emailRequired: string; passwordRequired: string; invalid: string; twoFactor: string; code: string;
    verify: string; verifying: string; back: string; employeeBarcode: string; employeeLogin: string; passkeyLogin?: string; or?: string;
    twoFactorInvalid?: string; oauthCompleting?: string; welcome?: string; successfulProjects?: string; customerSatisfaction?: string;
  };
  footer: { newsletter: string; newsletterSub: string; email: string; join: string; about: string; services: string; packages: string; contact: string; story: string; vision: string; why: string; formation: string; legal: string; hr: string; government: string; investors: string; silver: string; gold: string; platinum: string; compare: string; form: string; rights: string; privacy: string; terms: string; madeBy: string; location: string; description: string };
};

const en: UiCopy = {
  header: { clientLogin: "Client login", menu: "Menu", language: "Language" },
  home: {
    badge: "OFOQ / SAUDI BUSINESS CONCIERGE", hero1: "We handle", hero2: "the details.", heroSub: "Your trusted partner for HR, government services, visas, and company formation in Saudi Arabia.", request: "Request service", explore: "Explore services",
    aboutBadge: "About OFOQ", aboutTitle1: "Your business partner", aboutTitle2: "in Saudi Arabia", aboutDesc: "We handle government procedures, HR management, and formation requirements — so you can focus entirely on growing your business.", aboutCta: "Learn more",
    servicesBadge: "Our services", servicesTitle1: "Comprehensive", servicesTitle2: "services", servicesAll: "View all services", more: "more services",
    whyBadge: "Why OFOQ?", whyTitle: "We build with you, step by step", ctaTitle1: "Let's boost your", ctaTitle2: "sustainable growth", ctaDesc: "Contact us today and start a real partnership journey.", contact: "Contact us",
    stats: ["Clients served", "Client satisfaction", "Specialists", "Service categories"],
    reasons: [{ title: "Expert team", desc: "Specialists across every area of our services in the Saudi market." }, { title: "Full follow-up", desc: "We follow your file through to closure with regular updates." }, { title: "Digital experience", desc: "A full client portal to track your requests from anywhere." }, { title: "Local expertise", desc: "Deep knowledge of Saudi regulations and government bodies." }],
  },
  services: { title: "Services | OFOQ", badge: "THE OFOQ CATALOG", hero1: "Services designed", hero2: "for your business.", heroSub: "From entity formation to daily operations, we coordinate details through one team and a clear path.", view: "View services", more: "more" },
  category: { home: "Home", services: "Services", badge: "Service category", available: "services available", service: "services", grid: "Grid", list: "List", details: "Details", need: "Need these services?", needDesc: "Contact us and we'll help you identify the right service for your needs.", request: "Request service" },
  detail: { home: "Home", services: "Services", badge: "Service details", request: "Request service", how: "How we work", faq: "Frequently asked questions", window: "Service window", suitable: "Who is it for?", requirements: "Requirements", related: "Other services in this category", details: "Details" },
  auth: { clientTitle: "Client portal", clientSubtitle: "Sign in to follow your requests", login: "Sign in", email: "Email address", password: "Password", forgot: "Forgot password?", noAccount: "Don't have an account?", create: "Create an account", registerTitle: "Create your account", registerSubtitle: "Join the OFOQ client portal", fullName: "Full name", phone: "Phone number", confirmPassword: "Confirm password", createAccount: "Create account", haveAccount: "Already have an account?", invalid: "Invalid email or password", forgotTitle: "Forgot your password?", forgotSubtitle: "Enter your email and we will send a recovery link", checkEmail: "Check your email", checkEmailDesc: "If this email is registered with us, you will receive a reset link within a few minutes.", spam: "Check your spam folder if you do not see it.", backLogin: "Back to sign in", sendReset: "Send recovery link", sending: "Sending...", resetTitle: "Set a new password", resetSubtitle: "Choose a strong password for your account", passwordChanged: "Password changed successfully", redirecting: "You will be redirected to sign in shortly.", goLogin: "Go to sign in now", newPassword: "New password", passwordStrength: "Strength", continueGoogle: "Continue with Google", continueApple: "Continue with Apple", or: "or", strengthVeryWeak: "Very weak", strengthWeak: "Weak", strengthAcceptable: "Acceptable", strengthStrong: "Strong", savePassword: "Save new password", saving: "Saving...", mismatch: "Passwords do not match", minPassword: "Password must be at least 8 characters", invalidReset: "The link is invalid or has expired" },
  request: { title: "New service request", subtitle: "Complete the form and our team will contact you within 24–48 hours", steps: ["Company information", "Contact details", "Service details", "Review"], company: "Company name", commercialReg: "Commercial registration (optional)", activity: "Business activity", contactEmail: "Contact email", contactPhone: "Phone number", service: "Requested service", package: "Package (optional)", country: "Recruitment country (if applicable)", notes: "Additional notes (optional)", chooseService: "Choose a service...", chooseCountry: "Choose a country...", next: "Next", previous: "Previous", review: "Review request", submit: "Submit request", submitted: "Submitted", success: "Your request was submitted successfully.", error: "Could not submit the request.", required: "Required" },
  packages: { title: "Packages | OFOQ", badge: "Packages", heroTitle: "Build your", heroHighlight: "success path", heroSub: "Choose the package that fits your business needs.", names: ["Silver package", "Gold package", "Platinum package"], taglines: ["For startups", "Most popular", "For larger organizations"], badges: ["", "Most popular", "Most comprehensive"], features: ["Ministry of Commerce", "Salama platform", "Social insurance", "Medical insurance services", "Zakat and tax services", "Absher and Muqeem platforms", "Consulting services", "Ministry of Media", "Balady platform", "Burden relief service", "Training and development"], subscribe: "Subscribe now", compare: "Compare packages", service: "Service", silver: "Silver", gold: "Gold", platinum: "Platinum", help: "Need help choosing?", helpTitle: "Our team can help", contact: "Contact us" },
  adminPages: {
    adminPortal: {
      profileTitle: "Profile",
      profileSubtitle: "Manage your information and security settings",
      roleSuperAdmin: "General manager",
      roleAdmin: "Manager",
      roleManager: "Supervisor",
      roleEmployee: "Employee",
      roleClient: "Client",
      personalInfo: "Personal information",
      nameEn: "Name (English)",
      nameUr: "Name (Urdu)",
      phone: "Phone number",
      department: "Department",
      position: "Job title",
      saving: "Saving...",
      saveChanges: "Save changes",
      refresh: "Refresh",
      changePassword: "Change password",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm new password",
      passwordMismatch: "Passwords do not match",
      updatePassword: "Update password",
      totpTitle: "Two-factor authentication (2FA)",
      totpEnabled: "Enabled",
      totpHint: "Add an extra layer of protection using an authenticator app.",
      totpSetup: "Enable two-factor authentication",
      totpSettingUp: "Setting up...",
      totpGoogleAuth: "Open Google Authenticator or Authy and scan the code:",
      totpEnterManually: "Or enter the code manually:",
      totpCodeLabel: "Enter the code from your app to verify",
      totpCancel: "Cancel",
      totpVerify: "Confirm and enable",
      totpVerifying: "Verifying...",
      totpConfirmed: "Two-factor authentication enabled",
      totpActive: "Your account is protected with an additional security layer",
      totpDisable: "Disable two-factor authentication",
      totpDisableHint: "To disable protection, enter the current code from your authenticator app:",
      totpAppCode: "App code",
      totpDisableConfirm: "Confirm disable",
      totpDisabling: "Disabling...",
      passkeysTitle: "Passkeys",
      passkeysSubtitle: "Sign in without a password using your fingerprint, face, or device security key.",
      addPasskey: "Add passkey",
      passkeysLoading: "Adding...",
      passkeysEmpty: "No passkeys registered yet.",
      passkeyAdded: "Passkey added",
      passkeyDeleted: "Deleted",
      cardTitle: "Employee card",
      cardSubtitle: "Show your official card and the system access barcode",
      viewCard: "View card",
      settingsTitle: "Settings",
      settingsSubtitle: "System configuration and customization",
      generalTab: "General",
      emailTab: "Email",
      notificationsTab: "Notifications",
      securityTab: "Security",
      generalSettings: "General settings",
      companyName: "Company name",
      shortDescription: "Short description",
      publicEmail: "Public email",
      phoneNumber: "Phone number",
      address: "Address",
      website: "Website",
      emailSettings: "Email settings",
      senderName: "Sender name",
      emailSignature: "Email signature (HTML)",
      serverNotice: "Server settings are managed through environment variables. Email templates can be customized here.",
      notificationsTitle: "Notification settings",
      notificationNewLead: "Notify when a new lead is added",
      notificationProjectUpdate: "Notify when a project stage is updated",
      notificationInvoicePaid: "Notify when an invoice is paid",
      notificationOverdueInvoice: "Alert for overdue invoices",
      notificationContactRequest: "Notify for new contact requests",
      securityTitle: "Security settings",
      sessionExpiry: "Session expiry time (hours)",
      loginAttempts: "Maximum login attempts",
      requireTwoFactor: "Require two-factor authentication for admins",
      usersTitle: "Users",
      usersCount: "registered users",
      addUser: "Add user",
      searchUsers: "Search by name or email...",
      userColumn: "User",
      roleColumn: "Role",
      statusColumn: "Status",
      departmentColumn: "Department",
      twoFactorColumn: "Two-factor",
      actionsColumn: "Actions",
      userActive: "Active",
      userInactive: "Inactive",
      userEnabled: "Enabled",
      userDisabled: "Disabled",
      userSuspended: "Suspended",
      userDeleted: "User deleted",
      deleteUserConfirm: "Delete this user?",
      editUser: "Edit user",
      createUser: "Add user",
      fullName: "Full name",
      email: "Email address",
      password: "Password",
      roleLabel: "Role",
      statusLabel: "Status",
      employeeDashboardGreetingMorning: "Good morning",
      employeeDashboardGreetingAfternoon: "Good afternoon",
      employeeDashboardGreetingEvening: "Good evening",
      employeeDashboardDate: "Today",
      activeProjects: "Active projects",
      completedProjects: "Completed",
      overdueProjects: "Overdue",
      totalProjects: "Total projects",
      myProjects: "My projects",
      viewAll: "View all",
      noActiveProjects: "No active projects",
      overdue: "Overdue",
      myCard: "My card",
      barcodePreview: "Show barcode",
      myProfile: "My profile",
      accountSettings: "Account settings",
      cardLabel: "Employee card",
      stageRequest: "Request",
      stageReview: "Review",
      stageQuotation: "Quotation",
      stageContract: "Contract",
      stagePayment: "Payment",
      stageExecution: "Execution",
      stageClosed: "Closed",
      employeeCardTitle: "Employee card",
      employeeCardSubtitle: "Your official card • scan the barcode to verify identity",
      companyBrand: "OFOQ Business Solutions",
      employeeCode: "Employee code",
      loadingCard: "Loading card...",
      loadError: "Unable to load card data",
      retry: "Retry",
      clickToBack: "Click to return to the front",
      clickToBarcode: "Click to show barcode",
      scanToVerify: "Scan to verify",
      generating: "Generating...",
      frontSide: "Front side",
      showBarcode: "Show barcode",
      downloadCard: "Download card",
      regenerateBarcode: "Regenerate barcode",
      regenerateConfirm: "Regenerate the barcode?\nThe old code will no longer work.",
      barcodeRegenerated: "Barcode renewed — the old code is no longer valid",
      walletSection: "Apple Wallet section",
      addToWallet: "Add to Apple Wallet",
      walletDownload: "Download employee card (.pkpass)",
      walletGenerated: "Apple Wallet card downloaded",
      walletError: "Unable to generate the Apple Wallet card",
      platformNoteIos: "The app will open automatically",
      platformNoteOther: "On iPhone: open the downloaded file to add it to Wallet",
    },
    dashboard: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", subtitle: "Here is your OFOQ performance summary for today", smartInsight: "Smart insight", team: "Team members", activeUsers: "Active users", leads: "Business leads", newThisMonth: "new this month", closeRate: "close rate", activeCustomers: "Active customers", fromTotal: "of", newCustomer: "new", activeProjects: "Active projects", overdueTasks: "overdue tasks", completed: "completed", revenueThisMonth: "Revenue this month", paidInvoices: "paid invoices", totalRevenue: "Total revenue", allPaidInvoices: "all paid invoices", totalProjects: "Total projects", contactRequests: "Contact requests", viewConsultations: "View consultations", revenueCurve: "Revenue curve", lastSixMonths: "Last 6 months", revenue: "Revenue", noRevenue: "No revenue recorded yet", pipeline: "Lead pipeline", noLeads: "No leads yet", projectStages: "Project stages", recentLeads: "Recent leads", recentProjects: "Active projects", viewAll: "View all", overdueAlert: "overdue tasks need immediate follow-up", viewTasks: "View tasks" },
    customers: { title: "Customers", count: "registered customers", add: "Add customer", search: "Search by name, email, or company...", empty: "No customers yet", edit: "Edit", deleteConfirm: "Delete this customer?", name: "Name", email: "Email", phone: "Phone", company: "Company", industry: "Industry", tier: "Tier", status: "Status", country: "Country", currency: "Currency", active: "Active", inactive: "Inactive", save: "Add", update: "Update", cancel: "Cancel", bronze: "Bronze", silver: "Silver", gold: "Gold", platinum: "Platinum" },
     leads: { title: "Business leads", count: "leads in the database", add: "Add lead", search: "Search by name, email, or company...", allStages: "All stages", empty: "No business leads", emptySub: "Add your first lead to start tracking", name: "Name", company: "Company", stage: "Stage", priority: "Priority", budget: "Budget", source: "Source", actions: "Actions", convert: "Convert to customer", deleteConfirm: "Are you sure you want to delete this lead?", deleted: "Lead deleted", page: "Page", result: "results", new: "New", contacted: "Contacted", qualified: "Qualified", proposal: "Proposal", negotiation: "Negotiation", won: "Closed (won)", lost: "Closed (lost)", low: "Low", medium: "Medium", high: "High", urgent: "Urgent", formNew: "Add new lead", formEdit: "Edit lead", required: "Required", namePlaceholder: "Prospect name", service: "Requested service", servicePlaceholder: "Website development, marketing...", notes: "Notes", notesPlaceholder: "Additional notes...", followUp: "Follow-up date", website: "Website", referral: "Referral", socialMedia: "Social media", emailSource: "Email", phoneSource: "Phone", event: "Event", other: "Other", currencySar: "Saudi riyal (SAR)", currencyUsd: "Dollar (USD)", currencyAed: "Dirham (AED)", saving: "Saving...", update: "Update", cancel: "Cancel", created: "Lead added", updated: "Lead updated" },
    invoices: { title: "Invoices", count: "invoices", new: "New invoice", collected: "Collected total", pending: "Pending", overdue: "Overdue invoices", search: "Search by invoice number or customer...", allStatuses: "All statuses", empty: "No invoices", number: "Invoice number", customer: "Customer", total: "Total", dueDate: "Due date", status: "Status", actions: "Actions", send: "Send", markPaid: "Mark payment", download: "Download PDF", deleteConfirm: "Delete this invoice?", draft: "Draft", sent: "Sent", viewed: "Viewed", paid: "Paid", overdueStatus: "Overdue", cancelled: "Cancelled" },
    contracts: { title: "Contracts", count: "contracts", new: "New contract", total: "Total contracts", drafts: "Drafts", signed: "Signed", totalValue: "Total value", search: "Search by contract number...", allStatuses: "All statuses", empty: "No contracts yet", number: "Contract number", contractTitle: "Title", customer: "Customer", value: "Value", endDate: "End date", status: "Status", actions: "Actions", edit: "Edit", send: "Send", certify: "Certify", download: "Download PDF", deleteConfirm: "Delete this contract?", editTitle: "Edit contract", titleLabel: "Contract title", chooseCustomer: "Choose customer...", currency: "Currency", startDate: "Start date", content: "Contract content", cancel: "Cancel", save: "Save changes", create: "Create contract", required: "Required", draft: "Draft", sent: "Sent", signedStatus: "Signed", expired: "Expired", cancelled: "Cancelled" },
    projects: { title: "Projects", count: "projects", table: "Table", kanban: "Kanban", newProject: "New project", search: "Search projects...", allStages: "All stages", project: "Project", stage: "Stage", progress: "Progress", dueDate: "Due date", priority: "Priority", actions: "Actions", deleteConfirm: "Delete this project?", deleted: "Project deleted", edit: "Edit", stages: { request: "Request", review: "Review", quotation: "Quotation", contract: "Contract", payment: "Payment", execution: "Execution", closed: "Closed" }, priorities: { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" }, statuses: { active: "Active", on_hold: "On hold", cancelled: "Cancelled", completed: "Completed" }, formNew: "New project", formEdit: "Edit project", name: "Project name", namePlaceholder: "Project name", startDate: "Start date", budget: "Budget", currency: "Currency", progressLabel: "Progress (%)", status: "Status", description: "Description", descriptionPlaceholder: "Project description...", cancel: "Cancel", save: "Save", creating: "Creating...", saving: "Saving...", update: "Update", create: "Create project", created: "Project created", updated: "Project updated" },
    cms: { title: "Content management", subtitle: "Manage your website content", blog: "Blog", testimonials: "Testimonials", pages: "Pages", newArticle: "New article", emptyPosts: "No articles yet", published: "Published", draft: "Draft", deletePostConfirm: "Delete this article?", deleted: "Deleted", emptyTestimonials: "No testimonials", deleteTestimonialConfirm: "Delete this testimonial?", hidden: "Hidden", edit: "Edit", noPages: "No pages yet", formNew: "New article", formEdit: "Edit article", titleAr: "Title (Arabic) *", titleArPlaceholder: "Article title in Arabic", titleEn: "Title (English)", titleEnPlaceholder: "Article title in English", excerpt: "Excerpt", excerptPlaceholder: "Short article summary...", content: "Content", contentPlaceholder: "Full article content...", coverImage: "Cover image URL", category: "Category", categoryPlaceholder: "Marketing, technology...", tags: "Tags (comma-separated)", tagsPlaceholder: "Technology, AI, business", publishNow: "Publish now", cancel: "Cancel", save: "Save", saving: "Saving...", publish: "Publish article", update: "Update", created: "Article created", updated: "Article updated" },
  },
  client: { portal: "Client portal", dashboard: "Dashboard", requests: "My requests", support: "Support", logout: "Sign out", client: "Client", welcome: "Welcome", dashboardSub: "Track your requests and contact our team from here.", total: "Total requests", active: "Active requests", completed: "Completed", newRequests: "New requests", newRequest: "New service request", supportAction: "Contact support", latest: "Latest requests", noRequests: "No requests yet", noRequestsSub: "Submit your first request and our team will contact you.", submitNow: "Submit a request now", requestCount: "requests", loading: "Loading...", requestDetails: "Request details", statusHistory: "Status history", messages: "Messages from the OFOQ team", addNote: "Add a note for the team", notePlaceholder: "Write your note here...", noteAdded: "Your note was added", noteError: "Could not send the note", statusUpdated: "Status updated and client notified", statusUpdateError: "Could not update the status", requestNotFound: "Request not found", changeStatus: "Change status", statusNotePlaceholder: "Optional note for the client with the status change", customerNotes: "Client notes", notesTitle: "Notes", noNotes: "No notes yet", internalNote: "Internal note (not sent to the client)", add: "Add", history: "Status history", supportSub: "Contact the OFOQ team directly — we reply during business hours.", noMessages: "No messages yet", noMessagesSub: "Send your first message and our team will reply soon.", supportPlaceholder: "Write your message... (Enter to send)", sendError: "Could not send the message", you: "You", invalidRequest: "The request was not found or you do not have access.", backRequests: "Back to requests", status: { new: "New", reviewing: "Under review", approved: "Approved", in_progress: "In progress", completed: "Completed", rejected: "Rejected" }, services: { company_formation: "Company formation", legal_services: "Legal services", trademark: "Trademark registration", government_services: "Government services", hr_management: "Human resources management", gov_platforms: "Government platforms management", investor_services: "Investor services", ipo_preparation: "IPO preparation" } },
  employee: { portal: "Employee portal", login: "Sign in", email: "Email address", password: "Password", emailRequired: "Email is required", passwordRequired: "Password is required", invalid: "Unable to sign in. Check your details and try again.", twoFactor: "Two-factor verification", code: "Verification code", verify: "Confirm", verifying: "Verifying...", back: "Back", barcode: "Sign in with employee barcode", logout: "Sign out", employee: "Employee", dashboard: "Dashboard", card: "My card", profile: "My profile", employeePhoto: "Employee photo", passkey: "Sign in with passkey or biometrics", passkeyHint: "To register a passkey: sign in first, then open My profile and choose Add passkey.", adminLogin: "Control panel sign in", or: "or", barcodeTitle: "Sign in with barcode", cameraHint: "Tap to activate the camera", barcodeSubmit: "Sign in" },
   adminLogin: { title: "OFOQ Business Solutions", subtitle: "Sign in to the OFOQ control panel", email: "Email address", password: "Password", forgot: "Forgot password?", login: "Sign in", loggingIn: "Signing in...", emailRequired: "Email is required", passwordRequired: "Password is required", invalid: "Unable to sign in. Check your details and try again.", twoFactor: "Enter your two-factor code", code: "Verification code", verify: "Confirm", verifying: "Verifying...", back: "Back to sign in", employeeBarcode: "Sign in with employee barcode", employeeLogin: "Employee sign in", passkeyLogin: "Sign in with passkey", or: "or", twoFactorInvalid: "The verification code is incorrect.", oauthCompleting: "Completing sign in...", welcome: "Welcome", successfulProjects: "Successful projects", customerSatisfaction: "Customer satisfaction" },
  footer: { newsletter: "Join our newsletter", newsletterSub: "Discover more about our advanced business services", email: "Your email address", join: "Join", about: "About us", services: "Services", packages: "Packages", contact: "Contact", story: "Our story", vision: "Vision & mission", why: "Why OFOQ?", formation: "Company formation", legal: "Legal services", hr: "Human resources", government: "Government platforms", investors: "Investor services", silver: "Silver package", gold: "Gold package", platinum: "Platinum package", compare: "Compare packages", form: "Contact form", rights: "All rights reserved.", privacy: "Privacy policy", terms: "Terms & conditions", madeBy: "Made by", location: "Jeddah — King Abdullah Road", description: "Your trusted business partner in Saudi Arabia — comprehensive services that simplify operations and support sustainable growth." },
};

const ar: UiCopy = {
  ...en,
  header: { clientLogin: "دخول العميل", menu: "القائمة", language: "اللغة" },
  home: { ...en.home, badge: "أفق / شريك الأعمال السعودي", hero1: "نرتّب التفاصيل،", hero2: "لتتفرغ للنمو.", heroSub: "شريكك الموثوق في الموارد البشرية، الخدمات الحكومية، التأشيرات وتأسيس الشركات في المملكة.", request: "اطلب خدمة", explore: "استكشف الخدمات", aboutBadge: "عن أفق", aboutTitle1: "شريك عملك في", aboutTitle2: "المملكة العربية السعودية", aboutDesc: "نحمل عنك الإجراءات الحكومية وإدارة الموارد البشرية ومتطلبات التأسيس — حتى تتفرغ تماماً لنمو أعمالك.", aboutCta: "اعرف المزيد", servicesBadge: "خدماتنا", servicesTitle1: "خدمات متكاملة", servicesTitle2: "وشاملة", servicesAll: "عرض جميع الخدمات", more: "خدمات أخرى", whyBadge: "لماذا أفق؟", whyTitle: "نبني معك خطوة بخطوة", ctaTitle1: "لنعزز نموكم", ctaTitle2: "المستدام", ctaDesc: "تواصل معنا اليوم وابدأ رحلة شراكة حقيقية.", contact: "تواصل معنا", stats: ["عميل تخدمهم أفق", "نسبة رضا العملاء", "خبير متخصص", "تصنيفات خدمية"], reasons: [{ title: "فريق متخصص", desc: "مختصون في كل مجال من مجالات خدماتنا في السوق السعودي." }, { title: "متابعة كاملة", desc: "نتابع ملفك حتى الإغلاق مع تحديثات دورية لك." }, { title: "تجربة رقمية", desc: "بوابة عميل متكاملة لمتابعة طلباتك أينما كنت." }, { title: "خبرة محلية", desc: "نفهم الأنظمة والجهات الحكومية السعودية عن قرب." }] },
  services: { title: "الخدمات | أفق", badge: "دليل خدمات أفق", hero1: "خدمات مصممة", hero2: "لعملك بالكامل.", heroSub: "من تأسيس الكيان إلى تشغيله يومياً، ننسّق التفاصيل عبر فريق واحد ومسار واضح.", view: "عرض الخدمات", more: "خدمات أخرى" },
  category: { home: "الرئيسية", services: "الخدمات", badge: "تصنيف الخدمة", available: "خدمة متاحة", service: "خدمة", grid: "شبكة", list: "قائمة", details: "التفاصيل", need: "هل تحتاج هذه الخدمات؟", needDesc: "تواصل معنا وسنساعدك في تحديد الخدمة المناسبة لاحتياجاتك.", request: "اطلب خدمة" },
  detail: { home: "الرئيسية", services: "الخدمات", badge: "تفاصيل الخدمة", request: "اطلب الخدمة", how: "كيف نعمل", faq: "الأسئلة الشائعة", window: "مدة التنفيذ", suitable: "لمن تناسب؟", requirements: "المتطلبات", related: "خدمات أخرى من نفس التصنيف", details: "التفاصيل" },
  auth: { clientTitle: "بوابة العملاء", clientSubtitle: "سجّل دخولك لمتابعة طلباتك", login: "تسجيل الدخول", email: "البريد الإلكتروني", password: "كلمة المرور", forgot: "نسيت كلمة المرور؟", noAccount: "ليس لديك حساب؟", create: "إنشاء حساب جديد", registerTitle: "إنشاء حساب جديد", registerSubtitle: "انضم لبوابة عملاء أفق", fullName: "الاسم الكامل", phone: "رقم الهاتف", confirmPassword: "تأكيد كلمة المرور", createAccount: "إنشاء الحساب", haveAccount: "لديك حساب بالفعل؟", invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة", forgotTitle: "نسيت كلمة المرور؟", forgotSubtitle: "أدخل بريدك وسنرسل لك رابط الاسترداد", checkEmail: "تحقق من بريدك الإلكتروني", checkEmailDesc: "إذا كان البريد مسجلاً لدينا، ستصلك رسالة بها رابط إعادة التعيين خلال دقائق.", spam: "تحقق من مجلد Spam إذا لم تجد الرسالة", backLogin: "العودة لتسجيل الدخول", sendReset: "إرسال رابط الاسترداد", sending: "جاري الإرسال...", resetTitle: "تعيين كلمة مرور جديدة", resetSubtitle: "اختر كلمة مرور قوية لحسابك", passwordChanged: "تم تغيير كلمة المرور!", redirecting: "سيتم تحويلك لصفحة الدخول خلال ثوانٍ...", goLogin: "الذهاب لتسجيل الدخول الآن", newPassword: "كلمة المرور الجديدة", passwordStrength: "القوة", savePassword: "حفظ كلمة المرور الجديدة", saving: "جاري الحفظ...", mismatch: "كلمتا المرور غير متطابقتين", minPassword: "كلمة المرور يجب أن تكون 8 أحرف على الأقل", invalidReset: "الرابط غير صالح أو منتهي الصلاحية" },
  request: { title: "طلب خدمة جديد", subtitle: "أكمل النموذج وسيتواصل فريقنا معك خلال 24–48 ساعة", steps: ["معلومات الشركة", "بيانات التواصل", "تفاصيل الخدمة", "المراجعة"], company: "اسم الشركة", commercialReg: "رقم السجل التجاري (اختياري)", activity: "النشاط التجاري", contactEmail: "البريد الإلكتروني للتواصل", contactPhone: "رقم الهاتف", service: "نوع الخدمة المطلوبة", package: "الباقة (اختياري)", country: "دولة الاستقدام (إن انطبق)", notes: "ملاحظات إضافية (اختياري)", chooseService: "اختر الخدمة...", chooseCountry: "اختر الدولة...", next: "التالي", previous: "السابق", review: "مراجعة الطلب", submit: "إرسال الطلب", success: "تم تقديم طلبك بنجاح!", error: "خطأ في إرسال الطلب", required: "مطلوب" },
  packages: { ...en.packages, title: "الباقات | أفق", badge: "الباقات", heroTitle: "اصنع مسار", heroHighlight: "نجاحك", heroSub: "اختر الباقة التي تناسب احتياجات عملك", names: ["الباقة الفضية", "الباقة الذهبية", "الباقة البلاتينية"], taglines: ["للشركات الناشئة", "الأكثر طلباً", "للمؤسسات الكبرى"], badges: ["", "الأكثر طلباً", "الأشمل"], features: ["وزارة التجارة", "منصة سلامة", "التأمينات الاجتماعية", "خدمات التأمين الطبي", "خدمات الزكاة والضريبة", "منصة أبشر ومقيم", "خدمات الاستشارات", "وزارة الإعلام", "منصة بلدي", "خدمة تخفيف الأعباء", "التدريب والتطوير"], subscribe: "اشترك الآن", compare: "مقارنة الباقات", service: "الخدمة", silver: "فضية", gold: "ذهبية", platinum: "بلاتينية", help: "هل تحتاج إلى مساعدة في الاختيار؟", helpTitle: "فريقنا يساعدك", contact: "تواصل معنا" },
  adminPages: {
    dashboard: { morning: "صباح الخير", afternoon: "مساء الخير", evening: "مساء النور", subtitle: "إليك ملخص أداء منظومة أفق اليوم", smartInsight: "رؤية ذكية", team: "فريق العمل", activeUsers: "المستخدمون النشطون", leads: "الفرص التجارية", newThisMonth: "جديدة هذا الشهر", closeRate: "معدل الإغلاق", activeCustomers: "العملاء النشطون", fromTotal: "من أصل", newCustomer: "جديد", activeProjects: "المشاريع الجارية", overdueTasks: "مهمة متأخرة", completed: "مكتمل", revenueThisMonth: "إيرادات هذا الشهر", paidInvoices: "الفواتير المدفوعة", totalRevenue: "إجمالي الإيرادات", allPaidInvoices: "جميع الفواتير المدفوعة", totalProjects: "إجمالي المشاريع", contactRequests: "طلبات التواصل", viewConsultations: "اضغط لعرض الاستشارات", revenueCurve: "منحنى الإيرادات", lastSixMonths: "آخر 6 أشهر", revenue: "الإيرادات", noRevenue: "لا توجد إيرادات مسجّلة بعد", pipeline: "توزيع الفرص", noLeads: "لا توجد فرص بعد", projectStages: "مراحل المشاريع", recentLeads: "آخر الفرص التجارية", recentProjects: "المشاريع الجارية", viewAll: "عرض الكل", overdueAlert: "مهمة متأخرة تحتاج إلى متابعة فورية", viewTasks: "عرض المهام" },
    customers: { title: "العملاء", count: "عميل مسجّل", add: "إضافة عميل", search: "بحث بالاسم أو البريد أو الشركة...", empty: "لا يوجد عملاء بعد", edit: "تعديل", deleteConfirm: "حذف العميل؟", name: "الاسم", email: "البريد", phone: "الهاتف", company: "الشركة", industry: "القطاع", tier: "التصنيف", status: "الحالة", country: "الدولة", currency: "العملة", active: "نشط", inactive: "غير نشط", save: "إضافة", update: "تحديث", cancel: "إلغاء", bronze: "برونزي", silver: "فضي", gold: "ذهبي", platinum: "بلاتيني" },
    leads: { title: "الفرص التجارية", count: "فرصة في قاعدة البيانات", add: "إضافة فرصة", search: "بحث بالاسم أو البريد أو الشركة...", allStages: "كل المراحل", empty: "لا توجد فرص تجارية", emptySub: "أضف أول فرصة لبدء التتبع", name: "الاسم", company: "الشركة", stage: "المرحلة", priority: "الأولوية", budget: "الميزانية", source: "المصدر", actions: "الإجراءات", convert: "تحويل لعميل", deleteConfirm: "هل أنت متأكد من الحذف؟", deleted: "تم حذف الفرصة", page: "صفحة", result: "نتيجة", new: "جديد", contacted: "تم التواصل", qualified: "مؤهّل", proposal: "عرض سعر", negotiation: "تفاوض", won: "مُغلق (فوز)", lost: "مُغلق (خسارة)", low: "منخفضة", medium: "متوسطة", high: "عالية", urgent: "عاجلة" },
    invoices: { title: "الفواتير", count: "فاتورة", new: "فاتورة جديدة", collected: "إجمالي المحصّل", pending: "في الانتظار", overdue: "فواتير متأخرة", search: "بحث برقم الفاتورة أو العميل...", allStatuses: "كل الحالات", empty: "لا توجد فواتير", number: "رقم الفاتورة", customer: "العميل", total: "الإجمالي", dueDate: "تاريخ الاستحقاق", status: "الحالة", actions: "الإجراءات", send: "إرسال", markPaid: "تسجيل الدفع", download: "تحميل PDF", deleteConfirm: "حذف الفاتورة؟", draft: "مسودة", sent: "مُرسلة", viewed: "مُشاهَدة", paid: "مدفوعة", overdueStatus: "متأخرة", cancelled: "ملغاة" },
     contracts: { title: "العقود", count: "عقد", new: "عقد جديد", total: "إجمالي العقود", drafts: "مسودات", signed: "موقّعة", totalValue: "إجمالي القيمة", search: "بحث برقم العقد...", allStatuses: "كل الحالات", empty: "لا توجد عقود بعد", number: "رقم العقد", contractTitle: "العنوان", customer: "العميل", value: "القيمة", endDate: "تاريخ الانتهاء", status: "الحالة", actions: "الإجراءات", edit: "تعديل", send: "إرسال", certify: "توثيق", download: "تحميل PDF", deleteConfirm: "حذف العقد؟", editTitle: "تعديل العقد", titleLabel: "عنوان العقد", chooseCustomer: "اختر العميل...", currency: "العملة", startDate: "تاريخ البدء", content: "محتوى العقد", cancel: "إلغاء", save: "حفظ التعديلات", create: "إنشاء العقد", required: "مطلوب", draft: "مسودة", sent: "مُرسل", signedStatus: "موقّع", expired: "منتهي", cancelled: "ملغي" },
     projects: { title: "المشاريع", count: "مشروع", table: "جدول", kanban: "كانبان", newProject: "مشروع جديد", search: "بحث في المشاريع...", allStages: "كل المراحل", project: "المشروع", stage: "المرحلة", progress: "التقدم", dueDate: "تاريخ التسليم", priority: "الأولوية", actions: "الإجراءات", deleteConfirm: "حذف المشروع؟", deleted: "تم حذف المشروع", edit: "تعديل", stages: { request: "طلب", review: "مراجعة", quotation: "عرض سعر", contract: "عقد", payment: "دفع", execution: "تنفيذ", closed: "إغلاق" }, priorities: { low: "منخفضة", medium: "متوسطة", high: "عالية", urgent: "عاجلة" }, statuses: { active: "نشط", on_hold: "معلّق", cancelled: "ملغي", completed: "مكتمل" }, formNew: "مشروع جديد", formEdit: "تعديل المشروع", name: "اسم المشروع", namePlaceholder: "اسم المشروع", startDate: "تاريخ البداية", budget: "الميزانية", currency: "العملة", progressLabel: "نسبة التقدم (%)", status: "الحالة", description: "الوصف", descriptionPlaceholder: "وصف المشروع...", cancel: "إلغاء", save: "حفظ", creating: "جاري الإنشاء...", saving: "جاري الحفظ...", update: "تحديث", create: "إنشاء مشروع", created: "تمت إضافة المشروع", updated: "تم تحديث المشروع" },
     cms: { title: "إدارة المحتوى", subtitle: "تحكم كامل في محتوى الموقع", blog: "المدونة", testimonials: "الشهادات", pages: "الصفحات", newArticle: "مقالة جديدة", emptyPosts: "لا توجد مقالات بعد", published: "منشور", draft: "مسودة", deletePostConfirm: "حذف المقالة؟", deleted: "تم الحذف", emptyTestimonials: "لا توجد شهادات", deleteTestimonialConfirm: "حذف الشهادة؟", hidden: "مخفي", edit: "تعديل", noPages: "لا توجد صفحات بعد", formNew: "مقالة جديدة", formEdit: "تعديل المقالة", titleAr: "العنوان (عربي) *", titleArPlaceholder: "عنوان المقالة بالعربية", titleEn: "العنوان (إنجليزي)", titleEnPlaceholder: "Article title in English", excerpt: "مقتطف", excerptPlaceholder: "ملخص قصير للمقالة...", content: "المحتوى", contentPlaceholder: "محتوى المقالة كاملاً...", coverImage: "رابط الصورة الغلاف", category: "التصنيف", categoryPlaceholder: "تسويق، تقنية...", tags: "الوسوم (مفصولة بفاصلة)", tagsPlaceholder: "تقنية، ذكاء اصطناعي، أعمال", publishNow: "نشر الآن", cancel: "إلغاء", save: "حفظ", saving: "جاري الحفظ...", publish: "نشر المقالة", update: "تحديث", created: "تمت إضافة المقالة", updated: "تم تحديث المقالة" },
  },
  client: { ...en.client, portal: "بوابة العملاء", dashboard: "الرئيسية", requests: "طلباتي", support: "الدعم", logout: "تسجيل الخروج", client: "العميل", welcome: "أهلاً", dashboardSub: "تابع طلباتك وتواصل مع فريقنا من هنا", total: "إجمالي الطلبات", active: "طلبات نشطة", completed: "مُنجزة", newRequests: "طلبات جديدة", newRequest: "طلب خدمة جديد", supportAction: "تواصل مع الدعم", latest: "آخر الطلبات", noRequests: "لا توجد طلبات بعد", noRequestsSub: "ابدأ بتقديم طلبك الأول وسيتواصل فريقنا معك", submitNow: "تقديم طلب الآن", requestCount: "طلب", loading: "جارٍ التحميل...", requestDetails: "تفاصيل الطلب", statusHistory: "سجل الحالات", messages: "رسائل من فريق أفق", addNote: "إضافة ملاحظة للفريق", notePlaceholder: "اكتب ملاحظتك هنا...", noteAdded: "تمت إضافة ملاحظتك", noteError: "خطأ في إرسال الملاحظة", supportSub: "تواصل مباشرة مع فريق أفق — نرد خلال أوقات الدوام", noMessages: "لا توجد رسائل بعد", noMessagesSub: "أرسل رسالتك الأولى وسيرد عليك فريقنا قريباً", supportPlaceholder: "اكتب رسالتك... (Enter للإرسال)", sendError: "خطأ في إرسال الرسالة", you: "أنت", invalidRequest: "الطلب غير موجود أو غير مصرح لك", backRequests: "العودة للطلبات", status: { new: "جديد", reviewing: "قيد المراجعة", approved: "موافق عليه", in_progress: "قيد التنفيذ", completed: "مُنجز", rejected: "مرفوض" }, services: { company_formation: "تأسيس الشركات", legal_services: "الخدمات القانونية", trademark: "تسجيل العلامات التجارية", government_services: "الخدمات الحكومية", hr_management: "إدارة الموارد البشرية", gov_platforms: "إدارة المنصات الحكومية", investor_services: "خدمات المستثمرين", ipo_preparation: "تأهيل للإدراج" } },
  employee: { ...en.employee, portal: "بوابة الموظفين", login: "تسجيل الدخول", email: "البريد الإلكتروني", password: "كلمة المرور", emailRequired: "البريد مطلوب", passwordRequired: "كلمة المرور مطلوبة", invalid: "تعذر تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى.", twoFactor: "التحقق الثنائي", code: "رمز التحقق", verify: "تأكيد", verifying: "جارٍ التحقق...", back: "رجوع", barcode: "تسجيل الدخول بباركود الموظف", logout: "تسجيل الخروج", employee: "موظف", dashboard: "لوحتي", card: "بطاقتي", profile: "ملفي", employeePhoto: "صورة الموظف", passkey: "الدخول بالبصمة أو مفتاح المرور", passkeyHint: "لتسجيل مفتاح جديد: ادخل أولاً ثم افتح «ملفي» واختر «إضافة مفتاح».", adminLogin: "دخول لوحة الإدارة", or: "أو", barcodeTitle: "دخول بالباركود", cameraHint: "اضغط لتفعيل الكاميرا", barcodeSubmit: "دخول" },
  adminLogin: { ...en.adminLogin, title: "أفق لحلول الأعمال", subtitle: "سجّل دخولك إلى لوحة تحكم أفق", email: "البريد الإلكتروني", password: "كلمة المرور", forgot: "نسيت كلمة المرور؟", login: "تسجيل الدخول", loggingIn: "جارٍ تسجيل الدخول...", emailRequired: "البريد الإلكتروني مطلوب", passwordRequired: "كلمة المرور مطلوبة", invalid: "تعذر تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى.", twoFactor: "أدخل رمز التحقق الثنائي", code: "رمز التحقق", verify: "تأكيد", verifying: "جارٍ التحقق...", back: "العودة لتسجيل الدخول", employeeBarcode: "تسجيل الدخول بباركود الموظف", employeeLogin: "تسجيل دخول الموظف", passkeyLogin: "تسجيل الدخول بمفتاح المرور", or: "أو", twoFactorInvalid: "رمز التحقق غير صحيح.", oauthCompleting: "جاري إتمام تسجيل الدخول...", welcome: "مرحباً", successfulProjects: "مشروع ناجح", customerSatisfaction: "رضا العملاء" },
  footer: { ...en.footer, newsletter: "للتسجيل في نشرتنا", newsletterSub: "لمعرفة المزيد حول خدمات الأعمال المتقدمة", email: "بريدك الإلكتروني", join: "انضم", about: "من نحن", services: "الخدمات", packages: "الباقات", contact: "التواصل", story: "قصتنا", vision: "رؤيتنا ومهمتنا", why: "لماذا أفق؟", formation: "تأسيس الشركات", legal: "الخدمات القانونية", hr: "الموارد البشرية", government: "المنصات الحكومية", investors: "خدمات المستثمرين", silver: "الباقة الفضية", gold: "الباقة الذهبية", platinum: "الباقة البلاتينية", compare: "مقارنة الباقات", form: "نموذج التواصل", rights: "جميع الحقوق محفوظة.", privacy: "سياسة الخصوصية", terms: "الشروط والأحكام", madeBy: "صُنع بواسطة", location: "جدة — طريق الملك عبدالله", description: "شريكك الموثوق لأعمالك في السعودية — نقدم حلولاً شاملة لتسهيل أعمالك ودعم نموك المستدام." },
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<any> ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const overrides: Record<Exclude<Lang, "ar" | "en">, DeepPartial<UiCopy>> = {
  ur: {
    header: { clientLogin: "کلائنٹ لاگ اِن", menu: "مینو", language: "زبان" },
    home: {
      badge: "OFOQ / سعودی کاروباری ساتھی",
      hero1: "ہم سنبھالتے ہیں",
      hero2: "آپ کی تفصیلات۔",
      heroSub: "سعودی عرب میں انسانی وسائل، سرکاری خدمات، ویزوں اور کمپنی بنانے کے لیے آپ کا قابل اعتماد ساتھی۔",
      request: "خدمت کی درخواست",
      explore: "خدمات دیکھیں",
      aboutBadge: "OFOQ کے بارے میں",
      aboutTitle1: "آپ کا کاروباری ساتھی",
      aboutTitle2: "سعودی عرب میں",
      aboutDesc: "ہم سرکاری کارروائیوں، انسانی وسائل کے انتظام، اور کمپنی بنانے کی ضروریات کو سنبھالتے ہیں — تاکہ آپ اپنی توجہ کاروبار کی ترقی پر رکھ سکیں۔",
      aboutCta: "مزید جانیں",
      servicesBadge: "ہماری خدمات",
      servicesTitle1: "جامع",
      servicesTitle2: "خدمات",
      servicesAll: "تمام خدمات دیکھیں",
      more: "مزید خدمات",
      whyBadge: "کیوں OFOQ؟",
      whyTitle: "ہم آپ کے ساتھ قدم بہ قدم آگے بڑھتے ہیں",
      ctaTitle1: "آئیے آپ کی",
      ctaTitle2: "پائیدار ترقی کو بڑھائیں",
      ctaDesc: "آج ہی ہم سے رابطہ کریں اور حقیقی شراکتی سفر شروع کریں۔",
      contact: "ہم سے رابطہ کریں",
      stats: ["خدمات یافتہ کلائنٹس", "کلائنٹ اطمینان", "ماہرین", "خدماتی اقسام"],
      reasons: [
        { title: "ماہر ٹیم", desc: "سعودی مارکیٹ میں ہماری ہر سروس کے ہر شعبے کے ماہرین۔" },
        { title: "مکمل فالو اپ", desc: "ہم آپ کی فائل کو باقاعدہ اپڈیٹس کے ساتھ بند ہونے تک فالو کرتے ہیں۔" },
        { title: "ڈیجیٹل تجربہ", desc: "اپنے مطالبات کہیں سے بھی ٹریک کرنے کے لیے مکمل کلائنٹ پورٹل۔" },
        { title: "مقامی مہارت", desc: "سعودی قوانین اور سرکاری اداروں کا گہرا علم۔" },
      ],
    },
    services: { title: "خدمات | OFOQ", badge: "OFOQ کی خدماتی فہرست", hero1: "خدمات جو", hero2: "آپ کے کاروبار کے لیے ہیں۔", heroSub: "تاسیس سے روزمرہ آپریشنز تک، ہم ایک ٹیم اور واضح راستے کے ساتھ تمام تفصیلات سنبھالتے ہیں۔", view: "خدمات دیکھیں", more: "مزید" },
    category: { home: "ہوم", services: "خدمات", badge: "سروس کی قسم", available: "دستیاب خدمات", service: "خدمات", grid: "گرڈ", list: "فہرست", details: "تفصیلات", need: "کیا آپ کو ان خدمات کی ضرورت ہے؟", needDesc: "ہم سے رابطہ کریں اور ہم آپ کی ضرورت کے مطابق درست سروس منتخب کرنے میں مدد کریں گے۔", request: "خدمت کی درخواست" },
    detail: { home: "ہوم", services: "خدمات", badge: "سروس کی تفصیلات", request: "خدمت کی درخواست", how: "ہم کیسے کام کرتے ہیں", faq: "اکثر پوچھے گئے سوالات", window: "سروس مدت", suitable: "یہ کس کے لیے ہے؟", requirements: "ضروریات", related: "اس زمرے کی دیگر خدمات", details: "تفصیلات" },
     auth: { clientTitle: "کلائنٹ پورٹل", clientSubtitle: "اپنی درخواستیں دیکھنے کے لیے لاگ اِن کریں", login: "لاگ اِن", email: "ای میل", password: "پاس ورڈ", forgot: "پاس ورڈ بھول گئے؟", noAccount: "کیا آپ کے پاس اکاؤنٹ نہیں؟", create: "نیا اکاؤنٹ بنائیں", registerTitle: "اپنا اکاؤنٹ بنائیں", registerSubtitle: "OFOQ کلائنٹ پورٹل میں شامل ہوں", fullName: "پورا نام", phone: "فون نمبر", confirmPassword: "پاس ورڈ کی تصدیق", createAccount: "اکاؤنٹ بنائیں", haveAccount: "کیا آپ کے پاس پہلے سے اکاؤنٹ ہے؟", invalid: "غلط ای میل یا پاس ورڈ", forgotTitle: "اپنا پاس ورڈ بھول گئے؟", forgotSubtitle: "اپنا ای میل درج کریں اور ہم ریکوری لنک بھیجیں گے", checkEmail: "اپنا ای میل چیک کریں", checkEmailDesc: "اگر یہ ای میل ہمارے پاس رجسٹرڈ ہے تو چند منٹ میں ری سیٹ لنک موصول ہوگا۔", spam: "اگر نظر نہ آئے تو اسپام فولڈر دیکھیں۔", backLogin: "سائن اِن پر واپس جائیں", sendReset: "ریکوری لنک بھیجیں", sending: "بھیجا جا رہا ہے...", resetTitle: "نیا پاس ورڈ سیٹ کریں", resetSubtitle: "اپنے اکاؤنٹ کے لیے مضبوط پاس ورڈ منتخب کریں", passwordChanged: "پاس ورڈ کامیابی سے تبدیل ہو گیا", redirecting: "آپ کو جلد ہی سائن اِن پر بھیج دیا جائے گا۔", goLogin: "ابھی سائن اِن پر جائیں", newPassword: "نیا پاس ورڈ", passwordStrength: "طاقت", continueGoogle: "Google کے ساتھ جاری رکھیں", continueApple: "Apple کے ساتھ جاری رکھیں", or: "یا", strengthVeryWeak: "بہت کمزور", strengthWeak: "کمزور", strengthAcceptable: "قابل قبول", strengthStrong: "مضبوط", savePassword: "نیا پاس ورڈ محفوظ کریں", saving: "محفوظ کیا جا رہا ہے...", mismatch: "پاس ورڈ مماثل نہیں", minPassword: "پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے", invalidReset: "لنک غیر معتبر یا ختم ہو چکا ہے" },
     request: { title: "نئی خدمت کی درخواست", subtitle: "فارم مکمل کریں اور ہماری ٹیم 24–48 گھنٹوں میں آپ سے رابطہ کرے گی", steps: ["کمپنی کی معلومات", "رابطے کی معلومات", "خدمت کی تفصیلات", "جائزہ"], company: "کمپنی کا نام", commercialReg: "تجارتی رجسٹریشن (اختیاری)", activity: "تجارتی سرگرمی", contactEmail: "رابطہ ای میل", contactPhone: "فون نمبر", service: "درخواست کردہ خدمت", package: "پیکیج (اختیاری)", country: "بھرتی کا ملک (اگر قابلِ اطلاق ہو)", notes: "اضافی نوٹس (اختیاری)", chooseService: "ایک خدمت منتخب کریں...", chooseCountry: "ایک ملک منتخب کریں...", next: "اگلا", previous: "پچھلا", review: "درخواست کا جائزہ", submit: "درخواست بھیجیں", submitted: "جمع کرایا گیا", success: "آپ کی درخواست کامیابی سے جمع ہو گئی۔", error: "درخواست جمع نہیں کی جا سکی۔", required: "درکار" },
    packages: { title: "پیکیجز | OFOQ", badge: "پیکیجز", heroTitle: "اپنے", heroHighlight: "کامیابی کے راستے", heroSub: "اپنے کاروباری تقاضوں کے مطابق پیکیج منتخب کریں۔", names: ["سلور پیکیج", "گولڈ پیکیج", "پلاٹینم پیکیج"], taglines: ["اسٹارٹ اپس کے لیے", "سب سے زیادہ مقبول", "بڑی تنظیموں کے لیے"], badges: ["", "سب سے زیادہ مقبول", "سب سے جامع"], features: ["وزارتِ تجارت", "سلامہ پلیٹ فارم", "سوشل انشورنس", "طبی انشورنس خدمات", "زکوٰۃ اور ٹیکس خدمات", "ابشر اور مقیم پلیٹ فارم", "مشاورتی خدمات", "وزارتِ اطلاعات", "بلدی پلیٹ فارم", "بوجھ میں کمی کی سروس", "تربیت اور ترقی"], subscribe: "ابھی سبسکرائب کریں", compare: "پیکیجز کا موازنہ کریں", service: "خدمت", silver: "سلور", gold: "گولڈ", platinum: "پلاٹینم", help: "منتخب کرنے میں مدد چاہیے؟", helpTitle: "ہماری ٹیم مدد کر سکتی ہے", contact: "ہم سے رابطہ کریں" },
    adminPages: {
    adminPortal: {
      profileTitle: "پروفائل",
      profileSubtitle: "اپنی معلومات اور سیکیورٹی ترتیبات کا نظم کریں",
      roleSuperAdmin: "جنرل منیجر",
      roleAdmin: "منیجر",
      roleManager: "سپر وائزر",
      roleEmployee: "ملازم",
      roleClient: "عميل",
      personalInfo: "ذاتی معلومات",
      nameEn: "نام (انگریزی)",
      nameUr: "نام (اردو)",
      phone: "فون نمبر",
      department: "شعبہ",
      position: "عہدہ",
      saving: "محفوظ کیا جا رہا ہے...",
      saveChanges: "تبدیلیاں محفوظ کریں",
      refresh: "تازہ کریں",
      changePassword: "پاس ورڈ تبدیل کریں",
      currentPassword: "موجودہ پاس ورڈ",
      newPassword: "نیا پاس ورڈ",
      confirmPassword: "نیا پاس ورڈ دوبارہ درج کریں",
      passwordMismatch: "پاس ورڈ مماثل نہیں ہیں",
      updatePassword: "پاس ورڈ اپ ڈیٹ کریں",
      totpTitle: "دو مرحلہ تصدیق (2FA)",
      totpEnabled: "فعال",
      totpHint: "تصدیقی ایپ کے ذریعے اضافی سیکیورٹی شامل کریں۔",
      totpSetup: "دو مرحلہ تصدیق فعال کریں",
      totpSettingUp: "تیار کیا جا رہا ہے...",
      totpGoogleAuth: "Google Authenticator یا Authy کھولیں اور کوڈ اسکین کریں:",
      totpEnterManually: "یا کوڈ دستی طور پر درج کریں:",
      totpCodeLabel: "تصدیق کے لیے ایپ کا کوڈ درج کریں",
      totpCancel: "منسوخ",
      totpVerify: "تصدیق اور فعال کریں",
      totpVerifying: "تصدیق کی جا رہی ہے...",
      totpConfirmed: "دو مرحلہ تصدیق فعال ہو گئی",
      totpActive: "آپ کا اکاؤنٹ اضافی سیکیورٹی لیئر سے محفوظ ہے",
      totpDisable: "دو مرحلہ تصدیق بند کریں",
      totpDisableHint: "حفاظت بند کرنے کے لیے اپنے تصدیقی ایپ کا موجودہ کوڈ درج کریں:",
      totpAppCode: "ایپ کوڈ",
      totpDisableConfirm: "بند کرنے کی تصدیق",
      totpDisabling: "بند کیا جا رہا ہے...",
      passkeysTitle: "پاس کیز",
      passkeysSubtitle: "اپنے فنگر پرنٹ، چہرے یا ڈیوائس سیکیورٹی کی سے پاس ورڈ کے بغیر سائن اِن کریں۔",
      addPasskey: "پاس کی شامل کریں",
      passkeysLoading: "شامل کیا جا رہا ہے...",
      passkeysEmpty: "ابھی کوئی پاس کی رجسٹر نہیں ہوئی۔",
      passkeyAdded: "پاس کی شامل ہو گئی",
      passkeyDeleted: "حذف کر دی گئی",
      cardTitle: "ملازم کارڈ",
      cardSubtitle: "اپنا سرکاری کارڈ اور سسٹم رسائی بارکوڈ دکھائیں",
      viewCard: "کارڈ دیکھیں",
      settingsTitle: "ترتیبات",
      settingsSubtitle: "نظام کی تشکیل اور تخصیص",
      generalTab: "عام",
      emailTab: "ای میل",
      notificationsTab: "اطلاعات",
      securityTab: "سیکیورٹی",
      generalSettings: "عام ترتیبات",
      companyName: "کمپنی کا نام",
      shortDescription: "مختصر وضاحت",
      publicEmail: "عوامی ای میل",
      phoneNumber: "فون نمبر",
      address: "پتہ",
      website: "ویب سائٹ",
      emailSettings: "ای میل ترتیبات",
      senderName: "ارسال کنندہ کا نام",
      emailSignature: "ای میل دستخط (HTML)",
      serverNotice: "سرور کی ترتیبات ماحولیات متغیرات کے ذریعے منظم ہوتی ہیں۔ ای میل ٹیمپلیٹس یہاں حسبِ ضرورت بنائے جا سکتے ہیں۔",
      notificationsTitle: "اطلاعاتی ترتیبات",
      notificationNewLead: "نئی فرصت شامل ہونے پر اطلاع",
      notificationProjectUpdate: "منصوبے کے مرحلے میں تبدیلی پر اطلاع",
      notificationInvoicePaid: "انوائس ادا ہونے پر اطلاع",
      notificationOverdueInvoice: "تاخیر شدہ انوائس کے لیے تنبیہ",
      notificationContactRequest: "نئی رابطہ درخواستوں کی اطلاع",
      securityTitle: "سیکیورٹی ترتیبات",
      sessionExpiry: "سیشن میعاد (گھنٹے)",
      loginAttempts: "زیادہ سے زیادہ لاگ اِن کوششیں",
      requireTwoFactor: "ایڈمنز کے لیے دو مرحلہ تصدیق لازمی کریں",
      usersTitle: "صارفین",
      usersCount: "رجسٹرڈ صارفین",
      addUser: "صارف شامل کریں",
      searchUsers: "نام یا ای میل سے تلاش کریں...",
      userColumn: "صارف",
      roleColumn: "صلاحیت",
      statusColumn: "حالت",
      departmentColumn: "شعبہ",
      twoFactorColumn: "دو مرحلہ",
      actionsColumn: "کارروائیاں",
      userActive: "فعال",
      userInactive: "غیر فعال",
      userEnabled: "فعال",
      userDisabled: "غیر فعال",
      userSuspended: "معطل",
      userDeleted: "صارف حذف ہو گیا",
      deleteUserConfirm: "کیا آپ اس صارف کو حذف کرنا چاہتے ہیں؟",
      editUser: "صارف میں ترمیم",
      createUser: "صارف شامل کریں",
      fullName: "پورا نام",
      email: "ای میل پتہ",
      password: "پاس ورڈ",
      roleLabel: "صلاحیت",
      statusLabel: "حالت",
      employeeDashboardGreetingMorning: "صبح بخیر",
      employeeDashboardGreetingAfternoon: "شام بخیر",
      employeeDashboardGreetingEvening: "شب بخیر",
      employeeDashboardDate: "آج",
      activeProjects: "فعال منصوبے",
      completedProjects: "مکمل شدہ",
      overdueProjects: "تاخیر شدہ",
      totalProjects: "کل منصوبے",
      myProjects: "میرے منصوبے",
      viewAll: "سب دیکھیں",
      noActiveProjects: "کوئی فعال منصوبہ نہیں",
      overdue: "تاخیر شدہ",
      myCard: "میرا کارڈ",
      barcodePreview: "بارکوڈ دکھائیں",
      myProfile: "میرا پروفائل",
      accountSettings: "اکاؤنٹ ترتیبات",
      cardLabel: "ملازم کارڈ",
      stageRequest: "درخواست",
      stageReview: "جائزہ",
      stageQuotation: "قیمت کی پیشکش",
      stageContract: "معاہدہ",
      stagePayment: "ادائیگی",
      stageExecution: "عمل درآمد",
      stageClosed: "بند",
      employeeCardTitle: "ملازم کارڈ",
      employeeCardSubtitle: "آپ کا سرکاری کارڈ • شناخت کی تصدیق کے لیے بارکوڈ اسکین کریں",
      companyBrand: "اُفق برائے کاروباری حل",
      employeeCode: "ملازم کوڈ",
      loadingCard: "کارڈ لوڈ ہو رہا ہے...",
      loadError: "کارڈ کا ڈیٹا لوڈ نہیں ہو سکا",
      retry: "دوبارہ کوشش کریں",
      clickToBack: "واپس سامنے والے حصے پر جانے کے لیے دبائیں",
      clickToBarcode: "بارکوڈ دکھانے کے لیے دبائیں",
      scanToVerify: "تصدیق کے لیے اسکین کریں",
      generating: "تخلیق کیا جا رہا ہے...",
      frontSide: "سامنے والا رخ",
      showBarcode: "بارکوڈ دکھائیں",
      downloadCard: "کارڈ ڈاؤن لوڈ کریں",
      regenerateBarcode: "بارکوڈ دوبارہ بنائیں",
      regenerateConfirm: "کیا آپ بارکوڈ دوبارہ بنانا چاہتے ہیں؟\nپرانا کوڈ اب کام نہیں کرے گا۔",
      barcodeRegenerated: "بارکوڈ تجدید ہو گیا — پرانا کوڈ اب درست نہیں",
      walletSection: "Apple Wallet سیکشن",
      addToWallet: "Apple Wallet میں شامل کریں",
      walletDownload: "ملازم کارڈ ڈاؤن لوڈ کریں (.pkpass)",
      walletGenerated: "Apple Wallet کارڈ ڈاؤن لوڈ ہو گیا",
      walletError: "Apple Wallet کارڈ تیار نہیں ہو سکا",
      platformNoteIos: "ایپ خود بخود کھل جائے گی",
      platformNoteOther: "iPhone پر: ڈاؤن لوڈ فائل کھولیں تاکہ Wallet میں شامل ہو سکے",
    },
      dashboard: { morning: "صبح بخیر", afternoon: "شب بخیر", evening: "اچھی شام", subtitle: "آج OFOQ کی کارکردگی کا خلاصہ یہ ہے", smartInsight: "ذہین بصیرت", team: "ٹیم کے ارکان", activeUsers: "فعال صارفین", leads: "کاروباری مواقع", newThisMonth: "اس ماہ نئے", closeRate: "کامیابی کی شرح", activeCustomers: "فعال کلائنٹس", fromTotal: "کل میں سے", newCustomer: "نیا", activeProjects: "جاری منصوبے", overdueTasks: "تاخیر شدہ کام", completed: "مکمل", revenueThisMonth: "اس ماہ کی آمدنی", paidInvoices: "ادا شدہ بل", totalRevenue: "کل آمدنی", allPaidInvoices: "تمام ادا شدہ بل", totalProjects: "کل منصوبے", contactRequests: "رابطے کی درخواستیں", viewConsultations: "مشاورت دیکھیں", revenueCurve: "آمدنی کا گراف", lastSixMonths: "گزشتہ 6 ماہ", revenue: "آمدنی", noRevenue: "ابھی کوئی آمدنی درج نہیں", pipeline: "مواقع کی تقسیم", noLeads: "ابھی کوئی موقع نہیں", projectStages: "منصوبوں کے مراحل", recentLeads: "حالیہ مواقع", recentProjects: "جاری منصوبے", viewAll: "سب دیکھیں", overdueAlert: "تاخیر شدہ کاموں کو فوری توجہ درکار ہے", viewTasks: "کام دیکھیں" },
      customers: { title: "کلائنٹس", count: "رجسٹرڈ کلائنٹس", add: "کلائنٹ شامل کریں", search: "نام، ای میل یا کمپنی سے تلاش کریں...", empty: "ابھی کوئی کلائنٹ نہیں", edit: "ترمیم", deleteConfirm: "کلائنٹ حذف کریں؟", name: "نام", email: "ای میل", phone: "فون", company: "کمپنی", industry: "شعبہ", tier: "درجہ", status: "حالت", country: "ملک", currency: "کرنسی", active: "فعال", inactive: "غیر فعال", save: "شامل کریں", update: "اپ ڈیٹ", cancel: "منسوخ", bronze: "کانسی", silver: "چاندی", gold: "سونا", platinum: "پلاٹینم" },
      leads: { title: "کاروباری مواقع", count: "ڈیٹا بیس میں مواقع", add: "موقع شامل کریں", search: "نام، ای میل یا کمپنی سے تلاش کریں...", allStages: "تمام مراحل", empty: "کوئی کاروباری موقع نہیں", emptySub: "ٹریکنگ شروع کرنے کے لیے پہلا موقع شامل کریں", name: "نام", company: "کمپنی", stage: "مرحلہ", priority: "ترجیح", budget: "بجٹ", source: "ذریعہ", actions: "کارروائیاں", convert: "کلائنٹ میں تبدیل کریں", deleteConfirm: "کیا آپ اسے حذف کرنا چاہتے ہیں؟", deleted: "موقع حذف ہو گیا", page: "صفحہ", result: "نتائج", new: "نیا", contacted: "رابطہ ہو گیا", qualified: "اہل", proposal: "پیشکش", negotiation: "مذاکرات", won: "بند (کامیاب)", lost: "بند (ناکام)", low: "کم", medium: "درمیانی", high: "زیادہ", urgent: "فوری" },
      invoices: { title: "بل", count: "بل", new: "نیا بل", collected: "کل وصولی", pending: "زیرِ انتظار", overdue: "تاخیر شدہ بل", search: "بل نمبر یا کلائنٹ سے تلاش کریں...", allStatuses: "تمام حالات", empty: "کوئی بل نہیں", number: "بل نمبر", customer: "کلائنٹ", total: "کل", dueDate: "آخری تاریخ", status: "حالت", actions: "کارروائیاں", send: "بھیجیں", markPaid: "ادائیگی درج کریں", download: "PDF ڈاؤن لوڈ", deleteConfirm: "بل حذف کریں؟", draft: "مسودہ", sent: "بھیجا گیا", viewed: "دیکھا گیا", paid: "ادا شدہ", overdueStatus: "تاخیر شدہ", cancelled: "منسوخ" },
      contracts: { title: "معاہدے", count: "معاہدے", new: "نیا معاہدہ", total: "کل معاہدے", drafts: "مسودے", signed: "دستخط شدہ", totalValue: "کل قیمت", search: "معاہدہ نمبر سے تلاش کریں...", allStatuses: "تمام حالات", empty: "ابھی کوئی معاہدہ نہیں", number: "معاہدہ نمبر", contractTitle: "عنوان", customer: "کلائنٹ", value: "قیمت", endDate: "اختتامی تاریخ", status: "حالت", actions: "کارروائیاں", edit: "ترمیم", send: "بھیجیں", certify: "تصدیق کریں", download: "PDF ڈاؤن لوڈ", deleteConfirm: "معاہدہ حذف کریں؟", editTitle: "معاہدے میں ترمیم", titleLabel: "معاہدے کا عنوان", chooseCustomer: "کلائنٹ منتخب کریں...", currency: "کرنسی", startDate: "شروع کی تاریخ", content: "معاہدے کا متن", cancel: "منسوخ", save: "تبدیلیاں محفوظ کریں", create: "معاہدہ بنائیں", required: "درکار", draft: "مسودہ", sent: "بھیجا گیا", signedStatus: "دستخط شدہ", expired: "ختم شدہ", cancelled: "منسوخ" },
    },
    client: { portal: "کلائنٹ پورٹل", dashboard: "ڈیش بورڈ", requests: "میری درخواستیں", support: "سپورٹ", logout: "لاگ آؤٹ", client: "کلائنٹ", welcome: "خوش آمدید", dashboardSub: "اپنی درخواستیں ٹریک کریں اور ہماری ٹیم سے یہیں رابطہ کریں۔", total: "کل درخواستیں", active: "فعال درخواستیں", completed: "مکمل شدہ", newRequests: "نئی درخواستیں", newRequest: "نئی خدمت کی درخواست", supportAction: "سپورٹ سے رابطہ کریں", latest: "تازہ درخواستیں", noRequests: "ابھی کوئی درخواست نہیں", noRequestsSub: "اپنی پہلی درخواست جمع کریں اور ہماری ٹیم آپ سے رابطہ کرے گی۔", submitNow: "ابھی درخواست جمع کریں", requestCount: "درخواستیں", loading: "لوڈ ہو رہا ہے...", requestDetails: "درخواست کی تفصیلات", statusHistory: "حالت کی تاریخ", messages: "OFOQ ٹیم کے پیغامات", addNote: "ٹیم کے لیے نوٹ شامل کریں", notePlaceholder: "اپنا نوٹ یہاں لکھیں...", noteAdded: "آپ کا نوٹ شامل کر دیا گیا", noteError: "نوٹ بھیجا نہیں جا سکا", supportSub: "OFOQ ٹیم سے براہِ راست رابطہ کریں — ہم کاروباری اوقات میں جواب دیتے ہیں۔", noMessages: "ابھی کوئی پیغام نہیں", noMessagesSub: "اپنا پہلا پیغام بھیجیں اور ہماری ٹیم جلد جواب دے گی۔", supportPlaceholder: "اپنا پیغام لکھیں... (بھیجنے کے لیے Enter)", sendError: "پیغام بھیجا نہیں جا سکا", you: "آپ", invalidRequest: "درخواست نہیں ملی یا آپ کے پاس رسائی نہیں ہے۔", backRequests: "درخواستوں پر واپس", status: { new: "نئی", reviewing: "جائزے میں", approved: "منظور شدہ", in_progress: "جاری ہے", completed: "مکمل", rejected: "مسترد" }, services: { company_formation: "کمپنی کی تشکیل", legal_services: "قانونی خدمات", trademark: "ٹریڈ مارک رجسٹریشن", government_services: "سرکاری خدمات", hr_management: "انسانی وسائل کا انتظام", gov_platforms: "سرکاری پلیٹ فارم مینجمنٹ", investor_services: "سرمایہ کار خدمات", ipo_preparation: "آئی پی او تیاری" } },
    employee: { portal: "ملازم پورٹل", login: "لاگ اِن", email: "ای میل", password: "پاس ورڈ", emailRequired: "ای میل درکار ہے", passwordRequired: "پاس ورڈ درکار ہے", invalid: "لاگ اِن ممکن نہیں۔ اپنی تفصیلات چیک کریں اور دوبارہ کوشش کریں۔", twoFactor: "دو مرحلہ تصدیق", code: "تصدیقی کوڈ", verify: "تصدیق کریں", verifying: "تصدیق کی جا رہی ہے...", back: "واپس", barcode: "ملازم بارکوڈ کے ساتھ لاگ اِن", logout: "لاگ آؤٹ", employee: "ملازم", dashboard: "ڈیش بورڈ", card: "میرا کارڈ", profile: "میرا پروفائل", employeePhoto: "ملازم کی تصویر", passkey: "پاس کی یا بایومیٹرک سے لاگ اِن", passkeyHint: "نئی پاس کی بنانے کے لیے پہلے لاگ اِن کریں، پھر میرا پروفائل کھول کر پاس کی شامل کریں۔", adminLogin: "کنٹرول پینل میں لاگ اِن", or: "یا", barcodeTitle: "بارکوڈ سے لاگ اِن", cameraHint: "کیمرہ فعال کرنے کے لیے دبائیں", barcodeSubmit: "لاگ اِن" },
    adminLogin: { title: "OFOQ بزنس سلوشنز", subtitle: "OFOQ کنٹرول پینل میں سائن اِن کریں", email: "ای میل", password: "پاس ورڈ", forgot: "پاس ورڈ بھول گئے؟", login: "سائن اِن", loggingIn: "سائن اِن کیا جا رہا ہے...", emailRequired: "ای میل درکار ہے", passwordRequired: "پاس ورڈ درکار ہے", invalid: "لاگ اِن ممکن نہیں۔ اپنی تفصیلات چیک کریں اور دوبارہ کوشش کریں۔", twoFactor: "اپنا دو مرحلہ کوڈ درج کریں", code: "تصدیقی کوڈ", verify: "تصدیق کریں", verifying: "تصدیق کی جا رہی ہے...", back: "سائن اِن پر واپس جائیں", employeeBarcode: "ملازم بارکوڈ کے ساتھ سائن اِن", employeeLogin: "ملازم سائن اِن", passkeyLogin: "پاس کی کے ساتھ لاگ اِن", or: "یا", twoFactorInvalid: "تصدیقی کوڈ درست نہیں ہے۔", oauthCompleting: "سائن اِن مکمل کیا جا رہا ہے...", welcome: "خوش آمدید", successfulProjects: "کامیاب منصوبے", customerSatisfaction: "کلائنٹ اطمینان" },
    footer: { newsletter: "ہماری نیوز لیٹر میں شامل ہوں", newsletterSub: "ہماری جدید کاروباری خدمات کے بارے میں مزید جانیں", email: "آپ کا ای میل پتہ", join: "شامل ہوں", about: "ہمارے بارے میں", services: "خدمات", packages: "پیکیجز", contact: "رابطہ", story: "ہماری کہانی", vision: "ویژن اور مشن", why: "کیوں OFOQ؟", formation: "کمپنی کی تشکیل", legal: "قانونی خدمات", hr: "انسانی وسائل", government: "سرکاری پلیٹ فارم", investors: "سرمایہ کار خدمات", silver: "سلور پیکیج", gold: "گولڈ پیکیج", platinum: "پلاٹینم پیکیج", compare: "پیکیجز کا موازنہ", form: "رابطہ فارم", rights: "جملہ حقوق محفوظ ہیں۔", privacy: "رازداری کی پالیسی", terms: "شرائط و ضوابط", madeBy: "تیار کردہ", location: "جدہ — شاہ عبداللہ روڈ", description: "سعودی عرب میں آپ کا قابل اعتماد کاروباری ساتھی — جامع خدمات جو آپریشنز کو آسان اور پائیدار ترقی کو سہارا دیتی ہیں۔" },
  },
  hi: { header: { clientLogin: "क्लाइंट लॉगिन", menu: "मेन्यू", language: "भाषा" }, home: { ...en.home, hero1: "हम संभालते हैं", hero2: "आपका काम।", heroSub: "सऊदी अरब में HR, सरकारी सेवाओं, वीज़ा और कंपनी गठन के लिए आपका विश्वसनीय साथी।", request: "सेवा का अनुरोध", explore: "सेवाएँ देखें" }, services: { ...en.services, title: "सेवाएँ | OFOQ", hero1: "आपके व्यवसाय", hero2: "के लिए सेवाएँ।" }, category: { ...en.category, home: "होम", services: "सेवाएँ", request: "सेवा का अनुरोध", details: "विवरण" }, detail: { ...en.detail, home: "होम", services: "सेवाएँ", request: "सेवा का अनुरोध", how: "हम कैसे काम करते हैं" }, auth: { ...en.auth, clientTitle: "क्लाइंट पोर्टल", clientSubtitle: "अपने अनुरोधों को देखने के लिए लॉग इन करें", login: "लॉग इन", create: "नया खाता बनाएँ" }, request: { ...en.request, title: "नई सेवा का अनुरोध", steps: ["कंपनी की जानकारी", "संपर्क विवरण", "सेवा विवरण", "समीक्षा"], next: "अगला", previous: "पिछला", submit: "अनुरोध भेजें" } },
  id: {
    header: { clientLogin: "Masuk klien", menu: "Navigasi", language: "Bahasa" },
    home: {
      badge: "OFOQ / Mitra bisnis Saudi",
      hero1: "Kami menangani",
      hero2: "detail bisnis Anda.",
      heroSub: "Mitra tepercaya untuk HR, layanan pemerintah, visa, dan pendirian perusahaan di Arab Saudi.",
      request: "Ajukan layanan",
      explore: "Jelajahi layanan",
      aboutBadge: "Tentang OFOQ",
      aboutTitle1: "Mitra bisnis Anda",
      aboutTitle2: "di Arab Saudi",
      aboutDesc: "Kami menangani prosedur pemerintah, manajemen SDM, dan kebutuhan pendirian perusahaan — sehingga Anda dapat fokus sepenuhnya pada pertumbuhan bisnis Anda.",
      aboutCta: "Pelajari lebih lanjut",
      servicesBadge: "Layanan kami",
      servicesTitle1: "Layanan",
      servicesTitle2: "komprehensif",
      servicesAll: "Lihat semua layanan",
      more: "layanan lainnya",
      whyBadge: "Mengapa OFOQ?",
      whyTitle: "Kami membangun bersama Anda, langkah demi langkah",
      ctaTitle1: "Mari dorong",
      ctaTitle2: "pertumbuhan berkelanjutan Anda",
      ctaDesc: "Hubungi kami hari ini dan mulai perjalanan kemitraan yang nyata.",
      contact: "Hubungi kami",
      stats: ["Klien terlayani", "Kepuasan klien", "Spesialis ahli", "Kategori layanan"],
      reasons: [
        { title: "Tim ahli", desc: "Spesialis di setiap area layanan kami di pasar Saudi." },
        { title: "Pendampingan penuh", desc: "Kami memantau berkas Anda hingga selesai dengan pembaruan rutin." },
        { title: "Pengalaman digital", desc: "Portal klien lengkap untuk melacak permintaan Anda dari mana saja." },
        { title: "Keahlian lokal", desc: "Pemahaman mendalam tentang regulasi dan instansi pemerintah Saudi." },
      ],
    },
    services: { title: "Layanan | OFOQ", badge: "Katalog layanan OFOQ", hero1: "Layanan yang", hero2: "dibuat untuk bisnis Anda.", heroSub: "Dari pembentukan entitas hingga operasi harian, kami mengoordinasikan detail melalui satu tim dan jalur yang jelas.", view: "Lihat layanan", more: "lainnya" },
    category: { home: "Beranda", services: "Layanan", badge: "Kategori layanan", available: "layanan tersedia", service: "layanan", grid: "Tampilan kotak", list: "Daftar", details: "Detail", need: "Butuh layanan ini?", needDesc: "Hubungi kami dan kami akan membantu Anda menemukan layanan yang tepat untuk kebutuhan Anda.", request: "Ajukan layanan" },
    detail: { home: "Beranda", services: "Layanan", badge: "Detail layanan", request: "Ajukan layanan", how: "Cara kerja kami", faq: "Pertanyaan yang sering diajukan", window: "Waktu layanan", suitable: "Untuk siapa ini?", requirements: "Persyaratan", related: "Layanan lain dalam kategori ini", details: "Detail" },
     auth: { clientTitle: "Portal klien", clientSubtitle: "Masuk untuk melihat permintaan Anda", login: "Masuk", email: "Alamat email", password: "Kata sandi", forgot: "Lupa kata sandi?", noAccount: "Belum punya akun?", create: "Buat akun", registerTitle: "Buat akun Anda", registerSubtitle: "Gabung ke portal klien OFOQ", fullName: "Nama lengkap", phone: "Nomor telepon", confirmPassword: "Konfirmasi kata sandi", createAccount: "Buat akun", haveAccount: "Sudah punya akun?", invalid: "Email atau kata sandi tidak valid", forgotTitle: "Lupa kata sandi Anda?", forgotSubtitle: "Masukkan email Anda dan kami akan mengirimkan tautan pemulihan", checkEmail: "Periksa email Anda", checkEmailDesc: "Jika email ini terdaftar pada kami, Anda akan menerima tautan reset dalam beberapa menit.", spam: "Periksa folder spam jika tidak terlihat.", backLogin: "Kembali ke masuk", sendReset: "Kirim tautan pemulihan", sending: "Mengirim...", resetTitle: "Tetapkan kata sandi baru", resetSubtitle: "Pilih kata sandi yang kuat untuk akun Anda", passwordChanged: "Kata sandi berhasil diubah", redirecting: "Anda akan segera dialihkan ke halaman masuk.", goLogin: "Langsung ke masuk", newPassword: "Kata sandi baru", passwordStrength: "Kekuatan", continueGoogle: "Lanjutkan dengan Google", continueApple: "Lanjutkan dengan Apple", or: "atau", strengthVeryWeak: "Sangat lemah", strengthWeak: "Lemah", strengthAcceptable: "Cukup", strengthStrong: "Kuat", savePassword: "Simpan kata sandi baru", saving: "Menyimpan...", mismatch: "Kata sandi tidak cocok", minPassword: "Kata sandi minimal harus 8 karakter", invalidReset: "Tautan tidak valid atau sudah kedaluwarsa" },
     request: { title: "Permintaan layanan baru", subtitle: "Lengkapi formulir dan tim kami akan menghubungi Anda dalam 24–48 jam", steps: ["Informasi perusahaan", "Detail kontak", "Detail layanan", "Tinjauan"], company: "Nama perusahaan", commercialReg: "Nomor registrasi komersial (opsional)", activity: "Bidang usaha", contactEmail: "Email kontak", contactPhone: "Nomor telepon", service: "Layanan yang diminta", package: "Paket (opsional)", country: "Negara perekrutan (jika berlaku)", notes: "Catatan tambahan (opsional)", chooseService: "Pilih layanan...", chooseCountry: "Pilih negara...", next: "Berikutnya", previous: "Sebelumnya", review: "Tinjau permintaan", submit: "Kirim permintaan", submitted: "Dikirim", success: "Permintaan Anda berhasil dikirim.", error: "Permintaan tidak dapat dikirim.", required: "Wajib" },
    packages: { title: "Paket | OFOQ", badge: "Paket", heroTitle: "Bangun", heroHighlight: "jalur sukses Anda", heroSub: "Pilih paket yang sesuai dengan kebutuhan bisnis Anda.", names: ["Paket Perak", "Paket Emas", "Paket Platina"], taglines: ["Untuk startup", "Paling populer", "Untuk organisasi yang lebih besar"], badges: ["", "Paling populer", "Paling lengkap"], features: ["Kementerian Perdagangan", "Platform Salama", "Asuransi sosial", "Layanan asuransi medis", "Layanan zakat dan pajak", "Platform Absher dan Muqeem", "Layanan konsultasi", "Kementerian Media", "Platform Balady", "Layanan pengurangan beban", "Pelatihan dan pengembangan"], subscribe: "Berlangganan sekarang", compare: "Bandingkan paket", service: "Layanan", silver: "Perak", gold: "Emas", platinum: "Platina", help: "Butuh bantuan memilih?", helpTitle: "Tim kami dapat membantu", contact: "Hubungi kami" },
    adminPages: {
    adminPortal: {
      profileTitle: "Profil",
      profileSubtitle: "Kelola informasi dan pengaturan keamanan Anda",
      roleSuperAdmin: "Manajer umum",
      roleAdmin: "Manajer",
      roleManager: "Supervisor",
      roleEmployee: "Karyawan",
      roleClient: "Klien",
      personalInfo: "Informasi pribadi",
      nameEn: "Nama (Inggris)",
      nameUr: "Nama (Urdu)",
      phone: "Nomor telepon",
      department: "Departemen",
      position: "Jabatan",
      saving: "Menyimpan...",
      saveChanges: "Simpan perubahan",
      refresh: "Segarkan",
      changePassword: "Ubah kata sandi",
      currentPassword: "Kata sandi saat ini",
      newPassword: "Kata sandi baru",
      confirmPassword: "Konfirmasi kata sandi baru",
      passwordMismatch: "Kata sandi tidak cocok",
      updatePassword: "Perbarui kata sandi",
      totpTitle: "Autentikasi dua faktor (2FA)",
      totpEnabled: "Aktif",
      totpHint: "Tambahkan lapisan perlindungan ekstra dengan aplikasi autentikator.",
      totpSetup: "Aktifkan autentikasi dua faktor",
      totpSettingUp: "Menyiapkan...",
      totpGoogleAuth: "Buka Google Authenticator atau Authy dan pindai kode:",
      totpEnterManually: "Atau masukkan kode secara manual:",
      totpCodeLabel: "Masukkan kode dari aplikasi Anda untuk verifikasi",
      totpCancel: "Batal",
      totpVerify: "Konfirmasi dan aktifkan",
      totpVerifying: "Memverifikasi...",
      totpConfirmed: "Autentikasi dua faktor diaktifkan",
      totpActive: "Akun Anda dilindungi dengan lapisan keamanan tambahan",
      totpDisable: "Nonaktifkan autentikasi dua faktor",
      totpDisableHint: "Untuk menonaktifkan perlindungan, masukkan kode saat ini dari aplikasi autentikator Anda:",
      totpAppCode: "Kode aplikasi",
      totpDisableConfirm: "Konfirmasi nonaktifkan",
      totpDisabling: "Menonaktifkan...",
      passkeysTitle: "Passkey",
      passkeysSubtitle: "Masuk tanpa kata sandi menggunakan sidik jari, wajah, atau kunci keamanan perangkat Anda.",
      addPasskey: "Tambah passkey",
      passkeysLoading: "Menambahkan...",
      passkeysEmpty: "Belum ada passkey yang terdaftar.",
      passkeyAdded: "Passkey ditambahkan",
      passkeyDeleted: "Dihapus",
      cardTitle: "Kartu karyawan",
      cardSubtitle: "Tampilkan kartu resmi Anda dan barcode akses sistem",
      viewCard: "Lihat kartu",
      settingsTitle: "Pengaturan",
      settingsSubtitle: "Konfigurasi dan penyesuaian sistem",
      generalTab: "Umum",
      emailTab: "Email",
      notificationsTab: "Notifikasi",
      securityTab: "Keamanan",
      generalSettings: "Pengaturan umum",
      companyName: "Nama perusahaan",
      shortDescription: "Deskripsi singkat",
      publicEmail: "Email publik",
      phoneNumber: "Nomor telepon",
      address: "Alamat",
      website: "Situs web",
      emailSettings: "Pengaturan email",
      senderName: "Nama pengirim",
      emailSignature: "Tanda tangan email (HTML)",
      serverNotice: "Pengaturan server dikelola melalui variabel lingkungan. Template email dapat disesuaikan di sini.",
      notificationsTitle: "Pengaturan notifikasi",
      notificationNewLead: "Notifikasi saat prospek baru ditambahkan",
      notificationProjectUpdate: "Notifikasi saat tahap proyek diperbarui",
      notificationInvoicePaid: "Notifikasi saat faktur dibayar",
      notificationOverdueInvoice: "Peringatan untuk faktur terlambat",
      notificationContactRequest: "Notifikasi untuk permintaan kontak baru",
      securityTitle: "Pengaturan keamanan",
      sessionExpiry: "Masa berlaku sesi (jam)",
      loginAttempts: "Maksimum percobaan login",
      requireTwoFactor: "Wajibkan autentikasi dua faktor untuk admin",
      usersTitle: "Pengguna",
      usersCount: "pengguna terdaftar",
      addUser: "Tambah pengguna",
      searchUsers: "Cari berdasarkan nama atau email...",
      userColumn: "Pengguna",
      roleColumn: "Peran",
      statusColumn: "Status",
      departmentColumn: "Departemen",
      twoFactorColumn: "Dua faktor",
      actionsColumn: "Tindakan",
      userActive: "Aktif",
      userInactive: "Tidak aktif",
      userEnabled: "Diaktifkan",
      userDisabled: "Dinonaktifkan",
      userSuspended: "Ditangguhkan",
      userDeleted: "Pengguna dihapus",
      deleteUserConfirm: "Hapus pengguna ini?",
      editUser: "Edit pengguna",
      createUser: "Tambah pengguna",
      fullName: "Nama lengkap",
      email: "Alamat email",
      password: "Kata sandi",
      roleLabel: "Peran",
      statusLabel: "Status",
      employeeDashboardGreetingMorning: "Selamat pagi",
      employeeDashboardGreetingAfternoon: "Selamat siang",
      employeeDashboardGreetingEvening: "Selamat malam",
      employeeDashboardDate: "Hari ini",
      activeProjects: "Proyek aktif",
      completedProjects: "Selesai",
      overdueProjects: "Terlambat",
      totalProjects: "Total proyek",
      myProjects: "Proyek saya",
      viewAll: "Lihat semua",
      noActiveProjects: "Tidak ada proyek aktif",
      overdue: "Terlambat",
      myCard: "Kartu saya",
      barcodePreview: "Tampilkan barcode",
      myProfile: "Profil saya",
      accountSettings: "Pengaturan akun",
      cardLabel: "Kartu karyawan",
      stageRequest: "Permintaan",
      stageReview: "Peninjauan",
      stageQuotation: "Penawaran",
      stageContract: "Kontrak",
      stagePayment: "Pembayaran",
      stageExecution: "Pelaksanaan",
      stageClosed: "Ditutup",
      employeeCardTitle: "Kartu karyawan",
      employeeCardSubtitle: "Kartu resmi Anda • pindai barcode untuk verifikasi identitas",
      companyBrand: "Solusi Bisnis OFOQ",
      employeeCode: "Kode karyawan",
      loadingCard: "Memuat kartu...",
      loadError: "Tidak dapat memuat data kartu",
      retry: "Coba lagi",
      clickToBack: "Klik untuk kembali ke sisi depan",
      clickToBarcode: "Klik untuk menampilkan barcode",
      scanToVerify: "Pindai untuk verifikasi",
      generating: "Membuat...",
      frontSide: "Sisi depan",
      showBarcode: "Tampilkan barcode",
      downloadCard: "Unduh kartu",
      regenerateBarcode: "Buat ulang barcode",
      regenerateConfirm: "Buat ulang barcode?\nKode lama tidak akan berfungsi lagi.",
      barcodeRegenerated: "Barcode diperbarui — kode lama tidak lagi valid",
      walletSection: "Bagian Apple Wallet",
      addToWallet: "Tambahkan ke Apple Wallet",
      walletDownload: "Unduh kartu karyawan (.pkpass)",
      walletGenerated: "Kartu Apple Wallet diunduh",
      walletError: "Kartu Apple Wallet tidak dapat dibuat",
      platformNoteIos: "Aplikasi akan terbuka otomatis",
      platformNoteOther: "Di iPhone: buka file unduhan untuk menambahkannya ke Wallet",
    },
      dashboard: { morning: "Selamat pagi", afternoon: "Selamat siang", evening: "Selamat sore", subtitle: "Berikut ringkasan kinerja OFOQ hari ini", smartInsight: "Wawasan cerdas", team: "Anggota tim", activeUsers: "Pengguna aktif", leads: "Prospek bisnis", newThisMonth: "baru bulan ini", closeRate: "tingkat penutupan", activeCustomers: "Pelanggan aktif", fromTotal: "dari", newCustomer: "baru", activeProjects: "Proyek aktif", overdueTasks: "tugas terlambat", completed: "selesai", revenueThisMonth: "Pendapatan bulan ini", paidInvoices: "faktur lunas", totalRevenue: "Total pendapatan", allPaidInvoices: "semua faktur lunas", totalProjects: "Total proyek", contactRequests: "Permintaan kontak", viewConsultations: "Lihat konsultasi", revenueCurve: "Grafik pendapatan", lastSixMonths: "6 bulan terakhir", revenue: "Pendapatan", noRevenue: "Belum ada pendapatan tercatat", pipeline: "Saluran prospek", noLeads: "Belum ada prospek", projectStages: "Tahap proyek", recentLeads: "Prospek terbaru", recentProjects: "Proyek aktif", viewAll: "Lihat semua", overdueAlert: "tugas terlambat memerlukan tindak lanjut segera", viewTasks: "Lihat tugas" },
      customers: { title: "Pelanggan", count: "pelanggan terdaftar", add: "Tambah pelanggan", search: "Cari berdasarkan nama, email, atau perusahaan...", empty: "Belum ada pelanggan", edit: "Edit", deleteConfirm: "Hapus pelanggan ini?", name: "Nama", email: "Email", phone: "Telepon", company: "Perusahaan", industry: "Industri", tier: "Tingkat", status: "Status", country: "Negara", currency: "Mata uang", active: "Aktif", inactive: "Tidak aktif", save: "Tambah", update: "Perbarui", cancel: "Batal", bronze: "Perunggu", silver: "Perak", gold: "Emas", platinum: "Platina" },
      leads: { title: "Prospek bisnis", count: "prospek dalam basis data", add: "Tambah prospek", search: "Cari berdasarkan nama, email, atau perusahaan...", allStages: "Semua tahap", empty: "Belum ada prospek bisnis", emptySub: "Tambahkan prospek pertama untuk mulai melacak", name: "Nama", company: "Perusahaan", stage: "Tahap", priority: "Prioritas", budget: "Anggaran", source: "Sumber", actions: "Tindakan", convert: "Ubah menjadi pelanggan", deleteConfirm: "Yakin ingin menghapus prospek ini?", deleted: "Prospek dihapus", page: "Halaman", result: "hasil", new: "Baru", contacted: "Sudah dihubungi", qualified: "Memenuhi syarat", proposal: "Penawaran", negotiation: "Negosiasi", won: "Ditutup (berhasil)", lost: "Ditutup (gagal)", low: "Rendah", medium: "Sedang", high: "Tinggi", urgent: "Mendesak" },
      invoices: { title: "Faktur", count: "faktur", new: "Faktur baru", collected: "Total terkumpul", pending: "Tertunda", overdue: "Faktur terlambat", search: "Cari berdasarkan nomor faktur atau pelanggan...", allStatuses: "Semua status", empty: "Belum ada faktur", number: "Nomor faktur", customer: "Pelanggan", total: "Total", dueDate: "Tanggal jatuh tempo", status: "Status", actions: "Tindakan", send: "Kirim", markPaid: "Catat pembayaran", download: "Unduh PDF", deleteConfirm: "Hapus faktur ini?", draft: "Draf", sent: "Terkirim", viewed: "Dilihat", paid: "Lunas", overdueStatus: "Terlambat", cancelled: "Dibatalkan" },
      contracts: { title: "Kontrak", count: "kontrak", new: "Kontrak baru", total: "Total kontrak", drafts: "Draf", signed: "Ditandatangani", totalValue: "Total nilai", search: "Cari berdasarkan nomor kontrak...", allStatuses: "Semua status", empty: "Belum ada kontrak", number: "Nomor kontrak", contractTitle: "Judul", customer: "Pelanggan", value: "Nilai", endDate: "Tanggal berakhir", status: "Status", actions: "Tindakan", edit: "Edit", send: "Kirim", certify: "Sahkan", download: "Unduh PDF", deleteConfirm: "Hapus kontrak ini?", editTitle: "Edit kontrak", titleLabel: "Judul kontrak", chooseCustomer: "Pilih pelanggan...", currency: "Mata uang", startDate: "Tanggal mulai", content: "Isi kontrak", cancel: "Batal", save: "Simpan perubahan", create: "Buat kontrak", required: "Wajib", draft: "Draf", sent: "Terkirim", signedStatus: "Ditandatangani", expired: "Kedaluwarsa", cancelled: "Dibatalkan" },
    },
    client: { portal: "Portal klien", dashboard: "Dasbor", requests: "Permintaan saya", support: "Dukungan", logout: "Keluar", client: "Klien", welcome: "Selamat datang", dashboardSub: "Lacak permintaan Anda dan hubungi tim kami dari sini.", total: "Total permintaan", active: "Permintaan aktif", completed: "Selesai", newRequests: "Permintaan baru", newRequest: "Permintaan layanan baru", supportAction: "Hubungi dukungan", latest: "Permintaan terbaru", noRequests: "Belum ada permintaan", noRequestsSub: "Ajukan permintaan pertama Anda dan tim kami akan menghubungi Anda.", submitNow: "Ajukan permintaan sekarang", requestCount: "permintaan", loading: "Memuat...", requestDetails: "Detail permintaan", statusHistory: "Riwayat status", messages: "Pesan dari tim OFOQ", addNote: "Tambahkan catatan untuk tim", notePlaceholder: "Tulis catatan Anda di sini...", noteAdded: "Catatan Anda telah ditambahkan", noteError: "Catatan tidak dapat dikirim", supportSub: "Hubungi tim OFOQ secara langsung — kami membalas selama jam kerja.", noMessages: "Belum ada pesan", noMessagesSub: "Kirim pesan pertama Anda dan tim kami akan segera membalas.", supportPlaceholder: "Tulis pesan Anda... (Enter untuk mengirim)", sendError: "Pesan tidak dapat dikirim", you: "Anda", invalidRequest: "Permintaan tidak ditemukan atau Anda tidak memiliki akses.", backRequests: "Kembali ke permintaan", status: { new: "Baru", reviewing: "Sedang ditinjau", approved: "Disetujui", in_progress: "Sedang diproses", completed: "Selesai", rejected: "Ditolak" }, services: { company_formation: "Pendirian perusahaan", legal_services: "Layanan hukum", trademark: "Pendaftaran merek dagang", government_services: "Layanan pemerintah", hr_management: "Manajemen sumber daya manusia", gov_platforms: "Manajemen platform pemerintah", investor_services: "Layanan investor", ipo_preparation: "Persiapan IPO" } },
    employee: { portal: "Portal karyawan", login: "Masuk", email: "Alamat email", password: "Kata sandi", emailRequired: "Email wajib diisi", passwordRequired: "Kata sandi wajib diisi", invalid: "Tidak dapat masuk. Periksa detail Anda dan coba lagi.", twoFactor: "Verifikasi dua faktor", code: "Kode verifikasi", verify: "Konfirmasi", verifying: "Memverifikasi...", back: "Kembali", barcode: "Masuk dengan barcode karyawan", logout: "Keluar", employee: "Karyawan", dashboard: "Dasbor", card: "Kartu saya", profile: "Profil saya", employeePhoto: "Foto karyawan", passkey: "Masuk dengan passkey atau biometrik", passkeyHint: "Untuk mendaftarkan passkey: masuk terlebih dahulu, lalu buka Profil saya dan pilih Tambah passkey.", adminLogin: "Masuk ke panel kontrol", or: "atau", barcodeTitle: "Masuk dengan barcode", cameraHint: "Ketuk untuk mengaktifkan kamera", barcodeSubmit: "Masuk" },
    adminLogin: { title: "Solusi Bisnis OFOQ", subtitle: "Masuk ke panel kontrol OFOQ", email: "Alamat email", password: "Kata sandi", forgot: "Lupa kata sandi?", login: "Masuk", loggingIn: "Sedang masuk...", emailRequired: "Email wajib diisi", passwordRequired: "Kata sandi wajib diisi", invalid: "Tidak dapat masuk. Periksa detail Anda dan coba lagi.", twoFactor: "Masukkan kode dua faktor Anda", code: "Kode verifikasi", verify: "Konfirmasi", verifying: "Memverifikasi...", back: "Kembali ke masuk", employeeBarcode: "Masuk dengan barcode karyawan", employeeLogin: "Masuk karyawan", passkeyLogin: "Masuk dengan passkey", or: "atau", twoFactorInvalid: "Kode verifikasi salah.", oauthCompleting: "Menyelesaikan proses masuk...", welcome: "Selamat datang", successfulProjects: "Proyek berhasil", customerSatisfaction: "Kepuasan pelanggan" },
    footer: { newsletter: "Gabung ke buletin kami", newsletterSub: "Temukan lebih banyak tentang layanan bisnis canggih kami", email: "Alamat email Anda", join: "Gabung", about: "Tentang kami", services: "Layanan", packages: "Paket", contact: "Kontak", story: "Kisah kami", vision: "Visi & misi", why: "Mengapa OFOQ?", formation: "Pendirian perusahaan", legal: "Layanan hukum", hr: "Sumber daya manusia", government: "Platform pemerintah", investors: "Layanan investor", silver: "Paket Perak", gold: "Paket Emas", platinum: "Paket Platinum", compare: "Bandingkan paket", form: "Formulir kontak", rights: "Hak cipta dilindungi.", privacy: "Kebijakan privasi", terms: "Syarat & ketentuan", madeBy: "Dibuat oleh", location: "Jeddah — Jalan King Abdullah", description: "Mitra bisnis tepercaya Anda di Arab Saudi — layanan komprehensif yang menyederhanakan operasional dan mendukung pertumbuhan berkelanjutan." },
  },
  de: { header: { clientLogin: "Kundenlogin", menu: "Menü", language: "Sprache" }, home: { ...en.home, hero1: "Wir kümmern uns", hero2: "um die Details.", heroSub: "Ihr zuverlässiger Partner für HR, Behördendienste, Visa und Firmengründung in Saudi-Arabien.", request: "Service anfragen", explore: "Leistungen entdecken" }, services: { ...en.services, title: "Leistungen | OFOQ", hero1: "Leistungen für", hero2: "Ihr Unternehmen." }, category: { ...en.category, home: "Startseite", services: "Leistungen", request: "Service anfragen", details: "Details" }, detail: { ...en.detail, home: "Startseite", services: "Leistungen", request: "Service anfragen", how: "So arbeiten wir" }, auth: { ...en.auth, clientTitle: "Kundenportal", clientSubtitle: "Melden Sie sich an, um Anfragen zu verfolgen", login: "Anmelden", create: "Konto erstellen" }, request: { ...en.request, title: "Neue Serviceanfrage", steps: ["Unternehmensdaten", "Kontaktdaten", "Servicedetails", "Prüfung"], next: "Weiter", previous: "Zurück", submit: "Anfrage senden" } },
  es: { header: { clientLogin: "Acceso de clientes", menu: "Menú", language: "Idioma" }, home: { ...en.home, hero1: "Nos ocupamos", hero2: "de los detalles.", heroSub: "Su socio de confianza para RR. HH., servicios públicos, visados y constitución de empresas en Arabia Saudí.", request: "Solicitar servicio", explore: "Explorar servicios" }, services: { ...en.services, title: "Servicios | OFOQ", hero1: "Servicios para", hero2: "su empresa." }, category: { ...en.category, home: "Inicio", services: "Servicios", request: "Solicitar servicio", details: "Detalles" }, detail: { ...en.detail, home: "Inicio", services: "Servicios", request: "Solicitar servicio", how: "Cómo trabajamos" }, auth: { ...en.auth, clientTitle: "Portal de clientes", clientSubtitle: "Inicie sesión para seguir sus solicitudes", login: "Iniciar sesión", create: "Crear una cuenta" }, request: { ...en.request, title: "Nueva solicitud de servicio", steps: ["Información de la empresa", "Datos de contacto", "Detalles del servicio", "Revisión"], next: "Siguiente", previous: "Anterior", submit: "Enviar solicitud" } },
};

const clientDetailOverrides: Record<string, Partial<UiCopy["client"]>> = {
  ar: {
    statusUpdated: "تم تحديث الحالة وإشعار العميل",
    statusUpdateError: "تعذر تحديث الحالة",
    requestNotFound: "الطلب غير موجود",
    changeStatus: "تغيير الحالة",
    statusNotePlaceholder: "ملاحظة اختيارية للعميل مع تغيير الحالة",
    customerNotes: "ملاحظات العميل",
    notesTitle: "الملاحظات",
    noNotes: "لا توجد ملاحظات بعد",
    internalNote: "ملاحظة داخلية (لا تُرسل للعميل)",
    add: "إضافة",
    history: "سجل الحالات",
  },
  ur: {
    statusUpdated: "حالت اپ ڈیٹ ہو گئی اور کلائنٹ کو اطلاع دے دی گئی",
    statusUpdateError: "حالت اپ ڈیٹ نہیں ہو سکی",
    requestNotFound: "درخواست نہیں ملی",
    changeStatus: "حالت تبدیل کریں",
    statusNotePlaceholder: "حالت کی تبدیلی کے ساتھ کلائنٹ کے لیے اختیاری نوٹ",
    customerNotes: "کلائنٹ کے نوٹس",
    notesTitle: "نوٹس",
    noNotes: "ابھی کوئی نوٹ نہیں",
    internalNote: "اندرونی نوٹ (کلائنٹ کو نہیں بھیجا جائے گا)",
    add: "شامل کریں",
    history: "حالت کی تاریخ",
  },
  id: {
    statusUpdated: "Status diperbarui dan klien diberi tahu",
    statusUpdateError: "Status tidak dapat diperbarui",
    requestNotFound: "Permintaan tidak ditemukan",
    changeStatus: "Ubah status",
    statusNotePlaceholder: "Catatan opsional untuk klien saat status diubah",
    customerNotes: "Catatan klien",
    notesTitle: "Catatan",
    noNotes: "Belum ada catatan",
    internalNote: "Catatan internal (tidak dikirim ke klien)",
    add: "Tambah",
    history: "Riwayat status",
  },
};

const adminContentOverrides: Record<string, DeepPartial<UiCopy["adminPages"]>> = {
  ar: {
    leads: {
      formNew: "إضافة فرصة جديدة", formEdit: "تعديل الفرصة", required: "مطلوب", namePlaceholder: "اسم العميل المحتمل",
      service: "الخدمة المطلوبة", servicePlaceholder: "تطوير موقع، تسويق...", notes: "ملاحظات", notesPlaceholder: "ملاحظات إضافية...",
      followUp: "موعد المتابعة", website: "الموقع الإلكتروني", referral: "إحالة", socialMedia: "وسائل التواصل",
      emailSource: "البريد الإلكتروني", phoneSource: "الهاتف", event: "فعالية", other: "أخرى",
      currencySar: "ريال سعودي (SAR)", currencyUsd: "دولار (USD)", currencyAed: "درهم (AED)",
      saving: "جاري الحفظ...", update: "تحديث", cancel: "إلغاء", created: "تم إضافة الفرصة", updated: "تم تحديث الفرصة",
    },
  },
  ur: {
    projects: {
      title: "منصوبے", count: "منصوبے", table: "جدول", kanban: "کنبان", newProject: "نیا منصوبہ", search: "منصوبے تلاش کریں...", allStages: "تمام مراحل",
      project: "منصوبہ", stage: "مرحلہ", progress: "پیش رفت", dueDate: "آخری تاریخ", priority: "ترجیح", actions: "کارروائیاں", deleteConfirm: "منصوبہ حذف کریں؟", deleted: "منصوبہ حذف ہو گیا", edit: "ترمیم",
      stages: { request: "درخواست", review: "جائزہ", quotation: "قیمت کی پیشکش", contract: "معاہدہ", payment: "ادائیگی", execution: "عمل درآمد", closed: "بند" },
      priorities: { low: "کم", medium: "درمیانی", high: "زیادہ", urgent: "فوری" },
      statuses: { active: "فعال", on_hold: "روکا گیا", cancelled: "منسوخ", completed: "مکمل" },
      formNew: "نیا منصوبہ", formEdit: "منصوبے میں ترمیم", name: "منصوبے کا نام", namePlaceholder: "منصوبے کا نام", startDate: "شروع کی تاریخ", budget: "بجٹ", currency: "کرنسی", progressLabel: "پیش رفت (%)", status: "حالت", description: "تفصیل", descriptionPlaceholder: "منصوبے کی تفصیل...", cancel: "منسوخ", save: "محفوظ کریں", creating: "بنایا جا رہا ہے...", saving: "محفوظ کیا جا رہا ہے...", update: "اپ ڈیٹ", create: "منصوبہ بنائیں", created: "منصوبہ بن گیا", updated: "منصوبہ اپ ڈیٹ ہو گیا",
    },
    cms: {
      title: "مواد کا نظم", subtitle: "اپنی ویب سائٹ کے مواد کا نظم کریں", blog: "بلاگ", testimonials: "تعریفی کلمات", pages: "صفحات", newArticle: "نیا مضمون", emptyPosts: "ابھی کوئی مضمون نہیں", published: "شائع شدہ", draft: "مسودہ", deletePostConfirm: "یہ مضمون حذف کریں؟", deleted: "حذف ہو گیا", emptyTestimonials: "کوئی تعریفی کلمات نہیں", deleteTestimonialConfirm: "یہ تعریفی کلمہ حذف کریں؟", hidden: "پوشیدہ", edit: "ترمیم", noPages: "ابھی کوئی صفحہ نہیں", formNew: "نیا مضمون", formEdit: "مضمون میں ترمیم", titleAr: "عنوان (عربی) *", titleArPlaceholder: "عربی میں مضمون کا عنوان", titleEn: "عنوان (انگریزی)", titleEnPlaceholder: "Article title in English", excerpt: "خلاصہ", excerptPlaceholder: "مضمون کا مختصر خلاصہ...", content: "محتوا", contentPlaceholder: "مضمون کا مکمل متن...", coverImage: "سرورق کی تصویر کا URL", category: "زمرہ", categoryPlaceholder: "مارکیٹنگ، ٹیکنالوجی...", tags: "ٹیگز (کوما سے جدا)", tagsPlaceholder: "ٹیکنالوجی، AI، کاروبار", publishNow: "ابھی شائع کریں", cancel: "منسوخ", save: "محفوظ کریں", saving: "محفوظ کیا جا رہا ہے...", publish: "مضمون شائع کریں", update: "اپ ڈیٹ", created: "مضمون بن گیا", updated: "مضمون اپ ڈیٹ ہو گیا",
    },
    leads: {
      formNew: "نیا موقع شامل کریں", formEdit: "موقع میں ترمیم", required: "درکار", namePlaceholder: "ممکنہ کلائنٹ کا نام",
      service: "درخواست کردہ خدمت", servicePlaceholder: "ویب سائٹ ڈویلپمنٹ، مارکیٹنگ...", notes: "نوٹس", notesPlaceholder: "اضافی نوٹس...",
      followUp: "فالو اَپ کی تاریخ", website: "ویب سائٹ", referral: "حوالہ", socialMedia: "سوشل میڈیا", emailSource: "ای میل", phoneSource: "فون", event: "تقریب", other: "دیگر",
      currencySar: "سعودی ریال (SAR)", currencyUsd: "ڈالر (USD)", currencyAed: "درہم (AED)", saving: "محفوظ کیا جا رہا ہے...", update: "اپ ڈیٹ", cancel: "منسوخ", created: "موقع شامل ہو گیا", updated: "موقع اپ ڈیٹ ہو گیا",
    },
  },
  id: {
    projects: {
      title: "Proyek", count: "proyek", table: "Tabel", kanban: "Kanban", newProject: "Proyek baru", search: "Cari proyek...", allStages: "Semua tahap",
      project: "Proyek", stage: "Tahap", progress: "Kemajuan", dueDate: "Tanggal jatuh tempo", priority: "Prioritas", actions: "Tindakan", deleteConfirm: "Hapus proyek ini?", deleted: "Proyek dihapus", edit: "Edit",
      stages: { request: "Permintaan", review: "Peninjauan", quotation: "Penawaran", contract: "Kontrak", payment: "Pembayaran", execution: "Pelaksanaan", closed: "Ditutup" },
      priorities: { low: "Rendah", medium: "Sedang", high: "Tinggi", urgent: "Mendesak" },
      statuses: { active: "Aktif", on_hold: "Ditahan", cancelled: "Dibatalkan", completed: "Selesai" },
      formNew: "Proyek baru", formEdit: "Edit proyek", name: "Nama proyek", namePlaceholder: "Nama proyek", startDate: "Tanggal mulai", budget: "Anggaran", currency: "Mata uang", progressLabel: "Kemajuan (%)", status: "Status", description: "Deskripsi", descriptionPlaceholder: "Deskripsi proyek...", cancel: "Batal", save: "Simpan", creating: "Membuat...", saving: "Menyimpan...", update: "Perbarui", create: "Buat proyek", created: "Proyek dibuat", updated: "Proyek diperbarui",
    },
    cms: {
      title: "Manajemen konten", subtitle: "Kelola konten situs web Anda", blog: "Blog", testimonials: "Testimoni", pages: "Halaman", newArticle: "Artikel baru", emptyPosts: "Belum ada artikel", published: "Diterbitkan", draft: "Draf", deletePostConfirm: "Hapus artikel ini?", deleted: "Dihapus", emptyTestimonials: "Belum ada testimoni", deleteTestimonialConfirm: "Hapus testimoni ini?", hidden: "Tersembunyi", edit: "Edit", noPages: "Belum ada halaman", formNew: "Artikel baru", formEdit: "Edit artikel", titleAr: "Judul (Arab) *", titleArPlaceholder: "Judul artikel dalam bahasa Arab", titleEn: "Judul (Inggris)", titleEnPlaceholder: "Article title in English", excerpt: "Ringkasan", excerptPlaceholder: "Ringkasan singkat artikel...", content: "Konten", contentPlaceholder: "Konten artikel lengkap...", coverImage: "URL gambar sampul", category: "Kategori", categoryPlaceholder: "Pemasaran, teknologi...", tags: "Tag (dipisahkan koma)", tagsPlaceholder: "Teknologi, AI, bisnis", publishNow: "Terbitkan sekarang", cancel: "Batal", save: "Simpan", saving: "Menyimpan...", publish: "Terbitkan artikel", update: "Perbarui", created: "Artikel dibuat", updated: "Artikel diperbarui",
    },
    leads: {
      formNew: "Tambah prospek baru", formEdit: "Edit prospek", required: "Wajib", namePlaceholder: "Nama calon pelanggan",
      service: "Layanan yang diminta", servicePlaceholder: "Pengembangan situs web, pemasaran...", notes: "Catatan", notesPlaceholder: "Catatan tambahan...",
      followUp: "Tanggal tindak lanjut", website: "Situs web", referral: "Rujukan", socialMedia: "Media sosial", emailSource: "Email", phoneSource: "Telepon", event: "Acara", other: "Lainnya",
      currencySar: "Riyal Saudi (SAR)", currencyUsd: "Dolar (USD)", currencyAed: "Dirham (AED)", saving: "Menyimpan...", update: "Perbarui", cancel: "Batal", created: "Prospek ditambahkan", updated: "Prospek diperbarui",
    },
  },
};

export function getUiCopy(lang: Lang): UiCopy {
  const merge = (base: any, next: any): any => {
    if (!next || typeof next !== "object" || Array.isArray(next)) return next ?? base;
    const output = { ...base };
    for (const key of Object.keys(next)) output[key] = merge(base?.[key], next[key]);
    return output;
  };
  if (lang === "ar") return merge(merge(ar, { client: clientDetailOverrides.ar }), { adminPages: adminContentOverrides.ar }) as UiCopy;
  if (lang === "en") return en;
  const patch = overrides[lang] || {};
  return merge(merge(merge(en, patch), { client: clientDetailOverrides[lang] || {} }), { adminPages: adminContentOverrides[lang] || {} }) as UiCopy;
}