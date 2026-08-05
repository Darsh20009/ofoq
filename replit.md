# OFOQ Business Solutions — نظام أفق لحلول الأعمال

## نظرة عامة
نظام إداري متكامل لشركة **أفق لحلول الأعمال** (OFOQ For Business Solutions).

## الهوية البصرية
- **اللون الرئيسي:** `#2B273F` (أزرق داكن عميق)
- **اللون الثانوي:** `#33B27C` (أخضر حيوي)
- **اللون المميز:** `#E5FE04` (أصفر نيون)
- **الخط:** GE_SS_Two (عربي) + Inter (إنجليزي)
- **اللغة الافتراضية:** عربي RTL مع دعم كامل للإنجليزي

## Stack التقني
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + Sessions + WebAuthn (Passkey) + Google/Apple OAuth + 2FA (TOTP/Email/Push)
- **Real-time:** WebSocket (ws)
- **Notifications:** 3 طبقات (DB + WebSocket + Web Push VAPID)
- **Email:** SMTP via cPanel (nodemailer)
- **AI:** OpenAI (hidden — يعمل في الخلفية بشكل غير مرئي)
- **PWA:** Service Worker + Web Push

## هيكل المشروع
```
ofoq/
├── server/
│   ├── index.ts          # Entry point
│   ├── app.ts            # Express setup
│   ├── db.ts             # MongoDB connection
│   ├── ws.ts             # WebSocket server
│   ├── push.ts           # Web Push (VAPID)
│   ├── notify.ts         # Universal notification hub
│   ├── email.ts          # Email service (SMTP)
│   ├── auth.ts           # Auth utilities + middleware
│   ├── scheduler.ts      # Background jobs
│   ├── models/           # Mongoose models
│   │   ├── User.ts
│   │   ├── Lead.ts
│   │   ├── Customer.ts
│   │   ├── Project.ts
│   │   ├── Task.ts
│   │   ├── Service.ts
│   │   ├── Invoice.ts
│   │   ├── Contract.ts
│   │   ├── Page.ts       # CMS
│   │   ├── BlogPost.ts
│   │   ├── Notification.ts
│   │   └── ...
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── crm.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── services.routes.ts
│   │   ├── cms.routes.ts
│   │   ├── invoices.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── contact.routes.ts
│   │   └── push.routes.ts
│   ├── services/
│   │   └── ai.service.ts # Hidden AI engine
│   └── middleware/
│       ├── rateLimiter.ts
│       ├── upload.ts
│       └── validate.ts
├── client/               # React frontend (المرحلة الثانية)
├── public/
│   ├── sw.js             # Service Worker
│   ├── manifest.json     # PWA Manifest
│   └── icons/            # App icons
└── uploads/              # User uploads
```

## API Endpoints
| Route | Description |
|-------|-------------|
| `POST /api/auth/register` | تسجيل مستخدم جديد |
| `POST /api/auth/login` | تسجيل الدخول |
| `POST /api/auth/verify-2fa` | التحقق الثنائي |
| `GET /api/crm/leads` | جلب الفرص |
| `GET /api/crm/leads/pipeline` | خط أنابيب المبيعات |
| `GET /api/projects` | جلب المشاريع |
| `GET /api/analytics/dashboard` | إحصائيات لوحة القيادة |
| `GET /api/cms/pages/:key` | محتوى الصفحات |
| `GET /api/services` | الخدمات |
| `POST /api/contact` | نموذج التواصل |
| `GET /api/push/vapid-key` | مفتاح Web Push |

## متغيرات البيئة المطلوبة (Secrets)
- `MONGODB_URI` — رابط اتصال MongoDB Atlas
- `CPANEL_SMTP_PASS` — كلمة مرور SMTP
- `SESSION_SECRET` — سر الجلسات (مضبوط)
- `OPENAI_API_KEY` — مفتاح OpenAI (اختياري، النظام يعمل بدونه)
- `VAPID_PUBLIC_KEY` — مفتاح VAPID العام
- `VAPID_PRIVATE_KEY` — مفتاح VAPID الخاص
- `GOOGLE_CLIENT_ID` — للتسجيل عبر Google
- `GOOGLE_CLIENT_SECRET` — للتسجيل عبر Google

## تشغيل النظام
```bash
npm install
npm run dev
```

## Running on Replit

Two workflows must be running:

| Workflow | Command | Port |
|---|---|---|
| **OFOQ Backend** | `npm run dev` | 3000 |
| **OFOQ Frontend** | `npm run dev:client` | 5000 |

The **preview pane should be set to port 5000** (the Vite frontend). The frontend proxies `/api`, `/uploads`, and `/ws` to the backend on port 3000.

### Required Secrets (Replit Secrets tab)

| Secret | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string — app runs in degraded mode without it |
| `SESSION_SECRET` | Already configured |
| `CPANEL_SMTP_PASS` | SMTP password for email delivery (nodemailer) |
| `OPENAI_API_KEY` | Optional — AI features degrade gracefully without it |
| `GOOGLE_CLIENT_ID` | Optional — enables Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | Optional — enables Google OAuth login |
| `VAPID_PUBLIC_KEY` | Optional — auto-generated at startup if not set |
| `VAPID_PRIVATE_KEY` | Optional — auto-generated at startup if not set |

### First-time setup
1. Install dependencies: `npm install`
2. Add `MONGODB_URI` to Replit Secrets
3. Start both workflows above
4. (Optional) Run `npm run seed` to populate sample data

## User Preferences
- اللغة العربية أساسية في جميع الردود والكود (تعليقات عربية)
- هيكل ملفات واضح: backend/frontend/middleware/services منفصلة
- الـ AI يعمل بشكل خفي (لا أحد يعلم أنه موجود)
- حماية كاملة وأمان في كل طبقة
