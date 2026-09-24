<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/Response.php';

class RegionController
{
    public function index(): void
    {
        $db = Database::connect();
        $regions = $db->query(
            "SELECT r.id, r.name, r.geojson_id,
                (SELECT COUNT(*) FROM flora_regions fr WHERE fr.region_id = r.id) AS flora_count
             FROM regions r ORDER BY r.name ASC"
        )->fetchAll();
        Response::success($regions);
    }
}
