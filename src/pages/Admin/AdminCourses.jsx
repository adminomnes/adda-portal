import React, { useState, useEffect } from 'react';
import { Plus, Edit2, BookOpen, Save, X } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'active'
    });

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleOpenModal = (course = null) => {
        if (course) {
            setFormData({
                title: course.title,
                description: course.description,
                startDate: course.startDate,
                endDate: course.endDate,
                status: course.status
            });
            setEditingId(course.id);
        } else {
            setFormData({
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                status: 'active'
            });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateDoc(doc(db, 'courses', editingId), {
                    ...formData,
                    updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, 'courses'), {
                    ...formData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }
            setIsModalOpen(false);
            fetchCourses();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="admin-courses">
            <header className="page-header flex justify-between items-center">
                <div>
                    <h1>Gestión de Cursos</h1>
                    <p>Crea y edita la oferta académica de la academia.</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} /> Nuevo Curso
                </button>
            </header>
            {loading ? <div className="card skeleton" style={{ height: '400px' }}></div> : (
                <div className="card" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Estado</th>
                                <th>Vigencia</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course.id}>
                                    <td>
                                        <div className="course-name">
                                            <BookOpen size={16} className="color-magenta" />
                                            <div>
                                                <div className="font-600">{course.title}</div>
                                                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>ID: {course.id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${course.status === 'active' ? 'badge-calipso' : 'badge-gray'}`}>
                                            {course.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td><div style={{ fontSize: '0.8rem' }}>{course.startDate} al {course.endDate}</div></td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-icon" onClick={() => handleOpenModal(course)}><Edit2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card animate-fade-in">
                        <div className="modal-header">
                            <h2>{editingId ? 'Editar Curso' : 'Crear Nuevo Curso'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="input-group">
                                <label>Título del Curso</label>
                                <input type="text" className="input-field" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label>Descripción</label>
                                <textarea className="input-field" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="input-group">
                                    <label>Fecha Inicio</label>
                                    <input type="date" className="input-field" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label>Fecha Término</label>
                                    <input type="date" className="input-field" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Estado</label>
                                <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="active">Activo</option>
                                    <option value="inactive">Inactivo</option>
                                </select>
                            </div>
                            <div className="modal-actions mt-4">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary"><Save size={18} /> {editingId ? 'Guardar Cambios' : 'Crear Curso'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourses;
