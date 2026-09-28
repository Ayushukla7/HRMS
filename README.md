# ⚡ HR Pulse — Enterprise HR Management System (MERN Stack)

A modern, full-stack Human Resource Management System (HRMS) built with **MongoDB, Express.js, React.js, and Node.js**, featuring an executive **Glassmorphism UI** with dual **Dark & Light Mode** support, real-time analytics, and role-based access control.

---

## 📸 Design & UI Aesthetics
- **Frosted Glass Panels & Ambient Glow**: Ultra-modern glassmorphic interface inspired by contemporary design trends.
- **Dark & Light Mood Switcher**: Seamless 1-click toggling between high-contrast Dark Glass and clean Frosted Porcelain Light themes.
- **Interactive Visualizations**: SVG waveform analytics, active workforce counters, and Recharts breakdown.
- **Fast 1-Click Demo Logins**: Instant switching between HR Administrator and Employee views for live evaluation.

---

## 🚀 Core Functional Modules

### 1. 📊 Executive Dashboard
- **Admin Hub**: Real-time workforce KPIs, attendance rate, pending leave requests, active job pipelines, and department distribution charts.
- **Employee Hub**: Today's shift punch status, hours worked this month, leave balances, recent payslips, and performance scores.

### 2. 👥 Employee Directory
- Full CRUD management of employee profiles.
- Search and multi-criteria filtering by name, email, department, employment type, and status.
- Linked User Login account creation with customizable roles and passwords.
- 360-degree Employee Profile view with personal details, banking information, attendance history, leave logs, payroll records, and performance reviews.
- **Export to CSV** feature for instant data extraction.

### 3. 🏢 Department Management
- Create and manage organizational departments with codes, locations, and annual budget tracking.
- Assign Department Heads (HODs) and track active employee headcount per department.

### 4. ⏱️ Time & Attendance Tracking
- Daily punch-in / punch-out widget with live time stamping.
- Automatic calculation of work hours and late arrival detection.
- Historical attendance logs with date range and status filters (`Present`, `Late`, `Half Day`, `Leave`, `Absent`).
- Admin manual attendance adjustment modal for retroactive corrections.

### 5. 🏖️ Leave Management & Time-Off Desk
- Dynamic quota balances for **Casual Leave**, **Sick Leave**, and **Earned Leave**.
- Employee self-service leave application form with automatic duration calculator.
- Two-tier HR approval workflow with administrative remarks and instant employee notifications.

### 6. 💳 Payroll & Compensation
- Comprehensive salary breakdown: Basic pay, HRA, Conveyance, Medical, Bonuses, PF, TDS, and Insurance.
- **1-Click Bulk Payroll Generation**: Automatically compute and disburse salaries for all active employees for any given month.
- **Official Printable Payslip Modal**: Generate professional, ready-to-print payslips with company branding.

### 7. 🎯 Recruitment & Applicant Tracking System (ATS)
- Job Requisitions manager with salary ranges, experience requirements, and status badges.
- **Interactive Kanban Pipeline**: Drag / advance candidates through stages (`Applied` → `Screening` → `Interview` → `Offered` → `Hired` / `Rejected`).
- Candidate rating, screener notes, and direct pipeline submission.

### 8. 📈 Performance & Appraisals
- Periodic appraisal reviews with **1 to 5 Star ratings** and reviewer feedback.
- Goal and OKR tracking with percentage progress bars.
- Employee reflection and acknowledgment comments workflow.

### 9. 🔔 Real-Time Notifications
- In-app notification center with unread badge counter for leave approvals, payroll payouts, and job applications.

### 10. 📊 Reports & Visual Analytics
- Attendance ratio charts, department budget vs headcount comparisons, and monthly payroll expenditure trends.

---

## 🛠️ Technology Stack

| Area | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, Morgan |
| **Database** | MongoDB with Mongoose (Local / Atlas support + zero-config In-Memory fallback) |
| **Styling** | Glassmorphism, CSS Backdrop Filters, Tailwind 4, Theme Context (Dark / Light) |

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **HR / Admin** | `admin@hrms.com` | `admin123` | Full system access |
| **Employee (Lead Engineer)** | `sarah.jenkins@hrms.com` | `employee123` | Personal employee portal |
| **Employee (Product Designer)** | `alex.rivera@hrms.com` | `employee123` | Personal employee portal |

> 💡 **Quick Login**: On the login page, you can simply click the **"Admin View"** or **"Employee View"** buttons to log in instantly with 1 click.

---

## 📦 Getting Started & Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [NPM](https://www.npmjs.com/)

### 1. Clone the repository
```bash
git clone https://github.com/Ayushukla7/HRMS.git
cd HRMS
```

### 2. Install dependencies
```bash
# Install root orchestrator packages
npm install

# Install server packages
cd server && npm install

# Install client packages
cd ../client && npm install
```

### 3. Run the complete application
From the root project directory, run:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

*(The database will automatically connect and seed initial sample data on first run!)*

---

## 🌐 Suggested REST API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user account
- `POST /api/auth/login` — Login & receive JWT token
- `GET /api/auth/me` — Get current logged-in profile
- `PUT /api/auth/profile` — Update user profile details
- `PUT /api/auth/update-password` — Change password

### Employees & Departments
- `GET /api/employees` — List all employees (supports search, department, status filters)
- `POST /api/employees` — Add employee
- `GET /api/employees/:id` — Get employee full detail profile
- `PUT /api/employees/:id` — Update employee
- `DELETE /api/employees/:id` — Delete employee
- `GET /api/departments` — List departments with headcount statistics
- `POST /api/departments` — Create department

### Attendance & Leaves
- `GET /api/attendance` — View attendance records
- `POST /api/attendance/check-in` — Clock in for today
- `POST /api/attendance/check-out` — Clock out for today
- `POST /api/attendance/manual` — Admin manual attendance correction
- `GET /api/leaves` — List leave applications
- `POST /api/leaves` — Apply for leave
- `PUT /api/leaves/:id/status` — Approve or reject leave request
- `GET /api/leaves/balance` — Get remaining leave balances

### Payroll & Recruitment
- `GET /api/payroll` — List payslips
- `POST /api/payroll` — Create individual payslip
- `POST /api/payroll/bulk-generate` — Bulk run payroll for all active employees
- `GET /api/jobs` — List job openings
- `POST /api/jobs` — Create job requisition
- `GET /api/applications` — List candidate pipeline
- `PUT /api/applications/:id/status` — Update candidate stage in Kanban

### Performance & Notifications
- `GET /api/performance` — List performance reviews
- `POST /api/performance` — Create performance review
- `POST /api/performance/:id/comments` — Employee acknowledge review
- `GET /api/notifications` — Get user notifications
- `GET /api/dashboard/stats` — Aggregate analytics data

---

## 📄 License
This project is licensed under the MIT License.
