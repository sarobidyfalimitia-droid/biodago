<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/Response.php';
require_once __DIR__ . '/../services/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

/**
 * Gestion des comptes réservée au SuperAdmin : voit et gère TOUS les comptes
 * (membres, admins, superadmins), peut changer les rôles member <-> admin,
 * peut créer d'autres SuperAdmin, mais ne peut JAMAIS supprimer un SuperAdmin
 * (protection en dur, y compris contre lui-même).
 */
class SuperAdminController
{
    public function index(): void
    {
        AuthMiddleware::requireSuperAdmin();
        $db = Database::connect();

        $where = ['1=1']; $params = [];
        if (!empty($_GET['role']) && $_GET['role'] !== 'all') {
            $where[] = 'role = ?'; $params[] = $_GET['role'];
        }
        if (!empty($_GET['q'])) {
            $where[] = '(name LIKE ? OR email LIKE ? OR username LIKE ?)';
            $like = '%' . $_GET['q'] . '%';
            array_push($params, $like, $like, $like);
        }

        $stmt = $db->prepare(
            'SELECT id, name, username, email, phone, role, status, created_at FROM users
             WHERE ' . implode(' AND ', $where) . ' ORDER BY FIELD(role,"superadmin","admin","member"), created_at DESC'
        );
        $stmt->execute($params);
        Response::success($stmt->fetchAll());
    }

    /** Change le rôle d'un compte (member <-> admin). Un SuperAdmin ne peut pas être rétrogradé ainsi. */
    public function changeRole(int $id): void
    {
        $actor = AuthMiddleware::requireSuperAdmin();
        $db = Database::connect();
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        Validator::required($body, ['role']);

        if (!in_array($body['role'], ['member', 'admin', 'superadmin'], true)) {
            Response::error('Rôle invalide', 'VALIDATION_422', 422);
        }

        $stmt = $db->prepare('SELECT * FROM users WHERE id=?');
        $stmt->execute([$id]);
        $target = $stmt->fetch();
        if (!$target) Response::error('Compte introuvable', 'NOT_FOUND_404', 404);

        if ($target['role'] === 'superadmin' && $body['role'] !== 'superadmin') {
            Response::error('Impossible de rétrograder un Super Administrateur', 'AUTH_403', 403);
        }

        $newStatus = $body['role'] !== 'member' ? 'active' : $target['status'];
        $db->prepare('UPDATE users SET role=?, status=? WHERE id=?')->execute([$body['role'], $newStatus, $id]);

        Response::success(['id' => $id, 'role' => $body['role']], 'Rôle mis à jour');
    }

    /** Suppression d'un compte — jamais un SuperAdmin, quel que soit qui le demande. */
    public function destroy(int $id): void
    {
        $actor = AuthMiddleware::requireSuperAdmin();
        $db = Database::connect();

        $stmt = $db->prepare('SELECT role FROM users WHERE id=?');
        $stmt->execute([$id]);
        $target = $stmt->fetch();
        if (!$target) Response::error('Compte introuvable', 'NOT_FOUND_404', 404);

        if ($target['role'] === 'superadmin') {
            Response::error('Un compte Super Administrateur ne peut jamais être supprimé', 'AUTH_403', 403);
        }

        $db->prepare('DELETE FROM users WHERE id=?')->execute([$id]);
        Response::success([], 'Compte supprimé');
    }

    /**
     * Un SuperAdmin peut créer directement un autre compte SuperAdmin ou Admin
     * (déjà actif, pas de statut "pending").
     *
     * Le formulaire reprend EXACTEMENT les champs de l'inscription publique
     * (nom, pseudo, email, téléphone, mot de passe + confirmation) afin que le compte
     * créé ici puisse se connecter par email OU par pseudo, comme n'importe quel
     * utilisateur — et que les mêmes contrôles s'appliquent dans les deux cas.
     */
    public function createAccount(): void
    {
        AuthMiddleware::requireSuperAdmin();
        $db = Database::connect();
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        Validator::required($body, ['name', 'email', 'password', 'password_confirmation', 'role']);

        if (!in_array($body['role'], ['admin', 'superadmin'], true)) {
            Response::error('Ce point d\'entrée ne crée que des comptes Admin ou SuperAdmin', 'VALIDATION_422', 422);
        }
        if (!Validator::email($body['email'])) {
            Response::error('Email invalide', 'VALIDATION_422', 422);
        }
        if ($body['password'] !== $body['password_confirmation']) {
            Response::error('Les mots de passe ne correspondent pas', 'VALIDATION_422', 422);
        }
        if (strlen($body['password']) < 8) {
            Response::error('Le mot de passe doit contenir au moins 8 caractères', 'VALIDATION_422', 422);
        }

        // Pseudo facultatif (comme à l'inscription) mais contrôlé s'il est fourni :
        // 3 à 50 caractères, lettres/chiffres/./_/-. C'est ce pseudo que
        // AuthController::login utilise dans « WHERE email = ? OR username = ? ».
        $username = isset($body['username']) ? trim((string) $body['username']) : null;
        if ($username === '') $username = null;
        if ($username !== null && !preg_match('/^[a-zA-Z0-9_.-]{3,50}$/', $username)) {
            Response::error('Pseudo invalide (3 à 50 caractères, lettres/chiffres/./_/- uniquement)', 'VALIDATION_422', 422);
        }

        // Téléphone facultatif : contrôle souple identique au frontend (utils/phone.js).
        $phone = self::normalizePhone($body['phone'] ?? null);
        if ($phone !== null && !preg_match('/^(?:\+|00)?\d{7,15}$/', $phone)) {
            Response::error('Numéro de téléphone invalide (7 à 15 chiffres)', 'VALIDATION_422', 422);
        }

        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$body['email']]);
        if ($stmt->fetch()) Response::error('Cet email est déjà utilisé', 'AUTH_409', 409);

        if ($username !== null) {
            $stmt = $db->prepare('SELECT id FROM users WHERE username = ?');
            $stmt->execute([$username]);
            if ($stmt->fetch()) Response::error('Ce pseudo est déjà utilisé', 'AUTH_409', 409);
        }

        $hash = password_hash($body['password'], PASSWORD_DEFAULT);
        $stmt = $db->prepare(
            'INSERT INTO users (name, username, email, phone, password_hash, role, status)
             VALUES (?,?,?,?,?,?,"active")'
        );
        $stmt->execute([trim((string) $body['name']), $username, $body['email'], $phone, $hash, $body['role']]);

        Response::success(['id' => (int) $db->lastInsertId()], 'Compte créé', 201);
    }

    /**
     * Même normalisation que le formulaire d'inscription : chiffres seuls, les formes
     * internationales malgaches (+261…, 00261…, 261…) reviennent à « 0XXXXXXXXX »,
     * les autres pays gardent leur « + ». Retourne null si vide.
     */
    private static function normalizePhone($value): ?string
    {
        $cleaned = preg_replace('/[\s.\-\/()_]/', '', (string) ($value ?? ''));
        if ($cleaned === '') return null;
        if (preg_match('/^(?:\+|00)?261(\d{9})$/', $cleaned, $m)) return '0' . $m[1];
        if (str_starts_with($cleaned, '+')) return '+' . str_replace('+', '', $cleaned);
        return $cleaned;
    }
}
