# IA Microservice - Analyse de Produits par Image

Microservice Django pour l'analyse intelligente d'images de produits via GPT-4 Vision.

## Aperçu

Ce service reçoit une image de produit et retourne automatiquement les informations extraites par IA :
- **Nom** du produit
- **Catégorie**
- **Couleur(s)**
- **Marque**
- **Description**
- **Score de confiance**

## Architecture

```
┌─────────────────────────────────────┐
│         Client (Frontend)            │
├─────────────────────────────────────┤
│   POST /api/analyze/ (multipart)     │
│              ↓                       │
│   Django REST Framework              │
│              ↓                       │
│   OpenAI GPT-4 Vision                │
│              ↓                       │
│   Retour JSON avec données produit   │
└─────────────────────────────────────┘
```

## Installation

### Prérequis
- Python 3.10+
- Clé API OpenAI (https://platform.openai.com)

### Setup

```bash
# Installer les dépendances
pip install -r requirements.txt

# Copier le fichier .env
cp .env.example .env

# Configurer la clé API OpenAI dans .env
# OPENAI_API_KEY=sk-your-key-here

# Lancer le serveur
python manage.py runserver

#Lancer le server dans un autre port
python manage.py runserver 5000
```

## Configuration

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DJANGO_SECRET_KEY` | Clé secrète Django | `change-me` |
| `DJANGO_DEBUG` | Mode debug | `True` |
| `OPENAI_API_KEY` | Clé API OpenAI | _(requis)_ |
| `OPENAI_MODEL` | Modèle GPT à utiliser | `gpt-4o-mini` |
| `DJANGO_CORS_ALLOW_ALL` | Autoriser tous les CORS | `True` |

## API Endpoints

### Health Check

```http
GET /api/health/
```

**Réponse :**
```json
{
  "status": "healthy",
  "service": "ia-microservice",
  "ai_configured": true
}
```

### Analyser une Image

**Image unique :**
```http
POST /api/analyze/
Content-Type: multipart/form-data

image: <fichier_image>
```

**Plusieurs images (max 10) :** Chaque image est analysée **individuellement** et retourne son propre résultat.
```http
POST /api/analyze/
Content-Type: multipart/form-data

images: <fichier_image_1>
images: <fichier_image_2>
images: <fichier_image_3>
```

**Formats supportés :** `jpg`, `jpeg`, `png`, `webp`, `gif`
**Taille max par fichier :** 5 MB

**Réponse (image unique) 200 OK :**
```json
{
  "nom": "Chaussure Nike Air Max 90",
  "categorie": "Chaussures de sport",
  "couleur": ["Blanc", "Noir"],
  "marque": "Nike",
  "description": "Chaussure de running Nike Air Max 90 avec semelle à coussin d'air visible...",
  "confiance": 0.92
}
```

**Réponse (multi-images) 200 OK — tableau de résultats :**
```json
[
  {
    "nom": "Chaussure Nike Air Max 90",
    "categorie": "Chaussures de sport",
    "couleur": ["Blanc", "Noir"],
    "marque": "Nike",
    "description": "...",
    "confiance": 0.92
  },
  {
    "nom": "iPhone 15 Pro",
    "categorie": "Smartphone",
    "couleur": ["Titane naturel"],
    "marque": "Apple",
    "description": "...",
    "confiance": 0.95
  },
  {
    "nom": "",
    "categorie": "",
    "couleur": [],
    "marque": "",
    "description": "",
    "confiance": 0.0,
    "erreur": "Image 3: AI returned empty response"
  }
]
```

> **Note :** En mode multi-images, chaque image est analysée **indépendamment**. Si une image échoue, les autres sont quand même traitées et l'erreur est signalée dans l'objet correspondant.

**Erreurs possibles :**

| Code | Description |
|------|-------------|
| `400` | Image manquante, invalide ou trop lourde |
| `422` | Image non analysable (pas un produit) |
| `503` | Service IA indisponible |
| `500` | Erreur serveur |

## Exemples d'utilisation

### cURL

```bash
curl -X POST http://localhost:8000/api/analyze/ \
  -F "image=@path/to/product.jpg"
```

### Python

**Image unique :**
```python
import requests

with open('product.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/analyze/',
        files={'image': f}
    )
    print(response.json())
```

**Multi-images :**
```python
import requests

files = [
    ('images', open('product1.jpg', 'rb')),
    ('images', open('product2.jpg', 'rb')),
    ('images', open('product3.jpg', 'rb')),
]
response = requests.post('http://localhost:8000/api/analyze/', files=files)
results = response.json()  # Returns a list of 3 results
for r in results:
    print(f"{r['nom']} (confiance: {r['confiance']})")
```

### JavaScript (Fetch)

**Image unique :**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('http://localhost:8000/api/analyze/', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

**Multi-images :**
```javascript
const formData = new FormData();
for (const file of fileInput.files) {
  formData.append('images', file);
}

fetch('http://localhost:8000/api/analyze/', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(results => {
  results.forEach(r => console.log(r.nom, r.confiance));
});
```

## Structure du Projet

```
ia_microservice/
├── manage.py
├── requirements.txt
├── .env.example
├── config/
│   ├── settings.py          # Configuration Django
│   ├── urls.py              # URLs principales
│   └── wsgi.py
├── analyzer/
│   ├── views.py             # Endpoints API
│   ├── serializers.py       # Sérialiseurs DRF
│   ├── urls.py              # URLs de l'app
│   ├── tests/
│   │   └── test_views.py    # Tests
│   └── services/
│       └── ai_service.py    # Logique IA (GPT-4 Vision)
└── media/tmp/               # Images temporaires
```

## Tests

```bash
# Lancer tous les tests
python manage.py test

# Tests avec verbosité
python manage.py test -v 2
```

## Développement

```bash
# Lancer le serveur de développement
python manage.py runserver 8000
```

Le serveur sera disponible sur `http://localhost:8000`

## Roadmap

- [ ] Support multi-images (plusieurs angles du produit)
- [ ] Détection automatique de l'orientation
- [ ] Cache des analyses pour éviter les appels API dupliqués
- [ ] Rate limiting
- [ ] Authentification API (API Key / JWT)
- [ ] Support Google Vision AI en alternative

---

*Microservice IA - ImageToCsv Project - Avril 2026*
