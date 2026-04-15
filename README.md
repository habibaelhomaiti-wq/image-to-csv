# ImageToCsv - Logiciel de Publication Automatique de Produits

> **Un seul clic de l'appareil photo suffit pour mettre votre produit en vente partout.**

## Description

ImageToCsv est un logiciel intelligent qui permet de photographier un produit, d'extraire automatiquement ses informations via l'IA, puis de générer un fichier CSV prêt à être importé sur plusieurs plateformes de vente en ligne (Marjane, Jumia, Avito, etc.).

Ce projet élimine les tâches répétitives de saisie manuelle pour les vendeurs en ligne : finis les formulaires à remplir plateforme par plateforme.

## Fonctionnalités Principales

| # | Module | Description | Priorité |
|---|--------|-------------|----------|
| 1 | **Capture Photo** | Prise de photo du produit via caméra ou upload d'image | Critique |
| 2 | **Analyse IA** | Reconnaissance automatique : nom, catégorie, couleur, marque, description | Critique |
| 3 | **Fiche Produit** | Affichage et édition des données extraites par l'IA avant publication | Critique |
| 4 | **Multi-Publication** | Génération d'un fichier CSV formaté prêt à être importé sur Marjane, Jumia, etc. | Critique |
| 5 | **Gestion Plateformes** | Sélection de la plateforme cible et adaptation du format CSV | Haute |
| 6 | **Tableau de Bord** | Suivi des publications, statuts et historique par produit | Haute |
| 7 | **Gestion Stock** | Suivi des quantités disponibles incluses dans le fichier CSV | Moyenne |
| 8 | **Notifications** | Alertes en cas d'erreur de génération ou de rupture de stock | Moyenne |

## Parcours Utilisateur

1. **Nouveau Produit** → L'utilisateur ouvre l'application et clique sur "Nouveau Produit"
2. **Capture** → Il prend une photo du produit (ou importe une image)
3. **Analyse IA** → L'IA analyse l'image et extrait automatiquement les informations
4. **Vérification** → L'utilisateur vérifie et complète/corrige les données
5. **Prix & Stock** → Il saisit le prix et la quantité disponible
6. **Plateforme** → Il sélectionne la plateforme cible (Marjane, Jumia, etc.)
7. **Génération CSV** → Le système produit un fichier CSV formaté
8. **Import** → Le fichier est téléchargé et prêt à être importé sur la plateforme

## Plateformes Cibles Supportées

- **Marjane Online** (Maroc)
- **Jumia Maroc**
- **Avito Maroc**
- *Extensions futures* : Amazon, eBay, Shopify

## Architecture Technique

```
┌─────────────────────────────────────────────────┐
│              Frontend (React.js)                 │
│         Interface Utilisateur                    │
├─────────────────────────────────────────────────┤
│              Backend API (Laravel)               │
│         Logique métier & Génération CSV          │
├─────────────────────────────────────────────────┤
│          Microservice IA (Django/FastAPI)        │
│         Vision par ordinateur (GPT-4 Vision,     │
│         Google Vision AI, modèle local)          │
├─────────────────────────────────────────────────┤
│         Base de Données (MySQL)                  │
│         Stockage produits, historique, configs   │
└─────────────────────────────────────────────────┘
```

### Technologies Recommandées

| Composant | Technologie | Alternatives |
|-----------|-------------|--------------|
| Interface Utilisateur | React.js | Vue.js, Angular |
| Backend API | Laravel (PHP) | Node.js, Symfony |
| IA Vision | Microservice IA (Django) | FastAPI, Flask |
| Base de Données | MySQL | PostgreSQL, MariaDB |
| File Storage | AWS S3 / Cloudinary | Stockage local |

## Performance Cible

- ⚡ Analyse de l'image par l'IA : **< 5 secondes**
- ⚡ Génération du fichier CSV : **< 5 secondes**
- 👥 Support de **10 utilisateurs simultanés** minimum (phase initiale)
- 📈 Disponibilité cible : **99.5%**

## Sécurité

- 🔒 Authentification obligatoire (email + mot de passe, 2FA optionnel)
- 🔒 Accès HTTPS uniquement
- 🔒 Fichiers CSV supprimés après téléchargement
- 🔒 Conformité RGPD pour les données personnelles

## Installation

> *À compléter lors du développement*

```bash
# Cloner le repository
git clone <url-du-repo>
cd ImageToCsv

# Installer les dépendances
# (commandes à définir selon la stack technique retenue)
```

## Utilisation

> *À compléter lors du développement*

## Roadmap

| Phase | Activités | Durée Estimée |
|-------|-----------|---------------|
| **1. Conception** | Maquettes, architecture, specs techniques | 3-4 semaines |
| **2. Développement Core** | Module IA, interface, backend, générateur CSV | 8-12 semaines |
| **3. Tests & Validation** | Tests fonctionnels, performance, sécurité | 3-4 semaines |
| **4. Déploiement** | Mise en production, formation, support | 2 semaines |

**Durée totale estimée : 4 à 6 mois**

## Livrables

1. Maquettes UI/UX (Figma / PDF)
2. Architecture Technique Détaillée
3. Module Capture & Analyse IA (Code Source)
4. Module Générateur CSV (Code Source)
5. Application Complète Testée (Executable / Web)
6. Manuel Utilisateur (PDF)
7. Documentation Technique

## Glossaire

| Terme | Définition |
|-------|------------|
| **IA / AI** | Intelligence Artificielle - technologie permettant à une machine d'analyser et comprendre des images |
| **API** | Interface de Programmation - permet à deux logiciels de communiquer entre eux |
| **Multi-Publication** | Génération d'un fichier CSV formaté et téléchargé pour importation sur la plateforme choisie |
| **OCR** | Reconnaissance optique de caractères - extraction de texte depuis une image |
| **SKU** | Stock Keeping Unit - code unique identifiant un produit |

## Identification des Risques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Format CSV plateforme change ou incompatible | Moyenne | Élevé | Documenter les formats avant le démarrage |
| Précision IA insuffisante | Faible | Élevé | Permettre la correction manuelle |
| Dépassement de budget | Moyenne | Moyen | Développement par phases itératives |
| Évolutions des formats CSV des plateformes | Faible | Moyen | Architecture modulaire et versionnage |

---

*Document préparé par IA - Avril 2026 | Confidentiel*
*Basé sur le Cahier des Charges V1.0 - Publication Automatique de Produits via Reconnaissance d'Image par IA*
