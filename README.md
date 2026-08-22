# 🏢 Dayflow - Human Resource Management System (HRMS)
> *"Every workday, perfectly aligned."*

🌐 **Live Production Application**: **[https://dayflow-app.onrender.com](https://dayflow-app.onrender.com)**  
📦 **GitHub Repository**: **[https://github.com/MaheshR04/hackathon-odoo.git](https://github.com/MaheshR04/hackathon-odoo.git)**

---

Dayflow HRMS is a modern, fullstack Human Resource Management System. It streamlines core HR operations: employee onboarding, 360° profile dossiers, account activation & deactivation controls, live shift clocking & attendance tracking, leave applications & HR review workflows, itemized compensation management with PDF payslip generation, 2-step OTP password recovery, and interactive executive analytics.

---

## 📁 Complete Project Structure

```text
oodo/
├── client/                           # Frontend React + TypeScript + Vite Application
│   ├── src/
│   │   ├── components/               # UI Components & Modals
│   │   │   ├── AddEmployeeModal.tsx   # Employee Onboarding Form (Role-Restricted)
│   │   │   ├── EditProfileModal.tsx  # Profile Dossier Editor
│   │   │   ├── LeaveApplyModal.tsx   # Time-Off Request Form
│   │   │   ├── LeaveReviewModal.tsx  # HR Approval/Rejection Modal
│   │   │   ├── LiveClockWidget.tsx   # Live Shift Clock-In/Out Ticker
│   │   │   ├── Navbar.tsx            # Header with Theme Toggle & Click-Outside Menu
│   │   │   ├── NotificationDrawer.tsx# Security & Activity Notifications
│   │   │   ├── PayslipModal.tsx      # PDF Payslip Generator
│   │   │   ├── SalaryStructureModal.tsx # HR Salary Adjustment Modal
│   │   │   └── Sidebar.tsx           # Navigation Drawer
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Authentication & User Session Provider
│   │   ├── pages/
│   │   │   ├── AnalyticsPage.tsx     # Business Intelligence & Charts
│   │   │   ├── AttendancePage.tsx    # Shift Logs & CSV Export
│   │   │   ├── AuthPage.tsx          # Sign In, Sign Up, & 2-Step OTP Recovery
│   │   │   ├── DashboardPage.tsx     # Role-Based Workspaces
│   │   │   ├── EmployeesPage.tsx     # Employee Directory & Activation Toggle
│   │   │   ├── LeavesPage.tsx        # Time-Off Approvals & History
│   │   │   ├── PayrollPage.tsx       # Salary Disbursement & Batch Payroll
│   │   │   └── ProfilePage.tsx       # 360° Dossier & Account Deactivation
│   │   ├── services/
│   │   │   └── api.ts                # REST Client API Service
│   │   ├── types/                    # TypeScript Data Interfaces
│   │   ├── index.css                 # Dark / Light Mode CSS System
│   │   └── main.tsx                  # App Entry Point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                           # Backend Node.js + Express REST API Engine
│   ├── data/
│   │   └── dayflow_db.json           # Persistent Atomic Data Storage
│   ├── src/
│   │   ├── db/
│   │   │   └── store.js              # High-Concurrency Debounced DataStore
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT Token Verification & RBAC Guards
│   │   ├── routes/
│   │   │   ├── analytics.js          # Executive Metrics Routes
│   │   │   ├── attendance.js         # Live Shift & Ticker Endpoints
│   │   │   ├── auth.js               # Sign In, Sign Up, OTP & Admin Checks
│   │   │   ├── employees.js          # Employee Dossier & Status Routes
│   │   │   ├── leaves.js             # Time-Off Applications & Approvals
│   │   │   ├── notifications.js      # System & Security Alerts
│   │   │   └── payroll.js            # Salary Structures & Payslip Records
│   │   └── index.js                  # Express Server & Socket Retry Listeners
│   └── package.json
│
├── docker/                           # Docker Containerization Suite
│   ├── Dockerfile                    # Multi-Stage Node 20 Container Image
│   ├── docker-compose.yml            # Docker Compose Orchestrator
│   ├── env.example                   # Environment Variables Template
│   ├── auth_config.json              # Authentication & DB Storage Specifications
│   └── README.md                     # Container Management Documentation
│
├── Dockerfile                        # Root Dockerfile
├── docker-compose.yml                # Root Docker Compose Manifest
├── package.json                      # Monorepo Scripts
└── README.md                         # Architecture Documentation
```

---

## 🌟 Key Features

### 1. **Single HR Admin Role & Account Security**
- **Sole HR Admin**: Assigned exclusively to **`HR` (`hr@gmail.com`)**.
- **Registration Safeguard**: When an HR Admin account exists, duplicate HR account creation is automatically disabled across Registration (`AuthPage.tsx`) and Onboarding (`AddEmployeeModal.tsx`).
- **Account Activation / Deactivation**: HR Admin can activate or deactivate any employee account directly from `ProfilePage.tsx` or `EmployeesPage.tsx`. Deactivated accounts are blocked on login with **HTTP 403 Forbidden**.

### 2. **2-Step Password Recovery (Forgot Password & Email OTP)**
- **Password Reset Request**: Users enter their registered email address or Employee ID on the login screen.
- **6-Digit OTP Verification**: Generates a 15-minute valid 6-digit OTP code dispatched to the registered email address and system notifications.
- **Secure Password Update**: Encrypts new passwords using `bcryptjs` (10 salt rounds) and updates data storage atomically.

### 3. **Dark / Light Mode Theme System**
- High-contrast, modern Dark / Light mode toggle in `Navbar.tsx` with `localStorage` persistence.
- Premium CSS variable system in `client/src/index.css` supporting readable text, glowing inputs, crisp borders, and soft shadows.

### 4. **Live Shift Clock & Attendance Management**
- Interactive Check-In / Check-Out ticker with precise timestamp synchronization and working hours calculation.
- Daily/weekly attendance logs with date filtering, status tags (`Present`, `Absent`, `Half-day`, `On Leave`), and CSV audit export.

### 5. **Time-Off Applications & HR Review Hub**
- Category selection (`Paid`, `Sick`, `Unpaid`), automatic duration calculation, and instant balance deduction upon HR approval.
- Admin Review Hub for one-click **Approve / Reject** decisions with custom HR feedback.

### 6. **Itemized Payroll & Official PDF Payslip Generator**
- Itemized salary components: Basic, HRA (40%), Special Allowance, Bonus, PF (12%), Professional Tax, and Income Tax TDS (8%).
- Computer-generated official PDF payslips with direct **Download PDF** and **Print** capabilities.

### 7. **High-Concurrency Performance & Docker Support**
- Non-blocking 100ms debounced atomic file persistence (`fs.writeFile` to `.tmp` + `fs.rename`) handling 1,000+ parallel API calls with 0% error rate.
- Multi-stage Docker containerization with volume mount persistence (`./server/data:/app/server/data`).

---

## 🔑 Pre-Configured Test Credentials

| Persona | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **HR Admin** | HR Admin / Executive | `hr@gmail.com` | `password123` |
| **Alex Rivera** | Senior Full Stack Engineer | `alex.rivera@dayflow.com` | `password123` |
| **Elena Rostova** | Lead UI/UX Designer | `elena.rostova@dayflow.com` | `password123` |
| **David Chen** | DevOps & Cloud Architect | `david.chen@dayflow.com` | `password123` |

---

## 🚀 Quick Start Guide

### Option 1: Local Monorepo Setup (Node.js)

```bash
# 1. Install all dependencies (Root, Server, and Client)
npm run install-all

# 2. Start both Backend Server (:5000) and Frontend Client (:5173) concurrently
npm run dev
```

Open your browser at **`http://localhost:5173`** (or **`http://localhost:5000`**).

---

### Option 2: Docker Container Deployment

```bash
# Build and launch fullstack application with data volume persistence
docker-compose up -d --build

# View live container logs
docker-compose logs -f

# Stop container
docker-compose down
```

Open your browser at **`http://localhost:5000`**.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, JWT, bcryptjs, debounced atomic JSON DataStore.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, jsPDF, jspdf-autotable, Canvas Confetti.
- **DevOps**: Docker, Docker Compose, Multi-Stage Container Builds, Render Deployment.
