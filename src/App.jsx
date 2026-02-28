import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';

// Public Pages
import Login from './pages/Login';

// Private Pages
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Materials from './pages/Materials';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Support from './pages/Support';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminCourses from './pages/Admin/AdminCourses';
import AdminMaterials from './pages/Admin/AdminMaterials';
import AdminNotifications from './pages/Admin/AdminNotifications';
import AdminSupport from './pages/Admin/AdminSupport';
import AdminUsers from './pages/Admin/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/recuperar" element={<div className="p-4 text-center">Módulo en construcción</div>} />

          {/* Protected Portal Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cursos" element={<Courses />} />
            <Route path="material" element={<Materials />} />
            <Route path="notificaciones" element={<Notifications />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="soporte" element={<Support />} />

            {/* Admin Only Routes */}
            <Route path="admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/cursos" element={
              <ProtectedRoute adminOnly>
                <AdminCourses />
              </ProtectedRoute>
            } />
            <Route path="admin/material" element={
              <ProtectedRoute adminOnly>
                <AdminMaterials />
              </ProtectedRoute>
            } />
            <Route path="admin/notificaciones" element={
              <ProtectedRoute adminOnly>
                <AdminNotifications />
              </ProtectedRoute>
            } />
            <Route path="admin/soporte" element={
              <ProtectedRoute adminOnly>
                <AdminSupport />
              </ProtectedRoute>
            } />
            <Route path="admin/usuarios" element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
