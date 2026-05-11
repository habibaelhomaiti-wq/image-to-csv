import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Clock, Package, FileSpreadsheet, 
  BrainCircuit, Loader2, Trash2, ExternalLink, Download, Sparkles,
  ArrowRight, Plus
} from 'lucide-react';
import { MOCK_STATS } from '../mock/data';
import { ProductService } from '../api/ProductService';
import { useToast } from '../context/ToastContext';

const StatCard = ({ stat }) => {
  const isPositive = stat.trend === 'up';
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ 
          background: isPositive ? 'var(--secondary-light)' : '#fef2f2', 
          padding: '8px', 
          borderRadius: '10px' 
        }}>
          {stat.id === 1 ? <Package size={20} color="var(--primary)" /> : 
           stat.id === 2 ? <Clock size={20} color="var(--secondary)" /> : 
           stat.id === 3 ? <FileSpreadsheet size={20} color="#8b5cf6" /> : 
           <Sparkles size={20} color="#f59e0b" />}
        </div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          color: isPositive ? 'var(--secondary)' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {stat.change}
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>{stat.label}</p>
      <h3 style={{ fontSize: '1.75rem', marginTop: '4px' }}>{stat.value}</h3>
    </div>
  );
};

const Dashboard = ({ onStartScan, hideStats = false }) => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await ProductService.getDashboardStats();
      setStats(data.stats);
      setProducts(data.recent_products);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      addToast("Erreur lors du chargement des statistiques", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce produit ?")) {
      try {
        await ProductService.deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        addToast("Erreur lors de la suppression", "error");
      }
    }
  };

  return (
    <div className="animate-fade-in">
      {!hideStats && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem' }}>Vue d'ensemble</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Bienvenue sur votre espace de gestion ScanFlow.</p>
            </div>
            <button className="btn btn-primary" onClick={onStartScan} style={{ height: '48px', padding: '0 24px' }}>
              <Plus size={20} /> Nouvelle Analyse
            </button>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '24px',
            marginBottom: '32px'
          }}>
            {stats.map(stat => <StatCard key={stat.id} stat={stat} />)}
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: hideStats ? '1fr' : '2fr 1fr', gap: '32px' }}>
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Activités récentes</h3>
            <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>Voir tout</button>
          </div>
          
          <div className="table-container">
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <Loader2 className="spin" size={32} color="var(--primary)" />
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={product.image_path ? `http://localhost:8000/storage/${product.image_path}` : 'https://via.placeholder.com/48'} 
                            alt="" 
                            style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border)' }} 
                          />
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{product.name || 'Analyse en cours...'}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{new Date(product.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{product.category || '-'}</td>
                      <td style={{ fontWeight: '600' }}>{product.price ? `${product.price} €` : '-'}</td>
                      <td>
                        <span className={`badge ${
                          product.status === 'completed' ? 'badge-success' : 
                          product.status === 'analyzed' ? 'badge-blue' : 'badge-pending'
                        }`}>
                          {product.status === 'completed' ? 'Vérifié' : 
                           product.status === 'analyzed' ? 'Prêt' : 'En cours'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleDelete(product.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#ef4444'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '64px', color: 'var(--text-light)' }}>
                        <Package size={48} style={{ marginBottom: '12px', opacity: 0.2 }} />
                        <p>Aucun produit à afficher</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {!hideStats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)', color: 'white', border: 'none' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', width: 'fit-content', marginBottom: '16px' }}>
                <Sparkles size={20} color="white" />
              </div>
              <h3 style={{ color: 'white', marginBottom: '8px' }}>Gagnez du temps</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '20px' }}>
                L'IA de ScanFlow réduit le temps de saisie de 85% en moyenne.
              </p>
              <button className="btn" style={{ background: 'white', color: 'var(--primary)', width: '100%' }}>
                En savoir plus
              </button>
            </div>

            <div className="card">
              <h4 style={{ marginBottom: '16px' }}>Conseils du jour</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Optimisez l\'éclairage de vos photos.',
                  'Vérifiez les catégories suggérées.',
                  'Exportez vos fichiers par lots.'
                ].map((tip, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', display: 'flex', gap: '8px', color: 'var(--text-muted)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px', flexShrink: 0 }}></div>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
