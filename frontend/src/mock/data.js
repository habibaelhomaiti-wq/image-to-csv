export const MOCK_STATS = [
  { id: 1, label: 'Produits Publiés', value: '1,284', change: '+12%', trend: 'up' },
  { id: 2, label: 'Temps Économisé', value: '156h', change: '+8h', trend: 'up' },
  { id: 3, label: 'CSV Générés', value: '45', change: '+3', trend: 'up' },
  { id: 4, label: 'Taux de Précision IA', value: '98.2%', change: '-0.1%', trend: 'down' },
];

export const RECENT_PRODUCTS = [
  {
    id: 'p1',
    name: 'Nike Air Max 270',
    category: 'Chaussures',
    status: 'Publié',
    price: '120.00 €',
    platform: 'Shopify',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    date: 'Il y a 2h'
  },
  {
    id: 'p2',
    name: 'iPhone 13 Pro - Graphite',
    category: 'Électronique',
    status: 'En attente',
    price: '850.00 €',
    platform: 'Amazon',
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&q=80',
    date: 'Il y a 5h'
  },
  {
    id: 'p3',
    name: 'Veste en Cuir Vintage',
    category: 'Mode',
    status: 'Brouillon',
    price: '45.00 €',
    platform: 'Vinted',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
    date: 'Hier'
  }
];

export const PLATFORMS = [
  { id: 'shopify', name: 'Shopify', color: '#96bf48' },
  { id: 'amazon', name: 'Amazon', color: '#ff9900' },
  { id: 'ebay', name: 'eBay', color: '#e53238' },
  { id: 'vinted', name: 'Vinted', color: '#00c1d4' },
];

export const CATEGORIES = [
  'Mode', 'Chaussures', 'Électronique', 'Maison', 'Sport', 'Beauté', 'Autre'
];
