<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/Response.php';
require_once __DIR__ . '/../services/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class CategoryController
{
    public function index(): void
    {
        $db = Database::connect();
        $where = ['1=1']; $params = [];
        if (!empty($_GET['type'])) { $where[] = 'type = ?'; $params[] = $_GET['type']; }
        if (!empty($_GET['q']))    { $where[] = 'name LIKE ?'; $params[] = '%' . $_GET['q'] . '%'; }

        $stmt = $db->prepare('SELECT * FROM categories WHERE ' . implode(' AND ', $where) . ' ORDER BY name ASC');
        $stmt->execute($params);
        Response::success($stmt->fetchAll());
    }

    public function show(int $id): void
    {
        $db = Database::connect();
        $stmt = $db->prepare('SELECT * FROM categories WHERE id=?');
        $stmt->execute([$id]);
        $cat = $stmt->fetch();
        if (!$cat) Response::error('Catégorie introuvable', 'NOT_FOUND_404', 404);
        Response::success($cat);
    }

    public function store(): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireActive($user);
        $db = Database::connect();

        $body = $_POST ?: (json_decode(file_get_contents('php://input'), true) ?: []);
        Validator::required($body, ['name', 'type']);
        if (!in_array($body['type'], ['fauna', 'flora'], true)) {
            Response::error('Type invalide (fauna ou flora)', 'VALIDATION_422', 422);
        }

        $slug = Validator::slugify($body['name']);
        $base = $slug; $i = 1;
        while (true) {
            $check = $db->prepare('SELECT id FROM categories WHERE slug=?');
            $check->execute([$slug]);
            if (!$check->fetch()) break;
            $slug = $base . '-' . $i++;
        }

        $image = null;
        if (!empty($_FILES['image'])) {
            require_once __DIR__ . '/../services/UploadService.php';
            $result = UploadService::handle($_FILES['image'], 'categories');
            $image = $result['path'];
        }

        $stmt = $db->prepare('INSERT INTO categories (name, slug, type, description, image, created_by) VALUES (?,?,?,?,?,?)');
        $stmt->execute([$body['name'], $slug, $body['type'], $body['description'] ?? null, $image, $user['id']]);

        Response::success(['id' => $db->lastInsertId(), 'slug' => $slug], 'Catégorie créée', 201);
    }

    public function update(int $id): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireActive($user);
        $db = Database::connect();

        $body = $_POST ?: (json_decode(file_get_contents('php://input'), true) ?: []);
        // Bug #16 corrigé : le type (fauna/flora) est désormais modifiable, avec vérification
        // qu'aucune espèce de l'autre type n'utilise déjà cette catégorie.
        $fields = ['name', 'description', 'type'];
        $set = []; $params = [];
        foreach ($fields as $f) {
            if (array_key_exists($f, $body)) {
                if ($f === 'type') {
                    if (!in_array($body['type'], ['fauna', 'flora'], true)) {
                        Response::error('Type invalide (fauna ou flora)', 'VALIDATION_422', 422);
                    }
                    $otherTable = $body['type'] === 'fauna' ? 'flora' : 'fauna';
                    $check = $db->prepare("SELECT COUNT(*) FROM {$otherTable} WHERE category_id=?");
                    $check->execute([$id]);
                    if ((int) $check->fetchColumn() > 0) {
                        Response::error("Impossible de changer le type : des espèces {$otherTable} utilisent encore cette catégorie", 'CONFLICT_409', 409);
                    }
                }
                $set[] = "{$f} = ?"; $params[] = $body[$f];
            }
        }
        if ($set) {
            $params[] = $id;
            $db->prepare('UPDATE categories SET ' . implode(', ', $set) . ' WHERE id=?')->execute($params);
        }
        Response::success(['id' => $id], 'Catégorie mise à jour');
    }

    public function destroy(int $id): void
    {
        AuthMiddleware::requireRole('admin');
        $db = Database::connect();

        $fauna = $db->prepare('SELECT COUNT(*) FROM fauna WHERE category_id=?');
        $fauna->execute([$id]);
        $flora = $db->prepare('SELECT COUNT(*) FROM flora WHERE category_id=?');
        $flora->execute([$id]);

        $used = (int) $fauna->fetchColumn() + (int) $flora->fetchColumn();
        if ($used > 0 && empty($_GET['force'])) {
            Response::error(
                "Catégorie utilisée par {$used} espèce(s). Déplacez-les avant suppression, ou ajoutez ?force=1&reassign_to=ID.",
                'CONFLICT_409', 409, ['species_count' => $used]
            );
        }

        if ($used > 0 && !empty($_GET['reassign_to'])) {
            $db->prepare('UPDATE fauna SET category_id=? WHERE category_id=?')->execute([$_GET['reassign_to'], $id]);
            $db->prepare('UPDATE flora SET category_id=? WHERE category_id=?')->execute([$_GET['reassign_to'], $id]);
        }

        $db->prepare('DELETE FROM categories WHERE id=?')->execute([$id]);
        Response::success([], 'Catégorie supprimée');
    }
}
