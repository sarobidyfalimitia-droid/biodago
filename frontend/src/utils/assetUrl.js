/**
 * Construit l'URL publique d'un fichier uploadé (image faune/flore/blog).
 * Centralise la logique pour éviter les erreurs de chemin dispersées dans les composants
 * (bug #1 : SpeciesCard construisait une URL invalide "/api/../backend/...").
 * 
 * Le chemin stocké en BDD inclut déjà "uploads/" (ex: "uploads/fauna/large/image.jpg").
 */
export function assetUrl(relativePath) {
  if (!relativePath) return null;
  // Le chemin en BDD est déjà "uploads/fauna/large/image.jpg" - on ajoute juste "/"
  return `/${relativePath.replace(/^\/+/, '')}`;
}
