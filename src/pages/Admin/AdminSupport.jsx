import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { collection, updateDoc, doc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const AdminSupport = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'support_internal'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'support_internal', id), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
        } catch (err) {
            alert('Error updating ticket: ' + err.message);
        }
    };

    return (
        <div className="admin-support">
            <header className="page-header">
                <h1>Bandeja de Soporte</h1>
                <p>Atiende las consultas y problemas técnicos de los alumnos.</p>
            </header>
            {loading ? <div className="skeleton" style={{ height: '400px' }}></div> : (
                <div className="card" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr><th>Usuario</th><th>Asunto</th><th>Estado</th><th>Fecha</th></tr>
                        </thead>
                        <tbody>
                            {tickets.map(t => (
                                <tr key={t.id}>
                                    <td>
                                        <div className="font-600">{t.nameSnapshot}</div>
                                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{t.emailSnapshot}</div>
                                    </td>
                                    <td>
                                        <div className="font-600">{t.subject}</div>
                                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{t.message.substring(0, 50)}...</div>
                                    </td>
                                    <td>
                                        <select
                                            className={`badge status-select ${t.status}`}
                                            value={t.status}
                                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                                        >
                                            <option value="nuevo">Nuevo</option>
                                            <option value="en_proceso">En Proceso</option>
                                            <option value="cerrado">Cerrado</option>
                                        </select>
                                    </td>
                                    <td><div style={{ fontSize: '0.8rem' }}>{t.createdAt?.toDate().toLocaleDateString()}</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminSupport;
