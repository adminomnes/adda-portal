import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Files,
    Video,
    Link as LinkIcon,
    FileText,
    ExternalLink,
    Search,
    Filter
} from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const Materials = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCourseId = searchParams.get('course') || '';

    const [courses, setCourses] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCoursesAndMaterials = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const enrollQuery = query(collection(db, 'enrollments'), where('uid', '==', user.uid));
                const enrollSnap = await getDocs(enrollQuery);
                const courseIds = enrollSnap.docs.map(d => d.data().courseId);

                const courseList = [];
                for (const id of courseIds) {
                    const cSnap = await getDoc(doc(db, 'courses', id));
                    if (cSnap.exists()) courseList.push({ id: cSnap.id, title: cSnap.data().title });
                }
                setCourses(courseList);

                let materialQuery;
                if (selectedCourse) {
                    materialQuery = query(collection(db, 'materials'), where('courseId', '==', selectedCourse));
                } else if (courseIds.length > 0) {
                    materialQuery = query(collection(db, 'materials'), where('courseId', 'in', courseIds.slice(0, 10)));
                }

                if (materialQuery) {
                    const matSnap = await getDocs(materialQuery);
                    setMaterials(matSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                } else {
                    setMaterials([]);
                }
            } catch (error) {
                console.error('Error fetching materials:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCoursesAndMaterials();
    }, [user, selectedCourse]);

    const getIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={20} />;
            case 'pdf': return <FileText size={20} />;
            case 'link': return <LinkIcon size={20} />;
            default: return <Files size={20} />;
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="materials-page">
            <div className="page-header">
                <h1>Material de Estudio</h1>
                <div className="filters">
                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={selectedCourse}
                            onChange={(e) => {
                                setSelectedCourse(e.target.value);
                                setSearchParams({ course: e.target.value });
                            }}
                            className="input-field"
                        >
                            <option value="">Todos mis cursos</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Buscar material..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="card skeleton" style={{ height: '300px' }}></div>
            ) : filteredMaterials.length > 0 ? (
                <div className="card" style={{ padding: 0 }}>
                    <table className="materials-table">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Título</th>
                                <th>Descripción</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMaterials.map(mat => (
                                <tr key={mat.id}>
                                    <td>
                                        <div className={`type-icon ${mat.type}`}>
                                            {getIcon(mat.type)}
                                        </div>
                                    </td>
                                    <td className="font-600">{mat.title}</td>
                                    <td className="text-muted">{mat.description || 'Sin descripción'}</td>
                                    <td>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => window.open(mat.url, '_blank')}
                                        >
                                            <ExternalLink size={16} />
                                            Abrir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state card">
                    <div className="empty-icon">📚</div>
                    <h3>Sin material disponible</h3>
                    <p>No se encontró material para los filtros seleccionados.</p>
                </div>
            )}
        </div>
    );
};

export default Materials;
