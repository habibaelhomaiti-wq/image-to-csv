import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './features/Dashboard';
import AddProduct from './features/AddProduct';
import ProductLists from './features/ProductLists';
import AddProductList from './features/AddProductList';
import ProductListDetail from './features/ProductListDetail';
import Login from './features/Login';
import PlatformTemplates from './features/PlatformTemplates';
import { AuthService } from './api/AuthService';
import { ToastProvider } from './context/ToastContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(AuthService.isAuthenticated());
  const [currentView, setCurrentView] = React.useState('dashboard');
  const [selectedListId, setSelectedListId] = React.useState(null);

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
        return <Dashboard onStartScan={() => setCurrentView('new-list')} />;
      case 'product-lists':
        return (
          <ProductLists 
            onNewList={() => setCurrentView('new-list')} 
            onSelectList={(id) => { setSelectedListId(id); setCurrentView('list-detail'); }} 
          />
        );
      case 'new-list':
        return (
          <AddProductList 
            onCancel={() => setCurrentView('product-lists')} 
            onSuccess={(id) => { setSelectedListId(id); setCurrentView('add-product'); }} 
          />
        );
      case 'add-product':
        return (
          <AddProduct 
            listId={selectedListId} 
            onFinish={() => { setSelectedListId(null); setCurrentView('product-lists'); }} 
          />
        );
      case 'list-detail':
        return (
          <ProductListDetail 
            listId={selectedListId} 
            onBack={() => { setSelectedListId(null); setCurrentView('product-lists'); }} 
            onAddProducts={() => setCurrentView('add-product')}
          />
        );
      case 'all-products':
        return (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <header style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Tous les Produits</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Consultez et gérez l'ensemble de votre catalogue.</p>
            </header>
            <Dashboard onStartScan={() => setCurrentView('new-list')} hideStats={true} />
          </div>
        );
      case 'templates':
        return <PlatformTemplates />;
      default:
        return (
          <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', animation: 'fadeIn 0.3s ease' }}>
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
    <ToastProvider>
      <div className="app-container">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />
        <main className="main-content">
          {renderView()}
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
