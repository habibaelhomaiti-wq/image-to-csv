import React, { useState, useEffect } from 'react';
import { Upload, Camera, BrainCircuit, CheckCircle2, ArrowRight, X, Sparkles } from 'lucide-react';
import { PLATFORMS, CATEGORIES } from '../mock/data';

const AddProduct = () => {
  const [step, setStep] = useState('upload'); // upload, scanning, editing
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [aiResult, setAiResult] = useState(null);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const urls = files.map(file => URL.createObjectURL(file));
      setImages(urls);
      setStep('scanning');
    }
  };

  useEffect(() => {
    if (step === 'scanning') {
      const timer = setTimeout(() => {
        setAiResult({
          title: 'Nike Air Max 270 React',
          description: 'La Nike Air Max 270 React utilise la mousse Nike React pour une foulée fluide et légère. Le coloris inspiré des courants artistiques du siècle dernier allie style et confort.',
          category: 'Chaussures',
          price: '150.00',
          tags: ['Nike', 'Sneakers', 'Streetwear', 'React'],
          confidence: 0.98
        });
        setStep('editing');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
            {images.map((img, idx) => (
              <div key={idx} style={{ position: 'relative', height: '150px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="scanner-line"></div>
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
            <h3 style={{ marginTop: '16px', color: 'white' }}>Analyse multi-images en cours...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>L'IA regroupe les informations et compare les angles</p>
          </div>
        </div>
      )}

      {step === 'editing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--spacing-lg)' }}>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '400px' }}>
              <img src={images[activeImage]} alt="Active" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                Image {activeImage + 1} / {images.length}
              </div>
            </div>
            
            <div style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
                {images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    onClick={() => setActiveImage(idx)}
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '4px', 
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: activeImage === idx ? '2px solid var(--accent-primary)' : '2px solid transparent',
                      opacity: activeImage === idx ? 1 : 0.6
                    }} 
                  />
                ))}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                <Sparkles size={16} />
                <span>Analyse Multi-Angle Terminée</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {images.length} photos analysées. L'IA a fusionné les données pour une meilleure précision.
              </p>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Réviser la Fiche Produit <CheckCircle2 size={20} color="var(--accent-secondary)" />
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Titre du Produit</label>
                <input type="text" className="form-input" defaultValue={aiResult.title} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Catégorie</label>
                  <select className="form-input">
                    {CATEGORIES.map(c => <option key={c} selected={c === aiResult.category}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Prix (€)</label>
                  <input type="number" className="form-input" defaultValue={aiResult.price} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea className="form-input" rows="4" defaultValue={aiResult.description}></textarea>
              </div>

              <div>
                <label style={labelStyle}>Plateformes de Publication</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {PLATFORMS.map(p => (
                    <button key={p.id} className="platform-toggle">
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'var(--spacing-md)' }}>
                <button className="action-btn secondary" onClick={() => setStep('upload')}>
                  <X size={18} /> Annuler
                </button>
                <button className="action-btn primary" style={{ flex: 1 }}>
                  Publier Maintenant <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
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
