import React, { useState, useEffect } from 'react';
import { UserCircle, Mail, Shield, Phone, Palette, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Profile = () => {
    const { user, userData, isAdmin } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        artisticName: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                artisticName: userData.artisticName || '',
                phone: userData.phone || ''
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (formData.name.trim().length < 3) {
            setError('El nombre debe tener al menos 3 caracteres.');
            return;
        }

        if (formData.phone && !/^[0-9+\s]+$/.test(formData.phone)) {
            setError('El formato del teléfono es inválido.');
            return;
        }

        setLoading(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                ...formData,
                updatedAt: serverTimestamp()
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Update profile error:', err);
            setError('Error al actualizar el perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <header className="page-header">
                <h1>Mi Perfil</h1>
                <p>Gestiona tu información personal y profesional.</p>
            </header>
            <div className="profile-grid">
                <div className="card profile-info animate-fade-in">
                    <div className="profile-avatar">
                        <UserCircle size={80} strokeWidth={1} />
                        <div className={`role-badge ${userData?.role}`}>
                            {userData?.role === 'admin' ? 'ADMIN' : 'ALUMNO'}
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-row">
                            <div className="input-group">
                                <label>Nombre Completo *</label>
                                <div className="input-with-icon">
                                    <UserCircle size={18} />
                                    <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required placeholder="Tu nombre completo" />
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="input-group">
                                <label>Nombre Artístico (Opcional)</label>
                                <div className="input-with-icon">
                                    <Palette size={18} />
                                    <input type="text" name="artisticName" className="input-field" value={formData.artisticName} onChange={handleChange} placeholder="Ej: DJ Clara" />
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="input-group">
                                <label>Teléfono de Contacto</label>
                                <div className="input-with-icon">
                                    <Phone size={18} />
                                    <input type="tel" name="phone" className="input-field" value={formData.phone} onChange={handleChange} placeholder="+56 9 1234 5678" />
                                </div>
                            </div>
                        </div>
                        <div className="form-divider"></div>
                        <div className="input-group readonly">
                            <label>Correo Electrónico (Solo lectura)</label>
                            <div className="input-with-icon">
                                <Mail size={18} />
                                <input type="email" className="input-field" value={user?.email || ''} readOnly />
                            </div>
                        </div>
                        <div className="input-group readonly">
                            <label>Rol de Usuario (Solo lectura)</label>
                            <div className="input-with-icon">
                                <Shield size={18} />
                                <input type="text" className="input-field" value={userData?.role || ''} readOnly />
                            </div>
                        </div>
                        {error && <div className="error-text">{error}</div>}
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Guardando...' : <><Save size={20} /> Guardar Cambios</>}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="profile-sidebar">
                    <div className="card tip-card">
                        <h3>Información Académica</h3>
                        <p>Tu rol de {userData?.role} te permite acceder a {userData?.role === 'admin' ? 'todas las herramientas de gestión' : 'tus cursos y materiales'} de ADDA Portal.</p>
                        <p className="mt-4">Registrado el: <strong>{userData?.createdAt?.toDate().toLocaleDateString()}</strong></p>
                    </div>
                </div>
            </div>
            {success && (
                <div className="toast success animate-fade-in">
                    <CheckCircle size={20} />
                    <span>Perfil actualizado correctamente</span>
                </div>
            )}
        </div>
    );
};

export default Profile;
