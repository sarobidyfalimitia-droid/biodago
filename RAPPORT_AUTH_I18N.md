# Rapport — Pages d'authentification publiques & i18n

**Date :** 24/09/2026
**Projet :** Biodiversité Madagascar — backend PHP/MySQL (`backend/`, `database/`) + frontend React/Vite/TanStack Router/i18next (`frontend/`)
**Périmètre :** `/login`, `/register`, `/forgot-password` et les 3 locales (mg, fr, en)

---

## 1. Objectif

1. Rendre le header **transparent** sur les 3 pages d'authentification publiques (elles partagent le même fond « sous-bois » que `/login`).
2. **Harmoniser le placeholder téléphone** dans les 3 langues.
3. Vérifier la **parité des clés i18n** et le **rendu final** dans les 3 langues.
4. **Nettoyer** les scripts temporaires de test.

## 2. Modifications de cette session (2 fichiers)

### 2.1 `frontend/src/components/layout/Header.jsx` — ligne 16

```diff
- const HERO_PAGES = ['/about', '/contact', '/login'];
+ const HERO_PAGES = ['/about', '/contact', '/login', '/register', '/forgot-password'];
```

* Effet : la ligne 39 `const transparent = HERO_PAGES.includes(pathname) && !scrolled;` devient vraie aussi sur `/register` et `/forgot-password` → header **sans pastille opaque**, texte clair au-dessus du fond `LoginBackdrop`, puis fond opaque + ombre dès 40 px de défilement (comportement inchangé et déjà validé sur `/login`).
* Commentaire d'en-tête mis à jour (lignes 14-15) pour documenter pourquoi les 3 pages d'auth sont concernées.

### 2.2 `frontend/src/i18n/locales/en.json` — ligne 55

```diff
- "phone_placeholder": "+261 34 12 345 67",
+ "phone_placeholder": "034 12 345 67",
```

* Désormais identique à `fr.json:55` et `mg.json:55`.
* La clé voisine `phone_invalid` **n'a pas été touchée** : elle illustre volontairement les deux formes (`034 12 345 67` ou `+261 34 12 345 67`).

## 3. Travaux antérieurs de la même tâche (revérifiés, déjà en place)

| Sujet | État vérifié dans le code |
|---|---|
| Layout unifié | Les 3 pages utilisent `<div className="relative isolate -mt-24 overflow-hidden">` + `<LoginBackdrop />` (`Login.jsx:32-33`, `Register.jsx:81-82`, `ForgotPassword.jsx:34-35`). `PublicLayout.jsx` ajoute `pt-24` (les pages d'auth ne sont pas dans son `HERO_PAGES`) : le `-mt-24` le compense exactement → fond derrière le header fixe **sans double marge**. |
| Téléphone (saisie) | `Register.jsx:14-17` — `PHONE_SEPARATORS = /[\s.\-/()_]/g` et `PHONE_REGEX = /^(?:\+|00)?\d{7,15}$/` ; erreur live via `auth.phone_invalid`. |
| Téléphone (stockage) | `Register.jsx:22-29` — `normalizePhone` : `+261…`, `00261…`, `261…` → `0XXXXXXXXX` ; autres pays : `+` conservé ; vide → `null` (`Register.jsx:55`). |
| Bug de persistance i18n | `frontend/src/i18n/index.js` : plus de `lng: 'mg'` figé ; `initialLng` relit `localStorage['i18nextLng']` (repli `mg` au 1er chargement), `supportedLngs: ['mg','fr','en']`, `fallbackLng: 'mg'`. |
| Clés i18n d'auth | 30 clés `auth` dans chacune des 3 locales (badges, indices, placeholders, `identifier`, `reset_code`, panneau latéral…). |

## 4. Vérifications et résultats

Le projet **n'a pas de framework de test** : la validation s'est faite par build de production + navigateur headless.

**Méthode :** `npm run build` (Vite), puis Chrome headless piloté via CDP (port 9222, profil temporaire `%TEMP%\cdp-reg`) — capture d'écran **et** extraction du DOM (`h1`, libellés, placeholders) pour les 3 langues sur les 3 pages.

| Contrôle | Résultat |
|---|---|
| Build production (`npm run build`) | **exit 0** — « built in 30.30s », `dist/index.html` généré. Seul avertissement : chunk > 500 kB (préexistant). |
| 6 captures (login / register / forgot-password × fr / en / mg) | **OK** — `Hiditra`, `Very tenimiafina?`, `S'inscrire`, `Mot de passe oublié ?`, `Sign up`, `Forgot password?`, `Log in`… |
| Header transparent sur `/register` et `/forgot-password` | **OK** — plus de pastille opaque ; identique à `/login` (vérifié sur les captures `reg-en.png` et `fp-mg.png`). |
| Placeholder téléphone (en / fr / mg) | **OK** — `034 12 345 67` dans les 3 langues (`Phone (optional)` / `Téléphone (optionnel)`). |
| Parité des clés i18n | **OK** — fr/en/mg : 8 sections, **65 clés** au total dont **30** pour `auth` ; aucune clé présente dans une seule langue (`fr-only: []`, `en-only: []`, `mg-manque: []`). |
| Persistance de la langue (MG / FR / EN) | **OK** — le choix survit au rechargement (clé `i18nextLng`). |
| Nettoyage | **OK** — 0 fichier `*.tmp.mjs` restant, 0 processus Chrome CDP (profil `cdp-reg` supprimé). |

### Scripts temporaires utilisés puis supprimés
`frontend/i18n-check.tmp.mjs`, `e2e-normalize.tmp.mjs`, `shots.tmp.mjs`, `e2e-phone.tmp.mjs`, `e2e-submit.tmp.mjs`, `phone-check.tmp.mjs`, `probe.tmp.mjs` — supprimés, ainsi que le profil `%TEMP%\cdp-reg` et les captures temporaires.

## 5. Bilan des fichiers touchés

| Fichier | Nature | Contenu |
|---|---|---|
| `frontend/src/components/layout/Header.jsx` | modifié | `HERO_PAGES` + commentaire (l. 14-16) |
| `frontend/src/i18n/locales/en.json` | modifié | `auth.phone_placeholder` (l. 55) |

* Aucun fichier ajouté ni supprimé dans le **code de production** ; aucun artefact de test laissé dans le dépôt.
* Seul fichier ajouté : `RAPPORT_AUTH_I18N.md` (ce rapport, racine du projet) — supprimable sans impact.
* Aucune modification côté backend ni base de données dans cette passe.

## 6. Points d'attention / limites

1. **Pas de tests automatisés** : la non-régression repose sur le build + la vérification visuelle headless ; les scripts de vérification ont été supprimés (volontairement, pour ne pas polluer le dépôt).
2. **`HERO_PAGES` dupliqué** : présent dans `Header.jsx` (gère la transparence : 5 routes) et dans `PublicLayout.jsx` (gère le `pt-24` : 2 routes). Les valeurs diffèrent **volontairement** (rôles différents), mais toute nouvelle page à hero devra être ajoutée au bon endroit — à factoriser pour éviter les oublis.
3. **Validation téléphone côté serveur absente** : `backend/controllers/AuthController.php:54` enregistre `$body['phone'] ?? null` sans contrôle ; colonne `users.phone VARCHAR(30)` (`database/biodiversity.sql:16`). Le frontend normalise (chiffres, forme locale `0XXXXXXXXX`) mais un vrai garde-fou serveur reste souhaitable.
4. **Avertissement Vite** sur des chunks > 500 kB : préexistant, sans lien avec ces changements.
5. Les captures d'écran de vérification ont été supprimées après contrôle : elles sont régénérables (pages publiques, aucune authentification requise).

## 7. Suites suggérées

1. Mettre en place **Vitest** avec des tests unitaires sur `normalizePhone`/`isPhoneValid` et un test de parité des clés i18n (fr/en/mg).
2. **Factoriser** la liste des pages « hero » (transparence header + compensation de padding) en une seule constante partagée.
3. Ajouter une **validation `phone` côté PHP** (regex souple identique au frontend) avant insertion.
4. Mettre en place des **tests E2E** (Playwright) sur le parcours inscription → en attente d'approbation, avec captures par langue.
