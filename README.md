# 🎓 EduCore - Course Management System (CMS)

A production-grade, full-stack **Course Management System** built with **React**, **Tailwind CSS**, **Node.js/Express**, **Prisma ORM**, and **PostgreSQL**. Designed with clean architecture, strict backend Role-Based Access Control (RBAC), robust security, and a modern responsive user experience.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [User Provisioning & Account Lifecycle Model](#-user-provisioning--account-lifecycle-model)
3. [Key Features](#-key-features)
4. [Technology Stack](#-technology-stack)
5. [System Architecture](#-system-architecture)
6. [Database Schema](#-database-schema)
7. [Authentication Strategy](#-authentication-strategy)
8. [Authorization & RBAC Strategy](#-authorization--rbac-strategy)
9. [API Documentation](#-api-documentation)
10. [Project Structure](#-project-structure)
11. [Environment Variables](#-environment-variables)
12. [Installation & Setup](#-installation--setup)
13. [Database Migrations & Initial Admin Setup](#-database-migrations--initial-admin-setup)
14. [Running Backend & Frontend](#-running-backend--frontend)
15. [Automated Testing](#-automated-testing)
16. [Security Considerations](#-security-considerations)
17. [Production Deployment Recommendations](#-production-deployment-recommendations)

---

## 🌟 Project Overview

EduCore is a multi-role institutional Course Management System that streamlines course creation, instructor assignment, curriculum browsing, and access management. The platform enforces strict role-based boundaries on both the API service layer and frontend routing across three defined roles: **Administrator**, **Faculty**, and **Student**.

---

## 👥 User Provisioning & Account Lifecycle Model

The platform follows a secure and hierarchical account-provisioning architecture:

```
┌───────────────────────────────────────────────┐
│              Initial Admin                    │  ─── Provisioned securely via Environment Variables &
│  (ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD)   │      Prisma Seed script (npx prisma db seed)
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│          Authenticated Admin Portal           │  ─── Can provision additional Admins (POST /api/admin/admins)
│             (POST /api/admin/*)               │  ─── Can provision Faculty members (POST /api/admin/faculty)
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│             Public Registration               │  ─── Open learner registration (/register, POST /api/auth/register)
│            (role = STUDENT only)              │  ─── Hardcoded on backend to STUDENT; role selection disallowed
└───────────────────────────────────────────────┘
```

### Security Rationale: Role Self-Selection Prevention
Allowing clients to self-select privileged roles during public signup is a critical vulnerability (Privilege Escalation / Mass Assignment). In EduCore:
- **Public registration** strictly requires `name`, `email`, `password`, and `confirmPassword`, and **always sets `role = STUDENT`** on the backend.
- Any client attempting to manually inject `role: "ADMIN"` or `role: "FACULTY"` into `POST /api/auth/register` has the field discarded and is registered strictly as a `STUDENT`.
- **Faculty and Administrator accounts** must be explicitly created by an authenticated Administrator via protected endpoints (`POST /api/admin/faculty` and `POST /api/admin/admins`).

---

## ✨ Key Features

- **Strict Multi-Role Access Control (RBAC)**: Backend-enforced authorization ensuring students cannot mutate courses, faculty cannot modify peer courses, and only Admins can provision privileged accounts.
- **Dedicated Admin Management Sections**: Full administrative dashboards for managing **Courses**, **Faculty**, **Students**, and **Administrators**.
- **JWT Authentication via HTTP-Only Cookies**: Resistant to XSS credential extraction, combined with SameSite cookie policies and automated session hydration (`GET /api/auth/me`).
- **Relational PostgreSQL Modeling with Prisma**: Parameterized database queries, foreign key constraints, and relational indexes on email and courseCode.
- **Full Course Lifecycle Management**: Create, Read, Update, and Delete operations with real-time keyword search, instructor filtering, and inline validation.
- **Responsive SaaS UI**: Mobile drawer navigation, adaptive tables that transform into card lists on small screens, dark-mode styling, and micro-animations.
- **Robust UI State Handling**: Animated skeleton loaders, empty states, error retry banners, toast notifications, and delete confirmation dialogs.

---

## 🛠 Technology Stack

### Frontend
- **React.js 19** with **Vite 6**
- **Tailwind CSS v4** (Modern utility styling and responsive design)
- **React Router v7** (Role guards, protected route boundaries)
- **Axios** (Configured with credentials and centralized response/error interceptors)
- **Lucide React** (Modern iconography)

### Backend
- **Node.js** & **Express.js** (RESTful API architecture)
- **Prisma ORM 6** (Type-safe database abstraction & migrations)
- **PostgreSQL 16** (Relational database with strict foreign keys & constraints)
- **Zod 3** (Schema validation for request body, params, and queries)
- **JSON Web Tokens (jsonwebtoken)** & **bcryptjs** (Password hashing & cookie sessions)
- **Helmet, CORS, Morgan, & Express Rate Limit** (Production-grade security middleware)

### Testing
- **Vitest** & **Supertest** (Automated integration and RBAC authorization test suite with 32+ passing assertions)

---

## 🏛 System Architecture

```mermaid
graph TD
  subgraph Client ["Frontend (React + Vite + Tailwind CSS)"]
    UI[Components & Role Dashboards]
    RouteGuard[ProtectedRoute & RoleGuard]
    AxiosClient[Axios Client (withCredentials)]
    UI --> RouteGuard
    RouteGuard --> AxiosClient
  end

  subgraph Server ["Backend API (Node.js + Express)"]
    CorsMW[CORS & Helmet Middleware]
    RateLimit[Rate Limiter]
    AuthMW[Auth Middleware (JWT Cookie)]
    RBAC[RBAC & Ownership Middleware]
    Validator[Zod Request Validator]
    Controllers[Controllers Layer]
    Services[Services / Business Logic]
    
    AxiosClient -->|HTTP-Only Cookie| CorsMW
    CorsMW --> RateLimit
    RateLimit --> AuthMW
    AuthMW --> RBAC
    RBAC --> Validator
    Validator --> Controllers
    Controllers --> Services
  end

  subgraph Database ["Data Layer"]
    PrismaClient[Prisma ORM Client]
    PostgreSQL[(PostgreSQL 16 DB)]
    Services --> PrismaClient
    PrismaClient --> PostgreSQL
  end
```

---

## 🗄 Database Schema

```mermaid
erDiagram
    User ||--o{ Course : "assigned (faculty)"
    User ||--o{ Course : "created (createdBy)"

    User {
        String id PK "cuid()"
        String name
        String email UK "indexed"
        String passwordHash
        Role role "ADMIN | FACULTY | STUDENT"
        DateTime createdAt
        DateTime updatedAt
    }

    Course {
        String id PK "cuid()"
        String title
        String courseCode UK "indexed"
        String description "TEXT"
        String duration
        String facultyId FK "references User.id"
        String createdById FK "references User.id"
        DateTime createdAt
        DateTime updatedAt
    }
```

---

## 🔐 Authentication Strategy

1. **Password Hashing**: Passwords hashed using `bcryptjs` with salt work factor of 10. `passwordHash` is excluded from all API responses.
2. **Session Tokens**: Signed JWT containing `{ id, email, role }` with a configurable expiration (`7d`).
3. **Cookie Storage**: Delivered via `httpOnly`, `SameSite=Lax` (or `Strict` in production), and `secure` cookies in production mode. Prevents JavaScript XSS access to tokens.
4. **Session Hydration**: On app load, `GET /api/auth/me` validates the cookie session against the database and synchronizes the frontend `AuthContext`.

---

## 🛡 Authorization & RBAC Strategy

Backend enforcement prevents unauthorized mutations regardless of client-side state:

| Role | Browse / View Details | Create Course | Update Own Course | Update Other's Course | Delete Own Course | Delete Other's Course | Create Admin/Faculty |
|---|---|---|---|---|---|---|---|
| **ADMIN** | ✅ All Courses | ✅ Any Faculty | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **FACULTY** | ✅ Own Courses Only | ✅ Self-Assigned | ✅ Allowed | ❌ 403 Forbidden | ✅ Allowed | ❌ 403 Forbidden | ❌ 403 Forbidden |
| **STUDENT** | ✅ All Available | ❌ 403 Forbidden | ❌ 403 Forbidden | ❌ 403 Forbidden | ❌ 403 Forbidden | ❌ 403 Forbidden | ❌ 403 Forbidden |

### Middleware Flow
- `authenticateUser`: Validates JWT token from cookie or Authorization header and loads user from DB.
- `requireRole(...roles)`: Verifies role access permissions.
- `requireCourseOwnership`: Verifies that Faculty callers own the course specified in the route parameters before permitting update or delete mutations.

---

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Public student registration (strictly creates `STUDENT`).
- `POST /api/auth/login` - Authenticate user credentials and set `httpOnly` cookie.
- `POST /api/auth/logout` - Clear session cookie.
- `GET  /api/auth/me` - Retrieve authenticated user profile.

### Administrator Endpoints (`requireRole(ADMIN)`)
- `POST /api/admin/admins` - Provision a new Administrator account.
- `GET  /api/admin/admins` - List all system administrators.
- `POST /api/admin/faculty` - Provision a new Faculty teaching account.
- `GET  /api/admin/faculty` - List all faculty members with assigned course counts.
- `GET  /api/admin/students` - List all registered student learners.

### Course Endpoints
- `GET    /api/courses` - List courses (scoped by role: Admin/Student see all, Faculty see assigned).
- `GET    /api/courses/:id` - Fetch single course syllabus and instructor metadata.
- `POST   /api/courses` - Create course (Admin can assign faculty; Faculty self-assigns).
- `PATCH  /api/courses/:id` - Update course (Admin or course-owning Faculty).
- `DELETE /api/courses/:id` - Delete course (Admin or course-owning Faculty).

### User & Analytics Endpoints
- `GET /api/users/faculty` - List faculty members for dropdowns.
- `GET /api/users/stats` - Fetch dashboard metrics tailored to caller role.

---

## 📁 Project Structure

```
course_management_system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models & relationships
│   │   └── seed.js             # Initial production admin provisioning script
│   ├── src/
│   │   ├── config/             # Environment & Prisma client singleton
│   │   ├── constants/          # Role constants and enums
│   │   ├── controllers/        # Express route controllers (auth, admin, course, user)
│   │   ├── middleware/         # Auth, RBAC, Validation, Error Handling, Rate Limiting
│   │   ├── routes/             # REST route definitions (/api/auth, /api/admin, /api/courses, /api/users)
│   │   ├── services/           # Business logic & Prisma query execution
│   │   ├── utils/              # ApiError, ApiResponse, JWT utilities
│   │   ├── validators/         # Zod schemas for request validation
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # Server startup script
│   ├── tests/
│   │   └── auth_rbac.test.js   # Automated Vitest + Supertest integration test suite (32 tests)
│   ├── vitest.config.js        # Vitest configuration
│   ├── .env.example            # Environment variable documentation
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute, RoleGuard
│   │   │   ├── common/         # Button, Input, Modal, ConfirmationDialog, Badge, etc.
│   │   │   ├── courses/        # CourseCard, CourseTable, CourseForm, CourseFilter
│   │   │   └── layout/         # AppLayout, Navbar, Sidebar, MobileNav
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── hooks/              # useAuth, useToast
│   │   ├── pages/
│   │   │   ├── admin/          # Admin Dashboard, Courses, Faculty, Admins, Students
│   │   │   ├── faculty/        # Faculty Dashboard, Course Table, Create, Edit
│   │   │   ├── student/        # Student Dashboard, Catalog, Course Details
│   │   │   ├── auth/           # Login, Register (Student-only)
│   │   │   └── common/         # Unauthorized (403), NotFound (404)
│   │   ├── services/           # Axios API service clients (auth, admin, course, user)
│   │   ├── utils/              # Class merging (cn), formatters
│   │   ├── App.jsx             # Route definitions & guards
│   │   ├── main.jsx            # React root with Providers
│   │   └── index.css           # Tailwind CSS v4 & custom styles
│   ├── index.html              # HTML entry with Google Fonts
│   ├── vite.config.js          # Vite config with Tailwind & Proxy
│   ├── .env.example            # Frontend environment variable documentation
│   └── package.json
│
├── .gitignore                  # Root gitignore protecting secrets
└── README.md                   # Complete system documentation
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://username:password@localhost:5432/course_management?schema=public"
JWT_SECRET="generate-a-secure-random-256-bit-string-for-production"
JWT_EXPIRES_IN="7d"
CLIENT_URL="https://your-production-domain.com"

# Initial Admin User Credentials (used by prisma/seed.js on initial deployment)
ADMIN_NAME="System Administrator"
ADMIN_EMAIL="admin@yourinstitution.edu"
ADMIN_PASSWORD="YourSecureAdminPassword123!"
```

### Frontend (`frontend/.env`)

```env
# Optional: Set if frontend is served on a separate origin from backend
VITE_API_URL="https://api.yourdomain.com/api"
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18+)
- **NPM** (v9+)
- **PostgreSQL 16**

### 1. Backend Setup
```bash
cd backend
npm install
npm run build     # Generates Prisma Client
npx prisma db push
```

### 2. Initial Admin Provisioning
Configure your initial admin credentials in `backend/.env` and execute:
```bash
npm run prisma:seed
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run build
```

---

## 🏃 Running Backend & Frontend

### Running in Development
```bash
# Start Backend (runs at http://localhost:5000)
cd backend
npm run dev

# Start Frontend (runs at http://localhost:5173)
cd frontend
npm run dev
```

### Running in Production
```bash
# Backend Production Build & Startup
cd backend
npm run build
NODE_ENV=production node src/server.js

# Frontend Production Build
cd frontend
npm run build
```

---

## 🧪 Automated Testing

The automated test suite runs 32 integration assertions using Vitest and Supertest against PostgreSQL:

```bash
cd backend
npm test
```

### Test Coverage Highlights:
- ✅ Public registration creates `STUDENT`.
- ✅ Public registration cannot create `ADMIN` (even when client explicitly sends `role: "ADMIN"`).
- ✅ Public registration cannot create `FACULTY` (even when client explicitly sends `role: "FACULTY"`).
- ✅ Admin CAN create another Admin via `POST /api/admin/admins`.
- ✅ Admin CAN create Faculty via `POST /api/admin/faculty`.
- ✅ Faculty and Students receive `403 Forbidden` attempting to create Admin or Faculty accounts.
- ✅ Unauthenticated requests to protected endpoints return `401 Unauthorized`.
- ✅ Admin has full CRUD on any course and can assign courses to Faculty.
- ✅ Faculty can create and update own courses, but receive `403 Forbidden` modifying another faculty member's course.
- ✅ Students can browse catalog courses and view syllabus details, but receive `403 Forbidden` attempting to mutate courses.
- ✅ Duplicate `courseCode` and duplicate emails return `409 Conflict`.
- ✅ Validation errors return `400 Bad Request` with structured error messages.

---

## 🔒 Security Considerations

- **Privilege Escalation Prevention**: Public registration completely ignores client role inputs and assigns `STUDENT`. Creation of `ADMIN` and `FACULTY` accounts requires authenticated Admin privileges (`POST /api/admin/*`).
- **XSS Mitigation**: Authentication tokens are never stored in `localStorage` or `sessionStorage`. They are stored in `httpOnly`, `SameSite=Lax` (or `Strict`), `secure: true` cookies.
- **SQL Injection Prevention**: Prisma ORM uses parameterized queries under the hood for all database access.
- **Rate Limiting**: Auth endpoints (`/api/auth/register`, `/api/auth/login`) are protected by `express-rate-limit` to mitigate brute force attacks.
- **Security Headers**: `helmet` is enabled to configure standard HTTP security headers.
- **Error Sanitization**: Centralized error middleware prevents internal database exceptions and stack traces from leaking to clients in production mode.

---

## 🌐 Production Deployment Recommendations

1. **HTTPS / TLS Termination**: Ensure traffic is routed over HTTPS so that `secure: true` cookies are properly delivered and protected.
2. **Reverse Proxy / Load Balancer**: Place NGINX, Cloudflare, or AWS ALB in front of Node.js with `trust proxy` enabled if needed.
3. **Database Connection Pooling**: For high-concurrency environments, configure PgBouncer with Prisma connection string pool sizing.
4. **Environment Secrets**: Store `DATABASE_URL` and `JWT_SECRET` in a secure secret manager (e.g. AWS Secrets Manager, Vault, or GitHub Actions Secrets).
