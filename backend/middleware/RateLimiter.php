<?php
/**
 * Rate limiting simple basé fichier (cache/) — protège /login contre le brute force.
 */
class RateLimiter
{
    public static function check(string $key, int $maxAttempts = 5, int $windowSeconds = 300): void
    {
        $file = __DIR__ . '/../cache/rl_' . md5($key) . '.json';
        $now = time();
        $data = ['count' => 0, 'reset_at' => $now + $windowSeconds];

        if (file_exists($file)) {
            $data = json_decode(file_get_contents($file), true) ?: $data;
            if ($now > $data['reset_at']) {
                $data = ['count' => 0, 'reset_at' => $now + $windowSeconds];
            }
        }

        $data['count']++;
        file_put_contents($file, json_encode($data));

        if ($data['count'] > $maxAttempts) {
            Response::error('Trop de tentatives. Réessayez plus tard.', 'RATE_429', 429);
        }
    }

    public static function reset(string $key): void
    {
        $file = __DIR__ . '/../cache/rl_' . md5($key) . '.json';
        if (file_exists($file)) unlink($file);
    }
}
