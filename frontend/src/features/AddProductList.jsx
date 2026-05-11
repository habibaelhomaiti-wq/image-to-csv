import React, { useState } from 'react';
import { FolderPlus, ArrowRight, X, Loader2, Info } from 'lucide-react';
import { ProductService } from '../api/ProductService';
import { useToast } from '../context/ToastContext';

const AddProductList = ({ onCancel, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const list = await ProductService.createProductList({ name, description });
      addToast("Liste créée avec succès", "success");
      onSuccess(list.id);
    } catch (err) {
      addToast("Erreur lors de la création de la liste.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '60px auto' }}>
      <div className="card" style={{ padding: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <div style={{ background: 'var(--primary-light)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <FolderPlus size={28} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '1.75rem' }}>Nouvelle Liste</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Donnez un nom à votre lot de produits pour commencer.</p>
          </div>
          <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Nom de la liste</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Ex: Collection Été 2024 - Nike" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={labelStyle}>Description (Optionnel)</label>
            <textarea 
              className="input" 
              rows="4" 
              placeholder="Ajoutez des notes ou des détails sur ce lot..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div style={{ 
            background: '#f8fafc', 
            padding: '16px', 
            borderRadius: '12px', 
            marginBottom: '32px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <Info size={20} color="var(--primary)" style={{ marginTop: '2px' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Après cette étape, vous pourrez télécharger les photos des produits appartenant à cette liste.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1, height: '52px' }} onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, height: '52px' }} disabled={loading || !name}>
              {loading ? <Loader2 className="spin" size={20} /> : (
                <>Créer et Continuer <ArrowRight size={20} /></>
              )}
            </button>
          </div>
        </form>
      </div>
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

export default AddProductList;
