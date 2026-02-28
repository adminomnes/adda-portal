import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Files,
  Bell,
  UserCircle,
  LifeBuoy,
  ShieldCheck,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { isAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Cursos', path: '/cursos', icon: BookOpen },
    { name: 'Material', path: '/material', icon: Files },
    { name: 'Notificaciones', path: '/notificaciones', icon: Bell },
    { name: 'Perfil', path: '/perfil', icon: UserCircle },
    { name: 'Soporte', path: '/soporte', icon: LifeBuoy },
  ];

  if (isAdmin) {
    menuItems.push({ name: 'Admin', path: '/admin', icon: ShieldCheck });
  }

  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img
              src="/intranet.png"
              alt="ADDA Portal"
              className={`sidebar-logo ${isCollapsed ? 'collapsed' : ''}`}
            />
          </div>
          <button className="collapse-btn" onClick={toggleCollapsed}>
            <ChevronLeft size={20} style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>


      </aside>
    </>
  );
};

export default Sidebar;
