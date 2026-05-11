import React from 'react';
import { 
  LayoutDashboard, 
  History, 
  Database, 
  Settings, 
  Bell, 
  LogOut,
  Zap,
  PlusCircle,
  Layout
} from 'lucide-react';

const Sidebar = ({ currentView, onViewChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { id: 'product-lists', icon: History, label: 'Mes Listes' },
    { id: 'all-products', icon: Database, label: 'Catalogue' },
    { id: 'templates', icon: Layout, label: 'Quabls' },
  ];

  const bottomItems = [
    { icon: Bell, label: 'Notifications' },
    { icon: Settings, label: 'Paramètres' },
  ];

  return (
    <div className="sidebar">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        padding: '8px 0 32px 0'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
          padding: '10px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
        }}>
          <Zap size={22} color="white" fill="white" />
        </div>
        <span style={{ 
          fontFamily: 'Outfit', 
          fontSize: '1.25rem', 
          fontWeight: '700',
          color: '#0f172a',
          letterSpacing: '-0.5px'
        }}>
          ScanFlow
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ 
          fontSize: '0.7rem', 
          fontWeight: '700', 
          color: 'var(--text-light)', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: '16px',
          paddingLeft: '12px'
        }}>Menu Principal</p>
        
        <ul style={{ listStyle: 'none' }}>
          {menuItems.map((item) => (
            <li key={item.id} style={{ marginBottom: '4px' }}>
              <button 
                onClick={() => onViewChange(item.id)}
                className={`sidebar-link ${currentView === item.id ? 'active' : ''}`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: '32px' }}>
          <button 
            onClick={() => onViewChange('new-list')}
            className="action-pill"
          >
            <PlusCircle size={18} />
            Nouvelle Liste
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
        <ul style={{ listStyle: 'none' }}>
          {bottomItems.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>
              <button className="sidebar-link">
                <item.icon size={18} />
                {item.label}
              </button>
            </li>
          ))}
          <li style={{ marginTop: '16px' }}>
            <button 
              onClick={onLogout}
              className="sidebar-link logout"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </li>
        </ul>
      </div>

      <style>{`
        .sidebar-link {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .sidebar-link:hover {
          background-color: #f1f5f9;
          color: var(--text-main);
        }
        .sidebar-link.active {
          background-color: var(--primary-light);
          color: var(--primary);
        }
        .sidebar-link.logout:hover {
          background-color: #fef2f2;
          color: #ef4444;
        }
        .action-pill {
          width: 100%;
          padding: 12px;
          background-color: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
          transition: all 0.2s ease;
        }
        .action-pill:hover {
          background-color: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
