import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Topbar = ({ onOpenSidebar }) => {
  const { userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbNameMap = {
    dashboard: 'Dashboard',
    cursos: 'Mis Cursos',
    material: 'Material de Estudio',
    notificaciones: 'Notificaciones',
    perfil: 'Mi Perfil',
    soporte: 'Soporte Técnico',
    admin: 'Administración',
    usuarios: 'Gestión de Usuarios'
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onOpenSidebar}>
          <Menu size={24} />
        </button>

        <div className="breadcrumbs">
          <span className="breadcrumb-root">Portal</span>
          {pathnames.map((name, index) => (
            <React.Fragment key={name}>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <span className="breadcrumb-item">
                {breadcrumbNameMap[name] || name.charAt(0).toUpperCase() + name.slice(1)}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="topbar-right">
        <div className="user-info">
          <span className="user-name">{userData?.name || 'Usuario'}</span>
          <span className="user-role">{userData?.role === 'admin' ? 'Administrador' : 'Alumno'}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
