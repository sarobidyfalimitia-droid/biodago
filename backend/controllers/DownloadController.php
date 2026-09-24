<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/Response.php';
require_once __DIR__ . '/../vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

class DownloadController
{
    public function faunaPdf(int $id): void
    {
        $this->generate('fauna', $id);
    }

    public function floraPdf(int $id): void
    {
        $this->generate('flora', $id);
    }

    private function generate(string $type, int $id): void
    {
        $db = Database::connect();
        $table = $type; // 'fauna' | 'flora'
        $genDir = __DIR__ . '/../generated';
        if (!is_dir($genDir)) mkdir($genDir, 0755, true);
        $cacheFile = "{$genDir}/{$type}-{$id}.pdf";

        $stmt = $db->prepare("SELECT s.*, c.name AS category_name, s.updated_at
                               FROM {$table} s LEFT JOIN categories c ON c.id = s.category_id
                               WHERE s.id = ?");
        $stmt->execute([$id]);
        $species = $stmt->fetch();
        if (!$species) Response::error('Espèce introuvable', 'NOT_FOUND_404', 404);

        // Réutiliser le PDF déjà généré si les données n'ont pas changé.
        if (is_file($cacheFile) && filemtime($cacheFile) >= strtotime($species['updated_at'])) {
            $this->stream($cacheFile, $species['name']);
        }

        // Récupérer l'image principale de l'espèce
        $imgStmt = $db->prepare('SELECT image_path, thumbnail_path, alt_text FROM species_images WHERE species_type = ? AND species_id = ? AND is_primary = 1 LIMIT 1');
        $imgStmt->execute([$type, $id]);
        $primaryImage = $imgStmt->fetch();

        // Récupérer toutes les images de l'espèce
        $allImgStmt = $db->prepare('SELECT image_path, alt_text FROM species_images WHERE species_type = ? AND species_id = ? ORDER BY is_primary DESC, id ASC LIMIT 3');
        $allImgStmt->execute([$type, $id]);
        $allImages = $allImgStmt->fetchAll();

        $conservationLabels = [
            'LC' => 'Préoccupation mineure',
            'NT' => 'Quasi menacée',
            'VU' => 'Vulnérable',
            'EN' => 'En danger',
            'CR' => 'En danger critique',
            'EW' => "Éteinte à l'état sauvage",
            'EX' => 'Éteinte',
            'DD' => 'Données insuffisantes',
        ];

        $conservationColors = [
            'LC' => '#28a745',
            'NT' => '#6c757d',
            'VU' => '#ffc107',
            'EN' => '#fd7e14',
            'CR' => '#dc3545',
            'EW' => '#6f42c1',
            'EX' => '#212529',
            'DD' => '#adb5bd',
        ];

        $status = $species['conservation_status'] ?? 'DD';
        $statusLabel = $conservationLabels[$status] ?? $status;
        $statusColor = $conservationColors[$status] ?? '#adb5bd';

        // Construire le HTML pour le PDF
        $html = $this->buildHtml($species, $type, $primaryImage, $allImages, $statusLabel, $statusColor);

        // Configuration Dompdf
        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('isHtml5ParserEnabled', true);
        $options->set('defaultFont', 'Helvetica');
        $options->set('dpi', 150);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $output = $dompdf->output();
        file_put_contents($cacheFile, $output);
        $this->stream($cacheFile, $species['name']);
    }

    private function buildHtml(array $species, string $type, ?array $primaryImage, array $allImages, string $statusLabel, string $statusColor): string
    {
        $name = htmlspecialchars($species['name']);
        $scientificName = htmlspecialchars($species['scientific_name']);
        
        $html = '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 14mm 12mm 18mm 12mm; }
        * { box-sizing: border-box; }
        body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; color: #3a3226; line-height: 1.45; }

        /* En-tête façon carnet de terrain — couverture cuir brun (plus de vert), accents dorés */
        .header { position: relative; background: #3c2a1a; color: #f6f1e4; padding: 20px 24px; border-radius: 10px 10px 0 0; overflow: hidden; }
        .header:after { content: ""; }
        .header h1 { margin: 0 0 3px 0; font-size: 21pt; font-weight: bold; }
        .header .scientific { font-style: italic; font-size: 12pt; color: #d8c4a8; margin: 0; }
        .header .fiche-kind { font-size: 8pt; text-transform: uppercase; letter-spacing: 2px; color: #c2a37e; margin: 0 0 6px 0; }
        .accession-stamp {
            position: absolute; top: 18px; right: 22px; border: 1.5px solid #d8a34d; color: #f2dfae;
            padding: 5px 12px; border-radius: 3px; font-size: 10pt; font-weight: bold; letter-spacing: 1px;
            transform: rotate(3deg);
        }

        .body { border: 1px solid #e4dcc8; border-top: none; border-radius: 0 0 10px 10px; padding: 20px 24px 8px 24px; }

        /* Bloc de tête : photo principale à gauche, identification/général à droite */
        .top-block { width: 100%; margin-bottom: 6px; }
        .top-block td { vertical-align: top; }
        .top-photo-cell { width: 42%; padding-right: 16px; }
        .top-info-cell { width: 58%; }
        /* DomPDF ne supporte pas object-fit : on simule un "cover" avec background-size,
           dans un cadre de hauteur fixe et standard, avec ou sans photo — fonctionne quelle
           quelle que soit la taille initiale de la photo envoy&eacute;e (grande ou petite). */
        .main-img-frame { border: 1px solid #e4dcc8; border-radius: 8px; padding: 6px; background: #faf7ef; }
        .main-img-box {
            width: 100%; height: 400px; border-radius: 10px;
            background-color: #eee6d3; background-repeat: no-repeat;
            background-position: center center; background-size: cover;
        }
        .no-img {
            width: 100%; height: 400px; box-sizing: border-box;
            background: #faf7ef; border: 2px dashed #e4dcc8; border-radius: 8px;
            color: #b0a488; font-style: italic; text-align: center; font-size: 9pt;
            display: table-cell; vertical-align: middle;
        }

        .section-title { color: #3c2a1a; font-size: 12.5pt; font-weight: bold; margin: 16px 0 7px 0; padding: 3px 0 5px 10px; border-left: 4px solid #d8a34d; }
        .section-title.compact { margin-top: 4px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .info-table td { padding: 5px 8px; vertical-align: top; border-bottom: 1px solid #eee2c9; font-size: 9.5pt; }
        .info-table .label { width: 38%; font-weight: bold; color: #3c2a1a; }
        .info-table .value { width: 62%; }
        .badge { display: inline-block; color: white; padding: 3px 11px; border-radius: 10px; font-size: 9pt; font-weight: bold; }
        .text-block { text-align: justify; margin: 6px 0; font-size: 9.5pt; }
        /* Suite en pleine largeur de la section 2 (description, habitat...) : des phrases
           longues restent lisibles au lieu d&rsquo;etre comprimees dans la colonne etroite sous la photo. */
        .general-continued { width: 100%; margin: 4px 0 8px 0; }

        /* Mini-galerie des 2 photos supplémentaires, insérée au milieu de la fiche.
           Agrandie et en "contain" (jamais "cover") : la photo enti&egrave;re reste visible,
           redimensionnée pour tenir dans le cadre, sans jamais être rognée. */
        .gallery-strip { width: 100%; margin: 6px 0 4px 0; }
        .gallery-strip td { width: 50%; padding: 0 6px; vertical-align: top; }
        .gallery-strip .frame { border: 1px solid #e4dcc8; border-radius: 8px; padding: 5px; background: #faf7ef; }
        .gallery-strip .gallery-img-box {
            width: 100%; height: 380px; border-radius: 10px;
            background-color: #ffffff; background-repeat: no-repeat;
            background-position: center center; background-size: contain;
        }
        .gallery-caption { font-size: 7.5pt; color: #a38a68; text-transform: uppercase; letter-spacing: 1px; margin: 10px 0 6px 0; text-align: center; }

        .footer { text-align: center; font-size: 7pt; color: #a89d84; margin-top: 18px; padding-top: 8px; border-top: 1px solid #e4dcc8; }
    </style>
</head>
<body>
    <div class="header">
        <p class="fiche-kind">Fiche ' . ($type === 'fauna' ? 'Faune' : 'Flore') . ' &mdash; Carnet de terrain</p>
        <span class="accession-stamp">N&deg; ' . str_pad((string) $species['id'], 3, '0', STR_PAD_LEFT) . '</span>
        <h1>' . $name . '</h1>
        <p class="scientific">' . $scientificName . '</p>
    </div>
    <div class="body">';

        // --- Bloc de tête : 1 photo (la principale) à côté des informations générales ---
        $html .= '<table class="top-block"><tr><td class="top-photo-cell">';
        if ($primaryImage && !empty($primaryImage['image_path'])) {
            // Bug corrigé : image_path contient déjà le chemin complet ("uploads/{type}/large/xxx.ext"),
            // il ne faut donc pas le refaire précéder de "uploads/{type}/large/" (chemin doublé -> image absente).
            $imgPath = __DIR__ . '/../' . $primaryImage['image_path'];
            if (file_exists($imgPath)) {
                $ext = pathinfo($imgPath, PATHINFO_EXTENSION);
                $imgData = base64_encode(file_get_contents($imgPath));
                $src = 'data:image/' . $ext . ';base64,' . $imgData;
                $html .= '<div class="main-img-frame"><div class="main-img-box" style="background-image:url(' . $src . ')" title="' . htmlspecialchars($primaryImage['alt_text'] ?? $species['name']) . '"></div></div>';
            } else {
                $html .= '<div class="no-img">Aucune image disponible</div>';
            }
        } else {
            $html .= '<div class="no-img">Aucune image disponible</div>';
        }
        // 2. Général — seul le badge (court) reste sous la photo, dans la colonne de
        // gauche, pour combler le vide ; les phrases longues suivent en pleine largeur
        // plus bas, pour ne jamais être comprimées dans cette colonne étroite.
        $html .= '
        <div class="section-title compact">2. G&eacute;n&eacute;ral</div>
        <table class="info-table">
            <tr><td class="label">Statut de conservation</td><td class="value"><span class="badge" style="background:' . $statusColor . ';">' . htmlspecialchars($statusLabel) . '</span></td></tr>
        </table>';
        $html .= '</td><td class="top-info-cell">';

        // 1. Identification
        $html .= $this->renderSection('1. Identification', [
            'Nom vernaculaire' => $species['vernacular_name'] ?? null,
            'Cat&eacute;gorie' => $species['category_name'] ?? null,
            'Famille' => $species['family'] ?? null,
            'Esp&egrave;ce similaire et diff&eacute;rence' => $species['similar_species'] ?? null,
        ], true);
        $html .= '</td></tr></table>'; // fin du bloc photo+badge / identification

        // Suite de "2. Général" en pleine largeur (description, habitat, etc.)
        $html .= '<div class="general-continued">';
        if (!empty($species['description'])) {
            $html .= '<p class="text-block"><strong>Description&nbsp;:</strong> ' . nl2br(htmlspecialchars($species['description'])) . '</p>';
        }
        if (!empty($species['habitat'])) {
            $html .= '<p class="text-block"><strong>Habitat&nbsp;:</strong> ' . nl2br(htmlspecialchars($species['habitat'])) . '</p>';
        }
        if ($type === 'fauna') {
            if (!empty($species['diet'])) $html .= '<p class="text-block"><strong>Alimentation&nbsp;:</strong> ' . nl2br(htmlspecialchars($species['diet'])) . '</p>';
            if (!empty($species['reproduction'])) $html .= '<p class="text-block"><strong>Reproduction&nbsp;:</strong> ' . nl2br(htmlspecialchars($species['reproduction'])) . '</p>';
            if (!empty($species['behavior'])) $html .= '<p class="text-block"><strong>Comportement&nbsp;:</strong> ' . nl2br(htmlspecialchars($species['behavior'])) . '</p>';
        } else {
            if (!empty($species['characteristics'])) $html .= '<p class="text-block"><strong>Caract&eacute;ristiques&nbsp;:</strong> ' . nl2br(htmlspecialchars($species['characteristics'])) . '</p>';
            if (!empty($species['uses'])) $html .= '<p class="text-block"><strong>Utilisation&nbsp;:</strong> ' . nl2br(htmlspecialchars($species['uses'])) . '</p>';
        }
        $html .= '</div>';

        // Sections 3 à 12 : numérotées dynamiquement. Si une section n'a aucun champ
        // rempli, elle est simplement omise (comme avant) — mais surtout, le numéro
        // affiché sur les sections suivantes se décale automatiquement pour ne jamais
        // laisser de trou (ex: si "4. Aspect visuel" est vide, ce qui suivait en 5
        // devient 4, et ainsi de suite jusqu'à la fin).
        $numberedSections = [];

        if ($type === 'fauna') {
            $numberedSections['biometrie'] = ['title' => 'Biom&eacute;trie', 'rows' => [
                'Longueur / taille (min)' => $species['size_min'] ?? null,
                'Longueur / taille (max)' => $species['size_max'] ?? null,
                'Longueur / taille (moyenne)' => $species['size_avg'] ?? null,
                'Envergure' => $species['wingspan'] ?? null,
                'Poids (min)' => $species['weight_min'] ?? null,
                'Poids (max)' => $species['weight_max'] ?? null,
                'Poids (moyen)' => $species['weight_avg'] ?? null,
                'Dimorphisme sexuel' => $species['sexual_dimorphism'] ?? null,
            ]];
        } else {
            $numberedSections['biometrie'] = ['title' => 'Biom&eacute;trie', 'rows' => [
                'Hauteur (min)' => $species['height_min'] ?? null,
                'Hauteur (max)' => $species['height_max'] ?? null,
                'Hauteur (moyenne)' => $species['height_avg'] ?? null,
                'Diam&egrave;tre du feuillage' => $species['canopy_diameter'] ?? null,
            ]];
        }

        $numberedSections['aspect'] = ['title' => 'Aspect visuel', 'rows' => [
            'Couleur' => $species['color'] ?? null,
            'Texture' => $species['texture'] ?? null,
            'Couleur des yeux' => $type === 'fauna' ? ($species['eye_color'] ?? null) : null,
        ]];

        if ($type === 'fauna') {
            $numberedSections['anatomie'] = ['title' => 'Anatomie sp&eacute;cifique', 'rows' => [
                'Dentition / bec / pi&egrave;ces buccales' => $species['dentition'] ?? null,
                'Appendices et membres' => $species['appendages'] ?? null,
                'Structures cr&acirc;niennes / ornements' => $species['cranial_structures'] ?? null,
            ]];
        } else {
            $numberedSections['anatomie'] = ['title' => 'Anatomie sp&eacute;cifique', 'rows' => [
                'Type de feuilles' => $species['leaf_type'] ?? null,
                'Type de racines' => $species['root_type'] ?? null,
                'Type de fleurs' => $species['flower_type'] ?? null,
            ]];
        }

        $numberedSections['adaptations'] = ['title' => 'Adaptations', 'rows' => [
            'Adaptation morphologique remarquable' => $species['adaptation'] ?? null,
            'Organes sensoriels sp&eacute;cifiques' => $type === 'fauna' ? ($species['sensory_organs'] ?? null) : null,
            'Tol&eacute;rance environnementale' => $species['environmental_tolerance'] ?? null,
        ]];

        $ecologyRows = [
            'Esp&eacute;rance de vie' => $species['lifespan'] ?? null,
            'R&ocirc;le &eacute;cosyst&eacute;mique' => $species['ecological_role'] ?? null,
            'Comp&eacute;tition interspecifique' => $species['interspecies_competition'] ?? null,
            'Strat&eacute;gie hivernale / saisonni&egrave;re' => $species['seasonal_strategy'] ?? null,
        ];
        if ($type === 'fauna') {
            $ecologyRows['Mouvements migratoires'] = $species['migration'] ?? null;
            $ecologyRows['Rythmes circadiens'] = $species['circadian_rhythm'] ?? null;
        } else {
            $ecologyRows['Saison de floraison'] = $species['flowering_season'] ?? null;
            $ecologyRows['Saison de fructification'] = $species['fruiting_season'] ?? null;
            $ecologyRows['Pollinisateurs connus'] = $species['pollinators'] ?? null;
            $ecologyRows['Type de sol pr&eacute;f&eacute;r&eacute;'] = $species['soil_type'] ?? null;
            $ecologyRows['Vitesse de croissance'] = $species['growth_rate'] ?? null;
            $ecologyRows['&Acirc;ge de maturit&eacute;'] = $species['maturity_age'] ?? null;
        }
        $numberedSections['ecologie'] = ['title' => '&Eacute;cologie', 'rows' => $ecologyRows];

        $numberedSections['sante'] = ['title' => 'Sant&eacute; et microbiologie', 'rows' => [
            'Statut de sant&eacute; / pathologies' => $species['health_status'] ?? null,
            'Microbiote sp&eacute;cifique' => $species['microbiote'] ?? null,
            'Charge parasitaire' => $species['parasite_load'] ?? null,
            'Vecteur de maladies / zoonoses' => $type === 'fauna' ? ($species['disease_vector'] ?? null) : null,
        ]];

        $humanRows = [
            'Usage anthropique' => $species['human_use'] ?? null,
            'Signification traditionnelle / culturelle' => $species['cultural_significance'] ?? null,
            'Utilisation par les communaut&eacute;s locales' => $species['local_community_use'] ?? null,
            'Importance &eacute;conomique' => $species['economic_importance'] ?? null,
            'Importance m&eacute;dicinale traditionnelle' => $species['medicinal_importance'] ?? null,
        ];
        if ($type === 'flora') {
            $humanRows['Comestibilit&eacute;'] = $species['edibility'] ?? null;
            $humanRows['Parties comestibles'] = $species['edible_parts'] ?? null;
            $humanRows['Parties toxiques / dangereuses'] = $species['toxic_parts'] ?? null;
            $humanRows['Usages m&eacute;dicinaux traditionnels'] = $species['traditional_medicinal_uses'] ?? null;
            $humanRows['Usages alimentaires'] = $species['food_uses'] ?? null;
            $humanRows['Usages artisanaux'] = $species['craft_uses'] ?? null;
        }
        $numberedSections['humain'] = ['title' => "Relation avec l&rsquo;humain", 'rows' => $humanRows];

        $numberedSections['madagascar'] = ['title' => 'Importance pour Madagascar', 'rows' => [
            'Endémisme' => $species['endemism'] ?? null,
            'Zone ou r&eacute;serve naturelle' => $species['protected_area'] ?? null,
            'Connaissances traditionnelles associ&eacute;es' => $species['traditional_knowledge'] ?? null,
            'Variations r&eacute;gionales du nom' => $species['regional_name_variations'] ?? null,
        ]];

        $threatRows = [
            'Perte ou destruction de l&rsquo;habitat' => $species['habitat_loss'] ?? null,
            'Pollution' => $species['pollution'] ?? null,
            'Changement climatique' => $species['climate_change'] ?? null,
            'Esp&egrave;ces invasives' => $species['invasive_species'] ?? null,
            'Autres menaces' => $species['other_threats'] ?? null,
        ];
        if ($type === 'fauna') {
            $threatRows['Chasse / braconnage'] = $species['poaching'] ?? null;
        } else {
            $threatRows['Exploitation / r&eacute;colte excessive'] = $species['overharvesting'] ?? null;
        }
        $numberedSections['menaces'] = ['title' => 'Menaces', 'rows' => $threatRows];

        $numberedSections['conservation'] = ['title' => 'Conservation', 'rows' => [
            'Mesures de conservation' => $species['conservation_measures'] ?? null,
            'Actions de protection existantes' => $species['protection_actions'] ?? null,
            'Programmes de conservation' => $species['conservation_programs'] ?? null,
        ]];

        // Mini-galerie : les 2 photos restantes (au-delà de la principale), insérée après
        // la section "Adaptations" — qu'elle porte le numéro 4, 5 ou 6 selon ce qui a été
        // rempli avant elle, peu importe : on la repère par sa clé, pas par un numéro fixe.
        $galleryImages = array_values(array_filter($allImages, fn($img) => $img['image_path'] !== ($primaryImage['image_path'] ?? null)));
        $galleryHtml = '';
        if (count($galleryImages) > 0) {
            $galleryHtml .= '<p class="gallery-caption">Autres photos</p><table class="gallery-strip"><tr>';
            foreach (array_slice($galleryImages, 0, 2) as $img) {
                $gPath = __DIR__ . '/../' . $img['image_path'];
                if (!file_exists($gPath)) continue;
                $gExt = pathinfo($gPath, PATHINFO_EXTENSION);
                $gData = base64_encode(file_get_contents($gPath));
                $gSrc = 'data:image/' . $gExt . ';base64,' . $gData;
                $galleryHtml .= '<td><div class="frame"><div class="gallery-img-box" style="background-image:url(' . $gSrc . ')" title="' . htmlspecialchars($img['alt_text'] ?? '') . '"></div></div></td>';
            }
            $galleryHtml .= '</tr></table>';
        }

        $sectionNumber = 3;
        foreach ($numberedSections as $key => $section) {
            $filled = array_filter($section['rows'], fn($v) => $v !== null && $v !== '');
            if (empty($filled)) continue;
            $html .= $this->renderSection($sectionNumber . '. ' . $section['title'], $section['rows']);
            $sectionNumber++;
            if ($key === 'adaptations' && $galleryHtml !== '') {
                $html .= $galleryHtml;
            }
        }

        // Pied de page        // Pied de page
        $html .= '
        <div class="footer">
            Fiche g&eacute;n&eacute;r&eacute;e le ' . date('d/m/Y \à H:i') . ' &mdash; Biodiversit&eacute; Madagascar
        </div>
    </div>
</body>
</html>';

        return $html;
    }

    /**
     * Affiche une section (titre + tableau label/valeur) uniquement si elle contient
     * au moins un champ non vide — pour ne pas surcharger le PDF de lignes "-" quand
     * la fiche n'a pas été entièrement remplie.
     */
    private function renderSection(string $title, array $rows, bool $compact = false): string
    {
        $filled = array_filter($rows, fn($v) => $v !== null && $v !== '');
        if (empty($filled)) return '';

        $html = '<div class="section-title' . ($compact ? ' compact' : '') . '">' . $title . '</div><table class="info-table">';
        foreach ($filled as $label => $value) {
            $html .= '<tr><td class="label">' . $label . '</td><td class="value">' . nl2br(htmlspecialchars((string) $value)) . '</td></tr>';
        }
        $html .= '</table>';
        return $html;
    }

    private function stream(string $file, string $name): void
    {
        $safeName = preg_replace('/[^A-Za-z0-9\-]+/', '-', $name);
        header('Content-Type: application/pdf');
        header("Content-Disposition: attachment; filename=\"fiche-{$safeName}.pdf\"");
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
}
