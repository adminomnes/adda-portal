import React, { useState, useEffect } from 'react';
import { Users, Shield, User, Search, AlertTriangle } from 'lucide-react';
import { collection, updateDoc, doc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        if (confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) {
            try {
                await updateDoc(doc(db, 'users', userId), {
                    role: newRole,
                    updatedAt: serverTimestamp()
                });
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            } catch (err) {
                alert('Error al actualizar rol: ' + err.message);
            }
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-users">
            <header className="page-header flex justify-between items-center">
                <div>
                    <h1>Gestión de Usuarios</h1>
                    <p>Administra los permisos y roles de los integrantes de ADDA.</p>
                </div>
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="skeleton" style={{ height: '400px' }}></div>
            ) : (
                <div className="card" style={{ padding: 0 }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Nombre Artístico</th>
                                <th>Rol</th>
                                <th>Registro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="font-600">{u.name || 'Sin nombre'}</div>
                                            <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{u.email}</div>
                                        </div>
                                    </td>
                                    <td>{u.artisticName || '-'}</td>
                                    <td>
                                        <div className="role-selector">
                                            {u.role === 'admin' ? <Shield size={14} className="color-magenta" /> : <User size={14} className="color-calipso" />}
                                            <select
                                                className={`role-select ${u.role}`}
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            >
                                                <option value="alumno">Alumno</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                                            {u.createdAt?.toDate().toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="warning-banner mt-4 card">
                <AlertTriangle size={20} />
                <p>Ten cuidado al asignar el rol de <strong>Administrador</strong>. Estos usuarios tendrán acceso total a la plataforma.</p>
            </div>
        </div>
    );
};

export default AdminUsers;
