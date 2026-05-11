import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Globe, Database, 
  ChevronRight, Layout, CheckCircle2, Loader2,
  FileCode, ListChecks
} from 'lucide-react';
import { ProductService } from '../api/ProductService';
import { useToast } from '../context/ToastContext';

const DEFAULT_FIELDS = [
  { key: 'name', label: 'Nom du produit', default: 'Product Name' },
  { key: 'description', label: 'Description', default: 'Description' },
  { key: 'price', label: 'Prix', default: 'Price' },
  { key: 'category', label: 'Catégorie', default: 'Category' },
  { key: 'brand', label: 'Marque', default: 'Brand' },
  { key: 'image_url', label: 'URL de l\'image', default: 'Image URL' }
];

const PlatformTemplates = () => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const data = await ProductService.getPlatforms();
        setPlatforms(data);
        if (data.length > 0) setSelectedPlatform(data[0]);
      } catch (err) {
        console.error("Platforms fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlatforms();
  }, []);

  const handleMappingChange = (fieldKey, value) => {
    setSelectedPlatform({
      ...selectedPlatform,
      mapping_config: {
        ...selectedPlatform.mapping_config,
        [fieldKey]: value
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await ProductService.updatePlatform(selectedPlatform.id, {
        mapping_config: selectedPlatform.mapping_config
      });
      addToast('Configuration enregistrée avec succès !', 'success');
      setPlatforms(prev => prev.map(p => p.id === selectedPlatform.id ? selectedPlatform : p));
    } catch (err) {
      addToast("Erreur lors de l'enregistrement.", 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <Loader2 className="spin" size={64} color="var(--primary)" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Gestion des Modèles</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Personnalisez la structure des fichiers CSV pour chaque plateforme.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
        {/* Platform List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={miniLabel}>Plateformes Disponibles</p>
          {platforms.map(p => (
            <div 
              key={p.id}
              onClick={() => setSelectedPlatform(p)}
              className={`card ${selectedPlatform?.id === p.id ? 'active-platform' : ''}`}
              style={{ 
                padding: '16px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                border: selectedPlatform?.id === p.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                background: selectedPlatform?.id === p.id ? 'var(--primary)' : 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Globe size={18} color={selectedPlatform?.id === p.id ? 'white' : 'var(--primary)'} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{p.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.slug}</p>
              </div>
              <ChevronRight size={16} color="var(--text-light)" />
            </div>
          ))}
        </div>

        {/* Mapping Configuration */}
        {selectedPlatform && (
          <div className="card" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--secondary-light)', borderRadius: '14px' }}>
                  <Layout size={24} color="var(--secondary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem' }}>Configuration : {selectedPlatform.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Mappez les colonnes du CSV aux champs de l'IA.</p>
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />} 
                Enregistrer le Modèle
              </button>
            </div>


            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', background: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>
                <Database size={16} /> CHAMP DE DONNÉES (IA)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }}>
                <FileCode size={16} /> NOM DE LA COLONNE (CSV)
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {DEFAULT_FIELDS.map(field => (
                <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center', padding: '0 12px' }}>
                  <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                    {field.label}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '400' }}>{field.key}</p>
                  </div>
                  <input 
                    type="text" 
                    className="input"
                    placeholder={`Défaut: ${field.default}`}
                    value={selectedPlatform.mapping_config?.[field.key] || ''}
                    onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: '40px', padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
              <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px' }}>
                <ListChecks size={24} color="var(--primary)" />
              </div>
              <div>
                <h4 style={{ marginBottom: '4px' }}>Besoin d'aide ?</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Les noms de colonnes que vous définissez ici apparaîtront exactement dans la première ligne de votre fichier CSV exporté. Assurez-vous qu'ils correspondent aux exigences de votre plateforme.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .active-platform {
          background: white !important;
          box-shadow: var(--shadow-lg) !important;
        }
      `}</style>
    </div>
  );
};

const miniLabel = { 
  fontSize: '0.7rem', 
  color: 'var(--text-muted)', 
  textTransform: 'uppercase', 
  fontWeight: '700', 
  letterSpacing: '1px', 
  marginBottom: '8px',
  paddingLeft: '4px'
};

export default PlatformTemplates;
