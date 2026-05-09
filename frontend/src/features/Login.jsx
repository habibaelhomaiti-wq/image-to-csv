import React, { useState } from 'react';
import { Zap, Loader2, AlertCircle } from 'lucide-react';
import { AuthService } from '../api/AuthService';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await AuthService.login(email, password);
      onLoginSuccess();
    } catch (err) {
      setError('Identifiants invalides ou erreur serveur.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)'
    }}>
      <div className="glass-card" style={{ width: '400px', padding: 'var(--spacing-xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{
            background: 'var(--accent-primary)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-accent)'
          }}>
            <Zap size={24} color="white" />
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem' }}>Bienvenue</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Connectez-vous pour gérer vos produits</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              style={{ width: '100%', marginTop: '4px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', color: 'white' }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', marginTop: '4px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', color: 'white' }}
            />
          </div>
          <button
            type="submit"
            className="action-btn primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? <Loader2 className="pulse" size={20} /> : 'Se connecter'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Pas encore de compte ? <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}>Créer un compte</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
