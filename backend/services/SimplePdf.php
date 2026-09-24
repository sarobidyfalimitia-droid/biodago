<?php
/**
 * Générateur PDF minimal en PHP pur (sans dépendance Composer, car packagist.org
 * n'est pas accessible depuis cet environnement de build).
 *
 * ⚠️ Pour une mise en page plus riche (images intégrées, colonnes, styles CSS),
 * remplacer cette classe par Dompdf ou mPDF via `composer require dompdf/dompdf` —
 * le reste du code (FaunaPdfController) n'aurait pas besoin de changer de logique,
 * seulement l'appel de rendu final.
 */
class SimplePdf
{
    private array $lines = [];
    private array $shapes = []; // primitives vectorielles simples (repère de localisation)

    public function addLocator(?float $lat, ?float $lng, ?string $note = null): void
    {
        // Item 38 : repère schématique de localisation dans le PDF. Sans accès réseau aux
        // tuiles cartographiques depuis ce générateur PHP pur, on dessine un cadre représentant
        // approximativement l'emprise de Madagascar (43°E–51°E / 12°S–26°S) avec un point à la
        // position de l'espèce — un schéma, pas une carte topographique détaillée.
        if ($lat === null || $lng === null) return;

        $this->lines[] = ['size' => 12, 'text' => 'Localisation (schema)', 'gap' => 8];
        if ($note) {
            $this->lines[] = ['size' => 9, 'text' => $this->clean($note), 'gap' => 4];
        }
        $this->lines[] = ['size' => 9, 'text' => $this->clean(sprintf('Coordonnees : %.4f, %.4f', $lat, $lng)), 'gap' => 6];

        $boxX = 50; $boxW = 140; $boxH = 160;
        $latMin = -26; $latMax = -11.5; $lngMin = 42.5; $lngMax = 50.7;
        $px = $boxX + (($lng - $lngMin) / ($lngMax - $lngMin)) * $boxW;
        $py = ($lat - $latMin) / ($latMax - $latMin) * $boxH; // inversé plus bas via currentY

        $this->shapes[] = ['type' => 'frame', 'x' => $boxX, 'w' => $boxW, 'h' => $boxH, 'dotX' => $px, 'dotYRatio' => $py / $boxH];
    }

    private function drawShapes(int $startY): string
    {
        $content = '';
        foreach ($this->shapes as $shape) {
            if ($shape['type'] !== 'frame') continue;
            $topY = $startY;
            $bottomY = $topY - $shape['h'];
            // Cadre (rectangle) représentant l'emprise de Madagascar
            $content .= sprintf("0.6 w\n%d %d %d %d re S\n", $shape['x'], $bottomY, $shape['w'], $shape['h']);
            // Point de localisation (petit cercle approximé par 4 courbes de Bézier)
            $dotX = $shape['x'] + $shape['dotX'] - $shape['x']; // déjà en coord absolues via dotX
            $dotX = $shape['dotX'];
            $dotY = $bottomY + ($shape['dotYRatio'] * $shape['h']);
            $r = 3.2; $k = 0.552 * $r;
            $content .= "1 0.42 0.09 rg\n"; // teinte baobab
            $content .= sprintf(
                "%.2f %.2f m %.2f %.2f %.2f %.2f %.2f %.2f c %.2f %.2f %.2f %.2f %.2f %.2f c %.2f %.2f %.2f %.2f %.2f %.2f c %.2f %.2f %.2f %.2f %.2f %.2f c f\n",
                $dotX + $r, $dotY,
                $dotX + $r, $dotY + $k, $dotX + $k, $dotY + $r, $dotX, $dotY + $r,
                $dotX - $k, $dotY + $r, $dotX - $r, $dotY + $k, $dotX - $r, $dotY,
                $dotX - $r, $dotY - $k, $dotX - $k, $dotY - $r, $dotX, $dotY - $r,
                $dotX + $k, $dotY - $r, $dotX + $r, $dotY - $k, $dotX + $r, $dotY
            );
            $content .= "0 0 0 rg\n"; // remise à noir pour le texte suivant
        }
        return $content;
    }

    public function addTitle(string $text): void
    {
        $this->lines[] = ['size' => 18, 'text' => $this->clean($text), 'gap' => 10];
    }

    public function addSubtitle(string $text): void
    {
        $this->lines[] = ['size' => 13, 'text' => $this->clean($text), 'gap' => 8];
    }

    public function addParagraph(string $label, ?string $text): void
    {
        if (!$text) return;
        foreach ($this->wrap($this->clean("{$label}: {$text}"), 95) as $line) {
            $this->lines[] = ['size' => 10, 'text' => $line, 'gap' => 5];
        }
        $this->lines[] = ['size' => 10, 'text' => '', 'gap' => 3];
    }

    private function clean(string $text): string
    {
        $text = html_entity_decode(strip_tags($text));
        // Bug #14 corrigé : remplacement manuel des caractères malgaches spécifiques
        // (ny, ɲ, ň, etc.) avant translittération générique, car //TRANSLIT seul les
        // rend mal ou les supprime silencieusement.
        $map = ['ɲ' => 'ny', 'Ɲ' => 'Ny', 'ň' => 'n', 'Ň' => 'N', 'ë' => 'e', 'ï' => 'i'];
        $text = strtr($text, $map);
        return iconv('UTF-8', 'CP1252//TRANSLIT//IGNORE', $text) ?: $text;
    }

    private function wrap(string $text, int $width): array
    {
        return explode("\n", wordwrap($text, $width, "\n", true));
    }

    public function output(): string
    {
        $content = "BT /F1 1 Tf 50 780 Td\n";
        $y = 780;
        foreach ($this->lines as $line) {
            $size = $line['size'];
            $content .= "/F1 {$size} Tf\n";
            $escaped = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $line['text']);
            $content .= "1 0 0 1 50 {$y} Tm ({$escaped}) Tj\n";
            $y -= ($size + $line['gap']);
        }
        $content .= "ET\n";
        // Le cadre de localisation (dessiné en dehors du bloc BT/ET, car ce sont des
        // opérateurs de dessin vectoriel et non de texte) démarre juste sous le texte.
        $content .= $this->drawShapes((int) $y - 10);

        $objects = [];
        $objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
        $objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
        $objects[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>";
        $objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
        $objects[5] = "<< /Length " . strlen($content) . " >>\nstream\n{$content}\nendstream";

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $num => $body) {
            $offsets[$num] = strlen($pdf);
            $pdf .= "{$num} 0 obj\n{$body}\nendobj\n";
        }
        $xrefStart = strlen($pdf);
        $pdf .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }
        $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n{$xrefStart}\n%%EOF";

        return $pdf;
    }
}
