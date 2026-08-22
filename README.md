# 🎓 EduCore - Course Management System (CMS)

A production-grade, full-stack **Course Management System** built with **React**, **Tailwind CSS**, **Node.js/Express**, **Prisma ORM**, and **PostgreSQL**. Designed and implemented for a **Founding Engineer assessment**, focusing on clean architecture, strict backend Role-Based Access Control (RBAC), robust security, and a responsive SaaS user experience.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Database Schema](#-database-schema)
6. [Authentication Strategy](#-authentication-strategy)
7. [Authorization & RBAC Strategy](#-authorization--rbac-strategy)
8. [API Documentation](#-api-documentation)
9. [Project Structure](#-project-structure)
10. [Environment Variables](#-environment-variables)
11. [Installation & Setup](#-installation--setup)
12. [Database Migrations & Seeding](#-database-migrations--seeding)
13. [Running Backend & Frontend](#-running-backend--frontend)
14. [Automated Testing](#-automated-testing)
15. [Demo Credentials](#-demo-credentials)
16. [Security Considerations](#-security-considerations)
17. [Future Enhancements](#-future-enhancements)

---

## 🌟 Project Overview

EduCore is a multi-role institutional Course Management System that streamlines course creation, instructor assignment, curriculum browsing, and access management. The platform enforces strict role-based boundaries on both the API service layer and frontend routing across three defined roles: **Administrator**, **Faculty**, and **Student**.

---

## ✨ Key Features

- **Strict Multi-Role Access Control (RBAC)**: Backend-enforced authorization ensuring students cannot mutate courses and faculty cannot modify or delete courses assigned to peers.
- **JWT Authentication via HTTP-Only Cookies**: Resistant to XSS credential extraction, combined with SameSite cookie policies and automated session renewal.
- **Relational PostgreSQL Modeling with Prisma**: Parameterized database queries, foreign key constraints, and relational indexes on email and courseCode.
- **1-Click Assessment Evaluation Switcher**: Instant role-switching and preloaded demo credentials on the login screen for rapid assessment grading.
- **Full Course Lifecycle Management**: Create, Read, Update, and Delete operations with search, instructor filtering, and inline validation.
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
- **Vitest** & **Supertest** (Automated integration and RBAC authorization test suite)

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
3. **Cookie Storage**: Delivered via `httpOnly`, `SameSite=Lax` (or `Strict` in production), and `secure` cookies. Prevents JavaScript XSS access to tokens.
4. **Session Hydration**: On app load, `GET /api/auth/me` validates the cookie session against the database and synchronizes the frontend `AuthContext`.

---

## 🛡 Authorization & RBAC Strategy

Backend enforcement prevents unauthorized mutations regardless of client-side state:

| Role | Browse / View Details | Create Course | Update Own Course | Update Other's Course | Delete Own Course | Delete Other's Course |
|---|---|---|---|---|---|---|
| **ADMIN** | ✅ All Courses | ✅ Any Faculty | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **FACULTY** | ✅ Own Courses Only | ✅ Self-Assigned | ✅ Allowed | ❌ 403 Forbidden | ✅ Allowed | ❌ 403 Forbidden |
| **STUDENT** | ✅ All Available | ❌ 403 Forbidden | ❌ 403 Forbidden | ❌ 403 Forbidden | ❌ 403 Forbidden | ❌ 403 Forbidden |

### Middleware Flow
- `authenticateUser`: Validates JWT token from cookie or Authorization header and loads user from DB.
- `requireRole(...roles)`: Verifies role access permissions.
- `requireCourseOwnership`: Verifies that Faculty callers own the course specified in the route parameters before permitting update or delete mutations.

---

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create new user account (defaults to `STUDENT`).
- `POST /api/auth/login` - Authenticate user credentials and set `httpOnly` cookie.
- `POST /api/auth/logout` - Clear session cookie.
- `GET  /api/auth/me` - Retrieve authenticated user profile.

### Course Endpoints
- `GET    /api/courses` - List courses (scoped by role: Admin/Student see all, Faculty see assigned).
- `GET    /api/courses/:id` - Fetch single course syllabus and instructor metadata.
- `POST   /api/courses` - Create course (Admin can assign faculty; Faculty self-assigns).
- `PATCH  /api/courses/:id` - Update course (Admin or course-owning Faculty).
- `DELETE /api/courses/:id` - Delete course (Admin or course-owning Faculty).

### User & Analytics Endpoints
- `GET /api/users/faculty` - List faculty members (Admin/Faculty only).
- `GET /api/users/stats` - Fetch dashboard metrics tailored to caller role.

---

## 📁 Project Structure

```
course_management_system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models & relationships
│   │   └── seed.js             # Initial database seed script
│   ├── src/
│   │   ├── config/             # Environment & Prisma client singleton
│   │   ├── constants/          # Role constants and enums
│   │   ├── controllers/        # Express route controllers
│   │   ├── middleware/         # Auth, RBAC, Validation, Error Handling, Rate Limiting
│   │   ├── routes/             # REST route definitions
│   │   ├── services/           # Business logic & Prisma query execution
│   │   ├── utils/              # ApiError, ApiResponse, JWT utilities
│   │   ├── validators/         # Zod schemas for request validation
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # Server startup script
│   ├── tests/
│   │   └── auth_rbac.test.js   # Automated Supertest integration test suite
│   ├── vitest.config.js        # Vitest configuration
│   ├── .env.example            # Environment variable documentation
│   ├── .env                    # Local environment settings
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
│   │   │   ├── admin/          # Admin Dashboard, Course Table, Create, Edit
│   │   │   ├── faculty/        # Faculty Dashboard, Course Table, Create, Edit
│   │   │   ├── student/        # Student Dashboard, Catalog, Course Details
│   │   │   ├── auth/           # Login (1-click Demo), Register
│   │   │   └── common/         # Unauthorized (403), NotFound (404)
│   │   ├── services/           # Axios API service clients
│   │   ├── utils/              # Class merging (cn), formatters
│   │   ├── App.jsx             # Route definitions & guards
│   │   ├── main.jsx            # React root with Providers
│   │   └── index.css           # Tailwind CSS v4 & custom styles
│   ├── index.html              # HTML entry with Google Fonts
│   ├── vite.config.js          # Vite config with Tailwind & Proxy
│   └── package.json
│
└── README.md                   # Complete system documentation
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/course_management?schema=public"
JWT_SECRET="cms_jwt_super_secure_key_founding_engineer_assessment_2026"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18+)
- **NPM** (v9+)
- **PostgreSQL 16** (or Docker to run PostgreSQL container)

### 1. Start PostgreSQL (Docker)
```bash
docker run -d --name course_mgmt_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=course_management \
  -p 5432:5432 postgres:16-alpine
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🏃 Running Backend & Frontend

### Start Backend API Server
```bash
cd backend
npm run dev
# Server runs at http://localhost:5000
```

### Start Frontend Client
```bash
cd frontend
npm run dev
# Client runs at http://localhost:5173
```

---

## 🧪 Automated Testing

The backend test suite verifies all 14 critical RBAC rules, authentication flows, error handlers, and constraint validations using Vitest and Supertest:

```bash
cd backend
npm test
```

### Test Coverage Highlights:
- ✅ Unauthenticated requests return `401 Unauthorized`.
- ✅ Valid login issues secure `httpOnly` cookie and hides `passwordHash`.
- ✅ Admin has full CRUD on any course and can assign courses to Faculty.
- ✅ Faculty can create and update own courses.
- ✅ Faculty **CANNOT** update or delete another faculty member's course (`403 Forbidden`).
- ✅ Students can view catalog courses and details.
- ✅ Students **CANNOT** create, update, or delete courses (`403 Forbidden`).
- ✅ Duplicate `courseCode` returns `409 Conflict`.
- ✅ Invalid payloads trigger `400 Bad Request` with structured error messages.

---

## 👥 Demo Credentials

The application includes built-in **1-Click Demo Login** buttons on the login screen for instant evaluation:

| Role | Name | Email | Password | Permissions |
|---|---|---|---|---|
| **ADMIN** | System Administrator | `admin@example.com` | `Password123!` | Full CRUD on all courses, assign instructors |
| **FACULTY** | Dr. Sarah Smith | `dr.smith@example.com` | `Password123!` | Manage own courses (`CS101`, `CS201`, `CS501`, `CS701`) |
| **FACULTY** | Prof. Michael Jones | `prof.jones@example.com` | `Password123!` | Manage own courses (`CS301`, `CS401`, `CS601`) |
| **STUDENT** | Alice Williams | `alice.student@example.com` | `Password123!` | Read-only catalog browsing & details |
| **STUDENT** | Bob Davis | `bob.student@example.com` | `Password123!` | Read-only catalog browsing & details |

---

## 🔒 Security Considerations

- **XSS Mitigation**: Authentication tokens are never stored in `localStorage` or `sessionStorage`. They are stored in `httpOnly`, `SameSite=Lax` cookies.
- **SQL Injection Prevention**: Prisma ORM uses parameterized queries under the hood for all database access.
- **Role Verification**: Roles are never trusted from frontend payload; all authorization is derived strictly from the authenticated database user attached via JWT verification middleware.
- **Rate Limiting**: Auth endpoints (`/api/auth/register`, `/api/auth/login`) are protected by `express-rate-limit` to mitigate brute force attacks.
- **Security Headers**: `helmet` is enabled to configure standard HTTP security headers.
- **Clean Errors**: Centralized error middleware prevents internal database exceptions and stack traces from leaking to clients in production mode.

---

## 🚀 Future Enhancements

- **Student Course Enrollment & Waitlists**: Allow students to register for active terms.
- **Audit Logging**: Maintain an immutable changelog of course modifications and faculty assignments.
- **Rich Media & Syllabus Uploads**: Attach PDF syllabi and course material downloads via cloud storage (S3/GCS).
- **Pagination & Sorting**: Cursor-based database pagination for high-volume catalogs.
