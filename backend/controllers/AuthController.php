<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/Response.php';
require_once __DIR__ . '/../services/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

class AuthController
{
    public function register(): void
    {
        $db = Database::connect();
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        Validator::required($body, ['name', 'email', 'password', 'password_confirmation']);

        // Bug corrigé : /auth/register n'avait aucune protection anti-abus, contrairement
        // à /auth/login — un script pouvait créer des centaines de faux comptes "pending".
        RateLimiter::check('register_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 10, 3600);

        if (!Validator::email($body['email'])) {
            Response::error('Email invalide', 'VALIDATION_422', 422);
        }
        if ($body['password'] !== $body['password_confirmation']) {
            Response::error('Les mots de passe ne correspondent pas', 'VALIDATION_422', 422);
        }
        if (strlen($body['password']) < 8) {
            Response::error('Le mot de passe doit contenir au moins 8 caractères', 'VALIDATION_422', 422);
        }

        $username = isset($body['username']) ? trim($body['username']) : null;
        if ($username === '') $username = null;
        if ($username !== null && !preg_match('/^[a-zA-Z0-9_.-]{3,50}$/', $username)) {
            Response::error('Pseudo invalide (3 à 50 caractères, lettres/chiffres/./_/- uniquement)', 'VALIDATION_422', 422);
        }

        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$body['email']]);
        if ($stmt->fetch()) {
            Response::error('Cet email est déjà utilisé', 'AUTH_409', 409);
        }
        if ($username !== null) {
            $stmt = $db->prepare('SELECT id FROM users WHERE username = ?');
            $stmt->execute([$username]);
            if ($stmt->fetch()) {
                Response::error('Ce pseudo est déjà utilisé', 'AUTH_409', 409);
            }
        }

        $hash = password_hash($body['password'], PASSWORD_DEFAULT);
        $stmt = $db->prepare(
            'INSERT INTO users (name, username, email, phone, password_hash, role, status)
             VALUES (?, ?, ?, ?, ?, "member", "pending")'
        );
        $stmt->execute([$body['name'], $username, $body['email'], $body['phone'] ?? null, $hash]);

        Response::success(['id' => $db->lastInsertId()], 'Inscription enregistrée. En attente d\'approbation par l\'administrateur.', 201);
    }

    public function login(): void
    {
        $db = Database::connect();
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        // Item 13 : connexion par email OU pseudo — un seul champ "identifiant", pas de
        // détection de format côté client, on tente juste les deux colonnes en base.
        Validator::required($body, ['identifier', 'password']);

        RateLimiter::check('login_' . $body['identifier']);

        $stmt = $db->prepare('SELECT * FROM users WHERE email = ? OR username = ?');
        $stmt->execute([$body['identifier'], $body['identifier']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($body['password'], $user['password_hash'])) {
            Response::error('Identifiants invalides', 'AUTH_001', 401);
        }

        if ($user['status'] === 'pending') {
            Response::error('Votre connexion est en attente d\'approbation. Veuillez réessayer après 24h.', 'AUTH_PENDING', 403);
        }
        if ($user['status'] === 'rejected' || $user['status'] === 'suspended') {
            Response::error('Compte refusé ou suspendu. Contactez l\'administrateur.', 'AUTH_BLOCKED', 403);
        }

        RateLimiter::reset('login_' . $body['identifier']);

        AuthMiddleware::start();
        unset($user['password_hash']);
        $_SESSION['user'] = $user;

        Response::success($user, 'Connexion réussie');
    }

    public function logout(): void
    {
        AuthMiddleware::start();
        $_SESSION = [];
        session_destroy();
        Response::success([], 'Déconnexion réussie');
    }

    public function me(): void
    {
        $user = AuthMiddleware::currentUser();
        if (!$user) Response::error('Non authentifié', 'AUTH_401', 401);
        Response::success($user);
    }

    public function changePassword(): void
    {
        $user = AuthMiddleware::requireAuth();
        $db = Database::connect();
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        Validator::required($body, ['current_password', 'new_password']);

        $stmt = $db->prepare('SELECT password_hash FROM users WHERE id = ?');
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch();

        if (!$row || !password_verify($body['current_password'], $row['password_hash'])) {
            Response::error('Mot de passe actuel incorrect', 'AUTH_401', 401);
        }
        if (strlen($body['new_password']) < 8) {
            Response::error('Le nouveau mot de passe doit contenir au moins 8 caractères', 'VALIDATION_422', 422);
        }

        $newHash = password_hash($body['new_password'], PASSWORD_DEFAULT);
        $stmt = $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
        $stmt->execute([$newHash, $user['id']]);

        Response::success([], 'Mot de passe modifié');
    }

    /** Admin génère un code temporaire (aucun SMTP/OTP) */
    public function generateResetCode(int $userId): void
    {
        AuthMiddleware::requireRole('admin');
        $db = Database::connect();

        $code = strtoupper(bin2hex(random_bytes(4))); // ex: A1B2C3D4
        $hash = password_hash($code, PASSWORD_DEFAULT);
        // Utiliser la même horloge que la vérification SQL (NOW()) évite un
        // décalage lorsque le fuseau PHP diffère de celui de MySQL.
        $expiresAt = $db->query('SELECT DATE_ADD(NOW(), INTERVAL 30 MINUTE)')->fetchColumn();

        $stmt = $db->prepare(
            'INSERT INTO password_resets (user_id, code_hash, expires_at, used) VALUES (?, ?, ?, 0)'
        );
        $stmt->execute([$userId, $hash, $expiresAt]);

        // Le code est affiché une seule fois à l'Admin, qui le communique manuellement.
        Response::success(['code' => $code, 'expires_at' => $expiresAt], 'Code de récupération généré');
    }

    public function resetPassword(): void
    {
        $db = Database::connect();
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        Validator::required($body, ['email', 'code', 'new_password']);

        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$body['email']]);
        $user = $stmt->fetch();
        if (!$user) Response::error('Compte introuvable', 'AUTH_404', 404);

        $stmt = $db->prepare(
            'SELECT * FROM password_resets WHERE user_id = ? AND used = 0 AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 5'
        );
        $stmt->execute([$user['id']]);
        $candidates = $stmt->fetchAll();

        $match = null;
        foreach ($candidates as $c) {
            if (password_verify($body['code'], $c['code_hash'])) { $match = $c; break; }
        }
        if (!$match) Response::error('Code invalide ou expiré', 'AUTH_422', 422);

        if (strlen($body['new_password']) < 8) {
            Response::error('Le nouveau mot de passe doit contenir au moins 8 caractères', 'VALIDATION_422', 422);
        }

        $db->prepare('UPDATE password_resets SET used = 1 WHERE id = ?')->execute([$match['id']]);
        $newHash = password_hash($body['new_password'], PASSWORD_DEFAULT);
        $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$newHash, $user['id']]);

        Response::success([], 'Mot de passe réinitialisé. Vous pouvez vous connecter.');
    }
}
