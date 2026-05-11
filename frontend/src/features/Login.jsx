import React, { useState } from 'react';
import { Zap, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
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
      background: '#f8fafc',
      padding: '20px'
    }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.2)'
          }}>
            <Zap size={28} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.5px' }}>Bon retour</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Connectez-vous à votre espace ScanFlow</p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#ef4444',
            padding: '14px',
            borderRadius: '10px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            border: '1px solid #fee2e2'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Adresse Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@entreprise.com"
              required
            />
          </div>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Mot de passe</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}>Oublié ?</span>
            </div>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', height: '52px' }}
          >
            {loading ? <Loader2 className="spin" size={20} /> : 'Se connecter'}
          </button>
        </form>
        
        <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Pas encore de compte ? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}>Inscrivez-vous</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px', color: 'var(--text-light)', fontSize: '0.75rem' }}>
            <ShieldCheck size={14} /> Connexion sécurisée
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '8px'
};

export default Login;
