import React, { useState, useEffect } from 'react';
import { Users, Shield, User, Search, AlertTriangle, Plus, X } from 'lucide-react';
import { collection, updateDoc, doc, setDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, firebaseConfig } from '../../lib/firebase';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [errorCreate, setErrorCreate] = useState('');
    const [successCreate, setSuccessCreate] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'alumno'
    });

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

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setErrorCreate('');
        setSuccessCreate('');
        setLoadingCreate(true);

        try {
            // 1. Initialize a secondary Firebase app
            const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
            const secondaryAuth = getAuth(secondaryApp);

            // 2. Create the user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                formData.email,
                formData.password
            );

            // 3. Create the user profile in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // 4. Sign out the secondary app and clean it up
            await signOut(secondaryAuth);

            setSuccessCreate('Usuario creado exitosamente.');
            setTimeout(() => {
                setIsModalOpen(false);
                setFormData({ name: '', email: '', password: '', role: 'alumno' });
                fetchUsers();
                setSuccessCreate('');
            }, 1000);

        } catch (err) {
            console.error("Error creando usuario:", err);
            if (err.code === 'auth/email-already-in-use') {
                setErrorCreate('El correo electrónico ya está en uso.');
            } else if (err.code === 'auth/weak-password') {
                setErrorCreate('La contraseña debe tener al menos 6 caracteres.');
            } else {
                setErrorCreate('Error al crear el usuario: ' + err.message);
            }
        } finally {
            setLoadingCreate(false);
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
                <div className="flex items-center gap-4">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} /> Nuevo Usuario
                    </button>
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

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card animate-fade-in">
                        <div className="modal-header">
                            <h2>Crear Nuevo Usuario</h2>
                            <button onClick={() => {
                                setIsModalOpen(false);
                                setErrorCreate('');
                                setSuccessCreate('');
                                setFormData({ name: '', email: '', password: '', role: 'alumno' });
                            }}><X size={24} /></button>
                        </div>
                        {errorCreate && (
                            <div className="error-banner">
                                <AlertTriangle size={18} />
                                <span>{errorCreate}</span>
                            </div>
                        )}
                        {successCreate && (
                            <div className="error-banner" style={{ backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}>
                                <span>{successCreate}</span>
                            </div>
                        )}
                        <form onSubmit={handleCreateUser} className="modal-form">
                            <div className="input-group">
                                <label>Nombre Completo *</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Correo Electrónico *</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Contraseña temporal *</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    minLength="6"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                            <div className="input-group">
                                <label>Rol Inicial *</label>
                                <select
                                    className="input-field"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="alumno">Alumno</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div className="modal-actions mt-4">
                                <button type="button" className="btn btn-secondary" onClick={() => {
                                    setIsModalOpen(false);
                                    setErrorCreate('');
                                    setSuccessCreate('');
                                    setFormData({ name: '', email: '', password: '', role: 'alumno' });
                                }}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={loadingCreate}>
                                    {loadingCreate ? 'Creando...' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
