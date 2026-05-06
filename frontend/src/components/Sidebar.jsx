import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Database, 
  Settings, 
  Bell, 
  LogOut,
  Zap
} from 'lucide-react';

const Sidebar = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'add-product', icon: PlusCircle, label: 'Nouveau Produit' },
    { id: 'history', icon: History, label: 'Historique' },
    { id: 'catalogue', icon: Database, label: 'Catalogue' },
  ];

  const bottomItems = [
    { icon: Bell, label: 'Notifications' },
    { icon: Settings, label: 'Paramètres' },
  ];

  return (
    <div className="glass" style={{
      width: '260px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--spacing-md)',
      position: 'sticky',
      top: 0
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--spacing-xs)',
        padding: 'var(--spacing-md) 0',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <div style={{
          background: 'var(--accent-primary)',
          padding: '8px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-accent)'
        }}>
          <Zap size={24} color="white" />
        </div>
        <span style={{ 
          fontFamily: 'Outfit', 
          fontSize: '1.2rem', 
          fontWeight: 'bold',
          letterSpacing: '-0.5px'
        }}>
          AI PUBLISH
        </span>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none' }}>
          {menuItems.map((item) => (
            <li key={item.id} style={{ marginBottom: '8px' }}>
              <button 
                onClick={() => onViewChange(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: currentView === item.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  border: 'none',
                  color: currentView === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  fontWeight: currentView === item.id ? '600' : '400'
                }} className="sidebar-btn">
                <item.icon size={20} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
        <ul style={{ listStyle: 'none' }}>
          {bottomItems.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '8px' }}>
              <button style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.95rem'
              }} className="sidebar-btn">
                <item.icon size={20} />
                {item.label}
              </button>
            </li>
          ))}
          <li style={{ marginTop: 'var(--spacing-md)' }}>
            <button style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              color: '#ef4444',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}>
              <LogOut size={20} />
              Déconnexion
            </button>
          </li>
        </ul>
      </div>

      <style>{`
        .sidebar-btn:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: var(--text-primary) !important;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
