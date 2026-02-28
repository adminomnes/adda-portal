import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, ExternalLink } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const AdminMaterials = () => {
    const [courses, setCourses] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'pdf',
        url: '',
        description: '',
        courseId: ''
    });

    useEffect(() => {
        const fetchCourses = async () => {
            const snap = await getDocs(collection(db, 'courses'));
            setCourses(snap.docs.map(d => ({ id: d.id, title: d.data().title })));
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchMaterials = async () => {
            if (!selectedCourse) {
                setMaterials([]);
                return;
            }
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'materials'),
                    where('courseId', '==', selectedCourse),
                    orderBy('createdAt', 'desc')
                );
                const snap = await getDocs(q);
                setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, [selectedCourse]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'materials'), {
                ...formData,
                createdAt: serverTimestamp()
            });
            setIsModalOpen(false);
            const q = query(collection(db, 'materials'), where('courseId', '==', selectedCourse || formData.courseId), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este material?')) {
            await deleteDoc(doc(db, 'materials', id));
            setMaterials(materials.filter(m => m.id !== id));
        }
    };

    return (
        <div className="admin-materials">
            <header className="page-header flex justify-between items-center">
                <div>
                    <h1>Gestión de Material</h1>
                    <p>Organiza los recursos por curso.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Nuevo Material
                </button>
            </header>
            <div className="card mb-4">
                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Filtrar por Curso</label>
                    <select className="input-field" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                        <option value="">Selecciona un curso para ver su material</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
            </div>
            {loading ? <div className="skeleton" style={{ height: '200px' }}></div> : materials.length > 0 ? (
                <div className="card" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr><th>Título</th><th>Tipo</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {materials.map(mat => (
                                <tr key={mat.id}>
                                    <td className="font-600">{mat.title}</td>
                                    <td><span className="badge badge-gray">{mat.type}</span></td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-icon" onClick={() => window.open(mat.url, '_blank')}><ExternalLink size={16} /></button>
                                            <button className="btn-icon color-red" onClick={() => handleDelete(mat.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state card">
                    <p>{selectedCourse ? 'No hay material para este curso' : 'Selecciona un curso para comenzar'}</p>
                </div>
            )}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card animate-fade-in">
                        <div className="modal-header">
                            <h2>Nuevo Material</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="modal-form">
                            <div className="input-group">
                                <label>Título</label>
                                <input type="text" className="input-field" required onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Tipo</label>
                                <select className="input-field" onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="pdf">PDF</option>
                                    <option value="video">Video</option>
                                    <option value="link">Link / Web</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>URL</label>
                                <input type="url" className="input-field" required placeholder="https://..." onChange={e => setFormData({ ...formData, url: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Asociar a Curso</label>
                                <select className="input-field" required onChange={e => setFormData({ ...formData, courseId: e.target.value })}>
                                    <option value="">Selecciona un curso...</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar Material</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMaterials;
