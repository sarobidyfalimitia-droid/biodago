<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class MemberController
{
    public function index(): void
    {
        AuthMiddleware::requireRole('admin');
        $db = Database::connect();

        $where = ["role NOT IN ('admin','superadmin')"]; $params = [];
        if (!empty($_GET['status']) && $_GET['status'] !== 'all') {
            $where[] = 'status = ?'; $params[] = $_GET['status'];
        }
        if (!empty($_GET['q'])) {
            $where[] = '(name LIKE ? OR email LIKE ?)';
            $like = '%' . $_GET['q'] . '%';
            array_push($params, $like, $like);
        }

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $countStmt = $db->prepare('SELECT COUNT(*) FROM users WHERE ' . implode(' AND ', $where));
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $sql = 'SELECT id, name, email, phone, status, created_at FROM users WHERE ' . implode(' AND ', $where)
             . " ORDER BY created_at DESC LIMIT {$limit} OFFSET {$offset}";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        Response::success($stmt->fetchAll(), null, 200, [
            'page' => $page, 'limit' => $limit, 'total' => $total, 'totalPages' => (int) ceil($total / $limit),
        ]);
    }

    /** Bug #17 : route de consultation d'un profil membre, manquante jusqu'ici. */
    public function show(int $id): void
    {
        AuthMiddleware::requireRole('admin');
        $db = Database::connect();
        $stmt = $db->prepare('SELECT id, name, email, phone, status, role, created_at FROM users WHERE id=?');
        $stmt->execute([$id]);
        $member = $stmt->fetch();
        if (!$member) Response::error('Membre introuvable', 'NOT_FOUND_404', 404);
        Response::success($member);
    }

    private function setStatus(int $id, string $status): void
    {
        AuthMiddleware::requireRole('admin');
        $db = Database::connect();
        $db->prepare('UPDATE users SET status=? WHERE id=? AND role != "admin"')->execute([$status, $id]);
        Response::success(['id' => $id, 'status' => $status], "Statut mis à jour: {$status}");
    }

    public function approve(int $id): void  { $this->setStatus($id, 'active'); }
    public function reject(int $id): void   { $this->setStatus($id, 'rejected'); }
    public function suspend(int $id): void  { $this->setStatus($id, 'suspended'); }
    public function reactivate(int $id): void { $this->setStatus($id, 'active'); }

    public function destroy(int $id): void
    {
        AuthMiddleware::requireRole('admin');
        $db = Database::connect();
        $db->prepare('DELETE FROM users WHERE id=? AND role != "admin"')->execute([$id]);
        Response::success([], 'Membre supprimé');
    }
}
