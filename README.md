# Biodiversité Madagascar

Application web complète : découverte, documentation et conservation de la faune
et de la flore endémiques de Madagascar.

**Stack** : PHP + PDO + MySQL (API REST) · React + TanStack Router/Query/Table +
i18next (mg par défaut) + Leaflet/OpenStreetMap (frontend).

## ⚠️ État de ce scaffold

Ce dépôt implémente **l'architecture complète** demandée (structure de dossiers,
schéma MySQL, permissions membre/admin, sécurité, upload sécurisé, i18n,
TanStack Router/Query, Leaflet) et câble **entièrement de bout en bout** :

- Authentification (inscription → approbation admin → connexion), récupération
  de mot de passe par code admin (sans SMTP/OTP)
- CRUD Faune et Flore avec images multiples, catégories, recherche/filtres,
  pagination serveur
- Observations Faune géolocalisées + carte Leaflet
- Blog avec permissions Membre (CRUD de ses articles) / Admin (CRUD de tous)
  et galerie d'images multiples
- Gestion des membres par l'Admin (approbation, suspension, code de récupération)
- Téléchargement PDF des fiches espèces (générateur PHP pur, sans dépendance —
  voir note dans `backend/services/SimplePdf.php`)
- Dashboard public + Dashboard Admin avec statistiques

Les points suivants sont volontairement simplifiés et à enrichir en production :
- **Carte Flore avec GeoJSON des 22 régions** : la structure (`MadagascarMap.jsx`,
  table `regions`) est en place ; il reste à importer le GeoJSON officiel des
  régions administratives dans `frontend/public/data/regions.geojson` et
  l'afficher avec `<GeoJSON>`.
- **PDF** : le générateur `SimplePdf.php` est fonctionnel mais minimal (texte
  seul, pas d'image intégrée). Pour une mise en page riche, remplacer par
  Dompdf/mPDF via Composer (packagist.org n'était pas accessible pour
  construire ce scaffold).
- **TanStack Table** : les listes Admin utilisent des tableaux HTML simples
  câblés à TanStack Query ; les remplacer par `@tanstack/react-table` (déjà
  dans `package.json`) pour le tri/la pagination avancés si besoin.
- Aucune donnée de démonstration (espèces, articles) n'est insérée au-delà des
  catégories et régions de base — à peupler via l'interface Membre/Admin.

## Démarrage rapide

### Backend (PHP 8.1+, extension GD, MySQL)

```bash
cd backend
cp .env.example .env   # adapter les identifiants MySQL
mysql -u root -p < ../database/biodiversity.sql
php -S localhost:8000 index.php
```

Le premier compte Admin (`admin@biodiversite-mada.mg`) est créé par le script
SQL — **changez son mot de passe dès la première connexion** via
`/auth/change-password` (le hash inséré est un placeholder, régénérez-le avec
`password_hash('VotreMotDePasse', PASSWORD_DEFAULT)`).

### Frontend (Node 18+)

```bash
cd frontend
npm install
npm run dev
```

L'application tourne sur `http://localhost:5173` et proxy `/api/*` vers
`http://localhost:8000` (voir `vite.config.js`).

## Sécurité déjà en place

- Requêtes préparées PDO partout (protection injection SQL)
- `password_hash`/`password_verify`, sessions HttpOnly
- Vérification systématique du rôle et du statut **côté PHP**, jamais confiance
  au frontend seul
- Upload : vérification MIME réelle (`finfo`), taille, dimensions, renommage
  aléatoire, miniatures générées côté serveur
- Rate limiting sur `/auth/login`
- CORS restreint à l'origine du frontend (`FRONTEND_ORIGIN`)

## Structure

Voir l'arborescence complète dans les 37 prompts d'origine — respectée dans
`frontend/src/{app,components,features,pages,services,hooks,i18n}` et
`backend/{config,controllers,models,routes,middleware,services,uploads}`.

## Journal des corrections et évolutions (mise à jour)

### Design
Refonte complète : abandon du style "cartes génériques" pour une esthétique **carnet de
terrain / fiche de spécimen naturaliste**, cohérente avec le sujet (palette forêt/baobab/
parchemin, typographie Fraunces italique pour les noms scientifiques, étiquettes façon
musée, mise en page éditoriale asymétrique). Voir `tailwind.config.js` et `index.css`.

### Nouvelles fonctionnalités
- **2 graphiques** sur le Tableau de bord (`components/charts/`) : taux d'endémisme
  (bâtonnets) et part Madagascar vs Reste du monde (donut), en SVG pur.
- **Carte de Madagascar** (`components/maps/MadagascarMap.jsx`) : régions Flore (polygones
  GeoJSON approximatifs — `frontend/public/data/regions.geojson`, à remplacer par un tracé
  officiel pour un usage précis), marqueurs Faune avec info-bulle au survol, légende.
  Reprise sur la carte générale, les fiches détail (localisation espèce) et le PDF (repère
  schématique).
- Localisation des espèces : `fauna.latitude/longitude` (marqueur ponctuel) et table
  `flora_regions` (multi-sélection de régions pour la flore).
- Édition complète (Faune/Flore/Blog), catégories en liste déroulante, menu "Gestion des
  espèces" et sous-menu compte (Profil / Modifier / Mot de passe / Déconnexion).
- Page À propos enrichie, page Contact avec encart coordonnées.

### Bugs corrigés
#1 URL image (SpeciesCard), #2 logique image principale (Fauna/Flora/Blog), #3-4 création
auto des dossiers generated/cache, #5 upload d'image à la modification d'une observation,
#6 Content-Type PDF, #7 code d'erreur AUTH_403, #8 édition Membre, #9 vue Admin différenciée,
#10 menu mobile Admin/Membre, #11 erreurs Contact, #12 validation téléphone malgache,
#13 coordonnées en nombre, #14 caractères malgaches dans le PDF, #16 changement de type de
catégorie, #17 route GET /members/:id, #18 recherche FULLTEXT, #19 404 sous-routes,
#20 proxy WebSocket, #22 footer traduit, #25 route détail (useParams strict:false),
#28 menu au clic (plus de double-tap mobile), #36 proxy Vite manquant pour /uploads
(cause racine des images invisibles après publication).

### Import de la base de données mise à jour
Le script `database/biodiversity.sql` a changé (nouvelles colonnes/tables). Si vous aviez
déjà importé une version précédente, **réimportez-le entièrement** (il commence par
`CREATE DATABASE IF NOT EXISTS`, mais les `ALTER TABLE` ne sont pas fournis pour une mise à
jour incrémentale — repartez d'une base vide ou adaptez manuellement).
