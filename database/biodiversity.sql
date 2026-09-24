-- =========================================================
-- BIODIVERSITÉ MADAGASCAR — Schéma MySQL
-- =========================================================
SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS biodiversity_madagascar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biodiversity_madagascar;

-- ---------------------------------------------------------
-- USERS (member / admin uniquement)
-- ---------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    username VARCHAR(50) DEFAULT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('member','admin','superadmin') NOT NULL DEFAULT 'member',
    status ENUM('pending','active','rejected','suspended') NOT NULL DEFAULT 'pending',
    profile_image VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Code de récupération de mot de passe généré par l'Admin (aucun SMTP/OTP)
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- CATEGORIES (fauna / flora)
-- ---------------------------------------------------------
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(170) NOT NULL UNIQUE,
    type ENUM('fauna','flora') NOT NULL,
    description TEXT DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- REGIONS (Madagascar, pour Flore / GeoJSON)
-- ---------------------------------------------------------
CREATE TABLE regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    geojson_id VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- FAUNA
-- ---------------------------------------------------------
CREATE TABLE fauna (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- 1. Identification
    name VARCHAR(150) NOT NULL,
    scientific_name VARCHAR(150) NOT NULL,
    category_id INT DEFAULT NULL,
    vernacular_name VARCHAR(150) DEFAULT NULL,
    family VARCHAR(150) DEFAULT NULL,
    similar_species TEXT DEFAULT NULL,
    -- 2. Général
    description TEXT DEFAULT NULL,
    habitat TEXT DEFAULT NULL,
    region VARCHAR(150) DEFAULT NULL,
    conservation_status ENUM('LC','NT','VU','EN','CR','EW','EX','DD') DEFAULT 'DD',
    diet TEXT DEFAULT NULL,
    reproduction TEXT DEFAULT NULL,
    behavior TEXT DEFAULT NULL,
    -- 3. Biométrie
    size_min DECIMAL(10,2) DEFAULT NULL,
    size_max DECIMAL(10,2) DEFAULT NULL,
    size_avg DECIMAL(10,2) DEFAULT NULL,
    wingspan DECIMAL(10,2) DEFAULT NULL,
    weight_min DECIMAL(10,2) DEFAULT NULL,
    weight_max DECIMAL(10,2) DEFAULT NULL,
    weight_avg DECIMAL(10,2) DEFAULT NULL,
    sexual_dimorphism TEXT DEFAULT NULL,
    -- 4. Aspect visuel
    color VARCHAR(255) DEFAULT NULL,
    texture VARCHAR(255) DEFAULT NULL,
    eye_color VARCHAR(150) DEFAULT NULL,
    -- 5. Anatomie spécifique
    dentition TEXT DEFAULT NULL,
    appendages TEXT DEFAULT NULL,
    cranial_structures TEXT DEFAULT NULL,
    -- 6. Adaptations
    adaptation TEXT DEFAULT NULL,
    sensory_organs TEXT DEFAULT NULL,
    environmental_tolerance TEXT DEFAULT NULL,
    -- 7. Écologie
    lifespan VARCHAR(150) DEFAULT NULL,
    ecological_role TEXT DEFAULT NULL,
    interspecies_competition TEXT DEFAULT NULL,
    migration TEXT DEFAULT NULL,
    seasonal_strategy TEXT DEFAULT NULL,
    circadian_rhythm TEXT DEFAULT NULL,
    -- 8. Santé et microbiologie
    health_status TEXT DEFAULT NULL,
    microbiote TEXT DEFAULT NULL,
    parasite_load TEXT DEFAULT NULL,
    disease_vector TEXT DEFAULT NULL,
    -- 9. Relation avec l'humain
    human_use TEXT DEFAULT NULL,
    cultural_significance TEXT DEFAULT NULL,
    local_community_use TEXT DEFAULT NULL,
    economic_importance TEXT DEFAULT NULL,
    medicinal_importance TEXT DEFAULT NULL,
    -- 10. Importance pour Madagascar
    endemism VARCHAR(255) DEFAULT NULL,
    protected_area TEXT DEFAULT NULL,
    traditional_knowledge TEXT DEFAULT NULL,
    regional_name_variations TEXT DEFAULT NULL,
    -- 11. Menaces
    habitat_loss TEXT DEFAULT NULL,
    poaching TEXT DEFAULT NULL,
    pollution TEXT DEFAULT NULL,
    climate_change TEXT DEFAULT NULL,
    invasive_species TEXT DEFAULT NULL,
    other_threats TEXT DEFAULT NULL,
    -- 12. Conservation
    conservation_measures TEXT DEFAULT NULL,
    protection_actions TEXT DEFAULT NULL,
    conservation_programs TEXT DEFAULT NULL,
    latitude DECIMAL(10,7) DEFAULT NULL,
    longitude DECIMAL(10,7) DEFAULT NULL,
    status ENUM('draft','published') NOT NULL DEFAULT 'published',
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FULLTEXT KEY ft_fauna_search (name, scientific_name, family, habitat)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- FLORA
-- ---------------------------------------------------------
CREATE TABLE flora (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- 1. Identification
    name VARCHAR(150) NOT NULL,
    scientific_name VARCHAR(150) NOT NULL,
    category_id INT DEFAULT NULL,
    vernacular_name VARCHAR(150) DEFAULT NULL,
    family VARCHAR(150) DEFAULT NULL,
    similar_species TEXT DEFAULT NULL,
    -- 2. Général
    description TEXT DEFAULT NULL,
    habitat TEXT DEFAULT NULL,
    region VARCHAR(150) DEFAULT NULL,
    region_id INT DEFAULT NULL,
    conservation_status ENUM('LC','NT','VU','EN','CR','EW','EX','DD') DEFAULT 'DD',
    characteristics TEXT DEFAULT NULL,
    uses TEXT DEFAULT NULL,
    -- 3. Biométrie
    height_min DECIMAL(10,2) DEFAULT NULL,
    height_max DECIMAL(10,2) DEFAULT NULL,
    height_avg DECIMAL(10,2) DEFAULT NULL,
    canopy_diameter DECIMAL(10,2) DEFAULT NULL,
    -- 4. Aspect visuel
    color VARCHAR(255) DEFAULT NULL,
    texture VARCHAR(255) DEFAULT NULL,
    -- 5. Anatomie spécifique
    leaf_type TEXT DEFAULT NULL,
    root_type TEXT DEFAULT NULL,
    flower_type TEXT DEFAULT NULL,
    -- 6. Adaptations
    adaptation TEXT DEFAULT NULL,
    environmental_tolerance TEXT DEFAULT NULL,
    -- 7. Écologie
    lifespan VARCHAR(150) DEFAULT NULL,
    ecological_role TEXT DEFAULT NULL,
    interspecies_competition TEXT DEFAULT NULL,
    seasonal_strategy TEXT DEFAULT NULL,
    flowering_season VARCHAR(150) DEFAULT NULL,
    fruiting_season VARCHAR(150) DEFAULT NULL,
    pollinators TEXT DEFAULT NULL,
    soil_type TEXT DEFAULT NULL,
    growth_rate VARCHAR(150) DEFAULT NULL,
    maturity_age VARCHAR(150) DEFAULT NULL,
    -- 8. Santé et microbiologie
    health_status TEXT DEFAULT NULL,
    microbiote TEXT DEFAULT NULL,
    parasite_load TEXT DEFAULT NULL,
    -- 9. Relation avec l'humain
    human_use TEXT DEFAULT NULL,
    cultural_significance TEXT DEFAULT NULL,
    local_community_use TEXT DEFAULT NULL,
    economic_importance TEXT DEFAULT NULL,
    medicinal_importance TEXT DEFAULT NULL,
    edibility VARCHAR(150) DEFAULT NULL,
    edible_parts TEXT DEFAULT NULL,
    toxic_parts TEXT DEFAULT NULL,
    traditional_medicinal_uses TEXT DEFAULT NULL,
    food_uses TEXT DEFAULT NULL,
    craft_uses TEXT DEFAULT NULL,
    -- 10. Importance pour Madagascar
    endemism VARCHAR(255) DEFAULT NULL,
    protected_area TEXT DEFAULT NULL,
    traditional_knowledge TEXT DEFAULT NULL,
    regional_name_variations TEXT DEFAULT NULL,
    -- 11. Menaces
    habitat_loss TEXT DEFAULT NULL,
    overharvesting TEXT DEFAULT NULL,
    pollution TEXT DEFAULT NULL,
    climate_change TEXT DEFAULT NULL,
    invasive_species TEXT DEFAULT NULL,
    other_threats TEXT DEFAULT NULL,
    -- 12. Conservation
    conservation_measures TEXT DEFAULT NULL,
    protection_actions TEXT DEFAULT NULL,
    conservation_programs TEXT DEFAULT NULL,
    status ENUM('draft','published') NOT NULL DEFAULT 'published',
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FULLTEXT KEY ft_flora_search (name, scientific_name, family, habitat)
) ENGINE=InnoDB;

-- Item : une plante peut aussi être présente dans plusieurs régions (multi-sélection
-- manuelle, indépendante de la localisation GPS — une région choisie en liste déroulante,
-- pas déduite automatiquement d'un point cliqué sur la carte).
CREATE TABLE flora_regions (
    flora_id INT NOT NULL,
    region_id INT NOT NULL,
    PRIMARY KEY (flora_id, region_id),
    FOREIGN KEY (flora_id) REFERENCES flora(id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Item : idem pour la Faune — région(s) en liste déroulante manuelle, complètement
-- indépendante des points GPS (fauna_locations ci-dessous).
CREATE TABLE fauna_regions (
    fauna_id INT NOT NULL,
    region_id INT NOT NULL,
    PRIMARY KEY (fauna_id, region_id),
    FOREIGN KEY (fauna_id) REFERENCES fauna(id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Item : une espèce Faune peut avoir plusieurs points de localisation GPS (un ou
-- plusieurs, remplissables à la main ou en cliquant sur la carte).
CREATE TABLE fauna_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fauna_id INT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fauna_id) REFERENCES fauna(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Item : la Flore fonctionne désormais à l'identique de la Faune pour le GPS —
-- un ou plusieurs points de localisation, séparés de la sélection de régions.
CREATE TABLE flora_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flora_id INT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flora_id) REFERENCES flora(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- SPECIES IMAGES (fauna + flora, images multiples)
-- ---------------------------------------------------------
CREATE TABLE species_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    species_type ENUM('fauna','flora') NOT NULL,
    species_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    thumbnail_path VARCHAR(255) NOT NULL,
    is_primary TINYINT(1) NOT NULL DEFAULT 0,
    alt_text VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_species (species_type, species_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- OBSERVATIONS (Faune uniquement, avec coordonnées)
-- ---------------------------------------------------------
CREATE TABLE observations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fauna_id INT NOT NULL,
    user_id INT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    description TEXT DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    observation_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fauna_id) REFERENCES fauna(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- BLOG
-- ---------------------------------------------------------
CREATE TABLE blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    excerpt VARCHAR(500) DEFAULT NULL,
    content LONGTEXT NOT NULL,
    author_id INT DEFAULT NULL,
    status ENUM('draft','published') NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at DATETIME DEFAULT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    FULLTEXT KEY ft_blog_search (title, excerpt)
) ENGINE=InnoDB;

-- Images multiples pour un article (image principale + galerie)
CREATE TABLE blog_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blog_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    thumbnail_path VARCHAR(255) NOT NULL,
    is_primary TINYINT(1) NOT NULL DEFAULT 0,
    alt_text VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- CONTACT MESSAGES
-- ---------------------------------------------------------
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) DEFAULT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Seed : premier compte SuperAdmin (rôle le plus élevé, jamais supprimable)
--   email    : superadmin@biodiversite-mada.mg / pseudo : superadmin
--   password : SuperAdmin@1234   (à changer dès la première connexion !)
-- ---------------------------------------------------------
-- Seed : premier compte SuperAdmin
--   email    : superadmin@biodiversite-mada.mg / pseudo : superadmin
--   password : SuperAdmin@1234   (à changer dès la première connexion !)
-- Hash réel généré avec password_hash('SuperAdmin@1234', PASSWORD_DEFAULT)
INSERT INTO users (name, username, email, phone, password_hash, role, status)
VALUES ('Super Administrateur', 'superadmin', 'superadmin@biodiversite-mada.mg', NULL,
'$2b$10$8m72oABiXPUaS/FWkl3y/OoW4si7PnMAPENhazpl9Qtu9ok7FHmL2', 'superadmin', 'active');

-- Seed : premier compte admin
--   email    : admin@biodiversite-mada.mg / pseudo : admin
--   password : Admin@1234   (à changer dès la première connexion !)
-- Hash réel généré avec password_hash('Admin@1234', PASSWORD_DEFAULT)
-- ---------------------------------------------------------
INSERT INTO users (name, username, email, phone, password_hash, role, status)
VALUES ('Administrateur', 'admin', 'admin@biodiversite-mada.mg', NULL,
'$2y$10$wOGN.Vv67S/.qKoj1I7dnOh6sNOY561lfzsrPbkDK05WfAwKhxbvS', 'admin', 'active');

-- Seed : premier compte Membre de démonstration (déjà actif, statut "active" directement
-- — contrairement à un vrai membre qui doit attendre l'approbation de l'Admin)
--   email    : membre@biodiversite-mada.mg / pseudo : membre
--   password : Membre@1234   (à changer dès la première connexion !)
INSERT INTO users (name, username, email, phone, password_hash, role, status)
VALUES ('Membre Démonstration', 'membre', 'membre@biodiversite-mada.mg', NULL,
'$2y$10$r58YkqJzEYG5avp9WyWBHutHhkjUYHZORUT3xKLnQKh1diV7a1m1a', 'member', 'active');

-- Catégories de base
INSERT INTO categories (name, slug, type, description) VALUES
('Lémuriens', 'lemuriens', 'fauna', 'Primates endémiques de Madagascar'),
('Reptiles', 'reptiles', 'fauna', 'Caméléons, geckos, serpents'),
('Oiseaux', 'oiseaux', 'fauna', 'Avifaune malgache'),
('Amphibiens', 'amphibiens', 'fauna', 'Grenouilles endémiques'),
('Baobabs', 'baobabs', 'flora', 'Arbres emblématiques de Madagascar'),
('Orchidées', 'orchidees', 'flora', 'Flore orchidacée endémique'),
('Plantes médicinales', 'plantes-medicinales', 'flora', 'Usages traditionnels');

-- Les 22 régions de Madagascar (identifiants alignés sur regions.geojson —
-- voir frontend/public/data/regions.geojson, polygones approximatifs à affiner).
INSERT INTO regions (name, geojson_id) VALUES
('Analamanga', 'analamanga'), ('Atsinanana', 'atsinanana'), ('Boeny', 'boeny'),
('Anosy', 'anosy'), ('Menabe', 'menabe'), ('Vakinankaratra', 'vakinankaratra'),
('Itasy', 'itasy'), ('Bongolava', 'bongolava'), ('Sofia', 'sofia'),
('Betsiboka', 'betsiboka'), ('Melaky', 'melaky'), ('Alaotra-Mangoro', 'alaotra-mangoro'),
('Analanjirofo', 'analanjirofo'), ('Atsimo-Atsinanana', 'atsimo-atsinanana'),
('Ihorombe', 'ihorombe'), ('Atsimo-Andrefana', 'atsimo-andrefana'), ('Androy', 'androy'),
('Vatovavy', 'vatovavy'), ('Fitovinany', 'fitovinany'), ('Amoron''i Mania', 'amoroni-mania'),
('Haute Matsiatra', 'haute-matsiatra'), ('Diana', 'diana'), ('Sava', 'sava');

-- =========================================================
-- DONNÉES DE DÉMONSTRATION — 3 espèces Faune, 3 espèces Flore
-- (avec photos, régions et localisation GPS) + 3 articles de
-- blog publiés, pour tester l'affichage sans tout ressaisir.
-- =========================================================
-- ===== Données de démonstration : 3 espèces Faune + 3 espèces Flore =====

-- Deux catégories supplémentaires nécessaires pour ces espèces de démonstration
INSERT INTO categories (name, slug, type, description) VALUES
('Mammifères', 'mammiferes', 'fauna', 'Mammifères endémiques hors lémuriens (carnivores, tenrecs...)'),
('Plantes emblématiques', 'plantes-emblematiques', 'flora', 'Arbres et plantes iconiques de Madagascar');

-- Faune
INSERT INTO fauna (name, scientific_name, category_id, vernacular_name, family, similar_species, description, habitat, region, conservation_status, diet, reproduction, behavior, size_min, size_max, size_avg, wingspan, weight_min, weight_max, weight_avg, sexual_dimorphism, color, texture, eye_color, dentition, appendages, cranial_structures, adaptation, sensory_organs, environmental_tolerance, lifespan, ecological_role, interspecies_competition, migration, seasonal_strategy, circadian_rhythm, health_status, microbiote, parasite_load, disease_vector, human_use, cultural_significance, local_community_use, economic_importance, medicinal_importance, endemism, protected_area, traditional_knowledge, regional_name_variations, habitat_loss, poaching, pollution, climate_change, invasive_species, other_threats, conservation_measures, protection_actions, conservation_programs, status, created_by) VALUES ('Fossa', 'Cryptoprocta ferox', 8, 'Fosa', 'Eupleridae', 'Souvent confondu avec un petit puma ou un chat sauvage, mais plus proche génétiquement de la mangouste.', 'Le plus grand carnivore de Madagascar. Corps allongé, pelage roux uniforme, longue queue musclée servant de balancier dans les arbres.', 'Forêts denses, humides comme sèches', 'Menabe, Atsimo-Andrefana', 'VU', 'Carnivore : lémuriens, tenrecs, oiseaux, reptiles', 'Une portée de 2 à 4 petits tous les 1 à 2 ans, gestation d\'environ 3 mois', 'Solitaire, principalement diurne, excellent grimpeur et sauteur', 65, 80, 72, NULL, 5.5, 8.6, 7, 'Le mâle est nettement plus grand et plus lourd que la femelle', 'Roux uniforme', 'Pelage court et dense', 'Brun doré', 'Carnassières développées, morsure puissante adaptée à la prédation', 'Griffes semi-rétractiles, chevilles très mobiles pour descendre les arbres tête la première', 'Crâne court et large, mâchoire puissante', 'Chevilles pivotantes permettant une descente des arbres tête la première, unique chez les carnivores', 'Odorat et vision nocturne très développés', 'Tolère aussi bien les forêts humides de l\'est que les forêts sèches de l\'ouest', '15 à 20 ans', 'Superprédateur, régule les populations de lémuriens', 'Peu de concurrents directs, sommet de la chaîne alimentaire locale', 'Pas de migration, mais de vastes domaines vitaux', 'Reproduction concentrée en septembre-octobre', 'Actif principalement le jour, parfois crépusculaire', 'Populations sauvages globalement en bonne santé mais fragmentées', 'Peu documenté scientifiquement à ce jour', 'Tiques et parasites intestinaux courants', 'Peut transmettre la rage aux animaux domestiques dans certaines zones', 'Aucun usage direct, mais perçu comme une menace pour la volaille', 'Associé à des croyances et tabous (fady) dans plusieurs régions', 'Parfois chassé en représailles après une attaque de volaille', 'Attraction touristique majeure dans les parcs comme Kirindy', 'Aucune connue', 'Espèce endémique de Madagascar, seule représentante de son genre', 'Parc national de Kirindy, Ankarafantsika', 'Considéré comme un animal redoutable dans le folklore malgache', 'Fosa, Fosa be', 'Déforestation continue de son habitat forestier', 'Chassé en représailles pour la prédation du bétail', 'Impact limité mais non documenté', 'Réduction potentielle des zones forestières favorables', 'Concurrence avec les chiens et chats errants', 'Fragmentation des habitats forestiers', 'Programmes de suivi par caméras-pièges dans les aires protégées', 'Sensibilisation des communautés locales pour réduire les représailles', 'Suivi scientifique à Kirindy depuis les années 1990', 'published', 3);
INSERT INTO fauna (name, scientific_name, category_id, vernacular_name, family, similar_species, description, habitat, region, conservation_status, diet, reproduction, behavior, size_min, size_max, size_avg, wingspan, weight_min, weight_max, weight_avg, sexual_dimorphism, color, texture, eye_color, dentition, appendages, cranial_structures, adaptation, sensory_organs, environmental_tolerance, lifespan, ecological_role, interspecies_competition, migration, seasonal_strategy, circadian_rhythm, health_status, microbiote, parasite_load, disease_vector, human_use, cultural_significance, local_community_use, economic_importance, medicinal_importance, endemism, protected_area, traditional_knowledge, regional_name_variations, habitat_loss, poaching, pollution, climate_change, invasive_species, other_threats, conservation_measures, protection_actions, conservation_programs, status, created_by) VALUES ('Caméléon panthère', 'Furcifer pardalis', 2, 'Sahatoly', 'Chamaeleonidae', 'Se distingue des autres Furcifer par ses couleurs très variables selon la région d\'origine', 'L\'un des caméléons les plus colorés au monde. Les mâles affichent des couleurs vives (rouge, vert, bleu, orange) qui varient selon la localité.', 'Forêts littorales et zones de végétation dégradée du nord et de l\'est', 'Diana, Sava, Analanjirofo', 'LC', 'Insectivore : sauterelles, grillons, papillons', 'Ponte de 15 à 40 œufs, incubation de 6 à 8 mois', 'Solitaire et territorial, change de couleur selon son humeur et la température', 17, 52, 35, NULL, 80, 220, 150, 'Les mâles sont plus grands et bien plus colorés que les femelles', 'Variable : rouge, vert, bleu, orange selon la population', 'Peau granuleuse', 'Jaune-orangé, yeux mobiles indépendamment', 'Petites dents acrodontes adaptées aux insectes', 'Pattes en pince (zygodactyles), queue préhensile', 'Casque crânien discret, absence de longues cornes contrairement à d\'autres espèces', 'Capacité de changement de couleur par cellules chromatophores pour la communication et la thermorégulation', 'Yeux capables de vision à 360°, chacun bougeant indépendamment', 'Apprécie une forte humidité et des températures chaudes stables', '2 à 3 ans pour les mâles, un peu plus pour les femelles', 'Régulateur de populations d\'insectes', 'Territorial envers les autres mâles de son espèce', NULL, 'Reproduction favorisée en saison des pluies', 'Strictement diurne', 'Sensible au stress, change de couleur en cas de maladie ou de peur', 'Peu documenté', 'Acariens et parasites internes possibles', NULL, 'Très recherché dans le commerce des animaux de compagnie (élevage encadré par quotas)', 'Symbole emblématique de Madagascar à l\'international', 'Source de revenus via l\'élevage encadré pour l\'export', 'Espèce phare du tourisme animalier et de la filière d\'élevage réglementée', 'Aucune connue', 'Endémique de Madagascar', 'Réserve de Nosy Komba, Ankarana', 'Certaines ethnies évitent de le toucher par superstition', 'Sahatoly, Tanalahy', 'Dégradation des forêts littorales du nord-est', NULL, 'Usage de pesticides agricoles à proximité de son habitat', 'Sensibilité aux variations de température et d\'humidité', NULL, 'Prélèvements excessifs pour le commerce international', 'Quotas d\'exportation encadrés par la CITES', 'Programmes d\'élevage en captivité pour réduire la pression sur les populations sauvages', 'Suivi des populations sauvages dans les réserves du nord', 'published', 3);
INSERT INTO fauna (name, scientific_name, category_id, vernacular_name, family, similar_species, description, habitat, region, conservation_status, diet, reproduction, behavior, size_min, size_max, size_avg, wingspan, weight_min, weight_max, weight_avg, sexual_dimorphism, color, texture, eye_color, dentition, appendages, cranial_structures, adaptation, sensory_organs, environmental_tolerance, lifespan, ecological_role, interspecies_competition, migration, seasonal_strategy, circadian_rhythm, health_status, microbiote, parasite_load, disease_vector, human_use, cultural_significance, local_community_use, economic_importance, medicinal_importance, endemism, protected_area, traditional_knowledge, regional_name_variations, habitat_loss, poaching, pollution, climate_change, invasive_species, other_threats, conservation_measures, protection_actions, conservation_programs, status, created_by) VALUES ('Tenrec strié', 'Hemicentetes semispinosus', 8, 'Sokina', 'Tenrecidae', 'Ressemble à un hérisson mais appartient à une famille totalement différente, propre à Madagascar', 'Petit mammifère insectivore couvert de piquants noirs et jaunes, capable de produire des sons en frottant ses piquants (stridulation).', 'Forêts humides de l\'est', 'Atsinanana, Analanjirofo', 'LC', 'Insectivore : vers de terre principalement', 'Portées parmi les plus nombreuses des mammifères : jusqu\'à 32 petits', 'Actif principalement la nuit, vit en petits groupes familiaux', 14, 17, 15.5, NULL, 80, 130, 100, 'Peu marqué', 'Noir et jaune rayé', 'Piquants durs sur le dos', 'Noir', 'Dentition simple adaptée à une alimentation d\'invertébrés', 'Museau allongé et mobile, pattes griffues fouisseuses', 'Absence d\'ornements crâniens', 'Piquants spécialisés au niveau du dos utilisés pour la stridulation, une communication unique chez les mammifères', 'Odorat et toucher très développés via le museau mobile', 'Dépend fortement d\'un sol humide riche en vers de terre', '2 à 3 ans', 'Régule les populations d\'invertébrés du sol', 'Faible, niche écologique spécialisée', NULL, 'Peut entrer en torpeur lors des périodes les plus froides', 'Nocturne', 'Populations locales globalement stables', NULL, 'Puces et parasites externes courants', NULL, 'Parfois consommé localement dans certaines régions', 'Peu de significations culturelles particulières recensées', 'Chasse de subsistance occasionnelle', 'Marginale', 'Aucune connue', 'Endémique de Madagascar', 'Parc national de Ranomafana, Masoala', NULL, 'Sokina, Sora', 'Déforestation de la forêt humide de l\'est', NULL, NULL, 'Sensible à l\'assèchement des sols forestiers', NULL, NULL, 'Préservation de la forêt humide de l\'est via les parcs nationaux', NULL, 'Suivi dans le cadre des inventaires de Ranomafana', 'published', 3);

-- Flore
INSERT INTO flora (name, scientific_name, category_id, vernacular_name, family, similar_species, description, habitat, region, region_id, conservation_status, characteristics, uses, height_min, height_max, height_avg, canopy_diameter, color, texture, leaf_type, root_type, flower_type, adaptation, environmental_tolerance, lifespan, ecological_role, interspecies_competition, seasonal_strategy, flowering_season, fruiting_season, pollinators, soil_type, growth_rate, maturity_age, health_status, microbiote, parasite_load, human_use, cultural_significance, local_community_use, economic_importance, medicinal_importance, edibility, edible_parts, toxic_parts, traditional_medicinal_uses, food_uses, craft_uses, endemism, protected_area, traditional_knowledge, regional_name_variations, habitat_loss, overharvesting, pollution, climate_change, invasive_species, other_threats, conservation_measures, protection_actions, conservation_programs, status, created_by) VALUES ('Arbre du voyageur', 'Ravenala madagascariensis', 9, 'Ravinala', 'Strelitziaceae', 'Souvent confondu avec un palmier ou un bananier, bien que non apparenté aux deux', 'Grand arbre emblématique dont les feuilles disposées en éventail s\'alignent selon un axe est-ouest, servant traditionnellement de boussole naturelle.', 'Forêts littorales et lisières de forêts humides de l\'est', 'Atsinanana, Analanjirofo, Vatovavy', NULL, 'LC', 'Feuillage disposé en éventail pouvant atteindre 10 mètres d\'envergure, tronc fibreux gorgé d\'eau', 'Toiture traditionnelle, gouttières naturelles, eau potable de secours stockée dans les pétioles', 10, 30, 18, 8, 'Vert profond, base des pétioles parfois bleutée', 'Feuilles lisses, tronc fibreux', 'Grandes feuilles en éventail, semblables à celles du bananier', 'Système racinaire superficiel mais étendu', 'Petites fleurs blanches groupées en inflorescences, pollinisées par les lémuriens', 'Stocke l\'eau de pluie à la base de ses pétioles, ressource vitale en cas de sécheresse', 'Tolère les sols pauvres et les embruns littoraux', 'Plusieurs décennies', 'Source d\'eau et de nectar pour la faune locale, notamment les lémuriens', 'Colonise rapidement les zones dégradées, parfois au détriment d\'autres espèces', 'Floraison toute l\'année selon les conditions locales', 'Variable selon la région', 'Suit la floraison de quelques mois', 'Lémuriens (notamment le maki à queue rousse) et certains oiseaux', 'Sols littoraux sableux à humides', 'Modérée à rapide', '5 à 8 ans avant la première floraison', 'Généralement robuste, sensible aux cyclones', NULL, 'Peu de ravageurs spécifiques connus', 'Toiture, vannerie, réserve d\'eau d\'urgence pour les voyageurs', 'Emblème national de Madagascar, présent sur le logo d\'Air Madagascar', 'Matériau de construction traditionnel très répandu', 'Utilisé dans l\'artisanat et la construction rurale', 'Sève parfois utilisée en médecine traditionnelle contre la déshydratation', 'Non comestible', NULL, 'Aucune toxicité notable connue', 'Eau des pétioles utilisée en cas de déshydratation en brousse', NULL, 'Feuilles tressées pour toitures et paniers', 'Endémique de Madagascar', 'Présent dans la plupart des réserves de l\'est', 'Utilisé traditionnellement pour s\'orienter (alignement est-ouest des feuilles)', 'Ravinala, Arbre du voyageur', 'Recul des forêts littorales au profit de l\'agriculture', 'Récolte intensive des feuilles pour la construction', NULL, 'Vulnérable aux cyclones plus fréquents', NULL, NULL, 'Plantations ornementales et de reboisement dans plusieurs régions', NULL, 'Intégré aux programmes de reboisement côtier', 'published', 3);
INSERT INTO flora (name, scientific_name, category_id, vernacular_name, family, similar_species, description, habitat, region, region_id, conservation_status, characteristics, uses, height_min, height_max, height_avg, canopy_diameter, color, texture, leaf_type, root_type, flower_type, adaptation, environmental_tolerance, lifespan, ecological_role, interspecies_competition, seasonal_strategy, flowering_season, fruiting_season, pollinators, soil_type, growth_rate, maturity_age, health_status, microbiote, parasite_load, human_use, cultural_significance, local_community_use, economic_importance, medicinal_importance, edibility, edible_parts, toxic_parts, traditional_medicinal_uses, food_uses, craft_uses, endemism, protected_area, traditional_knowledge, regional_name_variations, habitat_loss, overharvesting, pollution, climate_change, invasive_species, other_threats, conservation_measures, protection_actions, conservation_programs, status, created_by) VALUES ('Pachypodium', 'Pachypodium lamerei', 9, 'Vontaka', 'Apocynaceae', 'Parfois confondu avec un petit baobab en raison de son tronc renflé, bien que non apparenté', 'Plante succulente au tronc épineux renflé surmonté d\'une couronne de feuilles, adaptée aux milieux arides du sud-ouest.', 'Fourré épineux et forêt sèche du sud-ouest', 'Atsimo-Andrefana, Androy, Menabe', NULL, 'NT', 'Tronc bulbeux couvert d\'épines, couronne de feuilles au sommet', 'Plante ornementale très prisée à l\'international', 1, 6, 3, 1.5, 'Tronc gris-vert, fleurs blanches', 'Écorce épineuse et succulente', 'Feuilles longues et étroites regroupées au sommet du tronc', 'Racines peu profondes adaptées aux sols secs', 'Fleurs blanches en étoile, parfumées', 'Tronc gonflé capable de stocker l\'eau pendant les longues saisons sèches', 'Excellente tolérance à la sécheresse prolongée', 'Plusieurs décennies', 'Ressource en eau pour certains insectes et petits animaux', 'Faible, adapté à des milieux où peu d\'espèces survivent', 'Perd ses feuilles en saison sèche pour limiter la perte en eau', 'Saison chaude (octobre à décembre)', 'Quelques mois après la floraison', 'Papillons de nuit (sphinx) principalement', 'Sols sableux et rocailleux bien drainés', 'Lente', '8 à 10 ans avant floraison', 'Robuste en milieu naturel', NULL, 'Cochenilles parfois observées', 'Très recherché comme plante ornementale d\'intérieur et de jardin', 'Symbole de résistance dans les régions arides du sud', 'Vente de jeunes plants comme complément de revenu', 'Filière d\'exportation horticole importante', 'Usages traditionnels limités et peu documentés', 'Non comestible', NULL, 'Sève potentiellement irritante', NULL, NULL, NULL, 'Endémique de Madagascar', 'Réserve de Zombitse, Parc national de l\'Isalo', 'Considéré comme un indicateur de milieu aride préservé', 'Vontaka, Vontake', 'Défrichement du fourré épineux pour l\'agriculture sur brûlis', 'Prélèvements sauvages pour le commerce ornemental', NULL, 'Sécheresses plus intenses pouvant affecter la régénération', NULL, NULL, 'Réglementation du commerce international (CITES)', 'Pépinières locales encadrées pour réduire la collecte sauvage', 'Programmes de propagation dans les réserves du sud-ouest', 'published', 3);
INSERT INTO flora (name, scientific_name, category_id, vernacular_name, family, similar_species, description, habitat, region, region_id, conservation_status, characteristics, uses, height_min, height_max, height_avg, canopy_diameter, color, texture, leaf_type, root_type, flower_type, adaptation, environmental_tolerance, lifespan, ecological_role, interspecies_competition, seasonal_strategy, flowering_season, fruiting_season, pollinators, soil_type, growth_rate, maturity_age, health_status, microbiote, parasite_load, human_use, cultural_significance, local_community_use, economic_importance, medicinal_importance, edibility, edible_parts, toxic_parts, traditional_medicinal_uses, food_uses, craft_uses, endemism, protected_area, traditional_knowledge, regional_name_variations, habitat_loss, overharvesting, pollution, climate_change, invasive_species, other_threats, conservation_measures, protection_actions, conservation_programs, status, created_by) VALUES ('Vanille de Madagascar', 'Vanilla planifolia', 6, 'Lavanily', 'Orchidaceae', 'Distincte des autres orchidées par son port de liane grimpante et ses gousses parfumées', 'Orchidée grimpante liane produisant les gousses de vanille les plus réputées au monde, cultivée principalement dans la région SAVA.', 'Cultivée sous couvert forestier ou en agroforesterie', 'Sava, Analanjirofo', NULL, 'DD', 'Liane grimpante à tige charnue s\'accrochant aux arbres tuteurs', 'Épice de renommée mondiale, arôme naturel en parfumerie', 3, 15, 8, NULL, 'Vert, fleurs jaune pâle', 'Tige charnue et succulente', 'Feuilles charnues, ovales et alternes', 'Racines aériennes s\'accrochant au tuteur', 'Fleurs jaune-vert, éphémères, ne durant qu\'une journée', 'Pollinisation manuelle nécessaire hors de son aire d\'origine (Mexique), pratiquée à la main à Madagascar', 'Nécessite ombre partielle et forte humidité', 'Productive pendant environ 12 à 15 ans', 'Culture de sous-bois favorisant le maintien du couvert forestier', 'Dépend d\'un arbre tuteur, sans compétition directe forte', 'Floraison saisonnière suivie d\'une longue maturation des gousses (8-9 mois)', 'Septembre à novembre', 'Gousses récoltées 8 à 9 mois après pollinisation', 'Pollinisation manuelle par l\'humain à Madagascar (absence du pollinisateur naturel mexicain)', 'Sol forestier riche en matière organique', 'Modérée', '3 ans avant la première production', 'Sensible à la fusariose, maladie fongique majeure de la vanille', 'Associée à des champignons mycorhiziens bénéfiques', 'Vulnérable à certains vers et pucerons', 'Deuxième épice la plus chère au monde après le safran', 'Pilier économique et identitaire de la région SAVA', 'Principale source de revenus pour des dizaines de milliers de familles', 'Madagascar produit environ 80% de la vanille mondiale', 'Utilisée en aromathérapie pour ses vertus apaisantes', 'Comestible (épice)', 'Gousses fermentées et séchées', 'Aucune partie toxique connue', 'Utilisée traditionnellement pour apaiser les troubles digestifs légers', 'Aromatisation de plats sucrés, pâtisserie, boissons', NULL, 'Introduite à Madagascar au XIXe siècle, aujourd\'hui emblématique du pays', NULL, 'Techniques de pollinisation manuelle transmises de génération en génération depuis Edmond Albius', 'Lavanily', 'Pression sur les forêts pour l\'extension des cultures', 'Vols de gousses avant maturité, un problème récurrent dans la filière', 'Usage limité de produits phytosanitaires dans certaines exploitations', 'Cyclones et variations climatiques affectant fortement les récoltes annuelles', NULL, 'Fluctuations extrêmes des cours mondiaux fragilisant les producteurs', 'Certification biologique et équitable croissante dans la filière', 'Coopératives de producteurs pour sécuriser les récoltes', 'Programmes de soutien agroforestier dans la région SAVA', 'published', 3);

-- Photos (1 principale + 2 en galerie) pour chaque espèce de démonstration
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('fauna', 1, 'uploads/fauna/large/18bbbd84adaa6a40eaec24d84468b715.jpg', 'uploads/fauna/thumb/18bbbd84adaa6a40eaec24d84468b715.jpg', 1, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('fauna', 1, 'uploads/fauna/large/fff21a113c0658734a3d40273b8feb9e.jpg', 'uploads/fauna/thumb/fff21a113c0658734a3d40273b8feb9e.jpg', 0, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('fauna', 1, 'uploads/fauna/large/2c8e4a6e1444f87e01754c74b191f1a2.jpg', 'uploads/fauna/thumb/2c8e4a6e1444f87e01754c74b191f1a2.jpg', 0, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('fauna', 2, 'uploads/fauna/large/27d6ffdfd11bded1801519646802d58e.jpg', 'uploads/fauna/thumb/27d6ffdfd11bded1801519646802d58e.jpg', 1, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('fauna', 2, 'uploads/fauna/large/a90fe878982d2e38d08c115bb942fc5d.jpg', 'uploads/fauna/thumb/a90fe878982d2e38d08c115bb942fc5d.jpg', 0, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('fauna', 2, 'uploads/fauna/large/c559ec3d76498fd82e7b8258d66c294e.jpg', 'uploads/fauna/thumb/c559ec3d76498fd82e7b8258d66c294e.jpg', 0, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('fauna', 3, 'uploads/fauna/large/45c41c85e9169d86df8dee0062590bef.jpg', 'uploads/fauna/thumb/45c41c85e9169d86df8dee0062590bef.jpg', 1, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('fauna', 3, 'uploads/fauna/large/4b18b9dbfb7d0a94e15f6b5788d2ec7d.jpg', 'uploads/fauna/thumb/4b18b9dbfb7d0a94e15f6b5788d2ec7d.jpg', 0, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('fauna', 3, 'uploads/fauna/large/fa465332687e79a5408e07d2f609d516.jpg', 'uploads/fauna/thumb/fa465332687e79a5408e07d2f609d516.jpg', 0, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('flora', 1, 'uploads/flora/large/5ead62cecfcc260a2df55f65513c9ecf.jpg', 'uploads/flora/thumb/5ead62cecfcc260a2df55f65513c9ecf.jpg', 1, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('flora', 1, 'uploads/flora/large/729e9ba8f41e3bf42f5955881197cd8d.jpg', 'uploads/flora/thumb/729e9ba8f41e3bf42f5955881197cd8d.jpg', 0, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('flora', 1, 'uploads/flora/large/ca5da4e35eb2f72170988f9686b34236.jpg', 'uploads/flora/thumb/ca5da4e35eb2f72170988f9686b34236.jpg', 0, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('flora', 2, 'uploads/flora/large/d4d23cdeff16a33539087309deff0cf1.jpg', 'uploads/flora/thumb/d4d23cdeff16a33539087309deff0cf1.jpg', 1, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('flora', 2, 'uploads/flora/large/5d5fab9e1fbc1d42a7bbe0af4c03bf6f.jpg', 'uploads/flora/thumb/5d5fab9e1fbc1d42a7bbe0af4c03bf6f.jpg', 0, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('flora', 2, 'uploads/flora/large/101a2b0c5b04343ccef1c2d3c71292c4.jpg', 'uploads/flora/thumb/101a2b0c5b04343ccef1c2d3c71292c4.jpg', 0, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('flora', 3, 'uploads/flora/large/705fc13b439abf0a81a1c0f2fc41aec0.jpg', 'uploads/flora/thumb/705fc13b439abf0a81a1c0f2fc41aec0.jpg', 1, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('flora', 3, 'uploads/flora/large/098d3723c057de3974e70e7cef380228.jpg', 'uploads/flora/thumb/098d3723c057de3974e70e7cef380228.jpg', 0, 'Photo de démonstration');
INSERT INTO species_images (species_type, species_id, image_path, thumbnail_path, is_primary, alt_text) VALUES ('flora', 3, 'uploads/flora/large/5d65b10265f607625abdc749f6a53ee9.jpg', 'uploads/flora/thumb/5d65b10265f607625abdc749f6a53ee9.jpg', 0, 'Photo de démonstration');

-- Régions de présence des espèces de démonstration
INSERT INTO fauna_regions (fauna_id, region_id) VALUES (1, 5);
INSERT INTO fauna_regions (fauna_id, region_id) VALUES (1, 16);
INSERT INTO fauna_regions (fauna_id, region_id) VALUES (2, 22);
INSERT INTO fauna_regions (fauna_id, region_id) VALUES (2, 23);
INSERT INTO fauna_regions (fauna_id, region_id) VALUES (2, 13);
INSERT INTO fauna_regions (fauna_id, region_id) VALUES (3, 2);
INSERT INTO fauna_regions (fauna_id, region_id) VALUES (3, 13);
INSERT INTO flora_regions (flora_id, region_id) VALUES (1, 2);
INSERT INTO flora_regions (flora_id, region_id) VALUES (1, 13);
INSERT INTO flora_regions (flora_id, region_id) VALUES (1, 18);
INSERT INTO flora_regions (flora_id, region_id) VALUES (2, 16);
INSERT INTO flora_regions (flora_id, region_id) VALUES (2, 17);
INSERT INTO flora_regions (flora_id, region_id) VALUES (2, 5);
INSERT INTO flora_regions (flora_id, region_id) VALUES (3, 23);
INSERT INTO flora_regions (flora_id, region_id) VALUES (3, 13);

-- Localisation GPS ponctuelle (un point par espèce, à titre d'exemple)
INSERT INTO fauna_locations (fauna_id, latitude, longitude) VALUES (1, -20.033, 44.667);
INSERT INTO fauna_locations (fauna_id, latitude, longitude) VALUES (2, -13.35, 50.0);
INSERT INTO fauna_locations (fauna_id, latitude, longitude) VALUES (3, -18.94, 48.42);
INSERT INTO flora_locations (flora_id, latitude, longitude) VALUES (1, -18.94, 48.42);
INSERT INTO flora_locations (flora_id, latitude, longitude) VALUES (2, -22.8, 44.0);
INSERT INTO flora_locations (flora_id, latitude, longitude) VALUES (3, -14.66, 50.0);

-- ===== 3 articles de blog de démonstration, déjà publiés =====

INSERT INTO blogs (title, slug, excerpt, content, author_id, status, published_at) VALUES ('La vanille malgache : de la fleur à l\'épice', 'vanille-malgache-fleur-epice', 'Madagascar produit environ 80% de la vanille mondiale. Retour sur une culture exigeante, entièrement pollinisée à la main.', 'Chaque année, entre septembre et novembre, les lianes de Vanilla planifolia se couvrent de fleurs jaune pâle qui ne s\'ouvrent qu\'une seule journée. Faute de pollinisateur naturel à Madagascar, chaque fleur est pollinisée à la main par les producteurs, geste hérité de la méthode mise au point par Edmond Albius au XIXe siècle.

Huit à neuf mois plus tard, les gousses vertes sont récoltées puis passent par un long processus de préparation - échaudage, étuvage, séchage, affinage - qui peut durer plusieurs mois avant de développer leur arôme caractéristique.

Cette filière fait vivre des dizaines de milliers de familles dans la région SAVA, mais reste fragile : cyclones, vols de gousses avant maturité et fluctuations extrêmes des cours mondiaux pèsent chaque année sur les producteurs.', 3, 'published', NOW());
INSERT INTO blogs (title, slug, excerpt, content, author_id, status, published_at) VALUES ('Portrait du Fossa, le grand prédateur de l\'île', 'portrait-du-fossa', 'Plus grand carnivore de Madagascar, le Fossa reste méconnu malgré son rôle central dans l\'équilibre des forêts.', 'Avec son corps allongé et sa longue queue, le Fossa (Cryptoprocta ferox) est souvent pris pour un petit félin. Il appartient pourtant à une famille bien à lui, les Eupleridae, plus proche des mangoustes que des chats.

Principal prédateur des lémuriens, il joue un rôle essentiel dans la régulation des populations de la forêt malgache. Sa capacité à descendre des arbres tête la première, grâce à des chevilles extrêmement mobiles, est unique parmi les carnivores.

Classé vulnérable, le Fossa souffre surtout de la déforestation et des représailles lorsqu\'il s\'attaque à la volaille des villages riverains des forêts. Des programmes de sensibilisation tentent aujourd\'hui de réduire ces conflits.', 3, 'published', NOW());
INSERT INTO blogs (title, slug, excerpt, content, author_id, status, published_at) VALUES ('Reforestation : restaurer les corridors forestiers', 'reforestation-corridors-forestiers', 'Relier les fragments de forêt entre eux est aujourd\'hui l\'un des enjeux majeurs de la conservation à Madagascar.', 'La déforestation a morcelé une grande partie des forêts naturelles de Madagascar en îlots isolés. Pour de nombreuses espèces, notamment les lémuriens, cet isolement limite les échanges génétiques et fragilise les populations sur le long terme.

Les programmes de reforestation actuels ne se contentent plus de planter des arbres au hasard : ils visent à reconstituer de véritables corridors forestiers reliant les aires protégées entre elles, en s\'appuyant sur des essences locales adaptées à chaque type de sol.

Ces initiatives associent souvent les communautés riveraines, à travers des pépinières villageoises et des systèmes agroforestiers qui permettent de concilier revenus agricoles et restauration du couvert forestier.', 3, 'published', NOW());
INSERT INTO blog_images (blog_id, image_path, thumbnail_path, is_primary) VALUES (1, 'uploads/blogs/large/9b6758970d888a89382089b727f5839c.jpg', 'uploads/blogs/thumb/9b6758970d888a89382089b727f5839c.jpg', 1);
INSERT INTO blog_images (blog_id, image_path, thumbnail_path, is_primary) VALUES (2, 'uploads/blogs/large/5965838af4aec2138fd7cd75a3cde847.jpg', 'uploads/blogs/thumb/5965838af4aec2138fd7cd75a3cde847.jpg', 1);
INSERT INTO blog_images (blog_id, image_path, thumbnail_path, is_primary) VALUES (3, 'uploads/blogs/large/84e2edc9eb916e290e0e72d5ba594baf.jpg', 'uploads/blogs/thumb/84e2edc9eb916e290e0e72d5ba594baf.jpg', 1);
