import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Camera, Image as ImageIcon, Sparkles, 
  ChevronLeft, ChevronRight, Edit3, Trash2, 
  FileSpreadsheet, Download, RefreshCw, CheckCircle2,
  Loader2, X, AlertCircle
} from 'lucide-react';
import { CATEGORIES } from '../mock/data';
import { ProductService } from '../api/ProductService';
import { useToast } from '../context/ToastContext';

const AddProduct = ({ listId, onFinish }) => {
  const [step, setStep] = useState('upload'); // upload, scanning, editing, exported
  const [products, setProducts] = useState([]); 
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const pollIntervals = useRef({});

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const data = await ProductService.getPlatforms();
        setPlatforms(data);
        if (data.length > 0) setSelectedPlatform(data[0].id);
      } catch (err) {
        console.error("Platforms error:", err);
      }
    };
    fetchPlatforms();
  }, []);

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setStep('scanning');
      setError('');
      
      try {
        const response = await ProductService.analyzeImages(selectedFiles, listId);
        const newProducts = response.products.map((product, idx) => ({
          id: product.id,
          preview: URL.createObjectURL(selectedFiles[idx]),
          status: product.status,
          aiResult: null
        }));
        setProducts(newProducts);
        
        newProducts.forEach(p => startPolling(p.id));
      } catch (err) {
        setError('Échec de la communication avec le serveur. Vérifiez que le backend et le microservice IA sont actifs.');
        setStep('upload');
      }
    }
  };

  const startPolling = (productId) => {
    if (pollIntervals.current[productId]) return;

    pollIntervals.current[productId] = setInterval(async () => {
      try {
        const product = await ProductService.getProduct(productId);
        if (product.status === 'analyzed') {
          clearInterval(pollIntervals.current[productId]);
          delete pollIntervals.current[productId];
          
          setProducts(prev => prev.map(p => 
            p.id === productId ? { ...p, status: 'analyzed', aiResult: product } : p
          ));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);
  };

  useEffect(() => {
    const allAnalyzed = products.length > 0 && products.every(p => p.status === 'analyzed');
    if (allAnalyzed && step === 'scanning') {
      setStep('editing');
    }
  }, [products, step]);

  const handleFieldChange = (index, field, value) => {
    setProducts(prev => {
      const newProducts = [...prev];
      newProducts[index].aiResult = {
        ...newProducts[index].aiResult,
        [field]: value
      };
      return newProducts;
    });
  };

  const handleSaveAndExport = async () => {
    setExporting(true);
    try {
      // 1. Save all product changes
      for (const product of products) {
        await ProductService.updateProduct(product.id, {
          ...product.aiResult,
          status: 'completed'
        });
      }

      // 2. Generate batch export for the list
      console.log("Starting batch export for list:", listId, "to platform:", selectedPlatform);
      const toastId = addToast("Préparation de l'exportation...", "loading", Infinity);
      const res = await ProductService.createListExport(listId, selectedPlatform);
      
      if (res.id) {
        try {
          const downloadUrl = ProductService.getDownloadUrl(res.id);
          const response = await fetch(downloadUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
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

      setStep('exported');
    } catch (err) {
      console.error("Export error:", err);
      addToast("Une erreur est survenue lors de l'exportation.", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {step === 'upload' && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Ajouter des produits</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '40px' }}>
            Téléchargez les photos de vos produits pour une extraction automatique.
          </p>
          
          <div 
            onClick={() => document.getElementById('file-upload').click()}
            style={{ 
              border: '2px dashed var(--border)', 
              borderRadius: '24px', 
              padding: '80px 40px',
              background: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'white'; }}
          >
            <div style={{ background: 'var(--primary-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Upload size={32} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Glissez-déposez vos photos</h3>
            <p style={{ color: 'var(--text-muted)' }}>ou cliquez pour parcourir vos fichiers (JPG, PNG)</p>
            <input id="file-upload" type="file" multiple hidden onChange={handleUpload} accept="image/*" />
          </div>

          {error && (
            <div className="animate-fade-in" style={{ marginTop: '24px', padding: '16px', background: '#fef2f2', color: '#ef4444', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <AlertCircle size={20} /> {error}
            </div>
          )}
        </div>
      )}

      {step === 'scanning' && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 32px' }}>
            <Loader2 size={120} className="spin" color="var(--primary)" style={{ opacity: 0.1 }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={48} color="var(--primary)" className="pulse" />
            </div>
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Analyse par l'IA en cours...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '40px' }}>
            Nous extrayons les détails de vos {products.length} images.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-center, minmax(100px, 1fr))', gap: '12px', justifyContent: 'center', display: 'flex', flexWrap: 'wrap' }}>
            {products.map(p => (
              <div key={p.id} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '2px solid transparent', borderColor: p.status === 'analyzed' ? 'var(--secondary)' : 'transparent' }}>
                <img src={p.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: p.status === 'analyzed' ? 1 : 0.5 }} />
                {p.status === 'analyzed' && (
                  <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--secondary)', borderRadius: '50%', padding: '2px' }}>
                    <CheckCircle2 size={14} color="white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'editing' && products[activeIndex] && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem' }}>Révision des produits <span style={{ color: 'var(--text-light)', fontSize: '1.2rem', fontWeight: '400' }}>({activeIndex + 1}/{products.length})</span></h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setStep('upload')}><X size={18} /> Annuler</button>
              <button className="btn btn-primary" onClick={handleSaveAndExport} disabled={exporting}>
                {exporting ? <Loader2 size={18} className="spin" /> : <FileSpreadsheet size={18} />} Confirmer et Exporter
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative', height: 'fit-content' }}>
              <img src={products[activeIndex].preview} alt="" style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain', background: '#f8fafc' }} />
              <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-secondary" 
                  disabled={activeIndex === 0} 
                  onClick={() => setActiveIndex(prev => prev - 1)}
                  style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0 }}
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  className="btn btn-secondary" 
                  disabled={activeIndex === products.length - 1} 
                  onClick={() => setActiveIndex(prev => prev + 1)}
                  style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0 }}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Nom du produit</label>
                <input 
                  type="text" 
                  className="input" 
                  value={products[activeIndex].aiResult?.name || ''} 
                  onChange={(e) => handleFieldChange(activeIndex, 'name', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={labelStyle}>Catégorie</label>
                  <input 
                    list="category-suggestions"
                    className="input" 
                    value={products[activeIndex].aiResult?.category || ''} 
                    onChange={(e) => handleFieldChange(activeIndex, 'category', e.target.value)}
                    placeholder="Saisissez ou choisissez une catégorie"
                  />
                  <datalist id="category-suggestions">
                    {CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label style={labelStyle}>Prix (€)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={products[activeIndex].aiResult?.price || ''} 
                    onChange={(e) => handleFieldChange(activeIndex, 'price', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Marque</label>
                <input 
                  type="text" 
                  className="input" 
                  value={products[activeIndex].aiResult?.brand || ''} 
                  onChange={(e) => handleFieldChange(activeIndex, 'brand', e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={labelStyle}>Description</label>
                <textarea 
                  className="input" 
                  rows="5" 
                  value={products[activeIndex].aiResult?.description || ''} 
                  onChange={(e) => handleFieldChange(activeIndex, 'description', e.target.value)}
                ></textarea>
              </div>

              <div style={{ padding: '20px', background: 'var(--primary-light)', borderRadius: '16px' }}>
                <label style={labelStyle}>Plateforme cible pour l'export</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  {platforms.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: selectedPlatform === p.id ? 'var(--primary)' : 'var(--border)',
                        background: selectedPlatform === p.id ? 'white' : 'transparent',
                        color: selectedPlatform === p.id ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'exported' && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ background: 'var(--secondary-light)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
            <CheckCircle2 size={54} color="var(--secondary)" />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Exportation réussie !</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
            Vos fichiers CSV ont été générés et téléchargés. Vos produits sont maintenant enregistrés dans votre catalogue.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setStep('upload')}><RefreshCw size={18} /> Nouveau scan</button>
            <button className="btn btn-primary" onClick={onFinish}><ChevronRight size={18} /> Voir mes listes</button>
          </div>
        </div>
      )}

      <style>{`
        .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .7; transform: scale(1.1); } }
      `}</style>
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

export default AddProduct;
