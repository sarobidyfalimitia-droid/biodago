# État du projet — mise à jour localisation + illustration appliquée

## ✅ Cette mise à jour

1. **Nouvelle illustration** (lémurien + caméléon, forêt tropicale dense) — remplace
   les baobabs sur l'Accueil ET la page Connexion/Inscription. Badge circulaire
   "Ton sanctuaire t'attend" supprimé de l'Accueil.
2. **Localisation GPS, identique pour Faune ET Flore** : bouton "Ajouter un point"
   pour plusieurs lignes latitude/longitude, éditables à la main OU en cliquant sur
   la carte (nouvelles tables `fauna_locations` et `flora_locations`).
3. **Région, identique pour Faune ET Flore, séparée du GPS** : liste déroulante des
   23 régions avec bouton "+" pour en ajouter plusieurs, toujours manuel (nouvelle
   table `fauna_regions`, réutilise `flora_regions` existante).
4. **Filtre par région** sur les galeries publiques Faune et Flore, en plus du
   filtre catégorie — une espèce à plusieurs régions apparaît dans chacune.
5. **Barre de recherche** dans les pages de gestion Faune/Flore (Membre, Admin et
   SuperAdmin — ces deux derniers réutilisant les mêmes composants, la recherche
   est donc automatiquement disponible partout).
6. **Compte Membre de démonstration** ajouté au seed SQL (déjà actif, sans attente
   d'approbation), en plus des comptes Admin et SuperAdmin déjà existants.

## ⚠️ Important avant de tester
Le schéma SQL a encore changé (tables `fauna_regions`, `flora_locations`, nouveau
compte Membre). **Réimportez entièrement `database/biodiversity.sql`** dans une
base vide.

## Identifiants de test (dans le fichier SQL)
- SuperAdmin : `superadmin@biodiversite-mada.mg` / `SuperAdmin@1234`
- Admin : `admin@biodiversite-mada.mg` / `Admin@1234`
- Membre : `membre@biodiversite-mada.mg` / `Membre@1234`
(changez ces mots de passe dès la première connexion)
