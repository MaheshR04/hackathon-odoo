# 🏢 Dayflow - Human Resource Management System (HRMS)
> *"Every workday, perfectly aligned."*

Dayflow HRMS is a modern, fullstack Human Resource Management System built for the Hackathon. It streamlines core HR operations: employee onboarding, 360° profile dossiers, live shift clocking & attendance tracking, leave applications & review workflows, itemized compensation management with PDF payslip generation, and interactive executive analytics.

---

## 🌟 Key Features & Problem Statement Mapping

### 1. Authentication & Authorization (Sec 3.1)
- **Sign Up / Registration**: Register with Employee ID, Full Name, Email, Role (`Employee` or `Admin / HR Officer`), Department, and Password.
- **Sign In**: Secure authentication with JWT token validation and role-based redirect.
- **1-Click Demo Personas**: Instant one-click test credentials for **HR Admin (`Sarah Connor`)**, **Senior Engineer (`Alex Rivera`)**, and **Lead UX Designer (`Elena Rostova`)**.

### 2. Role-Based Dashboards (Sec 3.2)
- **HR Admin Command Center**: Headcount metrics, real-time staff present count, pending leave approvals queue, and monthly payroll budget overview.
- **Employee Self-Service Portal**: Live Check-In / Check-Out timer widget, leave balance counters (Paid, Sick, Unpaid), recent activities, and quick access to pay slips.

### 3. Employee Profile Management (Sec 3.3)
- **360° Dossier View**: Personal details, Job & Organization hierarchy, Salary Structure breakdown, and Verified Documents repository.
- **Role-Sensitive Permissions**:
  - Employees can edit their contact phone, address, emergency contact, and profile avatar.
  - HR Admins have full administrative powers to modify role, designation, department, status, and compensation.
- **Documents Vault**: Upload and store appointment letters, ID cards, and signed contracts.

### 4. Live Attendance Management (Sec 3.4)
- **Live Shift Clock**: Interactive Check-in and Check-out with elapsed working hours ticker and confetti celebration.
- **Daily / Weekly Log Views**: Filter by date, department, status (`Present`, `Absent`, `Half-day`, `On Leave`), and search by employee name.
- **CSV Data Export**: Export company-wide attendance logs for payroll audit.

### 5. Leave & Time-Off Management (Sec 3.5)
- **Employee Application**: Select leave category (`Paid`, `Sick`, `Unpaid`), date range picker with automatic duration calculation, and reason.
- **Admin Review Hub**: Review pending applications, see employee notes, and **Approve or Reject** with custom HR feedback comments.
- **Instant Balance Deduction**: Automatic deduction from Paid/Sick leave balance upon approval, and auto-logging of "Leave" status in attendance records.

### 6. Payroll & Salary Management (Sec 3.6)
- **Itemized Compensation Breakdown**: Basic Salary, House Rent Allowance (HRA), Special Allowance, Performance Bonus, Provident Fund (PF), Professional Tax, and Income Tax (TDS).
- **Official PDF Payslip Generator**: Computer-generated official payslips with direct **Download PDF** and **Print** capabilities.
- **Admin Salary Structure Editor**: Real-time auto-calculation formula helper (HRA = 40% Basic, PF = 12% Basic, TDS = 8% Gross) and instant Net salary recalculation.
- **Monthly Batch Payroll Disbursement**: One-click company-wide monthly payroll generation.

### 7. Executive Business Intelligence & Analytics (Sec 6)
- **7-Day Attendance Trajectory**: Visual area chart tracking daily workforce presence.
- **Department Payroll Expenditure**: Bar chart showing monthly compensation investment per department.
- **Headcount Distribution**: Progress gauges showing staffing across Engineering, Design, HR, Sales, and Finance.
- **Leave Distribution**: Interactive Pie chart showing breakdown of Paid vs Sick vs Unpaid leaves.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (Tested on v25.2.1)
- **npm**: v9+ (Tested on v11.6.2)

### 1-Command Fullstack Start
From the project root directory:
```bash
# 1. Install all dependencies (Root, Server, and Client)
npm run install-all

# 2. Start both Backend Server (:5000) and Frontend Client (:5173) concurrently
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 🔑 Pre-Configured Test Credentials

| Persona | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Sarah Connor** | HR Admin / Officer | `sarah.admin@dayflow.com` | `admin123` |
| **Alex Rivera** | Senior Full Stack Engineer | `alex.rivera@dayflow.com` | `emp123` |
| **Elena Rostova** | Lead UI/UX Designer | `elena.rostova@dayflow.com` | `emp123` |
| **David Chen** | DevOps Architect | `david.chen@dayflow.com` | `emp123` |

*(You can also simply click the "Switch Persona" button in the Navbar or the 1-Click Demo buttons on the Login page!)*

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, JWT, bcryptjs, JSON file-backed persistent data store.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons, Recharts, jsPDF, jspdf-autotable, Canvas Confetti.
- **Architecture**: Monorepo with RESTful API separation (`/api/*`).
