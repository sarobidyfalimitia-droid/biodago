<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/Response.php';
require_once __DIR__ . '/../services/Validator.php';
require_once __DIR__ . '/../services/UploadService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

/**
 * Blog — Membre : CRUD de ses propres articles uniquement.
 *         Admin  : CRUD de tous les articles + publication/dépublication.
 * Toutes les permissions sont revérifiées côté PHP, jamais côté React seul.
 */
class BlogController
{
    public function index(): void
    {
        $db = Database::connect();
        $where = ["b.status = 'published'"]; $params = [];

        $user = AuthMiddleware::currentUser();
        // "mine=1" -> un membre connecté consulte ses propres articles (brouillons inclus)
        if (!empty($_GET['mine']) && $user) {
            $where = ['author_id = ?'];
            $params = [$user['id']];
        } elseif ($user && $user['role'] === 'admin' && !empty($_GET['all'])) {
            $where = ['1=1'];
        }

        if (!empty($_GET['q'])) { $where[] = '(title LIKE ? OR content LIKE ?)'; $like = '%' . $_GET['q'] . '%'; array_push($params, $like, $like); }
        if (!empty($_GET['author_id'])) { $where[] = 'author_id = ?'; $params[] = $_GET['author_id']; }

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(50, max(1, (int)($_GET['limit'] ?? 12)));
        $offset = ($page - 1) * $limit;

        $countStmt = $db->prepare('SELECT COUNT(*) FROM blogs b WHERE ' . implode(' AND ', $where));
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $sql = "SELECT b.*, u.name AS author_name,
                    (SELECT image_path FROM blog_images bi WHERE bi.blog_id=b.id AND bi.is_primary=1 LIMIT 1) AS image
                FROM blogs b
                LEFT JOIN users u ON u.id=b.author_id
                WHERE " . implode(' AND ', $where) . " ORDER BY b.published_at DESC, b.created_at DESC LIMIT {$limit} OFFSET {$offset}";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        Response::success($stmt->fetchAll(), null, 200, [
            'page' => $page, 'limit' => $limit, 'total' => $total, 'totalPages' => (int) ceil($total / $limit),
        ]);
    }

    public function show(string $slug): void
    {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT b.*, u.name AS author_name,
                (SELECT image_path FROM blog_images bi WHERE bi.blog_id=b.id AND bi.is_primary=1 LIMIT 1) AS image
            FROM blogs b
            LEFT JOIN users u ON u.id=b.author_id WHERE b.slug=?");
        $stmt->execute([$slug]);
        $post = $stmt->fetch();
        if (!$post) Response::error('Article introuvable', 'NOT_FOUND_404', 404);

        // Un brouillon n'est visible que par son auteur ou l'Admin
        $user = AuthMiddleware::currentUser();
        if ($post['status'] !== 'published') {
            if (!$user || ($user['role'] !== 'admin' && (int) $post['author_id'] !== (int) $user['id'])) {
                Response::error('Article introuvable', 'NOT_FOUND_404', 404);
            }
        }

        $imgStmt = $db->prepare('SELECT * FROM blog_images WHERE blog_id=? ORDER BY is_primary DESC, id ASC');
        $imgStmt->execute([$post['id']]);
        $post['images'] = $imgStmt->fetchAll();

        // Catégories retirées du Blog : les articles à lire ensuite sont désormais les plus récents.
        $simStmt = $db->prepare("SELECT id, title, slug FROM blogs WHERE id != ? AND status='published' ORDER BY published_at DESC LIMIT 3");
        $simStmt->execute([$post['id']]);
        $post['related'] = $simStmt->fetchAll();

        Response::success($post);
    }

    public function store(): void
    {
        // N'importe quel Membre actif peut créer un article (pas seulement l'Admin)
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireActive($user);
        $db = Database::connect();

        $body = $_POST;
        Validator::required($body, ['title', 'content']);

        $slug = Validator::slugify($body['title']);
        $base = $slug; $i = 1;
        while (true) {
            $check = $db->prepare('SELECT id FROM blogs WHERE slug=?');
            $check->execute([$slug]);
            if (!$check->fetch()) break;
            $slug = $base . '-' . $i++;
        }

        $status = in_array($body['status'] ?? 'draft', ['draft', 'published'], true) ? $body['status'] : 'draft';
        $publishedAt = $status === 'published' ? date('Y-m-d H:i:s') : null;

        $stmt = $db->prepare(
            'INSERT INTO blogs (title, slug, excerpt, content, author_id, status, published_at)
             VALUES (?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $body['title'], $slug, $body['excerpt'] ?? null, $body['content'],
            $user['id'], $status, $publishedAt,
        ]);
        $id = (int) $db->lastInsertId();

        $this->handleImages($db, $id, $_FILES, $body['primary_index'] ?? 0);

        Response::success(['id' => $id, 'slug' => $slug], 'Article créé', 201);
    }

    public function update(int $id): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireActive($user);
        $db = Database::connect();

        $stmt = $db->prepare('SELECT * FROM blogs WHERE id=?');
        $stmt->execute([$id]);
        $post = $stmt->fetch();
        if (!$post) Response::error('Article introuvable', 'NOT_FOUND_404', 404);

        // Un membre ne peut modifier que ses propres articles ; l'Admin peut tout modifier.
        if ($user['role'] !== 'admin' && (int) $post['author_id'] !== (int) $user['id']) {
            Response::error('Vous ne pouvez modifier que vos propres articles', 'AUTH_403', 403);
        }

        $body = $_POST ?: (json_decode(file_get_contents('php://input'), true) ?: []);
        $fields = ['title', 'excerpt', 'content', 'status'];
        $set = []; $params = [];
        foreach ($fields as $f) {
            if (array_key_exists($f, $body)) { $set[] = "{$f} = ?"; $params[] = $body[$f]; }
        }
        if (($body['status'] ?? null) === 'published' && $post['status'] !== 'published') {
            $set[] = 'published_at = NOW()';
        }
        if ($set) {
            $params[] = $id;
            $db->prepare('UPDATE blogs SET ' . implode(', ', $set) . ' WHERE id=?')->execute($params);
        }

        if (!empty($_FILES)) {
            $this->handleImages($db, $id, $_FILES, $body['primary_index'] ?? null);
        }

        Response::success(['id' => $id], 'Article mis à jour');
    }

    public function destroy(int $id): void
    {
        $user = AuthMiddleware::requireAuth();
        $db = Database::connect();

        $stmt = $db->prepare('SELECT * FROM blogs WHERE id=?');
        $stmt->execute([$id]);
        $post = $stmt->fetch();
        if (!$post) Response::error('Article introuvable', 'NOT_FOUND_404', 404);

        if ($user['role'] !== 'admin' && (int) $post['author_id'] !== (int) $user['id']) {
            Response::error('Vous ne pouvez supprimer que vos propres articles', 'AUTH_403', 403);
        }

        $imgStmt = $db->prepare('SELECT * FROM blog_images WHERE blog_id=?');
        $imgStmt->execute([$id]);
        foreach ($imgStmt->fetchAll() as $img) {
            UploadService::delete($img['image_path']);
            UploadService::delete($img['thumbnail_path']);
        }
        $db->prepare('DELETE FROM blog_images WHERE blog_id=?')->execute([$id]);
        $db->prepare('DELETE FROM blogs WHERE id=?')->execute([$id]);

        Response::success([], 'Article supprimé');
    }

    public function deleteImage(int $imageId): void
    {
        $user = AuthMiddleware::requireAuth();
        $db = Database::connect();

        $stmt = $db->prepare('SELECT bi.*, b.author_id FROM blog_images bi JOIN blogs b ON b.id=bi.blog_id WHERE bi.id=?');
        $stmt->execute([$imageId]);
        $img = $stmt->fetch();
        if (!$img) Response::error('Image introuvable', 'NOT_FOUND_404', 404);

        if ($user['role'] !== 'admin' && (int) $img['author_id'] !== (int) $user['id']) {
            Response::error('Accès refusé', 'AUTH_403', 403);
        }

        UploadService::delete($img['image_path']);
        UploadService::delete($img['thumbnail_path']);
        $db->prepare('DELETE FROM blog_images WHERE id=?')->execute([$imageId]);

        Response::success([], 'Image supprimée');
    }

    private function handleImages(PDO $db, int $blogId, array $files, $primaryIndex): void
    {
        if (empty($files['images'])) return;

        $names = $files['images']['name'];
        $count = is_array($names) ? count($names) : 0;
        $insertedIds = [];

        for ($i = 0; $i < $count; $i++) {
            if ($files['images']['error'][$i] !== UPLOAD_ERR_OK) continue;
            $file = [
                'tmp_name' => $files['images']['tmp_name'][$i],
                'error'    => $files['images']['error'][$i],
                'size'     => $files['images']['size'][$i],
            ];
            $result = UploadService::handle($file, 'blogs');
            $isPrimary = ((int) $primaryIndex === $i) ? 1 : 0;

            $stmt = $db->prepare(
                'INSERT INTO blog_images (blog_id, image_path, thumbnail_path, is_primary) VALUES (?,?,?,?)'
            );
            $stmt->execute([$blogId, $result['path'], $result['thumb'], $isPrimary]);
            $insertedIds[$i] = (int) $db->lastInsertId();
        }

        // Corrigé : suit l'index réellement choisi au lieu de la dernière image insérée.
        if ($primaryIndex !== null && isset($insertedIds[(int) $primaryIndex])) {
            $db->prepare('UPDATE blog_images SET is_primary=0 WHERE blog_id=?')->execute([$blogId]);
            $db->prepare('UPDATE blog_images SET is_primary=1 WHERE id=?')->execute([$insertedIds[(int) $primaryIndex]]);
        }
    }
}
