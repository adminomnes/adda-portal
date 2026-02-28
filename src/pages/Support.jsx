import React, { useState, useEffect } from 'react';
import { LifeBuoy, Send, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Support = () => {
    const { user, userData } = useAuth();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);

    const fetchTickets = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, 'support_internal'),
                where('uid', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const snap = await getDocs(q);
            setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error('Error fetching tickets:', err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !message) return;

        setLoading(true);
        try {
            await addDoc(collection(db, 'support_internal'), {
                uid: user.uid,
                nameSnapshot: userData?.name || 'Usuario',
                emailSnapshot: user.email,
                subject,
                message,
                status: 'nuevo',
                createdAt: serverTimestamp()
            });
            setSubject('');
            setMessage('');
            setSuccess(true);
            fetchTickets();
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            console.error('Error creating ticket:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'nuevo': return <span className="badge badge-magenta">Nuevo</span>;
            case 'en_proceso': return <span className="badge badge-calipso">En Proceso</span>;
            case 'cerrado': return <span className="badge badge-gray">Cerrado</span>;
            default: return <span className="badge badge-gray">{status}</span>;
        }
    };

    return (
        <div className="support-page">
            <header className="page-header">
                <h1>Soporte Técnico</h1>
                <p>¿Tienes algún problema o duda? Estamos aquí para ayudarte.</p>
            </header>
            <div className="support-grid">
                <section className="support-form-section">
                    <div className="card">
                        <h2 className="mb-4 flex items-center gap-2">
                            <MessageSquare size={20} className="color-magenta" />
                            Crear Nuevo Ticket
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Asunto</label>
                                <input type="text" className="input-field" placeholder="Ej: Problema al acceder a un material" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Mensaje / Detalle</label>
                                <textarea className="input-field" rows="5" placeholder="Describe tu problema con el mayor detalle posible..." value={message} onChange={(e) => setMessage(e.target.value)} required style={{ resize: 'vertical' }}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                {loading ? 'Enviando...' : <><Send size={18} /> Enviar Ticket</>}
                            </button>
                            {success && (
                                <div className="success-msg mt-4">
                                    <CheckCircle2 size={18} /> Ticket enviado con éxito. Te responderemos pronto.
                                </div>
                            )}
                        </form>
                    </div>
                </section>
                <section className="tickets-list-section">
                    <h2 className="mb-4 flex items-center gap-2"><Clock size={20} /> Mis Tickets</h2>
                    <div className="tickets-container">
                        {fetching ? <div className="skeleton" style={{ height: '100px' }}></div> : tickets.length > 0 ? (
                            tickets.map(ticket => (
                                <div key={ticket.id} className="ticket-card card mb-4">
                                    <div className="ticket-header">
                                        <h3>{ticket.subject}</h3>
                                        {getStatusBadge(ticket.status)}
                                    </div>
                                    <p className="ticket-preview">{ticket.message}</p>
                                    <div className="ticket-footer">
                                        <span><Clock size={12} /> {ticket.createdAt?.toDate().toLocaleDateString()}</span>
                                        <span className="ticket-id">#{ticket.id.substring(0, 8)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state card">
                                <LifeBuoy size={40} className="mb-2" />
                                <p>No tienes tickets creados.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Support;
