<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/Response.php';
require_once __DIR__ . '/../services/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ContactController
{
    public function store(): void
    {
        $db = Database::connect();
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        Validator::required($body, ['name', 'email', 'message']);
        if (!Validator::email($body['email'])) Response::error('Email invalide', 'VALIDATION_422', 422);

        $stmt = $db->prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?,?,?,?)');
        $stmt->execute([$body['name'], $body['email'], $body['subject'] ?? null, $body['message']]);

        Response::success(['id' => $db->lastInsertId()], 'Message envoyé', 201);
    }

    public function index(): void
    {
        AuthMiddleware::requireRole('admin');
        $db = Database::connect();
        Response::success($db->query('SELECT * FROM contact_messages ORDER BY created_at DESC')->fetchAll());
    }

    public function show(int $id): void
    {
        AuthMiddleware::requireRole('admin');
        $db = Database::connect();
        $db->prepare('UPDATE contact_messages SET is_read=1 WHERE id=?')->execute([$id]);
        $stmt = $db->prepare('SELECT * FROM contact_messages WHERE id=?');
        $stmt->execute([$id]);
        $msg = $stmt->fetch();
        if (!$msg) Response::error('Message introuvable', 'NOT_FOUND_404', 404);
        Response::success($msg);
    }

    public function destroy(int $id): void
    {
        AuthMiddleware::requireRole('admin');
        $db = Database::connect();
        $db->prepare('DELETE FROM contact_messages WHERE id=?')->execute([$id]);
        Response::success([], 'Message supprimé');
    }
}
