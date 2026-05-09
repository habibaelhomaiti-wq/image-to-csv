import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Package, FileSpreadsheet, BrainCircuit, Loader2 } from 'lucide-react';
import { MOCK_STATS } from '../mock/data';
import { ProductService } from '../api/ProductService';

const StatCard = ({ stat }) => (
  <div className="glass-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{stat.label}</p>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stat.value}</h3>
      </div>
      <div style={{
        padding: '4px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        background: stat.trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        color: stat.trend === 'up' ? 'var(--accent-secondary)' : '#ef4444',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {stat.change}
      </div>
    </div>
  </div>
);

const RecentActivity = ({ products, loading }) => (
  <div className="glass-card" style={{ marginTop: 'var(--spacing-lg)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
      <h3 style={{ fontSize: '1.2rem' }}>Activité Récente</h3>
      <button style={{ 
        background: 'transparent', 
        border: 'none', 
        color: 'var(--accent-primary)', 
        cursor: 'pointer',
        fontSize: '0.9rem'
      }}>Voir tout</button>
    </div>
    
    <div style={{ overflowX: 'auto' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader2 className="pulse" size={32} color="var(--accent-primary)" />
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 8px' }}>PRODUIT</th>
              <th style={{ padding: '12px 8px' }}>CATÉGORIE</th>
              <th style={{ padding: '12px 8px' }}>MARQUE</th>
              <th style={{ padding: '12px 8px' }}>PRIX</th>
              <th style={{ padding: '12px 8px' }}>STATUT</th>
              <th style={{ padding: '12px 8px' }}>DATE</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }} className="table-row">
                <td style={{ padding: '16px 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={product.image_path ? `http://localhost:8000/storage/${product.image_path}` : 'https://via.placeholder.com/40'} 
                      alt="" 
                      style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} 
                    />
                    <span style={{ fontWeight: '500' }}>{product.name || 'Produit sans nom'}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{product.category || 'Non classé'}</td>
                <td style={{ padding: '16px 8px' }}>
                  <span style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    padding: '4px 8px', 
                    borderRadius: '6px',
                    fontSize: '0.8rem'
                  }}>{product.brand || '-'}</span>
                </td>
                <td style={{ padding: '16px 8px', fontWeight: '600' }}>{product.price ? `${product.price} €` : '-'}</td>
                <td style={{ padding: '16px 8px' }}>
                  <span style={{ 
                    color: (product.status === 'completed' || product.status === 'analyzed') ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ● {product.status === 'completed' ? 'Publié' : (product.status === 'analyzed' ? 'Analyse terminée' : product.status)}
                  </span>
                </td>
                <td style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>
                  {new Date(product.created_at).toLocaleDateString()}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Aucun produit trouvé. Commencez par en scanner un !
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
    <style>{`
      .table-row:hover {
        background: rgba(255, 255, 255, 0.02);
      }
    `}</style>
  </div>
);

const Dashboard = ({ onStartScan }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(MOCK_STATS);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await ProductService.getProducts();
        setProducts(data.data || []);
        
        // Optionally update stats based on real data
        if (data.total !== undefined) {
          const newStats = [...MOCK_STATS];
          newStats[0].value = data.total.toLocaleString();
          setStats(newStats);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Bon retour 👋</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Voici ce qui s'est passé sur votre catalogue aujourd'hui.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 'var(--spacing-md)' 
      }}>
        {stats.map(stat => <StatCard key={stat.id} stat={stat} />)}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: 'var(--spacing-lg)',
        marginTop: 'var(--spacing-lg)'
      }}>
        <RecentActivity products={products} loading={loading} />
        
        <div className="glass-card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-md)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="action-btn primary" onClick={onStartScan}>
              <BrainCircuit size={18} /> Lancer un scan IA
            </button>
            <button className="action-btn secondary">
              <FileSpreadsheet size={18} /> Exporter en CSV
            </button>
            <button className="action-btn secondary">
              <Package size={18} /> Gérer le stock
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .action-btn {
          width: 100%;
          padding: 14px;
          border-radius: var(--radius-md);
          display: flex;
          alignItems: center;
          justify-content: center;
          gap: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        .action-btn.primary {
          background: var(--accent-primary);
          color: white;
          box-shadow: var(--shadow-accent);
        }
        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }
        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }
        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
