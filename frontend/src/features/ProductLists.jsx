import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, Search, Package, Calendar, 
  ChevronRight, Loader2, Trash2, Folder
} from 'lucide-react';
import { ProductService } from '../api/ProductService';
import { useToast } from '../context/ToastContext';

const ProductLists = ({ onSelectList, onNewList }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const data = await ProductService.getProductLists();
        setLists(data.data || []);
      } catch (err) {
        console.error("Lists fetch error:", err);
        addToast("Erreur lors du chargement des listes", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Supprimer cette liste ?")) {
      try {
        await ProductService.deleteProductList(id);
        setLists(lists.filter(l => l.id !== id));
        addToast("Liste supprimée avec succès", "success");
      } catch (err) {
        addToast("Erreur lors de la suppression", "error");
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>Mes Listes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Gérez vos produits par lots pour un export fluide.</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '12px 24px' }} onClick={onNewList}>
          <FolderPlus size={20} /> Nouvelle Liste
        </button>
      </header>

      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        <input 
          type="text" 
          placeholder="Rechercher une liste par nom..." 
          className="input"
          style={{ paddingLeft: '48px', height: '54px' }} 
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <Loader2 size={48} className="spin" color="var(--primary)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {lists.length > 0 ? lists.map(list => (
            <div 
              key={list.id} 
              className="card" 
              onClick={() => onSelectList(list.id)}
              style={{ cursor: 'pointer', padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ 
                  background: 'var(--primary-light)', 
                  padding: '12px', 
                  borderRadius: '14px' 
                }}>
                  <Folder size={28} color="var(--primary)" />
                </div>
                <button onClick={(e) => handleDelete(list.id, e)} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>
                  <Trash2 size={20} />
                </button>
              </div>
              
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{list.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', minHeight: '42px' }}>
                {list.description || 'Aucune description fournie pour cette liste.'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '500' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={16} /> {list.products_count}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} /> {new Date(list.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={`badge ${list.status === 'completed' ? 'badge-success' : 'badge-blue'}`}>
                  {list.status}
                </span>
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
              <Package size={64} style={{ marginBottom: '20px', opacity: 0.1 }} />
              <h3 style={{ color: 'var(--text-muted)' }}>Vous n'avez pas encore de listes</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>Regroupez vos produits pour les gérer plus efficacement.</p>
              <button className="btn btn-primary" onClick={onNewList}>Créer ma première liste</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductLists;
