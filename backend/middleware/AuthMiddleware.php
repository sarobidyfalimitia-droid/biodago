<?php
/**
 * Middleware d'authentification par session PHP (simple, sans dépendance externe).
 * Vérifie systématiquement rôle + statut côté serveur — jamais confiance au frontend.
 */
class AuthMiddleware
{
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_set_cookie_params([
                'httponly' => true,
                'samesite' => 'Lax',
                'secure'   => (($_SERVER['HTTPS'] ?? '') === 'on'),
            ]);
            session_start();
        }
    }

    public static function currentUser(): ?array
    {
        self::start();
        return $_SESSION['user'] ?? null;
    }

    public static function requireAuth(): array
    {
        $user = self::currentUser();
        if (!$user) {
            Response::error('Authentification requise', 'AUTH_401', 401);
        }
        return $user;
    }

    public static function requireRole(string $role): array
    {
        $user = self::requireAuth();
        // Le SuperAdmin possède toutes les permissions de Membre et d'Admin.
        if ($user['role'] !== $role && $user['role'] !== 'admin' && $user['role'] !== 'superadmin') {
            Response::error('Accès refusé — permissions insuffisantes', 'AUTH_403', 403);
        }
        return $user;
    }

    /** Réservé strictement au SuperAdmin — pas de repli sur 'admin' ici. */
    public static function requireSuperAdmin(): array
    {
        $user = self::requireAuth();
        if ($user['role'] !== 'superadmin') {
            Response::error('Accès réservé au Super Administrateur', 'AUTH_403', 403);
        }
        return $user;
    }

    public static function requireActive(array $user): void
    {
        if ($user['status'] !== 'active') {
            Response::error('Compte inactif', 'AUTH_403', 403);
        }
    }
}
