import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Bell, X } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const AdminNotifications = () => {
    const [courses, setCourses] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        audience: 'all'
    });

    const fetchData = async () => {
        setLoading(true);
        const cSnap = await getDocs(collection(db, 'courses'));
        setCourses(cSnap.docs.map(d => ({ id: d.id, title: d.data().title })));
        const nSnap = await getDocs(query(collection(db, 'notices'), orderBy('createdAt', 'desc')));
        setNotices(nSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        await addDoc(collection(db, 'notices'), {
            ...formData,
            createdAt: serverTimestamp()
        });
        setIsModalOpen(false);
        fetchData();
    };

    const handleDelete = async (id) => {
        if (confirm('¿Eliminar notificación?')) {
            await deleteDoc(doc(db, 'notices', id));
            setNotices(notices.filter(n => n.id !== id));
        }
    };

    return (
        <div className="admin-notices">
            <header className="page-header flex justify-between items-center">
                <div>
                    <h1>Gestión de Notificaciones</h1>
                    <p>Envía avisos globales o específicos por curso.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Nuevo Aviso
                </button>
            </header>
            {loading ? <div className="skeleton" style={{ height: '300px' }}></div> : (
                <div className="notices-grid">
                    {notices.map(notice => (
                        <div key={notice.id} className="card notice-admin-card">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className="icon-circle magenta-bg"><Bell size={20} /></div>
                                    <div>
                                        <h3 className="font-600">{notice.title}</h3>
                                        <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                                            Auditorio: {notice.audience === 'all' ? 'Todos' : `Curso ${notice.audience.split(':')[1]}`}
                                        </span>
                                    </div>
                                </div>
                                <button className="btn-icon color-red" onClick={() => handleDelete(notice.id)}><Trash2 size={16} /></button>
                            </div>
                            <p className="mt-2 text-secondary" style={{ fontSize: '0.9rem' }}>{notice.message}</p>
                            <div className="mt-2 text-secondary" style={{ fontSize: '0.75rem' }}>
                                {notice.createdAt?.toDate().toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card animate-fade-in">
                        <div className="modal-header">
                            <h2>Nuevo Aviso</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="modal-form">
                            <div className="input-group">
                                <label>Título</label>
                                <input type="text" className="input-field" required onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Mensaje</label>
                                <textarea className="input-field" rows="4" required onChange={e => setFormData({ ...formData, message: e.target.value })}></textarea>
                            </div>
                            <div className="input-group">
                                <label>Auditorio</label>
                                <select className="input-field" onChange={e => setFormData({ ...formData, audience: e.target.value })}>
                                    <option value="all">Todos los Alumnos</option>
                                    {courses.map(c => <option key={c.id} value={`course:${c.id}`}>Curso: {c.title}</option>)}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Enviar Notificación</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNotifications;
