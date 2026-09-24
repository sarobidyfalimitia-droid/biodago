import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '../../features/auth/AuthContext';

/**
 * Le frontend vérifie le rôle pour l'UX uniquement — PHP revérifie systématiquement
 * l'authentification et les permissions côté serveur (voir AuthMiddleware.php).
 * Bug #11 corrigé : si la session expire pendant que l'utilisateur est sur une page
 * protégée, isAuthenticated devient false (via l'écouteur dans AuthContext) et ce
 * composant redirige immédiatement — plus d'écran blanc.
 */
export default function ProtectedRoute({ role, children }) {
  const { user, loading, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();

  if (loading) return <p className="p-10 text-center text-earth-500">…</p>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role === 'superadmin' && !isSuperAdmin) return <Navigate to="/admin" />;
  if (role === 'admin' && !isAdmin) return <Navigate to="/member" />;

  return children;
}
