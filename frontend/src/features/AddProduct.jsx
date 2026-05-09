import React, { useState, useEffect, useRef } from 'react';
import { Upload, Camera, BrainCircuit, CheckCircle2, ArrowRight, X, Sparkles, Loader2 } from 'lucide-react';
import { PLATFORMS, CATEGORIES } from '../mock/data';
import { ProductService } from '../api/ProductService';

const AddProduct = () => {
  const [step, setStep] = useState('upload'); // upload, scanning, editing
  const [products, setProducts] = useState([]); // Array of { id, preview, file, status, aiResult }
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pollIntervals = useRef({});

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setStep('scanning');
      setError('');
      
      try {
        const response = await ProductService.analyzeImages(selectedFiles);
        const newProducts = response.products.map((product, idx) => ({
          id: product.id,
          preview: URL.createObjectURL(selectedFiles[idx]),
          file: selectedFiles[idx],
          status: 'pending',
          aiResult: null
        }));
        
        setProducts(newProducts);
        
        // Start polling for all products
        newProducts.forEach(p => startPolling(p.id));
      } catch (err) {
        console.error("Erreur upload batch:", err);
        setError("Erreur lors de l'envoi des images au serveur.");
        setStep('upload');
      }
    }
  };

  const startPolling = (productId) => {
    if (pollIntervals.current[productId]) clearInterval(pollIntervals.current[productId]);

    pollIntervals.current[productId] = setInterval(async () => {
      try {
        const product = await ProductService.getProduct(productId);
        if (product.status === 'completed' || product.status === 'analyzed' || product.ai_raw_metadata) {
          clearInterval(pollIntervals.current[productId]);
          delete pollIntervals.current[productId];

          setProducts(prev => prev.map(p => p.id === productId ? {
            ...p,
            status: 'analyzed',
            aiResult: {
              title: product.name || '',
              description: product.description || '',
              category: product.category || 'Autre',
              price: product.price || '0.00',
              brand: product.brand || '',
              confidence: 0.95
            }
          } : p));

          // If all products are analyzed, we can move to editing if we haven't already
          setStep('editing');
        } else if (product.status === 'failed') {
          clearInterval(pollIntervals.current[productId]);
          delete pollIntervals.current[productId];
          setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'failed' } : p));
        }
      } catch (err) {
        console.error("Erreur polling:", err);
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      Object.values(pollIntervals.current).forEach(clearInterval);
    };
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    const currentProduct = products[activeIndex];
    if (!currentProduct) return;

    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const data = {
        name: formData.get('title'),
        category: formData.get('category'),
        price: formData.get('price'),
        description: formData.get('description'),
        status: 'completed'
      };
      await ProductService.updateProduct(currentProduct.id, data);
      
      // Mark as published in local state
      setProducts(prev => prev.map((p, idx) => idx === activeIndex ? { ...p, status: 'completed' } : p));
      
      // If there are more products to review, move to the next one
      const nextIndex = products.findIndex((p, idx) => idx > activeIndex && p.status === 'analyzed');
      if (nextIndex !== -1) {
        setActiveIndex(nextIndex);
      } else {
        alert("Produit publié avec succès !");
      }
    } catch (err) {
      console.error("Erreur publication:", err);
      alert("Erreur lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  const currentProduct = products[activeIndex];
  const aiResult = currentProduct?.aiResult;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {step === 'upload' && (
        <div className="glass-card" style={{ 
          height: '500px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '2px dashed var(--border-color)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            padding: '24px',
            borderRadius: '50%',
            marginBottom: 'var(--spacing-md)'
          }}>
            <Upload size={48} color="var(--accent-primary)" />
          </div>
          <h2 style={{ marginBottom: '8px' }}>Scannez vos produits</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
            Sélectionnez une ou plusieurs images pour commencer l'analyse IA.
          </p>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <label className="upload-btn primary">
              <input type="file" hidden multiple onChange={handleUpload} accept="image/*" />
              <Camera size={20} /> Sélectionner des Photos
            </label>
          </div>
        </div>
      )}

      {step === 'scanning' && (
        <div className="glass-card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '500px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: 'var(--spacing-md)' }}>
            {products.map((p, idx) => (
              <div key={idx} style={{ position: 'relative', height: '150px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <img src={p.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="scanner-line"></div>
                {p.status === 'analyzed' && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--accent-secondary)', borderRadius: '50%', padding: '4px' }}>
                    <CheckCircle2 size={16} color="white" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ 
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <BrainCircuit size={48} color="var(--accent-primary)" className="pulse" />
            <h3 style={{ marginTop: '16px', color: 'white' }}>Analyse par l'IA en cours...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Traitement de {products.length} image(s)</p>
          </div>
        </div>
      )}

      {step === 'editing' && currentProduct && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--spacing-lg)' }}>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '400px' }}>
              <img src={currentProduct.preview} alt="Active" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ 
                position: 'absolute', 
                bottom: '12px', 
                left: '12px', 
                background: 'rgba(0,0,0,0.6)', 
                padding: '4px 8px', 
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: 'white'
              }}>
                Produit {activeIndex + 1} / {products.length}
              </div>
            </div>
            
            <div style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
                {products.map((p, idx) => (
                  <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                    <img 
                      src={p.preview} 
                      onClick={() => setActiveIndex(idx)}
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '4px', 
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: activeIndex === idx ? '2px solid var(--accent-primary)' : '2px solid transparent',
                        opacity: activeIndex === idx ? 1 : 0.6
                      }} 
                    />
                    {p.status === 'completed' && (
                      <div style={{ position: 'absolute', top: -5, right: -5, background: 'var(--accent-secondary)', borderRadius: '50%', padding: '2px' }}>
                        <CheckCircle2 size={12} color="white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                <Sparkles size={16} />
                <span>{currentProduct.status === 'analyzed' ? 'Analyse IA Terminée' : (currentProduct.status === 'completed' ? 'Publié' : 'Analyse en cours...')}</span>
              </div>
            </div>
          </div>

          {aiResult ? (
            <form className="glass-card" onSubmit={handlePublish} key={currentProduct.id}>
              <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Réviser la Fiche {products.length > 1 ? `#${activeIndex + 1}` : ''} <CheckCircle2 size={20} color="var(--accent-secondary)" />
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Titre du Produit</label>
                  <input type="text" name="title" className="form-input" defaultValue={aiResult.title} required />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Catégorie</label>
                    <select name="category" className="form-input" defaultValue={aiResult.category}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Prix (€)</label>
                    <input type="number" name="price" className="form-input" defaultValue={aiResult.price} step="0.01" />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea name="description" className="form-input" rows="4" defaultValue={aiResult.description}></textarea>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: 'var(--spacing-md)' }}>
                  <button type="button" className="action-btn secondary" onClick={() => setStep('upload')}>
                    <X size={18} /> Annuler
                  </button>
                  <button type="submit" className="action-btn primary" style={{ flex: 1 }} disabled={loading || currentProduct.status === 'completed'}>
                    {loading ? <Loader2 className="pulse" /> : (currentProduct.status === 'completed' ? 'Déjà Publié' : 'Publier Maintenant')} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Loader2 className="spin" size={32} />
              <p style={{ marginTop: '12px' }}>Attente de l'analyse...</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .upload-btn {
          background: var(--accent-primary);
          color: white;
          padding: 14px 28px;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
        }
        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }
        .form-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: var(--radius-sm);
          color: white;
          font-family: inherit;
          margin-top: 4px;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
        .platform-toggle {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }
        .platform-toggle:hover {
          border-color: var(--accent-primary);
          color: white;
        }
      `}</style>
    </div>
  );
};

const labelStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontWeight: '600'
};

export default AddProduct;
