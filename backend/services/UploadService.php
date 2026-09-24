<?php
/**
 * Upload sécurisé des images — vérifie MIME réel, extension, dimensions,
 * renomme systématiquement, génère une miniature.
 */
class UploadService
{
    private const ALLOWED_MIME = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];
    private const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

    /**
     * @return array{path:string, thumb:string}
     */
    public static function handle(array $file, string $subfolder): array
    {
        if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            Response::error('Erreur lors du téléversement du fichier', 'UPLOAD_400', 400);
        }
        if ($file['size'] > self::MAX_SIZE) {
            Response::error('Fichier trop volumineux (max 5 Mo)', 'UPLOAD_413', 413);
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $realMime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!isset(self::ALLOWED_MIME[$realMime])) {
            Response::error('Type de fichier non autorisé', 'UPLOAD_415', 415);
        }

        $imageInfo = @getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            Response::error('Fichier image invalide ou corrompu', 'UPLOAD_422', 422);
        }

        $ext = self::ALLOWED_MIME[$realMime];
        $filename = bin2hex(random_bytes(16)) . '.' . $ext;

        $baseDir   = __DIR__ . "/../uploads/{$subfolder}";
        $largeDir  = "{$baseDir}/large";
        $thumbDir  = "{$baseDir}/thumb";
        if (!is_dir($largeDir)) mkdir($largeDir, 0755, true);
        if (!is_dir($thumbDir)) mkdir($thumbDir, 0755, true);

        $largePath = "{$largeDir}/{$filename}";
        if (!move_uploaded_file($file['tmp_name'], $largePath)) {
            Response::error('Impossible d\'enregistrer le fichier', 'UPLOAD_500', 500);
        }
        chmod($largePath, 0644);

        $thumbPath = "{$thumbDir}/{$filename}";
        self::makeThumbnail($largePath, $thumbPath, $realMime, 400, 300);

        return [
            'path'  => "uploads/{$subfolder}/large/{$filename}",
            'thumb' => "uploads/{$subfolder}/thumb/{$filename}",
        ];
    }

    private static function makeThumbnail(string $src, string $dest, string $mime, int $w, int $h): void
    {
        [$origW, $origH] = getimagesize($src);
        $image = match ($mime) {
            'image/jpeg' => imagecreatefromjpeg($src),
            'image/png'  => imagecreatefrompng($src),
            'image/webp' => imagecreatefromwebp($src),
            default      => null,
        };
        if (!$image) return;

        $ratio = min($w / $origW, $h / $origH);
        $newW = (int) round($origW * $ratio);
        $newH = (int) round($origH * $ratio);

        $thumb = imagecreatetruecolor($newW, $newH);
        if ($mime === 'image/png') {
            imagealphablending($thumb, false);
            imagesavealpha($thumb, true);
        }
        imagecopyresampled($thumb, $image, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

        match ($mime) {
            'image/jpeg' => imagejpeg($thumb, $dest, 85),
            'image/png'  => imagepng($thumb, $dest, 6),
            'image/webp' => imagewebp($thumb, $dest, 85),
            default      => null,
        };

        imagedestroy($image);
        imagedestroy($thumb);
    }

    public static function delete(string $relativePath): void
    {
        $full = __DIR__ . '/../' . ltrim($relativePath, '/');
        if (is_file($full)) unlink($full);
    }
}
