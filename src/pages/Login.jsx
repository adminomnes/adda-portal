import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, Mail, Lock, AlertCircle, BookOpen, Files, LifeBuoy, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Revisa tu conexión a internet.');
      } else {
        setError('Ocurrió un error inesperado al iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative Background Elements */}
      <div className="login-decoration-1"></div>
      <div className="login-decoration-2"></div>

      <div className="login-content-wrapper">
        {/* Visual Panel (Left side on Desktop, Hidden on Mobile) */}
        <div className="login-visual-panel animate-fade-in">
          <img src="/intranet.png" alt="ADDA Portal" className="login-logo" />

          <h1>Bienvenido/a a<br />ADDA Portal</h1>
          <p className="subtitle">Accede a tus cursos, material y notificaciones.</p>

          <div className="login-features">
            <div className="login-feature-item">
              <div className="feature-icon-wrapper feature-icon-magenta">
                <BookOpen size={24} />
              </div>
              <span>Cursos y progreso</span>
            </div>
            <div className="login-feature-item">
              <div className="feature-icon-wrapper feature-icon-calipso">
                <Files size={24} />
              </div>
              <span>Material y recursos</span>
            </div>
            <div className="login-feature-item">
              <div className="feature-icon-wrapper feature-icon-gray">
                <LifeBuoy size={24} />
              </div>
              <span>Soporte interno</span>
            </div>
          </div>
        </div>

        {/* Form Container (Right side on Desktop, Full width on Mobile) */}
        <div className="login-form-container">
          <div className="login-card animate-slide-up">
            <div className="login-header">
              {/* Show logo here only on mobile since left panel is hidden */}
              <div className="mobile-only-logo" style={{ display: 'none' }}>
                <img src="/intranet.png" alt="ADDA Portal" style={{ height: '56px', marginBottom: '1.5rem', marginInline: 'auto' }} />
              </div>

              <div className="portal-badge">
                <ShieldCheck size={16} /> Portal Interno
              </div>
              <h2>Iniciar Sesión</h2>
              <p>Ingresa tus credenciales para continuar</p>
            </div>

            {error && (
              <div className="error-banner animate-fade-in">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label>Correo Electrónico</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    className="input-field with-icon"
                    placeholder="ejemplo@adda.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Contraseña</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    className="input-field with-icon"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex justify-end mb-2">
                <a href="#recuperar" className="forgot-password" onClick={(e) => e.preventDefault()}>¿Olvidaste tu contraseña?</a>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading} style={{ height: '48px', fontSize: '1rem', borderRadius: '12px' }}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="login-btn-spinner">
                      <LogIn size={20} />
                    </div>
                    <span>Ingresando...</span>
                  </div>
                ) : (
                  <>
                    <LogIn size={20} />
                    Ingresar
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Quick Mobile Logo Fix inline style for simplicity since display:none is tricky with React sometimes */}
      <style>{`
        @media (max-width: 1023px) {
          .mobile-only-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
