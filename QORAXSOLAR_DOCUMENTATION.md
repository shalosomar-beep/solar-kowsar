# 🌞 QoraxSolar Somalia — Nidaamka Maareynta Korontada Qoraxda

> **Published:** https://qorax-solar-somaliya.base44.app
> **Version:** 1.0 — September 2026

---

## 1. Waa maxay nidaamkan?

**QoraxSolar Somalia** waa nidaamka **maareynta iyo kirada korontada qoraxda** oo lagu raacayo macaamiisha korontada qoraxda isticmaala. Nidaamku wuxuu isku xiraa dhammaan qaybaha shirkadda: macaamiisha, biilasha, isticmaalka maalinlaha ah, caafimaadka qalabka, shaqaalaha, kharashaadka, iyo ogeysiisyada.

### Astaamaha ugu muhiimsan
- ✅ Role-Based Access Control (RBAC) — 5 dooro
- ✅ Billing otomaatig ah bishiiba
- ✅ Ogeysiisyada email-ka iyo in-app
- ✅ 3 luqadood (Soomaali, English, Carabi)
- ✅ Dark/Light mode
- ✅ Realtime monitoring (qalabka + account status)
- ✅ PDF export

---

## 2. Teknolojiyada la isticmaalayo

### Frontend
| Teknooloji | Ujeeddo |
|------------|---------|
| **React 18 + Vite** | Core framework |
| **Tailwind CSS** | Styling |
| **shadcn/ui + Radix UI** | UI components |
| **Recharts** | Garaafyada |
| **lucide-react** | Icons |
| **react-router-dom** | Routing |
| **@tanstack/react-query** | Data fetching & caching |
| **react-leaflet** | Maps |
| **@hello-pangea/dnd** | Drag and drop |
| **framer-motion** | Animations |
| **jspdf + html2canvas** | PDF export |
| **react-quill** | Rich text editor |
| **date-fns + moment** | Date handling |

### Backend (Base44 Platform)
| Adeeg | Ujeeddo |
|-------|---------|
| **Base44 Auth** | Authentication (email, Google OAuth, OTP) |
| **Base44 Database** | Entity storage (18 entities) |
| **Base44 Functions** | Backend logic (2 functions) |
| **Base44 Realtime** | Live subscriptions |
| **Base44 Integrations** | Email (SendEmail), LLM (InvokeLLM), File upload, AI image/video |

---

## 3. Data Model (18 Entities)

### 3.1 Core Business Entities

#### Customer (Macmiilka)
- `full_name`, `phone`, `email`, `address`, `city`
- `status` (active / inactive / suspended)
- `meter_number`, `meter_status` (online / offline)
- `solar_panel_type`, `solar_capacity_kw`
- `installation_date`, `monthly_rate`
- `notes`

#### Billing (Biilasha)
- `customer` → Customer (relation)
- `billing_month`, `kwh_used`, `rate_per_kwh`
- `total_amount`, `status` (pending / paid / overdue / cancelled)
- `payment_date`, `payment_method` (cash / evc_plus / zaad / bank_transfer)
- `notes`

#### DailyUsage (Isticmaalka Maalinlaha Ah)
- `customer` → Customer (relation)
- `usage_date`, `kwh_used`
- `reading_type` (meter / estimated / manual)
- `notes`

#### Tariff (Qiimaynta)
- `name`, `description`, `rate_per_kwh`
- `currency` (USD / SOS), `effective_date`
- `status` (active / inactive), `is_default`

### 3.2 Solar & Equipment Entities

#### SolarData (Xogta Qoraxda)
- `usage_date`, `production_kwh`, `consumption_kwh`
- `location`, `efficiency`, `weather`
- `sun_hours`, `peak_power_kw`
- `inverter_status` (online / warning / offline)

#### Equipment (Qalabka)
- `name`, `category` (battery / inverter / solar_panel / generator / smart_meter)
- `status` (online / offline / warning)
- `location`, `battery_level`, `temperature`, `health`
- `serial_number`

#### Alarm (Ciladaha)
- `name`, `alarm_id`, `severity` (critical / warning / info)
- `type` (power_outage / cable_damage / battery_low / meter_stopped / inverter_warning / other)
- `location`, `description`, `alarm_date`, `alarm_time`
- `acknowledged` (boolean)

#### MaintenanceRequest (Codsiyada Dayactirka)
- `title`, `customer_name`
- `priority` (low / medium / high / critical)
- `status` (open / in_progress / resolved)

#### Location (Goobaha)
- `name`, `city`, `address`
- `total_panels`, `total_capacity_kw`
- `status` (active / maintenance / inactive)
- `installation_date`

### 3.3 Staff & Operations Entities

#### Staff (Farsamayaasha)
- `full_name`, `phone`, `role` (technician / operator / manager / other)
- `location`, `specialization`
- `status` (available / on_task / inactive)
- `hire_date`

#### Task (Hawlaha)
- `title`, `customer` → Customer, `location`, `technician` → Staff
- `priority` (low / medium / high / urgent)
- `status` (open / assigned / in_progress / completed)
- `due_date`

#### Vendor (Tixdeliyayaasha)
- `name`, `contact`, `phone`, `category`
- `payment_terms`

#### Expense (Kharashaadka)
- `title`, `category` (maintenance / salaries / equipment / transport / utilities / rent / other)
- `amount`, `expense_date`
- `payment_method` (cash / evc_plus / zaad / bank_transfer)
- `vendor`, `equipment_name`, `status`, `notes`

### 3.4 Communication Entities

#### Notification (Ogeysiisyada)
- `title`, `message`, `type` (billing / maintenance / general / warning)
- `customer` → Customer (optional)
- `is_read` (boolean)

#### Settings (Nidaamka)
- `company_name`, `company_phone`, `company_email`
- `currency` (USD / SOS), `rate_per_kwh`, `billing_cycle`
- `late_fee`, `grace_period_days`, `min_balance_alert`
- `evc_plus_number`, `zaad_number`

### 3.5 Security Entities

#### Employee (Shaqaalaha)
- `email`, `full_name`, `role` (admin / manager / technician / billing / customer)
- `status` (active / suspended / deactivated)
- `phone`, `department`, `hired_date`, `notes`
- **RLS**: Admin-only create/update/delete; users read own record.

#### AuditLog (Diiwaanka Audit)
- `action`, `performed_by_email`, `performed_by_name`
- `target_email`, `details`, `timestamp`
- **RLS**: Admin-only (all operations)

#### User (Built-in)
- `id`, `email`, `full_name`, `role`
- Read-only; managed via invitations.

---

## 4. Role-Based Access Control (RBAC)

### 4.1 Doorooyinka

| Door | Magaca Soomaaliga | Faahfaahin |
|------|-------------------|------------|
| `admin` | Maamulaha | Maamul buuxa ah dhammaan qaybaha |
| `manager` | Maareeyaha | Maamul buuxa ah dhammaan qaybaha |
| `technician` | Farsamaha | Qalabka, ciladaha, dayactirka, hawlaha |
| `billing` | Billing | Billing, lacagaha, macaamiisha, qiimaynta |
| `customer` | Macmiil | Akawntiisa gaarka ah uun |

### 4.2 Routes per Role

| Role | Routes (Paths) |
|------|----------------|
| `admin` / `manager` | `*` (dhammaan) |
| `technician` | `/`, `/qalabka`, `/ciladaha`, `/dayactir`, `/hawlaha`, `/ogeysiisyada` |
| `billing` | `/`, `/macaamiisha`, `/billing`, `/lacagaha`, `/qiimaynta`, `/warbixin`, `/warbixin-isticmaalka`, `/isticmaalka`, `/ogeysiisyada` |
| `customer` | `/`, `/macaamiisha`, `/billing`, `/lacagaha`, `/isticmaalka`, `/xogta-qoraxda`, `/ogeysiisyada` |

### 4.3 Shaqada Role Dispatching
- **AppLayout** wuxuu hubiyaa `canAccess(role, path)` ka hor route-ka.
- **Home** wuxuu dispatch-gareynayaa dashboard-ga ku habboon door-ka:
  - `admin/manager` → AdminDashboard
  - `billing` → BillingDashboard
  - `technician` → TechnicianDashboard
  - `customer` → CustomerDashboard
- **Sidebar** linkiyada waa la filter-gareynayaa `filterNavByRole()`.

### 4.4 Security Features
- ✅ Self-registered users → si toos ah loo qoondee `customer` (ma noqon karo admin)
- ✅ Suspended/deactivated accounts → **SuspendedScreen** + realtime force-logout
- ✅ Audit log dhammaan hawlaha admin-ka
- ✅ RLS (Row-Level Security) Employee & AuditLog

---

## 5. Authentication & Security

### 5.1 Login Methods
- **Email + Password**
- **Google OAuth**
- **OTP Verification** (register → OTP → verify → token → redirect)
- **Password Reset** (forgot-password → email link → reset-password)

### 5.2 Registration Flow
1. User fills form (name, email, phone, password)
2. `base44.auth.register({email, password})` → user unverified
3. OTP sent to email
4. User enters OTP → `verifyOtp` → `setToken`
5. `updateMe({full_name, phone})`
6. **Welcome email** sent to user (shows outstanding balance if account exists)
7. **Admin notification** sent (email + in-app Notification record)
8. Redirect to `/` → dashboard by role

### 5.3 Suspended Account Flow
- Admin suspends via `manageEmployee` function
- Realtime subscription detects status change
- User sees **SuspendedScreen**, forced logout

---

## 6. Backend Functions

### 6.1 `generateMonthlyBills`
**Type:** Scheduled (1st of every month, 00:00)
**Access:** Admin only

**Logic:**
1. Determine billing month (previous month if not provided)
2. Fetch all `DailyUsage` records in date range
3. Aggregate kWh per customer
4. Get rate: default active Tariff → Settings rate_per_kwh → fallback $0.15
5. Skip customers with existing bills for that month
6. `Billing.bulkCreate()` — create pending bills
7. `Notification.bulkCreate()` — notify each customer

**Output:**
```json
{
  "success": true,
  "billing_month": "2026-08",
  "customers_with_usage": 45,
  "bills_created": 43,
  "bills_skipped": 2,
  "rate_per_kwh": 0.15,
  "total_amount": 1287.50
}
```

### 6.2 `manageEmployee`
**Type:** HTTP endpoint
**Access:** Admin only (role check: `user.role !== 'admin'` → 403)

**Actions:**
| Action | Description |
|--------|-------------|
| `create` | Create Employee profile (checks duplicate email) |
| `update` | Update employee fields |
| `suspend` | Set status = suspended (triggers force-logout) |
| `reactivate` | Set status = active |
| `deactivate` | Set status = deactivated |
| `audit` | Log custom admin action |

All actions log to `AuditLog` entity with performer info, target, timestamp.

**Invocation:**
```javascript
await base44.functions.invoke('manageEmployee', {
  action: 'suspend',
  employeeId: '...',
  email: 'user@example.com'
});
```

---

## 7. Ogeysiisyada (Notifications)

### 7.1 Email Notifications
| Event | Recipient | Content |
|-------|-----------|---------|
| Customer registration | Customer | Welcome + outstanding balance |
| Customer registration | Admin (company_email) | New customer details |
| New bill generated | Customer | Bill amount, kWh, month |
| Overdue bill | Customer | Warning + late fee notice |
| Payment reminder | Customer | Reminder before due date |
| Employee suspended | Admin | Audit log entry |

### 7.2 In-App Notifications
- `Notification` entity (billing / maintenance / general / warning)
- Read/unread tracking
- Customer-specific or global

### 7.3 Realtime Alerts
- Equipment status changes (online → offline → warning)
- Alarm triggers
- Account status changes (suspension → force logout)

---

## 8. Luqadaha & Theme

### 8.1 Languages (3)
| Code | Language | Direction |
|------|----------|-----------|
| `so` | Soomaali (default) | LTR |
| `en` | English | LTR |
| `ar` | Carabi | RTL |

- Language stored in `localStorage`
- `document.documentElement.dir` switches to `rtl` for Arabic
- Universal toggle affects all components

### 8.2 Theme
- **Dark/Light** toggle via `ThemeProvider`
- Solar-themed background (30% opacity overlay)
- Orange accent color (`#f59e0b` / amber-500)

---

## 9. Pages & Routes (20+)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Role-based dashboard dispatcher |
| `/macaamiisha` | Customers | Manage customers |
| `/billing` | BillingPage | Invoices + auto-generate |
| `/warbixin` | FinancialReport | Financial overview |
| `/lacagaha` | Payments | Payment confirmation |
| `/kharashaadka` | Expenses | Company expenses |
| `/isticmaalka` | DailyUsage | Daily usage readings |
| `/ogeysiisyada` | Notifications | In-app notifications |
| `/goobaha` | Locations | Installation sites |
| `/boggooyinka` | SettingsPage | Company settings |
| `/isticmaalayaasha` | UsersPage | Employee management + audit |
| `/dayactir` | Maintenance | Maintenance requests |
| `/taariikhda` | HistoryPage | Usage history |
| `/qalabka` | Qalabka | Equipment dashboard |
| `/xogta-qoraxda` | XogtaQoraxda | Solar production data |
| `/ciladaha` | Alarms | Alarm management |
| `/shaqaalaha` | Shaqaalaha | Technicians management |
| `/qiimaynta` | Qiimaynta | Tariffs |
| `/tixdeliyayaasha` | Tixdeliyayaasha | Vendors & suppliers |
| `/hawlaha` | Hawlaha | Tasks & dispatch |
| `/warbixin-isticmaalka` | UsageReports | Usage charts |
| `/login` | Login | Authentication |
| `/register` | Register | Sign up |
| `/forgot-password` | ForgotPassword | Password reset request |
| `/reset-password` | ResetPassword | Password reset |

---

## 10. File Structure

```
src/
├── App.jsx                    # Router + providers
├── main.jsx                   # Entry point
├── index.css                  # Tailwind + design tokens
├── pages/                     # 20+ page components
│   ├── Home.jsx               # Role dashboard dispatcher
│   ├── Customers.jsx
│   ├── BillingPage.jsx
│   ├── Payments.jsx
│   ├── Expenses.jsx
│   ├── DailyUsage.jsx
│   ├── Notifications.jsx
│   ├── Locations.jsx
│   ├── SettingsPage.jsx
│   ├── UsersPage.jsx          # Employee + Audit
│   ├── Maintenance.jsx
│   ├── HistoryPage.jsx
│   ├── Qalabka.jsx             # Equipment
│   ├── XogtaQoraxda.jsx        # Solar data
│   ├── Alarms.jsx
│   ├── Shaqaalaha.jsx          # Staff
│   ├── Qiimaynta.jsx           # Tariffs
│   ├── Tixdeliyayaasha.jsx     # Vendors
│   ├── Hawlaha.jsx             # Tasks
│   ├── UsageReports.jsx
│   ├── FinancialReport.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   └── ResetPassword.jsx
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx       # Main shell + route guard
│   │   ├── Sidebar.jsx        # Role-filtered navigation
│   │   └── Controls.jsx       # Language + theme toggle
│   ├── dashboard/
│   │   ├── AdminDashboard.jsx
│   │   ├── BillingDashboard.jsx
│   │   ├── TechnicianDashboard.jsx
│   │   ├── CustomerDashboard.jsx
│   │   ├── StatGrid.jsx
│   │   └── StatCard.jsx
│   ├── customers/
│   │   ├── CustomerDetail.jsx
│   │   └── CustomerForm.jsx
│   ├── solar/
│   │   └── SolarCharts.jsx
│   ├── equipment/
│   │   └── EquipmentCard.jsx
│   ├── expenses/
│   │   └── EquipmentMaintenance.jsx
│   ├── ui/                     # shadcn/ui components (40+)
│   ├── ProtectedRoute.jsx
│   ├── ScrollToTop.jsx
│   ├── SuspendedScreen.jsx
│   ├── UserNotRegisteredError.jsx
│   ├── AuthLayout.jsx
│   └── GoogleIcon.jsx
├── lib/
│   ├── AuthContext.jsx         # Auth state + role detection
│   ├── i18n.jsx                # 3 languages
│   ├── permissions.js          # RBAC rules
│   ├── rbac-translations.js
│   ├── theme.jsx
│   ├── query-client.js
│   ├── app-params.js
│   ├── authReturnTo.js
│   ├── alertNotifications.js
│   ├── utils.js
│   └── PageNotFound.jsx
├── api/
│   └── base44Client.js         # Pre-initialized SDK
├── utils/
│   ├── pdfExport.js
│   └── index.ts
└── hooks/
    └── use-mobile.jsx

base44/
├── entities/                   # 18 entity schemas (.jsonc)
├── functions/
│   ├── generateMonthlyBills/   # Scheduled billing
│   │   ├── entry.ts
│   │   └── function.jsonc
│   └── manageEmployee/        # Admin employee management
│       ├── entry.ts
│       └── function.jsonc
└── config.jsonc
```

---

## 11. Integrations

### Base44 Core Integrations (Built-in)
| Integration | Usage |
|-------------|-------|
| `SendEmail` | Customer & admin notifications |
| `InvokeLLM` | AI-powered features (optional) |
| `UploadPublicFile` | File uploads |
| `UploadPrivateFile` | Private file storage |
| `CreateFileSignedUrl` | Signed download URLs |
| `ExtractDataFromUploadedFile` | CSV/Excel import |
| `GenerateImage` | AI image generation |
| `GenerateVideo` | AI video generation |
| `GenerateSpeech` | Text-to-speech |
| `TranscribeAudio` | Audio transcription |
| `SendPushNotification` | Mobile push (native app only) |

### Available Connectors (not yet connected)
Google Calendar, Gmail, Google Sheets, Slack, Notion, GitHub, Stripe, and 60+ others.

---

## 12. Dashboards per Role

### AdminDashboard
- Total customers, current power output, payment amount
- New notifications, total balance, suspended customers
- Billing records, online meters
- Solar production charts (14 days)
- System status overview
- Monthly revenue & KWh usage charts

### BillingDashboard
- Pending payments, overdue bills
- Collection rate
- Recent invoices
- Customer balances

### TechnicianDashboard
- Assigned tasks
- Equipment status
- Active alarms
- Maintenance requests

### CustomerDashboard
- Personal account info
- Outstanding bills
- Usage history
- Payment history
- Solar data (their location)
- Notifications

---

## 13. Automation

| Feature | Trigger | Action |
|---------|---------|--------|
| Monthly billing | 1st of month, 00:00 | Generate bills from usage data |
| Welcome email | Customer registration | Send email + notify admin |
| Bill notification | Bill created | Email customer |
| Overdue alert | Past due date | Email customer + late fee |
| Suspension | Admin action | Force logout via realtime |
| Equipment alert | Status change | In-app notification |

---

## 14. How to Use

### For Admins
1. Login at `/login`
2. Manage employees at `/isticmaalayaasha` (create, suspend, roles)
3. Configure company at `/boggooyinka` (rates, payment methods)
4. Set tariffs at `/qiimaynta`
5. View financial reports at `/warbixin`
6. Monitor everything from Home dashboard

### For Billing Staff
1. Manage customers at `/macaamiisha`
2. Generate bills at `/billing` (manual or auto)
3. Confirm payments at `/lacagaha`
4. Track usage at `/isticmaalka`
5. View reports at `/warbixin-isticmaalka`

### For Technicians
1. View assigned tasks at `/hawlaha`
2. Check equipment at `/qalabka`
3. Monitor alarms at `/ciladaha`
4. Handle maintenance at `/dayactir`

### For Customers
1. Register at `/register` (get customer role automatically)
2. View account at Home
3. Check bills at `/billing`
4. Make payments at `/lacagaha`
5. Track usage at `/isticmaalka`
6. View notifications at `/ogeysiisyada`

---

## 15. Tech Notes

- **SDK:** `@base44/sdk` — pre-initialized in `src/api/base44Client.js`
- **Entity operations:** `base44.entities.<Name>.list/filter/create/update/delete`
- **Function invocation:** `base44.functions.invoke('<name>', payload)`
- **Realtime:** `base44.entities.<Name>.subscribe(callback)`
- **Auth:** `base44.auth.me()`, `loginViaEmailPassword()`, `loginWithProvider()`, `register()`, `verifyOtp()`, `logout()`
- **Analytics:** `base44.analytics.track({ eventName, properties })`

---

## 16. Contact & Support

- **App URL:** https://qorax-solar-somaliya.base44.app
- **Platform:** Base44
- **Support:** Contact Base44 support via the platform

---

*Document generated: September 2026 — QoraxSolar Somalia*