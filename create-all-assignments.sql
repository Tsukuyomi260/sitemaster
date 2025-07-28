-- Script pour créer tous les devoirs manquants basés sur les cours disponibles

-- 1. Ajouter les devoirs du Semestre 1
INSERT INTO assignments (title, course, description, due_date, points, is_active) VALUES
('Devoir 1 - Psychopédagogie', '01 S1 PSYCHOPEDAGOGIE DE L''ENFANT ET DE L''ADOLESCENT', 'Analyse des concepts de psychopédagogie appliqués à l''enfant et l''adolescent', '2024-12-31 23:59:00+00', 100, true),
('Devoir 2 - Psychologie de l''apprentissage', '02 S1 PSYCHOLOGIE DE L''APPRENTISSAGE', 'Étude des théories de l''apprentissage en contexte éducatif', '2024-12-31 23:59:00+00', 100, true),
('Devoir 3 - Administration des établissements', '03 S1 Administration des etablissements eftp et gpec en eftp', 'Analyse des structures administratives en EFTP', '2024-12-31 23:59:00+00', 100, true),
('Devoir 4 - Textes fondamentaux', '04 S1 Etude des Textes Fondamentaux de l''EFTP', 'Analyse des textes de référence en EFTP', '2024-12-31 23:59:00+00', 100, true),
('Devoir 5 - Géographie de l''EFTP', '05 S1 GEOGRAPHIE DE L''EFTP', 'Étude géographique des établissements EFTP', '2024-12-31 23:59:00+00', 100, true),
('Devoir 6 - Manuels pédagogiques', '06 S1 Analyse, Conception et Réalisation de Manuels Pédagogiques pour l''EFTP', 'Conception de manuels pédagogiques adaptés', '2024-12-31 23:59:00+00', 100, true),
('Devoir 7 - Théorie didactique', '07 S1 Théorie didactique', 'Analyse des théories didactiques', '2024-12-31 23:59:00+00', 100, true),
('Devoir 8 - Fondements didactiques', '08 S1 Fondements de la Didactique des Disciplines de l''EFTP', 'Étude des fondements didactiques', '2024-12-31 23:59:00+00', 100, true),
('Devoir 9 - Anglais technique', '09 S1 Anglais Technique', 'Projet en anglais technique', '2024-12-31 23:59:00+00', 100, true),
('Devoir 10 - Communication scientifique', '10 S1 Communication scientifique en anglais', 'Rédaction scientifique en anglais', '2024-12-31 23:59:00+00', 100, true),
('Devoir 11 - Projet apprenant', '11 S1 Projet apprenant', 'Développement d''un projet d''apprentissage', '2024-12-31 23:59:00+00', 100, true);

-- 2. Ajouter les devoirs du Semestre 2
INSERT INTO assignments (title, course, description, due_date, points, is_active) VALUES
('Devoir 1 - Délinquance juvénile', '01 S2 Délinquance Juvénile', 'Analyse des phénomènes de délinquance juvénile', '2024-12-31 23:59:00+00', 100, true),
('Devoir 2 - Épistémologie', '02 S2 Epistomologie et science de l''education et de la formation', 'Étude épistémologique des sciences de l''éducation', '2024-12-31 23:59:00+00', 100, true),
('Devoir 3 - Gestion de classes formelle', '03 S2 Gestion de classes en situation formelle dans l''EFTP', 'Stratégies de gestion de classe en EFTP', '2024-12-31 23:59:00+00', 100, true),
('Devoir 4 - Gestion de classes professionnelle', '04 S2 Gestion de classes de contexte de formation professionnelle', 'Gestion des classes en formation professionnelle', '2024-12-31 23:59:00+00', 100, true),
('Devoir 5 - Didactique de la matière', '05 S2 Didactique de la matière en EFTP', 'Approches didactiques spécifiques à l''EFTP', '2024-12-31 23:59:00+00', 100, true),
('Devoir 6 - Docimologie', '06 S2 Docimologie', 'Étude des méthodes d''évaluation', '2024-12-31 23:59:00+00', 100, true),
('Devoir 7-8 - Pédagogie et andragogie', '07 - 08 S2 Pedagogie et Andragogie', 'Comparaison pédagogie et andragogie', '2024-12-31 23:59:00+00', 100, true),
('Devoir 9 - Sociologie de l''éducation', '09 S2 Sociologie de l''Education et Réalité de l''EFTP', 'Analyse sociologique de l''EFTP', '2024-12-31 23:59:00+00', 100, true),
('Devoir 10 - Besoins spécifiques', '10 S2 Education des apprenants à besoin spécifiques', 'Adaptation pédagogique pour besoins spécifiques', '2024-12-31 23:59:00+00', 100, true),
('Devoir 11 - Éthique et déontologie', '11 S2 Ethique et déontologie de la profession enseignante', 'Réflexion sur l''éthique enseignante', '2024-12-31 23:59:00+00', 100, true),
('Devoir 12 - Formation en entreprise', '12 S2 Enseignement et formation en entreprise', 'Stratégies de formation en milieu professionnel', '2024-12-31 23:59:00+00', 100, true);

-- 3. Ajouter les devoirs du Semestre 3
INSERT INTO assignments (title, course, description, due_date, points, is_active) VALUES
('Devoir 1 - Collaboration interdisciplinaire', '01 S3 Collaboration interdisciplinaire dans l''EFTP', 'Projet de collaboration interdisciplinaire', '2024-12-31 23:59:00+00', 100, true),
('Devoir 2 - Projets transversaux', '02 S3 Projet transverseaux dans l''EFTP', 'Conception de projets transversaux', '2024-12-31 23:59:00+00', 100, true),
('Devoir 3 - Recherche action', '03 S3 Conception et mise en oeuvre de projet de recherche action', 'Projet de recherche-action en EFTP', '2024-12-31 23:59:00+00', 100, true),
('Devoir 4 - Amélioration des pratiques', '04 S3 Amélioration des pratiques pédagogiques dans les etablissements d''EFTP', 'Plan d''amélioration des pratiques', '2024-12-31 23:59:00+00', 100, true),
('Devoir 5 - Appropriation des programmes', '05 S3 Appropriation des programmes d''études', 'Analyse et appropriation des programmes', '2024-12-31 23:59:00+00', 100, true),
('Devoir 6 - Évaluation des programmes', '06 S3 Evaluation des programmes d''etude', 'Méthodologie d''évaluation des programmes', '2024-12-31 23:59:00+00', 100, true),
('Devoir 7-8 - Conception des curricula', '07 - 08 S3 Conception et redaction des curricula dans l''EFTP', 'Conception de curricula EFTP', '2024-12-31 23:59:00+00', 100, true),
('Devoir 9 - TICE et innovation', '09 S3 Tice et innovation pédagogique en EFTP', 'Intégration des TICE en EFTP', '2024-12-31 23:59:00+00', 100, true),
('Devoir 10 - Anglais scientifique', '10 S3 Anglais scientifique', 'Communication scientifique en anglais', '2024-12-31 23:59:00+00', 100, true),
('Devoir 11 - Montage d''événements', '11 S3 Montage d''évènement scientifique et culturels', 'Organisation d''événements scientifiques', '2024-12-31 23:59:00+00', 100, true); 