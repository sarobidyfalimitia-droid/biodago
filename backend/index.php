<?php
/**
 * Point d'entrée unique de l'API REST — Biodiversité Madagascar.
 * Toutes les requêtes passent par ce routeur (voir .htaccess / config serveur).
 */
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/services/Response.php';

// Sécurité API : aucune notice/warning PHP ne doit corrompre les réponses JSON.
// Les erreurs sont journalisées mais jamais affichées dans la sortie HTTP.
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ob_start();

require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/FaunaController.php';
require_once __DIR__ . '/controllers/FloraController.php';
require_once __DIR__ . '/controllers/CategoryController.php';
// require_once __DIR__ . '/controllers/ObservationController.php'; // Fichier non implémenté
require_once __DIR__ . '/controllers/BlogController.php';
require_once __DIR__ . '/controllers/MemberController.php';
require_once __DIR__ . '/controllers/StatsController.php';
require_once __DIR__ . '/controllers/ContactController.php';
require_once __DIR__ . '/controllers/DownloadController.php';
require_once __DIR__ . '/controllers/RegionController.php';
require_once __DIR__ . '/controllers/SuperAdminController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('#^/api#', '', $uri); // support avec ou sans préfixe /api
$segments = array_values(array_filter(explode('/', $uri)));

try {
    // /auth/*
    if (($segments[0] ?? '') === 'auth') {
        $auth = new AuthController();
        $sub = $segments[1] ?? '';
        match (true) {
            $sub === 'register' && $method === 'POST'        => $auth->register(),
            $sub === 'login' && $method === 'POST'            => $auth->login(),
            $sub === 'logout' && $method === 'POST'           => $auth->logout(),
            $sub === 'me' && $method === 'GET'                => $auth->me(),
            $sub === 'change-password' && $method === 'POST'  => $auth->changePassword(),
            $sub === 'reset-password' && $method === 'POST'   => $auth->resetPassword(),
            default => Response::error('Route introuvable', 'NOT_FOUND_404', 404),
        };
        exit;
    }

    // /members/*  (admin)
    if (($segments[0] ?? '') === 'members') {
        $ctrl = new MemberController();
        $id = isset($segments[1]) && is_numeric($segments[1]) ? (int) $segments[1] : null;
        $action = $segments[2] ?? null;
        match (true) {
            $method === 'GET' && $id === null                    => $ctrl->index(),
            $method === 'GET' && $id !== null && $action === null => $ctrl->show($id),
            $method === 'POST' && $action === 'approve'           => $ctrl->approve($id),
            $method === 'POST' && $action === 'reject'            => $ctrl->reject($id),
            $method === 'POST' && $action === 'suspend'           => $ctrl->suspend($id),
            $method === 'POST' && $action === 'reactivate'        => $ctrl->reactivate($id),
            $method === 'POST' && $action === 'generate-reset-code' => (new AuthController())->generateResetCode($id),
            $method === 'DELETE' && $id !== null                  => $ctrl->destroy($id),
            default => Response::error('Route introuvable', 'NOT_FOUND_404', 404),
        };
        exit;
    }

    // /fauna/*
    if (($segments[0] ?? '') === 'fauna') {
        $ctrl = new FaunaController();
        if (($segments[1] ?? '') === 'map-locations' && $method === 'GET') {
            $ctrl->mapMarkers(); exit;
        }
        $id = isset($segments[1]) && is_numeric($segments[1]) ? (int) $segments[1] : null;
        if (($segments[1] ?? '') === 'images' && isset($segments[2]) && $method === 'DELETE') {
            $ctrl->deleteImage((int) $segments[2]); exit;
        }
        match (true) {
            $method === 'GET' && $id === null   => $ctrl->index(),
            $method === 'GET' && $id !== null   => $ctrl->show($id),
            $method === 'POST' && $id === null  => $ctrl->store(),
            $method === 'POST' && $id !== null  => $ctrl->update($id), // multipart -> POST + _method=PUT côté frontend
            $method === 'PUT' && $id !== null   => $ctrl->update($id),
            $method === 'DELETE' && $id !== null => $ctrl->destroy($id),
            default => Response::error('Route introuvable', 'NOT_FOUND_404', 404),
        };
        exit;
    }

    // /flora/*
    if (($segments[0] ?? '') === 'flora') {
        $ctrl = new FloraController();
        if (($segments[1] ?? '') === 'map-locations' && $method === 'GET') {
            $ctrl->mapMarkers(); exit;
        }
        $id = isset($segments[1]) && is_numeric($segments[1]) ? (int) $segments[1] : null;
        if (($segments[1] ?? '') === 'images' && isset($segments[2]) && $method === 'DELETE') {
            $ctrl->deleteImage((int) $segments[2]); exit;
        }
        match (true) {
            $method === 'GET' && $id === null   => $ctrl->index(),
            $method === 'GET' && $id !== null   => $ctrl->show($id),
            $method === 'POST' && $id === null  => $ctrl->store(),
            $method === 'POST' && $id !== null  => $ctrl->update($id),
            $method === 'PUT' && $id !== null   => $ctrl->update($id),
            $method === 'DELETE' && $id !== null => $ctrl->destroy($id),
            default => Response::error('Route introuvable', 'NOT_FOUND_404', 404),
        };
        exit;
    }

    // /categories/*
    if (($segments[0] ?? '') === 'categories') {
        $ctrl = new CategoryController();
        $id = isset($segments[1]) && is_numeric($segments[1]) ? (int) $segments[1] : null;
        match (true) {
            $method === 'GET' && $id === null    => $ctrl->index(),
            $method === 'GET' && $id !== null    => $ctrl->show($id),
            $method === 'POST' && $id === null   => $ctrl->store(),
            $method === 'POST' && $id !== null   => $ctrl->update($id),
            $method === 'PUT' && $id !== null    => $ctrl->update($id),
            $method === 'DELETE' && $id !== null => $ctrl->destroy($id),
            default => Response::error('Route introuvable', 'NOT_FOUND_404', 404),
        };
        exit;
    }

    // /blog/*
    if (($segments[0] ?? '') === 'blog') {
        $ctrl = new BlogController();
        if (($segments[1] ?? '') === 'images' && isset($segments[2]) && $method === 'DELETE') {
            $ctrl->deleteImage((int) $segments[2]); exit;
        }
        $slugOrId = $segments[1] ?? null;
        match (true) {
            $method === 'GET' && $slugOrId === null       => $ctrl->index(),
            $method === 'GET' && $slugOrId !== null       => $ctrl->show($slugOrId),
            $method === 'POST' && $slugOrId === null      => $ctrl->store(),
            $method === 'POST' && is_numeric($slugOrId)   => $ctrl->update((int) $slugOrId),
            $method === 'PUT' && is_numeric($slugOrId)    => $ctrl->update((int) $slugOrId),
            $method === 'DELETE' && is_numeric($slugOrId) => $ctrl->destroy((int) $slugOrId),
            default => Response::error('Route introuvable', 'NOT_FOUND_404', 404),
        };
        exit;
    }

    // /contact/*
    if (($segments[0] ?? '') === 'contact') {
        $ctrl = new ContactController();
        $id = isset($segments[1]) && is_numeric($segments[1]) ? (int) $segments[1] : null;
        match (true) {
            $method === 'POST' && $id === null   => $ctrl->store(),
            $method === 'GET' && $id === null    => $ctrl->index(),
            $method === 'GET' && $id !== null    => $ctrl->show($id),
            $method === 'DELETE' && $id !== null => $ctrl->destroy($id),
            default => Response::error('Route introuvable', 'NOT_FOUND_404', 404),
        };
        exit;
    }

    // /accounts/*  (SuperAdmin uniquement — gestion des comptes membres/admins/superadmins)
    if (($segments[0] ?? '') === 'accounts') {
        $ctrl = new SuperAdminController();
        $id = isset($segments[1]) && is_numeric($segments[1]) ? (int) $segments[1] : null;
        $action = $segments[2] ?? null;
        match (true) {
            $method === 'GET' && $id === null              => $ctrl->index(),
            $method === 'POST' && $id === null              => $ctrl->createAccount(),
            $method === 'POST' && $action === 'role'         => $ctrl->changeRole($id),
            $method === 'DELETE' && $id !== null             => $ctrl->destroy($id),
            default => Response::error('Route introuvable', 'NOT_FOUND_404', 404),
        };
        exit;
    }

    // /regions
    if (($segments[0] ?? '') === 'regions') {
        (new RegionController())->index(); exit;
    }

    // /stats/*
    if (($segments[0] ?? '') === 'stats') {
        $ctrl = new StatsController();
        match ($segments[1] ?? '') {
            'admin' => $ctrl->adminStats(),
            'member' => $ctrl->memberStats(),
            default => $ctrl->publicStats(),
        };
        exit;
    }

    // /species/fauna/:id/download  &  /species/flora/:id/download
    if (($segments[0] ?? '') === 'species' && ($segments[3] ?? '') === 'download') {
        $ctrl = new DownloadController();
        $type = $segments[1]; $id = (int) $segments[2];
        if ($type === 'fauna') { $ctrl->faunaPdf($id); exit; }
        if ($type === 'flora') { $ctrl->floraPdf($id); exit; }
    }

    // Servir les fichiers uploadés (images faune/flore/blog/observation)
    if (($segments[0] ?? '') === 'uploads') {
        $uploadBase = __DIR__ . '/uploads/';
        $requestedPath = implode('/', array_slice($segments, 1));
        $filePath = realpath($uploadBase . $requestedPath);
        
        // Sécurité : vérifier que le chemin est bien dans le dossier uploads
        if ($filePath === false || strpos($filePath, realpath($uploadBase)) !== 0 || !is_file($filePath)) {
            Response::error('Fichier introuvable', 'NOT_FOUND_404', 404);
        }
        
        // Déterminer le type MIME
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
        ];
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeType = $mimeTypes[$ext] ?? 'application/octet-stream';
        
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: public, max-age=86400');
        readfile($filePath);
        exit;
    }

    Response::error('Route introuvable', 'NOT_FOUND_404', 404);
} catch (Throwable $e) {
    error_log($e->getMessage());
    Response::error('Erreur interne du serveur', 'SERVER_500', 500);
}