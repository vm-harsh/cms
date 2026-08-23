import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout & Guards
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';

// Public & Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/common/UnauthorizedPage';
import NotFoundPage from './pages/common/NotFoundPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminCreateCoursePage from './pages/admin/AdminCreateCoursePage';
import AdminEditCoursePage from './pages/admin/AdminEditCoursePage';
import AdminFacultyPage from './pages/admin/AdminFacultyPage';
import AdminAdminsPage from './pages/admin/AdminAdminsPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyCoursesPage from './pages/faculty/FacultyCoursesPage';
import FacultyCreateCoursePage from './pages/faculty/FacultyCreateCoursePage';
import FacultyEditCoursePage from './pages/faculty/FacultyEditCoursePage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCoursesPage from './pages/student/StudentCoursesPage';
import StudentCourseDetailPage from './pages/student/StudentCourseDetailPage';

// Root route handler that redirects based on authentication & role
function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Application Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin Portal */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminCoursesPage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/courses/create"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminCreateCoursePage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/courses/:id/edit"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminEditCoursePage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/faculty"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminFacultyPage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/admins"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminAdminsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/students"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminStudentsPage />
            </RoleGuard>
          }
        />

        {/* Faculty Portal */}
        <Route
          path="/faculty/dashboard"
          element={
            <RoleGuard allowedRoles={['FACULTY']}>
              <FacultyDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/faculty/courses"
          element={
            <RoleGuard allowedRoles={['FACULTY']}>
              <FacultyCoursesPage />
            </RoleGuard>
          }
        />
        <Route
          path="/faculty/courses/create"
          element={
            <RoleGuard allowedRoles={['FACULTY']}>
              <FacultyCreateCoursePage />
            </RoleGuard>
          }
        />
        <Route
          path="/faculty/courses/:id/edit"
          element={
            <RoleGuard allowedRoles={['FACULTY']}>
              <FacultyEditCoursePage />
            </RoleGuard>
          }
        />

        {/* Student Portal */}
        <Route
          path="/student/dashboard"
          element={
            <RoleGuard allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/student/courses"
          element={
            <RoleGuard allowedRoles={['STUDENT']}>
              <StudentCoursesPage />
            </RoleGuard>
          }
        />
        <Route
          path="/student/courses/:id"
          element={
            <RoleGuard allowedRoles={['STUDENT']}>
              <StudentCourseDetailPage />
            </RoleGuard>
          }
        />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
