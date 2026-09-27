# 🧪 LabTrack — University Laboratory Equipment Management System

LabTrack is a web-based **University Laboratory Equipment Reservation and Management System** designed to simplify the process of browsing, reserving, issuing, returning, and maintaining laboratory equipment.

The system provides role-based access for **Students, Technical Officers, and Administrators**, while helping laboratories manage equipment availability, reservations, borrowing, maintenance, fines, and payments in a centralized system.

---

## 📌 Project Overview

In a traditional laboratory environment, equipment reservations and borrowing may involve manual requests, spreadsheets, and in-person coordination. This can lead to problems such as double-booking, unclear approval processes, inaccurate availability information, inconsistent fine calculations, and delayed maintenance reporting.

LabTrack addresses these problems by providing a centralized web application for managing laboratory equipment and reservations.

### Main Workflow

```text
Student
   │
   ▼
Select Department
   │
   ▼
Select Laboratory
   │
   ▼
Select Equipment
   │
   ▼
Create Reservation
   │
   ▼
Pending
   │
   ▼
Technical Officer Review
   │
   ├── Reject ──► Rejected
   │
   └── Approve
          │
          ▼
       Issue Equipment
          │
          ▼
       Borrowing
          │
          ▼
       Return Equipment
          │
          ├── On Time ──► Complete
          │
          └── Late ─────► Fine
                              │
                              ▼
                         Stripe Test Payment
```

---

## 👥 User Roles

LabTrack provides three main user roles.

### 🎓 Student

Students can:

* Register and log in
* Browse laboratories and equipment
* Check equipment availability
* Add equipment to a reservation cart
* Create equipment reservations
* View their reservation history
* View borrowing history
* View their own fines
* Pay outstanding fines through the Stripe test payment flow

Students cannot approve reservations, issue equipment, manage equipment, or access other students' reservations.

### 🧑‍🔧 Technical Officer

Technical Officers can:

* Manage equipment in their assigned laboratory
* Review reservations
* Approve or reject reservations
* Issue equipment
* Receive returned equipment
* Report faulty equipment
* Manage maintenance tickets
* View overdue equipment
* View fines for their assigned laboratory

Access is restricted so that a Technical Officer can only manage equipment belonging to their assigned laboratory.

### 👨‍💼 Administrator

Administrators can:

* Manage departments
* Manage laboratories
* Create and manage Technical Officer accounts
* Assign Technical Officers to laboratories
* Monitor equipment and categories
* Monitor reservations
* Monitor fines
* Monitor payments

---

## ✨ Main Features

### 🔐 Authentication & Authorization

* User registration and login
* JWT-based authentication
* Password hashing using bcrypt
* Role-based access control
* Separate permissions for Students, Technical Officers, and Administrators

### 🏢 Department & Laboratory Management

* Manage university departments
* Manage laboratories
* Assign Technical Officers to laboratories
* Organize laboratory equipment by department and laboratory

### 🧰 Equipment Management

* Add and manage laboratory equipment
* Organize equipment into categories
* Track total and available quantities
* Manage equipment according to laboratory ownership

### 📅 Reservation Management

Students can:

1. Select a laboratory
2. Select equipment
3. Specify quantities
4. Select a reservation date
5. Select start and end times
6. Submit the reservation

Reservations initially receive a **Pending** status.

Technical Officers can then approve or reject the request.

### 📦 Equipment Issuing & Returning

Equipment can only be issued after the associated reservation has been approved.

When equipment is issued:

* Available stock is reduced
* A borrowing record is created
* The reservation becomes completed

When equipment is returned:

* The returned quantity is added back to available stock
* The system checks whether the equipment was returned late

### 💰 Fine Management

If equipment is returned after the due time, the system calculates a fine based on full 24-hour overdue periods.

A delay of less than 24 hours does not create a fine.

Fines are recorded as **Unpaid** until payment is completed.

### 💳 Stripe Test Payments

LabTrack integrates with **Stripe Sandbox/Test Mode** for fine payments.

The system:

* Allows students to pay their own outstanding fines
* Uses Stripe test payment details
* Does not process real money
* Records the test payment reference
* Marks the fine as paid after successful payment

### 🔧 Maintenance Management

Technical Officers can report faulty equipment units.

When a unit is under maintenance:

* The unit is removed from available stock
* A maintenance ticket is created
* The unit remains unavailable while under repair

After the maintenance ticket is resolved, the unit is returned to available stock.

---

# 🏗️ System Architecture

LabTrack uses a **React Single-Page Application (SPA)** for the frontend and a **layered backend architecture**.

### Architecture Overview

```text
┌──────────────────────────────────────────┐
│              React Frontend              │
│        React + React Router + Axios      │
└────────────────────┬─────────────────────┘
                     │
                     │ HTTP / REST API
                     ▼
┌──────────────────────────────────────────┐
│              Express Backend             │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │             Routes                 │  │
│  └────────────────┬───────────────────┘  │
│                   ▼                      │
│  ┌────────────────────────────────────┐  │
│  │           Controllers              │  │
│  └────────────────┬───────────────────┘  │
│                   ▼                      │
│  ┌────────────────────────────────────┐  │
│  │             Services               │  │
│  └────────────────┬───────────────────┘  │
│                   ▼                      │
│  ┌────────────────────────────────────┐  │
│  │         Data Access Layer           │  │
│  └────────────────┬───────────────────┘  │
└───────────────────┼──────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ PostgreSQL / Neon DB  │
        └───────────────────────┘

                    │
                    ▼
        ┌───────────────────────┐
        │ Stripe Test/Sandbox   │
        └───────────────────────┘
```

The backend architecture was agreed during the system design phase and consists of **Routes, Controllers, Services, Data Access Layer, and PostgreSQL**.

---

# 🛠️ Technology Stack

| Layer            | Technologies                     |
| ---------------- | -------------------------------- |
| Frontend         | React, Vite, React Router, Axios |
| Backend          | Node.js, Express.js              |
| Authentication   | JWT, bcrypt                      |
| Database         | PostgreSQL                       |
| Database Hosting | Neon                             |
| Payments         | Stripe Sandbox / Test Mode       |
| Version Control  | Git & GitHub                     |

---

# 📂 Project Structure

The project is organized into frontend and backend components.

```text
LabTrack/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── data-access/
│   ├── package.json
│   └── ...
│
├── docs/
│   ├── System-Documentation.pdf
│   ├── Agile-Scrum-Development-Process.pdf
│   └── ...
│
├── .env.example
├── .gitignore
└── README.md
```

> **Note:** Adjust the folder names above if your actual repository structure uses different names.

---

# 🚀 Getting Started

## Prerequisites

Before running LabTrack locally, make sure you have installed:

* Node.js
* npm
* Git
* PostgreSQL/Neon database access

You will also need Stripe test credentials if you want to test the payment functionality.

---

## 1. Clone the Repository

```bash
git clone https://github.com/kavindu2025123/LabTrack.git
```

Move into the project:

```bash
cd LabTrack
```

---

## 2. Configure Environment Variables

Create the required `.env` files based on the provided `.env.example`.

Example:

```env
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_test_secret_key
PORT=5000
```

> Never commit your real `.env` file, database credentials, JWT secrets, or Stripe secret keys to GitHub.

---

## 3. Install Backend Dependencies

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm run dev
```

or, depending on the project's configured scripts:

```bash
npm start
```

---

## 4. Install Frontend Dependencies

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The Vite development server will provide the local frontend URL.

---

# 🔄 Equipment Availability

One of the important technical challenges addressed by LabTrack was equipment double-booking.

Instead of relying only on a static stock value, the system calculates availability dynamically by considering:

```text
Available Quantity
=
Total Quantity
- Approved but Not Yet Issued
- Currently Issued
- Quantity Under Maintenance
```

This helps prevent multiple users from reserving equipment that is already unavailable.

The team documented this as one of the major technical problems encountered during development.

---

# 🔒 Laboratory Access Control

Technical Officers are restricted to their assigned laboratory.

Before equipment is updated or deleted, the system verifies that:

```text
Officer's lab_id
        =
Equipment's lab_id
```

This prevents a Technical Officer from modifying equipment belonging to another laboratory.

---

# 🧮 Fine Calculation

The system calculates fines based on complete 24-hour overdue periods.

For example:

```text
Returned before due time
        ↓
No fine

Less than 24 hours late
        ↓
No fine

24+ hours late
        ↓
Fine calculated
```

The calculated fine is recorded as **Unpaid** until the student completes the payment process.

---

# 🔧 Maintenance Workflow

```text
Equipment Unit
      │
      ▼
Fault Reported
      │
      ▼
Maintenance Ticket Created
      │
      ▼
Unit Removed From Available Stock
      │
      ▼
Repair
      │
      ▼
Ticket Resolved
      │
      ▼
Unit Returned To Available Stock
```

Technical Officers can only manage maintenance for equipment belonging to their assigned laboratory.

---

# 🧑‍💻 Development Methodology

LabTrack was developed using **Agile and Scrum practices** over four one-week sprints.

| Sprint | Focus                   | Main Activities                                                                |
| ------ | ----------------------- | ------------------------------------------------------------------------------ |
| Week 1 | Requirements & Analysis | Gather requirements and identify roles and features                            |
| Week 2 | System Design           | Create ER, class, and use case diagrams; agree on architecture                 |
| Week 3 | Core Implementation     | Develop and integrate backend and frontend features                            |
| Week 4 | Integration & Testing   | Test workflows, fix issues, integrate the system, and prepare the presentation |

The team also used regular check-ins, divided work by feature, and aimed to produce working functionality at the end of each sprint.

---

# 🧪 Testing & Technical Challenges

During development, the team addressed several practical technical challenges.

### Overdue Fine Testing

The actual fine calculation uses a 24-hour period, which made testing slow.

During testing, the team temporarily shortened the period using a named constant and restored the actual 24-hour rule for the final system.

### Laboratory Access Control

Technical Officers needed to be restricted to their assigned laboratory.

This was handled by checking the officer's `lab_id` before equipment modifications.

### Equipment Double-Booking

Static stock information could allow multiple students to attempt to reserve the same equipment.

The team addressed this using dynamic availability calculations based on approved, issued, and maintenance quantities.

---

# 📚 Core Modules

LabTrack consists of the following major modules:

* 🔐 User Accounts
* 🏢 Departments & Laboratories
* 🧰 Equipment & Categories
* 📅 Reservations
* 📦 Issuing & Returns
* 🔧 Maintenance
* 💰 Fines & Payments

These modules cover the main laboratory equipment management workflow documented for the system.

---

# 📖 Documentation

Project documentation can be found in the `docs/` directory.

Recommended documents include:

* System Documentation
* Agile & Scrum Development Process
* ER Diagram
* Class Diagram
* Use Case Diagram
* Software Architecture Diagram
* Other project-related diagrams and reports


# 🔐 Security Notice

This repository should not contain sensitive credentials.

Do **not** commit:

```text
.env
.env.local
.env.production
```

or any file containing:

* Database passwords
* PostgreSQL connection strings with credentials
* JWT secrets
* Stripe secret keys
* Other private API credentials

Use `.env.example` to document required environment variables without exposing their values.

---

# 📌 Project Status

**Status:** Completed ✅

LabTrack includes the core workflow for:

```text
Registration
     ↓
Equipment Browsing
     ↓
Reservation
     ↓
Officer Approval
     ↓
Equipment Issuing
     ↓
Equipment Return
     ↓
Fine Calculation
     ↓
Test Payment
```

It also supports laboratory equipment management, maintenance, role-based access, and availability tracking.

---

# 📄 License

This project was developed as a **Software Engineering academic group project**.

Unless otherwise specified by the project team or institution, the source code is intended for academic and educational purposes.

---

## ⭐ LabTrack

**University Laboratory Equipment Management System**

Built with:

`React` · `Node.js` · `Express.js` · `PostgreSQL` · `JWT` · `bcrypt` · `Stripe`

---
