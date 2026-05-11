import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Package, CheckCircle2, FileSpreadsheet, 
  Plus, Trash2, Loader2, Sparkles, X, Download,
  ExternalLink, Edit2, Calendar
} from 'lucide-react';
import { ProductService } from '../api/ProductService';
import { CATEGORIES } from '../mock/data';
import { useToast } from '../context/ToastContext';

const ProductListDetail = ({ listId, onBack, onAddProducts }) => {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listData, platformsData] = await Promise.all([
          ProductService.getProductList(listId),
          ProductService.getPlatforms()
        ]);
        setList(listData);
        setPlatforms(platformsData);
        if (platformsData.length > 0) setSelectedPlatform(platformsData[0].id);
      } catch (err) {
        console.error("Fetch detail error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [listId]);

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Supprimer ce produit ?")) {
      try {
        await ProductService.deleteProduct(id);
        setList({ ...list, products: list.products.filter(p => p.id !== id) });
      } catch (err) {
        addToast("Erreur lors de la suppression du produit", "error");
      }
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      category: formData.get('category'),
      price: formData.get('price'),
      brand: formData.get('brand'),
      description: formData.get('description'),
      status: 'completed'
    };

    try {
      const updated = await ProductService.updateProduct(editingProduct.id, data);
      setList({
        ...list,
        products: list.products.map(p => p.id === updated.id ? updated : p)
      });
      setEditingProduct(null);
    } catch (err) {
      addToast("Erreur lors de la mise à jour du produit", "error");
    }
  };

  const handleExport = async () => {
    if (!selectedPlatform) {
      addToast("Veuillez sélectionner une plateforme", "info");
      return;
    }
    setExporting(true);
    const toastId = addToast("Génération du CSV...", "loading", Infinity);
    try {
      const res = await ProductService.createListExport(listId, selectedPlatform);
      
      if (res.id) {
        try {
          const downloadUrl = ProductService.getDownloadUrl(res.id);
          const response = await fetch(downloadUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          // Use a clean filename
          const filename = `export_${selectedPlatform}_${new Date().getTime()}.csv`;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          addToast("Exportation réussie !", "success");
        } catch (fetchErr) {
          console.error("Download error:", fetchErr);
          window.open(res.file_url, '_blank');
        }
      }
    } catch (err) {
      console.error("Export error:", err);
      addToast(err.response?.data?.message || "Erreur export", "error");
    } finally {
      setExporting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === list.products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.products.map(p => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Supprimer les ${selectedIds.length} produits sélectionnés ?`)) {
      try {
        await ProductService.deleteProductsBulk(selectedIds);
        setList({
          ...list,
          products: list.products.filter(p => !selectedIds.includes(p.id))
        });
        setSelectedIds([]);
        addToast(`${selectedIds.length} produits supprimés`, "success");
      } catch (err) {
        addToast("Erreur lors de la suppression groupée", "error");
      }
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <Loader2 className="spin" size={64} color="var(--primary)" />
    </div>
  );

  if (!list) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <h2>Liste introuvable</h2>
      <p style={{ color: 'var(--text-muted)' }}>Vous n'avez pas l'autorisation d'accéder à cette liste ou elle n'existe pas.</p>
      <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '20px' }}>Retour</button>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '32px' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ padding: '8px 16px', marginBottom: '24px', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Retour aux listes
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{list.name}</h1>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={16} /> {list.products.length} produits</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> Créé le {new Date(list.created_at).toLocaleDateString()}</span>
              <button 
                onClick={onAddProducts}
                style={{ 
                  background: 'var(--secondary-light)', 
                  color: 'var(--secondary)', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '2px 10px', 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} /> Ajouter des produits
              </button>
            </div>
          </div>
          
          <div className="card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ minWidth: '160px' }}>
              <label style={miniLabel}>Plateforme</label>
              <select 
                className="input" 
                style={{ height: '42px', padding: '0 12px' }} 
                value={selectedPlatform || ''} 
                onChange={(e) => setSelectedPlatform(e.target.value)}
              >
                {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleExport} disabled={exporting || list.products.length === 0} style={{ height: '42px', marginTop: '16px' }}>
              {exporting ? <Loader2 className="spin" size={18} /> : <FileSpreadsheet size={18} />} Exporter CSV
            </button>
          </div>
        </div>
      </header>

      {selectedIds.length > 0 && (
        <div className="card" style={{ 
          marginBottom: '24px', 
          padding: '16px 24px', 
          background: 'var(--primary)', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '16px',
          animation: 'slideDown 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontWeight: '600' }}>{selectedIds.length} produits sélectionnés</span>
            <button 
              onClick={toggleSelectAll} 
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              {selectedIds.length === list.products.length ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleBulkDelete}
              className="btn" 
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px' }}
            >
              <Trash2 size={18} /> Supprimer la sélection
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {list.products.map(product => (
          <div key={product.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: '220px', position: 'relative', background: '#f1f5f9' }}>
              <img src={`http://localhost:8000/storage/${product.image_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>

              <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                <button onClick={() => setEditingProduct(product)} className="action-circle-btn"><Edit2 size={16} /></button>
                <button onClick={() => handleDeleteProduct(product.id)} className="action-circle-btn delete"><Trash2 size={16} /></button>
              </div>
              <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                <span className={`badge ${product.status === 'completed' ? 'badge-success' : 'badge-blue'}`}>
                  {product.status}
                </span>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '4px', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name || 'Sans titre'}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{product.category || 'Non classé'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--primary)' }}>{product.price ? `${product.price} €` : '-'}</span>
                {product.status === 'completed' && <CheckCircle2 size={20} color="var(--secondary)" />}
              </div>
            </div>
          </div>
        ))}
        
        <div 
          className="card" 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', background: 'transparent', cursor: 'pointer', minHeight: '340px' }} 
          onClick={onAddProducts}
        >
          <div style={{ background: 'var(--border)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <Plus size={32} color="var(--text-muted)" />
          </div>
          <p style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Ajouter des produits</p>
        </div>
      </div>

      {editingProduct && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', position: 'relative', padding: '40px' }}>
            <button onClick={() => setEditingProduct(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '32px' }}>Modifier le produit</h2>
            <form onSubmit={handleUpdateProduct}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Nom complet</label>
                <input type="text" name="name" className="input" defaultValue={editingProduct.name} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Catégorie</label>
                  <input 
                    list="category-suggestions-modal"
                    name="category"
                    className="input" 
                    defaultValue={editingProduct.category} 
                    placeholder="Saisissez ou choisissez une catégorie"
                  />
                  <datalist id="category-suggestions-modal">
                    {CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label style={labelStyle}>Prix (€)</label>
                  <input type="number" name="price" className="input" defaultValue={editingProduct.price} step="0.01" />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Marque</label>
                <input type="text" name="brand" className="input" defaultValue={editingProduct.brand} />
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={labelStyle}>Description détaillée</label>
                <textarea name="description" className="input" rows="4" defaultValue={editingProduct.description}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px' }}>Enregistrer les modifications</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .action-circle-btn {
          background: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition: all 0.2s;
        }
        .action-circle-btn:hover {
          color: var(--primary);
          transform: scale(1.1);
        }
        .action-circle-btn.delete:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
};

const miniLabel = { fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '4px', display: 'block' };
const labelStyle = { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' };

export default ProductListDetail;
