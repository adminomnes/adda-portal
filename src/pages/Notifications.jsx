import React, { useEffect, useState } from 'react';
import { Bell, Calendar, Info } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const enrollQuery = query(collection(db, 'enrollments'), where('uid', '==', user.uid));
        const enrollSnap = await getDocs(enrollQuery);
        const courseIds = enrollSnap.docs.map(d => `course:${d.data().courseId}`);

        const publicQuery = query(
          collection(db, 'notices'),
          where('audience', '==', 'all'),
          orderBy('createdAt', 'desc')
        );
        const publicSnap = await getDocs(publicQuery);
        const publicNotices = publicSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        let courseNotices = [];
        if (courseIds.length > 0) {
          const courseSpecQuery = query(
            collection(db, 'notices'),
            where('audience', 'in', courseIds.slice(0, 10)),
            orderBy('createdAt', 'desc')
          );
          const courseSpecSnap = await getDocs(courseSpecQuery);
          courseNotices = courseSpecSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        const allNotices = [...publicNotices, ...courseNotices].sort((a, b) =>
          (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
        );

        setNotices(allNotices);
      } catch (error) {
        console.error('Error fetching notices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [user]);

  return (
    <div className="notifications-page">
      <header className="page-header">
        <h1>Notificaciones</h1>
        <p>Mantente al día con las novedades y avisos de la academia.</p>
      </header>

      {loading ? (
        <div className="card skeleton" style={{ height: '200px' }}></div>
      ) : notices.length > 0 ? (
        <div className="notices-list">
          {notices.map(notice => (
            <div key={notice.id} className="notice-card card animate-fade-in">
              <div className="notice-icon">
                <Bell size={24} />
              </div>
              <div className="notice-content">
                <div className="notice-header">
                  <h3>{notice.title}</h3>
                  <span className="notice-date">
                    <Calendar size={14} />
                    {notice.createdAt?.toDate().toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <p>{notice.message}</p>
                {notice.audience !== 'all' && (
                  <div className="notice-footer">
                    <span className="badge badge-calipso">Específico para curso</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <div className="empty-icon"><Info size={48} /></div>
          <h3>Sin notificaciones</h3>
          <p>No tienes avisos pendientes en este momento.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
