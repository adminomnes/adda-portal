import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, ChevronRight, Search } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const enrollQuery = query(collection(db, 'enrollments'), where('uid', '==', user.uid));
        const enrollSnap = await getDocs(enrollQuery);
        const courseIds = enrollSnap.docs.map(d => d.data().courseId);

        if (courseIds.length === 0) {
          setCourses([]);
          return;
        }

        const courseData = [];
        for (const id of courseIds) {
          const courseRef = doc(db, 'courses', id);
          const courseSnap = await getDoc(courseRef);
          if (courseSnap.exists()) {
            courseData.push({ id: courseSnap.id, ...courseSnap.data() });
          }
        }
        setCourses(courseData);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, [user]);

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="courses-page">
      <div className="page-header">
        <div>
          <h1>Mis Cursos</h1>
          <p>Gestiona tus inscripciones y accede al material de estudio.</p>
        </div>
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar curso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="card skeleton" style={{ height: '200px' }}></div>)}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <div key={course.id} className="course-card card">
              <div className="course-status">
                <span className={`badge ${course.status === 'active' ? 'badge-calipso' : 'badge-gray'}`}>
                  {course.status === 'active' ? 'En curso' : 'Finalizado'}
                </span>
              </div>
              <div className="course-main">
                <div className="course-icon">
                  <BookOpen size={24} />
                </div>
                <div className="course-info">
                  <h2>{course.title}</h2>
                  <p>{course.description}</p>
                </div>
              </div>
              <div className="course-dates">
                <div className="date-item">
                  <Calendar size={14} />
                  <span>Inicio: {course.startDate}</span>
                </div>
                <div className="date-item">
                  <Calendar size={14} />
                  <span>Fin: {course.endDate}</span>
                </div>
              </div>
              <div className="course-actions">
                <button
                  className="btn btn-primary w-full"
                  onClick={() => navigate(`/material?course=${course.id}`)}
                >
                  Ver Material de Estudio
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <div className="empty-icon">📂</div>
          <h3>No se encontraron cursos</h3>
          <p>Parece que aún no tienes cursos asignados o no coinciden con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default Courses;
