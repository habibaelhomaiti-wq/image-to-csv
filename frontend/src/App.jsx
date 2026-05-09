import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './features/Dashboard';
import AddProduct from './features/AddProduct';
import Login from './features/Login';
import { AuthService } from './api/AuthService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(AuthService.isAuthenticated());
  const [currentView, setCurrentView] = React.useState('dashboard');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onStartScan={() => setCurrentView('add-product')} />;
      case 'add-product':
        return <AddProduct />;
      default:
        return (
          <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <h2 style={{ marginBottom: '1rem' }}>Bientôt disponible</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Cette fonctionnalité ({currentView}) est en cours de développement.</p>
            <button 
              className="action-btn primary" 
              style={{ marginTop: '2rem', display: 'inline-flex', width: 'auto' }}
              onClick={() => setCurrentView('dashboard')}
            >
              Retour au Dashboard
            </button>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
