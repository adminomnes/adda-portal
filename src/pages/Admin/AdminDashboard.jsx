import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Files,
  Bell,
  LifeBuoy,
  Users,
  ChevronRight
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminModules = [
    { title: 'Cursos', description: 'Gestionar oferta académica', icon: BookOpen, path: '/admin/cursos', color: 'magenta' },
    { title: 'Material', description: 'Cargar recursos de estudio', icon: Files, path: '/admin/material', color: 'calipso' },
    { title: 'Notificaciones', description: 'Enviar avisos a alumnos', icon: Bell, path: '/admin/notificaciones', color: 'magenta' },
    { title: 'Soporte', description: 'Responder tickets técnicos', icon: LifeBuoy, path: '/admin/soporte', color: 'calipso' },
    { title: 'Usuarios', description: 'Gestionar roles y alumnos', icon: Users, path: '/admin/usuarios', color: 'magenta' },
  ];

  return (
    <div className="admin-dashboard">
      <header className="page-header">
        <h1>Centro de Administración</h1>
        <p>Gestiona todos los aspectos de ADDA Portal desde un solo lugar.</p>
      </header>
      <div className="admin-grid">
        {adminModules.map((mod) => (
          <div key={mod.path} className="admin-card card" onClick={() => navigate(mod.path)}>
            <div className={`admin-icon ${mod.color}`}>
              <mod.icon size={28} />
            </div>
            <div className="admin-info">
              <h3>{mod.title}</h3>
              <p>{mod.description}</p>
            </div>
            <ChevronRight size={20} className="admin-arrow" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
