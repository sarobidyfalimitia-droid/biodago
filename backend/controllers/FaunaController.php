<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/Response.php';
require_once __DIR__ . '/../services/Validator.php';
require_once __DIR__ . '/../services/UploadService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

/**
 * CRUD Faune — sert aussi de modèle de référence pour Flore (même structure).
 */
class FaunaController
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
        // Item : filtre par région (liste déroulante, comme la catégorie) — une espèce
        // rattachée à plusieurs régions apparaît dans le filtre de chacune d'elles.
        if (!empty($_GET['region_id'])) {
            $where[] = 'EXISTS (SELECT 1 FROM fauna_regions fr WHERE fr.fauna_id = f.id AND fr.region_id = ?)';
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

        $countStmt = $db->prepare("SELECT COUNT(*) FROM fauna f WHERE {$whereSql}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $sql = "SELECT f.*, c.name AS category_name,
                    (SELECT image_path FROM species_images si WHERE si.species_type='fauna' AND si.species_id=f.id AND si.is_primary=1 LIMIT 1) AS primary_image
                FROM fauna f
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
        $stmt = $db->prepare('SELECT f.*, c.name AS category_name FROM fauna f LEFT JOIN categories c ON c.id=f.category_id WHERE f.id = ?');
        $stmt->execute([$id]);
        $fauna = $stmt->fetch();
        if (!$fauna) Response::error('Espèce introuvable', 'NOT_FOUND_404', 404);

        $imgStmt = $db->prepare('SELECT * FROM species_images WHERE species_type="fauna" AND species_id=? ORDER BY is_primary DESC, id ASC');
        $imgStmt->execute([$id]);
        $fauna['images'] = $imgStmt->fetchAll();

        // Un OU plusieurs points de localisation par espèce (remplace l'ancien lat/lng unique)
        $locStmt = $db->prepare('SELECT id, latitude, longitude FROM fauna_locations WHERE fauna_id=? ORDER BY id ASC');
        $locStmt->execute([$id]);
        $fauna['locations'] = $locStmt->fetchAll();

        // Une ou plusieurs régions (liste déroulante manuelle, indépendante du GPS)
        $regStmt = $db->prepare(
            'SELECT r.id, r.name, r.geojson_id FROM fauna_regions fr JOIN regions r ON r.id=fr.region_id WHERE fr.fauna_id=?'
        );
        $regStmt->execute([$id]);
        $fauna['regions'] = $regStmt->fetchAll();

        Response::success($fauna);
    }

    /**
     * Fiche complète (sections 1 à 12) : Identification, Général, Biométrie, Aspect visuel,
     * Anatomie spécifique, Adaptations, Écologie, Santé, Relation humain, Madagascar,
     * Menaces, Conservation. Seuls name/scientific_name/category_id restent obligatoires,
     * tous les autres champs de la fiche sont optionnels et gérés dynamiquement.
     */
    private const FIELDS = [
        'name','scientific_name','category_id','vernacular_name','family','similar_species',
        'description','habitat','region','conservation_status','diet','reproduction','behavior',
        'size_min','size_max','size_avg','wingspan','weight_min','weight_max','weight_avg','sexual_dimorphism',
        'color','texture','eye_color',
        'dentition','appendages','cranial_structures',
        'adaptation','sensory_organs','environmental_tolerance',
        'lifespan','ecological_role','interspecies_competition','migration','seasonal_strategy','circadian_rhythm',
        'health_status','microbiote','parasite_load','disease_vector',
        'human_use','cultural_significance','local_community_use','economic_importance','medicinal_importance',
        'endemism','protected_area','traditional_knowledge','regional_name_variations',
        'habitat_loss','poaching','pollution','climate_change','invasive_species','other_threats',
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

        $stmt = $db->prepare('INSERT INTO fauna (' . implode(', ', $columns) . ') VALUES (' . implode(',', $placeholders) . ')');
        $stmt->execute($params);
        $id = (int) $db->lastInsertId();

        $this->handleImages($db, $id, $_FILES, $body['primary_index'] ?? 0);
        $this->syncLocations($db, $id, $body['locations_json'] ?? null);
        $this->syncRegions($db, $id, $body['region_ids'] ?? null);

        Response::success(['id' => $id], 'Espèce créée', 201);
    }

    public function update(int $id): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireActive($user);
        $db = Database::connect();

        $stmt = $db->prepare('SELECT * FROM fauna WHERE id=?');
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
            $db->prepare('UPDATE fauna SET ' . implode(', ', $set) . ' WHERE id = ?')->execute($params);
        }

        if (!empty($_FILES)) {
            $this->handleImages($db, $id, $_FILES, $body['primary_index'] ?? null);
        }
        if (array_key_exists('locations_json', $body) || !empty($body['locations_touched'])) {
            $this->syncLocations($db, $id, $body['locations_json'] ?? null);
        }
        if (array_key_exists('region_ids', $body) || !empty($body['regions_touched'])) {
            $this->syncRegions($db, $id, $body['region_ids'] ?? []);
        }

        Response::success(['id' => $id], 'Espèce mise à jour');
    }

    /** Régions manuelles (liste déroulante), une ou plusieurs, séparées du GPS. */
    private function syncRegions(PDO $db, int $faunaId, $regionIds): void
    {
        if ($regionIds === null) return;
        if (is_string($regionIds)) {
            $regionIds = array_filter(array_map('trim', explode(',', $regionIds)), fn($v) => $v !== '');
        }
        $regionIds = array_unique(array_filter(array_map('intval', (array) $regionIds)));

        $db->prepare('DELETE FROM fauna_regions WHERE fauna_id=?')->execute([$faunaId]);
        $stmt = $db->prepare('INSERT INTO fauna_regions (fauna_id, region_id) VALUES (?, ?)');
        foreach ($regionIds as $rid) {
            $stmt->execute([$faunaId, $rid]);
        }
    }

    /** Un point unique par ligne, plusieurs points possibles par espèce (item : multi-points Faune). */
    private function syncLocations(PDO $db, int $faunaId, ?string $locationsJson): void
    {
        $points = $locationsJson ? (json_decode($locationsJson, true) ?: []) : [];
        $db->prepare('DELETE FROM fauna_locations WHERE fauna_id=?')->execute([$faunaId]);
        $stmt = $db->prepare('INSERT INTO fauna_locations (fauna_id, latitude, longitude) VALUES (?,?,?)');
        foreach ($points as $p) {
            if (!isset($p['latitude'], $p['longitude'])) continue;
            $stmt->execute([$faunaId, $p['latitude'], $p['longitude']]);
        }
    }

    /** Points agrégés de toutes les espèces publiées, pour la carte générale (item : filtre Faune/Flore/Tout). */
    public function mapMarkers(): void
    {
        $db = Database::connect();
        $rows = $db->query(
            "SELECT fl.id AS location_id, fl.latitude, fl.longitude, f.id AS fauna_id, f.name, f.family
             FROM fauna_locations fl JOIN fauna f ON f.id = fl.fauna_id
             WHERE f.status = 'published'"
        )->fetchAll();
        Response::success($rows);
    }

    public function destroy(int $id): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireActive($user);
        $db = Database::connect();

        $imgStmt = $db->prepare('SELECT * FROM species_images WHERE species_type="fauna" AND species_id=?');
        $imgStmt->execute([$id]);
        foreach ($imgStmt->fetchAll() as $img) {
            UploadService::delete($img['image_path']);
            UploadService::delete($img['thumbnail_path']);
        }
        $db->prepare('DELETE FROM species_images WHERE species_type="fauna" AND species_id=?')->execute([$id]);
        $db->prepare('DELETE FROM fauna WHERE id=?')->execute([$id]);

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

        $countStmt = $db->prepare('SELECT COUNT(*) FROM species_images WHERE species_type="fauna" AND species_id=?');
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
            $result = UploadService::handle($file, 'fauna');
            $isPrimary = ((int) $primaryIndex === $i) ? 1 : 0;

            $stmt = $db->prepare(
                'INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary)
                 VALUES ("fauna", ?, ?, ?, ?)'
            );
            $stmt->execute([$speciesId, $result['path'], $result['thumb'], $isPrimary]);
            $insertedIds[$i] = (int) $db->lastInsertId();
        }

        // Corrigé : on suit désormais l'index réellement choisi par l'utilisateur pour
        // désigner l'image principale, au lieu de retomber systématiquement sur la dernière insérée.
        if ($primaryIndex !== null && isset($insertedIds[(int) $primaryIndex])) {
            $db->prepare('UPDATE species_images SET is_primary=0 WHERE species_type="fauna" AND species_id=?')->execute([$speciesId]);
            $db->prepare('UPDATE species_images SET is_primary=1 WHERE id=?')->execute([$insertedIds[(int) $primaryIndex]]);
        }
    }
}
