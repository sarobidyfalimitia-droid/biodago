<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class StatsController
{
    /** Statistiques publiques, mises en cache 10 minutes pour éviter les requêtes répétées. */
    public function publicStats(): void
    {
        $cacheDir = __DIR__ . '/../cache';
        if (!is_dir($cacheDir)) mkdir($cacheDir, 0755, true);
        $cacheFile = "{$cacheDir}/public_stats.json";
        if (is_file($cacheFile) && (time() - filemtime($cacheFile) < 600)) {
            header('Content-Type: application/json');
            readfile($cacheFile);
            exit;
        }

        $db = Database::connect();
        $data = [
            'total_fauna'        => (int) $db->query('SELECT COUNT(*) FROM fauna')->fetchColumn(),
            'total_flora'        => (int) $db->query('SELECT COUNT(*) FROM flora')->fetchColumn(),
            'total_categories'   => (int) $db->query('SELECT COUNT(*) FROM categories')->fetchColumn(),
            'total_articles'     => (int) $db->query("SELECT COUNT(*) FROM blogs WHERE status='published'")->fetchColumn(),
            'by_conservation_status' => $db->query(
                "SELECT conservation_status, COUNT(*) AS total FROM (
                    SELECT conservation_status FROM fauna UNION ALL SELECT conservation_status FROM flora
                 ) t GROUP BY conservation_status"
            )->fetchAll(),
            // Répartition Faune/Flore par catégorie (ex: Lémuriens, Reptiles, Baobabs...)
            'by_category' => $db->query(
                "SELECT c.name AS category, c.type, COUNT(t.id) AS total FROM categories c
                 LEFT JOIN (
                    SELECT id, category_id FROM fauna UNION ALL SELECT id, category_id FROM flora
                 ) t ON t.category_id = c.id
                 GROUP BY c.id, c.name, c.type
                 ORDER BY total DESC"
            )->fetchAll(),
            // Répartition du nombre d'espèces (Faune + Flore) par région de Madagascar
            'by_region' => $db->query(
                "SELECT r.name AS region, COUNT(*) AS total FROM regions r
                 JOIN (
                    SELECT region_id FROM fauna_regions UNION ALL SELECT region_id FROM flora_regions
                 ) t ON t.region_id = r.id
                 GROUP BY r.id, r.name
                 ORDER BY total DESC"
            )->fetchAll(),
        ];

        file_put_contents($cacheFile, json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE));
        Response::success($data);
    }

    public function adminStats(): void
    {
        AuthMiddleware::requireRole('admin');
        $db = Database::connect();

        Response::success([
            'total_fauna'      => (int) $db->query('SELECT COUNT(*) FROM fauna')->fetchColumn(),
            'total_flora'      => (int) $db->query('SELECT COUNT(*) FROM flora')->fetchColumn(),
            'total_categories' => (int) $db->query('SELECT COUNT(*) FROM categories')->fetchColumn(),
            'total_members'    => (int) $db->query("SELECT COUNT(*) FROM users WHERE role='member'")->fetchColumn(),
            'pending_members'  => (int) $db->query("SELECT COUNT(*) FROM users WHERE status='pending'")->fetchColumn(),
            'active_members'   => (int) $db->query("SELECT COUNT(*) FROM users WHERE status='active' AND role='member'")->fetchColumn(),
            'total_articles'   => (int) $db->query('SELECT COUNT(*) FROM blogs')->fetchColumn(),
            'recent_members'   => $db->query('SELECT id, name, email, status, created_at FROM users WHERE role="member" ORDER BY created_at DESC LIMIT 5')->fetchAll(),
        ]);
    }

    /**
     * Items 9/14 : stats personnelles du Membre connecté (corrige le Tableau de bord
     * Membre qui n'affichait jusqu'ici aucune donnée réelle). Se met à jour tout seul
     * côté frontend via l'invalidation TanStack Query dès qu'une contribution change.
     */
    public function memberStats(): void
    {
        $user = AuthMiddleware::requireAuth();
        $db = Database::connect();

        $faunaStmt = $db->prepare('SELECT COUNT(*) FROM fauna WHERE created_by=?');
        $faunaStmt->execute([$user['id']]);
        $floraStmt = $db->prepare('SELECT COUNT(*) FROM flora WHERE created_by=?');
        $floraStmt->execute([$user['id']]);
        $blogStmt = $db->prepare('SELECT COUNT(*) FROM blogs WHERE author_id=?');
        $blogStmt->execute([$user['id']]);
        $publishedBlogStmt = $db->prepare("SELECT COUNT(*) FROM blogs WHERE author_id=? AND status='published'");
        $publishedBlogStmt->execute([$user['id']]);

        Response::success([
            'my_fauna'          => (int) $faunaStmt->fetchColumn(),
            'my_flora'          => (int) $floraStmt->fetchColumn(),
            'my_blog_posts'     => (int) $blogStmt->fetchColumn(),
            'my_published_posts' => (int) $publishedBlogStmt->fetchColumn(),
        ]);
    }
}
