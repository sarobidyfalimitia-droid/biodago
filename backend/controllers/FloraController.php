<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/Response.php';
require_once __DIR__ . '/../services/Validator.php';
require_once __DIR__ . '/../services/UploadService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

/**
 * CRUD Flore — même structure que FaunaController.
 */
class FloraController
{
    public function index(): void
    {
        $db = Database::connect();
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $limit  = min(50, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $where = ['1=1'];
        $params = [];

        // Item 8/16 : statut brouillon/publié — un visiteur non connecté ne voit que les
        // fiches publiées ; un utilisateur connecté (membre/admin) voit aussi les brouillons.
        if (!AuthMiddleware::currentUser()) {
            $where[] = "f.status = 'published'";
        }

        if (!empty($_GET['q'])) {
            // Bug #18 corrigé : utilise l'index FULLTEXT existant (MATCH...AGAINST) pour la recherche
            // principale, avec repli sur LIKE pour les termes courts (<4 lettres, hors FULLTEXT).
            if (mb_strlen($_GET['q']) >= 4) {
                $where[] = 'MATCH(f.name, f.scientific_name, f.family, f.habitat) AGAINST (? IN NATURAL LANGUAGE MODE)';
                $params[] = $_GET['q'];
            } else {
                $where[] = '(f.name LIKE ? OR f.scientific_name LIKE ? OR f.family LIKE ?)';
                $like = '%' . $_GET['q'] . '%';
                array_push($params, $like, $like, $like);
            }
        }
        if (!empty($_GET['category_id'])) {
            $where[] = 'f.category_id = ?';
            $params[] = $_GET['category_id'];
        }
        if (!empty($_GET['family'])) {
            $where[] = 'f.family = ?';
            $params[] = $_GET['family'];
        }
        if (!empty($_GET['region'])) {
            $where[] = 'f.region = ?';
            $params[] = $_GET['region'];
        }
        // Item : filtre par région (liste déroulante, comme la catégorie).
        if (!empty($_GET['region_id'])) {
            $where[] = 'EXISTS (SELECT 1 FROM flora_regions fr WHERE fr.flora_id = f.id AND fr.region_id = ?)';
            $params[] = $_GET['region_id'];
        }
        if (!empty($_GET['conservation_status'])) {
            $where[] = 'f.conservation_status = ?';
            $params[] = $_GET['conservation_status'];
        }

        $whereSql = implode(' AND ', $where);
        $sortable = ['name', 'created_at'];
        $sort = in_array($_GET['sort'] ?? '', $sortable, true) ? $_GET['sort'] : 'created_at';
        $order = strtoupper($_GET['order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        $countStmt = $db->prepare("SELECT COUNT(*) FROM flora f WHERE {$whereSql}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $sql = "SELECT f.*, c.name AS category_name,
                    (SELECT image_path FROM species_images si WHERE si.species_type='flora' AND si.species_id=f.id AND si.is_primary=1 LIMIT 1) AS primary_image
                FROM flora f
                LEFT JOIN categories c ON c.id = f.category_id
                WHERE {$whereSql}
                ORDER BY f.{$sort} {$order}
                LIMIT {$limit} OFFSET {$offset}";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        Response::success($stmt->fetchAll(), null, 200, [
            'page' => $page, 'limit' => $limit, 'total' => $total,
            'totalPages' => (int) ceil($total / $limit),
        ]);
    }

    public function show(int $id): void
    {
        $db = Database::connect();
        $stmt = $db->prepare('SELECT f.*, c.name AS category_name FROM flora f LEFT JOIN categories c ON c.id=f.category_id WHERE f.id = ?');
        $stmt->execute([$id]);
        $flora = $stmt->fetch();
        if (!$flora) Response::error('Espèce introuvable', 'NOT_FOUND_404', 404);

        $imgStmt = $db->prepare('SELECT * FROM species_images WHERE species_type="flora" AND species_id=? ORDER BY is_primary DESC, id ASC');
        $imgStmt->execute([$id]);
        $flora['images'] = $imgStmt->fetchAll();

        // Régions multiples associées à cette plante (liste déroulante manuelle)
        $regStmt = $db->prepare(
            'SELECT r.id, r.name, r.geojson_id FROM flora_regions fr JOIN regions r ON r.id=fr.region_id WHERE fr.flora_id=?'
        );
        $regStmt->execute([$id]);
        $flora['regions'] = $regStmt->fetchAll();

        // Un OU plusieurs points de localisation GPS (indépendants des régions)
        $locStmt = $db->prepare('SELECT id, latitude, longitude FROM flora_locations WHERE flora_id=? ORDER BY id ASC');
        $locStmt->execute([$id]);
        $flora['locations'] = $locStmt->fetchAll();

        Response::success($flora);
    }

    /**
     * Fiche complète (sections 1 à 12), identique dans l'esprit à FaunaController::FIELDS
     * mais avec les champs propres à la Flore (hauteur/diamètre, feuilles/racines/fleurs,
     * floraison/fructification/pollinisateurs/sol, comestibilité, récolte excessive...).
     */
    private const FIELDS = [
        'name','scientific_name','category_id','vernacular_name','family','similar_species',
        'description','habitat','region','region_id','conservation_status','characteristics','uses',
        'height_min','height_max','height_avg','canopy_diameter',
        'color','texture',
        'leaf_type','root_type','flower_type',
        'adaptation','environmental_tolerance',
        'lifespan','ecological_role','interspecies_competition','seasonal_strategy',
        'flowering_season','fruiting_season','pollinators','soil_type','growth_rate','maturity_age',
        'health_status','microbiote','parasite_load',
        'human_use','cultural_significance','local_community_use','economic_importance','medicinal_importance',
        'edibility','edible_parts','toxic_parts','traditional_medicinal_uses','food_uses','craft_uses',
        'endemism','protected_area','traditional_knowledge','regional_name_variations',
        'habitat_loss','overharvesting','pollution','climate_change','invasive_species','other_threats',
        'conservation_measures','protection_actions','conservation_programs',
        'status',
    ];

    public function store(): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireActive($user);
        $db = Database::connect();

        $body = $_POST;
        Validator::required($body, ['name', 'scientific_name']);
        $body['status'] = in_array($body['status'] ?? 'published', ['draft', 'published'], true) ? $body['status'] : 'published';
        $body['conservation_status'] = $body['conservation_status'] ?? 'DD';

        $columns = []; $placeholders = []; $params = [];
        foreach (self::FIELDS as $f) {
            $columns[] = $f;
            $placeholders[] = '?';
            $value = $body[$f] ?? null;
            $params[] = ($value === '') ? null : $value;
        }
        $columns[] = 'created_by'; $placeholders[] = '?'; $params[] = $user['id'];

        $stmt = $db->prepare('INSERT INTO flora (' . implode(', ', $columns) . ') VALUES (' . implode(',', $placeholders) . ')');
        $stmt->execute($params);
        $id = (int) $db->lastInsertId();

        $this->handleImages($db, $id, $_FILES, $body['primary_index'] ?? 0);
        $this->syncRegions($db, $id, $body['region_ids'] ?? null);
        $this->syncLocations($db, $id, $body['locations_json'] ?? null);

        Response::success(['id' => $id], 'Espèce créée', 201);
    }

    public function update(int $id): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireActive($user);
        $db = Database::connect();

        $stmt = $db->prepare('SELECT * FROM flora WHERE id=?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) Response::error('Espèce introuvable', 'NOT_FOUND_404', 404);

        $body = $_POST;
        $fields = self::FIELDS;
        $set = []; $params = [];
        foreach ($fields as $f) {
            if (array_key_exists($f, $body)) { $set[] = "{$f} = ?"; $params[] = $body[$f]; }
        }
        if ($set) {
            $params[] = $id;
            $db->prepare('UPDATE flora SET ' . implode(', ', $set) . ' WHERE id = ?')->execute($params);
        }

        if (!empty($_FILES)) {
            $this->handleImages($db, $id, $_FILES, $body['primary_index'] ?? null);
        }
        // Bug corrigé : le frontend envoie désormais toujours un marqueur explicite
        // 'regions_touched=1' dès que l'utilisateur interagit avec la sélection de régions
        // (même s'il les vide toutes), pour distinguer "non modifié" de "vidé volontairement".
        if (array_key_exists('region_ids', $body) || !empty($body['regions_touched'])) {
            $this->syncRegions($db, $id, $body['region_ids'] ?? []);
        }
        if (array_key_exists('locations_json', $body) || !empty($body['locations_touched'])) {
            $this->syncLocations($db, $id, $body['locations_json'] ?? null);
        }

        Response::success(['id' => $id], 'Espèce mise à jour');
    }

    /** La Flore fonctionne désormais comme la Faune pour le GPS : un ou plusieurs points. */
    private function syncLocations(PDO $db, int $floraId, ?string $locationsJson): void
    {
        $points = $locationsJson ? (json_decode($locationsJson, true) ?: []) : [];
        $db->prepare('DELETE FROM flora_locations WHERE flora_id=?')->execute([$floraId]);
        $stmt = $db->prepare('INSERT INTO flora_locations (flora_id, latitude, longitude) VALUES (?,?,?)');
        foreach ($points as $p) {
            if (!isset($p['latitude'], $p['longitude'])) continue;
            $stmt->execute([$floraId, $p['latitude'], $p['longitude']]);
        }
    }

    /** Points GPS agrégés de toutes les plantes publiées, pour la carte générale (filtre Flore). */
    public function mapMarkers(): void
    {
        $db = Database::connect();
        $rows = $db->query(
            "SELECT fl.id AS location_id, fl.latitude, fl.longitude, f.id AS flora_id, f.name, f.family
             FROM flora_locations fl JOIN flora f ON f.id = fl.flora_id
             WHERE f.status = 'published'"
        )->fetchAll();
        Response::success($rows);
    }

    public function destroy(int $id): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireActive($user);
        $db = Database::connect();

        $imgStmt = $db->prepare('SELECT * FROM species_images WHERE species_type="flora" AND species_id=?');
        $imgStmt->execute([$id]);
        foreach ($imgStmt->fetchAll() as $img) {
            UploadService::delete($img['image_path']);
            UploadService::delete($img['thumbnail_path']);
        }
        $db->prepare('DELETE FROM species_images WHERE species_type="flora" AND species_id=?')->execute([$id]);
        $db->prepare('DELETE FROM flora WHERE id=?')->execute([$id]);

        Response::success([], 'Espèce supprimée');
    }

    public function deleteImage(int $imageId): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireActive($user);
        $db = Database::connect();

        $stmt = $db->prepare('SELECT * FROM species_images WHERE id=?');
        $stmt->execute([$imageId]);
        $img = $stmt->fetch();
        if (!$img) Response::error('Image introuvable', 'NOT_FOUND_404', 404);

        UploadService::delete($img['image_path']);
        UploadService::delete($img['thumbnail_path']);
        $db->prepare('DELETE FROM species_images WHERE id=?')->execute([$imageId]);

        Response::success([], 'Image supprimée');
    }

    /** Chaque espèce peut avoir 1 à 3 photos maximum (jamais plus). */
    private const MAX_IMAGES = 3;

    private function handleImages(PDO $db, int $speciesId, array $files, $primaryIndex): void
    {
        if (empty($files['images'])) return;

        $names = $files['images']['name'];
        $count = is_array($names) ? count($names) : 0;
        $insertedIds = [];

        $countStmt = $db->prepare('SELECT COUNT(*) FROM species_images WHERE species_type="flora" AND species_id=?');
        $countStmt->execute([$speciesId]);
        $existing = (int) $countStmt->fetchColumn();
        $slotsLeft = max(0, self::MAX_IMAGES - $existing);

        for ($i = 0; $i < $count && $i < $slotsLeft; $i++) {
            if ($files['images']['error'][$i] !== UPLOAD_ERR_OK) continue;
            $file = [
                'tmp_name' => $files['images']['tmp_name'][$i],
                'error'    => $files['images']['error'][$i],
                'size'     => $files['images']['size'][$i],
            ];
            $result = UploadService::handle($file, 'flora');
            $isPrimary = ((int) $primaryIndex === $i) ? 1 : 0;

            $stmt = $db->prepare(
                'INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary)
                 VALUES ("flora", ?, ?, ?, ?)'
            );
            $stmt->execute([$speciesId, $result['path'], $result['thumb'], $isPrimary]);
            $insertedIds[$i] = (int) $db->lastInsertId();
        }

        // Corrigé : on suit désormais l'index réellement choisi par l'utilisateur pour
        // désigner l'image principale, au lieu de retomber systématiquement sur la dernière insérée.
        if ($primaryIndex !== null && isset($insertedIds[(int) $primaryIndex])) {
            $db->prepare('UPDATE species_images SET is_primary=0 WHERE species_type="flora" AND species_id=?')->execute([$speciesId]);
            $db->prepare('UPDATE species_images SET is_primary=1 WHERE id=?')->execute([$insertedIds[(int) $primaryIndex]]);
        }
    }

    /**
     * Item 27 : synchronise la liste des régions associées à une plante (multi-sélection),
     * $regionIds peut être un tableau d'IDs (POST region_ids[]=1&region_ids[]=2...) ou une
     * chaîne CSV "1,2,3" selon la manière dont FormData sérialise le champ côté frontend.
     */
    private function syncRegions(PDO $db, int $floraId, $regionIds): void
    {
        if ($regionIds === null) return;
        if (is_string($regionIds)) {
            $regionIds = array_filter(array_map('trim', explode(',', $regionIds)), fn($v) => $v !== '');
        }
        $regionIds = array_unique(array_map('intval', (array) $regionIds));

        $db->prepare('DELETE FROM flora_regions WHERE flora_id=?')->execute([$floraId]);
        $stmt = $db->prepare('INSERT INTO flora_regions (flora_id, region_id) VALUES (?, ?)');
        foreach ($regionIds as $rid) {
            if ($rid > 0) $stmt->execute([$floraId, $rid]);
        }
    }
}