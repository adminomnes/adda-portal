import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Bell,
  Files,
  PlusCircle,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Dashboard = () => {
  const { userData, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    courses: 0,
    notifications: [],
    materials: []
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const enrollQuery = query(collection(db, 'enrollments'), where('uid', '==', user.uid));
        const enrollSnap = await getDocs(enrollQuery);
        const courseCount = enrollSnap.size;

        const noticeQuery = query(
          collection(db, 'notices'),
          where('audience', '==', 'all'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const noticeSnap = await getDocs(noticeQuery);
        const latestNotices = noticeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const materialQuery = query(
          collection(db, 'materials'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const materialSnap = await getDocs(materialQuery);
        const latestMaterials = materialSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setStats({
          courses: courseCount,
          notifications: latestNotices,
          materials: latestMaterials
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card skeleton" style={{ height: 'stats' ? '140px' : 'auto' }}></div>
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <header className="welcome-section">
        <h1>Hola, {userData?.name || 'Estudiante'} 👋</h1>
        <p>Bienvenido de nuevo a tu panel de control.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/cursos')}>
          <div className="stat-icon magenta">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.courses}</h3>
            <p>Mis Cursos Activos</p>
          </div>
          <ChevronRight size={20} className="stat-arrow" />
        </div>

        <div className="stat-card" onClick={() => navigate('/soporte')}>
          <div className="stat-icon calipso">
            <PlusCircle size={stats ? 24 : 0} />
          </div>
          <div className="stat-info">
            <h3>Crear Ticket</h3>
            <p>Soporte Técnico</p>
          </div>
          <ChevronRight size={20} className="stat-arrow" />
        </div>
      </div>

      <div className="dashboard-grid mt-4">
        <section className="dashboard-section card">
          <div className="section-header">
            <h2>Últimas Notificaciones</h2>
            <button className="text-btn" onClick={() => navigate('/notificaciones')}>Ver todas</button>
          </div>
          <div className="section-list">
            {stats.notifications.length > 0 ? stats.notifications.map(notice => (
              <div key={notice.id} className="list-item">
                <div className="item-icon">
                  <Bell size={18} />
                </div>
                <div className="item-content">
                  <h4>{notice.title}</h4>
                  <p>{notice.message?.substring(0, 60)}...</p>
                </div>
              </div>
            )) : (
              <p className="empty-state">No hay notificaciones recientes.</p>
            )}
          </div>
        </section>

        <section className="dashboard-section card">
          <div className="section-header">
            <h2>Material Reciente</h2>
            <button className="text-btn" onClick={() => navigate('/material')}>Ver todo</button>
          </div>
          <div className="section-list">
            {stats.materials.length > 0 ? stats.materials.map(mat => (
              <div key={mat.id} className="list-item" onClick={() => window.open(mat.url, '_blank')}>
                <div className="item-icon calipso-bg">
                  <Files size={18} />
                </div>
                <div className="item-content">
                  <h4>{mat.title}</h4>
                  <p className="flex items-center gap-2">
                    <span className="badge-gray badge">{mat.type}</span>
                    <Clock size={12} /> {mat.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) : (
              <p className="empty-state">No hay material disponible aún.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
